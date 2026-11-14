"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Share2,
  Flag,
  Check,
  Package,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface ImageItem {
  url: string;
  publicId: string;
}

interface ReportDetailClientProps {
  id: string;
  itemName: string;
  reportType: "LOST" | "FOUND";
  images: ImageItem[];
  isOwner: boolean;
}

export function ReportDetailClient({
  id,
  itemName,
  reportType,
  images,
  isOwner,
}: ReportDetailClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagReason.trim()) return;
    setFlagSubmitted(true);
    setTimeout(() => {
      setIsFlagModalOpen(false);
      setFlagSubmitted(false);
      setFlagReason("");
    }, 1500);
  };

  const hasImages = images && images.length > 0;

  return (
    <div className="flex flex-col space-y-6">
      {/* PHOTO GALLERY */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {hasImages ? (
            <Image
              src={images[activeImageIndex]?.url}
              alt={itemName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-neutral-400">
              <Package className="h-16 w-16 stroke-[1.5]" />
              <span className="mt-2 text-sm font-medium">No photos provided by reporter</span>
            </div>
          )}

          {/* Navigation Arrows for multiple photos */}
          {hasImages && images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/75"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/75"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail selector */}
        {hasImages && images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-4 border-t border-neutral-100 dark:border-neutral-800">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  activeImageIndex === idx
                    ? "border-primary-600 ring-2 ring-primary-500/30"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ACTION BAR: SHARE & FLAG */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            <span>{copied ? "Link Copied!" : "Share Report"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFlagModalOpen(true)}
            className="gap-1.5 text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
          >
            <Flag className="h-4 w-4" />
            <span>Report / Flag</span>
          </Button>
        </div>

        {/* Primary Action Button (Claim or Edit) */}
        {isOwner ? (
          <Link href={`/dashboard/reports`}>
            <Button variant="outline" size="sm">
              Manage in Dashboard
            </Button>
          </Link>
        ) : reportType === "FOUND" ? (
          <Link href={`/report/lost`}>
            <Button variant="primary" size="sm" className="gap-1.5 shadow-md">
              <span>This Belongs to Me (Claim)</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href={`/report/found`}>
            <Button variant="secondary" size="sm" className="gap-1.5 shadow-md">
              <span>I Found This Item</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* FLAG REPORT MODAL */}
      <Modal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        title="Report Inappropriate or Suspicious Listing"
        description="Our safety team reviews flagged listings within 2 hours. Help us keep KhojSetu secure."
      >
        {flagSubmitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-base font-bold text-neutral-900 dark:text-neutral-100">
              Report Submitted
            </h4>
            <p className="mt-1 text-xs text-neutral-500">
              Thank you for keeping our community safe. Our moderation team has been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFlagSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Reason for Flagging
              </label>
              <textarea
                rows={4}
                required
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Explain why this listing should be reviewed (e.g. fraudulent claim, spam, inappropriate images, duplicate)..."
                className="mt-1.5 w-full rounded-xl border border-neutral-300 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFlagModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" size="sm" className="gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
