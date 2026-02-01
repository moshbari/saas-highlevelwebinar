-- Fix migration failure: max(uuid) does not exist. Use array_agg to pick a lead_id.

-- Ensure at most one active session per user per webinar
CREATE UNIQUE INDEX IF NOT EXISTS chat_sessions_active_user_webinar_uniq
ON public.chat_sessions (webinar_id, user_email)
WHERE is_active IS TRUE;

-- Backfill: create sessions for existing messages missing session_id
WITH candidates AS (
  SELECT
    webinar_id,
    user_email,
    (array_agg(NULLIF(user_name, '') ORDER BY sent_at DESC NULLS LAST))[1] AS user_name,
    (array_agg(lead_id ORDER BY sent_at DESC NULLS LAST))[1] AS lead_id,
    max(sent_at) AS last_message_at
  FROM public.chat_messages
  WHERE session_id IS NULL
  GROUP BY webinar_id, user_email
)
INSERT INTO public.chat_sessions (
  webinar_id,
  user_email,
  user_name,
  lead_id,
  mode,
  is_active,
  last_message_at,
  created_at,
  updated_at
)
SELECT
  c.webinar_id,
  c.user_email,
  c.user_name,
  c.lead_id,
  'ai',
  TRUE,
  c.last_message_at,
  now(),
  now()
FROM candidates c
ON CONFLICT (webinar_id, user_email) WHERE is_active IS TRUE DO NOTHING;

-- Backfill: attach session_id to existing messages
UPDATE public.chat_messages m
SET session_id = s.id
FROM public.chat_sessions s
WHERE m.session_id IS NULL
  AND s.is_active IS TRUE
  AND s.webinar_id = m.webinar_id
  AND s.user_email = m.user_email;

-- Trigger function: ensure session exists + attach session_id
CREATE OR REPLACE FUNCTION public.ensure_chat_session_for_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_session_id uuid;
  v_sent_at timestamptz;
BEGIN
  v_sent_at := COALESCE(NEW.sent_at, now());

  IF NEW.session_id IS NOT NULL THEN
    UPDATE public.chat_sessions
    SET last_message_at = v_sent_at,
        updated_at = now(),
        user_name = COALESCE(NULLIF(NEW.user_name, ''), user_name),
        lead_id = COALESCE(NEW.lead_id, lead_id)
    WHERE id = NEW.session_id;

    RETURN NEW;
  END IF;

  SELECT id INTO v_session_id
  FROM public.chat_sessions
  WHERE is_active IS TRUE
    AND webinar_id = NEW.webinar_id
    AND user_email = NEW.user_email
  LIMIT 1;

  IF v_session_id IS NULL THEN
    INSERT INTO public.chat_sessions (
      webinar_id,
      user_email,
      user_name,
      lead_id,
      mode,
      is_active,
      last_message_at,
      created_at,
      updated_at
    )
    VALUES (
      NEW.webinar_id,
      NEW.user_email,
      NULLIF(NEW.user_name, ''),
      NEW.lead_id,
      COALESCE(NEW.response_type, 'ai'),
      TRUE,
      v_sent_at,
      now(),
      now()
    )
    RETURNING id INTO v_session_id;
  ELSE
    UPDATE public.chat_sessions
    SET last_message_at = v_sent_at,
        updated_at = now(),
        user_name = COALESCE(NULLIF(NEW.user_name, ''), user_name),
        lead_id = COALESCE(NEW.lead_id, lead_id)
    WHERE id = v_session_id;
  END IF;

  NEW.session_id := v_session_id;

  IF NEW.session_date IS NULL OR NEW.session_date = '' THEN
    NEW.session_date := to_char(v_sent_at AT TIME ZONE 'UTC', 'YYYY-MM-DD');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_messages_ensure_session ON public.chat_messages;
CREATE TRIGGER trg_chat_messages_ensure_session
BEFORE INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.ensure_chat_session_for_message();

-- Ensure pending_replies has a unique chat_message_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pending_replies_chat_message_id_uniq'
  ) THEN
    ALTER TABLE public.pending_replies
      ADD CONSTRAINT pending_replies_chat_message_id_uniq UNIQUE (chat_message_id);
  END IF;
END $$;

-- Trigger function: create pending_replies entry when a message is marked pending
CREATE OR REPLACE FUNCTION public.create_pending_reply_for_message()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF COALESCE(NEW.is_pending, FALSE) IS TRUE THEN
    INSERT INTO public.pending_replies (
      session_id,
      chat_message_id,
      webinar_id,
      user_name,
      user_email,
      user_message,
      is_answered,
      created_at
    )
    VALUES (
      NEW.session_id,
      NEW.id,
      NEW.webinar_id,
      NULLIF(NEW.user_name, ''),
      NEW.user_email,
      NEW.user_message,
      FALSE,
      now()
    )
    ON CONFLICT (chat_message_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_messages_create_pending ON public.chat_messages;
CREATE TRIGGER trg_chat_messages_create_pending
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.create_pending_reply_for_message();
