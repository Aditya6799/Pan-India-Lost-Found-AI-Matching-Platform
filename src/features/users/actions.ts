"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  updateUserProfile,
  changePassword,
  deactivateAccount,
  getUserById,
  getUserStats,
} from "./service";
import { passwordSchema } from "@/lib/validations/user";

export async function updateProfileAction(data: {
  name?: string;
  phone?: string;
  profileImage?: string;
  preferredLanguage?: "en" | "hi";
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updated = await updateUserProfile(session.user.id, data);
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (err: unknown) {
    console.error("Update profile error:", err);
    const msg = err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: msg };
  }
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parseResult = passwordSchema.safeParse(newPassword);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid new password",
    };
  }

  try {
    await changePassword(session.user.id, currentPassword, newPassword);
    return { success: true, message: "Password updated successfully" };
  } catch (err: unknown) {
    console.error("Change password error:", err);
    const msg = err instanceof Error ? err.message : "Failed to change password";
    return { success: false, error: msg };
  }
}

export async function deactivateAccountAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deactivateAccount(session.user.id);
    return { success: true, message: "Account has been deactivated" };
  } catch (err: unknown) {
    console.error("Deactivate account error:", err);
    const msg = err instanceof Error ? err.message : "Failed to deactivate account";
    return { success: false, error: msg };
  }
}

export async function getProfileDataAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [user, stats] = await Promise.all([
      getUserById(session.user.id),
      getUserStats(session.user.id),
    ]);
    return { success: true, user, stats };
  } catch (err: unknown) {
    console.error("Get profile data error:", err);
    return { success: false, error: "Failed to load profile data" };
  }
}
