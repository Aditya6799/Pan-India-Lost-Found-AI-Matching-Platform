import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ItemReport } from "@/models";
import { lostReportSchema, foundReportSchema } from "@/lib/validations/report";
import { PaginatedResponse, IItemReport } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;

    const reportType = searchParams.get("type"); // LOST, FOUND, or ALL
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const q = searchParams.get("q") || searchParams.get("query");
    const status = searchParams.get("status"); // active, recovered, closed
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, oldest, views

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      moderationStatus: "approved",
    };

    if (reportType && reportType !== "ALL") {
      filter.reportType = reportType.toUpperCase();
    }

    if (category && category !== "ALL") {
      filter.category = category;
    }

    if (subcategory) {
      filter.subcategory = subcategory;
    }

    if (state) {
      filter.state = { $regex: new RegExp(`^${state}$`, "i") };
    }

    if (city) {
      filter.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ["active", "recovered"] };
    }

    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    // Determine sort
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortOptions: Record<string, any> = { createdAt: -1 };
    if (sortBy === "oldest") {
      sortOptions = { lostFoundDate: 1 };
    } else if (sortBy === "views") {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sortBy === "newest") {
      sortOptions = { lostFoundDate: -1, createdAt: -1 };
    }

    const [reports, total] = await Promise.all([
      ItemReport.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("userId", "name preferredLanguage")
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
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
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

    const reportType = body.reportType || "LOST";
    let validatedData;

    if (reportType === "FOUND") {
      const result = foundReportSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      validatedData = result.data;
    } else {
      const result = lostReportSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      validatedData = result.data;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reportDoc: Record<string, any> = {
      ...validatedData,
      userId: session.user.id,
      lostFoundDate: new Date(validatedData.lostFoundDate),
      moderationStatus: "approved",
      status: "active",
      views: 0,
    };

    // If coordinates were passed, format geo-location
    if (
      typeof validatedData.latitude === "number" &&
      typeof validatedData.longitude === "number" &&
      !isNaN(validatedData.latitude) &&
      !isNaN(validatedData.longitude)
    ) {
      reportDoc.location = {
        type: "Point",
        coordinates: [validatedData.longitude, validatedData.latitude],
      };
    }

    delete reportDoc.latitude;
    delete reportDoc.longitude;

    const report = await ItemReport.create(reportDoc);

    // Fire and forget matching engine trigger
    (async () => {
      try {
        const matcher = await import("@/services/matching/matcher");
        if (typeof matcher.findMatchesForReport === "function") {
          await matcher.findMatchesForReport(report._id.toString(), report.reportType);
        }
      } catch (err) {
        console.warn("Background matching trigger error (safe to ignore if still compiling):", err);
      }
    })();

    return NextResponse.json(
      {
        success: true,
        message: "Report created successfully",
        data: report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create report" },
      { status: 500 }
    );
  }
}
