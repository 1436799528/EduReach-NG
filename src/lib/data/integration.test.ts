import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Data-layer integration tests (§54). Run against a throwaway SQLite file.
 * Note: these test repositories + token flows; cookie-touching session
 * helpers need a Next request context and are covered by API smoke tests.
 */

const DB_FILE = 'storage/itest.db';

beforeAll(() => {
  for (const suffix of ['', '-wal', '-shm']) {
    const p = path.join(process.cwd(), DB_FILE + suffix);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
});

afterAll(() => {
  for (const suffix of ['', '-wal', '-shm']) {
    const p = path.join(process.cwd(), DB_FILE + suffix);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
});

import { createEmailToken, consumeEmailToken, findUserByEmail, verifyPassword, hashPassword } from '@/lib/auth';
import { createUser, getProfile, saveProfile, updatePassword, anonymizeUser } from '@/lib/data/users';
import {
  createAnnouncement, findAnnouncement, listAnnouncementsByStatus, listVerifiedAnnouncements, setAnnouncementStatus,
  createCutOff, listCutOffsByInstitution, setCutOffStatus, createResource, findResource, setResourceStatus,
  createResourceReport, listOpenReports, resolveReport
} from '@/lib/data/content';
import {
  createDeadline, listDeadlines, updateDeadline, deleteDeadline, derivedDeadlineReminders,
  createTask, listTasks, setTaskStatus,
  createDocument, findDocument, deleteDocument,
  addBookmark, isBookmarked, removeBookmark,
  fanOutAnnouncementNotification, listNotifications, unreadCount, markAllRead,
  createNotification
} from '@/lib/data/workspace';
import { upsertInstitution, addFaculty, addDepartment, getInstitutionFull, searchInstitutions } from '@/lib/data/institutions';

const NOW = new Date().toISOString();

function makeStudent(email: string): string {
  return createUser({ email, passwordHash: '$2a$10$fakefakefakefakefakefakefakefakefakefakefakefakefa', fullName: 'Test Person' });
}

describe('users, credentials & tokens', () => {
  it('creates users and finds them case-insensitively', async () => {
    const id = makeStudent('Ada.Test@Example.com');
    const found = findUserByEmail('ada.test@example.com');
    expect(found?.id).toBe(id);
    const hash = await hashPassword('Password123!');
    expect(await verifyPassword('Password123!', hash)).toBe(true);
    expect(await verifyPassword('wrongpass', hash)).toBe(false);
  });

  it('email verification tokens are single-use and purpose-bound', () => {
    const id = makeStudent('token.user@example.com');
    const token = createEmailToken(id, 'VERIFY_EMAIL');
    expect(consumeEmailToken('not-a-real-token', 'VERIFY_EMAIL')).toBeNull();
    // Wrong purpose must not consume
    expect(consumeEmailToken(token, 'PASSWORD_RESET')).toBeNull();
    // Right purpose consumes once
    expect(consumeEmailToken(token, 'VERIFY_EMAIL')).toBe(id);
    expect(consumeEmailToken(token, 'VERIFY_EMAIL')).toBeNull();
  });

  it('issuing a new token invalidates older unused ones', () => {
    const id = makeStudent('token.rotate@example.com');
    const first = createEmailToken(id, 'PASSWORD_RESET');
    const second = createEmailToken(id, 'PASSWORD_RESET');
    expect(consumeEmailToken(first, 'PASSWORD_RESET')).toBeNull();
    expect(consumeEmailToken(second, 'PASSWORD_RESET')).toBe(id);
  });

  it('profile save + password update + anonymization', async () => {
    const id = makeStudent('profile.user@example.com');
    saveProfile(id, {
      institutionId: null, facultyId: null, departmentId: null,
      level: '300', programme: 'B.Sc. Computer Science', semester: 'FIRST',
      currentCgpa: 3.42, studentStatus: 'UNDERGRADUATE', phone: '08030000000'
    });
    const profile = getProfile(id);
    expect(profile?.level).toBe('300');
    expect(profile?.current_cgpa).toBe(3.42);

    const newHash = await hashPassword('NewPassword123!');
    updatePassword(id, newHash);
    expect(await verifyPassword('NewPassword123!', findUserByEmail('profile.user@example.com')!.password_hash)).toBe(true);

    anonymizeUser(id);
    const after = findUserByEmail('profile.user@example.com');
    expect(after).toBeUndefined(); // email tombstoned
    expect(getProfile(id)?.level).toBeNull();
  });
});

describe('directory & verification pipeline', () => {
  it('institution → faculty → department hierarchy works', () => {
    const iid = upsertInstitution({
      slug: 'test-university', name: 'Test University', short_name: 'TU', type: 'UNIVERSITY',
      state: 'Lagos', city: 'Ikeja', website: null, admission_portal: null, student_portal: null, contact_email: null, about: null
    });
    const fid = addFaculty(iid, 'School of Testing', 'school-of-testing');
    addDepartment(fid, 'Applied Assertions', 'applied-assertions');
    const full = getInstitutionFull('test-university');
    expect(full?.faculties[0]?.departments[0]?.name).toBe('Applied Assertions');
    expect(searchInstitutions('Test Univ').length).toBeGreaterThan(0);
  });

  it('announcements: pending by default, verified appears in public feeds', () => {
    const userId = makeStudent('editor-check@example.com');
    const instId = upsertInstitution({
      slug: 'verify-uni', name: 'Verify University', short_name: 'VU', type: 'UNIVERSITY',
      state: 'Kano', city: null, website: null, admission_portal: null, student_portal: null, contact_email: null, about: null
    });

    const id = createAnnouncement({
      title: 'Draft notice', summary: 'Awaiting review', body: 'Body text here.',
      category: 'GENERAL', urgency: 'GENERAL', status: 'PENDING',
      institutionId: instId, sourceName: 'Community', sourceUrl: null, effectiveDate: null, editorId: userId
    });

    // Hidden from public while pending
    expect(listVerifiedAnnouncements({ institutionId: instId }).find((a) => a.id === id)).toBeUndefined();
    expect(listAnnouncementsByStatus(['PENDING']).some((a) => a.id === id)).toBe(true);

    setAnnouncementStatus(id, 'VERIFIED', userId);

    // Now visible + verification timestamp advanced
    const pub = listVerifiedAnnouncements({ institutionId: instId }).find((a) => a.id === id);
    expect(pub).toBeDefined();
    expect(pub!.last_verified_at >= NOW).toBe(true);
  });

  it('cut-offs respect verification gating', () => {
    const instId = upsertInstitution({
      slug: 'cutoff-uni', name: 'Cutoff University', short_name: 'CU', type: 'UNIVERSITY',
      state: 'Oyo', city: null, website: null, admission_portal: null, student_portal: null, contact_email: null, about: null
    });
    const id = createCutOff({
      institutionId: instId, programme: 'Computer Science', faculty: null, utmeCutoff: 200,
      departmentalCutoff: null, session: '2025/2026', category: 'UTME', status: 'PENDING',
      sourceName: 'Admissions office', sourceUrl: null, note: null
    });
    expect(listCutOffsByInstitution(instId).find((c) => c.id === id)).toBeUndefined();
    setCutOffStatus(id, 'VERIFIED');
    expect(listCutOffsByInstitution(instId).find((c) => c.id === id)?.utme_cutoff).toBe(200);
  });

  it('resource moderation + report lifecycle', () => {
    const uploader = makeStudent('uploader@example.com');
    const rid = createResource({
      title: 'CHM 101 past questions', description: null, type: 'PAST_QUESTION', institutionId: null,
      course: 'CHM 101', level: '100', year: 2024, fileName: 'chm101.pdf', storedPath: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf',
      fileSize: 1024, mime: 'application/pdf', externalUrl: null, status: 'PENDING', uploaderId: uploader
    });
    // not approved yet — download eligibility is status-gated
    expect(findResource(rid)?.status).toBe('PENDING');
    setResourceStatus(rid, 'APPROVED');
    expect(findResource(rid)?.status).toBe('APPROVED');

    createResourceReport(rid, uploader, 'Broken file');
    const open = listOpenReports();
    expect(open.some((r) => r.resource_id === rid)).toBe(true);
    resolveReport(open[0]!.id, 'RESOLVED');
    expect(listOpenReports().some((r) => r.resource_id === rid)).toBe(false);
  });
});

describe('student workspace', () => {
  it('deadline create/update/delete + derived reminders', () => {
    const userId = makeStudent('workspace@example.com');
    const soon = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // tomorrow
    const far = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    const d1 = createDeadline(userId, { type: 'EXAM', title: 'CSC 301 exam', course: 'CSC 301', dueAt: soon, location: null, description: null, priority: 'HIGH', remindDays: 3 });
    createDeadline(userId, { type: 'FEE', title: 'Fee deadline', course: null, dueAt: far, location: null, description: null, priority: 'LOW', remindDays: 2 });

    expect(listDeadlines(userId)).toHaveLength(2);

    // d1 is inside its 3-day remind window; d2 is not
    const rem = derivedDeadlineReminders(userId);
    expect(rem.some((r) => r.id === `dl-${d1}`)).toBe(true);
    expect(rem).toHaveLength(1);
    expect(rem[0]!.title).toContain('Exam reminder');

    updateDeadline(userId, d1, { status: 'COMPLETED' });
    expect(derivedDeadlineReminders(userId)).toHaveLength(0);
    expect(deleteDeadline(userId, d1)).toBe(true);
    expect(deleteDeadline(userId, d1)).toBe(false); // already gone
  });

  it('ownership checks block cross-user tampering', () => {
    const a = makeStudent('owner.a@example.com');
    const b = makeStudent('owner.b@example.com');
    const d = createDeadline(a, { type: 'OTHER', title: 'A only', course: null, dueAt: new Date().toISOString(), location: null, description: null, priority: 'MEDIUM', remindDays: 0 });
    expect(updateDeadline(b, d, { status: 'COMPLETED' })).toBe(false);
    expect(deleteDeadline(b, d)).toBe(false);
    expect(findDocument(b, 'anything')).toBeUndefined();
  });

  it('tasks, documents, bookmarks', () => {
    const userId = makeStudent('misc@example.com');
    const t = createTask(userId, 'Upload passport photo', null, null);
    setTaskStatus(userId, t, 'COMPLETED');
    expect(listTasks(userId).find((x) => x.id === t)?.status).toBe('COMPLETED');

    const docId = createDocument(userId, 'letter-hod', 'Letter to Head of Department', '{"a":"b"}', 'Full letter text…');
    expect(findDocument(userId, docId)?.content).toBe('Full letter text…');
    expect(deleteDocument(userId, docId)).toBe(true);

    addBookmark(userId, 'ANNOUNCEMENT', 'Item', '/check/xyz');
    expect(isBookmarked(userId, '/check/xyz')).toBe(true);
    removeBookmark(userId, '/check/xyz');
    expect(isBookmarked(userId, '/check/xyz')).toBe(false);
  });

  it('announcement fan-out targets institution-matched users only', () => {
    const student = makeStudent('targeted@example.com');
    const outsider = makeStudent('outsider@example.com');
    const instId = upsertInstitution({
      slug: 'fanout-uni', name: 'Fanout University', short_name: 'FU', type: 'UNIVERSITY',
      state: 'Enugu', city: null, website: null, admission_portal: null, student_portal: null, contact_email: null, about: null
    });
    saveProfile(student, {
      institutionId: instId, facultyId: null, departmentId: null, level: null,
      programme: null, semester: null, currentCgpa: null, studentStatus: null, phone: null
    });

    const annId = createAnnouncement({
      title: 'Institution notice', summary: 'For FU students', body: 'Body',
      category: 'REGISTRATION', urgency: 'GENERAL', status: 'VERIFIED',
      institutionId: instId, sourceName: 'Registrar', sourceUrl: null, effectiveDate: null, editorId: ''
    });
    const n = fanOutAnnouncementNotification(annId, 'Institution notice', 'For FU students', instId, 'REGISTRATION');
    expect(n).toBe(1);
    expect(unreadCount(student)).toBe(1);
    expect(unreadCount(outsider)).toBe(0);

    // national JAMB news reaches everyone ACTIVE with notify_in_app
    createAnnouncement({
      title: 'JAMB national', summary: 's', body: 'b', category: 'JAMB', urgency: 'GENERAL',
      status: 'VERIFIED', institutionId: null, sourceName: 'JAMB', sourceUrl: null, effectiveDate: null, editorId: ''
    });
    const jambAnn = listAnnouncementsByStatus(['VERIFIED']).find((a) => a.title === 'JAMB national')!;
    const reach = fanOutAnnouncementNotification(jambAnn.id, 'JAMB national', 's', null, 'JAMB');
    expect(reach).toBeGreaterThanOrEqual(2); // both students (plus any others from this suite)

    markAllRead(student);
    expect(unreadCount(student)).toBe(0);
    expect(listNotifications(outsider).length).toBeGreaterThanOrEqual(1);
  });

  it('direct notification creation works for system notices', () => {
    const userId = makeStudent('notice@example.com');
    createNotification(userId, 'Welcome', 'Welcome body', '/dashboard');
    expect(unreadCount(userId)).toBe(1);
  });
});
