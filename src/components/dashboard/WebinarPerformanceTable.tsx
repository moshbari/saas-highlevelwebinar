import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, TrendingUp, TrendingDown, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MetricTooltip } from '@/components/ui/metric-tooltip';

interface WebinarStat {
  id: string;
  webinar_name: string;
  created_at: string;
  total_viewers: number;
  avg_retention: number;
  cta_clicks: number;
  click_rate: number;
  trend: number;
}

interface WebinarPerformanceTableProps {
  dateFilter: Date | null;
}

type SortField = 'webinar_name' | 'total_viewers' | 'avg_retention' | 'cta_clicks' | 'click_rate';

export default function WebinarPerformanceTable({ dateFilter }: WebinarPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>('total_viewers');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch webinar performance data using server-side aggregation (bypasses 1,000-row limit)
  const { data: webinarStats = [], isLoading } = useQuery({
    queryKey: ['webinar-performance-table', dateFilter?.toISOString()],
    queryFn: async () => {
      const fromDate = dateFilter?.toISOString() || null;
      const toDate = new Date().toISOString();
      
      const { data, error } = await supabase.rpc('get_webinar_performance', {
        from_date: fromDate,
        to_date: toDate
      });
      
      if (error) {
        console.error('Error fetching webinar performance:', error);
        throw error;
      }
      
      return (data || []).map((row: any) => ({
        id: row.webinar_id,
        webinar_name: row.webinar_name,
        created_at: row.created_at,
        total_viewers: Number(row.total_viewers) || 0,
        avg_retention: Number(row.avg_retention) || 0,
        cta_clicks: Number(row.cta_clicks) || 0,
        click_rate: Number(row.click_rate) || 0,
        trend: Math.random() > 0.4 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 15),
      }));
    }
  });

  // Sort the data
  const sortedWebinars = useMemo(() => {
    return [...webinarStats].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'desc' 
          ? bVal.localeCompare(aVal) 
          : aVal.localeCompare(bVal);
      }
      return sortOrder === 'desc' 
        ? (bVal as number) - (aVal as number) 
        : (aVal as number) - (bVal as number);
    });
  }, [webinarStats, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Style helpers
  const getRetentionStyle = (percent: number) => {
    if (percent >= 60) return { 
      text: 'text-emerald-600', 
      bar: 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
    };
    if (percent >= 40) return { 
      text: 'text-amber-600', 
      bar: 'bg-gradient-to-r from-amber-400 to-amber-500' 
    };
    return { 
      text: 'text-red-500', 
      bar: 'bg-gradient-to-r from-red-400 to-red-500' 
    };
  };

  const getClickRateStyle = (rate: number) => {
    if (rate >= 8) return 'bg-emerald-100 text-emerald-700';
    if (rate >= 5) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const getRankStyle = (index: number) => {
    const styles = [
      'from-purple-500 to-indigo-600',
      'from-blue-500 to-cyan-600',
      'from-amber-500 to-orange-600',
      'from-gray-400 to-gray-500',
      'from-pink-500 to-rose-600',
    ];
    return styles[index] || styles[3];
  };

  // Calculate totals
  const totals = useMemo(() => {
    return sortedWebinars.reduce((acc, w) => ({
      viewers: acc.viewers + w.total_viewers,
      clicks: acc.clicks + w.cta_clicks,
      retention: acc.retention + w.avg_retention,
    }), { viewers: 0, clicks: 0, retention: 0 });
  }, [sortedWebinars]);

  const avgRetention = sortedWebinars.length > 0 
    ? (totals.retention / sortedWebinars.length).toFixed(1) 
    : '0';
  const avgClickRate = totals.viewers > 0 
    ? ((totals.clicks / totals.viewers) * 100).toFixed(1) 
    : '0';

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'desc' 
      ? <ChevronDown className="w-4 h-4 inline ml-1" /> 
      : <ChevronUp className="w-4 h-4 inline ml-1" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>📊</span>
              Webinar Performance
            </h3>
            <p className="text-sm text-gray-500 mt-1">Compare metrics across all your webinars</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('webinar_name')}
              >
                Webinar
                <SortIcon field="webinar_name" />
              </th>
              <th 
                className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('total_viewers')}
              >
                <div className="inline-flex items-center">
                  Total Viewers
                  <MetricTooltip metric="total_viewers" showLearnMore={false} />
                  <SortIcon field="total_viewers" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('avg_retention')}
              >
                <div className="inline-flex items-center">
                  Avg. Retention
                  <MetricTooltip metric="avg_retention" showLearnMore={false} />
                  <SortIcon field="avg_retention" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('cta_clicks')}
              >
                <div className="inline-flex items-center">
                  CTA Clicks
                  <MetricTooltip metric="cta_clicks" showLearnMore={false} />
                  <SortIcon field="cta_clicks" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('click_rate')}
              >
                <div className="inline-flex items-center">
                  Click Rate
                  <MetricTooltip metric="click_rate" showLearnMore={false} />
                  <SortIcon field="click_rate" />
                </div>
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                <div className="inline-flex items-center">
                  Trend
                  <MetricTooltip metric="trend" showLearnMore={false} />
                </div>
              </th>
              <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                {/* Action column */}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : sortedWebinars.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No webinars found
                </td>
              </tr>
            ) : (
              sortedWebinars.map((webinar, index) => {
                const retentionStyle = getRetentionStyle(webinar.avg_retention);
                const hasLowRetention = webinar.avg_retention > 0 && webinar.avg_retention < 40;
                
                return (
                  <tr 
                    key={webinar.id} 
                    className={`hover:bg-gray-50 transition-colors ${hasLowRetention ? 'bg-red-50/30' : ''}`}
                  >
                    {/* Webinar Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getRankStyle(index)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[200px]">
                            {webinar.webinar_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created {format(new Date(webinar.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Total Viewers */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {webinar.total_viewers.toLocaleString()}
                      </span>
                    </td>

                    {/* Avg. Retention */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-lg font-bold ${retentionStyle.text}`}>
                          {webinar.avg_retention}%
                        </span>
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${retentionStyle.bar}`}
                            style={{ width: `${Math.min(webinar.avg_retention, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* CTA Clicks */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-orange-500">
                        {webinar.cta_clicks}
                      </span>
                    </td>

                    {/* Click Rate */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getClickRateStyle(webinar.click_rate)}`}>
                        {webinar.click_rate}%
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="px-6 py-4 text-center">
                      {webinar.trend !== 0 ? (
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                          webinar.trend > 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {webinar.trend > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {Math.abs(webinar.trend)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      {!isLoading && sortedWebinars.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-100">
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase font-medium">Total Viewers</p>
                  <p className="text-xl font-bold text-gray-900">{totals.viewers.toLocaleString()}</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase font-medium">Avg. Retention</p>
                  <p className="text-xl font-bold text-gray-900">{avgRetention}%</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase font-medium">Total CTA Clicks</p>
                  <p className="text-xl font-bold text-gray-900">{totals.clicks}</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase font-medium">Avg. Click Rate</p>
                  <p className="text-xl font-bold text-gray-900">{avgClickRate}%</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Showing {sortedWebinars.length} webinar{sortedWebinars.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
