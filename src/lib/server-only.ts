// Stub for the 'server-only' guard import used in src/lib/db.ts.
// Prevents accidental client-bundle inclusion; implemented as a side-effect guard.
if (typeof window !== 'undefined') {
  throw new Error('This module must only be imported from server code.');
}

export {};
