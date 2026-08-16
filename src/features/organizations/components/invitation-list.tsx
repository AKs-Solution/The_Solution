"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Invitation {
  id: string;
  organizationId: string;
  organizationName: string;
  role: string;
  createdAt: string;
}

interface InvitationListProps {
  invitations: Invitation[];
}

export function InvitationList({ invitations }: InvitationListProps) {
  const [actionId, setActionId] = useState<string | null>(null);
  const rows = Array.isArray(invitations) ? invitations : [];

  async function handleAccept(id: string) {
    setActionId(id);
    try {
      await fetch(`/api/invitations/${id}/accept`, { method: "POST" });
      window.location.assign("/dashboard");
    } catch {
      // silently fail
    } finally {
      setActionId(null);
    }
  }

  async function handleDecline(id: string) {
    setActionId(id);
    try {
      await fetch(`/api/invitations/${id}/decline`, { method: "POST" });
      window.location.reload();
    } catch {
      // silently fail
    } finally {
      setActionId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground text-sm">No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="divide-border border-border divide-y rounded-lg border">
      {rows.map((inv) => (
        <div key={inv.id} className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-foreground text-sm font-medium">{inv.organizationName}</span>
            <span className="text-muted-foreground text-xs">
              Invited as {inv.role} &middot; {new Date(inv.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleDecline(inv.id)}
              disabled={actionId === inv.id}
            >
              Decline
            </Button>
            <Button size="sm" onClick={() => handleAccept(inv.id)} disabled={actionId === inv.id}>
              {actionId === inv.id ? "Accepting..." : "Accept"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
