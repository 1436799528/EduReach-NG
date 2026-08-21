import '@/lib/server-only';
import { all, one, run, uid, nowIso } from '@/lib/db';
import type { InstitutionRow } from './institutions';

// ─── Announcements ───────────────────────────────────────────────────────────

export interface AnnouncementRow {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  urgency: string;
  status: string;
  institution_id: string | null;
  source_name: string;
  source_url: string | null;
  published_at: string;
  updated_at: string;
  effective_date: string | null;
  last_verified_at: string;
  editor_id: string | null;
}

export interface AnnouncementWithInstitution extends AnnouncementRow {
  institution_name: string | null;
  institution_slug: string | null;
}

const ANN_SELECT = `
  SELECT a.*, i.name AS institution_name, i.slug AS institution_slug
  FROM announcements a LEFT JOIN institutions i ON i.id = a.institution_id`;

export function listVerifiedAnnouncements(opts: { institutionId?: string; limit?: number } = {}): AnnouncementWithInstitution[] {
  const limit = opts.limit ?? 20;
  if (opts.institutionId) {
    return all<AnnouncementWithInstitution>(
      `${ANN_SELECT} WHERE a.status IN ('VERIFIED','OUTDATED') AND (a.institution_id = ? OR a.institution_id IS NULL)
       ORDER BY a.published_at DESC LIMIT ?`,
      [opts.institutionId, limit]
    );
  }
  return all<AnnouncementWithInstitution>(
    `${ANN_SELECT} WHERE a.status IN ('VERIFIED','OUTDATED') ORDER BY a.published_at DESC LIMIT ?`,
    [limit]
  );
}

export function listAllAnnouncements(): AnnouncementWithInstitution[] {
  return all<AnnouncementWithInstitution>(`${ANN_SELECT} ORDER BY a.published_at DESC`);
}

export function listAnnouncementsByStatus(statuses: string[]): AnnouncementWithInstitution[] {
  const marks = statuses.map(() => '?').join(',');
  return all<AnnouncementWithInstitution>(`${ANN_SELECT} WHERE a.status IN (${marks}) ORDER BY a.published_at DESC`, statuses);
}

export function findAnnouncement(id: string): AnnouncementWithInstitution | undefined {
  return one<AnnouncementWithInstitution>(`${ANN_SELECT} WHERE a.id = ?`, [id]);
}

export function searchAnnouncements(q: string): AnnouncementWithInstitution[] {
  const like = `%${q}%`;
  return all<AnnouncementWithInstitution>(
    `${ANN_SELECT} WHERE a.status = 'VERIFIED' AND (a.title LIKE ? OR a.summary LIKE ? OR i.name LIKE ?) ORDER BY a.published_at DESC LIMIT 15`,
    [like, like, like]
  );
}

export function createAnnouncement(data: {
  title: string; summary: string; body: string; category: string; urgency: string; status: string;
  institutionId: string | null; sourceName: string; sourceUrl: string | null; effectiveDate: string | null; editorId: string;
}): string {
  const id = uid();
  const now = nowIso();
  run(
    `INSERT INTO announcements (id, title, summary, body, category, urgency, status, institution_id, source_name, source_url, published_at, updated_at, effective_date, last_verified_at, editor_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, data.title, data.summary, data.body, data.category, data.urgency, data.status, data.institutionId, data.sourceName, data.sourceUrl, now, now, data.effectiveDate, now, data.editorId]
  );
  return id;
}

export function updateAnnouncement(id: string, data: Partial<{
  title: string; summary: string; body: string; category: string; urgency: string; institutionId: string | null; sourceName: string; sourceUrl: string | null; effectiveDate: string | null;
}>): void {
  const current = findAnnouncement(id);
  if (!current) return;
  run(
    `UPDATE announcements SET title=?, summary=?, body=?, category=?, urgency=?, institution_id=?, source_name=?, source_url=?, effective_date=?, updated_at=? WHERE id=?`,
    [
      data.title ?? current.title,
      data.summary ?? current.summary,
      data.body ?? current.body,
      data.category ?? current.category,
      data.urgency ?? current.urgency,
      data.institutionId !== undefined ? data.institutionId : current.institution_id,
      data.sourceName ?? current.source_name,
      data.sourceUrl !== undefined ? data.sourceUrl : current.source_url,
      data.effectiveDate !== undefined ? data.effectiveDate : current.effective_date,
      nowIso(),
      id
    ]
  );
}

export function setAnnouncementStatus(id: string, status: string, editorId: string): void {
  run('UPDATE announcements SET status=?, last_verified_at=?, editor_id=?, updated_at=? WHERE id=?', [
    status,
    nowIso(),
    editorId,
    nowIso(),
    id
  ]);
}

export function deleteAnnouncement(id: string): void {
  run('DELETE FROM announcements WHERE id = ?', [id]);
}

// ─── Cut-off marks ───────────────────────────────────────────────────────────

export interface CutOffRow {
  id: string;
  institution_id: string;
  programme: string;
  faculty: string | null;
  utme_cutoff: number | null;
  departmental_cutoff: number | null;
  session: string;
  category: string;
  status: string;
  source_name: string;
  source_url: string | null;
  note: string | null;
  published_at: string;
  last_verified_at: string;
}

export function listCutOffsByInstitution(institutionId: string, includeUnverified = false): CutOffRow[] {
  if (includeUnverified) {
    return all<CutOffRow>('SELECT * FROM cutoff_marks WHERE institution_id = ? ORDER BY session DESC, programme', [institutionId]);
  }
  return all<CutOffRow>(
    `SELECT * FROM cutoff_marks WHERE institution_id = ? AND status IN ('VERIFIED','REPORTED','UNDER_REVIEW','OUTDATED') ORDER BY session DESC, programme`,
    [institutionId]
  );
}

export function listCutOffsByStatus(statuses: string[]): (CutOffRow & { institution_name: string | null })[] {
  const marks = statuses.map(() => '?').join(',');
  return all(
    `SELECT c.*, i.name AS institution_name FROM cutoff_marks c JOIN institutions i ON i.id = c.institution_id WHERE c.status IN (${marks}) ORDER BY c.published_at DESC`,
    statuses
  );
}

export function searchCutOffs(q: string): (CutOffRow & { institution_name: string | null })[] {
  const like = `%${q}%`;
  return all(
    `SELECT c.*, i.name AS institution_name FROM cutoff_marks c JOIN institutions i ON i.id = c.institution_id
     WHERE c.status != 'REJECTED' AND (c.programme LIKE ? OR i.name LIKE ?) ORDER BY c.session DESC LIMIT 15`,
    [like, like]
  );
}

export function createCutOff(data: {
  institutionId: string; programme: string; faculty: string | null; utmeCutoff: number | null; departmentalCutoff: number | null;
  session: string; category: string; status: string; sourceName: string; sourceUrl: string | null; note: string | null;
}): string {
  const id = uid();
  const now = nowIso();
  run(
    `INSERT INTO cutoff_marks (id, institution_id, programme, faculty, utme_cutoff, departmental_cutoff, session, category, status, source_name, source_url, note, published_at, last_verified_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, data.institutionId, data.programme, data.faculty, data.utmeCutoff, data.departmentalCutoff, data.session, data.category, data.status, data.sourceName, data.sourceUrl, data.note, now, now]
  );
  return id;
}

export function setCutOffStatus(id: string, status: string): void {
  run('UPDATE cutoff_marks SET status = ?, last_verified_at = ? WHERE id = ?', [status, nowIso(), id]);
}

export function deleteCutOff(id: string): void {
  run('DELETE FROM cutoff_marks WHERE id = ?', [id]);
}

// ─── Resources ───────────────────────────────────────────────────────────────

export interface ResourceRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  institution_id: string | null;
  course: string | null;
  level: string | null;
  year: number | null;
  file_name: string | null;
  stored_path: string | null;
  file_size: number | null;
  mime: string | null;
  external_url: string | null;
  status: string;
  downloads: number;
  uploader_id: string | null;
  created_at: string;
}

export function listApprovedResources(filters: { institutionId?: string; type?: string; course?: string; q?: string } = {}): (ResourceRow & { institution_name: string | null })[] {
  const where: string[] = ["r.status = 'APPROVED'"];
  const params: (string | number)[] = [];
  if (filters.institutionId) { where.push('(r.institution_id = ? OR r.institution_id IS NULL)'); params.push(filters.institutionId); }
  if (filters.type) { where.push('r.type = ?'); params.push(filters.type); }
  if (filters.course) { where.push('r.course LIKE ?'); params.push(`%${filters.course}%`); }
  if (filters.q) { where.push('(r.title LIKE ? OR r.description LIKE ? OR r.course LIKE ?)'); params.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`); }
  return all(
    `SELECT r.*, i.name AS institution_name FROM resources r LEFT JOIN institutions i ON i.id = r.institution_id
     WHERE ${where.join(' AND ')} ORDER BY r.created_at DESC LIMIT 100`,
    params
  );
}

export function listResourcesByStatus(status: string): (ResourceRow & { institution_name: string | null; uploader_name: string | null })[] {
  return all(
    `SELECT r.*, i.name AS institution_name, u.full_name AS uploader_name FROM resources r
     LEFT JOIN institutions i ON i.id = r.institution_id LEFT JOIN users u ON u.id = r.uploader_id
     WHERE r.status = ? ORDER BY r.created_at ASC`,
    [status]
  );
}

export function findResource(id: string): ResourceRow | undefined {
  return one<ResourceRow>('SELECT * FROM resources WHERE id = ?', [id]);
}

export function createResource(data: {
  title: string; description: string | null; type: string; institutionId: string | null; course: string | null; level: string | null;
  year: number | null; fileName: string | null; storedPath: string | null; fileSize: number | null; mime: string | null;
  externalUrl: string | null; status: string; uploaderId: string | null;
}): string {
  const id = uid();
  run(
    `INSERT INTO resources (id, title, description, type, institution_id, course, level, year, file_name, stored_path, file_size, mime, external_url, status, uploader_id, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, data.title, data.description, data.type, data.institutionId, data.course, data.level, data.year, data.fileName, data.storedPath, data.fileSize, data.mime, data.externalUrl, data.status, data.uploaderId, nowIso()]
  );
  return id;
}

export function setResourceStatus(id: string, status: string): void {
  run('UPDATE resources SET status = ? WHERE id = ?', [status, id]);
}

export function incrementDownloads(id: string): void {
  run('UPDATE resources SET downloads = downloads + 1 WHERE id = ?', [id]);
}

export interface ResourceReportRow {
  id: string;
  resource_id: string;
  user_id: string | null;
  reason: string;
  status: string;
  created_at: string;
}

export function createResourceReport(resourceId: string, userId: string | null, reason: string): void {
  run('INSERT INTO resource_reports (id, resource_id, user_id, reason, status, created_at) VALUES (?,?,?,?,?,?)', [
    uid(), resourceId, userId, reason, 'OPEN', nowIso()
  ]);
}

export function listOpenReports(): (ResourceReportRow & { resource_title: string })[] {
  return all(
    `SELECT rr.*, r.title AS resource_title FROM resource_reports rr JOIN resources r ON r.id = rr.resource_id
     WHERE rr.status = 'OPEN' ORDER BY rr.created_at DESC`
  );
}

export function resolveReport(id: string, status: 'RESOLVED' | 'DISMISSED'): void {
  run('UPDATE resource_reports SET status = ? WHERE id = ?', [status, id]);
}

export { nowIso };
export type { InstitutionRow };
