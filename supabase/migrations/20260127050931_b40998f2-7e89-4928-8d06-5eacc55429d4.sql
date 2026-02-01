-- Create webinar_notes table for per-webinar notes with auto-save
CREATE TABLE public.webinar_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one note per webinar per user
  UNIQUE(webinar_id, user_id)
);

-- Create index for fast lookups
CREATE INDEX idx_webinar_notes_webinar_id ON public.webinar_notes(webinar_id);
CREATE INDEX idx_webinar_notes_user_id ON public.webinar_notes(user_id);

-- Enable Row Level Security
ALTER TABLE public.webinar_notes ENABLE ROW LEVEL SECURITY;

-- Users can view their own notes
CREATE POLICY "Users can view their own notes"
ON public.webinar_notes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own notes
CREATE POLICY "Users can create their own notes"
ON public.webinar_notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update their own notes"
ON public.webinar_notes
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes"
ON public.webinar_notes
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all notes
CREATE POLICY "Admins can view all notes"
ON public.webinar_notes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all notes
CREATE POLICY "Admins can manage all notes"
ON public.webinar_notes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_webinar_notes_updated_at
BEFORE UPDATE ON public.webinar_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();