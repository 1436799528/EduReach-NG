import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fail, getClientIp, isGuardError, logActivity, logAudit, ok, rateLimit, requireApiUser, serverError, tooMany } from '@/lib/api';
import { createResource, listApprovedResources } from '@/lib/data/content';
import { RESOURCE_TYPES } from '@/lib/validation';
import { roleAtLeast } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Map<string, string>([
  ['pdf', 'application/pdf'],
  ['doc', 'application/msword'],
  ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['png', 'image/png']
]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const resources = listApprovedResources({
    q: url.searchParams.get('q') ?? undefined,
    type: url.searchParams.get('type') ?? undefined,
    course: url.searchParams.get('course') ?? undefined,
    institutionId: url.searchParams.get('institution') ?? undefined
  }).map(({ stored_path, ...r }) => ({ ...r, canDownload: !!stored_path }));
  return ok({ resources });
}

export async function POST(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const { session } = guard;

  const ip = getClientIp(req);
  const rl = rateLimit(`upload:${session.user.id}:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, 'Invalid upload request.');
  }

  const title = String(form.get('title') ?? '').trim();
  const type = String(form.get('type') ?? 'OTHER');
  const description = String(form.get('description') ?? '').trim();
  const course = String(form.get('course') ?? '').trim();
  const level = String(form.get('level') ?? '').trim();
  const yearRaw = String(form.get('year') ?? '').trim();
  const externalUrl = String(form.get('externalUrl') ?? '').trim();
  const file = form.get('file');

  if (title.length < 4 || title.length > 200) return fail(400, 'Please give the resource a clear title (4–200 characters).');
  if (!(RESOURCE_TYPES as readonly string[]).includes(type)) return fail(400, 'Please choose a valid resource type.');
  const year = yearRaw ? Number(yearRaw) : null;
  if (yearRaw && (Number.isNaN(year) || year! < 1990 || year! > 2100)) return fail(400, 'Please enter a valid year.');

  const isAdmin = roleAtLeast(session.user.role, 'MODERATOR');
  const status = isAdmin ? 'APPROVED' : 'PENDING';

  // External link resource
  if (!file || typeof file === 'string') {
    if (!externalUrl || !/^https?:\/\//i.test(externalUrl)) {
      return fail(400, 'Attach a file or provide a valid https link.');
    }
    const id = createResource({
      title, description: description || null, type, institutionId: session.profile?.institution_id ?? null,
      course: course || null, level: level || null, year, fileName: null, storedPath: null, fileSize: null, mime: null,
      externalUrl, status, uploaderId: session.user.id
    });
    logActivity(session.user.id, 'RESOURCE_UPLOADED', `Shared resource "${title}" (link)`);
    return ok({ ok: true, id, status }, 201);
  }

  // File upload — layered validation (§28)
  if (!(file instanceof File)) return fail(400, 'Invalid file.');
  const originalName = file.name || 'upload';
  const ext = originalName.split('.').pop()?.toLowerCase() ?? '';
  const expectedMime = ALLOWED_EXT.get(ext);
  if (!expectedMime) {
    return fail(400, 'That file type is not allowed. Accepted: PDF, DOC, DOCX, JPG, PNG.');
  }
  if (file.size <= 0) return fail(400, 'The file appears to be empty.');
  if (file.size > MAX_BYTES) return fail(400, 'Files must be 5 MB or smaller.');

  const bytes = new Uint8Array(await file.arrayBuffer());
  // Magic-byte sniffing — extension+MIME claims are never trusted alone (§28).
  const magicOk = (() => {
    if (expectedMime === 'application/pdf') return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
    if (expectedMime === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8;
    if (expectedMime === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47; // ‰PNG
    if (expectedMime === 'application/msword') return bytes[0] === 0xd0 && bytes[1] === 0xcf; // OLE2 compound
    if (expectedMime.includes('openxmlformats')) return bytes[0] === 0x50 && bytes[1] === 0x4b; // PK zip container
    return false;
  })();
  if (!magicOk) return fail(400, 'The file contents do not match its type.');

  const storageDir = process.env.STORAGE_DIR || 'storage/uploads';
  const dirAbs = path.isAbsolute(storageDir) ? storageDir : path.join(process.cwd(), storageDir);
  fs.mkdirSync(dirAbs, { recursive: true });
  const storedName = `${crypto.randomUUID()}.${ext}`; // safe server-generated name
  try {
    fs.writeFileSync(path.join(dirAbs, storedName), bytes);
  } catch {
    return serverError();
  }

  const id = createResource({
    title, description: description || null, type, institutionId: session.profile?.institution_id ?? null,
    course: course || null, level: level || null, year, fileName: originalName.slice(0, 200), storedPath: storedName,
    fileSize: file.size, mime: expectedMime, externalUrl: null, status, uploaderId: session.user.id
  });
  logActivity(session.user.id, 'RESOURCE_UPLOADED', `Uploaded "${title}" for moderation`);
  logAudit({ userId: session.user.id, action: 'RESOURCE_UPLOADED', entity: 'resource', entityId: id, ip });

  return ok({
    ok: true,
    id,
    status,
    message: status === 'PENDING' ? 'Uploaded — it will appear publicly after moderation.' : 'Published.'
  }, 201);
}
