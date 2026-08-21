# EduReach NG

> **School problem? Start here.**
> A digital front desk for Nigerian tertiary students — verified school information, an academic letter generator, exact GPA/CGPA tools, a deadline tracker, a moderated resource library, and curated practical answers.

The product principle: **a student has a problem; the platform helps them solve it quickly.** It is deliberately *not* a study app, an LMS, or a social network.

Launch institution: **University of Calabar (UNICAL)** — deep data for one school first, then expansion (UNILAG, LASU, UNIBEN, UNN, FUTA, ABU…). The directory never contains filler data.

---

## What's inside (Phase 1 MVP)

| Pillar | Feature | Where |
|---|---|---|
| **WRITE** | 17 versioned letter templates (late registration appeals, result corrections, SIWES, reinstatement…) with dynamic fields, Nigerian academic formatting, `[PLACEHOLDERS]` instead of invented facts, live preview, copy, print, **PDF export**, save to My Documents | `/write`, `/letters` |
| **FIND** | University directory (UNICAL deep profile: faculties, departments, cut-offs, updates, portals), JAMB & admission guides | `/universities`, `/jamb`, `/admission` |
| **CHECK** | Verified announcements feed with **source + verification label + last-verified date**, urgency tiers, deadline tracker | `/check`, `/deadlines` |
| **CALCULATE** | GPA calculator (letter/score entry, 5.0/4.0/7.0 scales), **"Can I Still Get This CGPA?"** target checker with scenarios | `/tools/*` |
| **GET** | Moderated resource library (past questions, guides, forms): secure uploads, magic-byte validation, controlled downloads, reporting | `/resources` |
| **ASK** | Curated, grounded Q&A (deterministic today; AI behind an interface tomorrow) | `/ask` |
| Platform | Auth (email/password, sessions, verification, reset), onboarding, dashboard, tasks, notifications, admin panel with **verification queue**, audit logs, global search, data export & account deletion, privacy/terms | throughout |

## Tech stack

- **Next.js 14 (App Router) + TypeScript** — server-rendered, SEO-friendly; thin client islands
- **Data layer**: relational schema (`db/schema.sql`) on **SQLite via `node:sqlite`** for dev; `src/lib/db.ts` exposes a minimal `all/one/run` interface so the engine can be swapped for PostgreSQL in production
- **Auth**: bcrypt password hashing, opaque session tokens (SHA-256 stored server-side), httpOnly `SameSite=Lax` cookies, sliding 30-day expiry
- **Validation**: zod on every API boundary
- **Tests**: Vitest — GPA engine + letter renderer (deterministic, no AI math)
- **PDF**: jsPDF (client-side generation)
- Design system: hand-rolled tokens in `src/app/globals.css` — mobile-first, `#008751` brand green, large tap targets, print styles

## Getting started

```bash
npm install
cp .env.example .env        # then edit values
npm run db:setup            # create schema (idempotent)
npm run db:seed             # demo data (UNICAL, admin + demo student, verified updates)
npm run dev                 # http://localhost:3000
```

**Seed accounts** (development only):

| Role | Email | Password |
|---|---|---|
| Super admin | `admin@edureach.ng` | `Admin123!` |
| Demo student (UNICAL CS, 300L) | `demo.student@edureach.ng` | `Student123!` |

Other scripts: `npm test` (unit tests), `npm run typecheck`, `npm run build`, `npm run db:seed -- --force` (wipe & reseed).

## Security model (not an afterthought)

- **No frontend role checks trusted** — every route/page guard re-verifies session + role server-side (`STUDENT < CONTRIBUTOR < MODERATOR < ADMIN < SUPER_ADMIN`)
- Rate limiting on auth and upload endpoints (in-memory; swap for a shared store at scale)
- Origin checks on mutating requests + SameSite cookies (CSRF)
- Password reset/verification: single-use, hashed, expiring tokens; all sessions revoked after password change/reset; account suspension kills sessions
- Uploads: extension allowlist + MIME + **magic-byte sniffing** + 5 MB cap + server-generated filenames + storage outside web root + downloads only through an authenticated controller (path-traversal safe, `nosniff`)
- Audit logs for auth failures, admin verification actions, role changes; activity logs for user-facing history
- User data ownership: full JSON export (`/api/me/export`), password-confirmed account deletion with PII anonymization
- Security headers (deny framing, `nosniff`, referrer policy); secrets via env only

## Trust model (§37)

Every important fact carries: **source + source URL + published date + last-verified date + verification status + editor**. Statuses: `Needs verification` → `Source reported` → `Officially verified` (plus `Outdated`, `Rejected`, `Archived`). Publishing a VERIFIED announcement fans out in-app notifications to affected students (institution-matched). Nothing is ever silently overwritten; admin actions are audit-logged.

> EduReach is an independent student-support service, not affiliated with JAMB, NYSC or any university unless explicitly stated. Time-sensitive information always links to its official source.

## Roadmap (per master spec)

1. **Phase 1 (this)** — landing, auth, profiles, dashboard, GPA/CGPA engine, Write Center, info center, updates + verification, tracker, search, resources, admin
2. Email provider (real verification/reset mail), contributor submissions workflow, grading-scheme admin UI
3. Institution expansion + admin institution editor; notification emails per user prefs
4. Ask Center: retrieval-augmented AI **behind `AIProvider` interface** (`src/lib/ai/provider.ts`) — grounded on verified content only, vendor-swappable
5. Premium tier hooks, calendar exports, browser push

## Repository layout

```
db/                 schema.sql, migrate.mjs, seed.mjs
src/
  app/              routes: (public), (app), admin, api/
  components/       server + client UI (islands)
  lib/
    auth.ts         sessions, roles, tokens
    api.ts          guards, validation plumbing, rate limit, audit
    db.ts           engine seam (SQLite dev → Postgres prod)
    data/           repositories (parameterized SQL only)
    gpa/            deterministic engine + tests
    letters/        template registry + renderer + tests
    content/        curated guides + FAQs
    ai/             AIProvider interface + template provider
```

Found a problem? Open an issue. Never commit `.env`, `storage/` or real student data.
