# The Morningstar Solution

**Engineering Reality Platform** — verifying engineering truth through deterministic, evidence-based reasoning.

## Architecture

Built on Next.js 16 with the App Router, Fastify API Server, TypeScript, Tailwind CSS, and Prisma ORM. Designed for deterministic behavior, explainability, traceability, maintainability, and scalability.

## Tech Stack

| Layer       | Technology                                |
| ----------- | ----------------------------------------- |
| Frontend    | Next.js 16, React 19, TypeScript          |
| API Server  | Fastify, Node.js, TypeScript              |
| Core Domain | `@ktn/domain-core` Knowledge Graph Engine |
| Styling     | Tailwind CSS 4                            |
| Validation  | Zod                                       |
| Database    | PostgreSQL via Prisma ORM                 |
| Testing     | Vitest (unit), Playwright (e2e)           |
| Linting     | ESLint 9, Prettier                        |
| Git Hooks   | Husky, lint-staged                        |
| Package Mgr | pnpm / bun                                |

## Folder Structure

```
/
├── packages/
│   ├── domain-core/      # Pure Knowledge Graph Engine & 2-Phase SI Matcher
│   │   └── src/
│   │       ├── types.ts      # SIProperty, KnowledgeNode, KnowledgeEdge, MatchResult
│   │       ├── graph.ts      # KnowledgeGraph class with evidence hash validation
│   │       ├── si-matcher.ts # convertSI unit converter & 2-Phase Cross-Domain Matcher
│   │       └── index.ts
│   └── api-server/       # Fastify REST API Server & Persistence Layer
│       └── src/
│           ├── services/     # graph.service.ts (Event-sourcing & Audit logging)
│           ├── routes/       # knowledge-graph.ts (Nodes, Edges, Match API routes)
│           └── server.ts
├── docker/
│   ├── init-db.sql       # Database schema setup with evidence_hashes
│   └── seed.sql          # Seed evidence spans, material, equation & constraint nodes
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature modules
│   └── server/           # Server-side business engines
├── prisma/               # Prisma schema and migrations
└── tests/                # Vitest unit & Playwright E2E tests
```

## Knowledge Graph Core & 2-Phase SI Matcher

The **Knowledge Graph Core** forms the event-sourced heart of the platform.

### Key Rules

1. **Append-Only Event Sourcing**: All node and edge mutations generate an immutable `AuditEvent`.
2. **Mandatory Evidence Binding**: Every relationship edge must carry a non-empty array of valid SHA-256 evidence hashes (`evidence_hashes`) matching source document spans. Throws `EvidenceBindingError` if missing or invalid.
3. **2-Phase SI Cross-Domain Matcher**:
   - **Phase 1**: Graph path traversal (max depth 3) connecting source and target domain nodes.
   - **Phase 2**: SI unit conversion (`convertSI`) and arithmetic compatibility verification. Generates `ConstraintDemotionWarning` if operating stress exceeds material yield strength.

### Testing the Knowledge Graph Matcher API

1. Start the API server:

   ```bash
   pnpm --filter @ktn/api-server dev
   ```

2. Query node IDs from the seed data:

   ```bash
   # Equation Node (Operating Stress 300 MPa): a0000000-0000-0000-0000-000000000002
   # Material Node (Yield Strength 250 MPa):  a0000000-0000-0000-0000-000000000001
   ```

3. Execute a cross-domain match query using `curl`:

   ```bash
   curl -X POST http://localhost:3001/api/graph/match \
     -H "Content-Type: application/json" |
     -d '{
       "sourceNodeId": "a0000000-0000-0000-0000-000000000002",
       "targetNodeId": "a0000000-0000-0000-0000-000000000001"
     }'
   ```

   **Expected Output**: Returns a match result containing `overallStatus: "CONSTRAINT_DEMOTED"`, the connecting path, and a `ConstraintDemotionWarning` explaining that calculated operating stress (300 MPa) exceeds material yield strength (250 MPa).

4. Add a new evidence-backed edge via API:
   ```bash
   curl -X POST http://localhost:3001/api/graph/edges \
     -H "Content-Type: application/json" \
     -d '{
       "tenant_id": "tenant-default",
       "edge_type": "constrains",
       "source_id": "a0000000-0000-0000-0000-000000000002",
       "target_id": "a0000000-0000-0000-0000-000000000001",
       "evidence_hashes": [
         "f0e1d2c3b4a59876543210fe2109876543210fe2109876543210fe2109876543"
       ]
     }'
   ```

## Development & Testing

```bash
pnpm dev          # Start dev server on http://localhost:3000
pnpm test         # Run unit tests
pnpm typecheck    # TypeScript type checking
```

## License

Proprietary — AKSCI
