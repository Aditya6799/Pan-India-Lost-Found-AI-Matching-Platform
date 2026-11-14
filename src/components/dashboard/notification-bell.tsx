"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Check, Sparkles, ShieldAlert, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string | Date;
  link?: string;
}

export interface NotificationBellProps {
  notifications?: NotificationItem[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  viewAllHref?: string;
  className?: string;
}

export function NotificationBell({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  viewAllHref = "/dashboard/notifications",
  className,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Click outside listener
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getIconForType = (type: string) => {
    switch (type) {
      case "match_found":
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      case "claim_submitted":
      case "claim_approved":
        return <ShieldAlert className="h-4 w-4 text-emerald-500" />;
      default:
        return <FileText className="h-4 w-4 text-neutral-500" />;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-neutral-900 animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-neutral-200 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden animate-in fade-in-0 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <h4 className="font-heading text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary-100 dark:bg-primary-950/80 px-2 py-0.5 text-xs font-semibold text-primary-700 dark:text-primary-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
                No notifications right now.
              </div>
            ) : (
              notifications.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className={cn(
                    "flex items-start gap-3 p-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                    !item.isRead && "bg-primary-50/40 dark:bg-primary-950/20"
                  )}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    {getIconForType(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 mt-0.5">
                      {item.message}
                    </p>
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => {
                          setIsOpen(false);
                          onMarkAsRead?.(item._id);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 dark:text-primary-400 mt-1 hover:underline"
                      >
                        View details <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  {!item.isRead && onMarkAsRead && (
                    <button
                      type="button"
                      onClick={() => onMarkAsRead(item._id)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 bg-neutral-50/50 p-2 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
            <Link
              href={viewAllHref}
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
