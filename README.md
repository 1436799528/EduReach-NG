# EduReach Hub

EduReach Hub is a production-oriented digital front desk for Nigerian tertiary students. The MVP is built around six practical actions: **Write, Find, Check, Calculate, Get, Ask**.

## Stack

- Next.js App Router + React + TypeScript
- Supabase Auth + PostgreSQL + RLS
- Server-side Supabase client for protected data
- Mobile-first CSS with no UI dependency required

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the EduReach Supabase project.
3. Run `npm install`.
4. Run `npm run typecheck`.
5. Run `npm run build`.
6. Run `npm run start`.

## Product rules

- Core calculations are deterministic; AI is not required.
- Institutional claims require a source and verification status.
- Do not publish fabricated JAMB, university, admission, fee, cut-off or examination data.
- User-owned records are protected with Row Level Security.
- Staff permissions are checked server-side and in database policies.
- Supabase service-role credentials must never be placed in client code.

## MVP routes

- `/` public landing page
- `/login`, `/signup` authentication
- `/app` dashboard
- `/app/tools/gpa` GPA/CGPA tools
- `/app/write` document generator
- `/app/updates` verified information
- `/app/school` institution home
- `/app/tasks` student task tracker
- `/app/resources` moderated resources
- `/app/search` information search
- `/app/ask` curated practical answers
- `/admin` restricted operations dashboard

## Database

The connected Supabase project contains the existing EduReach academic data model plus the MVP tables for grading schemes, academic records, document templates, generated documents, sources, announcements, verification records, cut-off marks, deadlines, exams, tasks, bookmarks, preferences, search telemetry and audit logs.

The database migration history is the source of truth for repeatable schema changes.

## Deployment

Deploy the Next.js application to a managed Node/Next.js host and configure the two public Supabase environment variables. Never commit `.env.local` or server/service-role keys.

## Trust notice

EduReach Hub is an independent student-support service. It is not affiliated with JAMB or any university unless an explicit relationship is established and disclosed.
