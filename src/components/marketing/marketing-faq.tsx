"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MARKETING_FAQS } from "@/features/marketing/content";
import { cn } from "@/shared/utils";

export function MarketingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {MARKETING_FAQS.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question} className="border-b border-slate-200 last:border-0">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              <span className="text-sm font-medium text-slate-900">{item.question}</span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-slate-400 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
