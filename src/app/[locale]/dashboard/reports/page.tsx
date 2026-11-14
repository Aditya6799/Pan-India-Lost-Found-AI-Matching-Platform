"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/reports/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import {
  FileText,
  Search,
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";

interface ReportItem {
  _id: string;
  reportType: "LOST" | "FOUND";
  itemName: string;
  category: string;
  description: string;
  state: string;
  city: string;
  lostFoundDate: string;
  status: "active" | "recovered" | "closed";
  images: Array<{ url: string; publicId: string }>;
  views: number;
}

export default function MyReportsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<"ALL" | "LOST" | "FOUND">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status change modal state
  const [reportToUpdate, setReportToUpdate] = useState<ReportItem | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "recovered" | "closed">("recovered");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = new URL("/api/reports", window.location.origin);
      if (activeTab !== "ALL") url.searchParams.set("type", activeTab);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      if (searchQuery.trim()) url.searchParams.set("q", searchQuery.trim());
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", limit.toString());

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load reports");
      const data = await res.json();

      setReports(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetch reports error:", err);
      addToast({
        type: "error",
        message: "Failed to load reports. Please try refreshing.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, statusFilter, searchQuery, page, limit, addToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Delete Report
  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/reports/${reportToDelete._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete report");

      addToast({
        type: "success",
        title: "Report Closed",
        message: `"${reportToDelete.itemName}" has been marked as closed.`,
      });

      setReportToDelete(null);
      fetchReports();
    } catch (err) {
      console.error("Delete error:", err);
      addToast({
        type: "error",
        message: "Failed to close the report. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Update Report Status
  const handleUpdateStatus = async () => {
    if (!reportToUpdate) return;
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/reports/${reportToUpdate._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      addToast({
        type: "success",
        title: "Status Updated",
        message: `Report marked as ${newStatus}.`,
      });

      setReportToUpdate(null);
      fetchReports();
    } catch (err) {
      console.error("Status update error:", err);
      addToast({
        type: "error",
        message: "Failed to update report status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-neutral-900 dark:text-neutral-50 tracking-tight">
            My Registered Reports
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage your filed lost belongings and found items cataloged on the network
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/report/lost`}>
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
              Report Lost
            </Button>
          </Link>
          <Link href={`/${locale}/report/found`}>
            <Button variant="secondary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
              Report Found
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        {/* Type Tabs */}
        <div className="flex items-center rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800/80">
          {(["ALL", "LOST", "FOUND"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-neutral-50"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              {tab === "ALL" ? "All Reports" : tab === "LOST" ? "Lost Items" : "Found Items"}
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-neutral-300 bg-white py-1.5 px-3 text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="recovered">Recovered</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Reports Table / List */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-neutral-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="text-sm">Loading your reports...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<FileText className="h-8 w-8 text-neutral-400" />}
              title="No reports found"
              description={
                searchQuery
                  ? "No reports match your search query or filter combination."
                  : "You haven't posted any reports in this category yet."
              }
              action={
                <Link href={`/${locale}/report/lost`}>
                  <Button variant="primary" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                    Create Your First Report
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
                  <th className="px-5 py-3.5">Reported Item</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                    {/* Thumbnail & Item Name */}
                    <td className="px-5 py-4 font-medium text-neutral-900 dark:text-neutral-100">
                      <div className="flex items-center gap-3">
                        {report.images?.[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={report.images[0].url}
                            alt={report.itemName}
                            className="h-10 w-10 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/${locale}/reports/${report._id}`}
                            className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors block max-w-xs truncate"
                          >
                            {report.itemName}
                          </Link>
                          <span className="text-[11px] text-neutral-400 block truncate max-w-xs">
                            {report.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Report Type */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          report.reportType === "LOST"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        }`}
                      >
                        {report.reportType}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4 text-xs text-neutral-700 dark:text-neutral-300">
                      {report.category}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                        <span className="truncate max-w-[120px]">
                          {report.city}, {report.state}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {formatDate(report.lostFoundDate)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <StatusBadge status={report.status || "active"} size="sm" />
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/${locale}/reports/${report._id}`}
                          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setReportToUpdate(report);
                            setNewStatus(report.status);
                          }}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                          title="Update Status"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setReportToDelete(report)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                          title="Close / Delete Report"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Showing {reports.length} of {total} reports
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Delete / Close Confirmation Modal */}
      <Modal
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        title="Close Report Confirmation"
        description="Are you sure you want to close this report?"
        size="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReportToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteReport}
              isLoading={isDeleting}
            >
              Confirm Close
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2 text-sm text-neutral-600 dark:text-neutral-300">
          <p>
            Closing the report for{" "}
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              &quot;{reportToDelete?.itemName}&quot;
            </span>{" "}
            will archive it from active search and pause automated AI notifications.
          </p>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={!!reportToUpdate}
        onClose={() => setReportToUpdate(null)}
        title="Update Report Status"
        size="sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReportToUpdate(null)}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdateStatus}
              isLoading={isUpdatingStatus}
            >
              Save Status
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Update the lifecycle state for{" "}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {reportToUpdate?.itemName}
            </span>
            :
          </p>

          <div className="space-y-2">
            {[
              {
                value: "active",
                label: "Active",
                desc: "Item is actively missing or being held for recovery",
              },
              {
                value: "recovered",
                label: "Recovered",
                desc: "Item has been successfully reunited with its rightful owner",
              },
              {
                value: "closed",
                label: "Closed",
                desc: "No further action needed on this item",
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  newStatus === opt.value
                    ? "border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 dark:border-primary-500"
                    : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                }`}
              >
                <input
                  type="radio"
                  name="reportStatus"
                  value={opt.value}
                  checked={newStatus === opt.value}
                  onChange={() => setNewStatus(opt.value as any)}
                  className="mt-0.5 text-primary-600"
                />
                <div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 block">
                    {opt.label}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {opt.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
