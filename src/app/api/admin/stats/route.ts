import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ItemReport, Match, User, Claim, AuditLog } from "@/models";

export async function GET() {
  try {
    await connectDB();
    const session = await auth();
    const isAdmin = session?.user?.role === "admin";

    // Public baseline statistics
    const [totalLost, totalFound, totalRecovered, totalMatches] = await Promise.all([
      ItemReport.countDocuments({ reportType: "LOST" }),
      ItemReport.countDocuments({ reportType: "FOUND" }),
      ItemReport.countDocuments({ status: "recovered" }),
      Match.countDocuments({ finalScore: { $gte: 0.3 } }),
    ]);

    const publicStats = {
      totalLost,
      totalFound,
      totalRecovered,
      totalMatches,
    };

    if (!isAdmin) {
      return NextResponse.json({
        success: true,
        data: publicStats,
      });
    }

    // Extended statistics for Admins
    const [totalUsers, pendingApprovals, claimsUnderReview, recentActivity] = await Promise.all([
      User.countDocuments(),
      ItemReport.countDocuments({ moderationStatus: "pending" }),
      Claim.countDocuments({ status: { $in: ["pending", "under_review"] } }),
      AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate("userId", "name email")
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...publicStats,
        totalUsers,
        pendingApprovals,
        claimsUnderReview,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch platform statistics" },
      { status: 500 }
    );
  }
}
