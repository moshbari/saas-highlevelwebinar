-- Update get_live_viewer_counts to only count sessions with activity in the last 30 minutes
-- This prevents "ghost" sessions from inflating the "Watching Now" count

CREATE OR REPLACE FUNCTION public.get_live_viewer_counts(since_ts timestamp with time zone DEFAULT (now() - '24:00:00'::interval))
 RETURNS TABLE(webinar_id text, webinar_name text, live_count integer)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  WITH recent_activity AS (
    -- Get sessions with ANY event in the last 30 minutes (truly active)
    SELECT DISTINCT session_id
    FROM public.webinar_events
    WHERE created_at >= NOW() - INTERVAL '30 minutes'
      AND session_id IS NOT NULL
      AND session_id <> ''
  ),
  joins AS (
    SELECT
      webinar_id,
      MAX(webinar_name) AS webinar_name,
      session_id
    FROM public.webinar_events
    WHERE event_type = 'join'
      AND created_at >= since_ts
      AND webinar_id IS NOT NULL
      AND webinar_id <> ''
      AND session_id IS NOT NULL
      AND session_id <> ''
    GROUP BY webinar_id, session_id
  ),
  leaves AS (
    SELECT DISTINCT session_id
    FROM public.webinar_events
    WHERE event_type = 'leave'
      AND created_at >= since_ts
      AND session_id IS NOT NULL
      AND session_id <> ''
  ),
  active AS (
    SELECT j.webinar_id, j.webinar_name, j.session_id
    FROM joins j
    INNER JOIN recent_activity ra ON ra.session_id = j.session_id  -- Must have recent activity
    LEFT JOIN leaves l ON l.session_id = j.session_id
    WHERE l.session_id IS NULL  -- No leave event
  )
  SELECT
    webinar_id,
    MAX(webinar_name) AS webinar_name,
    COUNT(*)::int AS live_count
  FROM active
  GROUP BY webinar_id
  ORDER BY live_count DESC;
$function$;