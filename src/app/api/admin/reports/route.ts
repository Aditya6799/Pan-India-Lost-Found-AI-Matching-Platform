import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ItemReport } from "@/models";
import { PaginatedResponse, IItemReport } from "@/types";

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

    const moderationStatus = searchParams.get("moderationStatus"); // pending, approved, rejected, or all
    const reportType = searchParams.get("type"); // LOST, FOUND, or all
    const q = searchParams.get("q") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (moderationStatus && moderationStatus !== "ALL" && moderationStatus !== "all") {
      filter.moderationStatus = moderationStatus;
    }

    if (reportType && reportType !== "ALL" && reportType !== "all") {
      filter.reportType = reportType.toUpperCase();
    }

    if (q.trim()) {
      filter.$or = [
        { itemName: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
        { city: { $regex: q.trim(), $options: "i" } },
        { state: { $regex: q.trim(), $options: "i" } },
      ];
    }

    const [reports, total] = await Promise.all([
      ItemReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .lean(),
      ItemReport.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<IItemReport> = {
      success: true,
      data: reports as unknown as IItemReport[],
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/admin/reports error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
