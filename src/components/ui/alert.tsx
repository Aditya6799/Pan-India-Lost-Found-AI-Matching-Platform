import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 transition-all duration-200 flex items-start gap-3.5",
  {
    variants: {
      variant: {
        info:
          "border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200",
        success:
          "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
        warning:
          "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
        error:
          "border-red-200 bg-red-50/70 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const alertIcons = {
  info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
  success: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
  error: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  customIcon?: React.ReactNode;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  customIcon,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const icon = customIcon || alertIcons[variant || "info"];

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon}

      <div className="flex-1 space-y-1">
        {title && (
          <h5 className="font-semibold text-sm leading-none tracking-tight">
            {title}
          </h5>
        )}
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-lg p-1 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default Alert;
