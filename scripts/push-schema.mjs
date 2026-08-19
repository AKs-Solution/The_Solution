import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const isVercel = process.env.VERCEL === "1";
const isProduction = process.env.VERCEL_ENV === "production";

if (process.env.SKIP_SCHEMA_PUSH === "1") {
  console.log("[schema] SKIP_SCHEMA_PUSH=1; skipping prisma db push.");
  process.exit(0);
}

if (!isVercel || !isProduction) {
  console.log("[schema] Skipping prisma db push (not a Vercel production build).");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.warn("[schema] DATABASE_URL is missing; skipping prisma db push.");
  process.exit(0);
}

const prismaBin = existsSync("node_modules/.bin/prisma")
  ? "node_modules/.bin/prisma"
  : existsSync("node_modules/.bin/prisma.cmd")
    ? "node_modules/.bin/prisma.cmd"
    : "prisma";

const args = ["db", "push", "--skip-generate"];
console.log(`[schema] Running \`${prismaBin} ${args.join(" ")}\`...`);

const result = spawnSync(prismaBin, args, { stdio: "inherit", shell: true });

if (result.error) {
  console.error("[schema] Failed to launch prisma:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);