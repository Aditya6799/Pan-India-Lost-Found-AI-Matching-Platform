"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { IMatch, PaginatedResponse } from "@/types";

export interface MatchFilterOptions {
  confidence?: "high" | "medium" | "low" | "all";
  status?: "pending" | "accepted" | "rejected" | "resolved" | "all";
  page?: number;
  limit?: number;
}

export function useMatches(filters: MatchFilterOptions = {}) {
  return useQuery<PaginatedResponse<IMatch>>({
    queryKey: ["user-matches", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.confidence && filters.confidence !== "all") params.set("confidence", filters.confidence);
      if (filters.status && filters.status !== "all") params.set("status", filters.status);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));

      const res = await fetch(`/api/matches?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch matches");
      }
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}

export function useMatch(id: string) {
  return useQuery<{ success: boolean; data: IMatch }>({
    queryKey: ["match", id],
    queryFn: async () => {
      if (!id) throw new Error("Match ID is required");
      const res = await fetch(`/api/matches/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch match details");
      }
      return res.json();
    },
    enabled: Boolean(id),
  });
}

export function useUpdateMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" | "resolved" }) => {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update match status");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-matches"] });
      queryClient.invalidateQueries({ queryKey: ["match", variables.id] });
    },
  });
}
