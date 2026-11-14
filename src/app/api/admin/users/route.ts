import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { User, ItemReport } from "@/models";
import { PaginatedResponse, IUser } from "@/types";

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

    const q = searchParams.get("q") || searchParams.get("query") || "";
    const role = searchParams.get("role");
    const status = searchParams.get("status"); // active, inactive

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: "i" } },
        { email: { $regex: q.trim(), $options: "i" } },
      ];
    }

    if (role && role !== "ALL") {
      filter.role = role;
    }

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-passwordHash")
        .lean(),
      User.countDocuments(filter),
    ]);

    // Attach report count to each user
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const reportCount = await ItemReport.countDocuments({ userId: u._id });
        return {
          ...u,
          reportCount,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<IUser> = {
      success: true,
      data: usersWithCounts as unknown as IUser[],
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
