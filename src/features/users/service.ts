import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ItemReport from "@/models/ItemReport";
import Match from "@/models/Match";
import Claim from "@/models/Claim";
import AuditLog from "@/models/AuditLog";
import * as bcrypt from "bcryptjs";
import type { IUser } from "@/types";

export interface UserStats {
  totalLost: number;
  totalFound: number;
  matches: number;
  claims: number;
  recoveries: number;
}

export async function getUserById(id: string): Promise<IUser | null> {
  await connectDB();
  const user = await User.findById(id).select("-passwordHash").lean();
  return user as unknown as IUser | null;
}

export async function updateUserProfile(
  id: string,
  data: Partial<IUser>
): Promise<IUser | null> {
  await connectDB();

  const updateFields: Record<string, unknown> = {};
  if (data.name) updateFields.name = data.name.trim();
  if (data.phone !== undefined) updateFields.phone = data.phone;
  if (data.profileImage !== undefined) updateFields.profileImage = data.profileImage;
  if (data.preferredLanguage) updateFields.preferredLanguage = data.preferredLanguage;

  const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true })
    .select("-passwordHash")
    .lean();

  if (!updatedUser) {
    throw new Error("User not found.");
  }

  await AuditLog.create({
    userId: id,
    action: "UPDATE_PROFILE",
    resourceType: "User",
    resourceId: id,
    timestamp: new Date(),
  });

  return updatedUser as unknown as IUser;
}

export async function changePassword(
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  await connectDB();

  const user = await User.findById(id).select("+passwordHash");
  if (!user || !user.passwordHash) {
    throw new Error("User not found.");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error("Current password does not match.");
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  await AuditLog.create({
    userId: id,
    action: "CHANGE_PASSWORD",
    resourceType: "User",
    resourceId: id,
    timestamp: new Date(),
  });

  return true;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  await connectDB();

  const [totalLost, totalFound, recoveries, userReports, claims] = await Promise.all([
    ItemReport.countDocuments({ userId, reportType: "LOST" }),
    ItemReport.countDocuments({ userId, reportType: "FOUND" }),
    ItemReport.countDocuments({ userId, status: "recovered" }),
    ItemReport.find({ userId }).select("_id").lean(),
    Claim.countDocuments({ claimantId: userId }),
  ]);

  const reportIds = userReports.map((r) => r._id);
  const matches = await Match.countDocuments({
    $or: [{ lostReportId: { $in: reportIds } }, { foundReportId: { $in: reportIds } }],
  });

  return {
    totalLost,
    totalFound,
    matches,
    claims,
    recoveries,
  };
}

export async function deactivateAccount(id: string): Promise<boolean> {
  await connectDB();

  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!user) {
    throw new Error("User not found.");
  }

  await AuditLog.create({
    userId: id,
    action: "DEACTIVATE_ACCOUNT",
    resourceType: "User",
    resourceId: id,
    timestamp: new Date(),
  });

  return true;
}
