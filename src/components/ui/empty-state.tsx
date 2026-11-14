import * as React from "react";
import {
  Search,
  FileQuestion,
  Sparkles,
  ShieldAlert,
  BellOff,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type EmptyStateVariant =
  | "no-results"
  | "no-reports"
  | "no-matches"
  | "no-claims"
  | "no-notifications"
  | "custom";

interface EmptyStatePreset {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const presets: Record<Exclude<EmptyStateVariant, "custom">, EmptyStatePreset> = {
  "no-results": {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search terms or filters to find what you are looking for.",
  },
  "no-reports": {
    icon: FileQuestion,
    title: "No reports yet",
    description: "You haven't submitted any lost or found reports yet. Start by reporting an item.",
  },
  "no-matches": {
    icon: Sparkles,
    title: "No AI matches found yet",
    description: "Our AI engine is continuously scanning new reports. We'll notify you as soon as a potential match is found.",
  },
  "no-claims": {
    icon: ShieldAlert,
    title: "No active claims",
    description: "You haven't made any claims for matched items. Claims will appear here once submitted.",
  },
  "no-notifications": {
    icon: BellOff,
    title: "No notifications",
    description: "You are all caught up! Updates regarding your reports and claims will show up here.",
  },
};

export interface EmptyStateActionConfig {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode | EmptyStateActionConfig;
}

export function EmptyState({
  variant = "custom",
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const preset = variant !== "custom" ? presets[variant] : null;

  const displayTitle = title || preset?.title || "No items found";
  const displayDescription =
    description ||
    preset?.description ||
    "There are currently no items to display.";
  const PresetIcon = preset?.icon || FolderOpen;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8 sm:p-12 text-center bg-white/50 dark:bg-neutral-900/40",
        className
      )}
      {...props}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 mb-4 shadow-sm">
        {icon || <PresetIcon className="h-8 w-8 text-neutral-600 dark:text-neutral-300" />}
      </div>

      <h3 className="font-heading text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {displayTitle}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        {displayDescription}
      </p>

      {action && (
        <div className="mt-6">
          {React.isValidElement(action) ? (
            action
          ) : typeof action === "object" && "label" in action ? (
            action.href ? (
              <a href={action.href}>
                <Button variant={action.variant || "primary"}>{action.label}</Button>
              </a>
            ) : (
              <Button
                variant={action.variant || "primary"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
