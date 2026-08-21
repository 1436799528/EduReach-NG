import fs from 'node:fs';
import path from 'node:path';
import { fail, isGuardError, requireApiUser, serverError } from '@/lib/api';
import { findResource, incrementDownloads } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

/**
 * Controlled download endpoint (§28): files live outside public web root,
 * served only through this handler to authenticated users, with the stored
 * (server-generated) filename never derived from client input.
 */
export async function GET(req: Request, { params }: Ctx) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const resource = findResource(params.id);
  if (!resource || resource.status !== 'APPROVED' || !resource.stored_path) {
    return fail(404, 'Resource not found.');
  }

  // Belt-and-braces: reject anything path-like; only plain generated names are valid.
  if (!/^[a-f0-9-]+\.[a-z0-9]+$/i.test(resource.stored_path)) {
    return serverError();
  }

  const storageDir = process.env.STORAGE_DIR || 'storage/uploads';
  const dirAbs = path.isAbsolute(storageDir) ? storageDir : path.join(process.cwd(), storageDir);
  const filePath = path.join(dirAbs, resource.stored_path);
  if (!filePath.startsWith(dirAbs + path.sep) || !fs.existsSync(filePath)) {
    return serverError();
  }

  const data = fs.readFileSync(filePath);
  incrementDownloads(resource.id);

  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': resource.mime ?? 'application/octet-stream',
      'Content-Length': String(data.length),
      'Content-Disposition': `attachment; filename="${(resource.file_name ?? 'resource').replace(/[^\w.\- ]/g, '_')}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=3600'
    }
  });
}
