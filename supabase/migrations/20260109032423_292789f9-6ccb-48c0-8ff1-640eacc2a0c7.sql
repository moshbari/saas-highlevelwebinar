-- Create clips table for video clip library
CREATE TABLE public.clips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  duration_auto_detected BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  file_size_mb NUMERIC(10,2),
  notes TEXT,
  tags TEXT[],
  is_archived BOOLEAN DEFAULT false
);

-- Create indexes for clips table
CREATE INDEX idx_clips_user ON public.clips(user_id);
CREATE INDEX idx_clips_archived ON public.clips(is_archived);
CREATE INDEX idx_clips_created_at ON public.clips(created_at DESC);

-- Enable RLS on clips table
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- RLS policies for clips (public access for now, no auth)
CREATE POLICY "Anyone can view clips" ON public.clips FOR SELECT USING (true);
CREATE POLICY "Anyone can create clips" ON public.clips FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update clips" ON public.clips FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete clips" ON public.clips FOR DELETE USING (true);

-- Add video mode and sequence columns to webinars table
ALTER TABLE public.webinars ADD COLUMN video_mode TEXT DEFAULT 'single' CHECK (video_mode IN ('single', 'multi'));
ALTER TABLE public.webinars ADD COLUMN video_sequence JSONB DEFAULT '[]';

-- Create trigger for clips updated_at
CREATE TRIGGER update_clips_updated_at
BEFORE UPDATE ON public.clips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();