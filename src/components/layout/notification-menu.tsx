"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/notifications?page=1&pageSize=6");
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setItems(Array.isArray(json.data) ? json.data : []);
        setUnread(typeof json.unreadCount === "number" ? json.unreadCount : 0);
      } catch {
        // Guest and unauthenticated sessions have no notification feed.
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open notifications"
        className="relative flex size-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell className="size-3.5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-blue-600" />
        )}
      </button>
      {open && (
        <div className="absolute top-10 right-0 z-50 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <p className="text-xs font-semibold text-slate-900">Notifications</p>
            <Link
              href="/notifications"
              className="text-xs font-medium text-blue-600 no-underline hover:text-blue-700"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-500">No notifications.</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="border-b border-slate-100 px-3 py-2 last:border-0">
                  <p className="text-xs font-medium text-slate-900">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
