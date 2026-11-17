import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export default async function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let userProfileImage = session?.user?.image || null;

  if (session?.user?.id) {
    try {
      await connectDB();
      const dbUser = await User.findById(session.user.id).select("profileImage").lean();
      if (dbUser?.profileImage) {
        userProfileImage = dbUser.profileImage;
      }
    } catch {}
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors">
      <Navbar
        user={
          session?.user
            ? {
                name: session.user.name,
                email: session.user.email,
                image: userProfileImage,
                role: session.user.role,
              }
            : null
        }
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
