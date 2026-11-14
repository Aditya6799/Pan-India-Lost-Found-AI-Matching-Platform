"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "How does the AI matching system work?",
    answer:
      "KhojSetu's AI engine analyzes multiple attributes simultaneously: high-dimensional text embeddings of titles and descriptions, lexical keyword features (color, brand, category, subcategory), geographical proximity using Haversine formulas, and date proximity. High-confidence matches are automatically suggested to both parties.",
  },
  {
    question: "Is KhojSetu free to use across India?",
    answer:
      "Yes, KhojSetu is a free public civic service designed to help citizens and authorities across all 36 Indian states and union territories quickly recover lost property without any charges.",
  },
  {
    question: "How is my personal contact information protected?",
    answer:
      "Your raw phone number and email address are never displayed publicly. When someone finds your item, claims and communications are facilitated securely through platform notifications and verified moderation checks.",
  },
  {
    question: "How do I prove that a found item belongs to me?",
    answer:
      "When filing a claim, you provide private verification proof—such as unique marks, serial numbers, purchase invoices, lock screen wallpapers, or distinctive contents. The finder or authority reviews this private evidence before confirming handoff.",
  },
  {
    question: "Can police stations and transport authorities use this platform?",
    answer:
      "Yes. Transport authorities (airports, railways, metro, bus terminals) and local law enforcement stations have specialized administrative portals to log custody of found items and verify citizen claims efficiently.",
  },
  {
    question: "What languages does the platform support?",
    answer:
      "KhojSetu natively supports English and Hindi, with multilingual semantic matching so items reported in different regional languages can still be accurately matched.",
  },
  {
    question: "What should I do after getting a match notification?",
    answer:
      "Review the matched item photos and description carefully. If you believe it's yours, click 'Submit Claim' and provide distinctive verification details. Once verified, coordinate a safe handover at a public police or transit station.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="mx-auto max-w-3xl divide-y divide-neutral-200/80 rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
      {FAQ_DATA.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="overflow-hidden first:rounded-t-2xl last:rounded-b-2xl">
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between px-6 py-5 text-left text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-850 sm:text-lg"
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={cn(
                  "ml-4 h-5 w-5 shrink-0 text-neutral-500 transition-transform duration-200",
                  isOpen && "rotate-180 text-primary-600"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
