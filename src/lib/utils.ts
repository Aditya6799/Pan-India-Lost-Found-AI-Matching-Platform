import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | number, formatStr: string = "PPP"): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  return format(d, formatStr);
}

export function formatRelativeTime(date: string | Date | number): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function truncate(text: string, length: number = 100): string {
  if (!text) return "";
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

/**
 * Calculates the great circle distance between two points in kilometers
 * using the Haversine formula.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Rounded to 2 decimal places
}
