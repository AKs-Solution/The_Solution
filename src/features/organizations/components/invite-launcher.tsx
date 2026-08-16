"use client";

import { useEffect, useRef, useState } from "react";
import { InviteMemberDialog } from "./invite-member-dialog";

export function InviteLauncher() {
  const [open, setOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [canInvite, setCanInvite] = useState(false);
  const pendingOpenRef = useRef(false);

  useEffect(() => {
    const onOpen = () => {
      if (canInvite && organizationId) {
        setOpen(true);
        return;
      }
      pendingOpenRef.current = true;
    };
    window.addEventListener("consecuencia:open-invite", onOpen);
    return () => window.removeEventListener("consecuencia:open-invite", onOpen);
  }, [canInvite, organizationId]);

  useEffect(() => {
    if (!canInvite || !organizationId || !pendingOpenRef.current) return;
    pendingOpenRef.current = false;
    setOpen(true);
  }, [canInvite, organizationId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        if (!meRes.ok) return;
        const me = await meRes.json();
        if (me.data?.guest || !me.data?.organizationId) return;
        const orgId = me.data.organizationId as string;
        const membersRes = await fetch(`/api/organizations/${orgId}/members`);
        if (!membersRes.ok) return;
        const members = await membersRes.json();
        const self = Array.isArray(members.data)
          ? members.data.find(
              (member: { userId: string; role: string }) => member.userId === me.data.id,
            )
          : null;
        const role = self?.role ?? "";
        if (!cancelled) {
          setOrganizationId(orgId);
          setCanInvite(role === "owner" || role === "admin" || role === "manager");
        }
      } catch {
        // Invite launcher stays hidden when membership cannot be resolved.
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!organizationId || !canInvite) return null;

  return <InviteMemberDialog organizationId={organizationId} open={open} onOpenChange={setOpen} />;
}
