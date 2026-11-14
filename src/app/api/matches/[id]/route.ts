import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { Match, ItemReport } from "@/models";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid match ID" }, { status: 400 });
    }

    await connectDB();

    const match = await Match.findById(id)
      .populate("lostReportId")
      .populate("foundReportId")
      .lean();

    if (!match) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error("GET /api/matches/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch match details" },
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

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid match ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!["pending", "accepted", "rejected", "resolved"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    await connectDB();

    const match = await Match.findById(id);
    if (!match) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 });
    }

    // Check ownership
    const [lostReport, foundReport] = await Promise.all([
      ItemReport.findById(match.lostReportId),
      ItemReport.findById(match.foundReportId),
    ]);

    const isLostOwner = lostReport?.userId?.toString() === session.user.id;
    const isFoundOwner = foundReport?.userId?.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isLostOwner && !isFoundOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You are not associated with this match." },
        { status: 403 }
      );
    }

    match.status = status;
    await match.save();

    return NextResponse.json({
      success: true,
      message: `Match status updated to ${status}`,
      data: match,
    });
  } catch (error) {
    console.error("PATCH /api/matches/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update match status" },
      { status: 500 }
    );
  }
}
