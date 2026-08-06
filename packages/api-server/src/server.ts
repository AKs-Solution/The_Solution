// File: packages/api-server/src/server.ts

import Fastify from "fastify";
import cors from "@fastify/cors";
import { knowledgeGraphRoutes } from "./routes/knowledge-graph";
import { initGraph } from "./services/graph.service";

const server = Fastify({
  logger: true,
});

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || "0.0.0.0";

async function start() {
  try {
    await server.register(cors, { origin: "*" });

    // Register Knowledge Graph routes
    await server.register(knowledgeGraphRoutes);

    // Initialize in-memory Knowledge Graph from PostgreSQL DB
    await initGraph();

    await server.listen({ port: PORT, host: HOST });
    console.log(`[KTN API Server] Knowledge Graph Core server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
