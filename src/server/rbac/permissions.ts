export const Resources = {
  ORGANIZATION: "organization",
  MEMBERS: "members",
  ROLES: "roles",
  SETTINGS: "settings",
  RULES: "rules",
  ENGINEERING: "engineering",
  DOCUMENTS: "documents",
  KNOWLEDGE_GRAPH: "knowledge_graph",
  EVIDENCE: "evidence",
  CONTRADICTIONS: "contradictions",
  ORCHESTRATOR: "orchestrator",
  REALITY: "reality",
  REPORTING: "reporting",
  SUPPLIERS: "suppliers",
  DECISIONS: "decisions",
  PRECEDENTS: "precedents",
} as const;

export const Actions = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  INVITE: "invite",
  REMOVE: "remove",
  ASSIGN: "assign",
  EXECUTE: "execute",
} as const;

export const Permissions = {
  organization: {
    read: "organization:read",
    update: "organization:update",
    manage: "organization:manage",
  },
  members: {
    read: "members:read",
    invite: "members:invite",
    remove: "members:remove",
    manage: "members:manage",
  },
  roles: {
    read: "roles:read",
    assign: "roles:assign",
    manage: "roles:manage",
  },
  settings: {
    read: "settings:read",
    update: "settings:update",
  },
  rules: {
    read: "rules:read",
    create: "rules:create",
    update: "rules:update",
    delete: "rules:delete",
    execute: "rules:execute",
    manage: "rules:manage",
  },
  engineering: {
    read: "engineering:read",
    create: "engineering:create",
    update: "engineering:update",
    delete: "engineering:delete",
    manage: "engineering:manage",
  },
  documents: {
    read: "documents:read",
    create: "documents:create",
    manage: "documents:manage",
  },
  knowledgeGraph: {
    read: "knowledge_graph:read",
    create: "knowledge_graph:create",
    delete: "knowledge_graph:delete",
    manage: "knowledge_graph:manage",
  },
  evidence: {
    read: "evidence:read",
    execute: "evidence:execute",
  },
  contradictions: {
    read: "contradictions:read",
    update: "contradictions:update",
    manage: "contradictions:manage",
  },
  orchestrator: {
    read: "orchestrator:read",
    execute: "orchestrator:execute",
    manage: "orchestrator:manage",
  },
  reality: {
    read: "reality:read",
    execute: "reality:execute",
    manage: "reality:manage",
  },
  reporting: {
    read: "reporting:read",
    execute: "reporting:execute",
    manage: "reporting:manage",
  },
  suppliers: {
    read: "suppliers:read",
    create: "suppliers:create",
    update: "suppliers:update",
    delete: "suppliers:delete",
    manage: "suppliers:manage",
  },
  decisions: {
    read: "decisions:read",
    create: "decisions:create",
    update: "decisions:update",
    finalize: "decisions:finalize",
    manage: "decisions:manage",
  },
  precedents: {
    read: "precedents:read",
    create: "precedents:create",
    update: "precedents:update",
    delete: "precedents:delete",
    manage: "precedents:manage",
  },
} as const;

export type PermissionString =
  | "organization:read"
  | "organization:update"
  | "organization:manage"
  | "members:read"
  | "members:invite"
  | "members:remove"
  | "members:manage"
  | "roles:read"
  | "roles:assign"
  | "roles:manage"
  | "settings:read"
  | "settings:update"
  | "rules:read"
  | "rules:create"
  | "rules:update"
  | "rules:delete"
  | "rules:execute"
  | "rules:manage"
  | "engineering:read"
  | "engineering:create"
  | "engineering:update"
  | "engineering:delete"
  | "engineering:manage"
  | "documents:read"
  | "documents:create"
  | "documents:manage"
  | "knowledge_graph:read"
  | "knowledge_graph:create"
  | "knowledge_graph:delete"
  | "knowledge_graph:manage"
  | "evidence:read"
  | "evidence:execute"
  | "contradictions:read"
  | "contradictions:update"
  | "contradictions:manage"
  | "orchestrator:read"
  | "orchestrator:execute"
  | "orchestrator:manage"
  | "reality:read"
  | "reality:execute"
  | "reality:manage"
  | "reporting:read"
  | "reporting:execute"
  | "reporting:manage"
  | "suppliers:read"
  | "suppliers:create"
  | "suppliers:update"
  | "suppliers:delete"
  | "suppliers:manage"
  | "decisions:read"
  | "decisions:create"
  | "decisions:update"
  | "decisions:finalize"
  | "decisions:manage"
  | "precedents:read"
  | "precedents:create"
  | "precedents:update"
  | "precedents:delete"
  | "precedents:manage";

export const ALL_PERMISSIONS: PermissionString[] = [
  Permissions.organization.read,
  Permissions.organization.update,
  Permissions.organization.manage,
  Permissions.members.read,
  Permissions.members.invite,
  Permissions.members.remove,
  Permissions.members.manage,
  Permissions.roles.read,
  Permissions.roles.assign,
  Permissions.roles.manage,
  Permissions.settings.read,
  Permissions.settings.update,
  Permissions.rules.read,
  Permissions.rules.create,
  Permissions.rules.update,
  Permissions.rules.delete,
  Permissions.rules.execute,
  Permissions.rules.manage,
  Permissions.engineering.read,
  Permissions.engineering.create,
  Permissions.engineering.update,
  Permissions.engineering.delete,
  Permissions.engineering.manage,
  Permissions.documents.read,
  Permissions.documents.create,
  Permissions.documents.manage,
  Permissions.knowledgeGraph.read,
  Permissions.knowledgeGraph.create,
  Permissions.knowledgeGraph.delete,
  Permissions.knowledgeGraph.manage,
  Permissions.evidence.read,
  Permissions.evidence.execute,
  Permissions.contradictions.read,
  Permissions.contradictions.update,
  Permissions.contradictions.manage,
  Permissions.orchestrator.read,
  Permissions.orchestrator.execute,
  Permissions.orchestrator.manage,
  Permissions.reality.read,
  Permissions.reality.execute,
  Permissions.reality.manage,
  Permissions.reporting.read,
  Permissions.reporting.execute,
  Permissions.reporting.manage,
  Permissions.suppliers.read,
  Permissions.suppliers.create,
  Permissions.suppliers.update,
  Permissions.suppliers.delete,
  Permissions.suppliers.manage,
  Permissions.decisions.read,
  Permissions.decisions.create,
  Permissions.decisions.update,
  Permissions.decisions.finalize,
  Permissions.decisions.manage,
  Permissions.precedents.read,
  Permissions.precedents.create,
  Permissions.precedents.update,
  Permissions.precedents.delete,
  Permissions.precedents.manage,
];

export interface RoleDefinition {
  name: string;
  slug: string;
  description: string;
  permissions: PermissionString[];
}

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    name: "Owner",
    slug: "owner",
    description: "Full access to all organization resources and settings",
    permissions: [...ALL_PERMISSIONS],
  },
  {
    name: "Administrator",
    slug: "admin",
    description: "Full access to manage resources but cannot delete the organization",
    permissions: [
      Permissions.organization.read,
      Permissions.organization.update,
      Permissions.members.read,
      Permissions.members.invite,
      Permissions.members.remove,
      Permissions.members.manage,
      Permissions.roles.read,
      Permissions.roles.assign,
      Permissions.settings.read,
      Permissions.settings.update,
      Permissions.rules.read,
      Permissions.rules.create,
      Permissions.rules.update,
      Permissions.rules.delete,
      Permissions.rules.execute,
      Permissions.rules.manage,
      Permissions.engineering.read,
      Permissions.engineering.create,
      Permissions.engineering.update,
      Permissions.engineering.delete,
      Permissions.engineering.manage,
      Permissions.documents.read,
      Permissions.documents.create,
      Permissions.documents.manage,
      Permissions.knowledgeGraph.read,
      Permissions.knowledgeGraph.create,
      Permissions.knowledgeGraph.delete,
      Permissions.knowledgeGraph.manage,
      Permissions.evidence.read,
      Permissions.evidence.execute,
      Permissions.contradictions.read,
      Permissions.contradictions.update,
      Permissions.contradictions.manage,
      Permissions.orchestrator.read,
      Permissions.orchestrator.execute,
      Permissions.orchestrator.manage,
      Permissions.reality.read,
      Permissions.reality.execute,
      Permissions.reality.manage,
      Permissions.suppliers.read,
      Permissions.suppliers.create,
      Permissions.suppliers.update,
      Permissions.suppliers.delete,
      Permissions.suppliers.manage,
      Permissions.decisions.read,
      Permissions.decisions.create,
      Permissions.decisions.update,
      Permissions.decisions.finalize,
      Permissions.decisions.manage,
      Permissions.precedents.read,
      Permissions.precedents.create,
      Permissions.precedents.update,
      Permissions.precedents.delete,
      Permissions.precedents.manage,
      Permissions.reporting.read,
      Permissions.reporting.execute,
      Permissions.reporting.manage,
    ],
  },
  {
    name: "Manager",
    slug: "manager",
    description: "Can manage members and view organization settings",
    permissions: [
      Permissions.organization.read,
      Permissions.members.read,
      Permissions.members.invite,
      Permissions.roles.read,
      Permissions.settings.read,
      Permissions.rules.read,
      Permissions.engineering.read,
      Permissions.documents.read,
      Permissions.knowledgeGraph.read,
      Permissions.evidence.read,
      Permissions.contradictions.read,
      Permissions.orchestrator.read,
      Permissions.reality.read,
      Permissions.suppliers.read,
      Permissions.decisions.read,
      Permissions.decisions.create,
      Permissions.decisions.update,
      Permissions.precedents.read,
      Permissions.reporting.read,
    ],
  },
  {
    name: "Engineer",
    slug: "engineer",
    description: "Can access core engineering features and settings",
    permissions: [
      Permissions.organization.read,
      Permissions.members.read,
      Permissions.roles.read,
      Permissions.settings.read,
      Permissions.settings.update,
      Permissions.rules.read,
      Permissions.rules.create,
      Permissions.rules.update,
      Permissions.rules.execute,
      Permissions.engineering.read,
      Permissions.engineering.create,
      Permissions.engineering.update,
      Permissions.documents.read,
      Permissions.documents.create,
      Permissions.documents.manage,
      Permissions.knowledgeGraph.read,
      Permissions.knowledgeGraph.create,
      Permissions.evidence.read,
      Permissions.evidence.execute,
      Permissions.contradictions.read,
      Permissions.contradictions.update,
      Permissions.orchestrator.read,
      Permissions.orchestrator.execute,
      Permissions.reality.read,
      Permissions.reality.execute,
      Permissions.suppliers.read,
      Permissions.suppliers.create,
      Permissions.suppliers.update,
      Permissions.decisions.read,
      Permissions.decisions.create,
      Permissions.decisions.update,
      Permissions.precedents.read,
      Permissions.precedents.create,
      Permissions.precedents.update,
      Permissions.reporting.read,
      Permissions.reporting.execute,
    ],
  },
  {
    name: "Viewer",
    slug: "viewer",
    description: "Read-only access to organization resources",
    permissions: [
      Permissions.organization.read,
      Permissions.members.read,
      Permissions.roles.read,
      Permissions.settings.read,
      Permissions.rules.read,
      Permissions.engineering.read,
      Permissions.documents.read,
      Permissions.knowledgeGraph.read,
      Permissions.evidence.read,
      Permissions.contradictions.read,
      Permissions.orchestrator.read,
      Permissions.reality.read,
      Permissions.suppliers.read,
      Permissions.decisions.read,
      Permissions.precedents.read,
      Permissions.reporting.read,
    ],
  },
  {
    name: "Auditor",
    slug: "auditor",
    description: "Read-only access focused on audit trails, evidence, and compliance records",
    permissions: [
      Permissions.organization.read,
      Permissions.members.read,
      Permissions.roles.read,
      Permissions.settings.read,
      Permissions.rules.read,
      Permissions.rules.execute,
      Permissions.engineering.read,
      Permissions.documents.read,
      Permissions.knowledgeGraph.read,
      Permissions.evidence.read,
      Permissions.evidence.execute,
      Permissions.contradictions.read,
      Permissions.orchestrator.read,
      Permissions.orchestrator.execute,
      Permissions.reality.read,
      Permissions.suppliers.read,
      Permissions.decisions.read,
      Permissions.decisions.finalize,
      Permissions.precedents.read,
      Permissions.reporting.read,
      Permissions.reporting.execute,
    ],
  },
];
