import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser, roleAtLeast } from '@/lib/auth';
import { listInstitutions, listFaculties, listDepartments } from '@/lib/data/institutions';
import { DirectoryManager } from '@/components/admin/directory-manager';

export const metadata: Metadata = { title: 'Admin · Institution directory' };
export const dynamic = 'force-dynamic';

export default function AdminDirectoryPage() {
  const session = getSessionUser();
  if (!session || !roleAtLeast(session.user.role, 'ADMIN')) redirect('/dashboard');

  const institutions = listInstitutions().map((i) => ({
    ...i,
    faculties: listFaculties(i.id).map((f) => ({
      id: f.id,
      name: f.name,
      departments: listDepartments(f.id).map((d) => ({ id: d.id, name: d.name }))
    }))
  }));

  return <DirectoryManager initial={institutions} />;
}
