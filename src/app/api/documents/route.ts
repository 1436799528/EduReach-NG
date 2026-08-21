import { fail, isGuardError, logActivity, ok, parseJson, requireApiUser } from '@/lib/api';
import { createDocument, listDocuments } from '@/lib/data/workspace';
import { composeLetter, letterToText } from '@/lib/letters/render';
import { getTemplate } from '@/lib/letters/registry';
import { documentSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const docs = listDocuments(guard.session.user.id).map((d) => ({
    id: d.id,
    templateKey: d.template_key,
    title: d.title,
    createdAt: d.created_at
  }));
  return ok({ documents: docs });
}

export async function POST(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const parsed = await parseJson(req, documentSchema);
  if ('response' in parsed) return parsed.response;
  const { templateKey, title, values } = parsed.data;

  const template = getTemplate(templateKey);
  if (!template) return fail(400, 'Unknown letter template.');

  const composed = composeLetter(template, values);
  const text = letterToText(composed);
  const id = createDocument(guard.session.user.id, templateKey, title || template.title, JSON.stringify(values), text);

  logActivity(guard.session.user.id, 'LETTER_SAVED', `Generated "${template.title}"`);
  return ok({ ok: true, id }, 201);
}
