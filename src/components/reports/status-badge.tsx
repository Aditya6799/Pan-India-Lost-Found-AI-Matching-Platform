import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ReportStatusType =
  | "LOST"
  | "FOUND"
  | "active"
  | "recovered"
  | "closed"
  | "pending"
  | "approved"
  | "rejected"
  | "under_review"
  | "resolved";

export interface StatusBadgeProps {
  status: ReportStatusType | string;
  size?: "sm" | "md" | "lg" | string;
  className?: string;
  withDot?: boolean;
}

export function StatusBadge({
  status,
  size = "md",
  className,
  withDot = true,
}: StatusBadgeProps) {
  const normalized = status?.toUpperCase() || "";

  let variant: BadgeProps["variant"] = "default";
  let label = status;

  switch (normalized) {
    case "LOST":
      variant = "lost";
      label = "LOST";
      break;
    case "FOUND":
      variant = "found";
      label = "FOUND";
      break;
    case "ACTIVE":
      variant = "match";
      label = "Active";
      break;
    case "RECOVERED":
    case "RESOLVED":
    case "APPROVED":
      variant = "approved";
      label = normalized === "APPROVED" ? "Approved" : "Recovered";
      break;
    case "CLOSED":
    case "REJECTED":
      variant = "rejected";
      label = normalized === "REJECTED" ? "Rejected" : "Closed";
      break;
    case "PENDING":
    case "UNDER_REVIEW":
      variant = "pending";
      label = normalized === "UNDER_REVIEW" ? "Under Review" : "Pending";
      break;
    default:
      variant = "default";
      label = status;
  }

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.2",
    md: "text-[11px] px-2.5 py-0.5",
    lg: "text-xs px-3 py-1",
  }[size] || "text-[11px] px-2.5 py-0.5";

  return (
    <Badge
      variant={variant}
      withDot={withDot}
      className={cn("uppercase font-bold tracking-wider", sizeClasses, className)}
    >
      {label}
    </Badge>
  );
}

export default StatusBadge;
