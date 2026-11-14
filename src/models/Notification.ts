import mongoose, { Schema, Model, Document } from 'mongoose';
import { INotification, NotificationType } from '@/types';

export interface INotificationDocument extends Omit<INotification, '_id'>, Document {}

const NOTIFICATION_TYPES: NotificationType[] = [
  'match_found',
  'claim_submitted',
  'claim_approved',
  'claim_rejected',
  'report_approved',
  'report_rejected',
  'item_recovered',
  'system',
];

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: '{VALUE} is not a valid notification type',
      },
      required: [true, 'Notification type is required'],
    },
    relatedReportId: {
      type: Schema.Types.ObjectId,
      ref: 'ItemReport',
      default: null,
    },
    relatedMatchId: {
      type: Schema.Types.ObjectId,
      ref: 'Match',
      default: null,
    },
    relatedClaimId: {
      type: Schema.Types.ObjectId,
      ref: 'Claim',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for querying user notifications sorted by recent
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export default Notification;
