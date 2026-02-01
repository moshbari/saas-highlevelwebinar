-- Update get_unique_viewer_count to count IPs from ALL event types, not just 'join'
CREATE OR REPLACE FUNCTION public.get_unique_viewer_count(from_date timestamp with time zone, to_date timestamp with time zone, webinar_filter text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT COUNT(DISTINCT ip_address)::INTEGER
  FROM public.webinar_events
  WHERE created_at >= from_date
    AND created_at <= to_date
    AND ip_address IS NOT NULL
    AND (webinar_filter IS NULL OR webinar_id = webinar_filter);
$function$;

-- Create new function that returns both metrics for flexibility
CREATE OR REPLACE FUNCTION public.get_total_viewer_count(from_date timestamp with time zone, to_date timestamp with time zone, webinar_filter text DEFAULT NULL::text)
 RETURNS TABLE(unique_ips integer, unique_sessions integer)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT 
    COUNT(DISTINCT ip_address)::INTEGER as unique_ips,
    COUNT(DISTINCT session_id)::INTEGER as unique_sessions
  FROM public.webinar_events
  WHERE event_type = 'join'
    AND created_at >= from_date
    AND created_at <= to_date
    AND (webinar_filter IS NULL OR webinar_id = webinar_filter);
$function$;