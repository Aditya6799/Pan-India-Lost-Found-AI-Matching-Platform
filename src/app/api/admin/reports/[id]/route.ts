import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ItemReport, Notification, AuditLog } from "@/models";
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
      return NextResponse.json({ success: false, error: "Invalid report ID" }, { status: 400 });
    }

    const body = await request.json();
    const { moderationStatus, status, reason } = body;

    if (moderationStatus && !["pending", "approved", "rejected"].includes(moderationStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid moderation status value" },
        { status: 400 }
      );
    }

    await connectDB();

    const report = await ItemReport.findById(id);
    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (moderationStatus) updateData.moderationStatus = moderationStatus;
    if (status) updateData.status = status;

    const updatedReport = await ItemReport.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate("userId", "name email")
      .lean();

    // Notify user if moderation status changed
    if (moderationStatus && moderationStatus !== report.moderationStatus) {
      const notifType = moderationStatus === "approved" ? "report_approved" : "report_rejected";
      await Notification.create({
        userId: report.userId,
        title: `Report Moderation Update: ${moderationStatus.toUpperCase()}`,
        message: `Your report "${report.itemName}" has been ${moderationStatus}.${
          reason ? ` Note: ${reason}` : ""
        }`,
        type: notifType,
        relatedReportId: report._id,
        isRead: false,
      });

      // If just approved, trigger AI matching
      if (moderationStatus === "approved") {
        (async () => {
          try {
            const matcher = await import("@/services/matching/matcher");
            if (typeof matcher.findMatchesForReport === "function") {
              await matcher.findMatchesForReport(report._id.toString(), report.reportType);
            }
          } catch (err) {
            console.warn("Background matching trigger failed:", err);
          }
        })();
      }
    }

    // Log admin audit action
    await AuditLog.create({
      userId: session.user.id,
      action: "MODERATE_REPORT",
      resourceType: "ItemReport",
      resourceId: report._id,
      metadata: { moderationStatus, reason },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Report status updated successfully`,
      data: updatedReport,
    });
  } catch (error) {
    console.error("PATCH /api/admin/reports/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update report status" },
      { status: 500 }
    );
  }
}
