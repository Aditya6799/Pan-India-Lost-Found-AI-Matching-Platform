"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MatchCard } from "@/components/reports/match-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useUIStore } from "@/stores/ui-store";
import {
  Sparkles,
  Filter,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Info,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface MatchItem {
  _id: string;
  finalScore: number;
  confidenceLevel: "high" | "medium" | "low";
  matchingProvider: string;
  matchReasons: string[];
  status: "pending" | "accepted" | "rejected" | "resolved";
  lostReportId: {
    _id: string;
    itemName: string;
    category: string;
    description: string;
    images?: Array<{ url: string }>;
    state: string;
    city: string;
    lostFoundDate: string;
  };
  foundReportId: {
    _id: string;
    itemName: string;
    category: string;
    description: string;
    images?: Array<{ url: string }>;
    state: string;
    city: string;
    lostFoundDate: string;
  };
}

export default function MatchesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { addToast } = useUIStore();

  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters
  const [confidenceFilter, setConfidenceFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  // Claim modal state
  const [claimingMatch, setClaimingMatch] = useState<MatchItem | null>(null);
  const [proofDescription, setProofDescription] = useState("");
  const [distinctiveProof, setDistinctiveProof] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = new URL("/api/matches", window.location.origin);
      if (confidenceFilter !== "ALL") url.searchParams.set("confidence", confidenceFilter.toLowerCase());
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", "10");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load matches");
      const data = await res.json();

      setMatches(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetch matches error:", err);
      addToast({
        type: "error",
        message: "Unable to load AI matches. Please try refreshing.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [confidenceFilter, statusFilter, page, addToast]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Dismiss / Reject Match
  const handleDismissMatch = async (matchId: string) => {
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!res.ok) throw new Error("Failed to dismiss match");

      addToast({
        type: "info",
        title: "Match Dismissed",
        message: "This recommendation has been removed from your active suggestions.",
      });

      fetchMatches();
    } catch (err) {
      console.error("Dismiss match error:", err);
      addToast({
        type: "error",
        message: "Failed to dismiss match. Try again.",
      });
    }
  };

  // Submit Claim
  const handleSubmitClaim = async () => {
    if (!claimingMatch) return;
    if (!proofDescription || proofDescription.length < 10) {
      addToast({
        type: "warning",
        title: "Proof Required",
        message: "Please describe your proof of ownership in at least 10 characters.",
      });
      return;
    }

    try {
      setIsSubmittingClaim(true);

      const targetReportId = claimingMatch.foundReportId._id;

      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: targetReportId,
          matchId: claimingMatch._id,
          proofDescription,
          distinctiveProof,
          supportingEvidence: [],
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to submit ownership claim");
      }

      addToast({
        type: "success",
        title: "Claim Submitted!",
        message: "Your verification claim has been sent to the item custodian and moderation desk.",
      });

      setClaimingMatch(null);
      setProofDescription("");
      setDistinctiveProof("");
      fetchMatches();
    } catch (err: unknown) {
      console.error("Submit claim error:", err);
      const msg = err instanceof Error ? err.message : "Error submitting claim";
      addToast({
        type: "error",
        title: "Submission Failed",
        message: msg,
      });
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-neutral-900 dark:text-neutral-50 tracking-tight">
              AI Intelligent Matches
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Sparkles className="h-3 w-3" />
              Multimodal AI
            </span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Automated neural pairings evaluated across text semantic embeddings, attributes, geo-proximity, and date intervals
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMatches}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Refresh Feed
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" />
            Status:
          </span>
          {[
            { id: "pending", label: "Active Suggestions" },
            { id: "accepted", label: "Claimed / Accepted" },
            { id: "rejected", label: "Dismissed" },
            { id: "ALL", label: "All Statuses" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setStatusFilter(s.id);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                statusFilter === s.id
                  ? "bg-primary-600 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            Confidence:
          </span>
          <select
            value={confidenceFilter}
            onChange={(e) => {
              setConfidenceFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-neutral-300 bg-white py-1 px-2.5 text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="ALL">All Confidence Levels</option>
            <option value="high">High Confidence (≥75%)</option>
            <option value="medium">Medium Confidence (50-74%)</option>
            <option value="low">Low Confidence (&lt;50%)</option>
          </select>
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-neutral-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="text-sm font-medium">Scanning AI Match Vector Database...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-10 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
            <EmptyState
              icon={<Sparkles className="h-10 w-10 text-blue-500" />}
              title="No AI matches found for this criteria"
              description="Our continuous matching pipeline pairs lost and found reports as soon as new articles are uploaded anywhere across India."
              action={
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  <Link href={`/${locale}/dashboard/reports`}>
                    <Button variant="outline" size="sm">Review My Reports</Button>
                  </Link>
                  <Link href={`/${locale}/search`}>
                    <Button variant="primary" size="sm">Search Public Database</Button>
                  </Link>
                </div>
              }
            />

            {/* Encouraging Tips Box */}
            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 max-w-xl mx-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary-600" />
                Tips to improve match discovery rate:
              </h4>
              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 list-disc pl-5">
                <li>Include serial numbers, brand names, and unique engravings in your report description.</li>
                <li>Tag GPS location or specify the landmark where you last saw the article.</li>
                <li>Upload at least 2 clear photos from different angles.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {matches.map((match) => {
              const lost = match.lostReportId;
              const found = match.foundReportId;
              if (!lost || !found) return null;

              return (
                <MatchCard
                  key={match._id}
                  matchId={match._id}
                  score={match.finalScore}
                  provider={match.matchingProvider}
                  matchReasons={match.matchReasons || []}
                  status={match.status}
                  onViewDetails={() => router.push(`/${locale}/reports/${found._id}`)}
                  onSubmitClaim={() => setClaimingMatch(match)}
                  onDismiss={() => handleDismissMatch(match._id)}
                  lostReport={{
                    id: lost._id,
                    itemName: lost.itemName,
                    imageUrl: lost.images?.[0]?.url || null,
                    state: lost.state,
                    city: lost.city,
                    date: lost.lostFoundDate,
                  }}
                  foundReport={{
                    id: found._id,
                    itemName: found.itemName,
                    imageUrl: found.images?.[0]?.url || null,
                    state: found.state,
                    city: found.city,
                    date: found.lostFoundDate,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 flex justify-between items-center border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Showing {matches.length} of {total} matches
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Submit Ownership Claim Modal */}
      <Modal
        isOpen={!!claimingMatch}
        onClose={() => setClaimingMatch(null)}
        title="Submit Ownership Claim"
        description="Provide verification proof to reclaim your belonging"
        size="lg"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClaimingMatch(null)}
              disabled={isSubmittingClaim}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitClaim}
              isLoading={isSubmittingClaim}
              leftIcon={<ShieldAlert className="h-4 w-4" />}
            >
              Submit Verification Claim
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2 text-neutral-700 dark:text-neutral-300">
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/60 p-3.5 border border-neutral-200 dark:border-neutral-700 text-xs flex justify-between items-center">
            <div>
              <span className="text-neutral-400 block uppercase font-semibold text-[10px]">Claiming Item</span>
              <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                {claimingMatch?.foundReportId?.itemName}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 block mt-0.5">
                Found in {claimingMatch?.foundReportId?.city}, {claimingMatch?.foundReportId?.state}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-400 block uppercase font-semibold text-[10px]">AI Match Score</span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                {claimingMatch ? Math.round(claimingMatch.finalScore <= 1 ? claimingMatch.finalScore * 100 : claimingMatch.finalScore) : 0}%
              </span>
            </div>
          </div>

          <div>
            <Textarea
              label="Proof of Ownership *"
              rows={3}
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              placeholder="Describe unique characteristics, purchase receipts, lockscreen wallpaper, or internal contents..."
              helperText="Minimum 10 characters. This information will be reviewed by platform moderation before contact details are released."
              showCount
              maxLength={1000}
            />
          </div>

          <div>
            <Textarea
              label="Confidential Identifying Details (Optional)"
              rows={2}
              value={distinctiveProof}
              onChange={(e) => setDistinctiveProof(e.target.value)}
              placeholder="e.g. Serial number, IMEI, specific cash denomination inside wallet, secret compartment contents..."
              helperText="Strictly confidential. Visible only to verified administrators for identity validation."
              showCount
              maxLength={500}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
