-- Create function for server-side webinar performance aggregation
-- This bypasses the 1,000-row Supabase limit by calculating metrics in the database

CREATE OR REPLACE FUNCTION get_webinar_performance(
  from_date timestamptz DEFAULT NULL,
  to_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  webinar_id text,
  webinar_name text,
  created_at timestamptz,
  total_viewers bigint,
  avg_retention numeric,
  cta_clicks bigint,
  click_rate numeric
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH viewer_stats AS (
    SELECT 
      e.webinar_id AS wid,
      COUNT(DISTINCT e.session_id) AS viewers,
      AVG(CASE WHEN e.event_type LIKE 'progress_%' THEN e.watch_percent END) AS retention
    FROM webinar_events e
    WHERE e.event_type = 'join'
      AND (from_date IS NULL OR e.created_at >= from_date)
      AND (to_date IS NULL OR e.created_at <= to_date)
    GROUP BY e.webinar_id
  ),
  cta_stats AS (
    SELECT 
      c.webinar_id::text AS wid,
      COUNT(*) AS clicks
    FROM cta_clicks c
    WHERE (from_date IS NULL OR c.clicked_at >= from_date)
      AND (to_date IS NULL OR c.clicked_at <= to_date)
    GROUP BY c.webinar_id
  )
  SELECT 
    w.id::text,
    w.webinar_name,
    w.created_at,
    COALESCE(vs.viewers, 0)::bigint,
    COALESCE(ROUND(vs.retention, 0), 0)::numeric,
    COALESCE(cs.clicks, 0)::bigint,
    CASE 
      WHEN COALESCE(vs.viewers, 0) > 0 
      THEN ROUND((COALESCE(cs.clicks, 0)::numeric / vs.viewers) * 100, 1)
      ELSE 0 
    END
  FROM webinars w
  LEFT JOIN viewer_stats vs ON w.id::text = vs.wid
  LEFT JOIN cta_stats cs ON w.id::text = cs.wid
  ORDER BY COALESCE(vs.viewers, 0) DESC;
END;
$$;