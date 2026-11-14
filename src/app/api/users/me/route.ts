import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { User, ItemReport, Claim } from "@/models";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Attach user activity statistics
    const [reportsCount, claimsCount, recoveriesCount] = await Promise.all([
      ItemReport.countDocuments({ userId: user._id }),
      Claim.countDocuments({ claimantId: user._id }),
      ItemReport.countDocuments({ userId: user._id, status: "recovered" }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        stats: {
          totalReports: reportsCount,
          totalClaims: claimsCount,
          totalRecoveries: recoveriesCount,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
