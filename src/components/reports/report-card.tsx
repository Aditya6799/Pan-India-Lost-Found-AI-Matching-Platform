"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Sparkles, Package } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";

export interface ReportCardProps {
  id: string;
  reportType: "LOST" | "FOUND";
  itemName: string;
  category: string;
  imageUrl?: string | null;
  state: string;
  city: string;
  date: string | Date;
  matchCount?: number;
  className?: string;
  hrefPrefix?: string;
}

export function ReportCard({
  id,
  reportType,
  itemName,
  category,
  imageUrl,
  state,
  city,
  date,
  matchCount = 0,
  className,
  hrefPrefix = "/reports",
}: ReportCardProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <Link href={`${hrefPrefix}/${id}`} className="group block h-full">
      <Card
        hover
        className={cn(
          "flex flex-col h-full overflow-hidden border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-300 group-hover:border-primary-300 dark:group-hover:border-primary-700 group-hover:shadow-lg",
          className
        )}
      >
        {/* Media Thumbnail Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={itemName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
              <Package className="h-12 w-12" />
            </div>
          )}

          {/* Badges Over Image */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            <StatusBadge status={reportType} />
            <Badge
              variant="default"
              className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-800 dark:text-neutral-200 shadow-xs"
            >
              {category}
            </Badge>
          </div>

          {/* Match Count Badge */}
          {matchCount > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm shadow-md animate-pulse">
                <Sparkles className="h-3 w-3" />
                {matchCount} {matchCount === 1 ? "match" : "matches"}
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col p-5">
          <h4 className="font-heading text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
            {itemName}
          </h4>

          <div className="mt-3 space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            {/* Location */}
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">
                {city}, {state}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span>{formatDate(date, "MMM dd, yyyy")}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default ReportCard;
