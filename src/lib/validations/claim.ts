import { z } from "zod";

export const createClaimSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  matchId: z.string().optional(),
  proofDescription: z
    .string()
    .min(20, "Please describe your ownership proof in detail (min 20 characters)")
    .max(2000, "Proof description cannot exceed 2000 characters")
    .trim(),
  distinctiveProof: z
    .string()
    .max(1000, "Distinctive proof cannot exceed 1000 characters")
    .optional()
    .default(""),
  supportingEvidence: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        publicId: z.string(),
      })
    )
    .max(5, "Maximum 5 evidence images allowed")
    .optional()
    .default([]),
  contactPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number")
    .optional()
    .or(z.literal("")),
});

export const updateClaimStatusSchema = z.object({
  status: z.enum(["pending", "under_review", "approved", "rejected", "resolved"]),
  adminRemarks: z.string().max(1000).optional().default(""),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>;
