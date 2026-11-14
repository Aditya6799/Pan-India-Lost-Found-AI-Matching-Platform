import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ItemReport } from "@/models";
import { PaginatedResponse, IItemReport } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get("q") || searchParams.get("query") || "";
    const reportType = searchParams.get("type"); // LOST, FOUND, ALL
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const color = searchParams.get("color");
    const brand = searchParams.get("brand");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, oldest, matches, views

    const latStr = searchParams.get("lat") || searchParams.get("latitude");
    const lonStr = searchParams.get("lon") || searchParams.get("lng") || searchParams.get("longitude");
    const radiusKm = parseFloat(searchParams.get("radiusKm") || "50");

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      moderationStatus: "approved",
      status: { $in: ["active", "recovered"] },
    };

    if (reportType && reportType !== "ALL") {
      filter.reportType = reportType.toUpperCase();
    }

    if (category && category !== "ALL" && category !== "all") {
      filter.category = category;
    }

    if (subcategory) {
      filter.subcategory = subcategory;
    }

    if (state && state !== "ALL" && state !== "all") {
      filter.state = { $regex: new RegExp(`^${state}$`, "i") };
    }

    if (city && city !== "ALL" && city !== "all") {
      filter.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    if (color) {
      filter.color = { $in: [new RegExp(color, "i")] };
    }

    if (brand) {
      filter.brand = { $regex: new RegExp(brand, "i") };
    }

    if (dateFrom || dateTo) {
      filter.lostFoundDate = {};
      if (dateFrom) {
        filter.lostFoundDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filter.lostFoundDate.$lte = to;
      }
    }

    // Text search or keyword regex
    if (q.trim()) {
      filter.$or = [
        { itemName: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
        { brand: { $regex: q.trim(), $options: "i" } },
        { distinctiveFeatures: { $regex: q.trim(), $options: "i" } },
        { locality: { $regex: q.trim(), $options: "i" } },
        { city: { $regex: q.trim(), $options: "i" } },
      ];
    }

    // Geo query if coordinates provided
    if (latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      if (!isNaN(lat) && !isNaN(lon)) {
        filter.location = {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [lon, lat],
            },
            $maxDistance: radiusKm * 1000, // meters
          },
        };
      }
    }

    // Sort order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortOptions: Record<string, any> = { createdAt: -1 };
    if (!latStr && !lonStr) {
      if (sortBy === "oldest") {
        sortOptions = { lostFoundDate: 1 };
      } else if (sortBy === "views") {
        sortOptions = { views: -1, createdAt: -1 };
      } else if (sortBy === "newest") {
        sortOptions = { lostFoundDate: -1, createdAt: -1 };
      }
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
    console.error("GET /api/search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
