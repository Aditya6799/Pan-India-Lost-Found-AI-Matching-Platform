'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchClaimsAction,
  approveClaim,
  rejectClaim,
  resolveClaim,
} from '@/features/admin/actions';
import { AdminClaimItem } from '@/features/admin/service';
import { formatDate } from '@/lib/utils';

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<AdminClaimItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Action modal
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    claim: AdminClaimItem | null;
    actionType: 'approve' | 'reject' | 'resolve' | null;
    remarks: string;
  }>({
    isOpen: false,
    claim: null,
    actionType: null,
    remarks: '',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadClaims = async () => {
    setIsLoading(true);
    try {
      const data = await fetchClaimsAction({
        status: statusFilter,
        page,
        limit: 10,
      });
      setClaims(data.claims);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('Failed to load claims:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const toggleRow = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const handleActionConfirm = () => {
    if (!actionModal.claim || !actionModal.actionType) return;

    startTransition(async () => {
      try {
        if (actionModal.actionType === 'approve') {
          await approveClaim(actionModal.claim!.id, actionModal.remarks);
          setFeedback({ type: 'success', text: `Approved claim for ${actionModal.claim!.item.itemName}.` });
        } else if (actionModal.actionType === 'reject') {
          await rejectClaim(actionModal.claim!.id, actionModal.remarks);
          setFeedback({ type: 'success', text: `Rejected claim for ${actionModal.claim!.item.itemName}.` });
        } else if (actionModal.actionType === 'resolve') {
          await resolveClaim(actionModal.claim!.id);
          setFeedback({ type: 'success', text: `Claim marked as resolved.` });
        }

        setActionModal({ isOpen: false, claim: null, actionType: null, remarks: '' });
        loadClaims();
      } catch (err: any) {
        setFeedback({ type: 'error', text: err.message || 'Operation failed' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Ownership Claims & Verification
        </h2>
        <p className="text-sm text-slate-500">
          Review ownership proofs submitted by claimants, inspect private details, and approve recovery handoffs ({total} total).
        </p>
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
            {feedback.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter by Claim Status:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'All Statuses', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Under Review', value: 'under_review' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'Resolved', value: 'resolved' },
            ].map((btn) => (
              <Button
                key={btn.value}
                size="sm"
                variant={statusFilter === btn.value ? 'default' : 'outline'}
                className={`text-xs h-8 ${
                  statusFilter === btn.value ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
                }`}
                onClick={() => {
                  setStatusFilter(btn.value);
                  setPage(1);
                }}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500">
                <th className="py-3 px-4 w-8"></th>
                <th className="py-3 px-4 font-semibold">Claimant</th>
                <th className="py-3 px-4 font-semibold">Claimed Item</th>
                <th className="py-3 px-4 font-semibold">AI Match Score</th>
                <th className="py-3 px-4 font-semibold">Date Submitted</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading claims...
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No claims found matching this status.
                  </td>
                </tr>
              ) : (
                claims.map((c) => {
                  const isExpanded = expandedRow === c.id;
                  return (
                    <React.Fragment key={c.id}>
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => toggleRow(c.id)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
                            title="Expand proof details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {c.claimant.name}
                          </p>
                          <p className="text-[11px] text-slate-500">{c.claimant.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {c.item.itemName}
                            </span>
                            <Badge variant={c.item.reportType === 'LOST' ? 'lost' : 'found'} className="text-[9px]">
                              {c.item.reportType}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {c.item.city}, {c.item.state} • {c.item.category}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          {c.matchPercentage !== null ? (
                            <div className="flex items-center space-x-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {c.matchPercentage}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Manual Claim</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {formatDate(c.createdAt, 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              c.status === 'approved' || c.status === 'resolved'
                                ? 'approved'
                                : c.status === 'rejected'
                                ? 'rejected'
                                : c.status === 'under_review'
                                ? 'match'
                                : 'pending'
                            }
                            className="capitalize text-[10px]"
                          >
                            {c.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {c.status !== 'approved' && c.status !== 'resolved' && (
                              <Button
                                size="sm"
                                className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() =>
                                  setActionModal({
                                    isOpen: true,
                                    claim: c,
                                    actionType: 'approve',
                                    remarks: '',
                                  })
                                }
                              >
                                Approve
                              </Button>
                            )}
                            {c.status !== 'rejected' && c.status !== 'resolved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px] border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  setActionModal({
                                    isOpen: true,
                                    claim: c,
                                    actionType: 'reject',
                                    remarks: '',
                                  })
                                }
                              >
                                Reject
                              </Button>
                            )}
                            {c.status === 'approved' && (
                              <Button
                                size="sm"
                                className="h-7 px-2 text-[11px] bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() =>
                                  setActionModal({
                                    isOpen: true,
                                    claim: c,
                                    actionType: 'resolve',
                                    remarks: '',
                                  })
                                }
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Proof Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
                          <td colSpan={7} className="p-4 pl-12 space-y-3">
                            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                              <ShieldAlert className="h-4 w-4 text-amber-500" />
                              <span>Private Ownership Proof (Admin Confidential)</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="font-semibold text-slate-500 block mb-1">
                                  Proof Description:
                                </span>
                                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                  {c.proofDescription || 'No description provided.'}
                                </p>
                              </div>

                              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="font-semibold text-slate-500 block mb-1">
                                  Distinctive Identifying Proof / Serial / Marks:
                                </span>
                                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                  {c.distinctiveProof || 'None provided.'}
                                </p>
                              </div>
                            </div>

                            {c.supportingEvidence && c.supportingEvidence.length > 0 && (
                              <div>
                                <span className="font-semibold text-slate-500 block mb-2 text-xs">
                                  Supporting Evidence Images / Receipts:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {c.supportingEvidence.map((ev, idx) => (
                                    <a
                                      key={idx}
                                      href={ev.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="h-16 w-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={ev.url}
                                        alt={`Evidence ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                      />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {c.adminRemarks && (
                              <div className="text-xs bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                                <span className="font-semibold text-amber-800 dark:text-amber-300">
                                  Current Admin Remarks:{' '}
                                </span>
                                <span className="text-amber-900 dark:text-amber-200">
                                  {c.adminRemarks}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({total} claims)
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

      {/* Action / Remarks Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, claim: null, actionType: null, remarks: '' })}
        title={
          actionModal.actionType === 'approve'
            ? 'Approve Ownership Claim'
            : actionModal.actionType === 'reject'
            ? 'Reject Ownership Claim'
            : 'Resolve Claim Hand-over'
        }
        description={`Provide administrator notes for ${actionModal.claim?.claimant.name}'s claim on "${actionModal.claim?.item.itemName}".`}
      >
        <div className="space-y-4 py-2">
          {actionModal.actionType !== 'resolve' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Admin Remarks (Communicated to claimant):
              </label>
              <Textarea
                placeholder="e.g. Serial numbers verified against manufacturer invoice. Item approved for return."
                value={actionModal.remarks}
                onChange={(e) =>
                  setActionModal((prev) => ({ ...prev, remarks: e.target.value }))
                }
                rows={3}
              />
            </div>
          )}

          {actionModal.actionType === 'resolve' && (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Confirm that the item has been physically recovered and returned to the rightful owner. This will complete the case.
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setActionModal({ isOpen: false, claim: null, actionType: null, remarks: '' })
              }
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className={
                actionModal.actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : actionModal.actionType === 'reject'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
              disabled={isPending}
              onClick={handleActionConfirm}
            >
              {isPending ? 'Processing...' : 'Confirm Action'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
