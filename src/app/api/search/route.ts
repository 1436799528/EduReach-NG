import { getSessionUser } from '@/lib/auth';
import { ok } from '@/lib/api';
import { searchAll } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  const session = getSessionUser();
  return ok(searchAll(q, { institutionId: session?.profile?.institution_id ?? null }));
}
