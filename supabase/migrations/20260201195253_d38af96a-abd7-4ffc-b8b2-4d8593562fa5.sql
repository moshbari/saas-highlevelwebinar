-- Create tenant_api_keys table for storing encrypted API keys
CREATE TABLE public.tenant_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Voice Dictation (OpenAI Whisper only)
  whisper_key_encrypted TEXT,
  whisper_key_configured_at TIMESTAMPTZ,
  
  -- AI Chatbot - OpenAI
  openai_key_encrypted TEXT,
  openai_key_configured_at TIMESTAMPTZ,
  
  -- AI Chatbot - Anthropic
  anthropic_key_encrypted TEXT,
  anthropic_key_configured_at TIMESTAMPTZ,
  
  -- Preferred AI provider for chatbot
  preferred_ai_provider TEXT DEFAULT 'openai' CHECK (preferred_ai_provider IN ('openai', 'anthropic')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.tenant_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only owners/admins can manage API keys
CREATE POLICY "Owners/Admins can view tenant API keys"
  ON public.tenant_api_keys
  FOR SELECT
  USING (
    has_tenant_role(auth.uid(), tenant_id, 'owner') OR 
    has_tenant_role(auth.uid(), tenant_id, 'admin')
  );

CREATE POLICY "Owners/Admins can insert tenant API keys"
  ON public.tenant_api_keys
  FOR INSERT
  WITH CHECK (
    has_tenant_role(auth.uid(), tenant_id, 'owner') OR 
    has_tenant_role(auth.uid(), tenant_id, 'admin')
  );

CREATE POLICY "Owners/Admins can update tenant API keys"
  ON public.tenant_api_keys
  FOR UPDATE
  USING (
    has_tenant_role(auth.uid(), tenant_id, 'owner') OR 
    has_tenant_role(auth.uid(), tenant_id, 'admin')
  );

CREATE POLICY "Owners/Admins can delete tenant API keys"
  ON public.tenant_api_keys
  FOR DELETE
  USING (
    has_tenant_role(auth.uid(), tenant_id, 'owner') OR 
    has_tenant_role(auth.uid(), tenant_id, 'admin')
  );

-- Add trigger for updated_at
CREATE TRIGGER update_tenant_api_keys_updated_at
  BEFORE UPDATE ON public.tenant_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for fast tenant lookups
CREATE INDEX idx_tenant_api_keys_tenant_id ON public.tenant_api_keys(tenant_id);