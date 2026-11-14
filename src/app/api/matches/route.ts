import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ItemReport, Match } from "@/models";
import { PaginatedResponse, IMatch } from "@/types";

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

    const status = searchParams.get("status"); // pending, accepted, rejected, resolved
    const confidence = searchParams.get("confidence"); // high, medium, low
    const reportId = searchParams.get("reportId");

    // Get all report IDs created by this user
    let reportIds: unknown[] = [];
    if (reportId) {
      reportIds = [reportId];
    } else {
      reportIds = await ItemReport.find({ userId: session.user.id }).distinct("_id");
    }

    if (!reportIds.length) {
      const emptyResponse: PaginatedResponse<IMatch> = {
        success: true,
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
      return NextResponse.json(emptyResponse);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      $or: [
        { lostReportId: { $in: reportIds } },
        { foundReportId: { $in: reportIds } },
      ],
    };

    if (status) {
      filter.status = status;
    }

    if (confidence) {
      filter.confidenceLevel = confidence;
    }

    const [matches, total] = await Promise.all([
      Match.find(filter)
        .sort({ finalScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "lostReportId",
          select: "itemName category subcategory description images state city lostFoundDate status reportType distinctiveFeatures brand color",
        })
        .populate({
          path: "foundReportId",
          select: "itemName category subcategory description images state city lostFoundDate status reportType distinctiveFeatures brand color",
        })
        .lean(),
      Match.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<IMatch> = {
      success: true,
      data: matches as unknown as IMatch[],
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/matches error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
