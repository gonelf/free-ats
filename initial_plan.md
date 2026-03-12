# Free ATS with Paid AI Features — Implementation Plan

## Context

Build a free Applicant Tracking System (ATS) from scratch where:
- **All core ATS workflows are 100% free** — users can manage jobs, candidates, pipelines, notes, and interviews manually at no cost.
- **AI-powered acceleration features require a paid subscription** — resume parsing, candidate scoring, email drafting, job description generation, etc.

The business model is: give users a fully functional tool for free, then let them pay to save time with AI.

The repo is a fresh Next.js project (only `.gitignore` exists). Target deployment: Vercel.

**User preferences:**
- Database: Supabase (PostgreSQL + Storage)
- Auth: Supabase Auth
- Monetization: Monthly subscription (simple flat plan)

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14+ App Router + TypeScript | Vercel-native, Server Components, Server Actions |
| Database | Supabase (PostgreSQL) | All-in-one: DB + Auth + Storage |
| ORM | Prisma | Type-safe queries, migrations |
| Auth | Supabase Auth | User chose; handle org/team management manually |
| Payments | Stripe | Subscriptions + webhook sync |
| AI | Google Gemini API (`@google/generative-ai`) | `gemini-2.0-flash` for high-volume, `gemini-2.0-pro` for quality |
| Email | Resend | React Email templates, easy Next.js integration |
| UI | Tailwind CSS + shadcn/ui | Fast, consistent, accessible |
| Drag-and-drop | @dnd-kit/core | React 18 compatible, maintained |
| Rate limiting | Upstash Ratelimit | Protect AI routes |

---

## Database Schema (`prisma/schema.prisma`)

```prisma
model Organization {
  id               String   @id @default(cuid())
  name             String
  slug             String   @unique
  plan             Plan     @default(FREE)
  stripeCustomerId String?  @unique
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  members          Member[]
  jobs             Job[]
  candidates       Candidate[]
  pipelines        Pipeline[]
  emailTemplates   EmailTemplate[]
}

enum Plan { FREE PRO }

model Member {
  id             String       @id @default(cuid())
  userId         String       // Supabase Auth user id
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  role           Role         @default(MEMBER)
  createdAt      DateTime     @default(now())

  @@unique([userId, organizationId])
  @@index([organizationId])
}

enum Role { OWNER ADMIN MEMBER }

model Job {
  id             String    @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  title          String
  description    String    @db.Text
  status         JobStatus @default(DRAFT)
  pipelineId     String
  pipeline       Pipeline  @relation(fields: [pipelineId], references: [id])
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  applications   Application[]
  @@index([organizationId])
}

enum JobStatus { DRAFT OPEN CLOSED }

model Pipeline {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  isDefault      Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  stages         Stage[]
  jobs           Job[]
  @@index([organizationId])
}

model Stage {
  id         String   @id @default(cuid())
  pipelineId String
  pipeline   Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  name       String
  order      Int
  color      String   @default("#6366f1")
  createdAt  DateTime @default(now())

  applications Application[]
  @@index([pipelineId])
}

model Candidate {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  firstName      String
  lastName       String
  email          String
  phone          String?
  resumeUrl      String?      // Supabase Storage path
  linkedinUrl    String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  applications   Application[]
  notes          Note[]
  aiSummary      AiSummary?
  @@unique([organizationId, email])
  @@index([organizationId])
}

model Application {
  id          String    @id @default(cuid())
  jobId       String
  job         Job       @relation(fields: [jobId], references: [id], onDelete: Cascade)
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  stageId     String
  stage       Stage     @relation(fields: [stageId], references: [id])
  aiScore     Int?      // 0-100, AI-generated
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([jobId, candidateId])
  @@index([stageId])
}

model Note {
  id          String    @id @default(cuid())
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  authorId    String    // Supabase user id
  content     String    @db.Text
  createdAt   DateTime  @default(now())

  @@index([candidateId])
}

model AiSummary {
  id          String    @id @default(cuid())
  candidateId String    @unique
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  summary     String    @db.Text
  createdAt   DateTime  @default(now())
  expiresAt   DateTime
}

model EmailTemplate {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  subject        String
  body           String       @db.Text
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([organizationId])
}
```

---

## Directory Structure

```
/free-ats
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                      # Landing page
│   │   │   ├── pricing/page.tsx              # Pricing page
│   │   │   └── layout.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/route.ts             # Supabase OAuth callback
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                    # Auth gate + org context
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx                  # Job list
│   │   │   │   ├── new/page.tsx              # Create job
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx              # Kanban board for job
│   │   │   │       └── settings/page.tsx     # Job settings
│   │   │   ├── candidates/
│   │   │   │   ├── page.tsx                  # All candidates
│   │   │   │   └── [id]/page.tsx             # Candidate detail
│   │   │   ├── pipelines/page.tsx            # Pipeline editor
│   │   │   ├── email-templates/page.tsx
│   │   │   ├── team/page.tsx                 # Invite/manage team
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx                  # Org settings
│   │   │   │   └── billing/page.tsx          # Subscription management
│   │   │   └── upgrade/page.tsx              # Paywall / upsell
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/route.ts           # Sync plan to DB
│   │   │   ├── ai/
│   │   │   │   ├── parse-resume/route.ts
│   │   │   │   ├── score-candidate/route.ts
│   │   │   │   ├── generate-summary/route.ts
│   │   │   │   ├── draft-email/route.ts
│   │   │   │   ├── generate-job-description/route.ts
│   │   │   │   ├── suggest-questions/route.ts
│   │   │   │   └── skills-gap/route.ts
│   │   │   └── stripe/
│   │   │       ├── create-checkout/route.ts
│   │   │       └── create-portal/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                               # shadcn/ui components
│   │   ├── pipeline/
│   │   │   ├── KanbanBoard.tsx               # @dnd-kit board
│   │   │   ├── KanbanColumn.tsx
│   │   │   └── KanbanCard.tsx
│   │   ├── candidates/
│   │   │   ├── CandidateCard.tsx
│   │   │   ├── CandidateDetail.tsx
│   │   │   └── CandidateForm.tsx
│   │   ├── jobs/
│   │   │   ├── JobCard.tsx
│   │   │   └── JobForm.tsx
│   │   ├── ai/
│   │   │   └── AiGate.tsx                    # Wraps AI features, shows upgrade prompt
│   │   ├── billing/
│   │   │   ├── PricingCards.tsx
│   │   │   └── UpgradeBanner.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── OrgSwitcher.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                     # Browser Supabase client
│   │   │   └── server.ts                     # Server Supabase client (cookies)
│   │   ├── db.ts                             # Prisma client singleton
│   │   ├── ai-gate.ts                        # requireProPlan() guard for AI routes
│   │   ├── ai/
│   │   │   ├── gemini.ts                     # Gemini client + shared helpers
│   │   │   ├── resume-parser.ts
│   │   │   ├── scorer.ts
│   │   │   ├── summarizer.ts
│   │   │   ├── email-drafter.ts
│   │   │   └── job-generator.ts
│   │   ├── stripe.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useProPlan.ts                     # Returns { isPro, showUpgrade }
│   │   └── useOrg.ts
│   └── middleware.ts                         # Protect /dashboard/* routes
├── .env.local.example
├── next.config.ts
└── package.json
```

---

## AI Feature Gating

All AI routes share one enforcement pattern in `src/lib/ai-gate.ts`:

```typescript
// src/lib/ai-gate.ts
export async function requireProPlan(orgId: string) {
  const org = await db.organization.findUniqueOrThrow({ where: { id: orgId } });
  if (org.plan !== 'PRO') {
    throw new Response('Upgrade to Pro to use AI features', { status: 402 });
  }
}
```

Every `/api/ai/*` route calls this first. On the frontend, `<AiGate>` wraps AI buttons — if `isPro` is false it shows an upgrade prompt instead of the feature.

---

## Stripe Integration (Monthly Subscription)

**Plan:** One PRO tier at ~$49/month per organization.

Flow:
1. User clicks "Upgrade" → `/api/stripe/create-checkout` creates a Checkout Session with the org's `stripeCustomerId`
2. On success, Stripe sends `checkout.session.completed` webhook
3. `src/app/api/webhooks/stripe/route.ts` updates `Organization.plan = 'PRO'` and stores `stripeSubscriptionId`
4. On `customer.subscription.deleted` webhook, set `plan = 'FREE'`
5. "Manage billing" → `/api/stripe/create-portal` opens Stripe Customer Portal for plan changes/cancellation

---

## Implementation Phases

### Phase 1 — Project Setup (Week 1)
- `npx create-next-app@latest` with TypeScript + Tailwind
- Install: `prisma`, `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `@google/generative-ai`, `resend`, `@dnd-kit/core`
- Install UI dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-toast`, `@radix-ui/react-tooltip`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-popover`, `@radix-ui/react-tabs` (note: `@radix-ui/react-badge` does not exist — use tailwind classes for badges)
- Configure Supabase project (DB, Auth, Storage bucket `resumes`)
- Push Prisma schema, run migrations
- Set up Supabase Auth (email/password + magic link)
- Auth middleware at `src/middleware.ts`
- Basic sidebar layout

### Phase 2 — Core ATS: Jobs & Candidates (Weeks 2–3)
- Organization creation on first login (with default pipeline + 3 stages)
- Job CRUD (create, edit, list, publish/close)
- Candidate CRUD (create, edit, list)
- Resume upload to Supabase Storage → store URL on Candidate
- Notes on candidates
- Link candidate to job (creates `Application` record)

### Phase 3 — Kanban Pipeline (Week 4)
- `<KanbanBoard>` using `@dnd-kit/core`
- Drag card between columns → PATCH `/api/stages/[id]` → update `Application.stageId`
- Optimistic UI: move card immediately, revert on error
- Custom stage editor (add/rename/reorder/delete stages)

### Phase 4 — Stripe Billing (Week 5)
- Stripe products setup (FREE implicit, PRO subscription)
- Checkout + portal API routes
- Webhook handler to sync `Organization.plan`
- `/upgrade` paywall page with `<PricingCards>`
- `/settings/billing` with subscription status + manage link
- `useProPlan()` hook

### Phase 5 — AI Features (Weeks 6–7)
Build each AI feature with the gate check first:

| Feature | Route | Model | Trigger |
|---|---|---|---|
| **Job Creation** | | | |
| Job description generator | `/api/ai/generate-job-description` | gemini-2.0-pro | Type role title → generate full JD |
| Job requirements extractor | `/api/ai/extract-requirements` | gemini-2.0-flash | Paste rough notes → structured requirements |
| Bias & clarity checker | `/api/ai/check-job-bias` | gemini-2.0-flash | Flags biased/exclusionary language |
| Salary range suggester | `/api/ai/suggest-salary` | gemini-2.0-pro | Based on role + location + seniority |
| Screening questions generator | `/api/ai/generate-screening-questions` | gemini-2.0-pro | Per job, auto-create applicant screener |
| **Candidate Management** | | | |
| Resume parsing | `/api/ai/parse-resume` | gemini-2.0-flash | Upload PDF → auto-fill candidate form |
| Candidate summary | `/api/ai/generate-summary` | gemini-2.0-flash | One-click profile summary |
| Candidate scoring | `/api/ai/score-candidate` | gemini-2.0-flash | 0–100 match score vs. job requirements |
| Auto-tagging | `/api/ai/tag-candidate` | gemini-2.0-flash | Extract skills, seniority, domain tags |
| Skills gap analysis | `/api/ai/skills-gap` | gemini-2.0-pro | Compare candidate skills to job needs |
| Duplicate detection | `/api/ai/detect-duplicate` | gemini-2.0-flash | Flag likely duplicate candidate profiles |
| **Communication** | | | |
| Email drafting | `/api/ai/draft-email` | gemini-2.0-pro | Outreach, rejection, offer, follow-up |
| Offer letter generation | `/api/ai/generate-offer` | gemini-2.0-pro | Full offer letter from template + data |
| **Interviews** | | | |
| Interview questions | `/api/ai/suggest-questions` | gemini-2.0-pro | Role-specific + candidate-specific Qs |
| Reference check questions | `/api/ai/reference-questions` | gemini-2.0-pro | Custom questions for reference checks |
| **Pipeline Intelligence** | | | |
| Pipeline bottleneck analysis | `/api/ai/pipeline-insights` | gemini-2.0-pro | "You're losing candidates at screening" |

Each AI button in the UI is wrapped in `<AiGate>` — shows a lock icon and "Upgrade to Pro" on FREE plan.

### Phase 6 — Polish & Launch (Week 8–9)
- Team member invitations (email via Resend → accept link)
- Basic reporting dashboard (candidates per stage, time-to-hire)
- Rate limiting on AI routes (`@upstash/ratelimit`)
- SEO for public job listings (`generateMetadata`)
- Error monitoring (Sentry)
- Onboarding checklist (create job → add candidate → move stage)
- Landing page + pricing page

---

## Environment Variables (`.env.local.example`)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=           # pooled (pgBouncer)
DIRECT_URL=             # direct (for Prisma migrations)

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourapp.com

# App
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

---

## Critical Files

| File | Why it matters |
|---|---|
| `prisma/schema.prisma` | Foundation — all features derive from this schema |
| `src/lib/ai-gate.ts` | Enforces the paid business model; all AI routes depend on it |
| `src/app/api/webhooks/stripe/route.ts` | Keeps billing state in sync; bugs here = billing inconsistency |
| `src/components/pipeline/KanbanBoard.tsx` | Core UX of the free tier |
| `src/middleware.ts` | Guards the entire dashboard from unauthenticated access |

---

## Vercel Deployment Preparation

### Files to create

**`vercel.json`** — Increase timeout for AI routes (default 10s is too short for Gemini):
```json
{
  "functions": {
    "src/app/api/ai/**": {
      "maxDuration": 60
    },
    "src/app/api/webhooks/**": {
      "maxDuration": 30
    }
  }
}
```

**`next.config.ts`** — Add image domains and edge runtime config:
```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: '*.supabase.co' },
    ],
  },
  // Prevents Prisma from being bundled for edge
  serverExternalPackages: ['@prisma/client'],
}
```

### Supabase for Vercel
- Use **connection pooling URL** (pgBouncer port 6543) for `DATABASE_URL` — required for serverless
- Use **direct URL** (port 5432) for `DIRECT_URL` — required for Prisma migrations only
- Both URLs found in Supabase dashboard → Settings → Database → Connection string

### Environment Variables on Vercel
Set in Vercel project settings → Environment Variables (all environments unless noted):
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL                    # pooled connection string
DIRECT_URL                      # direct connection string (used in prisma.config.ts)

# Stripe
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY

# Resend
RESEND_API_KEY
RESEND_FROM_EMAIL

# App
NEXT_PUBLIC_APP_URL             # set to https://<your-vercel-domain>.vercel.app
```

### Stripe Webhook Setup for Production
After deploying to Vercel:
1. Go to Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://<your-domain>/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in Vercel

### prisma.config.ts — use DIRECT_URL for migrations
```typescript
import path from 'node:path'
import type { PrismaConfig } from 'prisma'

export default {
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      const { Pool } = await import('pg')
      const pool = new Pool({ connectionString: process.env.DIRECT_URL })
      return new PrismaPg(pool)
    },
  },
} satisfies PrismaConfig
```

### CI/CD via Vercel GitHub Integration
- Connect GitHub repo to Vercel project
- Every push to `main` auto-deploys to production
- PR previews deployed automatically on each branch push
- Run `npx prisma migrate deploy` in build command: `prisma migrate deploy && next build`

### `package.json` build script
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```
`postinstall` ensures Prisma Client is generated after `npm install` in Vercel build.

---

## Verification

1. **Auth**: Create account → redirected to dashboard → sign out → redirected to login
2. **Free ATS**: Create org → create job → add candidate → upload resume → move candidate through kanban stages manually
3. **AI gate**: On FREE plan, all AI buttons show upgrade prompt with HTTP 402 from API
4. **Stripe**: Click upgrade → Stripe checkout → complete → `Organization.plan = PRO` in DB → AI features now accessible
5. **AI features**: On PRO plan, parse resume → candidate fields auto-filled; score candidate against job requirements → score displayed on kanban card
6. **Cancellation**: Cancel via Stripe portal → webhook fires → plan set back to FREE → AI features locked again
