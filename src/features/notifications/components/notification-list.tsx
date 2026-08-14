"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/notifications?page=${page}&pageSize=20`);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) {
            setNotifications(json.data);
            setTotalPages(json.totalPages);
            setUnreadCount(json.unreadCount);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  async function handleMarkRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setReloadKey((k) => k + 1);
  }

  async function handleMarkAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setReloadKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
        </p>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="divide-border border-border divide-y rounded-lg border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-80 max-w-full" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-10" />}
          title="No notifications yet"
          description="You'll see updates here when orchestration runs complete or need attention."
        />
      ) : (
        <>
          <div className="divide-border border-border divide-y rounded-lg border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between gap-4 px-4 py-3 ${notification.isRead ? "" : "bg-surface-hover"}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        className="text-foreground text-sm font-medium hover:underline"
                      >
                        {notification.title}
                      </Link>
                    ) : (
                      <span className="text-foreground text-sm font-medium">
                        {notification.title}
                      </span>
                    )}
                    {!notification.isRead && (
                      <Badge variant="default" size="sm">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{notification.message}</p>
                  <span className="text-muted-foreground text-xs">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                {!notification.isRead && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
