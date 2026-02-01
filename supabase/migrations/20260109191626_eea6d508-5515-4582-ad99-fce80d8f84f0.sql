-- Add ip_address column to webinar_events
ALTER TABLE public.webinar_events 
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Update the unique viewer count function to use IP addresses
CREATE OR REPLACE FUNCTION public.get_unique_viewer_count(
  from_date TIMESTAMPTZ,
  to_date TIMESTAMPTZ,
  webinar_filter TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT ip_address)::INTEGER
  FROM public.webinar_events
  WHERE event_type = 'join'
    AND created_at >= from_date
    AND created_at <= to_date
    AND ip_address IS NOT NULL
    AND (webinar_filter IS NULL OR webinar_id = webinar_filter);
$$;