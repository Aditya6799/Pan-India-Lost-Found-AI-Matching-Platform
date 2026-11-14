"use client";

import React, { useEffect, useState } from "react";
import { Search, CheckCircle2, Sparkles, Package } from "lucide-react";

interface StatsProps {
  stats: {
    totalLost: number;
    totalFound: number;
    totalRecovered: number;
    totalMatches: number;
  };
}

export function StatsCounter({ stats }: StatsProps) {
  const [counts, setCounts] = useState({
    lost: 0,
    found: 0,
    recovered: 0,
    matches: 0,
  });

  useEffect(() => {
    const duration = 1200; // ms
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      // easeOutQuad
      const eased = 1 - (1 - progress) * (1 - progress);

      setCounts({
        lost: Math.round(stats.totalLost * eased),
        found: Math.round(stats.totalFound * eased),
        recovered: Math.round(stats.totalRecovered * eased),
        matches: Math.round(stats.totalMatches * eased),
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  const items = [
    {
      label: "Lost Items Reported",
      count: counts.lost,
      icon: Search,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-200/60 dark:border-amber-800/40",
    },
    {
      label: "Found Items Listed",
      count: counts.found,
      icon: Package,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-200/60 dark:border-emerald-800/40",
    },
    {
      label: "Successful Recoveries",
      count: counts.recovered,
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-200/60 dark:border-blue-800/40",
    },
    {
      label: "AI Matches Generated",
      count: counts.matches,
      icon: Sparkles,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      borderColor: "border-purple-200/60 dark:border-purple-800/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`flex flex-col items-center justify-center rounded-2xl border p-6 text-center shadow-sm backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-md ${item.bgColor} ${item.borderColor}`}
          >
            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-neutral-900 ${item.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              {item.count.toLocaleString()}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 sm:text-sm">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
