import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listInstitutions, listFaculties, listDepartments } from '@/lib/data/institutions';
import { OnboardingForm } from '@/components/onboarding-form';

export const metadata: Metadata = { title: 'Set up your profile' };
export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  const session = getSessionUser();
  if (!session) redirect('/login');

  const institutions = listInstitutions().map((i) => ({ id: i.id, name: i.name, shortName: i.short_name }));
  const facultiesByInst: Record<string, { id: string; name: string }[]> = {};
  const departmentsByFac: Record<string, { id: string; name: string }[]> = {};

  for (const inst of listInstitutions()) {
    const facs = listFaculties(inst.id);
    facultiesByInst[inst.id] = facs.map((f) => ({ id: f.id, name: f.name }));
    for (const f of facs) {
      departmentsByFac[f.id] = listDepartments(f.id).map((d) => ({ id: d.id, name: d.name }));
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div className="page-head">
        <h1 style={{ fontSize: '1.7rem' }}>Let&apos;s personalise EduReach for you</h1>
        <p>Answer what you know — everything is optional except your profile basics. You can change all of this later.</p>
      </div>
      <div className="card card--pad-lg">
        <OnboardingForm
          institutions={institutions}
          facultiesByInst={facultiesByInst}
          departmentsByFac={departmentsByFac}
          initial={session.profile}
        />
      </div>
      <p className="small muted mt-2" style={{ textAlign: 'center' }}>
        <Link href="/dashboard">Skip for now</Link> — you can complete this any time.
      </p>
    </div>
  );
}
