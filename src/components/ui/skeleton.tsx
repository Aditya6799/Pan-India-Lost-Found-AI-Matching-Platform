import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  "animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md",
  {
    variants: {
      variant: {
        default: "w-full h-4",
        text: "w-full h-3.5 my-1 rounded",
        avatar: "h-10 w-10 rounded-full",
        button: "h-10 w-28 rounded-lg",
        card: "h-48 w-full rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({
  className,
  variant,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export default Skeleton;
