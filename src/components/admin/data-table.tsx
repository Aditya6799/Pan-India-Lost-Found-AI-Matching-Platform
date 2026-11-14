"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total?: number;
  };
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found matching your filters.",
  emptyTitle = "No Data",
  pagination,
  onPageChange,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      let comparison = 0;
      if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
        <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-300">
          {/* Header */}
          <thead className="bg-neutral-50/75 dark:bg-neutral-800/50 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "px-4 py-3.5 whitespace-nowrap",
                      col.sortable && "cursor-pointer select-none hover:text-neutral-800 dark:hover:text-neutral-100",
                      col.className
                    )}
                    onClick={() => {
                      if (col.sortable) handleSort(col.key);
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-neutral-400">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 text-primary-600" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-primary-600" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-cell-${cIdx}`} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-3/4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              // Empty State Row
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyMessage}
                    className="border-none bg-transparent shadow-none"
                  />
                </td>
              </tr>
            ) : (
              // Real Data Rows
              sortedData.map((row, rIdx) => (
                <tr
                  key={row._id || row.id || rIdx}
                  className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3.5 align-middle", col.className)}
                    >
                      {col.cell(row, rIdx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
          {pagination.total !== undefined && (
            <p className="text-xs text-neutral-500">
              Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} total entries)
            </p>
          )}

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;
