import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/reports/status-badge";
import { Button } from "@/components/ui/button";

export interface DashboardReportItem {
  _id: string;
  reportType: "LOST" | "FOUND";
  itemName: string;
  category: string;
  images?: Array<{ url: string; publicId: string }>;
  state: string;
  city: string;
  status: string;
  lostFoundDate: string | Date;
}

export interface RecentReportsProps {
  reports?: DashboardReportItem[];
  className?: string;
}

export function RecentReports({
  reports = [],
  className = "",
}: RecentReportsProps) {
  const displayReports = reports.slice(0, 5);

  return (
    <div className={`overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 p-5 dark:border-neutral-800">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Recent Reports
          </h3>
          <p className="text-xs text-neutral-500">Your most recently submitted items</p>
        </div>
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* List / Table */}
      {displayReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Package className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <p className="mt-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No reports created yet
          </p>
          <div className="mt-3 flex gap-2">
            <Link href="/report/lost">
              <Button variant="outline" size="sm">
                Report Lost
              </Button>
            </Link>
            <Link href="/report/found">
              <Button variant="primary" size="sm">
                Report Found
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800/50">
              <tr>
                <th className="px-5 py-3">Item</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {displayReports.map((report) => (
                <tr key={report._id} className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                  {/* Thumbnail + Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        {report.images && report.images[0]?.url ? (
                          <Image
                            src={report.images[0].url}
                            alt={report.itemName}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/reports/${report._id}`}
                          className="truncate font-semibold text-neutral-900 hover:text-primary-600 dark:text-neutral-100 block max-w-[180px]"
                        >
                          {report.itemName}
                        </Link>
                        <span className="text-xs text-neutral-400">{report.category}</span>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={report.reportType} withDot={false} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={report.status} />
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3.5 text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate max-w-[140px]">{report.city}, {report.state}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-xs text-neutral-500 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span>{formatDate(report.lostFoundDate)}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/reports/${report._id}`}>
                      <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentReports;
