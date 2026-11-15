"use client";

import React from "react";
import { ReportCard, type ReportCardProps } from "./report-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ReportItem {
  _id: string;
  reportType: "LOST" | "FOUND";
  itemName: string;
  category: string;
  images?: Array<{ url: string; publicId: string }>;
  state: string;
  city: string;
  lostFoundDate: string | Date;
  matchCount?: number;
}

export interface ReportGridProps {
  reports?: ReportItem[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  className?: string;
}

export function ReportGrid({
  reports = [],
  isLoading = false,
  emptyTitle = "No reports found",
  emptyDescription = "There are no listings matching your current criteria.",
  onResetFilters,
  className = "",
}: ReportGridProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 rounded-2xl border border-neutral-200/80 p-4 shadow-sm dark:border-neutral-800">
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

  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white py-14 px-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          <PackageSearch className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {emptyTitle}
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
          {emptyDescription}
        </p>
        {onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-5">
            Reset Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {reports.map((report) => (
        <ReportCard
          key={String(report._id)}
          id={String(report._id)}
          reportType={report.reportType}
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

export default ReportGrid;
