import mongoose, { Schema, Model, Document } from 'mongoose';
import { IMatch, MatchingProvider, ConfidenceLevel, MatchStatus } from '@/types';

export interface IMatchDocument extends Omit<IMatch, '_id'>, Document {}

const MatchSchema = new Schema<IMatchDocument>(
  {
    lostReportId: {
      type: Schema.Types.ObjectId,
      ref: 'ItemReport',
      required: [true, 'Lost report ID is required'],
      index: true,
    },
    foundReportId: {
      type: Schema.Types.ObjectId,
      ref: 'ItemReport',
      required: [true, 'Found report ID is required'],
      index: true,
    },
    textScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0,
    },
    imageScore: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    attributeScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0,
    },
    locationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0,
    },
    dateScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0,
    },
    finalScore: {
      type: Number,
      required: [true, 'Final score is required'],
      min: 0,
      max: 1,
      index: true,
    },
    matchReasons: {
      type: [String],
      default: [],
    },
    matchingProvider: {
      type: String,
      enum: {
        values: ['semantic', 'lexical', 'hybrid'] as MatchingProvider[],
        message: '{VALUE} is not a valid matching provider',
      },
      default: 'lexical',
    },
    confidenceLevel: {
      type: String,
      enum: {
        values: ['high', 'medium', 'low'] as ConfidenceLevel[],
        message: '{VALUE} is not a valid confidence level',
      },
      required: [true, 'Confidence level is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'resolved'] as MatchStatus[],
        message: '{VALUE} is not a valid match status',
      },
      default: 'pending',
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: only one match document between a lost & found pair
MatchSchema.index({ lostReportId: 1, foundReportId: 1 }, { unique: true });

const Match: Model<IMatchDocument> =
  mongoose.models.Match || mongoose.model<IMatchDocument>('Match', MatchSchema);

export default Match;
