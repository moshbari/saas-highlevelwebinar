import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart 
} from 'recharts';
import { 
  Search, Download, Filter, Eye, MessageSquare, Users, MousePointer, 
  TrendingUp, Calendar, ChevronDown, ExternalLink, Play, Clock, 
  ArrowUpRight, ArrowDownRight, Timer, Percent, ArrowLeft, HelpCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import WebinarPerformanceTable from '@/components/dashboard/WebinarPerformanceTable';
import { MetricTooltip } from '@/components/ui/metric-tooltip';

// Retention curve data - sample structure
const retentionCurve = [
  { time: '0:00', retention: 100, label: 'Start' },
  { time: '5:00', retention: 94, label: '5 min' },
  { time: '10:00', retention: 87, label: '10 min' },
  { time: '15:00', retention: 82, label: '15 min' },
  { time: '20:00', retention: 78, label: '20 min' },
  { time: '30:00', retention: 71, label: '30 min' },
  { time: '45:00', retention: 62, label: '45 min (CTA)' },
  { time: '60:00', retention: 54, label: '1 hour' },
  { time: '90:00', retention: 41, label: '1.5 hours' },
  { time: '120:00', retention: 32, label: '2 hours' },
  { time: '150:00', retention: 28, label: '2.5 hours' },
  { time: '180:00', retention: 24, label: 'End' },
];

// Watch time distribution
const watchTimeDistribution = [
  { range: '0-25%', count: 156, percentage: 18, color: '#ef4444' },
  { range: '25-50%', count: 203, percentage: 24, color: '#f97316' },
  { range: '50-75%', count: 287, percentage: 33, color: '#eab308' },
  { range: '75-100%', count: 218, percentage: 25, color: '#22c55e' },
];

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7'];

type TabType = 'overview' | 'retention' | 'chat history' | 'leads' | 'analytics';

export default function ReportingDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState('7days');
  const [selectedWebinar, setSelectedWebinar] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate date range
  const dateFilter = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case '24hours':
        return { from: subDays(now, 1), to: now };
      case '7days':
        return { from: subDays(now, 7), to: now };
      case '30days':
        return { from: subDays(now, 30), to: now };
      default:
        return { from: subDays(now, 7), to: now };
    }
  }, [dateRange]);

  // Fetch webinars for filter
  const { data: webinars = [] } = useQuery({
    queryKey: ['webinars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webinars')
        .select('id, webinar_name')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', dateFilter, selectedWebinar],
    queryFn: async () => {
      // Get both unique IPs and unique sessions for Total Viewers
      const { data: viewerData } = await supabase.rpc('get_total_viewer_count', {
        from_date: dateFilter.from.toISOString(),
        to_date: dateFilter.to.toISOString(),
        webinar_filter: selectedWebinar === 'all' ? null : selectedWebinar
      });

      // Use the higher of unique_sessions or unique_ips (sessions are more complete for now)
      const uniqueIps = viewerData?.[0]?.unique_ips || 0;
      const uniqueSessions = viewerData?.[0]?.unique_sessions || 0;
      const viewers = Math.max(uniqueIps, uniqueSessions);

      // Total leads
      let leadsQuery = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .gte('captured_at', dateFilter.from.toISOString())
        .lte('captured_at', dateFilter.to.toISOString());
      
      if (selectedWebinar !== 'all') {
        leadsQuery = leadsQuery.eq('webinar_id', selectedWebinar);
      }
      
      const { count: leadsCount } = await leadsQuery;

      // Total chat messages
      let messagesQuery = supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .gte('sent_at', dateFilter.from.toISOString())
        .lte('sent_at', dateFilter.to.toISOString());
      
      if (selectedWebinar !== 'all') {
        messagesQuery = messagesQuery.eq('webinar_id', selectedWebinar);
      }
      
      const { count: messagesCount } = await messagesQuery;

      // CTA clicks
      let ctaQuery = supabase
        .from('cta_clicks')
        .select('*', { count: 'exact' })
        .gte('clicked_at', dateFilter.from.toISOString())
        .lte('clicked_at', dateFilter.to.toISOString());
      
      if (selectedWebinar !== 'all') {
        ctaQuery = ctaQuery.eq('webinar_id', selectedWebinar);
      }
      
      const { count: ctaCount } = await ctaQuery;

      return {
        viewers,
        uniqueIps,
        uniqueSessions,
        leads: leadsCount || 0,
        messages: messagesCount || 0,
        ctaClicks: ctaCount || 0,
        avgRetention: 72, // Placeholder - calculate from actual data
      };
    }
  });

  // Fetch recent chats
  const { data: recentChats = [] } = useQuery({
    queryKey: ['recent-chats', selectedWebinar],
    queryFn: async () => {
      let query = supabase
        .from('chat_messages')
        .select(`
          id,
          user_name,
          user_email,
          user_message,
          sent_at,
          webinar_id,
          webinars (webinar_name)
        `)
        .order('sent_at', { ascending: false })
        .limit(5);
      
      if (selectedWebinar !== 'all') {
        query = query.eq('webinar_id', selectedWebinar);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch leads for leads tab
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['leads-list', dateFilter, selectedWebinar, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select(`
          *,
          webinars (webinar_name)
        `)
        .gte('captured_at', dateFilter.from.toISOString())
        .lte('captured_at', dateFilter.to.toISOString())
        .order('captured_at', { ascending: false });
      
      if (selectedWebinar !== 'all') {
        query = query.eq('webinar_id', selectedWebinar);
      }
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: activeTab === 'leads'
  });

  // Fetch chat history for chat tab
  const { data: chatHistory = [], isLoading: chatLoading } = useQuery({
    queryKey: ['chat-history-list', dateFilter, selectedWebinar, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('chat_messages')
        .select(`
          *,
          webinars (webinar_name)
        `)
        .gte('sent_at', dateFilter.from.toISOString())
        .lte('sent_at', dateFilter.to.toISOString())
        .order('sent_at', { ascending: false });
      
      if (selectedWebinar !== 'all') {
        query = query.eq('webinar_id', selectedWebinar);
      }
      
      if (searchQuery) {
        query = query.or(`user_name.ilike.%${searchQuery}%,user_email.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: activeTab === 'chat history'
  });

  // Daily performance data - using server-side aggregation to bypass 1000-row limit
  // Groups by Dubai timezone (Asia/Dubai) for day boundaries
  const { data: dailyPerformance = [] } = useQuery({
    queryKey: ['daily-performance', dateFilter, selectedWebinar],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_performance', {
        from_date: dateFilter.from.toISOString(),
        to_date: dateFilter.to.toISOString(),
        webinar_filter: selectedWebinar === 'all' ? null : selectedWebinar
      });
      
      if (error) {
        console.error('Daily performance error:', error);
        throw error;
      }
      
      // Convert to chart format with day names
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      return (data || []).map((row: { day_date: string; unique_viewers: number; leads_count: number; avg_retention: number }) => {
        const date = new Date(row.day_date + 'T12:00:00'); // Noon to avoid timezone edge cases
        return {
          day: days[date.getDay()],
          date: row.day_date, // Keep full date for tooltip/labels
          viewers: Number(row.unique_viewers) || 0,
          leads: Number(row.leads_count) || 0,
          retention: Math.round(Number(row.avg_retention) || 0),
        };
      });
    }
  });

  // Webinar performance comparison
  const { data: webinarPerformance = [] } = useQuery({
    queryKey: ['webinar-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webinars')
        .select('id, webinar_name')
        .limit(3);
      
      if (error) throw error;
      
      return (data || []).map((w, i) => ({
        name: w.webinar_name,
        value: 65 - (i * 20),
        retention: 72 - (i * 7),
      }));
    }
  });

  // Retention color based on percentage
  const getRetentionColor = (percent: number) => {
    if (percent >= 75) return 'text-emerald-600 bg-emerald-100';
    if (percent >= 50) return 'text-amber-600 bg-amber-100';
    if (percent >= 25) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRetentionBadgeColor = (percent: number) => {
    if (percent >= 75) return 'bg-emerald-500';
    if (percent >= 50) return 'bg-amber-500';
    if (percent >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    change, 
    changeType, 
    color, 
    subtitle,
    metricKey
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: string | number; 
    change: string; 
    changeType: 'up' | 'down'; 
    color: string;
    subtitle?: string;
    metricKey?: 'total_viewers' | 'leads_captured' | 'avg_retention' | 'chat_messages' | 'cta_clicks' | 'click_rate' | 'watching_now';
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
          {changeType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        <div className="flex items-center mt-1">
          <p className="text-sm text-gray-500">{label}</p>
          {metricKey && <MetricTooltip metric={metricKey} />}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  const ChatRow = ({ chat }: { chat: any }) => {
    const watched = Math.floor(Math.random() * 60) + 40; // Placeholder
    const status = watched > 80 ? 'hot' : watched > 50 ? 'warm' : 'cold';
    
    return (
      <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {chat.user_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
            status === 'hot' ? 'bg-red-500' : status === 'warm' ? 'bg-amber-500' : 'bg-gray-400'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 truncate">{chat.user_name}</p>
            {status === 'hot' && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Hot</span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{chat.user_email}</p>
        </div>
        
        {/* Watch Percentage */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${getRetentionBadgeColor(watched)}`}
              style={{ width: `${watched}%` }}
            />
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getRetentionColor(watched)}`}>
            {watched}%
          </span>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-gray-900">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="font-medium">1</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {format(new Date(chat.sent_at), 'h:mm a')}
          </p>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100 rounded-lg transition-all">
          <ExternalLink className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    );
  };

  const renderOverviewTab = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
        <StatCard 
          icon={Eye} 
          label="Total Viewers" 
          value={stats?.viewers || 0}
          change="12.5%" 
          changeType="up"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          metricKey="total_viewers"
        />
        <StatCard 
          icon={Users} 
          label="Leads Captured" 
          value={stats?.leads || 0}
          change="8.2%" 
          changeType="up"
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          metricKey="leads_captured"
        />
        <StatCard 
          icon={Timer} 
          label="Avg. Retention" 
          value={`${stats?.avgRetention || 0}%`}
          change="4.1%" 
          changeType="up"
          color="bg-gradient-to-br from-cyan-500 to-teal-500"
          subtitle="Avg. 86 min watched"
          metricKey="avg_retention"
        />
        <StatCard 
          icon={MessageSquare} 
          label="Chat Messages" 
          value={stats?.messages || 0}
          change="23.1%" 
          changeType="up"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          metricKey="chat_messages"
        />
        <StatCard 
          icon={MousePointer} 
          label="CTA Clicks" 
          value={stats?.ctaClicks || 0}
          change="5.4%" 
          changeType="down"
          color="bg-gradient-to-br from-amber-500 to-orange-500"
          metricKey="cta_clicks"
        />
      </div>

      {/* Retention Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Retention Curve */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">📉 Retention Curve</h3>
              <p className="text-sm text-gray-500">Viewer drop-off throughout the webinar</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
              <Timer className="w-4 h-4" />
              Biggest drop at 45 min (CTA time)
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={retentionCurve}>
              <defs>
                <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                }}
                formatter={(value) => [`${value}%`, 'Retention']}
              />
              <Area 
                type="monotone" 
                dataKey="retention" 
                stroke="#06b6d4" 
                strokeWidth={3} 
                fill="url(#retentionGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Key Milestones */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">94%</p>
              <p className="text-xs text-gray-500">After 5 min</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">71%</p>
              <p className="text-xs text-gray-500">After 30 min</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">62%</p>
              <p className="text-xs text-gray-500">At CTA (45 min)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">24%</p>
              <p className="text-xs text-gray-500">Finished (3 hrs)</p>
            </div>
          </div>
        </div>

        {/* Watch Time Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-1 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">⏱️ Watch Time Distribution</h3>
            <MetricTooltip metric="watch_time_distribution" />
          </div>
          <p className="text-sm text-gray-500 mb-6">Percentage of viewers by watch duration</p>
          
          <div className="space-y-4">
            {watchTimeDistribution.map((item) => (
              <div key={item.range}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Watched {item.range}</span>
                  <span className="text-sm text-gray-500">{item.count} viewers</span>
                </div>
                <div className="relative">
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 35)}%`, backgroundColor: item.color }}
                    >
                      <span className="text-white text-xs font-bold whitespace-nowrap">{item.percentage}% of viewers</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">58%</p>
                <p className="text-sm text-emerald-600">watched 50%+ of webinar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📊 Daily Performance</h3>
            <p className="text-sm text-gray-500">
              Viewers, leads, and retention {dailyPerformance.length > 7 ? `(${dailyPerformance.length} days)` : 'this week'} — Dubai time
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-sm text-gray-600">Viewers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-gray-600">Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-sm text-gray-600">Retention %</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={dailyPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey={dailyPerformance.length > 7 ? "date" : "day"} 
              stroke="#94a3b8" 
              fontSize={12}
              tickFormatter={(value) => {
                if (dailyPerformance.length > 7 && value.includes('-')) {
                  // Show "Jan 15" format for longer ranges
                  const date = new Date(value + 'T12:00:00');
                  return format(date, 'MMM d');
                }
                return value; // Day name for 7 days or less
              }}
            />
            <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
              }}
              labelFormatter={(label) => {
                if (typeof label === 'string' && label.includes('-')) {
                  const date = new Date(label + 'T12:00:00');
                  return format(date, 'EEEE, MMM d, yyyy');
                }
                return label;
              }}
            />
            <Bar yAxisId="left" dataKey="viewers" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="leads" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="retention" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Webinar Performance Table */}
      <div className="mt-8">
        <WebinarPerformanceTable dateFilter={dateFilter.from} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Chats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">💬 Recent Chat Activity</h3>
                <p className="text-sm text-gray-500">With watch percentage</p>
              </div>
              <Link to="/chat-history" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {recentChats.length > 0 ? (
              recentChats.map((chat: any) => (
                <ChatRow key={chat.id} chat={chat} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No chat activity yet
              </div>
            )}
          </div>
        </div>

        {/* Retention by Webinar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">🎯 Retention by Webinar</h3>
                <p className="text-sm text-gray-500">Compare performance across webinars</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {webinarPerformance.length > 0 ? (
              webinarPerformance.map((webinar: any, index: number) => (
                <div key={webinar.name} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: COLORS[index] }}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{webinar.name}</p>
                        <p className="text-xs text-gray-500">{webinar.value}% of total leads</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getRetentionColor(webinar.retention)}`}>
                      {webinar.retention}% retention
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${webinar.retention}%`, backgroundColor: COLORS[index] }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No webinars yet
              </div>
            )}
          </div>
          
          {/* Insights */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">💡 Insight</p>
                <p className="text-sm text-gray-600">Compare webinar performance to optimize content structure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderChatHistoryTab = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Webinar</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Message</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {chatLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : chatHistory.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No chat messages found</td>
              </tr>
            ) : (
              chatHistory.map((chat: any) => (
                <tr key={chat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {chat.user_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{chat.user_name}</p>
                        <p className="text-sm text-gray-500">{chat.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {chat.webinars?.webinar_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(chat.sent_at), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {chat.user_message}
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      to={`/chat-history/${chat.webinar_id}/${chat.session_date}/${encodeURIComponent(chat.user_email)}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLeadsTab = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Leads</h3>
            <p className="text-sm text-gray-500">{leads.length} total leads</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Lead</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Webinar</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Captured</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leadsLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No leads found</td>
              </tr>
            ) : (
              leads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                        {lead.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {lead.webinars?.webinar_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(lead.captured_at), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {lead.ip_address || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRetentionTab = () => (
    <div className="space-y-6">
      {/* Retention Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-gray-900">72%</p>
          <p className="text-sm text-gray-500 mt-1">Avg Retention</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-gray-900">86 min</p>
          <p className="text-sm text-gray-500 mt-1">Avg Time Watched</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-amber-600">62%</p>
          <p className="text-sm text-gray-500 mt-1">At CTA Point</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-gray-900">24%</p>
          <p className="text-sm text-gray-500 mt-1">Finished Webinar</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-red-500">45 min</p>
          <p className="text-sm text-gray-500 mt-1">Biggest Drop</p>
        </div>
      </div>

      {/* Large Retention Curve */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Retention Curve</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={retentionCurve}>
            <defs>
              <linearGradient id="retentionGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
              }}
              formatter={(value) => [`${value}%`, 'Retention']}
            />
            <Area 
              type="monotone" 
              dataKey="retention" 
              stroke="#06b6d4" 
              strokeWidth={3} 
              fill="url(#retentionGradient2)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Conversion Funnel */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
        <div className="flex items-end justify-center gap-4 h-64">
          {[
            { label: 'Viewers', value: stats?.viewers || 0, color: 'bg-blue-500' },
            { label: 'Leads', value: stats?.leads || 0, color: 'bg-emerald-500' },
            { label: 'Engaged (50%+)', value: Math.floor((stats?.viewers || 0) * 0.58), color: 'bg-amber-500' },
            { label: 'CTA Clicks', value: stats?.ctaClicks || 0, color: 'bg-purple-500' },
          ].map((step, i) => {
            const maxValue = stats?.viewers || 1;
            const heightPercent = (step.value / maxValue) * 100;
            return (
              <div key={step.label} className="flex flex-col items-center gap-2">
                <p className="text-lg font-bold text-gray-900">{step.value.toLocaleString()}</p>
                <div 
                  className={`w-24 ${step.color} rounded-t-lg transition-all duration-500`}
                  style={{ height: `${Math.max(heightPercent, 10)}%` }}
                />
                <p className="text-sm text-gray-600 text-center">{step.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🔥</span>
            <p className="text-sm text-gray-700">Friday has 2x more viewers than Sunday</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
            <span className="text-xl">📈</span>
            <p className="text-sm text-gray-700">Retention improved 4.1% this week</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <p className="text-sm text-gray-700">CTA clicks dropped 5.4% - consider moving CTA earlier</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">💡</span>
            <p className="text-sm text-gray-700">Users who chat 3+ times are 4x more likely to click CTA</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                onClick={() => navigate('/laboratory')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Webinar Dashboard</h1>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">Analytics & Reporting</p>
                  <span className="text-gray-300">•</span>
                  <Link 
                    to="/analytics-help" 
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    How analytics work
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors border-0"
              >
                <option value="24hours">Last 24 Hours</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
              
              <select
                value={selectedWebinar}
                onChange={(e) => setSelectedWebinar(e.target.value)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors border-0"
              >
                <option value="all">All Webinars</option>
                {webinars.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.webinar_name}</option>
                ))}
              </select>
              
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['overview', 'retention', 'chat history', 'leads', 'analytics'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'retention' && renderRetentionTab()}
        {activeTab === 'chat history' && renderChatHistoryTab()}
        {activeTab === 'leads' && renderLeadsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </main>
    </div>
  );
}
