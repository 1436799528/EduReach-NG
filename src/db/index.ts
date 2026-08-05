import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Global singleton — survives between requests in serverless
const globalForDb = globalThis as typeof globalThis & {
  __edureachSql?: postgres.Sql;
};

function getClient() {
  if (globalForDb.__edureachSql) return globalForDb.__edureachSql;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const client = postgres(databaseUrl, {
    prepare: false,
    max: 3,            // Max 3 connections
    idle_timeout: 20,  // Close idle connections after 20s
    connect_timeout: 10,
  });

  globalForDb.__edureachSql = client;
  return client;
}

function getDb() {
  return drizzle(getClient());
}

// Lazy proxy — only connects on first actual query
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
