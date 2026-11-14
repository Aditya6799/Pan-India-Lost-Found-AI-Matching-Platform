"use client";

import * as React from "react";
import { Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

export interface ModerationActionsProps {
  reportId: string;
  currentStatus?: string;
  onApprove: (reportId: string) => Promise<void> | void;
  onReject: (reportId: string, reason: string) => Promise<void> | void;
  className?: string;
}

export function ModerationActions({
  reportId,
  currentStatus,
  onApprove,
  onReject,
  className,
}: ModerationActionsProps) {
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(reportId);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    setIsRejecting(true);
    try {
      await onReject(reportId, rejectReason.trim());
      setRejectModalOpen(false);
      setRejectReason("");
    } finally {
      setIsRejecting(false);
    }
  };

  const isApproved = currentStatus === "approved";
  const isRejected = currentStatus === "rejected";

  return (
    <>
      <div className={`flex items-center gap-1.5 ${className || ""}`}>
        {!isApproved && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isApproving || isRejecting}
            isLoading={isApproving}
            onClick={handleApprove}
            leftIcon={<Check className="h-3.5 w-3.5" />}
            className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700"
          >
            Approve
          </Button>
        )}

        {!isRejected && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={isApproving || isRejecting}
            onClick={() => setRejectModalOpen(true)}
            leftIcon={<X className="h-3.5 w-3.5" />}
            className="h-8 px-2.5 text-xs"
          >
            Reject
          </Button>
        )}
      </div>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Report"
        description="Provide a mandatory reason for rejecting this report. The citizen will be notified with this message."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!rejectReason.trim()}
              isLoading={isRejecting}
              onClick={handleRejectConfirm}
            >
              Confirm Rejection
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Rejected reports will be hidden from public search immediately and flagged in the audit log.
            </span>
          </div>

          <Textarea
            label="Rejection Reason (Required)"
            placeholder="e.g. Inappropriate language, blurry image, duplicate post, suspect commercial advertisement..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            required
          />
        </div>
      </Modal>
    </>
  );
}

export default ModerationActions;
