import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { Claim, ItemReport, Notification, User } from "@/models";
import { createClaimSchema } from "@/lib/validations/claim";
import { PaginatedResponse, IClaim } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      claimantId: session.user.id,
    };

    if (status) {
      filter.status = status;
    }

    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "reportId",
          select: "itemName category images state city lostFoundDate status reportType",
        })
        .populate("matchId")
        .select("+proofDescription +distinctiveProof")
        .lean(),
      Claim.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<IClaim> = {
      success: true,
      data: claims as unknown as IClaim[],
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/claims error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    const parseResult = createClaimSchema.safeParse(body);
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

    const { reportId, matchId, proofDescription, distinctiveProof, supportingEvidence } =
      parseResult.data;

    // Check report existence
    const report = await ItemReport.findById(reportId);
    if (!report) {
      return NextResponse.json({ success: false, error: "Target report not found" }, { status: 404 });
    }

    // Claimant cannot claim their own report
    if (report.userId.toString() === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot file a claim on your own report." },
        { status: 400 }
      );
    }

    // Check if duplicate pending claim exists
    const existingClaim = await Claim.findOne({
      reportId,
      claimantId: session.user.id,
      status: { $in: ["pending", "under_review"] },
    });

    if (existingClaim) {
      return NextResponse.json(
        { success: false, error: "You already have an active claim for this item." },
        { status: 400 }
      );
    }

    // Create claim
    const newClaim = await Claim.create({
      reportId,
      matchId: matchId || null,
      claimantId: session.user.id,
      proofDescription,
      distinctiveProof: distinctiveProof || "",
      supportingEvidence: supportingEvidence || [],
      status: "pending",
    });

    // Notify report owner
    await Notification.create({
      userId: report.userId,
      title: "New Ownership Claim Submitted",
      message: `Someone submitted a claim for your report "${report.itemName}". Our team will review verification proof.`,
      type: "claim_submitted",
      relatedReportId: report._id,
      relatedClaimId: newClaim._id,
      isRead: false,
    });

    // Notify administrators
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    if (admins.length > 0) {
      const adminNotifications = admins.map((admin) => ({
        userId: admin._id,
        title: "Action Required: New Claim Submitted",
        message: `A new claim was submitted for item "${report.itemName}" awaiting review.`,
        type: "claim_submitted",
        relatedReportId: report._id,
        relatedClaimId: newClaim._id,
        isRead: false,
      }));
      await Notification.insertMany(adminNotifications);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Claim submitted successfully and is under review",
        data: newClaim,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/claims error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit claim" },
      { status: 500 }
    );
  }
}
