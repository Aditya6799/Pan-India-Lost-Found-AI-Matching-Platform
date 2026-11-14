"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface UIStoreState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id"> & { id?: string }) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) =>
    set((state) => ({
      sidebarOpen: typeof open === "function" ? open(state.sidebarOpen) : open,
    })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toasts: [],
  addToast: (toast) => {
    const id = toast.id || Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

export default useUIStore;
