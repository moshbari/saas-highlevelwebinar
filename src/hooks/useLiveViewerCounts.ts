import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LiveViewerCount {
  webinar_id: string;
  webinar_name: string;
  live_count: number;
}

export const useLiveViewerCounts = (refreshInterval = 10000) => {
  return useQuery({
    queryKey: ['liveViewerCounts'],
    queryFn: async (): Promise<LiveViewerCount[]> => {
      // Server-side aggregation avoids REST row limits (1000 rows) and de-dupes noisy join events.
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const { data, error } = await (supabase as any).rpc('get_live_viewer_counts', {
        since_ts: yesterday.toISOString(),
      });

      if (error) {
        console.error('Error fetching live viewer counts:', error);
        throw error;
      }

      return (data || []).map((row: any) => ({
        webinar_id: String(row.webinar_id),
        webinar_name: row.webinar_name || 'Unknown Webinar',
        live_count: Number(row.live_count) || 0,
      }));
    },
    refetchInterval: refreshInterval,
    staleTime: 5000,
  });
};

export const useTotalLiveViewers = (refreshInterval = 5000) => {
  const { data: viewerCounts, ...rest } = useLiveViewerCounts(refreshInterval);
  
  const totalCount = viewerCounts?.reduce((sum, item) => sum + item.live_count, 0) || 0;
  
  return {
    totalCount,
    breakdown: viewerCounts || [],
    ...rest
  };
};
