"use client";

import { useEffect } from "react";
import Link from "next/link";

const HEADER_OFFSET = 88;

export function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
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

export function HashRestore() {
  useEffect(() => {
    const run = () => {
      if (window.location.hash) retryScrollToHash(window.location.hash);
    };
    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
  }, []);
  return null;
}
