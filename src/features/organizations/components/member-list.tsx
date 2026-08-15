"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteMemberDialog } from "./invite-member-dialog";
import { RoleBadge, RoleSelector, Can } from "@/features/rbac";
import { PermissionProvider, usePermission } from "@/features/rbac/hooks/use-permission";

interface Member {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  joinedAt: string | null;
}

interface PendingInvitation {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface MemberListProps {
  organizationId: string;
  members: Member[];
  invitations: PendingInvitation[];
  currentUserId: string;
  currentUserRole: string;
  onInviteCreated?: () => void;
}

function MemberRow({
  member,
  organizationId,
  currentUserId,
  onRemove,
  removing,
}: {
  member: Member;
  organizationId: string;
  currentUserId: string;
  onRemove: (userId: string) => void;
  removing: string | null;
}) {
  const { hasPermission } = usePermission();
  const router = useRouter();
  const [changingRole, setChangingRole] = useState(false);

  async function handleRoleChange(newRole: string) {
    setChangingRole(true);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/members/${member.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) router.refresh();
    } catch {
      // silently fail
    } finally {
      setChangingRole(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-full text-xs font-medium">
          {(member.name ?? member.email).charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-foreground text-sm font-medium">{member.name ?? member.email}</span>
          <span className="text-muted-foreground text-xs">{member.email}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {hasPermission("roles:assign") &&
        member.userId !== currentUserId &&
        member.role !== "owner" ? (
          <RoleSelector value={member.role} onChange={handleRoleChange} disabled={changingRole} />
        ) : (
          <RoleBadge role={member.role} />
        )}
        <Can permission="members:remove">
          {member.role !== "owner" && member.userId !== currentUserId && (
            <button
              onClick={() => onRemove(member.userId)}
              disabled={removing === member.userId}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md p-1"
              title="Remove member"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </Can>
      </div>
    </div>
  );
}

export function MemberList({
  organizationId,
  members,
  invitations,
  currentUserId,
  currentUserRole,
  onInviteCreated,
}: MemberListProps) {
  const router = useRouter();
  const [showInvite, setShowInvite] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(userId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setRemoving(userId);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/members/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } catch {
      // silently fail
    } finally {
      setRemoving(null);
    }
  }

  return (
    <PermissionProvider organizationId={organizationId} memberRole={currentUserRole}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {members.length} member{members.length !== 1 ? "s" : ""}
            {invitations.length > 0
              ? ` · ${invitations.length} pending invite${invitations.length !== 1 ? "s" : ""}`
              : ""}
          </p>
          <Can permission="members:invite">
            <Button size="sm" onClick={() => setShowInvite(true)}>
              Invite member
            </Button>
          </Can>
        </div>

        {invitations.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Pending invitations
            </span>
            <div className="divide-border border-border divide-y rounded-lg border border-dashed">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-full text-xs font-medium">
                      {(inv.email ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-medium">{inv.email}</span>
                      <span className="text-muted-foreground text-xs">
                        Invited as {inv.role} · expires{" "}
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-700">
                    PENDING
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="divide-border border-border divide-y rounded-lg border">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              organizationId={organizationId}
              currentUserId={currentUserId}
              onRemove={handleRemove}
              removing={removing}
            />
          ))}
        </div>

        <InviteMemberDialog
          organizationId={organizationId}
          open={showInvite}
          onOpenChange={setShowInvite}
          onInvited={onInviteCreated}
        />
      </div>
    </PermissionProvider>
  );
}
