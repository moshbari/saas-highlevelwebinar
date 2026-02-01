-- Fix retention in get_daily_performance
-- Same bug as get_webinar_performance: filtering to 'join' events excluded progress_% events needed for retention

CREATE OR REPLACE FUNCTION public.get_daily_performance(
  from_date timestamptz,
  to_date timestamptz,
  webinar_filter text DEFAULT NULL
)
RETURNS TABLE (
  day_date date,
  unique_viewers bigint,
  leads_count bigint,
  avg_retention numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH date_range AS (
    SELECT generate_series(
      (from_date AT TIME ZONE 'Asia/Dubai')::date,
      (to_date AT TIME ZONE 'Asia/Dubai')::date,
      '1 day'::interval
    )::date AS d
  ),
  viewer_stats AS (
    SELECT 
      (created_at AT TIME ZONE 'Asia/Dubai')::date AS event_date,
      COUNT(DISTINCT session_id) FILTER (
        WHERE event_type = 'join'
          AND session_id IS NOT NULL
          AND session_id <> ''
      ) AS viewers,
      AVG(watch_percent) FILTER (
        WHERE event_type LIKE 'progress_%'
          AND watch_percent IS NOT NULL
      ) AS retention
    FROM webinar_events
    WHERE created_at >= from_date 
      AND created_at <= to_date
      AND (webinar_filter IS NULL OR webinar_id = webinar_filter)
      AND (event_type = 'join' OR event_type LIKE 'progress_%')
    GROUP BY 1
  ),
  lead_stats AS (
    SELECT 
      (captured_at AT TIME ZONE 'Asia/Dubai')::date AS lead_date,
      COUNT(*) AS leads
    FROM leads
    WHERE captured_at >= from_date 
      AND captured_at <= to_date
      AND (webinar_filter IS NULL OR webinar_id::text = webinar_filter)
    GROUP BY 1
  )
  SELECT 
    dr.d,
    COALESCE(vs.viewers, 0)::bigint,
    COALESCE(ls.leads, 0)::bigint,
    COALESCE(ROUND(vs.retention, 0), 0)::numeric
  FROM date_range dr
  LEFT JOIN viewer_stats vs ON dr.d = vs.event_date
  LEFT JOIN lead_stats ls ON dr.d = ls.lead_date
  ORDER BY dr.d;
$$;