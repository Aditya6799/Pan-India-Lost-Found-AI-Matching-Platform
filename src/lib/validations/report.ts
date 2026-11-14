import { z } from "zod";

const baseReportFields = {
  itemName: z
    .string()
    .min(3, "Item name must be at least 3 characters")
    .max(200, "Item name cannot exceed 200 characters")
    .trim(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional().default(""),
  description: z
    .string()
    .min(20, "Please describe the item in detail (min 20 characters)")
    .max(2000, "Description cannot exceed 2000 characters")
    .trim(),
  brand: z.string().max(100, "Brand cannot exceed 100 characters").optional().default(""),
  color: z.array(z.string()).min(1, "Select at least one color"),
  distinctiveFeatures: z
    .string()
    .max(500, "Distinctive features cannot exceed 500 characters")
    .optional()
    .default(""),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  locality: z.string().max(200, "Locality cannot exceed 200 characters").optional().default(""),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  lostFoundDate: z
    .string()
    .or(z.date())
    .refine(
      (val) => {
        const d = new Date(val);
        return !isNaN(d.getTime()) && d <= new Date(Date.now() + 86400000);
      },
      { message: "Date cannot be in the future" }
    ),
  lostFoundTime: z.string().optional().default(""),
  images: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        publicId: z.string(),
      })
    )
    .max(5, "Maximum 5 images allowed")
    .optional()
    .default([]),
  additionalInfo: z.string().max(1000).optional().default(""),
  contactPreference: z.enum(["email", "phone", "both"]).default("email"),
};

export const lostReportSchema = z.object({
  ...baseReportFields,
  reportType: z.literal("LOST").default("LOST"),
});

export const foundReportSchema = z.object({
  ...baseReportFields,
  reportType: z.literal("FOUND").default("FOUND"),
  isSafelyStored: z.boolean().optional().default(true),
});

export const searchFiltersSchema = z.object({
  query: z.string().optional().default(""),
  reportType: z.enum(["ALL", "LOST", "FOUND"]).optional().default("ALL"),
  category: z.string().optional().default(""),
  subcategory: z.string().optional().default(""),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  color: z.string().optional().default(""),
  brand: z.string().optional().default(""),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radiusKm: z.number().min(1).max(1000).optional().default(50),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  sortBy: z.enum(["relevance", "date_desc", "date_asc"]).optional().default("date_desc"),
});

export type LostReportInput = z.infer<typeof lostReportSchema>;
export type FoundReportInput = z.infer<typeof foundReportSchema>;
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;
