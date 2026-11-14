'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import {
  FileText,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  fetchReportsAction,
  approveReport,
  rejectReport,
  bulkApproveReports,
  bulkRejectReports,
} from '@/features/admin/actions';
import { AdminReportItem } from '@/features/admin/service';
import { formatDate } from '@/lib/utils';

export default function AdminReportsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'en';
  const initialFilter = searchParams.get('filter') || 'pending';

  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [typeFilter, setTypeFilter] = useState('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    report: AdminReportItem | null;
    isBulk: boolean;
    reason: string;
  }>({
    isOpen: false,
    report: null,
    isBulk: false,
    reason: '',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReportsAction({
        search,
        moderationStatus: statusFilter,
        reportType: typeFilter,
        page,
        limit: 10,
      });
      setReports(data.reports);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReports();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, typeFilter, page]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(reports.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApprove = (reportId: string, itemName: string) => {
    startTransition(async () => {
      try {
        await approveReport(reportId);
        setFeedback({ type: 'success', text: `Approved "${itemName}" successfully.` });
        loadReports();
      } catch (err: any) {
        setFeedback({ type: 'error', text: err.message || 'Failed to approve report' });
      }
    });
  };

  const handleRejectConfirm = () => {
    if (!rejectModal.reason.trim()) return;

    startTransition(async () => {
      try {
        if (rejectModal.isBulk) {
          await bulkRejectReports(selectedIds, rejectModal.reason);
          setFeedback({
            type: 'success',
            text: `Bulk rejected ${selectedIds.length} reports.`,
          });
        } else if (rejectModal.report) {
          await rejectReport(rejectModal.report.id, rejectModal.reason);
          setFeedback({
            type: 'success',
            text: `Rejected "${rejectModal.report.itemName}".`,
          });
        }
        setRejectModal({ isOpen: false, report: null, isBulk: false, reason: '' });
        loadReports();
      } catch (err: any) {
        setFeedback({ type: 'error', text: err.message || 'Failed to reject' });
      }
    });
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        await bulkApproveReports(selectedIds);
        setFeedback({
          type: 'success',
          text: `Bulk approved ${selectedIds.length} reports.`,
        });
        loadReports();
      } catch (err: any) {
        setFeedback({ type: 'error', text: err.message || 'Bulk approval failed' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Report Moderation
          </h2>
          <p className="text-sm text-slate-500">
            Review, approve, or reject user-submitted lost and found items ({total} in view).
          </p>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              {selectedIds.length} selected
            </span>
            <Button
              size="sm"
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleBulkApprove}
              disabled={isPending}
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Approve Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
              onClick={() =>
                setRejectModal({
                  isOpen: true,
                  report: null,
                  isBulk: true,
                  reason: '',
                })
              }
              disabled={isPending}
            >
              <X className="h-3.5 w-3.5 mr-1" /> Reject Selected
            </Button>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search reports or locations..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-slate-50 dark:bg-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              <span>Moderation:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Moderation Status</option>
            </select>

            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 ml-2">
              <span>Type:</span>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="LOST">Lost Items</option>
              <option value="FOUND">Found Items</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={reports.length > 0 && selectedIds.length === reports.length}
                  />
                </th>
                <th className="py-3 px-4 font-semibold">Item & Category</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Submitted By</th>
                <th className="py-3 px-4 font-semibold">Location & Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No reports match the current filter criteria.
                  </td>
                </tr>
              ) : (
                reports.map((r) => {
                  const isChecked = selectedIds.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isChecked ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(r.id)}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            {r.images && r.images.length > 0 ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={r.images[0].url}
                                alt={r.itemName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FileText className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div className="max-w-xs">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {r.itemName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {r.category} • {r.description.slice(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={r.reportType === 'LOST' ? 'lost' : 'found'}>
                          {r.reportType}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="overflow-hidden">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {r.user?.name || 'Anonymous'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{r.user?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center space-x-1 truncate">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>
                            {r.city}, {r.state}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{formatDate(r.lostFoundDate, 'MMM dd, yyyy')}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            r.moderationStatus === 'approved'
                              ? 'approved'
                              : r.moderationStatus === 'rejected'
                              ? 'rejected'
                              : 'pending'
                          }
                          className="capitalize text-[10px]"
                        >
                          {r.moderationStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {r.moderationStatus !== 'approved' && (
                            <Button
                              size="sm"
                              className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                              disabled={isPending}
                              onClick={() => handleApprove(r.id, r.itemName)}
                            >
                              <Check className="h-3 w-3 mr-0.5" /> Approve
                            </Button>
                          )}
                          {r.moderationStatus !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px] border-red-200 text-red-600 hover:bg-red-50"
                              disabled={isPending}
                              onClick={() =>
                                setRejectModal({
                                  isOpen: true,
                                  report: r,
                                  isBulk: false,
                                  reason: '',
                                })
                              }
                            >
                              <X className="h-3 w-3 mr-0.5" /> Reject
                            </Button>
                          )}
                          <Link href={`/${locale}/reports/${r.id}`} target="_blank">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing page <span className="font-semibold text-slate-800 dark:text-slate-200">{page}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({total} items)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage(page - 1)}
              className="h-8"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(page + 1)}
              className="h-8"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, report: null, isBulk: false, reason: '' })}
        title={rejectModal.isBulk ? `Reject ${selectedIds.length} Reports` : `Reject Report`}
        description={
          rejectModal.isBulk
            ? 'Provide a mandatory reason for rejecting the selected reports. Users will receive this feedback in notifications.'
            : `Provide a reason for rejecting "${rejectModal.report?.itemName}".`
        }
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Rejection Reason (Required):
            </label>
            <Textarea
              placeholder="e.g. Inappropriate content, spam, duplicate report, or missing verifiable details."
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setRejectModal({ isOpen: false, report: null, isBulk: false, reason: '' })
              }
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectModal.reason.trim() || isPending}
              onClick={handleRejectConfirm}
            >
              {isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
