import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-100 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
        lost:
          "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
        found:
          "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
        match:
          "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800",
        pending:
          "bg-yellow-100 text-yellow-900 border border-yellow-300 dark:bg-yellow-950/70 dark:text-yellow-300 dark:border-yellow-800",
        approved:
          "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
        rejected:
          "bg-red-100 text-red-900 border border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800",
        outline:
          "border border-neutral-300 text-neutral-800 dark:border-neutral-700 dark:text-neutral-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const dotColors: Record<string, string> = {
  default: "bg-neutral-500",
  lost: "bg-amber-500",
  found: "bg-emerald-500",
  match: "bg-blue-500",
  pending: "bg-yellow-500",
  approved: "bg-emerald-500",
  rejected: "bg-red-500",
  outline: "bg-neutral-400",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean;
}

function Badge({
  className,
  variant = "default",
  withDot = false,
  children,
  ...props
}: BadgeProps) {
  const dotColor = dotColors[variant || "default"] || "bg-current";

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {withDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </div>
  );
}

export { Badge, badgeVariants };
export default Badge;
