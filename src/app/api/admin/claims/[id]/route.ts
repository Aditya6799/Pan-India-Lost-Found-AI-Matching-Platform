import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { Claim, ItemReport, Notification, AuditLog } from "@/models";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid claim ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status, remarks, adminRemarks } = body;
    const finalRemarks = remarks || adminRemarks || "";

    if (!["pending", "under_review", "approved", "rejected", "resolved"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid claim status" },
        { status: 400 }
      );
    }

    await connectDB();

    const claim = await Claim.findById(id).populate("reportId");
    if (!claim) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    claim.status = status;
    claim.adminRemarks = finalRemarks;
    claim.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
    if (status === "resolved" || status === "approved") {
      claim.resolvedAt = new Date();
    }
    await claim.save();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report = claim.reportId as any;

    // If claim approved or resolved, set report status to 'recovered'
    if (status === "approved" || status === "resolved") {
      if (report?._id) {
        await ItemReport.findByIdAndUpdate(report._id, { status: "recovered" });
      }
    }

    // Send notification to claimant
    const notificationType =
      status === "approved"
        ? "claim_approved"
        : status === "rejected"
        ? "claim_rejected"
        : status === "resolved"
        ? "item_recovered"
        : "system";

    await Notification.create({
      userId: claim.claimantId,
      title: `Claim ${status.replace("_", " ").toUpperCase()}`,
      message: `Your claim for item "${report?.itemName || "Report"}" has been ${status}.${
        finalRemarks ? ` Remarks: ${finalRemarks}` : ""
      }`,
      type: notificationType,
      relatedClaimId: claim._id,
      relatedReportId: report?._id,
      isRead: false,
    });

    // Record audit log
    await AuditLog.create({
      userId: session.user.id,
      action: "REVIEW_CLAIM",
      resourceType: "Claim",
      resourceId: claim._id,
      metadata: { status, remarks: finalRemarks },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Claim status updated to ${status}`,
      data: claim,
    });
  } catch (error) {
    console.error("PATCH /api/admin/claims/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update claim" },
      { status: 500 }
    );
  }
}
