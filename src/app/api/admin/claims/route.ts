import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { Claim } from "@/models";
import { PaginatedResponse, IClaim } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    await connectDB();
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (status && status !== "ALL" && status !== "all") {
      filter.status = status;
    }

    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reportId", "itemName category images state city status reportType")
        .populate("claimantId", "name email phone")
        .populate("matchId")
        .populate("reviewedBy", "name email")
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
    console.error("GET /api/admin/claims error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}
