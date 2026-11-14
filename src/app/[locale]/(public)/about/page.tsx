import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Database,
  MapPin,
  Lock,
  Globe2,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  Github,
  Mail,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "About FoundIt | Pan-India Lost & Found AI Platform",
  description:
    "Learn how FoundIt leverages multi-modal AI embeddings and civic collaboration to reunite citizens with lost belongings across India.",
};

export default function AboutPage() {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <Badge variant="match" withDot className="px-3.5 py-1 text-xs">
          Civic Tech Initiative • India
        </Badge>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 max-w-3xl mx-auto">
          Reuniting Lost Belongings with the Power of{" "}
          <span className="text-primary-600 dark:text-primary-400">AI</span>.
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
          FoundIt is India&apos;s unified Lost & Found civic platform. By combining
          advanced artificial intelligence with citizen trust, we turn the chaos of
          lost items into seamless reunions across all 36 States and Union Territories.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link href="/report/lost">
            <Button variant="primary" size="lg">
              Report a Lost Item
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="lg">
              Search Database
            </Button>
          </Link>
        </div>
      </section>

      {/* Problem We Solve */}
      <section className="bg-neutral-100/60 dark:bg-neutral-900/40 py-16 border-y border-neutral-200/80 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="font-heading text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              The Problem We Solve in India
            </h2>
            <p className="text-sm text-neutral-500">
              Every day, tens of thousands of wallets, phones, documents, bags, and keys are misplaced across Indian transit systems, colleges, markets, and public spaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center space-y-3">
              <div className="font-heading text-4xl font-extrabold text-primary-600 dark:text-primary-400">
                10M+
              </div>
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">
                Items Misplaced Annually
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Items lost on trains, metro stations, cabs, airports, and universities across Indian metros and tier-2 cities.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-3">
              <div className="font-heading text-4xl font-extrabold text-amber-600 dark:text-amber-400">
                \u003c 15%
              </div>
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">
                Historical Recovery Rate
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Prior to unified platforms, fragmented lost property desks and disparate notice boards left most items unclaimed.
              </p>
            </Card>

            <Card className="p-6 text-center space-y-3">
              <div className="font-heading text-4xl font-extrabold text-secondary-600 dark:text-secondary-400">
                36
              </div>
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">
                States & UTs Unified
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                A single standardized platform bridging local transit authorities, citizens, universities, and police stations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How AI Matching Works — Visual Step Diagram (Pure CSS) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <Badge variant="match" withDot className="px-3 py-0.5 text-xs">
            Intelligent Pipeline
          </Badge>
          <h2 className="font-heading text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            How Our AI Matching Works
          </h2>
          <p className="text-sm text-neutral-500">
            A hybrid multi-signal ranking algorithm combining text embeddings, visual similarity, spatio-temporal radius, and metadata attributes.
          </p>
        </div>

        {/* Step Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="relative rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold mb-4">
              01
            </div>
            <h4 className="font-heading font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Citizen Reporting
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Users describe their lost or found item, upload photos, and pin date, time, and location.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold mb-4">
              02
            </div>
            <h4 className="font-heading font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Semantic Vectorization
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Natural language text and image descriptions are converted into dense vector embeddings.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold mb-4">
              03
            </div>
            <h4 className="font-heading font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Multi-Signal Scoring
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Cosine similarity, Haversine geo-distance, date proximity, and category attributes compute a weighted match score.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold mb-4">
              04
            </div>
            <h4 className="font-heading font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Secure Claim & Verification
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Both parties receive alerts. Owners submit distinctive private proof verified before handoff.
            </p>
          </div>
        </div>

        {/* Weights Breakdown Card */}
        <div className="mt-8 rounded-2xl bg-primary-50/60 p-6 border border-primary-200/70 dark:bg-primary-950/30 dark:border-primary-900/50">
          <h4 className="font-heading text-sm font-bold text-primary-900 dark:text-primary-200 mb-3 text-center sm:text-left">
            Algorithmic Weight Distribution
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="rounded-xl bg-white p-3 dark:bg-neutral-900 border border-primary-100 dark:border-primary-900/40">
              <span className="font-bold text-primary-700 dark:text-primary-300 block text-base">35%</span>
              <span className="text-neutral-500">Text Similarity</span>
            </div>
            <div className="rounded-xl bg-white p-3 dark:bg-neutral-900 border border-primary-100 dark:border-primary-900/40">
              <span className="font-bold text-primary-700 dark:text-primary-300 block text-base">20%</span>
              <span className="text-neutral-500">Visual Similarity</span>
            </div>
            <div className="rounded-xl bg-white p-3 dark:bg-neutral-900 border border-primary-100 dark:border-primary-900/40">
              <span className="font-bold text-primary-700 dark:text-primary-300 block text-base">20%</span>
              <span className="text-neutral-500">Attributes Match</span>
            </div>
            <div className="rounded-xl bg-white p-3 dark:bg-neutral-900 border border-primary-100 dark:border-primary-900/40">
              <span className="font-bold text-primary-700 dark:text-primary-300 block text-base">15%</span>
              <span className="text-neutral-500">Geo Location</span>
            </div>
            <div className="rounded-xl bg-white p-3 dark:bg-neutral-900 border border-primary-100 dark:border-primary-900/40">
              <span className="font-bold text-primary-700 dark:text-primary-300 block text-base">10%</span>
              <span className="text-neutral-500">Date Proximity</span>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="bg-neutral-50 dark:bg-neutral-900/30 py-16 border-y border-neutral-200/80 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="font-heading text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Our Core Technology Stack
            </h2>
            <p className="text-sm text-neutral-500">
              Built on battle-tested, high-performance open-source cloud architectures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Next.js 15 App Router</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Server Components, Edge API routes, streaming Suspense, and dynamic route interception.
                </p>
              </div>
            </Card>

            <Card className="p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">MongoDB & Geospatial</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  2dsphere indexing for Haversine geospatial radius lookups across all Indian states.
                </p>
              </div>
            </Card>

            <Card className="p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">AI Vector Embeddings</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Multi-modal semantic scoring with lexical fallback for fast, accurate item matching.
                </p>
              </div>
            </Card>

            <Card className="p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">NextAuth & Cloudinary</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Secure credentials session handling, RBAC moderation, and optimized CDN media storage.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy & Security Commitment */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 sm:p-12 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <Lock className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Citizen Privacy by Design
              </span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Guarding Your Data & Protecting Citizens
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              We never publicly publish private claimant proofs, serial numbers, phone numbers, or residential addresses. All contact occurs through platform-mediated verified notifications. Any fraudulent claims are flagged by automated fraud checks and handled by vetted moderators.
            </p>
          </div>
        </div>
      </section>

      {/* Institutional Info & Contact */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-base">Institution & Research</h4>
                <p className="text-xs text-neutral-500">Academic & Civic Innovation Project</p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Designed as a comprehensive Final Year Engineering / Public Welfare System exploring AI vector matching architectures and modern Next.js 15 enterprise patterns.
            </p>
            <div className="pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                <Github className="h-4 w-4" /> View Open Source Repository
              </a>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-base">Civic Support & Contact</h4>
                <p className="text-xs text-neutral-500">Inquiries, partnerships & feedback</p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Need assistance or want to partner your local municipal or transit agency with FoundIt? Reach out to our community operations team.
            </p>
            <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              Email: <span className="text-primary-600 dark:text-primary-400">support@foundit.gov.in</span>
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
