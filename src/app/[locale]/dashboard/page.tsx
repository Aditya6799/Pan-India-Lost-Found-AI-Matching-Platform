import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ItemReport from "@/models/ItemReport";
import Match from "@/models/Match";
import Claim from "@/models/Claim";
import Notification from "@/models/Notification";
import { StatsCard } from "@/components/dashboard/stats-card";
import { MatchCard } from "@/components/reports/match-card";
import { StatusBadge } from "@/components/reports/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  FileText,
  Search,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  MapPin,
} from "lucide-react";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/dashboard`);
  }

  await connectDB();
  const userId = session.user.id;

  // 1. Fetch Stat Counts
  const [lostCount, foundCount, userReports] = await Promise.all([
    ItemReport.countDocuments({ userId, reportType: "LOST" }),
    ItemReport.countDocuments({ userId, reportType: "FOUND" }),
    ItemReport.find({ userId }).select("_id").lean(),
  ]);

  const reportIds = userReports.map((r) => r._id);

  const [matchesCount, pendingClaimsCount] = await Promise.all([
    reportIds.length > 0
      ? Match.countDocuments({
          $or: [
            { lostReportId: { $in: reportIds } },
            { foundReportId: { $in: reportIds } },
          ],
        })
      : 0,
    Claim.countDocuments({
      claimantId: userId,
      status: { $in: ["pending", "under_review"] },
    }),
  ]);

  // 2. Fetch Recent Reports (last 5)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentReports: any[] = await ItemReport.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // 3. Fetch Recent AI Matches (last 3)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentMatches: any[] = [];
  if (reportIds.length > 0) {
    recentMatches = await Match.find({
      $or: [
        { lostReportId: { $in: reportIds } },
        { foundReportId: { $in: reportIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("lostReportId")
      .populate("foundReportId")
      .lean();
  }

  // 4. Fetch Recent Notifications (last 5)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentNotifications: any[] = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const formattedDate = new Date().toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/60 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-neutral-900 dark:text-neutral-50 tracking-tight">
            Hello, {session.user.name?.split(" ")[0] || "Citizen"}!
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {formattedDate} • Manage reports and review automated AI matches
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={`/${locale}/report/lost`}>
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
              Report Lost
            </Button>
          </Link>
          <Link href={`/${locale}/report/found`}>
            <Button variant="secondary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
              Report Found
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/matches`}>
            <Button variant="outline" size="sm" leftIcon={<Sparkles className="h-4 w-4" />}>
              View Matches
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Lost Reports"
          value={lostCount}
          icon={<FileText className="h-5 w-5" />}
          iconBgColor="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
          description="Reports currently registered"
        />
        <StatsCard
          label="Found Reports"
          value={foundCount}
          icon={<Search className="h-5 w-5" />}
          iconBgColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
          description="Articles waiting to be reunited"
        />
        <StatsCard
          label="AI Matches"
          value={matchesCount}
          icon={<Sparkles className="h-5 w-5" />}
          iconBgColor="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
          description="Algorithmic suggestions"
        />
        <StatsCard
          label="Pending Claims"
          value={pendingClaimsCount}
          icon={<ShieldAlert className="h-5 w-5" />}
          iconBgColor="bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400"
          description="Under review by custodians"
        />
      </div>

      {/* Main Grid: Recent Reports & Recent AI Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recent Reports Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold">Recent Reports</CardTitle>
                <CardDescription>Latest items you have reported on FoundIt</CardDescription>
              </div>
              <Link
                href={`/${locale}/dashboard/reports`}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 hover:underline"
              >
                View all ({lostCount + foundCount})
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {recentReports.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                  <p className="text-sm">You haven&apos;t filed any lost or found reports yet.</p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Link href={`/${locale}/report/lost`}>
                      <Button variant="primary" size="sm">File Lost Report</Button>
                    </Link>
                    <Link href={`/${locale}/report/found`}>
                      <Button variant="outline" size="sm">Report Found Item</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
                    <thead className="bg-neutral-50/80 dark:bg-neutral-800/50 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 border-y border-neutral-100 dark:border-neutral-800">
                      <tr>
                        <th className="px-5 py-3">Item</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {recentReports.map((report) => (
                        <tr key={report._id.toString()} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-neutral-900 dark:text-neutral-100">
                            <div className="flex items-center gap-3">
                              {report.images?.[0]?.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={report.images[0].url}
                                  alt={report.itemName}
                                  className="h-9 w-9 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                                />
                              ) : (
                                <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                                  <FileText className="h-4 w-4" />
                                </div>
                              )}
                              <span className="truncate max-w-[180px] font-semibold">{report.itemName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                report.reportType === "LOST"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              }`}
                            >
                              {report.reportType}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-neutral-500 dark:text-neutral-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                              <span className="truncate max-w-[120px]">{report.city}, {report.state}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                            {formatDate(report.lostFoundDate)}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={report.status || "active"} size="sm" />
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Link
                              href={`/${locale}/reports/${report._id}`}
                              className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent AI Matches Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-heading text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Recent AI Match Discoveries</span>
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Multimodal similarity recommendations calculated by AI
                </p>
              </div>
              <Link
                href={`/${locale}/dashboard/matches`}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 hover:underline"
              >
                All Matches ({matchesCount})
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentMatches.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-neutral-300 dark:border-neutral-800">
                <Sparkles className="h-8 w-8 mx-auto text-neutral-400 dark:text-neutral-600 mb-2" />
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">No active AI matches yet</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                  Our neural similarity worker scans newly reported items 24/7. You will receive an instant notification when a match is found.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {recentMatches.map((match) => {
                  const lost = match.lostReportId;
                  const found = match.foundReportId;
                  if (!lost || !found) return null;

                  return (
                    <MatchCard
                      key={match._id.toString()}
                      matchId={match._id.toString()}
                      score={match.finalScore}
                      provider={match.matchingProvider || "semantic"}
                      matchReasons={match.matchReasons || []}
                      status={match.status}
                      lostReport={{
                        id: lost._id.toString(),
                        itemName: lost.itemName,
                        imageUrl: lost.images?.[0]?.url || null,
                        state: lost.state,
                        city: lost.city,
                        date: lost.lostFoundDate,
                      }}
                      foundReport={{
                        id: found._id.toString(),
                        itemName: found.itemName,
                        imageUrl: found.images?.[0]?.url || null,
                        state: found.state,
                        city: found.city,
                        date: found.lostFoundDate,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Notifications & Platform Tips */}
        <div className="space-y-6">
          <Card className="border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary-600" />
                  <span>Recent Notifications</span>
                </CardTitle>
                <CardDescription className="text-xs">Alerts and claim updates</CardDescription>
              </div>
              <Link
                href={`/${locale}/dashboard/notifications`}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
              >
                All
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400">
                  No notifications to display.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {recentNotifications.map((notif) => (
                    <div
                      key={notif._id.toString()}
                      className={`p-4 flex items-start gap-3 transition-colors ${
                        !notif.isRead ? "bg-primary-50/40 dark:bg-primary-950/20" : ""
                      }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {notif.type === "match_found" ? (
                          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        ) : notif.type?.includes("claim") ? (
                          <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />
                        ) : (
                          <Bell className="h-3.5 w-3.5 text-neutral-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                          {notif.title}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-neutral-400 mt-1 block">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Safety & Helpful Advice Card */}
          <Card className="border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                  Safe Retrieval Guidelines
                </h3>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                  Always meet in well-lit public places or at designated transit lost & found counters. Never transfer advance courier fees to unverified claimants.
                </p>
                <Link
                  href={`/${locale}/about`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Learn how verification works
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
