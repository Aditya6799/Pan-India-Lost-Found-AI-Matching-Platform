import React from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAdminStats, getRecentActivity, getAnalyticsData } from '@/features/admin/service';
import { OverviewCharts } from '@/components/admin/overview-charts';
import { formatRelativeTime } from '@/lib/utils';

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const [stats, recentActivity, analytics] = await Promise.all([
    getAdminStats(),
    getRecentActivity(10),
    getAnalyticsData(30),
  ]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400',
    },
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
      highlight: stats.pendingApprovals > 0,
    },
    {
      title: 'Recoveries',
      value: stats.successfulRecoveries,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    {
      title: 'Claims Under Review',
      value: stats.claimsUnderReview,
      icon: ClipboardList,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400',
    },
    {
      title: 'AI Matches Generated',
      value: stats.aiMatchesGenerated,
      icon: Sparkles,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 dark:text-cyan-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Alert Banner if Pending Approvals */}
      {stats.pendingApprovals > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Action Required: {stats.pendingApprovals} Report{stats.pendingApprovals > 1 ? 's' : ''} Awaiting Moderation
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80">
                Newly submitted lost or found items need review before being matched across India.
              </p>
            </div>
          </div>
          <Link href={`/${locale}/admin/reports?filter=pending`}>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              Moderate Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Overview
          </h2>
          <p className="text-sm text-slate-500">
            Real-time platform statistics, moderation queues, and recent user actions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href={`/${locale}/admin/reports?filter=pending`}>
            <Button variant="outline" size="sm" className="border-slate-300">
              <FileText className="h-4 w-4 mr-1.5" />
              Approve Reports
            </Button>
          </Link>
          <Link href={`/${locale}/admin/claims`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <ClipboardList className="h-4 w-4 mr-1.5" />
              Review Claims
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 leading-tight">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {card.value.toLocaleString()}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <OverviewCharts
        dailyReports={analytics.dailyReports}
        categoryBreakdown={analytics.categoryBreakdown}
      />

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Recent Audit Log & Platform Activity</CardTitle>
            <p className="text-xs text-slate-500">Last 10 events captured across the platform</p>
          </div>
          <ShieldCheck className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No audit log entries recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivity.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {act.action}
                    </Badge>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {act.user ? act.user.name : 'System / Guest'}
                    </span>
                    {act.resourceType && (
                      <span className="text-slate-400">
                        on <span className="font-medium text-slate-600 dark:text-slate-300">{act.resourceType}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-slate-400">
                    {act.ipAddress && <span className="hidden sm:inline font-mono">{act.ipAddress}</span>}
                    <span>{formatRelativeTime(act.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
