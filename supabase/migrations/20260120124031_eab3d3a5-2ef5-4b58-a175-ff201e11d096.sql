-- Fix retention in get_webinar_performance
-- Previous version filtered webinar_events to event_type='join', which made avg_retention always 0.

CREATE OR REPLACE FUNCTION public.get_webinar_performance(
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
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH event_stats AS (
    SELECT
      webinar_id AS wid,
      COUNT(DISTINCT session_id) FILTER (
        WHERE event_type = 'join'
          AND session_id IS NOT NULL
          AND session_id <> ''
      ) AS viewers,
      AVG(watch_percent) FILTER (
        WHERE event_type LIKE 'progress_%'
          AND watch_percent IS NOT NULL
      ) AS retention
    FROM public.webinar_events
    WHERE (from_date IS NULL OR created_at >= from_date)
      AND (to_date IS NULL OR created_at <= to_date)
      AND webinar_id IS NOT NULL
      AND webinar_id <> ''
      AND (
        event_type = 'join'
        OR event_type LIKE 'progress_%'
      )
    GROUP BY webinar_id
  ),
  cta_stats AS (
    SELECT
      webinar_id::text AS wid,
      COUNT(*) AS clicks
    FROM public.cta_clicks
    WHERE (from_date IS NULL OR clicked_at >= from_date)
      AND (to_date IS NULL OR clicked_at <= to_date)
    GROUP BY webinar_id
  )
  SELECT
    w.id::text,
    w.webinar_name,
    w.created_at,
    COALESCE(es.viewers, 0)::bigint AS total_viewers,
    COALESCE(ROUND(es.retention, 0), 0)::numeric AS avg_retention,
    COALESCE(cs.clicks, 0)::bigint AS cta_clicks,
    CASE
      WHEN COALESCE(es.viewers, 0) > 0
        THEN ROUND((COALESCE(cs.clicks, 0)::numeric / es.viewers) * 100, 1)
      ELSE 0
    END AS click_rate
  FROM public.webinars w
  LEFT JOIN event_stats es ON es.wid = w.id::text
  LEFT JOIN cta_stats cs ON cs.wid = w.id::text
  ORDER BY COALESCE(es.viewers, 0) DESC, w.created_at DESC;
$$;