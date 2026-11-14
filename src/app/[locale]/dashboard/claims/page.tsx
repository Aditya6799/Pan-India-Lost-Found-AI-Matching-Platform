"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  FileText,
  MapPin,
  Loader2,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface ClaimItem {
  _id: string;
  reportId: {
    _id: string;
    itemName: string;
    category: string;
    state: string;
    city: string;
    lostFoundDate: string;
    images?: Array<{ url: string }>;
  };
  proofDescription: string;
  distinctiveProof?: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "resolved";
  adminRemarks?: string;
  resolvedAt?: string;
  createdAt: string;
}

export default function MyClaimsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { addToast } = useUIStore();

  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Claim Details Modal
  const [selectedClaim, setSelectedClaim] = useState<ClaimItem | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = new URL("/api/claims", window.location.origin);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", "10");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load claims");
      const data = await res.json();

      setClaims(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetch claims error:", err);
      addToast({
        type: "error",
        message: "Failed to retrieve your submitted claims.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page, addToast]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const getStatusBadge = (status: ClaimItem["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Loader2 className="h-3 w-3 animate-spin" />
            Under Review
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-neutral-900 dark:text-neutral-50 tracking-tight">
            My Submitted Claims
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Track ownership verification progress for found articles you have claimed
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchClaims}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Refresh Status
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        {[
          { id: "ALL", label: "All Claims" },
          { id: "pending", label: "Pending" },
          { id: "under_review", label: "Under Review" },
          { id: "approved", label: "Approved" },
          { id: "rejected", label: "Rejected" },
          { id: "resolved", label: "Resolved" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              statusFilter === tab.id
                ? "bg-primary-600 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Claims Table Container */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-neutral-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="text-sm">Fetching claim records...</span>
          </div>
        ) : claims.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<ShieldAlert className="h-8 w-8 text-neutral-400" />}
              title="No claims filed yet"
              description="When our AI engine finds an article matching your lost report, you can verify ownership and submit a claim directly."
              action={
                <Link href={`/${locale}/dashboard/matches`}>
                  <Button variant="primary" size="sm">
                    View AI Matches
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
              <thead className="bg-neutral-50/80 dark:bg-neutral-800/50 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">Target Item</th>
                  <th className="px-4 py-3.5">Category & Location</th>
                  <th className="px-4 py-3.5">Date Submitted</th>
                  <th className="px-4 py-3.5">Verification Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {claims.map((claim) => {
                  const rep = claim.reportId;
                  return (
                    <tr
                      key={claim._id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-5 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                        <div className="flex items-center gap-3">
                          {rep?.images?.[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={rep.images[0].url}
                              alt={rep.itemName || "Item"}
                              className="h-10 w-10 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-neutral-100 block max-w-xs truncate">
                              {rep?.itemName || "Untitled Item"}
                            </span>
                            <span className="text-[11px] text-neutral-400 block truncate max-w-xs">
                              {claim.proofDescription}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 block">
                          {rep?.category || "Unknown"}
                        </span>
                        <span className="text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {rep?.city}, {rep?.state}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        {formatDate(claim.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        {getStatusBadge(claim.status)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClaim(claim)}
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 flex justify-between items-center border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Showing {claims.length} of {total} claims
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Claim Detail Modal */}
      <Modal
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
        title="Claim Verification Details"
        size="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedClaim(null)}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Item Claimed</span>
              <span className="font-extrabold text-base text-neutral-900 dark:text-neutral-100">
                {selectedClaim?.reportId?.itemName}
              </span>
            </div>
            <div>
              {selectedClaim && getStatusBadge(selectedClaim.status)}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Your Stated Proof of Ownership:
            </h4>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
              {selectedClaim?.proofDescription}
            </div>
          </div>

          {selectedClaim?.distinctiveProof && (
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Private Verification Note:
              </h4>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {selectedClaim.distinctiveProof}
              </div>
            </div>
          )}

          {selectedClaim?.adminRemarks ? (
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/40">
              <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Custodian / Admin Verification Remarks:
              </span>
              <p className="text-blue-800 dark:text-blue-200 text-xs leading-relaxed">
                {selectedClaim.adminRemarks}
              </p>
            </div>
          ) : (
            <p className="text-neutral-400 text-xs italic">
              Awaiting review by item custodian or platform moderation desk.
            </p>
          )}

          <div className="pt-2 text-right">
            {selectedClaim?.reportId?._id && (
              <Link
                href={`/${locale}/reports/${selectedClaim.reportId._id}`}
                className="text-xs font-semibold text-primary-600 hover:underline"
              >
                View Public Report Page →
              </Link>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
