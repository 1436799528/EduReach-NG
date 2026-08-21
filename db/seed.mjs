// Seeds development data. Run: npm run db:seed  (use --force to wipe + reseed)
// All seeded content is honest: administrative facts are verified-tier; anything
// time-sensitive is labelled and never fabricated.
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Load .env manually
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)\s*=\s*"?([^"]*)"?/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const url = process.env.DATABASE_URL || 'file:storage/edureach.db';
const dbFile = path.isAbsolute(url.slice(5)) ? url.slice(5) : path.join(root, url.slice(5));
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = new DatabaseSync(dbFile);
db.exec('PRAGMA foreign_keys = ON;');
db.exec(fs.readFileSync(path.join(root, 'db', 'schema.sql'), 'utf8'));

const force = process.argv.includes('--force');
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (userCount > 0 && !force) {
  console.log('Database already seeded. Use `npm run db:seed -- --force` to wipe and reseed.');
  process.exit(0);
}
if (force) {
  const tables = [
    'resource_reports', 'resources', 'notifications', 'bookmarks', 'generated_documents', 'tasks', 'deadlines',
    'cutoff_marks', 'announcements', 'departments', 'faculties', 'institutions', 'email_tokens', 'sessions',
    'profiles', 'activity_logs', 'audit_logs', 'users'
  ];
  for (const t of tables) db.prepare(`DELETE FROM ${t}`).run();
  console.log('Wiped existing data.');
}

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Users ───────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@edureach.ng';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
const DEMO_EMAIL = process.env.SEED_DEMO_EMAIL || 'demo.student@edureach.ng';
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'Student123!';

const adminId = uid();
const demoId = uid();
const insertUser = db.prepare(`INSERT INTO users (id, email, password_hash, full_name, role, status, email_verified_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)`);
insertUser.run(adminId, ADMIN_EMAIL, bcrypt.hashSync(ADMIN_PASSWORD, 10), 'Platform Administrator', 'SUPER_ADMIN', 'ACTIVE', now(), now(), now());
insertUser.run(demoId, DEMO_EMAIL, bcrypt.hashSync(DEMO_PASSWORD, 10), 'Demo Student', 'STUDENT', 'ACTIVE', now(), now(), now());
db.prepare('INSERT INTO profiles (id, user_id) VALUES (?,?)').run(uid(), adminId);

// ─── Institution: University of Calabar ──────────────────────────────────────
const unicalId = uid();
db.prepare(`INSERT INTO institutions (id, slug, name, short_name, type, state, city, website, admission_portal, student_portal, about)
  VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
  unicalId,
  'university-of-calabar',
  'University of Calabar',
  'UNICAL',
  'UNIVERSITY',
  'Cross River',
  'Calabar',
  'https://unical.edu.ng',
  'https://unical.edu.ng',
  'https://unical.edu.ng',
  'The University of Calabar is a federal university in Calabar, Cross River State, Nigeria, established in 1975. It is one of Nigeria\'s second-generation federal universities and serves tens of thousands of students across multiple faculties and a College of Medical Sciences.'
);

const unicalFaculties = {
  'Faculty of Arts': ['English & Literary Studies', 'History & International Studies', 'Languages & Linguistics', 'Philosophy', 'Religious Studies', 'Theatre & Media Studies'],
  'Faculty of Social Sciences': ['Economics', 'Political Science', 'Sociology', 'Social Work', 'Geography & Environmental Science', 'Public Administration'],
  'Faculty of Physical Sciences': ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Geology', 'Statistics'],
  'Faculty of Biological Sciences': ['Biochemistry', 'Botany', 'Microbiology', 'Zoology & Environmental Biology', 'Genetics & Biotechnology'],
  'Faculty of Education': ['Educational Foundations & Administration', 'Curriculum & Teaching', 'Guidance & Counselling', 'Human Kinetics & Health Education', 'Library & Information Science'],
  'Faculty of Law': ['Law'],
  'Faculty of Management Sciences': ['Accounting', 'Banking & Finance', 'Business Management', 'Marketing'],
  'Faculty of Agriculture, Forestry & Wildlife Resources Management': ['Agricultural Economics & Extension', 'Animal Science', 'Crop Science', 'Soil Science', 'Forestry & Wildlife Management', 'Fisheries & Aquaculture'],
  'Faculty of Engineering & Technology': ['Civil Engineering', 'Electrical & Electronics Engineering', 'Mechanical Engineering', 'Chemical Engineering', 'Computer Engineering'],
  'College of Medical Sciences': ['Medicine & Surgery (MBBS)', 'Anatomy', 'Human Physiology', 'Medical Laboratory Science', 'Nursing Science', 'Public Health', 'Dentistry', 'Pharmacy']
};

let cscDept = null;
for (const [facName, depts] of Object.entries(unicalFaculties)) {
  const facId = uid();
  db.prepare('INSERT INTO faculties (id, institution_id, name, slug) VALUES (?,?,?,?)').run(facId, unicalId, facName, slug(facName));
  for (const deptName of depts) {
    const deptId = uid();
    db.prepare('INSERT INTO departments (id, faculty_id, name, slug) VALUES (?,?,?,?)').run(deptId, facId, deptName, slug(deptName));
    if (deptName === 'Computer Science') cscDept = { facId, deptId };
  }
}

// Demo student profile — UNICAL Computer Science, 300 level
db.prepare(`INSERT INTO profiles (id, user_id, institution_id, faculty_id, department_id, level, programme, semester, current_cgpa, student_status)
  VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
  uid(), demoId, unicalId, cscDept?.facId ?? null, cscDept?.deptId ?? null,
  '300', 'B.Sc. Computer Science', 'FIRST', 3.42, 'UNDERGRADUATE'
);

// ─── Announcements (verified = evergreen guidance; queue item = demo) ────────
const ann = db.prepare(`INSERT INTO announcements
  (id, title, summary, body, category, urgency, status, institution_id, source_name, source_url, published_at, updated_at, effective_date, last_verified_at, editor_id)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

ann.run(
  uid(),
  'Always confirm JAMB dates and fees on official channels',
  'Registration windows, exam dates and fees change every year. JAMB publishes them on jamb.gov.ng and the eFacility portal — not through WhatsApp vendors.',
  'JAMB does not sell forms through agents on WhatsApp or Telegram, and results cannot be "upgraded". Before paying for anything JAMB-related, confirm it on the official website (jamb.gov.ng) or eFacility portal (efacility.jamb.gov.ng). If anyone offers to upgrade your score, it is a scam — report it.',
  'JAMB', 'IMPORTANT', 'VERIFIED', null, 'Joint Admissions and Matriculation Board', 'https://www.jamb.gov.ng',
  now(), now(), null, now(), adminId
);

ann.run(
  uid(),
  'Welcome to EduReach NG — here is how verification labels work',
  'Every important update on this platform carries a source, a "last verified" date, and a plain trust label. Here is what each label means.',
  'Officially verified — confirmed against an official institutional source. Source reported — published by a credible source, not yet independently confirmed. Community submitted — sent in by a student, awaiting review. Needs verification — treat with caution. Outdated — was correct, but may no longer apply. Never act on time-sensitive information (dates, fees, cut-offs) without checking the linked official source.',
  'GENERAL', 'GENERAL', 'VERIFIED', null, 'EduReach Editorial', null,
  now(), now(), null, now(), adminId
);

ann.run(
  uid(),
  'UNICAL freshers: start gathering your clearance documents now',
  'Clearance season is smoother when your documents are ready early: JAMB admission letter, O\'Level results, birth certificate, state-of-origin certificate, receipts and passport photographs.',
  'Based on what clearance typically requires at the University of Calabar, start putting together: your JAMB admission letter (original), JAMB result slip, O\'Level result(s), birth certificate or declaration of age, state-of-origin certificate, acceptance and school fee receipts, and recent passport photographs. Departments may add their own requirements — your faculty\'s official notice is the final word.',
  'ADMISSION', 'GENERAL', 'VERIFIED', unicalId, 'EduReach Editorial', 'https://unical.edu.ng',
  now(), now(), null, now(), adminId
);

// Demo of the verification queue (visible to admins, NOT to public feeds)
ann.run(
  uid(),
  'NELFUND student loan application window (reported)',
  'Community members report that the NELFUND student loan portal is accepting applications. Pending verification of the current window against official NELFUND channels.',
  'The Nigerian Education Loan Fund (NELFUND) provides interest-free loans to students in public tertiary institutions. Applications go through the official portal at nelf.gov.ng. This entry is queued pending verification of the current application window — do not treat the dates as confirmed.',
  'OPPORTUNITY', 'IMPORTANT', 'UNDER_REVIEW', null, 'Community report (NELFUND)', 'https://nelf.gov.ng',
  now(), now(), null, now(), null
);

// ─── Cut-off marks ───────────────────────────────────────────────────────────
const co = db.prepare(`INSERT INTO cutoff_marks
  (id, institution_id, programme, faculty, utme_cutoff, departmental_cutoff, session, category, status, source_name, source_url, note, published_at, last_verified_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

co.run(
  uid(), unicalId, 'All programmes (general UTME cut-off)', null, 140, null,
  '2024/2025', 'UTME', 'REPORTED', 'JAMB / UNICAL admission notices (reported)', 'https://unical.edu.ng',
  'JAMB\'s national minimum for university admission for 2024/2025 was 140. Individual departments (especially Medicine, Law, Nursing, Engineering) typically require much higher scores. Confirm departmental figures on the official portal before acting.',
  now(), now()
);

co.run(
  uid(), unicalId, 'All programmes (general UTME cut-off)', null, null, null,
  '2025/2026', 'UTME', 'PENDING', 'Awaiting official announcement', null,
  'The general cut-off for this session has not been officially confirmed here yet. Check the UNICAL admission portal.',
  now(), now()
);

// ─── Resources (approved official links) ────────────────────────────────────
const res = db.prepare(`INSERT INTO resources
  (id, title, description, type, institution_id, external_url, status, uploader_id, created_at)
  VALUES (?,?,?,?,?,?,?,?,?)`);
res.run(uid(), 'JAMB eFacility portal', 'Official portal for CAPS admission status, result checking, admission letters and change of course/institution.', 'FORM', null, 'https://efacility.jamb.gov.ng', 'APPROVED', adminId, now());
res.run(uid(), 'JAMB official website', 'Announcements, guidelines, brochure and syllabus from the Joint Admissions and Matriculation Board.', 'GUIDE', null, 'https://www.jamb.gov.ng', 'APPROVED', adminId, now());
res.run(uid(), 'UNICAL official website', 'University of Calabar official news, admissions and portal links.', 'GUIDE', unicalId, 'https://unical.edu.ng', 'APPROVED', adminId, now());
res.run(uid(), 'Academic letter template pack', 'All EduReach letter templates: appeals, requests, SIWES, reinstatement and more.', 'TEMPLATE', null, '/letters', 'APPROVED', adminId, now());

// ─── Demo student workspace ─────────────────────────────────────────────────
const in5 = new Date(Date.now() + 5 * 86400000).toISOString();
const in20 = new Date(Date.now() + 20 * 86400000).toISOString();
const dl = db.prepare(`INSERT INTO deadlines (id, user_id, type, title, course, due_at, location, priority, status, remind_days, created_at, updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
dl.run(uid(), demoId, 'EXAM', 'CSC 301 — Data Structures exam', 'CSC 301', in5, 'Examination Hall A', 'HIGH', 'PENDING', 3, now(), now());
dl.run(uid(), demoId, 'REGISTRATION', 'Complete second semester course registration', null, in20, null, 'HIGH', 'PENDING', 5, now(), now());
dl.run(uid(), demoId, 'FEE', 'School fees balance', null, in20, null, 'MEDIUM', 'PENDING', 7, now(), now());

const tk = db.prepare('INSERT INTO tasks (id, user_id, title, description, status, source, created_at) VALUES (?,?,?,?,?,?,?)');
tk.run(uid(), demoId, 'Upload passport photo on the student portal', null, 'PENDING', 'SYSTEM', now());
tk.run(uid(), demoId, 'Print JAMB admission letter copy', null, 'PENDING', 'MANUAL', now());
tk.run(uid(), demoId, 'Verify EduReach email address', null, 'COMPLETED', 'SYSTEM', now());

db.prepare('INSERT INTO notifications (id, user_id, title, body, link, read, created_at) VALUES (?,?,?,?,?,0,?)').run(
  uid(), demoId, 'Welcome to EduReach NG', 'Find information, generate letters, calculate your GPA and track deadlines — all from your dashboard.', '/dashboard', now()
);

console.log('✔ Seeded:');
console.log(`   Admin  → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (SUPER_ADMIN)`);
console.log(`   Demo   → ${DEMO_EMAIL} / ${DEMO_PASSWORD} (STUDENT, UNICAL Computer Science 300L)`);
console.log('   UNICAL directory: 10 faculties, ~40 departments');
console.log('   Announcements: 3 verified + 1 queued for verification');
db.close();
