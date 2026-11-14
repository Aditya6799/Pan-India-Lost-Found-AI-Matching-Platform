import React from "react";
import { Tag, FileText, Palette, MapPin, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MatchReasonsProps {
  reasons: string[];
  className?: string;
  size?: "sm" | "md";
}

function getReasonIcon(reason: string) {
  const lower = reason.toLowerCase();
  if (lower.includes("category")) {
    return <Tag className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />;
  }
  if (lower.includes("description") || lower.includes("text") || lower.includes("keyword") || lower.includes("semantic")) {
    return <FileText className="h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400" />;
  }
  if (lower.includes("color") || lower.includes("brand") || lower.includes("attribute")) {
    return <Palette className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />;
  }
  if (lower.includes("location") || lower.includes("city") || lower.includes("state") || lower.includes("proximity") || lower.includes("km")) {
    return <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />;
  }
  if (lower.includes("date") || lower.includes("day") || lower.includes("time")) {
    return <Calendar className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" />;
  }
  return <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-400" />;
}

export function MatchReasons({
  reasons = [],
  className = "",
  size = "sm",
}: MatchReasonsProps) {
  if (!reasons || reasons.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {reasons.map((reason, idx) => (
        <span
          key={idx}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white font-medium text-neutral-800 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200",
            size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
          )}
        >
          {getReasonIcon(reason)}
          <span>{reason}</span>
        </span>
      ))}
    </div>
  );
}

export default MatchReasons;
