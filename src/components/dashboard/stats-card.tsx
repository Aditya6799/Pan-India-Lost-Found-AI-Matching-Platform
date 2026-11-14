import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  description?: string;
  className?: string;
  iconBgColor?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  description,
  className,
  iconBgColor = "bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400",
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "p-5 border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900 transition-all hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
              iconBgColor
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="font-heading text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
          {value}
        </div>

        {(trend || description) && (
          <div className="mt-2.5 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-semibold rounded-md px-1.5 py-0.5",
                  trend.direction === "up" &&
                    "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60",
                  trend.direction === "down" &&
                    "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/60",
                  trend.direction === "neutral" &&
                    "text-neutral-600 bg-neutral-100 dark:text-neutral-400 dark:bg-neutral-800"
                )}
              >
                {trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
                {trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
                {trend.direction === "neutral" && <Minus className="h-3 w-3" />}
                {trend.value}
              </span>
            )}

            <span className="text-neutral-500 dark:text-neutral-400 truncate">
              {trend?.label || description}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default StatsCard;
