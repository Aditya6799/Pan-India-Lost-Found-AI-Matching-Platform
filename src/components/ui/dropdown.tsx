"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  id?: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  href?: string;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute z-50 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl transition-all duration-150 animate-in fade-in-0 zoom-in-95 dark:border-neutral-800 dark:bg-neutral-900",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-1 border-t border-neutral-100 dark:border-neutral-800"
                />
              );
            }

            const itemClass = cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer select-none",
              item.disabled &&
                "pointer-events-none opacity-50 cursor-not-allowed",
              item.destructive &&
                "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            );

            const content = (
              <>
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="flex-1 text-left">{item.label}</span>
              </>
            );

            if (item.href) {
              return (
                <a
                  key={item.id || index}
                  href={item.href}
                  className={itemClass}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={item.id || index}
                type="button"
                className={itemClass}
                disabled={item.disabled}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick?.();
                }}
                role="menuitem"
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
