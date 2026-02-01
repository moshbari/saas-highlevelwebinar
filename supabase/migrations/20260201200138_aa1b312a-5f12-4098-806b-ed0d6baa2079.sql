-- Create webinar_chatbot_config table for per-webinar AI settings
CREATE TABLE public.webinar_chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  
  -- Bot Identity
  bot_name TEXT NOT NULL DEFAULT 'AI Assistant',
  bot_avatar TEXT DEFAULT 'AI',
  
  -- Knowledge Base
  system_prompt TEXT DEFAULT '',
  webinar_description TEXT DEFAULT '',
  webinar_transcript TEXT DEFAULT '',
  additional_context TEXT DEFAULT '',
  
  -- Behavior Settings
  response_style TEXT DEFAULT 'professional',
  max_response_length INTEGER DEFAULT 500,
  redirect_off_topic BOOLEAN DEFAULT true,
  off_topic_message TEXT DEFAULT 'Let''s stay focused on the webinar content. Feel free to ask me anything about what we''re covering today!',
  
  -- Price Handling
  handle_price_questions BOOLEAN DEFAULT true,
  price_redirect_message TEXT DEFAULT 'Great question about pricing! Keep watching - we''ll cover all the details and a special offer coming up soon.',
  
  -- Engagement
  encourage_engagement BOOLEAN DEFAULT true,
  engagement_prompts JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(webinar_id)
);

-- Create webinar_chatbot_faqs table for FAQ pairs
CREATE TABLE public.webinar_chatbot_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webinar_chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinar_chatbot_faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webinar_chatbot_config
CREATE POLICY "Users can view config for their tenant webinars"
ON public.webinar_chatbot_config FOR SELECT
USING (
  webinar_id IN (
    SELECT id FROM public.webinars 
    WHERE tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
    OR user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create config for their tenant webinars"
ON public.webinar_chatbot_config FOR INSERT
WITH CHECK (
  webinar_id IN (
    SELECT id FROM public.webinars 
    WHERE tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
    OR user_id = auth.uid()
  )
);

CREATE POLICY "Users can update config for their tenant webinars"
ON public.webinar_chatbot_config FOR UPDATE
USING (
  webinar_id IN (
    SELECT id FROM public.webinars 
    WHERE tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
    OR user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can delete config for their tenant webinars"
ON public.webinar_chatbot_config FOR DELETE
USING (
  webinar_id IN (
    SELECT id FROM public.webinars 
    WHERE tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
    OR user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for webinar_chatbot_faqs
CREATE POLICY "Users can view FAQs for their tenant webinars"
ON public.webinar_chatbot_faqs FOR SELECT
USING (
  webinar_id IN (
    SELECT id FROM public.webinars 
    WHERE tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
    OR user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create FAQs for their tenant webinars"
ON public.webinar_chatbot_faqs FOR INSERT
WITH CHECK (
  webinar_id IN (
    SELECT id FROM public.webinars 
    WHERE tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
    OR user_id = auth.uid()
  )
);

CREATE POLICY "Users can update FAQs for their tenant webinars"
ON public.webinar_chatbot_faqs FOR UPDATE
USING (
  webinar_id IN (
    SELECT id FROM public.webinars 
    WHERE tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
    OR user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can delete FAQs for their tenant webinars"
ON public.webinar_chatbot_faqs FOR DELETE
USING (
  webinar_id IN (
    SELECT id FROM public.webinars 
    WHERE tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
    OR user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Update triggers
CREATE TRIGGER update_webinar_chatbot_config_updated_at
BEFORE UPDATE ON public.webinar_chatbot_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webinar_chatbot_faqs_updated_at
BEFORE UPDATE ON public.webinar_chatbot_faqs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();