import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import Match from "@/models/Match";
import ItemReport from "@/models/ItemReport";
import User from "@/models/User";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "Dashboard | FoundIt",
  description: "Citizen Lost & Found Dashboard",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/dashboard`);
  }

  let unreadNotificationsCount = 0;
  let unresolvedMatchesCount = 0;
  let userProfileImage = session.user.image || null;

  try {
    await connectDB();
    const userId = session.user.id;

    // Fetch latest user avatar from DB
    const dbUser = await User.findById(userId).select("profileImage").lean();
    if (dbUser?.profileImage) {
      userProfileImage = dbUser.profileImage;
    }

    // Fetch unread notifications count
    unreadNotificationsCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    // Fetch user's report IDs to count pending matches
    const userReports = await ItemReport.find({ userId }).select("_id").lean();
    const reportIds = userReports.map((r) => r._id);

    if (reportIds.length > 0) {
      unresolvedMatchesCount = await Match.countDocuments({
        $or: [
          { lostReportId: { $in: reportIds } },
          { foundReportId: { $in: reportIds } },
        ],
        status: "pending",
      });
    }
  } catch (err) {
    console.error("Dashboard layout data count error:", err);
  }

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: userProfileImage,
        role: session.user.role,
      }}
      unreadCount={unreadNotificationsCount}
      matchesCount={unresolvedMatchesCount}
    >
      {children}
    </DashboardShell>
  );
}
