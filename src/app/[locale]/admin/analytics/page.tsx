'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  BarChart2,
  Calendar,
  Download,
  TrendingUp,
  Award,
  MapPin,
  Sparkles,
  PieChart as PieIcon,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchAnalyticsAction } from '@/features/admin/actions';
import { AnalyticsData } from '@/features/admin/service';

const CATEGORY_COLORS = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#4b5563',
  '#f59e0b',
  '#10b981',
];

const CLAIM_COLORS: Record<string, string> = {
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  PENDING: '#f59e0b',
  RESOLVED: '#3b82f6',
  'UNDER REVIEW': '#8b5cf6',
};

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (d: 7 | 30 | 90) => {
    setIsLoading(true);
    try {
      const res = await fetchAnalyticsAction(d);
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(days);
  }, [days]);

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Platform Analytics & Intelligence
          </h2>
          <p className="text-sm text-slate-500">
            Insights on Indian geographic trends, recovery efficiency, and AI model performance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  days === d
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {d === 7 ? 'Last 7 Days' : d === 30 ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => alert('Exporting platform CSV analytics summary...')}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Data
          </Button>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="text-sm text-slate-500">Aggregating nationwide analytics...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-blue-600">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Avg AI Match Accuracy
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.keyMetrics.avgMatchScore}%
                </p>
                <p className="text-[11px] text-slate-400">Hybrid semantic & vision correlation</p>
              </div>
            </Card>

            <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-emerald-600">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Item Recovery Rate
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data.keyMetrics.recoveryRate}%
                </p>
                <p className="text-[11px] text-slate-400">Reported items returned to owners</p>
              </div>
            </Card>

            <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-purple-600">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Top Active Cities
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.keyMetrics.mostActiveCities.length > 0 ? (
                    data.keyMetrics.mostActiveCities.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {c.city} ({c.count})
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Data accumulating</span>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Chart 1: Area Chart (Daily Submissions Lost vs Found) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Daily Report Submissions Trend (Lost vs Found)
              </CardTitle>
              <p className="text-xs text-slate-500">
                Tracking citizen report volume across time intervals
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyReports}>
                    <defs>
                      <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area
                      type="monotone"
                      dataKey="lost"
                      name="Lost Items"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#colorLost)"
                    />
                    <Area
                      type="monotone"
                      dataKey="found"
                      name="Found Items"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorFound)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row 2: Category Bar Chart & State Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 2: Reports by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Reports by Category</CardTitle>
                <p className="text-xs text-slate-500">Most frequently reported item categories</p>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.categoryBreakdown.slice(0, 8)}
                      layout="vertical"
                      margin={{ left: 30 }}
                    >
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" name="Reports" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                        {data.categoryBreakdown.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 3: Reports by State (Top 10) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Reports by State (Top 10)</CardTitle>
                <p className="text-xs text-slate-500">Pan-India geographic distribution</p>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.stateBreakdown}>
                      <XAxis dataKey="state" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" name="Items" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 3: AI Match Score Distribution & Donut Chart Claim Outcomes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 4: AI Match Scores Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  AI Match Confidence Score Distribution
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Spread of computed multimodal match scores across all items
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.matchScoreDistribution}>
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Match Pairs"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#06b6d4' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 5: Donut Chart Claim Outcomes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Claim Outcomes</CardTitle>
                <p className="text-xs text-slate-500">
                  Verification status of submitted ownership claims
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full pt-2">
                  {data.claimOutcomes.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      No claims recorded yet
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.claimOutcomes}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="45%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                        >
                          {data.claimOutcomes.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CLAIM_COLORS[entry.status] || '#94a3b8'}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
