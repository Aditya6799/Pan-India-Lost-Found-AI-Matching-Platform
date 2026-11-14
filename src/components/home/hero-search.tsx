"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative mx-auto flex w-full max-w-2xl items-center rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-neutral-200/80 transition-all focus-within:ring-2 focus-within:ring-primary-500 dark:bg-neutral-900 dark:ring-neutral-800"
    >
      <div className="flex items-center pl-3 text-neutral-400">
        <Search className="h-5 w-5" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for your item (e.g. Blue iPhone 15, Black Leather Wallet, Honda Key...)"
        className="w-full bg-transparent px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none dark:text-neutral-100 sm:text-base"
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="rounded-xl px-5 font-semibold shadow-md"
      >
        <span>Search</span>
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </form>
  );
}
