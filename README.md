# VS Studio Admin &mdash; Founders Operations Dashboard

> **Internal business management system** for VS Studio founders (2-person freelancing studio: Web Design/Dev, Logo & Branding, AI Agents & Workflow Automation).

Built with **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **TanStack React Query**.

---

## Architecture Overview

- **Shared Supabase Backend**:
  1. **Public Site**: Anonymous `INSERT` into `inquiries` and file upload to private bucket `client-files`. No read access permitted.
  2. **Admin Dashboard (This App)**: Authenticated founders only. Validated against the `admins` table and enforced across all Row Level Security (RLS) policies.
- **Realtime Push Notifications**: Subscribed via Supabase Realtime for instant lead alerts with sound and toast notifications.
- **Automated Email Notifications**: Supabase Edge Function (`notify-inquiry`) via Resend API sends instant confirmation to clients and email alerts to founders.

---

## Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

*(Note: The service-role key is never exposed on the frontend).*

### 2. Run Database Migration & Seed

In your Supabase SQL Editor:
1. Run `supabase/migrations/20261026000000_vs_studio_schema.sql` to initialize all 8 tables, indexes, automatic `updated_at` triggers, RLS policies, and the private `client-files` storage bucket.
2. Run `supabase/seed.sql` to load realistic studio sample data across Web, Branding, and AI Automations.

### 3. Install & Start Development Server

```bash
npm install
npm run dev
```

The application will start at `http://localhost:5173`.

---

## Core Modules & Features

1. **Founders Authentication**: Whitelist protection via `admins` table. Public signups disabled. Session persistence with auto-refresh.
2. **Overview Dashboard**: Live KPIs (New leads, active projects, tasks due this week, overdue collections, month revenue, outstanding balances) + "Attention Needed" triage feed + activity audit trail.
3. **Inquiries Feed**: Realtime lead ingestion, search, multi-filter, detail drawer with signed download URLs for private client attachments, internal notes, and one-click "Convert to Client + Project".
4. **Clients 360° Directory**: Full historical view of each client's inquiries, active projects, proposals, and paid vs unpaid invoices.
5. **Projects Hub**: Kanban board (Planning, In Progress, Review, Completed, On Hold) and list view with progress slider, deadline countdown flags (green, amber <= 3d, red overdue), and financial tracking.
6. **Task Board**: Project-level checklists and global "My Tasks" board filterable by founder assignee and priority.
7. **Proposals Engine**: Line-item deliverable builder with auto-computed sums and status tracking (Draft, Sent, Accepted, Rejected).
8. **Cashflow & Payments**: Advance deposits, milestone releases, final settlements, auto-computed outstanding balances per project, and overdue alerts.
9. **Master Deadlines Calendar**: Unified agenda aggregating project launch dates, task deadlines, and payment due dates.
10. **Public Site Integration**: Complete code snippet in `docs/PUBLIC_WEBSITE_INTEGRATION.md` for connecting your public website form.

---

## Deploy to Vercel

```bash
npm run build
```

Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings > Environment Variables.
The included `vercel.json` ensures client-side routing works seamlessly across all deep links.
