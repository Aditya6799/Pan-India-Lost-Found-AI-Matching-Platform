"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  ShieldAlert,
  Bell,
  Settings,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useUIStore } from "@/stores/ui-store";

export interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  } | null;
  unreadNotificationsCount?: number;
  unresolvedMatchesCount?: number;
  className?: string;
}

export function Sidebar({
  user,
  unreadNotificationsCount = 0,
  unresolvedMatchesCount = 0,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const navItems = [
    {
      title: "Dashboard Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "My Reports",
      href: "/dashboard/reports",
      icon: FileText,
    },
    {
      title: "AI Matches",
      href: "/dashboard/matches",
      icon: Sparkles,
      badge: unresolvedMatchesCount > 0 ? unresolvedMatchesCount : undefined,
      badgeColor: "bg-blue-600",
    },
    {
      title: "My Claims",
      href: "/dashboard/claims",
      icon: ShieldAlert,
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: "bg-red-600",
    },
    ...(user?.role === "admin"
      ? [
          {
            title: "Admin Analytics",
            href: "/admin/analytics",
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 ease-in-out dark:border-neutral-800 dark:bg-neutral-950 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none",
          className
        )}
      >
        {/* Top Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-100 dark:border-neutral-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-heading text-lg font-bold text-neutral-900 dark:text-neutral-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-extrabold text-sm">
              F
            </span>
            <span>Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
            Main Menu
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 font-semibold"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-neutral-400 dark:text-neutral-500"
                    )}
                  />
                  <span>{item.title}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold text-white shadow-xs",
                      item.badgeColor || "bg-primary-600"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Info Card at Bottom */}
        <div className="border-t border-neutral-100 p-4 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <Link
            href="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors group"
          >
            <Avatar
              src={user?.image}
              name={user?.name || "User"}
              size="md"
              className="border border-neutral-200 dark:border-neutral-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {user?.name || "Citizen User"}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 shrink-0" />
          </Link>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
