import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { Claim, ItemReport, Notification } from "@/models";
import { updateClaimStatusSchema } from "@/lib/validations/claim";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid claim ID" }, { status: 400 });
    }

    await connectDB();

    const claim = await Claim.findById(id)
      .populate("reportId")
      .populate("claimantId", "name email phone")
      .populate("matchId")
      .select("+proofDescription +distinctiveProof")
      .lean();

    if (!claim) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report = claim.reportId as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const claimant = claim.claimantId as any;
    const isClaimant = claimant?._id?.toString() === session.user.id || claimant?.toString() === session.user.id;
    const isReportOwner = report?.userId?.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isClaimant && !isReportOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You cannot view this claim." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: claim,
    });
  } catch (error) {
    console.error("GET /api/claims/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch claim" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
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
    const parseResult = updateClaimStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status, adminRemarks } = parseResult.data;

    await connectDB();

    const claim = await Claim.findById(id).populate("reportId");
    if (!claim) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    claim.status = status;
    claim.adminRemarks = adminRemarks || "";
    claim.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
    if (status === "resolved" || status === "approved") {
      claim.resolvedAt = new Date();
    }
    await claim.save();

    // If approved or resolved, mark report as recovered
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report = claim.reportId as any;
    if (status === "approved" || status === "resolved") {
      if (report && report._id) {
        await ItemReport.findByIdAndUpdate(report._id, { status: "recovered" });
      }
    }

    // Send notification to claimant
    const notificationType =
      status === "approved"
        ? "claim_approved"
        : status === "rejected"
        ? "claim_rejected"
        : "system";

    await Notification.create({
      userId: claim.claimantId,
      title: `Claim ${status.replace("_", " ").toUpperCase()}`,
      message: `Your claim for item "${report?.itemName || "Report"}" was marked as ${status}.${
        adminRemarks ? ` Remarks: ${adminRemarks}` : ""
      }`,
      type: notificationType,
      relatedClaimId: claim._id,
      relatedReportId: report?._id,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      message: `Claim status updated to ${status}`,
      data: claim,
    });
  } catch (error) {
    console.error("PATCH /api/claims/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update claim" },
      { status: 500 }
    );
  }
}
