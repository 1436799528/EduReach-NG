-- EduReach NG — relational schema (SQLite dialect; engine-agnostic design).
-- All ids are app-generated UUIDv4 strings. Timestamps are ISO-8601 UTC strings.
-- Booleans are INTEGER 0/1.

-- ─── Identity & access ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  full_name         TEXT NOT NULL,
  phone             TEXT,
  role              TEXT NOT NULL DEFAULT 'STUDENT',       -- STUDENT | CONTRIBUTOR | MODERATOR | ADMIN | SUPER_ADMIN
  status            TEXT NOT NULL DEFAULT 'ACTIVE',        -- ACTIVE | SUSPENDED | DELETED
  email_verified_at TEXT,
  notify_email      INTEGER NOT NULL DEFAULT 1,
  notify_in_app     INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  institution_id TEXT REFERENCES institutions(id),
  faculty_id     TEXT REFERENCES faculties(id),
  department_id  TEXT REFERENCES departments(id),
  level          TEXT,   -- 100..600
  programme      TEXT,
  semester       TEXT,   -- FIRST | SECOND
  current_cgpa   REAL,
  student_status TEXT    -- UTME_CANDIDATE | PROSPECTIVE | UNDERGRADUATE | FINAL_YEAR | SIWES | NYSC_TRANSITION
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE, -- SHA-256 of the opaque cookie token
  ip         TEXT,
  user_agent TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS email_tokens (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  purpose    TEXT NOT NULL, -- VERIFY_EMAIL | PASSWORD_RESET
  expires_at TEXT NOT NULL,
  used_at    TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id);

-- ─── Institution directory (Country → State → Institution → Faculty → Dept) ─

CREATE TABLE IF NOT EXISTS institutions (
  id               TEXT PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  short_name       TEXT,
  type             TEXT NOT NULL, -- UNIVERSITY | POLYTECHNIC | COLLEGE_OF_EDUCATION
  state            TEXT NOT NULL,
  city             TEXT,
  website          TEXT,
  admission_portal TEXT,
  student_portal   TEXT,
  contact_email    TEXT,
  about            TEXT
);

CREATE TABLE IF NOT EXISTS faculties (
  id             TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL,
  UNIQUE(institution_id, slug)
);

CREATE TABLE IF NOT EXISTS departments (
  id         TEXT PRIMARY KEY,
  faculty_id TEXT NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  UNIQUE(faculty_id, slug)
);

-- ─── Verified content ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS announcements (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  summary          TEXT NOT NULL,
  body             TEXT NOT NULL,
  category         TEXT NOT NULL,  -- JAMB | ADMISSION | REGISTRATION | EXAMINATIONS | FEES | SIWES | RESULTS | OPPORTUNITY | GENERAL
  urgency          TEXT NOT NULL DEFAULT 'GENERAL', -- URGENT | IMPORTANT | GENERAL
  status           TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | UNDER_REVIEW | VERIFIED | REJECTED | OUTDATED | ARCHIVED
  institution_id   TEXT REFERENCES institutions(id),
  source_name      TEXT NOT NULL,
  source_url       TEXT,
  published_at     TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  effective_date   TEXT,
  last_verified_at TEXT NOT NULL,
  editor_id        TEXT
);
CREATE INDEX IF NOT EXISTS idx_ann_status_date ON announcements(status, published_at);
CREATE INDEX IF NOT EXISTS idx_ann_institution ON announcements(institution_id);
CREATE INDEX IF NOT EXISTS idx_ann_category ON announcements(category);

CREATE TABLE IF NOT EXISTS cutoff_marks (
  id                  TEXT PRIMARY KEY,
  institution_id      TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  programme           TEXT NOT NULL,
  faculty             TEXT,
  utme_cutoff         INTEGER,
  departmental_cutoff REAL,
  session             TEXT NOT NULL, -- e.g. "2024/2025"
  category            TEXT NOT NULL DEFAULT 'UTME',
  status              TEXT NOT NULL DEFAULT 'PENDING',
  source_name         TEXT NOT NULL,
  source_url          TEXT,
  note                TEXT,
  published_at        TEXT NOT NULL,
  last_verified_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cutoff_inst ON cutoff_marks(institution_id, status);

-- ─── Student workspace ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS deadlines (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL, -- EXAM | TEST | ASSIGNMENT | PROJECT | REGISTRATION | FEE | SIWES | CLEARANCE | OTHER
  title       TEXT NOT NULL,
  course      TEXT,
  due_at      TEXT NOT NULL,
  location    TEXT,
  description TEXT,
  priority    TEXT NOT NULL DEFAULT 'MEDIUM', -- HIGH | MEDIUM | LOW
  status      TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | COMPLETED | MISSED
  remind_days INTEGER NOT NULL DEFAULT 2,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_deadlines_user ON deadlines(user_id, status, due_at);

CREATE TABLE IF NOT EXISTS tasks (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | COMPLETED
  source       TEXT NOT NULL DEFAULT 'MANUAL',  -- MANUAL | EVENT | SYSTEM
  due_at       TEXT,
  completed_at TEXT,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id, status);

CREATE TABLE IF NOT EXISTS generated_documents (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,
  title        TEXT NOT NULL,
  field_values TEXT NOT NULL, -- JSON
  content      TEXT NOT NULL, -- rendered plain text
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_docs_user ON generated_documents(user_id, created_at);

CREATE TABLE IF NOT EXISTS bookmarks (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL, -- ANNOUNCEMENT | PAGE | RESOURCE | LETTER
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id, created_at);

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  link       TEXT,
  read       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);

-- ─── Resources (moderated) ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS resources (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  type           TEXT NOT NULL, -- PAST_QUESTION | LECTURE_NOTE | TEMPLATE | FORM | GUIDE | OTHER
  institution_id TEXT REFERENCES institutions(id),
  course         TEXT,
  level          TEXT,
  year           INTEGER,
  file_name      TEXT,
  stored_path    TEXT, -- server-side storage key; never exposed to clients
  file_size      INTEGER,
  mime           TEXT,
  external_url   TEXT,
  status         TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | APPROVED | REJECTED
  downloads      INTEGER NOT NULL DEFAULT 0,
  uploader_id    TEXT REFERENCES users(id),
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status, type);
CREATE INDEX IF NOT EXISTS idx_resources_inst ON resources(institution_id);

CREATE TABLE IF NOT EXISTS resource_reports (
  id          TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id     TEXT,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'OPEN', -- OPEN | RESOLVED | DISMISSED
  created_at  TEXT NOT NULL
);

-- ─── Observability ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activity_logs (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL,
  summary    TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id, created_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  action     TEXT NOT NULL, -- e.g. AUTH_LOGIN_FAILED | ADMIN_VERIFY_ANNOUNCEMENT
  entity     TEXT,
  entity_id  TEXT,
  detail     TEXT,
  ip         TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action, created_at);
