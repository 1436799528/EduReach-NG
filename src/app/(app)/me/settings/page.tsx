import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listDepartments, listFaculties, listInstitutions } from '@/lib/data/institutions';
import { SettingsForm } from '@/components/settings-form';

export const metadata: Metadata = { title: 'Profile & settings' };
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const session = getSessionUser();
  if (!session) redirect('/login');

  const institutions = listInstitutions().map((i) => ({ id: i.id, name: i.name, shortName: i.short_name }));
  const facultiesByInst: Record<string, { id: string; name: string }[]> = {};
  const departmentsByFac: Record<string, { id: string; name: string }[]> = {};
  for (const inst of listInstitutions()) {
    const facs = listFaculties(inst.id);
    facultiesByInst[inst.id] = facs.map((f) => ({ id: f.id, name: f.name }));
    for (const f of facs) departmentsByFac[f.id] = listDepartments(f.id).map((d) => ({ id: d.id, name: d.name }));
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="page-head">
        <h1 style={{ fontSize: '1.8rem' }}>Profile &amp; settings</h1>
        <p>Keep your academic details current so letters pre-fill and updates personalise.</p>
      </div>
      <SettingsForm
        institutions={institutions}
        facultiesByInst={facultiesByInst}
        departmentsByFac={departmentsByFac}
        initial={{
          fullName: session.user.full_name,
          email: session.user.email,
          phone: session.user.phone ?? '',
          institutionId: session.profile?.institution_id ?? '',
          facultyId: session.profile?.faculty_id ?? '',
          departmentId: session.profile?.department_id ?? '',
          level: session.profile?.level ?? '',
          programme: session.profile?.programme ?? '',
          semester: session.profile?.semester ?? '',
          currentCgpa: session.profile?.current_cgpa?.toString() ?? '',
          studentStatus: session.profile?.student_status ?? '',
          notifyEmail: !!session.user.notify_email,
          notifyInApp: !!session.user.notify_in_app
        }}
      />
    </div>
  );
}
