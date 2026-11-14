'use server';

import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { User, ItemReport, Claim, Notification, AuditLog } from '@/models';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session.user;
}

export async function approveReport(reportId: string) {
  const admin = await requireAdmin();
  await connectDB();

  const report = await ItemReport.findByIdAndUpdate(
    reportId,
    { moderationStatus: 'approved' },
    { new: true }
  );

  if (!report) {
    throw new Error('Report not found');
  }

  // Create notification for report owner
  await Notification.create({
    userId: report.userId,
    title: 'Report Approved',
    message: `Your report for "${report.itemName}" has been approved and is now publicly visible.`,
    type: 'report_approved',
    relatedReportId: report._id,
  });

  // Create audit log
  await AuditLog.create({
    userId: admin.id,
    action: 'APPROVE_REPORT',
    resourceType: 'ItemReport',
    resourceId: report._id,
    metadata: { reportName: report.itemName, reportType: report.reportType },
  });

  revalidatePath('/admin/reports');
  revalidatePath('/admin');
  return { success: true, message: 'Report approved successfully' };
}

export async function rejectReport(reportId: string, reason: string) {
  const admin = await requireAdmin();
  await connectDB();

  const report = await ItemReport.findByIdAndUpdate(
    reportId,
    { moderationStatus: 'rejected', additionalInfo: reason },
    { new: true }
  );

  if (!report) {
    throw new Error('Report not found');
  }

  // Create notification for report owner
  await Notification.create({
    userId: report.userId,
    title: 'Report Rejected',
    message: `Your report for "${report.itemName}" was rejected. Reason: ${reason}`,
    type: 'report_rejected',
    relatedReportId: report._id,
  });

  // Create audit log
  await AuditLog.create({
    userId: admin.id,
    action: 'REJECT_REPORT',
    resourceType: 'ItemReport',
    resourceId: report._id,
    metadata: { reportName: report.itemName, reason },
  });

  revalidatePath('/admin/reports');
  revalidatePath('/admin');
  return { success: true, message: 'Report rejected' };
}

export async function updateUserRole(userId: string, role: string) {
  const admin = await requireAdmin();
  await connectDB();

  if (!['user', 'moderator', 'admin'].includes(role)) {
    throw new Error('Invalid role specified');
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) {
    throw new Error('User not found');
  }

  await AuditLog.create({
    userId: admin.id,
    action: 'UPDATE_USER_ROLE',
    resourceType: 'User',
    resourceId: user._id,
    metadata: { targetUserEmail: user.email, newRole: role },
  });

  revalidatePath('/admin/users');
  return { success: true, message: `User role updated to ${role}` };
}

export async function deactivateUser(userId: string) {
  const admin = await requireAdmin();
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const newStatus = !user.isActive;
  user.isActive = newStatus;
  await user.save();

  await AuditLog.create({
    userId: admin.id,
    action: newStatus ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
    resourceType: 'User',
    resourceId: user._id,
    metadata: { targetUserEmail: user.email, isActive: newStatus },
  });

  revalidatePath('/admin/users');
  return {
    success: true,
    message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
  };
}

export async function approveClaim(claimId: string, remarks: string = '') {
  const admin = await requireAdmin();
  await connectDB();

  const claim = await Claim.findById(claimId).populate('reportId');
  if (!claim) {
    throw new Error('Claim not found');
  }

  claim.status = 'approved';
  claim.reviewedBy = admin.id as any;
  claim.adminRemarks = remarks;
  claim.resolvedAt = new Date();
  await claim.save();

  // Mark associated item report as recovered
  if (claim.reportId) {
    await ItemReport.findByIdAndUpdate((claim.reportId as any)._id, {
      status: 'recovered',
    });
  }

  // Notify claimant
  await Notification.create({
    userId: claim.claimantId,
    title: 'Claim Approved!',
    message: `Your claim for the item has been approved. Remarks: ${remarks || 'None'}`,
    type: 'claim_approved',
    relatedClaimId: claim._id,
    relatedReportId: (claim.reportId as any)?._id,
  });

  await AuditLog.create({
    userId: admin.id,
    action: 'APPROVE_CLAIM',
    resourceType: 'Claim',
    resourceId: claim._id,
    metadata: { remarks },
  });

  revalidatePath('/admin/claims');
  revalidatePath('/admin');
  return { success: true, message: 'Claim approved successfully' };
}

export async function rejectClaim(claimId: string, remarks: string = '') {
  const admin = await requireAdmin();
  await connectDB();

  const claim = await Claim.findById(claimId).populate('reportId');
  if (!claim) {
    throw new Error('Claim not found');
  }

  claim.status = 'rejected';
  claim.reviewedBy = admin.id as any;
  claim.adminRemarks = remarks;
  claim.resolvedAt = new Date();
  await claim.save();

  // Notify claimant
  await Notification.create({
    userId: claim.claimantId,
    title: 'Claim Rejected',
    message: `Your claim for the item was rejected. Remarks: ${remarks || 'Please provide further verification.'}`,
    type: 'claim_rejected',
    relatedClaimId: claim._id,
    relatedReportId: (claim.reportId as any)?._id,
  });

  await AuditLog.create({
    userId: admin.id,
    action: 'REJECT_CLAIM',
    resourceType: 'Claim',
    resourceId: claim._id,
    metadata: { remarks },
  });

  revalidatePath('/admin/claims');
  revalidatePath('/admin');
  return { success: true, message: 'Claim rejected' };
}

export async function resolveClaim(claimId: string) {
  const admin = await requireAdmin();
  await connectDB();

  const claim = await Claim.findByIdAndUpdate(
    claimId,
    { status: 'resolved', resolvedAt: new Date() },
    { new: true }
  );

  if (!claim) {
    throw new Error('Claim not found');
  }

  await AuditLog.create({
    userId: admin.id,
    action: 'RESOLVE_CLAIM',
    resourceType: 'Claim',
    resourceId: claim._id,
  });

  revalidatePath('/admin/claims');
  return { success: true, message: 'Claim resolved successfully' };
}


import {
  getAdminUsers,
  getAdminReports,
  getAdminClaims,
} from './service';

export async function fetchUsersAction(params: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  return getAdminUsers(params);
}

export async function fetchReportsAction(params: {
  search?: string;
  moderationStatus?: string;
  reportType?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  return getAdminReports(params);
}

export async function fetchClaimsAction(params: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  return getAdminClaims(params);
}


export async function bulkApproveReports(reportIds: string[]) {
  const admin = await requireAdmin();
  await connectDB();

  await ItemReport.updateMany(
    { _id: { $in: reportIds } },
    { moderationStatus: 'approved' }
  );

  await AuditLog.create({
    userId: admin.id,
    action: 'BULK_APPROVE_REPORTS',
    resourceType: 'ItemReport',
    metadata: { count: reportIds.length, reportIds },
  });

  revalidatePath('/admin/reports');
  revalidatePath('/admin');
  return { success: true, count: reportIds.length };
}

export async function bulkRejectReports(reportIds: string[], reason: string) {
  const admin = await requireAdmin();
  await connectDB();

  await ItemReport.updateMany(
    { _id: { $in: reportIds } },
    { moderationStatus: 'rejected', additionalInfo: reason }
  );

  await AuditLog.create({
    userId: admin.id,
    action: 'BULK_REJECT_REPORTS',
    resourceType: 'ItemReport',
    metadata: { count: reportIds.length, reportIds, reason },
  });

  revalidatePath('/admin/reports');
  revalidatePath('/admin');
  return { success: true, count: reportIds.length };
}


import { getAnalyticsData } from './service';

export async function fetchAnalyticsAction(days: number = 30) {
  await requireAdmin();
  return getAnalyticsData(days);
}
