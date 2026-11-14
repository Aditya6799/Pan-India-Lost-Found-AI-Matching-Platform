"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/cloudinary";
import {
  createReport,
  updateReport as updateReportService,
  deleteReport as deleteReportService,
  markRecovered as markRecoveredService,
} from "./service";
import { lostReportSchema, foundReportSchema } from "@/lib/validations/report";
import type { CreateReportInput, ItemCategory } from "@/types";

export async function createLostReport(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required to submit report." };
  }

  try {
    const rawData = {
      reportType: "LOST" as const,
      itemName: formData.get("itemName") as string,
      category: formData.get("category") as ItemCategory,
      subcategory: (formData.get("subcategory") as string) || "",
      description: formData.get("description") as string,
      brand: (formData.get("brand") as string) || "",
      color: formData.getAll("color").map(String),
      distinctiveFeatures: (formData.get("distinctiveFeatures") as string) || "",
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      locality: (formData.get("locality") as string) || "",
      latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
      longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
      lostFoundDate: formData.get("lostFoundDate") as string,
      lostFoundTime: (formData.get("lostFoundTime") as string) || "",
      additionalInfo: (formData.get("additionalInfo") as string) || "",
      contactPreference: (formData.get("contactPreference") as "email" | "phone" | "both") || "email",
    };

    const validated = lostReportSchema.parse(rawData);

    // Handle image files if attached
    const images: Array<{ url: string; publicId: string }> = [];
    const imageFiles = formData.getAll("images") as File[];
    for (const file of imageFiles) {
      if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadRes = await uploadImage(buffer, "lost-items");
        images.push({ url: uploadRes.url, publicId: uploadRes.publicId });
      }
    }

    const location =
      validated.latitude !== undefined && validated.longitude !== undefined && validated.latitude !== null && validated.longitude !== null
        ? { latitude: validated.latitude, longitude: validated.longitude }
        : undefined;

    const reportData: CreateReportInput = {
      ...validated,
      category: validated.category as ItemCategory,
      images,
      location,
    };

    const newReport = await createReport(session.user.id, reportData);

    revalidatePath("/dashboard/reports");
    revalidatePath("/search");

    return { success: true, data: newReport };
  } catch (error: any) {
    console.error("Error creating lost report:", error);
    return { success: false, error: error.message || "Failed to create lost report." };
  }
}

export async function createFoundReport(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required to submit report." };
  }

  try {
    const rawData = {
      reportType: "FOUND" as const,
      itemName: formData.get("itemName") as string,
      category: formData.get("category") as ItemCategory,
      subcategory: (formData.get("subcategory") as string) || "",
      description: formData.get("description") as string,
      brand: (formData.get("brand") as string) || "",
      color: formData.getAll("color").map(String),
      distinctiveFeatures: (formData.get("distinctiveFeatures") as string) || "",
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      locality: (formData.get("locality") as string) || "",
      latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
      longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
      lostFoundDate: formData.get("lostFoundDate") as string,
      lostFoundTime: (formData.get("lostFoundTime") as string) || "",
      additionalInfo: (formData.get("additionalInfo") as string) || "",
      contactPreference: (formData.get("contactPreference") as "email" | "phone" | "both") || "email",
      isSafelyStored: formData.get("isSafelyStored") === "true",
    };

    const validated = foundReportSchema.parse(rawData);

    const images: Array<{ url: string; publicId: string }> = [];
    const imageFiles = formData.getAll("images") as File[];
    for (const file of imageFiles) {
      if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadRes = await uploadImage(buffer, "found-items");
        images.push({ url: uploadRes.url, publicId: uploadRes.publicId });
      }
    }

    const location =
      validated.latitude !== undefined && validated.longitude !== undefined && validated.latitude !== null && validated.longitude !== null
        ? { latitude: validated.latitude, longitude: validated.longitude }
        : undefined;

    const reportData: CreateReportInput = {
      ...validated,
      category: validated.category as ItemCategory,
      images,
      location,
    };

    const newReport = await createReport(session.user.id, reportData);

    revalidatePath("/dashboard/reports");
    revalidatePath("/search");

    return { success: true, data: newReport };
  } catch (error: any) {
    console.error("Error creating found report:", error);
    return { success: false, error: error.message || "Failed to create found report." };
  }
}

export async function updateReport(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const updateData: Partial<CreateReportInput> = {};
    if (formData.has("itemName")) updateData.itemName = formData.get("itemName") as string;
    if (formData.has("category")) updateData.category = formData.get("category") as ItemCategory;
    if (formData.has("subcategory")) updateData.subcategory = formData.get("subcategory") as string;
    if (formData.has("description")) updateData.description = formData.get("description") as string;
    if (formData.has("brand")) updateData.brand = formData.get("brand") as string;
    if (formData.has("state")) updateData.state = formData.get("state") as string;
    if (formData.has("city")) updateData.city = formData.get("city") as string;
    if (formData.has("locality")) updateData.locality = formData.get("locality") as string;
    if (formData.has("lostFoundDate")) updateData.lostFoundDate = new Date(formData.get("lostFoundDate") as string);

    const updated = await updateReportService(id, session.user.id, updateData);
    revalidatePath("/dashboard/reports");
    revalidatePath(`/reports/${id}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update report." };
  }
}

export async function deleteReport(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await deleteReportService(id, session.user.id, session.user.role || "user");
    revalidatePath("/dashboard/reports");
    revalidatePath("/admin/reports");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete report." };
  }
}

export async function markAsRecovered(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const report = await markRecoveredService(id, session.user.id);
    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");
    return { success: true, data: report };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to mark item as recovered." };
  }
}
