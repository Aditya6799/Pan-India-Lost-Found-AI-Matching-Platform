"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  Palette,
  ShieldCheck,
  Share2,
  Check,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Lock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { ImageGallery } from "./image-gallery";
import { Button } from "@/components/ui/button";

export interface ReportDetailData {
  _id: string;
  reportType: "LOST" | "FOUND";
  itemName: string;
  category: string;
  subcategory?: string;
  description: string;
  brand?: string;
  color?: string[];
  distinctiveFeatures?: string;
  images?: Array<{ url: string; publicId: string }>;
  state: string;
  city: string;
  locality?: string;
  lostFoundDate: string | Date;
  lostFoundTime?: string;
  status: string;
  moderationStatus?: string;
  views?: number;
  additionalInfo?: string;
  userId?: {
    _id?: string;
    name?: string;
    preferredLanguage?: string;
  };
}

export interface ReportDetailProps {
  report: ReportDetailData;
  isModal?: boolean;
  className?: string;
}

export function ReportDetail({
  report,
  isModal = false,
  className = "",
}: ReportDetailProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/reports/${report._id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className={`flex flex-col space-y-6 ${className}`}>
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-3 border-b pb-4 dark:border-neutral-800 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.reportType} />
            <StatusBadge status={report.status} />
            {report.moderationStatus && (
              <StatusBadge status={report.moderationStatus} />
            )}
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            {report.itemName}
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Listed on {formatDate(report.lostFoundDate)} in {report.city}, {report.state}
          </p>
        </div>

        {/* Share Button */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            <span>{copied ? "Link Copied" : "Share"}</span>
          </Button>

          {isModal && (
            <Link href={`/reports/${report._id}`}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <span>Full Page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* GALLERY */}
        <div className="lg:col-span-7">
          <ImageGallery images={report.images || []} itemName={report.itemName} />

          {/* Description */}
          <div className="mt-6 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Description
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {report.description}
            </p>

            {report.distinctiveFeatures && (
              <div className="mt-4 rounded-xl bg-amber-50 p-3.5 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/40">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Distinctive Features
                </h4>
                <p className="mt-1 text-xs text-neutral-800 dark:text-neutral-200">
                  {report.distinctiveFeatures}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ATTRIBUTES & SAFE CONTACT */}
        <div className="space-y-5 lg:col-span-5">
          {/* Details list */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Item Details
            </h3>

            <dl className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
              <div className="flex items-center justify-between py-2.5">
                <dt className="flex items-center gap-2 text-xs text-neutral-500">
                  <Tag className="h-4 w-4" /> Category
                </dt>
                <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {report.category}
                </dd>
              </div>

              {report.brand && (
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-xs text-neutral-500">Brand</dt>
                  <dd className="font-medium text-neutral-800 dark:text-neutral-200">
                    {report.brand}
                  </dd>
                </div>
              )}

              {report.color && report.color.length > 0 && (
                <div className="flex items-center justify-between py-2.5">
                  <dt className="flex items-center gap-2 text-xs text-neutral-500">
                    <Palette className="h-4 w-4" /> Color
                  </dt>
                  <dd className="flex flex-wrap gap-1">
                    {report.color.map((c, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold dark:bg-neutral-800"
                      >
                        {c}
                      </span>
                    ))}
                  </dd>
                </div>
              )}

              <div className="flex items-center justify-between py-2.5">
                <dt className="flex items-center gap-2 text-xs text-neutral-500">
                  <Calendar className="h-4 w-4" />{" "}
                  {report.reportType === "LOST" ? "Date Lost" : "Date Found"}
                </dt>
                <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatDate(report.lostFoundDate)}
                </dd>
              </div>

              {report.lostFoundTime && (
                <div className="flex items-center justify-between py-2.5">
                  <dt className="flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="h-4 w-4" /> Time
                  </dt>
                  <dd className="font-medium text-neutral-800 dark:text-neutral-200">
                    {report.lostFoundTime}
                  </dd>
                </div>
              )}

              <div className="py-2.5">
                <dt className="flex items-center gap-2 text-xs text-neutral-500">
                  <MapPin className="h-4 w-4" /> Location
                </dt>
                <dd className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
                  {report.locality ? `${report.locality}, ` : ""}
                  {report.city}, {report.state}
                </dd>
              </div>
            </dl>
          </div>

          {/* Secure Platform Contact */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Contact via Platform Only</span>
            </div>

            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-blue-50/70 p-3 text-xs text-neutral-600 dark:bg-blue-950/20 dark:text-neutral-400">
              <Lock className="h-4 w-4 shrink-0 text-primary-600 mt-0.5" />
              <span>
                To safeguard citizens against phishing and harassment, personal contact information is never disclosed publicly.
              </span>
            </div>

            <div className="mt-4">
              <Link href={report.reportType === "FOUND" ? "/report/lost" : "/report/found"}>
                <Button variant="primary" size="md" className="w-full gap-2 font-bold shadow-md">
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    {report.reportType === "FOUND" ? "File Claim for This Item" : "Report Matched Item"}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportDetail;
