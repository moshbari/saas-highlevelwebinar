import { ArrowLeft, Eye, Users, Timer, MessageSquare, MousePointer, TrendingUp, Activity, BarChart3, Percent, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface MetricCardProps {
  icon: React.ElementType;
  name: string;
  description: string;
  calculation: string;
  color: string;
  tip?: string;
}

function MetricCard({ icon: Icon, name, description, calculation, color, tip }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${color} shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">{name}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-start gap-2">
          <span className="text-base mt-0.5">📊</span>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">How it's calculated</p>
            <p className="text-sm text-gray-500">{calculation}</p>
          </div>
        </div>
      </div>
      
      {tip && (
        <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
          <div className="flex items-start gap-2">
            <span className="text-base">💡</span>
            <p className="text-sm text-amber-800">{tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsHelp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Button 
            variant="ghost" 
            className="text-white/80 hover:text-white hover:bg-white/10 mb-6 -ml-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold">Understanding Your Analytics</h1>
          </div>
          
          <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
            Every metric in your dashboard tells a story. This guide explains exactly how each number is calculated, 
            so you can make data-driven decisions with confidence.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Viewer Metrics Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Viewer Metrics</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-3xl">
            Understand who's watching your webinars and how engaged they are.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <MetricCard
              icon={Eye}
              name="Total Viewers"
              description="The number of unique people who joined your webinar during the selected time period."
              calculation="We count unique browser sessions using session IDs. If someone refreshes the page, they're still counted only once."
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              tip="A high viewer count with low retention might mean your intro isn't engaging enough."
            />
            
            <MetricCard
              icon={Activity}
              name="Watching Now"
              description="The number of viewers actively watching your webinar right now, updated in real-time."
              calculation="We count active sessions that have had activity in the last 30 minutes and haven't sent a 'leave' event."
              color="bg-gradient-to-br from-green-500 to-emerald-600"
              tip="This refreshes every 10-15 seconds. Use it to gauge live engagement."
            />
          </div>
        </section>

        {/* Engagement Metrics Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Timer className="w-5 h-5 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Engagement Metrics</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-3xl">
            Measure how well your content holds your audience's attention.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <MetricCard
              icon={Timer}
              name="Avg. Retention"
              description="The average percentage of your webinar that viewers watched. Higher retention means more engaged viewers."
              calculation="We track progress milestones at 25%, 50%, 75%, and 100%. The average of these values across all viewers gives the retention rate."
              color="bg-gradient-to-br from-cyan-500 to-teal-600"
              tip="Retention above 60% is excellent. Below 40% suggests content or pacing issues."
            />
            
            <MetricCard
              icon={MessageSquare}
              name="Chat Messages"
              description="Total messages sent by your viewers in the chat during the webinar."
              calculation="Every message sent by attendees is counted. This includes questions, comments, and reactions."
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              tip="More chat activity often correlates with higher conversion rates."
            />
          </div>
        </section>

        {/* Conversion Metrics Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MousePointer className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Conversion Metrics</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-3xl">
            Track how effectively your webinar converts viewers into leads and customers.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              icon={Users}
              name="Leads Captured"
              description="The number of people who submitted their contact information during your webinar."
              calculation="We count unique form submissions with valid name and email during the selected time period."
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              tip="Compare leads to viewers to calculate your lead capture rate."
            />
            
            <MetricCard
              icon={MousePointer}
              name="CTA Clicks"
              description="How many times viewers clicked on your call-to-action button."
              calculation="Each button click is counted individually. If the same viewer clicks multiple times, each click is recorded."
              color="bg-gradient-to-br from-amber-500 to-orange-600"
              tip="Multiple clicks from one person might indicate high interest or confusion."
            />
            
            <MetricCard
              icon={Percent}
              name="Click Rate"
              description="The percentage of viewers who clicked your CTA button at least once."
              calculation="Formula: (Number of CTA Clicks ÷ Total Viewers) × 100%. A 10% click rate means 1 in 10 viewers clicked."
              color="bg-gradient-to-br from-pink-500 to-rose-600"
              tip="Industry average is 5-10%. Above 15% is exceptional."
            />
          </div>
        </section>

        {/* Trend Analysis Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Trend Analysis</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-3xl">
            Understand how your performance changes over time.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <MetricCard
              icon={TrendingUp}
              name="Trend Indicators"
              description="Shows whether a metric is improving or declining compared to the previous period."
              calculation="We compare the current period (e.g., last 7 days) to the same length period before it. A green arrow means improvement."
              color="bg-gradient-to-br from-indigo-500 to-indigo-600"
              tip="Look for consistent trends over 2-3 periods before making major changes."
            />
            
            <MetricCard
              icon={BarChart3}
              name="Daily Performance Chart"
              description="Shows your daily viewers, leads, and retention over time in a visual chart."
              calculation="Data is grouped by day using Dubai timezone (UTC+4) for accurate local day boundaries."
              color="bg-gradient-to-br from-violet-500 to-purple-600"
              tip="Use the chart to identify your best performing days and times."
            />
          </div>
        </section>

        {/* Quick Reference Card */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 text-white/80" />
              <h2 className="text-2xl font-bold">Quick Reference</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 text-white/90">🎯 Good Benchmarks</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>• Retention: 60%+ is excellent</li>
                  <li>• Click Rate: 5-10% is average</li>
                  <li>• Lead Capture: 20%+ of viewers</li>
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 text-white/90">⏱️ Time Zones</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>• All times shown in Dubai (UTC+4)</li>
                  <li>• Daily charts reset at midnight Dubai time</li>
                  <li>• "Watching Now" is real-time globally</li>
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="font-semibold mb-3 text-white/90">📊 Data Freshness</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>• Live count: Updates every 10-15 sec</li>
                  <li>• Dashboard stats: 1 minute cache</li>
                  <li>• Charts: Refreshes on page load</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            Have questions about your analytics?
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
