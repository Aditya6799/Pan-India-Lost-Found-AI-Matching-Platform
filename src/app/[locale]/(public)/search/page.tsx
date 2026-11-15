"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  PackageSearch,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { INDIAN_STATES, ITEM_CATEGORIES, COLOR_OPTIONS } from "@/lib/constants";
import { ReportCard } from "@/components/reports/report-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { PaginatedResponse, IItemReport } from "@/types";

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // URL state
  const initialQ = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "ALL";
  const initialCategory = searchParams.get("category") || "ALL";
  const initialState = searchParams.get("state") || "ALL";
  const initialCity = searchParams.get("city") || "";
  const initialColor = searchParams.get("color") || "";
  const initialBrand = searchParams.get("brand") || "";
  const initialDateFrom = searchParams.get("dateFrom") || "";
  const initialDateTo = searchParams.get("dateTo") || "";
  const initialSortBy = searchParams.get("sortBy") || "newest";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // Local filter states
  const [searchInput, setSearchInput] = useState(initialQ);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [reportType, setReportType] = useState(initialType);
  const [category, setCategory] = useState(initialCategory);
  const [state, setState] = useState(initialState);
  const [city, setCity] = useState(initialCity);
  const [color, setColor] = useState(initialColor);
  const [brand, setBrand] = useState(initialBrand);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [page, setPage] = useState(initialPage);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (reportType && reportType !== "ALL") params.set("type", reportType);
    if (category && category !== "ALL") params.set("category", category);
    if (state && state !== "ALL") params.set("state", state);
    if (city) params.set("city", city);
    if (color) params.set("color", color);
    if (brand) params.set("brand", brand);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (sortBy && sortBy !== "newest") params.set("sortBy", sortBy);
    if (page > 1) params.set("page", page.toString());

    const newQuery = params.toString();
    startTransition(() => {
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
    });
  }, [
    debouncedSearch,
    reportType,
    category,
    state,
    city,
    color,
    brand,
    dateFrom,
    dateTo,
    sortBy,
    page,
    pathname,
    router,
  ]);

  // Cities for currently selected state
  const selectedStateObj = INDIAN_STATES.find((s) => s.value === state);
  const availableCities = selectedStateObj ? selectedStateObj.cities : [];

  // Reset page to 1 whenever any filter changes
  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setReportType("ALL");
    setCategory("ALL");
    setState("ALL");
    setCity("");
    setColor("");
    setBrand("");
    setDateFrom("");
    setDateTo("");
    setSortBy("newest");
    setPage(1);
  };

  // Fetch search results via TanStack Query
  const { data, isLoading, isError } = useQuery<PaginatedResponse<IItemReport>>({
    queryKey: [
      "searchReports",
      debouncedSearch,
      reportType,
      category,
      state,
      city,
      color,
      brand,
      dateFrom,
      dateTo,
      sortBy,
      page,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (reportType) params.set("type", reportType);
      if (category && category !== "ALL") params.set("category", category);
      if (state && state !== "ALL") params.set("state", state);
      if (city) params.set("city", city);
      if (color) params.set("color", color);
      if (brand) params.set("brand", brand);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (sortBy) params.set("sortBy", sortBy);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }
      return res.json();
    },
  });

  const reports = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Search & Controls Bar */}
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
            Search Lost &amp; Found Directory
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Real-time multi-attribute search across all 36 Indian states and union territories.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input with Debounce */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search by item name, description, brand, distinctive marks..."
              className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-11 pr-10 text-sm shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            className="flex items-center gap-2 lg:hidden"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </Button>

          {/* Sort Selector */}
          <div className="w-full sm:w-56">
            <Select
              options={[
                { label: "Newest First", value: "newest" },
                { label: "Oldest First", value: "oldest" },
                { label: "Most Viewed", value: "views" },
              ]}
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
            />
          </div>
        </div>

        {/* Status / Type Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Report Type:
          </span>
          {(["ALL", "LOST", "FOUND"] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(setReportType, type)}
              className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                reportType === type
                  ? type === "LOST"
                    ? "bg-amber-600 text-white shadow-sm"
                    : type === "FOUND"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-primary-600 text-white shadow-sm"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              {type === "ALL" ? "All Items" : type === "LOST" ? "Lost Items" : "Found Items"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Sidebar Filters + Results Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* FILTER SIDEBAR (Desktop + Mobile drawer) */}
        <aside
          className={`space-y-6 lg:block ${
            isMobileFilterOpen ? "block" : "hidden"
          } rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-24 lg:h-fit`}
        >
          <div className="flex items-center justify-between border-b pb-4 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-neutral-100">
              <Filter className="h-4 w-4 text-primary-600" />
              <span>Filter Directory</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All
            </button>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Category
            </label>
            <Select
              options={[
                { label: "All Categories", value: "ALL" },
                ...ITEM_CATEGORIES.map((c) => ({ label: c.name, value: c.id })),
              ]}
              value={category}
              onChange={(e) => handleFilterChange(setCategory, e.target.value)}
            />
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              State / Union Territory
            </label>
            <Select
              options={[
                { label: "All States & UTs", value: "ALL" },
                ...INDIAN_STATES.map((s) => ({ label: s.label, value: s.value })),
              ]}
              value={state}
              onChange={(e) => {
                handleFilterChange(setState, e.target.value);
                setCity(""); // Reset city when state changes
              }}
            />
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              City
            </label>
            {availableCities.length > 0 ? (
              <Select
                options={[
                  { label: "All Cities", value: "" },
                  ...availableCities.map((c) => ({ label: c, value: c })),
                ]}
                value={city}
                onChange={(e) => handleFilterChange(setCity, e.target.value)}
              />
            ) : (
              <Input
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => handleFilterChange(setCity, e.target.value)}
              />
            )}
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Color
            </label>
            <Select
              options={[
                { label: "Any Color", value: "" },
                ...COLOR_OPTIONS.map((c) => ({ label: c.label, value: c.value })),
              ]}
              value={color}
              onChange={(e) => handleFilterChange(setColor, e.target.value)}
            />
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Brand / Manufacturer
            </label>
            <Input
              placeholder="e.g. Apple, Samsung, Titan..."
              value={brand}
              onChange={(e) => handleFilterChange(setBrand, e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2 border-t pt-4 dark:border-neutral-800">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Date Lost / Found
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-neutral-400">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleFilterChange(setDateFrom, e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleFilterChange(setDateTo, e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* RESULTS GRID AREA */}
        <main className="lg:col-span-3">
          {/* Header count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Showing <span className="font-bold text-neutral-900 dark:text-white">{reports.length}</span>{" "}
              of <span className="font-bold text-neutral-900 dark:text-white">{total}</span> listings
            </p>
          </div>

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3 rounded-2xl border p-4 shadow-sm">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-1/3 rounded" />
                    <Skeleton className="h-4 w-1/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/50 dark:bg-red-950/20">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Failed to load search results. Please check your connection or try again.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-4">
                Reset Filters
              </Button>
            </div>
          ) : reports.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white py-16 px-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                <PackageSearch className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                No matching items found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
                We couldn&apos;t find any items matching your active criteria. Try broadening your keywords,
                adjusting location filters, or reporting your item to alert the community.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(reportType === "FOUND" ? "/report/found" : "/report/lost")}
                >
                  File a New Report
                </Button>
              </div>
            </div>
          ) : (
            /* Results Grid */
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {reports.map((report: any) => (
                  <ReportCard
                    key={String(report._id)}
                    id={String(report._id)}
                    reportType={report.reportType}
                    itemName={report.itemName}
                    category={report.category}
                    imageUrl={report.images?.[0]?.url || null}
                    state={report.state}
                    city={report.city}
                    date={report.lostFoundDate ? new Date(report.lostFoundDate).toISOString() : ""}
                    matchCount={report.matchCount || 0}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
