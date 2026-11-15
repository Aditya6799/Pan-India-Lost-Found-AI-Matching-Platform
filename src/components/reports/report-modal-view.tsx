"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, ExternalLink, Package } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export interface ReportModalData {
  id: string;
  itemName: string;
  description: string;
  reportType: "LOST" | "FOUND";
  category: string;
  imageUrl?: string | null;
  state: string;
  city: string;
  locality?: string;
  date: string | Date;
}

export function ReportModalView({ report }: { report: ReportModalData }) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [isOpen, setIsOpen] = React.useState(true);

  const fullDetailUrl = `/${locale}/reports/${report.id}`;

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <StatusBadge status={report.reportType} />
          <span className="truncate">{report.itemName}</span>
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between">
          <a
            href={fullDetailUrl}
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                setIsOpen(false);
                window.location.href = fullDetailUrl;
              }
            }}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Open Full Detail Page <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Thumbnail Banner */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
          {report.imageUrl ? (
            <Image
              src={report.imageUrl}
              alt={report.itemName}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600">
              <Package className="h-16 w-16" />
            </div>
          )}
        </div>

        {/* Metadata info */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {report.locality ? `${report.locality}, ` : ""}
              {report.city}, {report.state}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(report.date, "MMM dd, yyyy")}</span>
          </div>
        </div>

        <div>
          <Badge variant="default" className="mb-2">
            {report.category}
          </Badge>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
            {report.description}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default ReportModalView;
