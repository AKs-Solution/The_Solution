"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const INVITE_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "engineer", label: "Engineer" },
  { value: "auditor", label: "Auditor" },
  { value: "viewer", label: "Viewer" },
];

interface InviteMemberDialogProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited?: () => void;
}

export function InviteMemberDialog({
  organizationId,
  open,
  onOpenChange,
  onInvited,
}: InviteMemberDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const res = await fetch(`/api/organizations/${organizationId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to invite");
        return;
      }

      setName("");
      setEmail("");
      setRole("viewer");
      onInvited?.();
      onOpenChange(false);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
          )}
          <Input
            label="Full name"
            type="text"
            placeholder="Colleague Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={INVITE_ROLES}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Inviting..." : "Send invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
