"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Notification } from "@/models";
import mongoose from "mongoose";

export async function markNotificationRead(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid notification ID" };
    }

    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return { success: false, error: "Notification not found" };
    }

    return { success: true, data: JSON.parse(JSON.stringify(notification)) };
  } catch (error) {
    console.error("markNotificationRead error:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsRead() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectDB();

    const result = await Notification.updateMany(
      { userId: session.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return { success: true, count: result.modifiedCount };
  } catch (error) {
    console.error("markAllNotificationsRead error:", error);
    return { success: false, error: "Failed to mark all notifications as read" };
  }
}
