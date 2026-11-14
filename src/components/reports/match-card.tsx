"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Package,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ReportSummary {
  id: string;
  itemName: string;
  imageUrl?: string | null;
  state: string;
  city: string;
  date: string | Date;
}

export interface MatchCardProps {
  matchId?: string;
  lostReport: ReportSummary;
  foundReport: ReportSummary;
  score: number; // 0 to 1 OR 0 to 100
  provider?: "semantic" | "lexical" | "hybrid" | string;
  matchReasons?: string[];
  status?: string;
  onViewDetails?: () => void;
  onSubmitClaim?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function MatchCard({
  matchId,
  lostReport,
  foundReport,
  score,
  provider = "semantic",
  matchReasons = [],
  status,
  onViewDetails,
  onSubmitClaim,
  onDismiss,
  className,
}: MatchCardProps) {
  // Normalize percentage 0-100
  const percentage = Math.round(score <= 1 ? score * 100 : score);

  // Confidence color
  let scoreColorClass = "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400";
  if (percentage >= 75) {
    scoreColorClass = "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400";
  } else if (percentage >= 50) {
    scoreColorClass = "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400";
  }

  const isAIMatch = provider === "semantic" || provider === "hybrid";

  return (
    <Card
      className={cn(
        "overflow-hidden border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-all hover:shadow-md",
        className
      )}
    >
      {/* Top Bar: Provider + Percentage Match */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Badge
            variant={isAIMatch ? "match" : "default"}
            withDot
            className="py-1 px-3 text-xs font-semibold"
          >
            {isAIMatch ? (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI Semantic Match
              </span>
            ) : (
              "Keyword Match"
            )}
          </Badge>

          <span
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-help"
            title={
              isAIMatch
                ? "Scored using multi-modal AI embeddings comparing visual, descriptive, and spatio-temporal features."
                : "Scored using lexical keyword token matching across item descriptions."
            }
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Big Match Confidence Indicator */}
        <div
          className={cn(
            "flex items-baseline gap-1 rounded-xl border px-3 py-1 font-heading font-extrabold shadow-2xs",
            scoreColorClass
          )}
        >
          <span className="text-xl sm:text-2xl">{percentage}%</span>
          <span className="text-xs uppercase font-medium tracking-wide">
            Match
          </span>
        </div>
      </div>

      {/* Side-by-side Report Comparison */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Lost Item Column */}
        <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
            {lostReport.imageUrl ? (
              <Image
                src={lostReport.imageUrl}
                alt={lostReport.itemName}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-400">
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Lost Report
            </span>
            <h5 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
              {lostReport.itemName}
            </h5>
            <p className="text-xs text-neutral-500 truncate">
              {lostReport.city}, {lostReport.state} • {formatDate(lostReport.date, "MMM d")}
            </p>
          </div>
        </div>

        {/* Found Item Column */}
        <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
            {foundReport.imageUrl ? (
              <Image
                src={foundReport.imageUrl}
                alt={foundReport.itemName}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-400">
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Found Report
            </span>
            <h5 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
              {foundReport.itemName}
            </h5>
            <p className="text-xs text-neutral-500 truncate">
              {foundReport.city}, {foundReport.state} • {formatDate(foundReport.date, "MMM d")}
            </p>
          </div>
        </div>
      </div>

      {/* Match Reasons Chips */}
      {matchReasons.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-neutral-500 mr-1">Match indicators:</span>
          {matchReasons.map((reason, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
            >
              {reason}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-neutral-500 hover:text-neutral-700"
          >
            Dismiss
          </Button>
        )}

        {onViewDetails ? (
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Comparison
          </Button>
        ) : (
          <Link href={`/reports/${foundReport.id}`}>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
            >
              View Report
            </Button>
          </Link>
        )}

        {onSubmitClaim ? (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<ShieldCheck className="h-4 w-4" />}
            onClick={onSubmitClaim}
          >
            Submit Claim
          </Button>
        ) : (
          <Link href={`/dashboard/claims?reportId=${foundReport.id}${matchId ? `&matchId=${matchId}` : ""}`}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ShieldCheck className="h-4 w-4" />}
            >
              Submit Claim
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}

export default MatchCard;
