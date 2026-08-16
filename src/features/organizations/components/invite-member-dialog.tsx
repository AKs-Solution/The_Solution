"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
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
  const [inviteUrl, setInviteUrl] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  function resetForm() {
    setName("");
    setEmail("");
    setRole("viewer");
    setError("");
    setInviteUrl("");
    setEmailSent(false);
    setCopied(false);
  }

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

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error || body?.details?.email?.[0] || "Failed to invite");
        return;
      }

      setInviteUrl(body?.data?.inviteUrl ?? "");
      setEmailSent(Boolean(body?.data?.emailSent));
      onInvited?.();
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  }

  async function copyLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
    } catch {
      setError("Could not copy the invite link");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite teammate</DialogTitle>
        </DialogHeader>
        {inviteUrl ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-600">
              {emailSent
                ? "An email was sent. You can also copy the invite link."
                : "Email sending is not configured. Copy this link and share it with the invitee."}
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="h-10 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-700"
              />
              <Button type="button" variant="secondary" onClick={() => void copyLink()}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
            )}
            <Input
              label="Full name (optional)"
              type="text"
              placeholder="Colleague name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                {isPending ? "Creating invite..." : "Create invitation"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
