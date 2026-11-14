import Link from "next/link";
import { MapPinOff, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-surface dark:bg-neutral-950">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-100 text-primary-600 dark:bg-primary-950/80 dark:text-primary-400 mb-6 shadow-lg shadow-primary-500/10">
        <MapPinOff className="h-10 w-10" />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 mb-4">
        <span>Error 404</span>
        <span>•</span>
        <span>Page Not Found</span>
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
        Looks Like This Page is Lost
      </h1>

      <p className="mt-3 max-w-md text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        The page or report you are looking for does not exist, has been removed, or has already been resolved and archived.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="primary" size="md" leftIcon={<Home className="h-4 w-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" size="md" leftIcon={<Search className="h-4 w-4" />}>
            Search Items
          </Button>
        </Link>
      </div>
    </div>
  );
}
