// Creates the local database schema (idempotent). Run: npm run db:setup
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function resolveDbFile() {
  const url = process.env.DATABASE_URL || 'file:storage/edureach.db';
  const p = url.startsWith('file:') ? url.slice(5) : url;
  return path.isAbsolute(p) ? p : path.join(root, p);
}

// Load .env manually (no dotenv dependency)
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)\s*=\s*"?([^"]*)"?/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const file = resolveDbFile();
fs.mkdirSync(path.dirname(file), { recursive: true });

const db = new DatabaseSync(file);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec(fs.readFileSync(path.join(root, 'db', 'schema.sql'), 'utf8'));
db.close();
console.log(`✔ Schema applied → ${path.relative(root, file)}`);
