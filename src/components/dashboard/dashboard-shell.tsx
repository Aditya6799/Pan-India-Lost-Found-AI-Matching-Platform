"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import {
  Menu,
  PlusCircle,
  LayoutDashboard,
  FileText,
  Sparkles,
  ShieldAlert,
  User as UserIcon,
  Search,
} from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  unreadCount?: number;
  matchesCount?: number;
}

export function DashboardShell({
  children,
  user,
  unreadCount = 0,
  matchesCount = 0,
}: DashboardShellProps) {
  const { toggleSidebar } = useUIStore();
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const mobileNavItems = [
    { title: "Overview", href: `/${locale}/dashboard`, icon: LayoutDashboard, exact: true },
    { title: "Reports", href: `/${locale}/dashboard/reports`, icon: FileText },
    { title: "Matches", href: `/${locale}/dashboard/matches`, icon: Sparkles, badge: matchesCount },
    { title: "Claims", href: `/${locale}/dashboard/claims`, icon: ShieldAlert },
    { title: "Profile", href: `/${locale}/profile`, icon: UserIcon },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50/70 dark:bg-neutral-950">
      {/* Desktop / Mobile Drawer Sidebar */}
      <Sidebar
        user={user}
        unreadNotificationsCount={unreadCount}
        unresolvedMatchesCount={matchesCount}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Sticky Dashboard Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href={`/${locale}/dashboard`}
              className="flex items-center gap-2 font-heading font-bold text-lg text-neutral-900 dark:text-neutral-50 lg:hidden"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white font-extrabold text-xs">
                F
              </span>
              <span>FoundIt</span>
            </Link>

            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              Citizen Portal
            </span>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/${locale}/report/lost`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Report Lost</span>
            </Link>

            <Link
              href={`/${locale}/report/found`}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-secondary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-secondary-700 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Report Found</span>
            </Link>

            <ThemeToggle />

            <Link
              href={`/${locale}/profile`}
              className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-primary-500/30 transition-all"
              title="View Profile"
            >
              <Avatar
                src={user?.image || undefined}
                fallback={user?.name || "User"}
                size="sm"
              />
            </Link>
          </div>
        </header>

        {/* Dashboard Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 lg:hidden">
          <div className="grid grid-cols-5 h-16">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center relative py-1 text-[11px] font-medium transition-colors ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400 font-semibold"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900"
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5 mb-0.5" />
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
export default DashboardShell;
