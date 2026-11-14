import { Types } from 'mongoose';

// User Types & Enums
export type UserRole = 'user' | 'admin' | 'moderator';
export type PreferredLanguage = 'en' | 'hi';

export interface IUser {
  _id?: Types.ObjectId | string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  profileImage?: string;
  phone?: string;
  preferredLanguage: PreferredLanguage;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Report Types & Enums
export type ReportType = 'LOST' | 'FOUND';

export type ItemCategory =
  | 'Electronics'
  | 'Clothing'
  | 'Accessories'
  | 'Documents'
  | 'Jewelry'
  | 'Bags'
  | 'Keys'
  | 'Books'
  | 'Pets'
  | 'Vehicles'
  | 'Wallets'
  | 'Sports'
  | 'Toys'
  | 'Musical Instruments'
  | 'Medical Equipment'
  | 'Other';

export type ReportStatus = 'active' | 'recovered' | 'closed';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type ContactPreference = 'email' | 'phone' | 'both';

export interface IItemImage {
  url: string;
  publicId: string;
  embedding?: number[];
}

export interface IGeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IItemReport {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string | IUser;
  reportType: ReportType;
  itemName: string;
  category: ItemCategory;
  subcategory?: string;
  description: string;
  brand?: string;
  color?: string[];
  distinctiveFeatures?: string;
  images: IItemImage[];
  state: string;
  city: string;
  locality?: string;
  location?: IGeoLocation;
  lostFoundDate: Date;
  lostFoundTime?: string;
  textEmbedding?: number[];
  status: ReportStatus;
  moderationStatus: ModerationStatus;
  views: number;
  additionalInfo?: string;
  contactPreference: ContactPreference;
  createdAt?: Date;
  updatedAt?: Date;
}

// Match Types & Enums
export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'resolved';
export type MatchingProvider = 'semantic' | 'lexical' | 'hybrid';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface IMatch {
  _id?: Types.ObjectId | string;
  lostReportId: Types.ObjectId | string | IItemReport;
  foundReportId: Types.ObjectId | string | IItemReport;
  textScore: number;
  imageScore: number | null;
  attributeScore: number;
  locationScore: number;
  dateScore: number;
  finalScore: number;
  matchReasons: string[];
  matchingProvider: MatchingProvider;
  confidenceLevel: ConfidenceLevel;
  status: MatchStatus;
  notificationSent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Claim Types & Enums
export type ClaimStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved';

export interface IClaimEvidence {
  url: string;
  publicId: string;
}

export interface IClaim {
  _id?: Types.ObjectId | string;
  reportId: Types.ObjectId | string | IItemReport;
  matchId?: Types.ObjectId | string | IMatch;
  claimantId: Types.ObjectId | string | IUser;
  proofDescription: string;
  distinctiveProof?: string;
  supportingEvidence: IClaimEvidence[];
  status: ClaimStatus;
  reviewedBy?: Types.ObjectId | string | IUser;
  adminRemarks?: string;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Notification Types & Enums
export type NotificationType =
  | 'match_found'
  | 'claim_submitted'
  | 'claim_approved'
  | 'claim_rejected'
  | 'report_approved'
  | 'report_rejected'
  | 'item_recovered'
  | 'system';

export interface INotification {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string | IUser;
  title: string;
  message: string;
  type: NotificationType;
  relatedReportId?: Types.ObjectId | string | IItemReport;
  relatedMatchId?: Types.ObjectId | string | IMatch;
  relatedClaimId?: Types.ObjectId | string | IClaim;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// AuditLog Types & Enums
export type AuditResourceType = 'User' | 'ItemReport' | 'Match' | 'Claim' | 'Notification';

export interface IAuditLog {
  _id?: Types.ObjectId | string;
  userId?: Types.ObjectId | string | IUser;
  action: string;
  resourceType?: AuditResourceType;
  resourceId?: Types.ObjectId | string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// API and Pagination Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Input Types for Form & API
export interface CreateReportInput {
  reportType: ReportType;
  itemName: string;
  category: ItemCategory;
  subcategory?: string;
  description: string;
  brand?: string;
  color?: string[];
  distinctiveFeatures?: string;
  images?: Array<{ url: string; publicId: string }>;
  state: string;
  city: string;
  locality?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  lostFoundDate: string | Date;
  lostFoundTime?: string;
  additionalInfo?: string;
  contactPreference?: ContactPreference;
}

export interface UpdateReportInput extends Partial<CreateReportInput> {
  status?: ReportStatus;
  moderationStatus?: ModerationStatus;
}

export interface SearchFilters {
  query?: string;
  reportType?: ReportType;
  category?: ItemCategory | string;
  subcategory?: string;
  state?: string;
  city?: string;
  color?: string;
  brand?: string;
  startDate?: string;
  endDate?: string;
  status?: ReportStatus;
  page?: number;
  limit?: number;
  sortBy?: 'lostFoundDate' | 'createdAt' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateClaimInput {
  reportId: string;
  matchId?: string;
  proofDescription: string;
  distinctiveProof?: string;
  supportingEvidence?: Array<{ url: string; publicId: string }>;
}

export interface MatchResult {
  matchId?: string;
  reportId: string;
  score: number;
  percentage: number;
  reasons: string[];
  confidence: ConfidenceLevel;
  provider: MatchingProvider;
  reportData?: Partial<IItemReport>;
}
