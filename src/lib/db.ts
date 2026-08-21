import './server-only';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Minimal data-layer seam.
 * Every repository in src/lib/data/* goes through these helpers, and all SQL
 * uses positional parameters (never string concatenation of user input).
 * To move to PostgreSQL in production, swap this module's implementation for
 * a pg-backed adapter exposing the same functions.
 */

let database: DatabaseSync | null = null;

function resolveDbFile(): string {
  const url = process.env.DATABASE_URL || 'file:storage/edureach.db';
  const p = url.startsWith('file:') ? url.slice('file:'.length) : url;
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

function ensureSchema(db: DatabaseSync): void {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'")
    .get();
  if (row) return;
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  db.exec(fs.readFileSync(schemaPath, 'utf8'));
}

export function getDb(): DatabaseSync {
  if (database) return database;
  const file = resolveDbFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  ensureSchema(db);
  database = db;
  return db;
}

type SqlParam = null | number | bigint | string | Uint8Array;

/**
 * node:sqlite rows have null prototypes, which break React Server Component
 * serialization to client components. Convert to plain objects centrally.
 */
function plainify<T>(row: unknown): T {
  return Object.assign({}, row) as T;
}

/** Run a SELECT and return all rows. */
export function all<T>(sql: string, params: SqlParam[] = []): T[] {
  const rows = getDb().prepare(sql).all(...params);
  return rows.map((r) => plainify<T>(r));
}

/** Run a SELECT and return the first row, or undefined. */
export function one<T>(sql: string, params: SqlParam[] = []): T | undefined {
  const row = getDb().prepare(sql).get(...params);
  return row === undefined ? undefined : plainify<T>(row);
}

/** Run INSERT/UPDATE/DELETE; returns number of affected rows. */
export function run(sql: string, params: SqlParam[] = []): number {
  const res = getDb().prepare(sql).run(...params);
  return Number(res.changes);
}

export function uid(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}
