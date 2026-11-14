import { connectDB } from "@/lib/mongodb";
import ItemReport from "@/models/ItemReport";
import AuditLog from "@/models/AuditLog";
import { findMatchesForReport } from "@/services/matching/matcher";
import type {
  CreateReportInput,
  SearchFilters,
  IItemReport,
  PaginatedResponse,
} from "@/types";

export interface GetUserReportsOptions {
  type?: "LOST" | "FOUND";
  status?: string;
  page?: number;
  limit?: number;
}

export async function getUserReports(
  userId: string,
  options: GetUserReportsOptions = {}
): Promise<PaginatedResponse<IItemReport>> {
  await connectDB();
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { userId };
  if (options.type) query.reportType = options.type;
  if (options.status && options.status !== "ALL") query.status = options.status;

  const [reports, total] = await Promise.all([
    ItemReport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ItemReport.countDocuments(query),
  ]);

  return {
    success: true,
    data: reports as unknown as IItemReport[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getReportById(id: string): Promise<IItemReport | null> {
  await connectDB();
  const report = await ItemReport.findById(id)
    .populate("userId", "name email phone profileImage")
    .lean();
  return report as unknown as IItemReport | null;
}

export async function createReport(
  userId: string,
  data: CreateReportInput
): Promise<IItemReport> {
  await connectDB();

  // Create location GeoJSON if coordinates are present
  const location =
    data.location?.latitude !== undefined &&
    data.location?.longitude !== undefined &&
    data.location?.latitude !== null &&
    data.location?.longitude !== null
      ? {
          type: "Point" as const,
          coordinates: [data.location.longitude, data.location.latitude] as [number, number],
        }
      : undefined;

  const report = await ItemReport.create({
    userId,
    reportType: data.reportType,
    itemName: data.itemName,
    category: data.category,
    subcategory: data.subcategory || undefined,
    description: data.description,
    brand: data.brand || undefined,
    color: data.color || [],
    distinctiveFeatures: data.distinctiveFeatures || undefined,
    images: data.images || [],
    state: data.state,
    city: data.city,
    locality: data.locality || undefined,
    location,
    lostFoundDate: new Date(data.lostFoundDate),
    lostFoundTime: data.lostFoundTime || undefined,
    status: "active",
    moderationStatus: "approved",
    views: 0,
    additionalInfo: data.additionalInfo || undefined,
    contactPreference: data.contactPreference || "email",
  });

  // Log in AuditLog
  await AuditLog.create({
    userId,
    action: `CREATE_${data.reportType}_REPORT`,
    resourceType: "ItemReport",
    resourceId: report._id,
    metadata: { itemName: report.itemName, category: report.category },
    timestamp: new Date(),
  });

  // Trigger AI matching asynchronously in background
  try {
    findMatchesForReport(report._id.toString()).catch((err) =>
      console.error("Async AI matching error for new report:", err)
    );
  } catch (err) {
    console.error("Failed to kick off async matching:", err);
  }

  return report.toObject() as unknown as IItemReport;
}

export async function updateReport(
  id: string,
  userId: string,
  data: Partial<CreateReportInput>
): Promise<IItemReport | null> {
  await connectDB();

  const report = await ItemReport.findOne({ _id: id, userId });
  if (!report) {
    throw new Error("Report not found or permission denied.");
  }

  if (data.itemName) report.itemName = data.itemName;
  if (data.category) report.category = data.category;
  if (data.subcategory !== undefined) report.subcategory = data.subcategory;
  if (data.description) report.description = data.description;
  if (data.brand !== undefined) report.brand = data.brand;
  if (data.color) report.color = data.color;
  if (data.distinctiveFeatures !== undefined) report.distinctiveFeatures = data.distinctiveFeatures;
  if (data.images) report.images = data.images as any;
  if (data.state) report.state = data.state;
  if (data.city) report.city = data.city;
  if (data.locality !== undefined) report.locality = data.locality;
  if (data.lostFoundDate) report.lostFoundDate = new Date(data.lostFoundDate);
  if (data.lostFoundTime !== undefined) report.lostFoundTime = data.lostFoundTime;
  if (data.additionalInfo !== undefined) report.additionalInfo = data.additionalInfo;
  if (data.contactPreference) report.contactPreference = data.contactPreference;

  if (data.location?.latitude !== undefined && data.location?.longitude !== undefined) {
    report.location = {
      type: "Point",
      coordinates: [data.location.longitude, data.location.latitude],
    };
  }

  await report.save();

  await AuditLog.create({
    userId,
    action: "UPDATE_REPORT",
    resourceType: "ItemReport",
    resourceId: report._id,
    metadata: { itemName: report.itemName },
    timestamp: new Date(),
  });

  return report.toObject() as unknown as IItemReport;
}

export async function deleteReport(
  id: string,
  userId: string,
  role: string = "user"
): Promise<boolean> {
  await connectDB();

  const query: Record<string, unknown> = { _id: id };
  if (role !== "admin" && role !== "moderator") {
    query.userId = userId;
  }

  const result = await ItemReport.findOneAndDelete(query);
  if (!result) {
    throw new Error("Report not found or unauthorized to delete.");
  }

  await AuditLog.create({
    userId,
    action: "DELETE_REPORT",
    resourceType: "ItemReport",
    resourceId: id,
    timestamp: new Date(),
  });

  return true;
}

export async function incrementViews(id: string): Promise<void> {
  await connectDB();
  await ItemReport.findByIdAndUpdate(id, { $inc: { views: 1 } });
}

export async function markRecovered(id: string, userId: string): Promise<IItemReport | null> {
  await connectDB();

  const report = await ItemReport.findOneAndUpdate(
    { _id: id, userId },
    { status: "recovered" },
    { new: true }
  ).lean();

  if (!report) {
    throw new Error("Report not found or unauthorized.");
  }

  await AuditLog.create({
    userId,
    action: "MARK_REPORT_RECOVERED",
    resourceType: "ItemReport",
    resourceId: id,
    timestamp: new Date(),
  });

  return report as unknown as IItemReport;
}

export async function getPublicReports(
  filters: Partial<SearchFilters> = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<IItemReport>> {
  await connectDB();

  const query: Record<string, unknown> = {
    moderationStatus: "approved",
  };

  if (filters.reportType) {
    query.reportType = filters.reportType;
  }
  if (filters.category && filters.category !== "All Categories") {
    query.category = filters.category;
  }
  if (filters.state && filters.state !== "All States") {
    query.state = filters.state;
  }
  if (filters.city) {
    query.city = { $regex: new RegExp(filters.city, "i") };
  }
  if (filters.brand) {
    query.brand = { $regex: new RegExp(filters.brand, "i") };
  }
  if (filters.color) {
    query.color = { $in: [filters.color] };
  }

  if (filters.startDate || filters.endDate) {
    const dateQuery: Record<string, Date> = {};
    if (filters.startDate) dateQuery.$gte = new Date(filters.startDate);
    if (filters.endDate) dateQuery.$lte = new Date(filters.endDate);
    query.lostFoundDate = dateQuery;
  }

  const currentPage = Math.max(1, page);
  const currentLimit = Math.max(1, Math.min(100, limit));
  const skip = (currentPage - 1) * currentLimit;

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (filters.sortBy === "lostFoundDate") {
    sortOption = { lostFoundDate: filters.sortOrder === "asc" ? 1 : -1 };
  } else if (filters.sortBy === "views") {
    sortOption = { views: filters.sortOrder === "asc" ? 1 : -1 };
  }

  const [reports, total] = await Promise.all([
    ItemReport.find(query).sort(sortOption).skip(skip).limit(currentLimit).lean(),
    ItemReport.countDocuments(query),
  ]);

  return {
    success: true,
    data: reports as unknown as IItemReport[],
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages: Math.ceil(total / currentLimit),
  };
}

export async function searchReports(
  queryText: string,
  filters: Partial<SearchFilters> = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<IItemReport>> {
  await connectDB();

  const query: Record<string, unknown> = {
    moderationStatus: "approved",
  };

  if (queryText && queryText.trim()) {
    query.$text = { $search: queryText.trim() };
  }

  if (filters.reportType) {
    query.reportType = filters.reportType;
  }
  if (filters.category && filters.category !== "All Categories") {
    query.category = filters.category;
  }
  if (filters.state && filters.state !== "All States") {
    query.state = filters.state;
  }

  const currentPage = Math.max(1, page);
  const currentLimit = Math.max(1, Math.min(100, limit));
  const skip = (currentPage - 1) * currentLimit;

  const [reports, total] = await Promise.all([
    ItemReport.find(query)
      .sort(queryText ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean(),
    ItemReport.countDocuments(query),
  ]);

  return {
    success: true,
    data: reports as unknown as IItemReport[],
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages: Math.ceil(total / currentLimit),
  };
}
