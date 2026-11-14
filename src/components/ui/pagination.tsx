"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  syncWithUrl?: boolean;
  paramName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  syncWithUrl = false,
  paramName = "page",
  className,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    if (syncWithUrl && pathname) {
      const current = new URLSearchParams(Array.from(searchParams?.entries() || []));
      current.set(paramName, page.toString());
      router.push(`${pathname}?${current.toString()}`);
    }

    if (onPageChange) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  // Compute pages to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 2; // numbers on each side of currentPage

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis");
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5 select-none", className)}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => handlePageClick(currentPage - 1)}
        aria-label="Go to previous page"
        className="h-9 px-2.5 sm:px-3"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline ml-1">Previous</span>
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === "ellipsis") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-9 w-9 items-center justify-center text-neutral-400"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }

          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePageClick(p)}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                isCurrent
                  ? "bg-primary-600 text-white shadow-sm font-semibold"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              )}
            >
              {p}
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
        aria-label="Go to next page"
        className="h-9 px-2.5 sm:px-3"
      >
        <span className="hidden sm:inline mr-1">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

export default Pagination;
