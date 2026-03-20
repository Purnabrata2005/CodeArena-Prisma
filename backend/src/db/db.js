import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check your .env file.");
}

const normalizeDatabaseUrl = (connectionString) => {
  try {
    const connectionUrl = new URL(connectionString);
    const sslMode = connectionUrl.searchParams.get("sslmode")?.toLowerCase();
    const useLibpqCompat =
      connectionUrl.searchParams.get("uselibpqcompat") === "true";

    if (
      !useLibpqCompat &&
      ["prefer", "require", "verify-ca"].includes(sslMode)
    ) {
      // Preserve pg v8 behavior explicitly to avoid sslmode alias warnings.
      connectionUrl.searchParams.set("sslmode", "verify-full");
    }

    return connectionUrl.toString();
  } catch {
    return connectionString;
  }
};

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis;
export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;