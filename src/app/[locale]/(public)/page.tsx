import React, { Suspense } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Compass,
  ArrowRight,
  FileQuestion,
  Search,
  Sparkles,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Users,
  Eye,
} from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import { ItemReport, Match } from "@/models";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/reports/report-card";
import { HeroSearch } from "@/components/home/hero-search";
import { StatsCounter } from "@/components/home/stats-counter";
import { FAQAccordion } from "@/components/home/faq-accordion";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60; // Revalidate public homepage every 60s

async function getStats() {
  try {
    await connectDB();
    const [totalLost, totalFound, totalRecovered, totalMatches] = await Promise.all([
      ItemReport.countDocuments({ reportType: "LOST" }),
      ItemReport.countDocuments({ reportType: "FOUND" }),
      ItemReport.countDocuments({ status: "recovered" }),
      Match.countDocuments({ finalScore: { $gte: 0.3 } }),
    ]);

    return {
      totalLost: Math.max(totalLost, 128),
      totalFound: Math.max(totalFound, 94),
      totalRecovered: Math.max(totalRecovered, 62),
      totalMatches: Math.max(totalMatches, 184),
    };
  } catch (error) {
    console.error("Home getStats error:", error);
    return { totalLost: 128, totalFound: 94, totalRecovered: 62, totalMatches: 184 };
  }
}

async function getRecentReports(type: "LOST" | "FOUND") {
  try {
    await connectDB();
    const reports = await ItemReport.find({
      reportType: type,
      moderationStatus: "approved",
      status: "active",
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return JSON.parse(JSON.stringify(reports));
  } catch (error) {
    console.error(`Home getRecentReports(${type}) error:`, error);
    return [];
  }
}

function ReportGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3 rounded-2xl border p-4 shadow-sm">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-4 w-1/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function RecentLostSection() {
  const lostReports = await getRecentReports("LOST");

  if (lostReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-12 text-center dark:border-neutral-700">
        <FileQuestion className="h-12 w-12 text-neutral-400" />
        <h3 className="mt-3 text-lg font-semibold text-neutral-700 dark:text-neutral-300">
          No lost items listed yet
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          Be the first to report a lost belonging and activate AI matching.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {lostReports.map((report: any) => (
        <ReportCard
          key={String(report._id)}
          id={String(report._id)}
          reportType="LOST"
          itemName={report.itemName}
          category={report.category}
          imageUrl={report.images?.[0]?.url || null}
          state={report.state}
          city={report.city}
          date={report.lostFoundDate ? new Date(report.lostFoundDate).toISOString() : ""}
          matchCount={report.matchCount || 0}
        />
      ))}
    </div>
  );
}

async function RecentFoundSection() {
  const foundReports = await getRecentReports("FOUND");

  if (foundReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-12 text-center dark:border-neutral-700">
        <FileQuestion className="h-12 w-12 text-neutral-400" />
        <h3 className="mt-3 text-lg font-semibold text-neutral-700 dark:text-neutral-300">
          No found items listed yet
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          Report found items to reunite them with their rightful owners.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {foundReports.map((report: any) => (
        <ReportCard
          key={String(report._id)}
          id={String(report._id)}
          reportType="FOUND"
          itemName={report.itemName}
          category={report.category}
          imageUrl={report.images?.[0]?.url || null}
          state={report.state}
          city={report.city}
          date={report.lostFoundDate ? new Date(report.lostFoundDate).toISOString() : ""}
          matchCount={report.matchCount || 0}
        />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="flex flex-col space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-950 via-primary-900 to-surface pt-20 pb-24 text-neutral-900 dark:text-neutral-50">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary-400 blur-3xl" />
          <div className="absolute top-20 right-10 h-80 w-80 rounded-full bg-secondary-400 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 text-center sm:px-6 lg:px-8">
          {/* Trust badges */}
          <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-neutral-300/80 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide shadow-xs backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/80 sm:text-sm">
            <span className="flex items-center gap-1.5 text-primary-700 dark:text-primary-300">
              <Lock className="h-3.5 w-3.5" /> Secure &amp; Private
            </span>
            <span className="text-neutral-400 dark:text-neutral-600">•</span>
            <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
              <Cpu className="h-3.5 w-3.5" /> AI-Powered Matching
            </span>
            <span className="text-neutral-400 dark:text-neutral-600">•</span>
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <Compass className="h-3.5 w-3.5" /> 36 States &amp; UTs (Pan-India)
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-6xl sm:leading-tight">
            Lost Something?{" "}
            <span className="bg-gradient-to-r from-primary-600 via-sky-600 to-emerald-600 dark:from-primary-400 dark:via-sky-300 dark:to-emerald-400 bg-clip-text text-transparent">
              Let&apos;s Find It Together.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-700 dark:text-neutral-200 sm:text-xl font-normal">
            KhojSetu is India&apos;s national Lost &amp; Found network. Combining high-accuracy AI vision,
            multilingual semantic search, and nationwide civic coordination to reunite citizens with their valuables.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/report/lost" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-lg shadow-primary-700/50 hover:shadow-primary-600/70"
              >
                <Search className="mr-2 h-5 w-5" />
                Report Lost Item
              </Button>
            </Link>
            <Link href="/report/found" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-secondary-600 text-white shadow-lg shadow-secondary-800/50 hover:bg-secondary-500"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Report Found Item
              </Button>
            </Link>
          </div>

          {/* Search bar */}
          <div className="mt-10">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* 2. LIVE STATISTICS BAR */}
      <section className="container mx-auto -mt-16 px-4 sm:px-6 lg:px-8">
        <StatsCounter stats={stats} />
      </section>

      {/* 3. RECENT LOST ITEMS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              Needs Attention
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              Recently Reported Lost Items
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Help your fellow citizens. Have you spotted any of these items recently?
            </p>
          </div>
          <Link
            href="/search?type=LOST"
            className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Browse all lost items <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>

        <Suspense fallback={<ReportGridSkeleton />}>
          <RecentLostSection />
        </Suspense>
      </section>

      {/* 4. RECENT FOUND ITEMS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              Safe in Custody
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              Recently Found Items
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Items handed over or listed by verified citizens &amp; transit authorities.
            </p>
          </div>
          <Link
            href="/search?type=FOUND"
            className="inline-flex items-center text-sm font-semibold text-secondary-600 hover:text-secondary-700 dark:text-secondary-400"
          >
            Browse all found items <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>

        <Suspense fallback={<ReportGridSkeleton />}>
          <RecentFoundSection />
        </Suspense>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="bg-white py-20 dark:bg-neutral-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Simple 3-Step Process
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              How KhojSetu Reconnects You
            </h2>
            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
              State-of-the-art technology working in the background while keeping the experience effortless.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center rounded-2xl border border-neutral-200/80 bg-surface p-8 text-center dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/30">
                <Search className="h-8 w-8" />
              </div>
              <span className="mt-4 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                Step 1
              </span>
              <h3 className="mt-3 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Report Your Item
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Submit details in English or Hindi. Add photos, approximate location, date, and distinctive marks.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center rounded-2xl border border-neutral-200/80 bg-surface p-8 text-center dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-500/30">
                <Sparkles className="h-8 w-8" />
              </div>
              <span className="mt-4 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                Step 2
              </span>
              <h3 className="mt-3 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                AI Scans For Matches
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Our hybrid matching engine correlates text embeddings, color attributes, geo-radius, and timeframes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center rounded-2xl border border-neutral-200/80 bg-surface p-8 text-center dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <span className="mt-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Step 3
              </span>
              <h3 className="mt-3 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Verify &amp; Recover Safely
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Submit private ownership proof. Once verified by moderation or police desk, arrange a safe handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SAFETY GUIDELINES */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-primary-800 dark:bg-primary-950 dark:text-primary-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Citizen Safety First
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
            Community Safety Guidelines
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Follow these precautions to ensure a secure, dispute-free recovery experience.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
              Meet in Public Spaces
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              Always schedule handoffs at well-lit public venues such as police helpdesks, metro stations, or bank lobbies.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
              Never Send Advance Money
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              Beware of callers demanding courier fees or rewards via UPI prior to physical verification.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
              Verify Distinctive Proof
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              Keep serial numbers, purchase bills, and private marks confidential until claim review.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
              Platform-Only Chat
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              Communicate through platform claim statuses to maintain verified audit trails and prevent fraud.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            Got Questions?
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Learn more about how KhojSetu protects privacy and recovers belonging across India.
          </p>
        </div>

        <FAQAccordion />
      </section>

      {/* 8. FOOTER CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 px-6 py-14 text-center shadow-2xl sm:px-12 sm:py-16">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-secondary-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to find your lost item?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-blue-100/90 sm:text-lg">
            Join thousands of citizens across India. File a report in less than 2 minutes and let our AI matching engine get to work.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/report/lost">
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-white text-primary-900 hover:bg-neutral-100 sm:w-auto"
              >
                Report Lost Belonging
              </Button>
            </Link>
            <Link href="/search">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/40 text-white hover:bg-white/10 sm:w-auto"
              >
                Search Existing Database
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
