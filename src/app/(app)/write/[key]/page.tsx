import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getInstitutionFull } from '@/lib/data/institutions';
import { getTemplate, LETTER_TEMPLATES } from '@/lib/letters/registry';
import { LetterStudio } from '@/components/letter-studio';
import type { LetterValues } from '@/lib/letters/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { key: string } }): Promise<Metadata> {
  const t = getTemplate(params.key);
  return { title: t ? `Write: ${t.title}` : 'Write' };
}

export default function WriteTemplatePage({ params }: { params: { key: string } }) {
  const template = getTemplate(params.key);
  if (!template) notFound();

  const session = getSessionUser();
  if (!session) redirect(`/login?next=/write/${params.key}`);

  // Pre-fill identity fields from the user's profile (never invented).
  const prefill: LetterValues = { fullName: session.user.full_name };
  if (session.institutionName) prefill.institution = session.institutionName;
  const inst = session.institutionSlug ? getInstitutionFull(session.institutionSlug) : undefined;
  if (inst && session.profile?.faculty_id) {
    const fac = inst.faculties.find((f) => f.id === session.profile?.faculty_id);
    if (fac) prefill.faculty = fac.name.replace(/^Faculty of |^College of /, '');
    if (session.profile?.department_id) {
      const dept = fac?.departments.find((d) => d.id === session.profile?.department_id);
      if (dept) prefill.department = dept.name;
    }
  }
  if (session.profile?.level) prefill.level = session.profile.level;

  const others = LETTER_TEMPLATES.filter((t) => t.key !== params.key).slice(0, 4);

  return (
    <div>
      <div className="page-head no-print">
        <p className="small" style={{ marginBottom: 4 }}><Link href="/write">← Write Center</Link></p>
        <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>{template.title}</h1>
        <p>{template.description}</p>
      </div>

      <LetterStudio templateKey={params.key} prefill={prefill} />

      <div className="divider-label no-print">Also useful</div>
      <div className="grid grid--4 no-print">
        {others.map((t) => (
          <Link key={t.key} href={`/write/${t.key}`} className="action-tile" style={{ padding: 14 }}>
            <h3 style={{ fontSize: '0.95rem' }}>{t.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
