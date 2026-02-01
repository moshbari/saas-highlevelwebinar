-- ============================================
-- LIVE CHAT FEATURE - DATABASE SETUP
-- ============================================

-- 1. Create chat_sessions table
CREATE TABLE public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Link to existing tables
  webinar_id UUID REFERENCES public.webinars(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  
  -- User info (denormalized for quick access)
  user_name TEXT,
  user_email TEXT NOT NULL,
  
  -- Session state
  mode TEXT DEFAULT 'ai' CHECK (mode IN ('ai', 'human')),
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  last_message_at TIMESTAMP WITH TIME ZONE,
  taken_over_at TIMESTAMP WITH TIME ZONE,
  taken_over_by TEXT,
  returned_to_ai_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_chat_sessions_webinar ON public.chat_sessions(webinar_id);
CREATE INDEX idx_chat_sessions_email ON public.chat_sessions(user_email);
CREATE INDEX idx_chat_sessions_active ON public.chat_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_chat_sessions_mode ON public.chat_sessions(mode);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_sessions
CREATE POLICY "Anyone can view chat_sessions" ON public.chat_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create chat_sessions" ON public.chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update chat_sessions" ON public.chat_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete chat_sessions" ON public.chat_sessions FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add columns to chat_messages table
ALTER TABLE public.chat_messages 
  ADD COLUMN IF NOT EXISTS response_type TEXT DEFAULT 'ai' CHECK (response_type IN ('ai', 'human')),
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_pending BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;

-- Index for pending messages
CREATE INDEX idx_chat_messages_pending ON public.chat_messages(is_pending) WHERE is_pending = true;
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);

-- 3. Create pending_replies table
CREATE TABLE public.pending_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  chat_message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  webinar_id UUID REFERENCES public.webinars(id) ON DELETE CASCADE,
  
  -- For quick display
  user_name TEXT,
  user_email TEXT,
  user_message TEXT,
  
  -- Status
  is_answered BOOLEAN DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE,
  human_response TEXT
);

-- Index for unanswered messages
CREATE INDEX idx_pending_replies_unanswered ON public.pending_replies(is_answered) WHERE is_answered = false;
CREATE INDEX idx_pending_replies_session ON public.pending_replies(session_id);

-- Enable RLS
ALTER TABLE public.pending_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for pending_replies
CREATE POLICY "Anyone can view pending_replies" ON public.pending_replies FOR SELECT USING (true);
CREATE POLICY "Anyone can create pending_replies" ON public.pending_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pending_replies" ON public.pending_replies FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pending_replies" ON public.pending_replies FOR DELETE USING (true);

-- 4. Create quick_replies table for canned responses
CREATE TABLE public.quick_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for quick_replies
CREATE POLICY "Anyone can view quick_replies" ON public.quick_replies FOR SELECT USING (true);
CREATE POLICY "Anyone can create quick_replies" ON public.quick_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update quick_replies" ON public.quick_replies FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete quick_replies" ON public.quick_replies FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_quick_replies_updated_at
  BEFORE UPDATE ON public.quick_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default quick replies
INSERT INTO public.quick_replies (title, message, category, sort_order) VALUES
  ('💰 Payment Plans', 'Yes! We offer 3 payment options: $997 full payment, $547 x 2 months, or $397 x 3 months. Which works best for you?', 'pricing', 1),
  ('🎁 Bonus Question', 'Great question! Yes, you get ALL the bonuses when you enroll today. This includes the private community, templates, and live Q&A sessions.', 'bonuses', 2),
  ('⏰ Deadline', 'The special price ends tonight at midnight. After that, it goes back to full price. I don''t want you to miss out!', 'urgency', 3),
  ('📞 Book a Call', 'I''d love to chat with you personally! Book a quick 15-minute call here and I''ll answer all your questions: [your link]', 'support', 4),
  ('🚀 Getting Started', 'Once you enroll, you''ll get immediate access to the training portal. I recommend starting with Module 1 and going through it in order.', 'onboarding', 5);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;