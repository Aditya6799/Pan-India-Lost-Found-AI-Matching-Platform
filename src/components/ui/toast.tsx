"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, type ToastItem, type ToastType } from "@/stores/ui-store";

export function useToast() {
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);
  const clearToasts = useUIStore((state) => state.clearToasts);

  const toast = React.useCallback(
    (message: string, options?: { type?: ToastType; title?: string; duration?: number }) => {
      return addToast({
        message,
        type: options?.type || "info",
        title: options?.title,
        duration: options?.duration,
      });
    },
    [addToast]
  );

  return {
    toast,
    success: (message: string, title?: string, duration?: number) =>
      toast(message, { type: "success", title, duration }),
    error: (message: string, title?: string, duration?: number) =>
      toast(message, { type: "error", title, duration }),
    warning: (message: string, title?: string, duration?: number) =>
      toast(message, { type: "warning", title, duration }),
    info: (message: string, title?: string, duration?: number) =>
      toast(message, { type: "info", title, duration }),
    dismiss: removeToast,
    clear: clearToasts,
  };
}

interface ToastItemProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const toastTypeStyles: Record<
  ToastType,
  { container: string; icon: React.ReactNode; progress: string }
> = {
  success: {
    container:
      "border-emerald-200 bg-white text-emerald-950 dark:border-emerald-800 dark:bg-neutral-900 dark:text-emerald-100",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    progress: "bg-emerald-500",
  },
  error: {
    container:
      "border-red-200 bg-white text-red-950 dark:border-red-800 dark:bg-neutral-900 dark:text-red-100",
    icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />,
    progress: "bg-red-500",
  },
  warning: {
    container:
      "border-amber-200 bg-white text-amber-950 dark:border-amber-800 dark:bg-neutral-900 dark:text-amber-100",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    progress: "bg-amber-500",
  },
  info: {
    container:
      "border-blue-200 bg-white text-blue-950 dark:border-blue-800 dark:bg-neutral-900 dark:text-blue-100",
    icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />,
    progress: "bg-blue-500",
  },
};

export function ToastCard({ toast, onDismiss }: ToastItemProps) {
  const duration = toast.duration ?? 5000;
  const style = toastTypeStyles[toast.type];

  React.useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <div
      role="status"
      className={cn(
        "relative flex w-full max-w-sm overflow-hidden rounded-xl border p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-top-3",
        style.container
      )}
    >
      <div className="flex w-full items-start gap-3">
        {style.icon}
        <div className="flex-1 space-y-0.5">
          {toast.title && (
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {toast.title}
            </h4>
          )}
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 -mr-1 -mt-1 p-1 rounded-md"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {duration > 0 && (
        <div
          className={cn(
            "absolute bottom-0 left-0 h-1 w-full opacity-60",
            style.progress
          )}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex max-h-screen w-full max-w-sm flex-col gap-2 pointer-events-none p-4 sm:p-0"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
