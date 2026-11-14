import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ItemReport, Match } from "@/models";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid report ID" }, { status: 400 });
    }

    await connectDB();

    // Increment views and fetch report
    const report = await ItemReport.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("userId", "name preferredLanguage")
      .lean();

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    // Find any potential match count or related matches if approved
    const matchCount = await Match.countDocuments({
      $or: [{ lostReportId: id }, { foundReportId: id }],
      status: { $ne: "rejected" },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        matchCount,
      },
    });
  } catch (error) {
    console.error("GET /api/reports/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
      return NextResponse.json({ success: false, error: "Invalid report ID" }, { status: 400 });
    }

    await connectDB();
    const existingReport = await ItemReport.findById(id);

    if (!existingReport) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    const isOwner = existingReport.userId.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You can only edit your own reports." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Fields allowed to be updated by user
    const allowedFields = [
      "itemName",
      "category",
      "subcategory",
      "description",
      "brand",
      "color",
      "distinctiveFeatures",
      "images",
      "state",
      "city",
      "locality",
      "lostFoundDate",
      "lostFoundTime",
      "status",
      "additionalInfo",
      "contactPreference",
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === "lostFoundDate") {
          updateData[key] = new Date(body[key]);
        } else {
          updateData[key] = body[key];
        }
      }
    }

    if (body.latitude !== undefined && body.longitude !== undefined) {
      updateData.location = {
        type: "Point",
        coordinates: [body.longitude, body.latitude],
      };
    }

    const updated = await ItemReport.findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate("userId", "name preferredLanguage")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Report updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/reports/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update report" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
      return NextResponse.json({ success: false, error: "Invalid report ID" }, { status: 400 });
    }

    await connectDB();
    const existingReport = await ItemReport.findById(id);

    if (!existingReport) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    const isOwner = existingReport.userId.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You can only delete your own reports." },
        { status: 403 }
      );
    }

    // Soft delete by setting status to 'closed'
    existingReport.status = "closed";
    await existingReport.save();

    return NextResponse.json({
      success: true,
      message: "Report closed successfully",
      data: { id: existingReport._id, status: "closed" },
    });
  } catch (error) {
    console.error("DELETE /api/reports/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
