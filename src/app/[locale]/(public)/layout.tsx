import React, { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

function PublicPageLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

export default async function PublicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors">
      <Navbar
        user={
          session?.user
            ? {
                name: session.user.name,
                email: session.user.email,
                role: session.user.role,
              }
            : null
        }
      />
      <main className="flex-1">
        <Suspense fallback={<PublicPageLoading />}>
          {children}
        </Suspense>
      </main>
      {modal}
      <Footer />
    </div>
  );
}
