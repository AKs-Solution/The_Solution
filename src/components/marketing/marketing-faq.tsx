"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MARKETING_FAQS } from "@/features/marketing/content";

export function MarketingFaq() {
  return (
    <Accordion
      type="single"
      className="divide-slate-200 rounded-lg border border-slate-200 bg-white"
    >
      {MARKETING_FAQS.map((item, index) => (
        <AccordionItem key={item.question} value={`faq-${index}`} className="px-5">
          <AccordionTrigger className="text-left text-sm font-semibold text-slate-900 hover:text-slate-700">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-sm leading-relaxed text-slate-500">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
