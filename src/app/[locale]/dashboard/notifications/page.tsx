"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { formatRelativeTime } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import {
  Bell,
  CheckCheck,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Award,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedReportId?: {
    _id: string;
    itemName?: string;
  };
  relatedMatchId?: {
    _id: string;
  };
  relatedClaimId?: {
    _id: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { addToast } = useUIStore();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = new URL("/api/notifications", window.location.origin);
      if (unreadOnly) url.searchParams.set("unreadOnly", "true");
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", "15");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();

      setNotifications(data.data || []);
      setTotal(data.total || 0);
      setUnreadCount(data.unreadCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetch notifications error:", err);
      addToast({
        type: "error",
        message: "Failed to load notifications.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [unreadOnly, page, addToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAll(true);
      const res = await fetch("/api/notifications", {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to update");

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      addToast({
        type: "success",
        message: "All notifications marked as read.",
      });
    } catch (err) {
      console.error("Mark all read error:", err);
      addToast({
        type: "error",
        message: "Failed to mark all as read.",
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Mark single as read and navigate
  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await fetch(`/api/notifications/${notif._id}/read`, {
          method: "POST",
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.warn("Mark single read error:", err);
      }
    }

    // Determine target route
    if (notif.type === "match_found") {
      router.push(`/${locale}/dashboard/matches`);
    } else if (notif.type?.includes("claim")) {
      router.push(`/${locale}/dashboard/claims`);
    } else if (notif.relatedReportId?._id) {
      router.push(`/${locale}/reports/${notif.relatedReportId._id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "match_found":
        return <Sparkles className="h-4 w-4 text-blue-600" />;
      case "claim_submitted":
        return <ShieldAlert className="h-4 w-4 text-purple-600" />;
      case "claim_approved":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "claim_rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "report_approved":
        return <FileText className="h-4 w-4 text-emerald-600" />;
      case "report_rejected":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "item_recovered":
        return <Award className="h-4 w-4 text-emerald-600" />;
      default:
        return <Bell className="h-4 w-4 text-neutral-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-neutral-900 dark:text-neutral-50 tracking-tight">
              Notifications & Activity
            </h1>
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time alerts for algorithmic matches, verification requests, and claim approvals
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleMarkAllRead}
              isLoading={isMarkingAll}
              leftIcon={<CheckCheck className="h-4 w-4" />}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <button
          onClick={() => {
            setUnreadOnly(false);
            setPage(1);
          }}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
            !unreadOnly
              ? "bg-primary-600 text-white shadow-xs"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => {
            setUnreadOnly(true);
            setPage(1);
          }}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
            unreadOnly
              ? "bg-primary-600 text-white shadow-xs"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List Container */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-neutral-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="text-sm">Loading activity stream...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Bell className="h-8 w-8 text-neutral-400" />}
              title="No notifications to show"
              description={
                unreadOnly
                  ? "You have caught up with all your notifications!"
                  : "You'll be alerted here whenever new matches are discovered or claims are reviewed."
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors ${
                  !notif.isRead
                    ? "bg-blue-50/40 dark:bg-blue-950/20"
                    : "bg-white dark:bg-neutral-900"
                }`}
              >
                {/* Icon Container */}
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-sm ${
                        !notif.isRead
                          ? "font-bold text-neutral-900 dark:text-neutral-50"
                          : "font-semibold text-neutral-800 dark:text-neutral-200"
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-xs text-neutral-400 shrink-0">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      <span>View details</span>
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </div>

                {/* Unread Blue Dot */}
                {!notif.isRead && (
                  <div className="mt-2 flex h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 flex justify-between items-center border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Showing {notifications.length} of {total} alerts
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
