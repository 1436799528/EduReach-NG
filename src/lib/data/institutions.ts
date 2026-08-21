import '@/lib/server-only';
import { all, one, run, uid, nowIso } from '@/lib/db';

export interface InstitutionRow {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  type: string;
  state: string;
  city: string | null;
  website: string | null;
  admission_portal: string | null;
  student_portal: string | null;
  contact_email: string | null;
  about: string | null;
}

export interface FacultyRow {
  id: string;
  institution_id: string;
  name: string;
  slug: string;
}

export interface DepartmentRow {
  id: string;
  faculty_id: string;
  name: string;
  slug: string;
}

export interface InstitutionFull extends InstitutionRow {
  faculties: (FacultyRow & { departments: DepartmentRow[] })[];
}

export function listInstitutions(): InstitutionRow[] {
  return all<InstitutionRow>('SELECT * FROM institutions ORDER BY name');
}

export function findInstitutionBySlug(slug: string): InstitutionRow | undefined {
  return one<InstitutionRow>('SELECT * FROM institutions WHERE slug = ?', [slug]);
}

export function findInstitutionById(id: string): InstitutionRow | undefined {
  return one<InstitutionRow>('SELECT * FROM institutions WHERE id = ?', [id]);
}

export function getInstitutionFull(slug: string): InstitutionFull | undefined {
  const inst = findInstitutionBySlug(slug);
  if (!inst) return undefined;
  const faculties = all<FacultyRow>('SELECT * FROM faculties WHERE institution_id = ? ORDER BY name', [inst.id]);
  return {
    ...inst,
    faculties: faculties.map((f) => ({
      ...f,
      departments: all<DepartmentRow>('SELECT * FROM departments WHERE faculty_id = ? ORDER BY name', [f.id])
    }))
  };
}

export function listFaculties(institutionId: string): FacultyRow[] {
  return all<FacultyRow>('SELECT * FROM faculties WHERE institution_id = ? ORDER BY name', [institutionId]);
}

export function listDepartments(facultyId: string): DepartmentRow[] {
  return all<DepartmentRow>('SELECT * FROM departments WHERE faculty_id = ? ORDER BY name', [facultyId]);
}

export function searchInstitutions(q: string): InstitutionRow[] {
  const like = `%${q}%`;
  return all<InstitutionRow>(
    'SELECT * FROM institutions WHERE name LIKE ? OR short_name LIKE ? OR state LIKE ? ORDER BY name LIMIT 10',
    [like, like, like]
  );
}

export function upsertInstitution(data: Omit<InstitutionRow, 'id'> & { id?: string }): string {
  const id = data.id ?? uid();
  run(
    `INSERT INTO institutions (id, slug, name, short_name, type, state, city, website, admission_portal, student_portal, contact_email, about)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(slug) DO UPDATE SET name=excluded.name, short_name=excluded.short_name, type=excluded.type, state=excluded.state,
       city=excluded.city, website=excluded.website, admission_portal=excluded.admission_portal, student_portal=excluded.student_portal,
       contact_email=excluded.contact_email, about=excluded.about`,
    [id, data.slug, data.name, data.short_name, data.type, data.state, data.city, data.website, data.admission_portal, data.student_portal, data.contact_email, data.about]
  );
  return id;
}

export function addFaculty(institutionId: string, name: string, slug: string): string {
  const id = uid();
  run('INSERT OR IGNORE INTO faculties (id, institution_id, name, slug) VALUES (?,?,?,?)', [id, institutionId, name, slug]);
  return id;
}

export function addDepartment(facultyId: string, name: string, slug: string): string {
  const id = uid();
  run('INSERT OR IGNORE INTO departments (id, faculty_id, name, slug) VALUES (?,?,?,?)', [id, facultyId, name, slug]);
  return id;
}

export { nowIso };
