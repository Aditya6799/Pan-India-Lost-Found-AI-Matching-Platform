import * as React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/50 via-surface to-emerald-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform hover:scale-105"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/25">
            <MapPin className="h-6 w-6 fill-white/20 stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-heading text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Found<span className="text-primary-600">It</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 -mt-1">
              Pan-India Lost & Found
            </span>
          </div>
        </Link>
      </div>

      {/* Main Auth Form Container */}
      <div className="w-full max-w-md">
        {children}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
        <p>🇮🇳 Built for Citizens Across India • Secure & Verified Portal</p>
      </div>
    </div>
  );
}
