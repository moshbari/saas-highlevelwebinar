import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

export interface MetricInfo {
  name: string;
  description: string;
  calculation: string;
}

export const metricDefinitions: Record<string, MetricInfo> = {
  total_viewers: {
    name: 'Total Viewers',
    description: 'The number of unique people who joined your webinar.',
    calculation: 'We count unique browser sessions. If someone refreshes, they\'re still counted once.',
  },
  leads_captured: {
    name: 'Leads Captured',
    description: 'People who submitted their contact information during the webinar.',
    calculation: 'Count of form submissions (name + email) during the selected time period.',
  },
  avg_retention: {
    name: 'Avg. Retention',
    description: 'How much of your webinar viewers watched on average.',
    calculation: 'We track progress at 25%, 50%, 75%, and 100% marks and calculate the average across all viewers.',
  },
  chat_messages: {
    name: 'Chat Messages',
    description: 'Total messages sent by viewers in the chat.',
    calculation: 'Every message sent by attendees during the webinar is counted.',
  },
  cta_clicks: {
    name: 'CTA Clicks',
    description: 'How many times viewers clicked your call-to-action button.',
    calculation: 'Each button click is counted. Multiple clicks from the same viewer = multiple counts.',
  },
  click_rate: {
    name: 'Click Rate',
    description: 'Percentage of viewers who clicked the CTA button.',
    calculation: 'Formula: (CTA Clicks ÷ Total Viewers) × 100%',
  },
  watching_now: {
    name: 'Watching Now',
    description: 'Viewers currently watching your live webinar right now.',
    calculation: 'Active sessions with activity in the last 30 minutes and no "leave" event.',
  },
  daily_viewers: {
    name: 'Daily Viewers',
    description: 'Unique viewers per day over the selected time period.',
    calculation: 'Counts unique sessions grouped by day in Dubai timezone.',
  },
  daily_leads: {
    name: 'Daily Leads',
    description: 'Leads captured per day over the selected time period.',
    calculation: 'Counts form submissions grouped by day in Dubai timezone.',
  },
  daily_retention: {
    name: 'Daily Retention',
    description: 'Average retention per day over the selected time period.',
    calculation: 'Averages progress events grouped by day in Dubai timezone.',
  },
  trend: {
    name: 'Trend',
    description: 'Performance change compared to the previous period.',
    calculation: 'Compares current period metrics to the same length period before it.',
  },
  watch_time_distribution: {
    name: 'Watch Time Distribution',
    description: 'Shows what percentage of your audience watched each portion of the webinar.',
    calculation: 'Viewers are grouped by how far they watched: 0-25%, 25-50%, 50-75%, or 75-100%. Each bar shows what % of total viewers fell into that bucket.',
  },
};

interface MetricTooltipProps {
  metric: keyof typeof metricDefinitions;
  className?: string;
  showLearnMore?: boolean;
}

export function MetricTooltip({ metric, className = '', showLearnMore = true }: MetricTooltipProps) {
  const info = metricDefinitions[metric];
  
  if (!info) return null;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button 
          type="button"
          className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-primary/20 hover:text-primary transition-colors ml-1.5 ${className}`}
          aria-label={`Learn more about ${info.name}`}
        >
          <HelpCircle className="w-3 h-3 text-gray-500 hover:text-primary" />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        align="center"
        className="max-w-[280px] p-0 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden"
      >
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">{info.name}</h4>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {info.description}
          </p>
          <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
            <span className="text-base mt-0.5">📊</span>
            <p className="text-xs text-gray-500 leading-relaxed">
              {info.calculation}
            </p>
          </div>
        </div>
        {showLearnMore && (
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
            <Link 
              to="/analytics-help" 
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Learn more about analytics →
            </Link>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export default MetricTooltip;
