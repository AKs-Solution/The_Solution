"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { LifeBuoy, Search, X, ArrowRight, BookOpen } from "lucide-react";
import { searchHelpTopics, topicsForPath } from "../help-topics";
import { cn } from "@/shared/utils";

export function HelpPanel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("consecuencia:open-help", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("consecuencia:open-help", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const contextual = useMemo(() => topicsForPath(pathname), [pathname]);
  const results = useMemo(() => searchHelpTopics(query), [query]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex justify-end">
      <button
        type="button"
        aria-label="Close help"
        className="absolute inset-0 bg-slate-900/40"
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-panel-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className="size-4 text-blue-600" />
            <h2 id="help-panel-title" className="text-sm font-semibold text-slate-900">
              Help
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close help"
            className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="border-b border-slate-200 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search topics"
              aria-label="Search help topics"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
          {!query && (
            <section className="mb-5">
              <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                For this page
              </p>
              <div className="flex flex-col gap-2">
                {contextual.map((topic) => (
                  <article
                    key={topic.id}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <h3 className="text-sm font-semibold text-slate-900">{topic.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{topic.summary}</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-slate-700">
                      {topic.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    {topic.href ? (
                      <Link
                        href={topic.href}
                        onClick={() => setOpen(false)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Open {topic.title}
                        <ArrowRight className="size-3" />
                      </Link>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          )}

          <section>
            <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {query ? "Matching topics" : "All topics"}
            </p>
            <div className="flex flex-col gap-2">
              {results.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500">
                  No topics matched “{query}”.
                </p>
              ) : (
                results.map((topic) => (
                  <article
                    key={topic.id}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      {topic.category}
                    </p>
                    <h3 className="text-sm font-semibold text-slate-900">{topic.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{topic.summary}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="border-t border-slate-200 bg-white p-4">
          <Link
            href="/help"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <BookOpen className="size-4" />
            Open full help center
          </Link>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

export function openHelpPanel() {
  window.dispatchEvent(new CustomEvent("consecuencia:open-help"));
}

export function HelpTriggerButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openHelpPanel}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        className,
      )}
    >
      Open help
    </button>
  );
}
