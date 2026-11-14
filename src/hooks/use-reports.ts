"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { IItemReport, PaginatedResponse, SearchFilters } from "@/types";

export function useReports(filters: Partial<SearchFilters> = {}) {
  return useQuery<PaginatedResponse<IItemReport>>({
    queryKey: ["reports", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.query) params.set("query", filters.query);
      if (filters.reportType) params.set("reportType", filters.reportType);
      if (filters.category && filters.category !== "All Categories") params.set("category", filters.category);
      if (filters.state && filters.state !== "All States") params.set("state", filters.state);
      if (filters.city) params.set("city", filters.city);
      if (filters.color) params.set("color", filters.color);
      if (filters.brand) params.set("brand", filters.brand);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }
      return res.json();
    },
    staleTime: 60 * 1000,
  });
}

export function useReport(id: string) {
  return useQuery<{ success: boolean; data: IItemReport }>({
    queryKey: ["report", id],
    queryFn: async () => {
      if (!id) throw new Error("Report ID is required");
      const res = await fetch(`/api/reports/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch report details");
      }
      return res.json();
    },
    enabled: Boolean(id),
  });
}

export function useUserReports(type?: "LOST" | "FOUND" | "ALL", status?: string) {
  return useQuery<PaginatedResponse<IItemReport>>({
    queryKey: ["user-reports", type, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type && type !== "ALL") params.set("type", type);
      if (status && status !== "ALL") params.set("status", status);

      const res = await fetch(`/api/reports/user?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch user reports");
      }
      return res.json();
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete report");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
