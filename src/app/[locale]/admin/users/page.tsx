'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MoreVertical,
  Shield,
  FileText,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { fetchUsersAction, updateUserRole, deactivateUser } from '@/features/admin/actions';
import { AdminUserItem } from '@/features/admin/service';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'createdAt' | 'reportsCount'>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: AdminUserItem | null;
    action: 'deactivate' | 'activate' | null;
  }>({ isOpen: false, user: null, action: null });

  const [roleModal, setRoleModal] = useState<{
    isOpen: boolean;
    user: AdminUserItem | null;
    selectedRole: string;
  }>({ isOpen: false, user: null, selectedRole: 'user' });

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsersAction({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 10,
      });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, statusFilter, page]);

  const handleRoleChangeConfirm = () => {
    if (!roleModal.user) return;
    startTransition(async () => {
      try {
        await updateUserRole(roleModal.user!.id, roleModal.selectedRole);
        setActionMessage({ type: 'success', text: `Updated role for ${roleModal.user!.name} to ${roleModal.selectedRole}` });
        setRoleModal({ isOpen: false, user: null, selectedRole: 'user' });
        loadUsers();
      } catch (err: any) {
        setActionMessage({ type: 'error', text: err.message || 'Failed to update role' });
      }
    });
  };

  const handleDeactivateConfirm = () => {
    if (!confirmModal.user) return;
    startTransition(async () => {
      try {
        await deactivateUser(confirmModal.user!.id);
        setActionMessage({
          type: 'success',
          text: `User ${confirmModal.user!.name} ${confirmModal.action === 'deactivate' ? 'deactivated' : 'activated'} successfully`,
        });
        setConfirmModal({ isOpen: false, user: null, action: null });
        loadUsers();
      } catch (err: any) {
        setActionMessage({ type: 'error', text: err.message || 'Operation failed' });
      }
    });
  };

  // Client sort
  const sortedUsers = [...users].sort((a, b) => {
    if (sortField === 'name') {
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (sortField === 'reportsCount') {
      return sortAsc ? a.reportsCount - b.reportsCount : b.reportsCount - a.reportsCount;
    }
    return sortAsc
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            User Management
          </h2>
          <p className="text-sm text-slate-500">
            View, search, update roles, and manage status for all registered users across India ({total} total).
          </p>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
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
              <span>Role:</span>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 ml-2">
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                  onClick={() => {
                    setSortField('createdAt');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Joined</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                  onClick={() => {
                    setSortField('reportsCount');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Reports</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading users...
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No users found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                sortedUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'match'
                            : u.role === 'moderator'
                            ? 'pending'
                            : 'default'
                        }
                        className="capitalize text-[10px]"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                          <CheckCircle className="h-3 w-3 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-500 text-[11px] font-medium">
                          <XCircle className="h-3 w-3 mr-1" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(u.createdAt, 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/${locale}/admin/reports?search=${encodeURIComponent(u.email)}`}
                        className="inline-flex items-center text-blue-600 hover:underline font-semibold"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {u.reportsCount} report{u.reportsCount === 1 ? '' : 's'}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] h-7 px-2"
                          onClick={() =>
                            setRoleModal({
                              isOpen: true,
                              user: u,
                              selectedRole: u.role,
                            })
                          }
                        >
                          <Shield className="h-3 w-3 mr-1" /> Role
                        </Button>
                        <Button
                          variant={u.isActive ? 'outline' : 'default'}
                          size="sm"
                          className={`text-[11px] h-7 px-2 ${
                            u.isActive
                              ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              user: u,
                              action: u.isActive ? 'deactivate' : 'activate',
                            })
                          }
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing page <span className="font-semibold text-slate-800 dark:text-slate-200">{page}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({total} total users)
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

      {/* Role Change Modal */}
      <Modal
        isOpen={roleModal.isOpen}
        onClose={() => setRoleModal({ isOpen: false, user: null, selectedRole: 'user' })}
        title="Change User Role"
        description={`Modify system access permissions for ${roleModal.user?.name} (${roleModal.user?.email})`}
      >
        <div className="space-y-4 py-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Role:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['user', 'moderator', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleModal({ ...roleModal, selectedRole: r })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  roleModal.selectedRole === r
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600'
                }`}
              >
                <div className="text-xs capitalize">{r}</div>
              </button>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRoleModal({ isOpen: false, user: null, selectedRole: 'user' })}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isPending}
              onClick={handleRoleChangeConfirm}
            >
              {isPending ? 'Updating...' : 'Save Role'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deactivate/Activate Confirm Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
        title={confirmModal.action === 'deactivate' ? 'Deactivate User Account' : 'Activate User Account'}
        description={`Are you sure you want to ${confirmModal.action} the account for ${confirmModal.user?.name}?`}
      >
        <div className="space-y-4 py-2 text-xs text-slate-600 dark:text-slate-300">
          <p>
            {confirmModal.action === 'deactivate'
              ? 'When deactivated, this user will be immediately logged out and blocked from reporting items, claiming items, or contacting finders.'
              : 'When activated, this user will regain full access to submit and manage reports on the platform.'}
          </p>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmModal({ isOpen: false, user: null, action: null })}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className={
                confirmModal.action === 'deactivate'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
              disabled={isPending}
              onClick={handleDeactivateConfirm}
            >
              {isPending
                ? 'Processing...'
                : confirmModal.action === 'deactivate'
                ? 'Yes, Deactivate'
                : 'Yes, Activate'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
