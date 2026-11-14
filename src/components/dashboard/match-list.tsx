import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MatchSummaryItem {
  _id: string;
  finalScore: number;
  confidenceLevel: "high" | "medium" | "low" | string;
  matchReasons?: string[];
  lostReportId?: {
    _id?: string;
    itemName?: string;
    category?: string;
  };
  foundReportId?: {
    _id?: string;
    itemName?: string;
    category?: string;
  };
}

export interface MatchListProps {
  matches?: MatchSummaryItem[];
  className?: string;
}

export function MatchList({
  matches = [],
  className = "",
}: MatchListProps) {
  const topMatches = matches.slice(0, 3);

  return (
    <div className={`overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 p-5 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              AI Matches
            </h3>
            <p className="text-xs text-neutral-500">Correlated listings detected by AI</p>
          </div>
        </div>
        <Link href="/dashboard/matches">
          <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <span>View All Matches</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Content */}
      {topMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
          <Sparkles className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <p className="mt-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No matches found yet
          </p>
          <p className="mt-1 text-xs text-neutral-400 max-w-xs">
            Our AI continuously scans incoming reports across India and will alert you as soon as a potential match occurs.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {topMatches.map((match) => {
            const scorePercent = Math.round(
              (match.finalScore <= 1 ? match.finalScore * 100 : match.finalScore) || 0
            );

            const lostName = match.lostReportId?.itemName || "Lost Item";
            const foundName = match.foundReportId?.itemName || "Found Item";

            return (
              <div
                key={match._id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Match score badge */}
                  <div
                    className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl font-black ${
                      scorePercent >= 75
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : scorePercent >= 50
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    }`}
                  >
                    <span className="text-base leading-none">{scorePercent}%</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-80">Match</span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {lostName} <span className="font-normal text-neutral-400">↔</span> {foundName}
                    </h4>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Confidence:{" "}
                      <span className="font-semibold capitalize text-neutral-700 dark:text-neutral-300">
                        {match.confidenceLevel || "Medium"}
                      </span>
                      {match.matchReasons && match.matchReasons.length > 0 && (
                        <span> • {match.matchReasons[0]}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* View CTA */}
                <Link href={`/dashboard/matches`}>
                  <Button variant="outline" size="sm" className="h-8 gap-1 px-3 text-xs">
                    <span>View</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MatchList;
