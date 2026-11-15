import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  Palette,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info,
  Lock,
  MessageSquare,
  AlertCircle,
  Eye,
} from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import { ItemReport, Match } from "@/models";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/reports/status-badge";
import { ReportDetailClient } from "@/components/reports/report-detail-client";
import { ReportCard } from "@/components/reports/report-card";
import mongoose from "mongoose";

interface ReportDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: ReportDetailPageProps) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { title: "Item Not Found | KhojSetu" };
  }

  await connectDB();
  const report = await ItemReport.findById(id).select("itemName category reportType").lean();
  if (!report) {
    return { title: "Item Not Found | KhojSetu" };
  }

  return {
    title: `${report.itemName} (${report.reportType}) | KhojSetu`,
    description: `View details and matching results for ${report.itemName} listed under ${report.category} on KhojSetu.`,
  };
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();
  const session = await auth();

  // Increment views and get report
  const report = await ItemReport.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("userId", "name preferredLanguage")
    .lean();

  if (!report) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reportData = JSON.parse(JSON.stringify(report)) as any;
  const isOwner = session?.user?.id === reportData.userId?._id?.toString();

  // Fetch AI matches or similar items
  const matchFilter =
    reportData.reportType === "LOST"
      ? { lostReportId: id, finalScore: { $gte: 0.3 } }
      : { foundReportId: id, finalScore: { $gte: 0.3 } };

  const matches = await Match.find(matchFilter)
    .sort({ finalScore: -1 })
    .limit(3)
    .populate({
      path: reportData.reportType === "LOST" ? "foundReportId" : "lostReportId",
      select: "itemName category images state city lostFoundDate status reportType",
    })
    .lean();

  // If no high-score matches, get 3 latest complementary reports in the same category
  let similarReports: any[] = [];
  if (matches.length === 0) {
    const complementaryType = reportData.reportType === "LOST" ? "FOUND" : "LOST";
    similarReports = await ItemReport.find({
      reportType: complementaryType,
      category: reportData.category,
      moderationStatus: "approved",
      _id: { $ne: id },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* BREADCRUMB NAVIGATION */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-xs font-medium text-neutral-500 sm:text-sm">
          <li>
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="h-4 w-4 text-neutral-400" />
          <li>
            <Link href="/search" className="hover:text-primary-600 transition-colors">
              Search
            </Link>
          </li>
          <ChevronRight className="h-4 w-4 text-neutral-400" />
          <li>
            <Link
              href={`/search?type=${reportData.reportType}`}
              className="hover:text-primary-600 transition-colors"
            >
              {reportData.reportType === "LOST" ? "Lost Items" : "Found Items"}
            </Link>
          </li>
          <ChevronRight className="h-4 w-4 text-neutral-400" />
          <li className="truncate font-semibold text-neutral-900 dark:text-neutral-100 max-w-[200px] sm:max-w-xs">
            {reportData.itemName}
          </li>
        </ol>
      </nav>

      {/* TOP HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b pb-6 dark:border-neutral-800 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={reportData.reportType} />
            <StatusBadge status={reportData.status} />
            <span className="text-xs font-semibold text-neutral-400">
              Reported on {formatDate(reportData.createdAt)}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
            {reportData.itemName}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-xs text-neutral-500 sm:text-sm">
            <Eye className="h-4 w-4 text-neutral-400" />
            <span>{reportData.views || 1} views</span>
            <span>•</span>
            <span>Report ID: {reportData._id.slice(-8).toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* LEFT COLUMN: IMAGES + DETAILS (7 cols) */}
        <div className="space-y-8 lg:col-span-7">
          {/* Gallery + Share/Claim Client Component */}
          <ReportDetailClient
            id={reportData._id}
            itemName={reportData.itemName}
            reportType={reportData.reportType}
            images={reportData.images || []}
            isOwner={isOwner}
          />

          {/* ITEM DESCRIPTION */}
          <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Detailed Description
            </h2>
            <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 sm:text-base">
              {reportData.description}
            </div>

            {reportData.distinctiveFeatures && (
              <div className="mt-6 rounded-2xl bg-amber-50/70 p-4 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/40">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Distinctive Marks &amp; Features
                </h3>
                <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-200">
                  {reportData.distinctiveFeatures}
                </p>
              </div>
            )}

            {reportData.additionalInfo && (
              <div className="mt-4 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Additional Context
                </h3>
                <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                  {reportData.additionalInfo}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ATTRIBUTES & SAFE CONTACT (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* KEY ATTRIBUTES CARD */}
          <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Item Specifics
            </h2>

            <dl className="mt-6 divide-y divide-neutral-100 dark:divide-neutral-800">
              {/* Category */}
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                  <Tag className="h-4 w-4" /> Category
                </dt>
                <dd className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {reportData.category}
                </dd>
              </div>

              {/* Subcategory */}
              {reportData.subcategory && (
                <div className="flex items-center justify-between py-3">
                  <dt className="text-xs font-semibold text-neutral-500">Subcategory</dt>
                  <dd className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {reportData.subcategory}
                  </dd>
                </div>
              )}

              {/* Brand */}
              {reportData.brand && (
                <div className="flex items-center justify-between py-3">
                  <dt className="text-xs font-semibold text-neutral-500">Brand</dt>
                  <dd className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {reportData.brand}
                  </dd>
                </div>
              )}

              {/* Color */}
              {reportData.color && reportData.color.length > 0 && (
                <div className="flex items-center justify-between py-3">
                  <dt className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                    <Palette className="h-4 w-4" /> Color
                  </dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {reportData.color.map((c: string, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                      >
                        {c}
                      </span>
                    ))}
                  </dd>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                  <Calendar className="h-4 w-4" />{" "}
                  {reportData.reportType === "LOST" ? "Date Lost" : "Date Found"}
                </dt>
                <dd className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {formatDate(reportData.lostFoundDate)}
                </dd>
              </div>

              {/* Time */}
              {reportData.lostFoundTime && (
                <div className="flex items-center justify-between py-3">
                  <dt className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                    <Clock className="h-4 w-4" /> Approx. Time
                  </dt>
                  <dd className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {reportData.lostFoundTime}
                  </dd>
                </div>
              )}

              {/* Location */}
              <div className="py-3">
                <dt className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                  <MapPin className="h-4 w-4" /> Location
                </dt>
                <dd className="mt-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {reportData.locality ? `${reportData.locality}, ` : ""}
                  {reportData.city}, {reportData.state}
                </dd>
              </div>
            </dl>
          </div>

          {/* CONTACT & SECURITY SECTION (shows "Contact via platform" ONLY) */}
          <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
            <div className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-neutral-100">
              <ShieldCheck className="h-5 w-5 text-primary-600" />
              <span>Verified Platform Contact</span>
            </div>

            <div className="mt-4 rounded-2xl bg-blue-50/80 p-4 border border-blue-200/60 dark:bg-blue-950/20 dark:border-blue-900/40">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary-900 dark:text-primary-300">
                    Privacy Protection Guaranteed
                  </h4>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Personal phone numbers and email addresses are never displayed publicly. All inquiries
                    are mediated through platform claims to protect citizen safety.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                <MessageSquare className="h-4 w-4 text-neutral-400" />
                <span>Reporter: {reportData.userId?.name || "Verified Citizen"}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                <Info className="h-4 w-4 text-neutral-400" />
                <span>Preferred Language: {reportData.userId?.preferredLanguage === "hi" ? "Hindi" : "English"}</span>
              </div>
            </div>

            {/* Direct Claim CTA */}
            <div className="mt-6 border-t pt-4 dark:border-neutral-800">
              <Link href={reportData.reportType === "FOUND" ? "/report/lost" : "/report/found"}>
                <button className="w-full rounded-xl bg-primary-600 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-primary-700">
                  {reportData.reportType === "FOUND"
                    ? "Claim Ownership of This Item"
                    : "I Have Found This Item"}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI MATCHES / SIMILAR REPORTS SECTION */}
      <section className="mt-16 border-t pt-12 dark:border-neutral-800">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-700 dark:bg-purple-950/50 dark:text-purple-400">
              <Sparkles className="h-3.5 w-3.5" />
              AI Matching Engine
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              {matches.length > 0 ? "Potential AI Matches Found" : "Related Listings in This Category"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {matches.length > 0
                ? "The algorithm identified correlated listings based on text, category, and date proximity."
                : "No high-confidence AI matches yet. Here are other items reported in the same category."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matches.length > 0
            ? matches.map((m: any) => {
                const target =
                  reportData.reportType === "LOST" ? m.foundReportId : m.lostReportId;
                if (!target) return null;
                return (
                  <ReportCard
                    key={String(target._id)}
                    id={String(target._id)}
                    reportType={target.reportType}
                    itemName={target.itemName}
                    category={target.category}
                    imageUrl={target.images?.[0]?.url || null}
                    state={target.state}
                    city={target.city}
                    date={target.lostFoundDate ? new Date(target.lostFoundDate).toISOString() : ""}
                    matchCount={Math.round((m.finalScore || 0) * 100)}
                  />
                );
              })
            : similarReports.map((sim: any) => (
                <ReportCard
                  key={String(sim._id)}
                  id={String(sim._id)}
                  reportType={sim.reportType}
                  itemName={sim.itemName}
                  category={sim.category}
                  imageUrl={sim.images?.[0]?.url || null}
                  state={sim.state}
                  city={sim.city}
                  date={sim.lostFoundDate ? new Date(sim.lostFoundDate).toISOString() : ""}
                />
              ))}
        </div>
      </section>
    </div>
  );
}
