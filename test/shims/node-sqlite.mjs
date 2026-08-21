// Test shim: lets Vite/Vitest (which predates node's built-in SQLite) import
// the runtime builtin via createRequire instead of Vite's resolver.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sqlite = require('node:sqlite');

export const DatabaseSync = sqlite.DatabaseSync;
export const StatementSync = sqlite.StatementSync;
export default sqlite;
