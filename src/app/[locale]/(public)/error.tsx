"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Public page runtime error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-400 mb-6 shadow-sm">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Something went wrong
      </h2>

      <p className="mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        An unexpected error occurred while loading this page. Our civic engineering team has been notified.
      </p>

      {error?.message && (
        <div className="mt-4 max-w-lg rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 font-mono text-left break-all">
          {error.message}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={() => reset()}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" leftIcon={<Home className="h-4 w-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
