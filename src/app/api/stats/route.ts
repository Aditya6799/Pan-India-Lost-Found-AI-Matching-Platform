import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ItemReport, Match, User } from "@/models";

export async function GET() {
  try {
    await connectDB();

    const [totalLost, totalFound, totalRecovered, totalMatches, totalUsers] = await Promise.all([
      ItemReport.countDocuments({ reportType: "LOST" }),
      ItemReport.countDocuments({ reportType: "FOUND" }),
      ItemReport.countDocuments({ status: "recovered" }),
      Match.countDocuments({ finalScore: { $gte: 0.3 } }),
      User.countDocuments({ isActive: true }),
    ]);

    const stats = {
      totalLost,
      totalFound,
      totalRecovered,
      totalMatches,
      totalUsers,
    };

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch platform stats" },
      { status: 500 }
    );
  }
}
