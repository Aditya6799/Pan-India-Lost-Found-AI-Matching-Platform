'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface OverviewChartsProps {
  dailyReports: Array<{ date: string; lost: number; found: number; total: number }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
}

const COLORS = [
  '#2563eb', // blue
  '#059669', // green
  '#d97706', // amber
  '#dc2626', // red
  '#7c3aed', // purple
  '#0891b2', // cyan
  '#db2777', // pink
  '#4b5563', // gray
];

export function OverviewCharts({ dailyReports, categoryBreakdown }: OverviewChartsProps) {
  const formattedDaily = dailyReports.map((d) => ({
    ...d,
    formattedDate: d.date.slice(5), // MM-DD
  }));

  const pieData = categoryBreakdown.slice(0, 7);
  if (categoryBreakdown.length > 7) {
    const otherCount = categoryBreakdown.slice(7).reduce((acc, curr) => acc + curr.count, 0);
    pieData.push({ category: 'Other Categories', count: otherCount });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 30-Day Trend */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Reports Created Per Day (Last 30 Days)</CardTitle>
          <p className="text-xs text-slate-500">Breakdown of reported Lost vs Found items across India</p>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedDaily}>
                <XAxis dataKey="formattedDate" tick={{ fontSize: 11 }} />
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
                <Line
                  type="monotone"
                  dataKey="lost"
                  name="Lost Items"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="found"
                  name="Found Items"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Category Breakdown</CardTitle>
          <p className="text-xs text-slate-500">Distribution by item classification</p>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full pt-2">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No reports submitted yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
