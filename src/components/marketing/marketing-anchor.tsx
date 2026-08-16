"use client";

import { useEffect } from "react";
import Link from "next/link";

function unlockDocumentScroll() {
  const html = document.documentElement;
  const { body } = document;
  html.style.removeProperty("overflow");
  html.style.removeProperty("height");
  body.style.removeProperty("overflow");
  body.style.removeProperty("height");
  html.style.overflow = "visible";
  body.style.overflow = "visible";
}

export function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  if (window.location.hash !== `#${id}`) {
    history.replaceState(null, "", `#${id}`);
  }
  return true;
}

function retryScrollToHash(hash: string, attempts = 12) {
  if (scrollToHash(hash)) return;
  if (attempts <= 0) return;
  window.setTimeout(() => retryScrollToHash(hash, attempts - 1), 50);
}

export function MarketingAnchor({
  href,
  children,
  className,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const hashIndex = href.indexOf("#");

  if (hashIndex === -1) {
    return (
      <Link href={href} onClick={() => onNavigate?.()} className={className}>
        {children}
      </Link>
    );
  }

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const path = href.slice(0, hashIndex) || "/";
    const hash = href.slice(hashIndex);
    const onHome = window.location.pathname === "/" || window.location.pathname === "";
    if (path === "/" && onHome) {
      event.preventDefault();
      retryScrollToHash(hash);
      onNavigate?.();
      return;
    }
    if (path === "/" && !onHome) {
      event.preventDefault();
      onNavigate?.();
      window.location.assign(`/${hash}`);
      return;
    }
    onNavigate?.();
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

export function MarketingViewport({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    unlockDocumentScroll();
    const run = () => {
      if (window.location.hash) retryScrollToHash(window.location.hash);
    };
    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
  }, []);

  return (
    <div
      id="marketing-root"
      className="h-dvh overflow-x-hidden overflow-y-auto bg-slate-50 font-sans text-slate-900 antialiased"
    >
      {children}
    </div>
  );
}
