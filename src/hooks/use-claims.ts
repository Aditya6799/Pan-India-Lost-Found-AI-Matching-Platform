"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { IClaim, PaginatedResponse, CreateClaimInput } from "@/types";

export function useClaims(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<IClaim>>({
    queryKey: ["user-claims", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/claims?page=${page}&limit=${limit}`);
      if (!res.ok) {
        throw new Error("Failed to fetch claims");
      }
      return res.json();
    },
  });
}

export function useClaim(id: string) {
  return useQuery<{ success: boolean; data: IClaim }>({
    queryKey: ["claim", id],
    queryFn: async () => {
      if (!id) throw new Error("Claim ID is required");
      const res = await fetch(`/api/claims/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch claim details");
      }
      return res.json();
    },
    enabled: Boolean(id),
  });
}

export function useSubmitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimData: CreateClaimInput) => {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit claim");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-claims"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
