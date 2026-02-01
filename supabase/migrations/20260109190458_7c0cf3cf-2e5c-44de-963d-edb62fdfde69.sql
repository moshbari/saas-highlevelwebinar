-- Create function to count unique viewers by distinct user_email
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
  SELECT COUNT(DISTINCT user_email)::INTEGER
  FROM public.webinar_events
  WHERE event_type = 'join'
    AND created_at >= from_date
    AND created_at <= to_date
    AND (webinar_filter IS NULL OR webinar_id = webinar_filter);
$$;