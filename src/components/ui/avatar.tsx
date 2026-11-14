"use client";

import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full font-medium select-none items-center justify-center bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  name?: string;
  fallback?: string;
}

export function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  className,
  size,
  src,
  alt = "Avatar",
  name,
  fallback,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const initials = fallback || getInitials(name || alt);

  return (
    <div className={cn(avatarVariants({ size }), className)} {...props}>
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 48px, 64px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-semibold tracking-wider">{initials}</span>
      )}
    </div>
  );
}

export default Avatar;
