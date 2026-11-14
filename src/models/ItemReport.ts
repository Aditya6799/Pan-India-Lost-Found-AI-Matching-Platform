import mongoose, { Schema, Model, Document } from 'mongoose';
import { IItemReport, ItemCategory, ReportType, ReportStatus, ModerationStatus, ContactPreference } from '@/types';

export interface IItemReportDocument extends Omit<IItemReport, '_id'>, Document {}

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    embedding: {
      type: [Number],
      select: false,
      default: undefined,
    },
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Clothing',
  'Accessories',
  'Documents',
  'Jewelry',
  'Bags',
  'Keys',
  'Books',
  'Pets',
  'Vehicles',
  'Wallets',
  'Sports',
  'Toys',
  'Musical Instruments',
  'Medical Equipment',
  'Other',
];

const ItemReportSchema = new Schema<IItemReportDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    reportType: {
      type: String,
      enum: {
        values: ['LOST', 'FOUND'] as ReportType[],
        message: '{VALUE} is not a valid report type',
      },
      required: [true, 'Report type is required'],
      index: true,
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [200, 'Item name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    brand: {
      type: String,
      trim: true,
    },
    color: {
      type: [String],
      default: [],
    },
    distinctiveFeatures: {
      type: String,
      maxlength: [500, 'Distinctive features cannot exceed 500 characters'],
    },
    images: {
      type: [ImageSchema],
      default: [],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    locality: {
      type: String,
      trim: true,
    },
    location: {
      type: LocationSchema,
      default: undefined,
    },
    lostFoundDate: {
      type: Date,
      required: [true, 'Date is required'],
    },
    lostFoundTime: {
      type: String,
    },
    textEmbedding: {
      type: [Number],
      select: false,
      default: undefined,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'recovered', 'closed'] as ReportStatus[],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
      index: true,
    },
    moderationStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'] as ModerationStatus[],
        message: '{VALUE} is not a valid moderation status',
      },
      default: 'approved',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    additionalInfo: {
      type: String,
    },
    contactPreference: {
      type: String,
      enum: {
        values: ['email', 'phone', 'both'] as ContactPreference[],
        message: '{VALUE} is not a valid contact preference',
      },
      default: 'email',
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index (sparse for optional locations)
ItemReportSchema.index({ location: '2dsphere' }, { sparse: true });

// Compound indexes
ItemReportSchema.index({ userId: 1, reportType: 1 });
ItemReportSchema.index({ reportType: 1, moderationStatus: 1, status: 1 });
ItemReportSchema.index({ state: 1, city: 1 });
ItemReportSchema.index({ category: 1, reportType: 1 });
ItemReportSchema.index({ lostFoundDate: -1 });

// Text index
ItemReportSchema.index(
  {
    itemName: 'text',
    description: 'text',
    brand: 'text',
  },
  {
    weights: {
      itemName: 5,
      brand: 3,
      description: 1,
    },
    name: 'ItemReportTextIndex',
  }
);

const ItemReport: Model<IItemReportDocument> =
  mongoose.models.ItemReport || mongoose.model<IItemReportDocument>('ItemReport', ItemReportSchema);

export default ItemReport;
