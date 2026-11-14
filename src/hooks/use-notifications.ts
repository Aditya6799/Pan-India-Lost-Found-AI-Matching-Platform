"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { INotification, PaginatedResponse } from "@/types";

export interface NotificationsResponse extends PaginatedResponse<INotification> {
  unreadCount: number;
}

export function useNotifications() {
  return useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      return res.json();
    },
    refetchInterval: 30 * 1000, // Auto refresh every 30s
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (!res.ok) {
        throw new Error("Failed to mark notification as read");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to mark all as read");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
