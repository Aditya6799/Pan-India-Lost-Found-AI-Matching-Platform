import mongoose, { Schema, Model, Document } from 'mongoose';
import { IClaim, ClaimStatus } from '@/types';

export interface IClaimDocument extends Omit<IClaim, '_id'>, Document {}

const ClaimEvidenceSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const ClaimSchema = new Schema<IClaimDocument>(
  {
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'ItemReport',
      required: [true, 'Report ID is required'],
      index: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: 'Match',
      default: null,
    },
    claimantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant ID is required'],
      index: true,
    },
    proofDescription: {
      type: String,
      required: [true, 'Proof description is required'],
      select: false,
    },
    distinctiveProof: {
      type: String,
      select: false,
    },
    supportingEvidence: {
      type: [ClaimEvidenceSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'under_review', 'approved', 'rejected', 'resolved'] as ClaimStatus[],
        message: '{VALUE} is not a valid claim status',
      },
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminRemarks: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
ClaimSchema.index({ reportId: 1, claimantId: 1 });
ClaimSchema.index({ claimantId: 1, status: 1 });

const Claim: Model<IClaimDocument> =
  mongoose.models.Claim || mongoose.model<IClaimDocument>('Claim', ClaimSchema);

export default Claim;
