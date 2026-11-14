import connectDB from '@/lib/mongodb';
import { User, ItemReport, Match, Claim, AuditLog } from '@/models';

export interface AdminStats {
  totalUsers: number;
  totalReports: number;
  pendingApprovals: number;
  successfulRecoveries: number;
  claimsUnderReview: number;
  aiMatchesGenerated: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export interface AnalyticsData {
  dailyReports: Array<{
    date: string;
    lost: number;
    found: number;
    total: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
  }>;
  stateBreakdown: Array<{
    state: string;
    count: number;
  }>;
  matchScoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  claimOutcomes: Array<{
    status: string;
    count: number;
  }>;
  keyMetrics: {
    avgMatchScore: number;
    recoveryRate: number;
    mostActiveCities: Array<{ city: string; count: number }>;
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  await connectDB();

  const [
    totalUsers,
    totalReports,
    pendingApprovals,
    successfulRecoveries,
    claimsUnderReview,
    aiMatchesGenerated,
  ] = await Promise.all([
    User.countDocuments(),
    ItemReport.countDocuments(),
    ItemReport.countDocuments({ moderationStatus: 'pending' }),
    ItemReport.countDocuments({ status: 'recovered' }),
    Claim.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
    Match.countDocuments(),
  ]);

  return {
    totalUsers,
    totalReports,
    pendingApprovals,
    successfulRecoveries,
    claimsUnderReview,
    aiMatchesGenerated,
  };
}

export async function getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
  await connectDB();

  const logs = await AuditLog.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role')
    .lean();

  return logs.map((log: any) => ({
    id: log._id?.toString() || '',
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId?.toString(),
    metadata: log.metadata,
    ipAddress: log.ipAddress,
    timestamp: log.timestamp ? new Date(log.timestamp).toISOString() : new Date().toISOString(),
    user: log.userId
      ? {
          id: log.userId._id?.toString() || '',
          name: log.userId.name || 'Unknown',
          email: log.userId.email || '',
          role: log.userId.role || 'user',
        }
      : null,
  }));
}

export async function getAnalyticsData(days: number = 30): Promise<AnalyticsData> {
  await connectDB();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // 1. Daily Reports (Lost vs Found)
  const dailyAggregation = await ItemReport.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          type: '$reportType',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  const dailyMap = new Map<string, { lost: number; found: number }>();
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap.set(dateStr, { lost: 0, found: 0 });
  }

  dailyAggregation.forEach((entry) => {
    const dateStr = entry._id.date;
    const type = entry._id.type;
    const current = dailyMap.get(dateStr) || { lost: 0, found: 0 };
    if (type === 'LOST') current.lost = entry.count;
    if (type === 'FOUND') current.found = entry.count;
    dailyMap.set(dateStr, current);
  });

  const dailyReports = Array.from(dailyMap.entries()).map(([date, counts]) => ({
    date,
    lost: counts.lost,
    found: counts.found,
    total: counts.lost + counts.found,
  }));

  // 2. Category Breakdown
  const categoryAggregation = await ItemReport.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const categoryBreakdown = categoryAggregation.map((c) => ({
    category: c._id || 'Other',
    count: c.count,
  }));

  // 3. Reports by State (Top 10)
  const stateAggregation = await ItemReport.aggregate([
    { $group: { _id: '$state', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const stateBreakdown = stateAggregation.map((s) => ({
    state: s._id || 'Unknown',
    count: s.count,
  }));

  // 4. Match Score Distribution
  const matches = await Match.find({}, 'finalScore').lean();
  const ranges = [
    { range: '0-20%', min: 0, max: 0.2, count: 0 },
    { range: '20-40%', min: 0.2, max: 0.4, count: 0 },
    { range: '40-60%', min: 0.4, max: 0.6, count: 0 },
    { range: '60-80%', min: 0.6, max: 0.8, count: 0 },
    { range: '80-100%', min: 0.8, max: 1.01, count: 0 },
  ];

  matches.forEach((m: any) => {
    const score = m.finalScore || 0;
    const bucket = ranges.find((r) => score >= r.min && score < r.max);
    if (bucket) bucket.count++;
  });

  const matchScoreDistribution = ranges.map((r) => ({
    range: r.range,
    count: r.count,
  }));

  // 5. Claim Outcomes
  const claimAggregation = await Claim.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const claimOutcomes = claimAggregation.map((c) => ({
    status: c._id ? c._id.replace('_', ' ').toUpperCase() : 'PENDING',
    count: c.count,
  }));

  // 6. Key Metrics
  const avgScoreResult = await Match.aggregate([
    { $group: { _id: null, avgScore: { $avg: '$finalScore' } } },
  ]);
  const avgMatchScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore * 100) : 0;

  const totalReportsCount = await ItemReport.countDocuments();
  const recoveredCount = await ItemReport.countDocuments({ status: 'recovered' });
  const recoveryRate = totalReportsCount > 0 ? Math.round((recoveredCount / totalReportsCount) * 100) : 0;

  const cityAggregation = await ItemReport.aggregate([
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const mostActiveCities = cityAggregation.map((c) => ({
    city: c._id || 'Unknown',
    count: c.count,
  }));

  return {
    dailyReports,
    categoryBreakdown,
    stateBreakdown,
    matchScoreDistribution,
    claimOutcomes,
    keyMetrics: {
      avgMatchScore,
      recoveryRate,
      mostActiveCities,
    },
  };
}


export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  profileImage?: string;
  createdAt: string;
  reportsCount: number;
}

export async function getAdminUsers(params: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  await connectDB();

  const { search = '', role = 'all', status = 'all', page = 1, limit = 10 } = params;

  const query: any = {};
  if (search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
    ];
  }
  if (role !== 'all') {
    query.role = role;
  }
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);

  // Count reports for each user
  const userIds = users.map((u: any) => u._id);
  const reportCounts = await ItemReport.aggregate([
    { $match: { userId: { $in: userIds } } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);

  const reportCountMap = new Map<string, number>();
  reportCounts.forEach((r) => {
    reportCountMap.set(r._id.toString(), r.count);
  });

  const formattedUsers: AdminUserItem[] = users.map((u: any) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role || 'user',
    isActive: u.isActive !== false,
    profileImage: u.profileImage,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
    reportsCount: reportCountMap.get(u._id.toString()) || 0,
  }));

  return {
    users: formattedUsers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export interface AdminReportItem {
  id: string;
  itemName: string;
  reportType: 'LOST' | 'FOUND';
  category: string;
  description: string;
  state: string;
  city: string;
  lostFoundDate: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  status: string;
  views: number;
  images: Array<{ url: string; publicId: string }>;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export async function getAdminReports(params: {
  search?: string;
  moderationStatus?: string;
  reportType?: string;
  page?: number;
  limit?: number;
}) {
  await connectDB();

  const { search = '', moderationStatus = 'pending', reportType = 'all', page = 1, limit = 10 } = params;

  const query: any = {};
  if (search.trim()) {
    query.$or = [
      { itemName: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { city: { $regex: search.trim(), $options: 'i' } },
    ];
  }
  if (moderationStatus !== 'all') {
    query.moderationStatus = moderationStatus;
  }
  if (reportType !== 'all') {
    query.reportType = reportType;
  }

  const skip = (page - 1) * limit;
  const [reports, total] = await Promise.all([
    ItemReport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .lean(),
    ItemReport.countDocuments(query),
  ]);

  const formattedReports: AdminReportItem[] = reports.map((r: any) => ({
    id: r._id.toString(),
    itemName: r.itemName,
    reportType: r.reportType,
    category: r.category,
    description: r.description,
    state: r.state,
    city: r.city,
    lostFoundDate: r.lostFoundDate ? new Date(r.lostFoundDate).toISOString() : new Date().toISOString(),
    moderationStatus: r.moderationStatus || 'approved',
    status: r.status || 'active',
    views: r.views || 0,
    images: r.images || [],
    user: r.userId
      ? {
          id: r.userId._id.toString(),
          name: r.userId.name || 'Anonymous',
          email: r.userId.email || '',
        }
      : undefined,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
  }));

  return {
    reports: formattedReports,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export interface AdminClaimItem {
  id: string;
  claimant: {
    id: string;
    name: string;
    email: string;
  };
  item: {
    id: string;
    itemName: string;
    reportType: string;
    category: string;
    city: string;
    state: string;
    images: Array<{ url: string; publicId: string }>;
  };
  matchPercentage: number | null;
  proofDescription: string;
  distinctiveProof?: string;
  supportingEvidence: Array<{ url: string; publicId: string }>;
  status: string;
  adminRemarks?: string;
  createdAt: string;
}

export async function getAdminClaims(params: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  await connectDB();

  const { status = 'all', page = 1, limit = 10 } = params;
  const query: any = {};
  if (status !== 'all') {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  const [claims, total] = await Promise.all([
    Claim.find(query)
      .select('+proofDescription +distinctiveProof')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('claimantId', 'name email')
      .populate('reportId', 'itemName reportType category city state images')
      .populate('matchId', 'finalScore')
      .lean(),
    Claim.countDocuments(query),
  ]);

  const formattedClaims: AdminClaimItem[] = claims.map((c: any) => ({
    id: c._id.toString(),
    claimant: {
      id: c.claimantId?._id?.toString() || '',
      name: c.claimantId?.name || 'Unknown User',
      email: c.claimantId?.email || '',
    },
    item: {
      id: c.reportId?._id?.toString() || '',
      itemName: c.reportId?.itemName || 'Untitled Report',
      reportType: c.reportId?.reportType || 'LOST',
      category: c.reportId?.category || 'Other',
      city: c.reportId?.city || '',
      state: c.reportId?.state || '',
      images: c.reportId?.images || [],
    },
    matchPercentage: c.matchId?.finalScore ? Math.round(c.matchId.finalScore * 100) : null,
    proofDescription: c.proofDescription || '',
    distinctiveProof: c.distinctiveProof || '',
    supportingEvidence: c.supportingEvidence || [],
    status: c.status || 'pending',
    adminRemarks: c.adminRemarks,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
  }));

  return {
    claims: formattedClaims,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
