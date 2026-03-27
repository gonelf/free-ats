# KiteHR — Claude Code Instructions

This file is read automatically by Claude Code at the start of every session.
It contains project context, conventions, and step-by-step playbooks for recurring tasks.

---

## Project Overview

**KiteHR** (`https://kitehr.co`) is a free, freemium Applicant Tracking System (ATS) for small
businesses and startups. The stack is:

- **Framework**: Next.js (App Router) + TypeScript
- **Database**: PostgreSQL via Supabase, accessed through Prisma ORM (`src/lib/db.ts`)
- **Auth**: Supabase Auth (`src/lib/supabase/server.ts`)
- **AI**: Google Gemini Flash (`gemini-2.5-flash`) via `src/lib/ai/gemini.ts`
- **Payments**: Stripe
- **File storage**: Cloudflare R2
- **Email**: Resend
- **Deployment**: Vercel

Key directories:
- `src/app/(dashboard)/` — authenticated dashboard routes
- `src/app/admin/` — internal admin panel (protected by `requireAdmin()`)
- `src/app/api/` — API routes, including `api/cron/` and `api/admin/`
- `src/components/` — shared React components
- `prisma/schema.prisma` — database schema
- `vercel.json` — Vercel cron schedules and function config

---

## pSEO Playbook

Every new programmatic SEO (pSEO) content hub must follow one of two patterns.
**Choose the pattern before writing any code.**

### Which pattern to use

```
Is the content set under 50 pages AND written/curated by hand?
├── Yes → Pattern A: Static TypeScript data file
└── No  → Pattern B: DB + Admin UI + Cron (AI-generated, phased rollout)
```

---

## Pattern A — Static (TypeScript data file)

Use for small, stable hubs like email templates, interview questions, job descriptions.

**Reference files to copy from:**
- Data file: `src/app/hr-email-templates/hr-email-templates-data.ts`
- Index page: `src/app/hr-email-templates/page.tsx`
- Detail page: `src/app/hr-email-templates/[type]/page.tsx`

### File structure

```
src/app/[hub]/
├── page.tsx             — Index: category grid + CTAs to /signup
├── [slug]/
│   └── page.tsx         — Detail: full content + CTAs
└── [hub]-data.ts        — All items as Record<slug, Item>
```

### Data file requirements

```typescript
export type HubItem = {
  slug: string;
  title: string;
  category: string;
  metaTitle: string;        // 50–60 chars
  metaDescription: string;  // 150–160 chars, include keyword + "free"
  description: string;
  // ...content fields
};

export const hubItems: Record<string, HubItem> = { ... };

// Always export all three helpers:
export function getHubItem(slug: string): HubItem | null { return hubItems[slug] ?? null; }
export function getAllHubSlugs(): string[] { return Object.keys(hubItems); }
export const hubItemList = Object.values(hubItems);
```

### Detail page requirements

```typescript
// Always include all three:
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = getHubItem((await params).slug);
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: `/[hub]/${data.slug}` }, // canonical is required
  };
}

export function generateStaticParams() {
  return getAllHubSlugs().map((slug) => ({ slug }));
}

export default async function Page({ params }) {
  const data = getHubItem((await params).slug);
  if (!data) return notFound();
  // ...
}
```

### Pattern A checklist

- [ ] Data file: `Record<slug, Item>` + three helper exports
- [ ] Index page: static `metadata`, category grid, CTAs to `/signup`
- [ ] Detail page: `generateStaticParams`, `generateMetadata` with canonical, `notFound()` guard
- [ ] `sitemap.ts` updated (import slugs from data file, add index + detail routes)
- [ ] `robots.ts` updated (`allow: ["/[hub]/"]`)

---

## Pattern B — Dynamic (DB + Admin UI + Cron)

Use for large AI-generated hubs like salary data or the SOP library.

**Reference files to copy from:**
- Admin populate API: `src/app/api/admin/sop-populate/route.ts`
- Admin populate API (salary variant): `src/app/api/admin/salary-populate/route.ts`
- Admin form component: `src/components/admin/SopPopulateForm.tsx`
- Admin page: `src/app/admin/sop-library/page.tsx`
- Publish cron: `src/app/api/cron/publish-sop-pages/route.ts`
- Public index page: `src/app/hr-sop/page.tsx`
- Public detail page: `src/app/hr-sop/[slug]/page.tsx`
- Sitemap DB pattern: `src/app/sitemap.ts` (SOP section)

### Full build sequence — follow in this exact order

#### 1. Prisma model

Add to `prisma/schema.prisma`. `publishedAt DateTime?` is mandatory — it controls page visibility.

```prisma
model GeneratedHubItem {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  category    String
  phase       Int
  // content fields — use @db.Text for long strings, Json for arrays/objects
  publishedAt DateTime? // null = invisible, set = live
  createdAt   DateTime  @default(now())

  @@index([publishedAt])
  @@index([phase])
  @@index([category])
}
```

Run `prisma migrate deploy` in production after adding the model.

#### 2. Content plan Markdown file

Create at the project root (e.g. `HUB_CONTENT_PLAN.md`).
The populate API parses this file — use consistent block markers:

```markdown
## Phase 2 — Section Name

### Item 1
**Slug:** example-slug
**Title:** Example Title
**Category:** category-name
**Phase:** 2

### Item 2
...
```

Group items by phase. The populate API reads this to know what to generate next.

#### 3. Admin populate API

Create `src/app/api/admin/[hub]-populate/route.ts`.

**Required behaviour:**
- `export const maxDuration = 300` (Gemini can be slow)
- Verify caller is admin: `const adminUser = await getAdminUser(); if (!adminUser) return new Response("Unauthorized", { status: 401 })`
- Accept query params: `phase` (optional, "all" = all phases), `limit` (default 5), `dryRun` (default true)
- Read plan file: `readFileSync(join(process.cwd(), "HUB_CONTENT_PLAN.md"), "utf-8")`
- Skip slugs already in DB
- Call Gemini Flash: `genAI.getGenerativeModel({ model: "gemini-2.5-flash" })`
- Upsert with `publishedAt: null`
- Return SSE stream: `Content-Type: text/event-stream`
- Send progress as `data: ${JSON.stringify({ msg })}` events
- End with `event: done` or `event: error`
- Retry Gemini once on failure before skipping item
- 2-second delay between items

#### 4. Admin form component

Create `src/components/admin/[Hub]PopulateForm.tsx` — `"use client"` component.

**Required behaviour:**
- Phase selector buttons (one per phase + "All phases")
- Limit selector (5 / 10 / 25 / 50 SOPs per run)
- Dry run checkbox — **checked by default**
- Play/Stop buttons
- `EventSource` opened on start, closed on done/error/stop
- Monospace log output panel (scrolls to bottom automatically)
- Green text for `✓`/`✅` lines, red for `✗`/`Error`/`Fatal`, yellow for `DRY RUN`/`[Stopped`

Copy the JSX structure from `src/components/admin/SopPopulateForm.tsx`.

#### 5. Admin page

Create `src/app/admin/[hub]/page.tsx`:

```typescript
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { HubPopulateForm } from "@/components/admin/HubPopulateForm";

export default async function HubAdminPage() {
  await requireAdmin();
  const totalInDb = await db.generatedHubItem.count();
  const publishedCount = await db.generatedHubItem.count({ where: { publishedAt: { not: null } } });
  // render stats grid + <HubPopulateForm totalInDb={totalInDb} publishedCount={publishedCount} />
}
```

#### 6. Publish cron

Create `src/app/api/cron/publish-[hub]-pages/route.ts`.

**Required behaviour:**
- Verify `Authorization: Bearer ${process.env.CRON_SECRET}`
- Query `findMany({ where: { publishedAt: null }, orderBy: [{ phase: "asc" }, { createdAt: "asc" }], take: ITEMS_PER_RUN })`
- Return early with `skipped` log if nothing to publish
- `updateMany({ where: { id: { in: ids } }, data: { publishedAt: new Date() } })`
- `revalidatePath("/[hub]", "page")` to refresh the index immediately
- Ping Google: `fetch("https://www.google.com/ping?sitemap=" + encodeURIComponent(sitemapUrl))`
- Submit to IndexNow: `POST https://api.indexnow.org/indexnow` with all new URLs
- Write to `CronLog` table with job name, status, message, details, durationMs

Typical `ITEMS_PER_RUN = 5`. Adjust for desired rollout speed.

#### 7. Public index page

Create `src/app/[hub]/page.tsx`:

```typescript
export const revalidate = 3600; // 1-hour ISR

export default async function HubIndexPage() {
  let items = [];
  try {
    items = await db.generatedHubItem.findMany({
      where: { publishedAt: { not: null } },
      orderBy: [{ phase: "asc" }, { createdAt: "asc" }],
    });
  } catch { /* table not yet migrated — show empty state */ }

  // Always render empty state when items.length === 0
  // Use <PublicNav /> and <PublicFooter /> from @/components/public-layout
  // CTAs link to /signup — never /login
}
```

#### 8. Public detail page

Create `src/app/[hub]/[slug]/page.tsx`:

```typescript
export const revalidate = 86400; // 24-hour ISR

export async function generateStaticParams() {
  try {
    const items = await db.generatedHubItem.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true },
    });
    return items.map((i) => ({ slug: i.slug }));
  } catch { return []; }
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const item = await db.generatedHubItem.findUnique({ where: { slug: (await params).slug } });
  if (!item || !item.publishedAt) return {};
  return {
    title: item.metaTitle,
    description: item.metaDescription,
    alternates: { canonical: `/[hub]/${item.slug}` }, // always set canonical
  };
}

export default async function HubDetailPage({ params }) {
  const item = await db.generatedHubItem.findUnique({ where: { slug: (await params).slug } });
  if (!item || !item.publishedAt) return notFound(); // 404 if unpublished
  // render full content
}
```

#### 9. vercel.json

Add the function maxDuration and cron entry:

```json
{
  "functions": {
    "src/app/api/admin/[hub]-populate": { "maxDuration": 300 }
  },
  "crons": [
    { "path": "/api/cron/publish-[hub]-pages", "schedule": "0 10 */2 * *" }
  ]
}
```

Cron schedule guide: `*/2` = every 2 days, `* * *` = daily. Choose based on rollout speed.

#### 10. sitemap.ts

```typescript
// Add index route
const hubIndexRoute: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/[hub]`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
];

// Add detail routes — ALWAYS wrap in try/catch
let hubRoutes: MetadataRoute.Sitemap = [];
try {
  const published = await db.generatedHubItem.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true, publishedAt: true },
  });
  hubRoutes = published.map((item) => ({
    url: `${BASE_URL}/[hub]/${item.slug}`,
    lastModified: item.publishedAt ?? new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
} catch {
  // Table not yet migrated — routes added after first successful migration
}

// Add to the return array at the bottom of sitemap()
return [...existing, ...hubIndexRoute, ...hubRoutes];
```

#### 11. robots.ts

```typescript
allow: [...existingPaths, "/[hub]/"],
```

#### 12. Dashboard equivalent

Every public pSEO hub should have a read-only in-product view at `/(dashboard)/[shortname]/`:

```
src/app/(dashboard)/[shortname]/page.tsx       — list view (by category)
src/app/(dashboard)/[shortname]/[slug]/page.tsx — detail view (steps, content)
```

The dashboard version uses the dashboard component library (no `PublicNav`/`PublicFooter`).
It does not need `generateStaticParams` — it renders dynamically per authenticated request.

### Pattern B checklist

- [ ] Prisma model with `publishedAt DateTime?` + migrate
- [ ] Content plan Markdown file at project root
- [ ] Admin populate API: SSE, dry-run default, skip existing, Gemini, upsert with `publishedAt: null`
- [ ] Admin form component: phase/limit/dryRun controls, EventSource, log output
- [ ] Admin page: stats + form
- [ ] Publish cron: auth check, `updateMany publishedAt`, `revalidatePath`, IndexNow, CronLog
- [ ] Public index page: `revalidate = 3600`, empty state, try/catch DB call
- [ ] Public detail page: `revalidate = 86400`, `generateStaticParams`, canonical metadata, `notFound()` if unpublished
- [ ] `vercel.json`: maxDuration for populate API + cron schedule
- [ ] `sitemap.ts`: index + detail routes from DB, try/catch
- [ ] `robots.ts`: allow rule
- [ ] Dashboard pages (`/(dashboard)/[shortname]/`)

---

## Rules that apply to ALL pSEO pages

### SEO metadata (non-negotiable)
- `metaTitle`: 50–60 chars. Always ends with `— KiteHR`.
- `metaDescription`: 150–160 chars. Includes primary keyword. Mentions "free".
- `alternates.canonical`: always set on detail pages.
- Never add `noindex`.

### Page structure
Every public detail page must have **all three CTAs**:
1. Hero CTA → `/signup` (primary button, cyan)
2. Sidebar CTA box → `/signup` (smaller, `border-cyan-500/20 bg-cyan-500/5`)
3. Bottom CTA section → `/signup` (primary) + back to hub index (secondary)

CTAs always link to `/signup`, never `/login`.
Use `<PublicNav />` and `<PublicFooter />` from `@/components/public-layout`.
Background: `bg-[#080c10]`, text: `text-white`.

### Content visibility
Full content must be in the HTML. Never hide text from crawlers behind JS, login checks, or
CSS that conceals text. The signup prompt is a CTA overlay, not a paywall.

### URL conventions
- Hub path: `/kebab-case` (e.g. `/hr-sop`)
- Slugs: lowercase, hyphen-separated, no trailing slash
- No query params in canonical URLs

### Never do these
- Do not create a pSEO hub without adding it to both `sitemap.ts` and `robots.ts`
- Do not use `export const dynamic = "force-dynamic"` on public pSEO pages (use ISR instead)
- Do not fetch unpublished DB content on public pages — always filter `where: { publishedAt: { not: null } }`
- Do not add pSEO routes to the middleware auth guard (they must be publicly accessible)

---

## Existing pSEO hubs for reference

| URL | Pattern | Data source |
|-----|---------|------------|
| `/hr-email-templates` | A (static) | `src/app/hr-email-templates/hr-email-templates-data.ts` |
| `/interview-questions` | A (static) | `src/app/interview-questions/interview-questions-data.ts` |
| `/job-descriptions` | A (static) | `src/app/job-descriptions/job-descriptions-data.ts` |
| `/how-to-hire` | A (static) | `src/app/how-to-hire/how-to-hire-data.ts` |
| `/salaries` | B (DB) | `SalaryEntry` model, generated via `/admin/salary-data` |
| `/hr-sop` | B (DB) | `GeneratedSop` model, generated via `/admin/sop-library` |
| `/blog` | Hybrid | Static `posts.ts` + `GeneratedBlogPost` model (daily cron) |
