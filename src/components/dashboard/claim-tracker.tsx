import * as React from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Clock,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type ClaimStage = "pending" | "under_review" | "approved" | "rejected" | "resolved";

export interface ClaimTrackerProps {
  currentStatus: ClaimStage;
  submittedAt?: string | Date;
  reviewedAt?: string | Date;
  resolvedAt?: string | Date;
  adminRemarks?: string;
  className?: string;
}

interface StepDefinition {
  key: ClaimStage;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const standardSteps: StepDefinition[] = [
  {
    key: "pending",
    title: "Claim Submitted",
    description: "Claim details and private proof submitted for moderation.",
    icon: FileText,
  },
  {
    key: "under_review",
    title: "Under Review",
    description: "Moderators verifying distinctive marks against the found item.",
    icon: Search,
  },
  {
    key: "approved",
    title: "Claim Approved",
    description: "Ownership confirmed. Secure contact initiated between parties.",
    icon: CheckCircle2,
  },
  {
    key: "resolved",
    title: "Item Returned / Resolved",
    description: "Physical exchange completed safely. Case archived.",
    icon: PackageCheck,
  },
];

export function ClaimTracker({
  currentStatus,
  submittedAt,
  reviewedAt,
  resolvedAt,
  adminRemarks,
  className,
}: ClaimTrackerProps) {
  const isRejected = currentStatus === "rejected";

  const getStepStatus = (index: number) => {
    if (isRejected) {
      if (index === 0) return "completed";
      if (index === 1) return "rejected";
      return "upcoming";
    }

    const order: Record<ClaimStage, number> = {
      pending: 0,
      under_review: 1,
      approved: 2,
      resolved: 3,
      rejected: 1,
    };

    const currentOrder = order[currentStatus] ?? 0;
    if (index < currentOrder) return "completed";
    if (index === currentOrder) return "current";
    return "upcoming";
  };

  const getTimestamp = (index: number) => {
    switch (index) {
      case 0:
        return submittedAt ? formatDate(submittedAt, "MMM dd, yyyy • h:mm a") : undefined;
      case 1:
      case 2:
        return reviewedAt ? formatDate(reviewedAt, "MMM dd, yyyy • h:mm a") : undefined;
      case 3:
        return resolvedAt ? formatDate(resolvedAt, "MMM dd, yyyy • h:mm a") : undefined;
      default:
        return undefined;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
        {standardSteps.map((step, idx) => {
          const stepStatus = getStepStatus(idx);
          const timestamp = getTimestamp(idx);
          const Icon = isRejected && idx === 1 ? XCircle : step.icon;

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Step Marker Dot */}
              <div
                className={cn(
                  "absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full text-white ring-4 ring-white dark:ring-neutral-900 transition-colors shrink-0",
                  stepStatus === "completed" && "bg-emerald-600",
                  stepStatus === "current" && "bg-primary-600 animate-pulse",
                  stepStatus === "rejected" && "bg-red-600",
                  stepStatus === "upcoming" && "bg-neutral-300 dark:bg-neutral-700 text-neutral-500"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4
                    className={cn(
                      "font-semibold text-sm",
                      stepStatus === "current" && "text-primary-600 dark:text-primary-400 font-bold",
                      stepStatus === "rejected" && "text-red-600 dark:text-red-400 font-bold",
                      stepStatus === "completed" && "text-neutral-900 dark:text-neutral-100",
                      stepStatus === "upcoming" && "text-neutral-400 dark:text-neutral-500"
                    )}
                  >
                    {isRejected && idx === 1 ? "Claim Rejected" : step.title}
                  </h4>

                  {timestamp && (
                    <span className="text-xs text-neutral-400 inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timestamp}
                    </span>
                  )}
                </div>

                <p
                  className={cn(
                    "mt-1 text-xs leading-relaxed",
                    stepStatus === "upcoming"
                      ? "text-neutral-400 dark:text-neutral-600"
                      : "text-neutral-600 dark:text-neutral-400"
                  )}
                >
                  {isRejected && idx === 1
                    ? adminRemarks || "Verification was rejected due to insufficient or unverified proofs."
                    : step.description}
                </p>

                {stepStatus === "current" && (
                  <Badge variant="match" withDot className="mt-2 text-[10px] py-0 px-2">
                    In Progress
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {adminRemarks && !isRejected && (
        <div className="rounded-xl bg-neutral-50 p-3.5 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
          <span className="font-semibold block text-neutral-800 dark:text-neutral-200 mb-0.5">
            Moderator Notes:
          </span>
          {adminRemarks}
        </div>
      )}
    </div>
  );
}

export default ClaimTracker;
