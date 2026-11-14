import mongoose, { Schema, Model, Document } from 'mongoose';
import { IAuditLog, AuditResourceType } from '@/types';

export interface IAuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

const RESOURCE_TYPES: AuditResourceType[] = ['User', 'ItemReport', 'Match', 'Claim', 'Notification'];

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    resourceType: {
      type: String,
      enum: {
        values: RESOURCE_TYPES,
        message: '{VALUE} is not a valid resource type',
      },
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 90, // TTL 90 days in seconds
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ timestamp: -1 });

const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;
