import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { NotificationType } from "@/types";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedReportId?: string;
  relatedMatchId?: string;
  relatedClaimId?: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  await connectDB();
  await Notification.create({
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    relatedReportId: params.relatedReportId || undefined,
    relatedMatchId: params.relatedMatchId || undefined,
    relatedClaimId: params.relatedClaimId || undefined,
    isRead: false,
  });
}

/**
 * Creates notifications for BOTH the lost and found item owners when a match is detected.
 */
export async function notifyMatchFound(
  lostUserId: string,
  foundUserId: string,
  matchId: string,
  lostReportId: string,
  foundReportId: string
): Promise<void> {
  await connectDB();

  // Notify lost item owner
  if (lostUserId) {
    await createNotification({
      userId: lostUserId,
      title: "Potential Match Detected!",
      message: "An item matching your lost report has been discovered on the platform. Review the match details.",
      type: "match_found",
      relatedMatchId: matchId,
      relatedReportId: lostReportId,
    });
  }

  // Notify found item owner
  if (foundUserId && foundUserId !== lostUserId) {
    await createNotification({
      userId: foundUserId,
      title: "Potential Owner Found!",
      message: "An item matching the item you reported found has been identified. Review the potential owner's report.",
      type: "match_found",
      relatedMatchId: matchId,
      relatedReportId: foundReportId,
    });
  }
}

/**
 * Notifies the report owner when someone submits an ownership claim.
 */
export async function notifyClaimSubmitted(
  reportOwnerId: string,
  claimId: string,
  reportId: string
): Promise<void> {
  await createNotification({
    userId: reportOwnerId,
    title: "New Ownership Claim Submitted",
    message: "A user has submitted an ownership claim for your reported item. Moderators are reviewing the claim.",
    type: "claim_submitted",
    relatedClaimId: claimId,
    relatedReportId: reportId,
  });
}

/**
 * Notifies claimant when an admin or finder approves/rejects their claim.
 */
export async function notifyClaimDecision(
  claimantId: string,
  claimId: string,
  approved: boolean,
  reportId: string
): Promise<void> {
  await createNotification({
    userId: claimantId,
    title: approved ? "Claim Approved! 🎉" : "Claim Status Update",
    message: approved
      ? "Your ownership claim has been verified and approved! You will be contacted regarding retrieval details."
      : "Your ownership claim could not be verified with the provided information. Please review moderator remarks.",
    type: approved ? "claim_approved" : "claim_rejected",
    relatedClaimId: claimId,
    relatedReportId: reportId,
  });
}

/**
 * Notifies user when their report is approved or rejected by moderators.
 */
export async function notifyReportDecision(
  userId: string,
  reportId: string,
  approved: boolean,
  reason?: string
): Promise<void> {
  await createNotification({
    userId,
    title: approved ? "Report Approved" : "Report Needs Revision",
    message: approved
      ? "Your lost/found report has been approved and is now active across India's AI matching network."
      : `Your report was rejected: ${reason || "Does not comply with community verification guidelines."}`,
    type: approved ? "report_approved" : "report_rejected",
    relatedReportId: reportId,
  });
}

/**
 * Retrieves unread notification count for a given user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  await connectDB();
  return await Notification.countDocuments({
    userId,
    isRead: false,
  });
}
