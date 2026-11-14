import { connectDB } from "@/lib/mongodb";
import Claim from "@/models/Claim";
import ItemReport from "@/models/ItemReport";
import AuditLog from "@/models/AuditLog";
import { notifyClaimSubmitted, notifyClaimDecision } from "@/services/notifications/notifier";
import type { CreateClaimInput, IClaim, PaginatedResponse, ClaimStatus } from "@/types";

export async function createClaim(
  claimantId: string,
  data: CreateClaimInput
): Promise<IClaim> {
  await connectDB();

  const report = await ItemReport.findById(data.reportId);
  if (!report) {
    throw new Error("Item report does not exist.");
  }

  // Prevent claiming own reported item
  if (report.userId.toString() === claimantId) {
    throw new Error("You cannot submit a claim for your own reported item.");
  }

  const claim = await Claim.create({
    reportId: data.reportId,
    matchId: data.matchId || undefined,
    claimantId,
    proofDescription: data.proofDescription,
    distinctiveProof: data.distinctiveProof || undefined,
    supportingEvidence: data.supportingEvidence || [],
    status: "pending",
  });

  // Log in AuditLog
  await AuditLog.create({
    userId: claimantId,
    action: "SUBMIT_CLAIM",
    resourceType: "Claim",
    resourceId: claim._id,
    metadata: { reportId: data.reportId },
    timestamp: new Date(),
  });

  // Notify report owner
  try {
    await notifyClaimSubmitted(report.userId.toString(), claim._id.toString(), data.reportId);
  } catch (err) {
    console.error("Failed to notify report owner about claim:", err);
  }

  return claim.toObject() as unknown as IClaim;
}

export async function getUserClaims(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<IClaim>> {
  await connectDB();
  const currentPage = Math.max(1, page);
  const currentLimit = Math.max(1, Math.min(100, limit));
  const skip = (currentPage - 1) * currentLimit;

  const [claims, total] = await Promise.all([
    Claim.find({ claimantId: userId })
      .populate("reportId", "itemName category reportType images state city status")
      .populate("matchId", "finalScore confidenceLevel")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean(),
    Claim.countDocuments({ claimantId: userId }),
  ]);

  return {
    success: true,
    data: claims as unknown as IClaim[],
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages: Math.ceil(total / currentLimit),
  };
}

export async function getClaimById(id: string): Promise<IClaim | null> {
  await connectDB();
  const claim = await Claim.findById(id)
    .populate("reportId")
    .populate("claimantId", "name email phone profileImage")
    .populate("reviewedBy", "name email role")
    .lean();
  return claim as unknown as IClaim | null;
}

export async function updateClaimStatus(
  id: string,
  status: ClaimStatus,
  reviewedBy: string,
  remarks?: string
): Promise<IClaim | null> {
  await connectDB();

  const updateFields: Record<string, unknown> = {
    status,
    reviewedBy,
    adminRemarks: remarks || undefined,
  };

  if (status === "approved" || status === "resolved") {
    updateFields.resolvedAt = new Date();
  }

  const claim = await Claim.findByIdAndUpdate(id, updateFields, { new: true })
    .populate("reportId")
    .lean();

  if (!claim) {
    throw new Error("Claim not found.");
  }

  // Audit log
  await AuditLog.create({
    userId: reviewedBy,
    action: `UPDATE_CLAIM_${status.toUpperCase()}`,
    resourceType: "Claim",
    resourceId: id,
    metadata: { status, remarks },
    timestamp: new Date(),
  });

  // Notify claimant
  if (status === "approved" || status === "rejected") {
    try {
      await notifyClaimDecision(
        claim.claimantId.toString(),
        claim._id.toString(),
        status === "approved",
        (claim.reportId as any)?._id?.toString() || ""
      );
    } catch (err) {
      console.error("Failed to notify claimant:", err);
    }
  }

  return claim as unknown as IClaim;
}
