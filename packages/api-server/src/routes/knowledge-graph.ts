// File: packages/api-server/src/routes/knowledge-graph.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { addNode, addEdge, getGraphSnapshot, matchCrossDomain } from "../services/graph.service";
import { EvidenceBindingError } from "@ktn/domain-core";

export async function knowledgeGraphRoutes(fastify: FastifyInstance) {
  // POST /api/graph/nodes
  fastify.post(
    "/api/graph/nodes",
    async (
      request: FastifyRequest<{
        Body: {
          tenant_id?: string;
          node_type: string;
          properties: Record<string, unknown>;
        };
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const { tenant_id = "tenant-default", node_type, properties } = request.body || {};
        if (!node_type || !properties) {
          return reply.status(400).send({
            error: "Missing required fields: node_type and properties are required.",
          });
        }
        const createdNode = await addNode(tenant_id, { node_type, properties });
        return reply.status(201).send(createdNode);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create node";
        return reply.status(500).send({ error: msg });
      }
    },
  );

  // POST /api/graph/edges
  fastify.post(
    "/api/graph/edges",
    async (
      request: FastifyRequest<{
        Body: {
          tenant_id?: string;
          edge_type: string;
          source_id: string;
          target_id: string;
          evidence_hashes: string[];
          properties?: Record<string, unknown>;
        };
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const {
          tenant_id = "tenant-default",
          edge_type,
          source_id,
          target_id,
          evidence_hashes,
          properties,
        } = request.body || {};

        if (!edge_type || !source_id || !target_id || !evidence_hashes) {
          return reply.status(400).send({
            error:
              "Missing required fields: edge_type, source_id, target_id, and evidence_hashes are required.",
          });
        }

        const createdEdge = await addEdge(tenant_id, {
          edge_type,
          source_id,
          target_id,
          evidence_hashes,
          properties,
        });

        return reply.status(201).send(createdEdge);
      } catch (err: unknown) {
        if (err instanceof EvidenceBindingError) {
          return reply.status(422).send({
            error: "EvidenceBindingError",
            message: err.message,
          });
        }
        const msg = err instanceof Error ? err.message : "Failed to create edge";
        return reply.status(500).send({ error: msg });
      }
    },
  );

  // GET /api/graph/nodes
  fastify.get("/api/graph/nodes", async (_request: FastifyRequest, reply: FastifyReply) => {
    const snapshot = getGraphSnapshot();
    return reply.send({ data: snapshot.nodes, total: snapshot.nodes.length });
  });

  // GET /api/graph/edges
  fastify.get("/api/graph/edges", async (_request: FastifyRequest, reply: FastifyReply) => {
    const snapshot = getGraphSnapshot();
    return reply.send({ data: snapshot.edges, total: snapshot.edges.length });
  });

  // POST /api/graph/match
  fastify.post(
    "/api/graph/match",
    async (
      request: FastifyRequest<{
        Body: {
          sourceNodeId: string;
          targetNodeId: string;
          relationshipHint?: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const { sourceNodeId, targetNodeId, relationshipHint } = request.body || {};
        if (!sourceNodeId || !targetNodeId) {
          return reply.status(400).send({
            error: "Missing required fields: sourceNodeId and targetNodeId are required.",
          });
        }

        const matchResult = matchCrossDomain({
          sourceNodeId,
          targetNodeId,
          relationshipHint,
        });

        return reply.send(matchResult);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to execute SI cross-domain match";
        return reply.status(500).send({ error: msg });
      }
    },
  );
}
