"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/cloudinary";
import { createClaim, updateClaimStatus } from "./service";
import { createClaimSchema } from "@/lib/validations/claim";
import Claim from "@/models/Claim";
import connectDB from "@/lib/mongodb";

export async function submitClaim(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required to submit an ownership claim." };
  }

  try {
    const rawData = {
      reportId: formData.get("reportId") as string,
      matchId: (formData.get("matchId") as string) || undefined,
      proofDescription: formData.get("proofDescription") as string,
      distinctiveProof: (formData.get("distinctiveProof") as string) || "",
      contactPhone: (formData.get("contactPhone") as string) || "",
    };

    const validated = createClaimSchema.parse(rawData);

    // Upload supporting evidence files if provided
    const supportingEvidence: Array<{ url: string; publicId: string }> = [];
    const evidenceFiles = formData.getAll("evidence") as File[];
    for (const file of evidenceFiles) {
      if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadRes = await uploadImage(buffer, "claim-evidence");
        supportingEvidence.push({ url: uploadRes.url, publicId: uploadRes.publicId });
      }
    }

    const claim = await createClaim(session.user.id, {
      ...validated,
      supportingEvidence,
    });

    revalidatePath("/dashboard/claims");
    revalidatePath(`/reports/${validated.reportId}`);

    return { success: true, data: claim };
  } catch (error: any) {
    console.error("Error submitting claim:", error);
    return { success: false, error: error.message || "Failed to submit claim." };
  }
}

export async function withdrawClaim(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await connectDB();
    const claim = await Claim.findOne({ _id: id, claimantId: session.user.id });
    if (!claim) {
      return { success: false, error: "Claim not found or unauthorized." };
    }

    if (claim.status !== "pending") {
      return { success: false, error: "Cannot withdraw a claim that is already under review or resolved." };
    }

    await Claim.findByIdAndDelete(id);

    revalidatePath("/dashboard/claims");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to withdraw claim." };
  }
}
