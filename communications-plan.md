# Communications Feature Plan

## Overview

Add a per-candidate **Communications** section that logs every AI-drafted email, lets users compose new ones, and optionally saves a draft as a reusable `EmailTemplate`. This turns Draft Email from a stateless modal into a proper outreach history.

---

## Current State

- `EmailTemplate` model exists — stores org-level reusable templates (name, type, subject, body)
- Draft Email is a modal inside each per-application AI section in `CandidateDetailClient.tsx`
- The modal calls `POST /api/ai/draft-email` (5 cr) and returns `{ subject, body }`
- Nothing is persisted — closing the modal loses the draft

---

## Goal

- A **Communications** panel on the candidate profile showing a chronological log of all drafted emails
- Each entry shows: type badge, subject, timestamp, which job it was for, and the body (expandable)
- A **"Compose"** button at the top of the panel opens the existing modal (job selector + type + context + generate)
- After generating, user can **Copy**, **Save as Template**, or **Log & Close** (saves to history without sending)
- Remove the Draft Email section from the per-application AI cards

---

## Database

### New model: `Communication`

```prisma
model Communication {
  id             String            @id @default(cuid())
  candidateId    String
  candidate      Candidate         @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  organizationId String
  organization   Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  jobId          String?
  job            Job?              @relation(fields: [jobId], references: [id], onDelete: SetNull)
  type           EmailType
  subject        String
  body           String            @db.Text
  authorId       String            // userId of who generated it
  createdAt      DateTime          @default(now())

  @@index([candidateId])
  @@index([organizationId])
}

enum EmailType {
  OUTREACH
  INTERVIEW_INVITE
  FOLLOW_UP
  OFFER
  REJECTION
}
```

> Note: Prisma already has a string-union `EmailType` defined in `email-drafter.ts` on the TS side. Add the DB enum to match.

### Migration

```sql
CREATE TYPE "EmailType" AS ENUM ('OUTREACH', 'INTERVIEW_INVITE', 'FOLLOW_UP', 'OFFER', 'REJECTION');

CREATE TABLE "Communication" (
  "id"             TEXT NOT NULL PRIMARY KEY,
  "candidateId"    TEXT NOT NULL REFERENCES "Candidate"("id") ON DELETE CASCADE,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "jobId"          TEXT REFERENCES "Job"("id") ON DELETE SET NULL,
  "type"           "EmailType" NOT NULL,
  "subject"        TEXT NOT NULL,
  "body"           TEXT NOT NULL,
  "authorId"       TEXT NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Communication_candidateId_idx" ON "Communication"("candidateId");
CREATE INDEX "Communication_organizationId_idx" ON "Communication"("organizationId");
```

### Schema relations to add

- `Candidate` → `communications Communication[]`
- `Organization` → `communications Communication[]`
- `Job` → `communications Communication[]`

---

## API Changes

### Update `POST /api/ai/draft-email`

After generating, **save a `Communication` record** and return it alongside the email:

```ts
// Additional fields in request body:
{ type, candidateId, jobId, additionalContext, saveToHistory: boolean }

// After draftEmail() resolves:
const communication = await db.communication.create({
  data: {
    candidateId,
    organizationId: orgId,
    jobId: jobId ?? null,
    type: type.toUpperCase(),  // match DB enum
    subject: result.subject,
    body: result.body,
    authorId: userId,          // get from session
  }
});

return { ...result, communicationId: communication.id };
```

### New `DELETE /api/communications/[id]`

Lets users delete a logged communication (owner org check required).

### New `POST /api/communications/[id]/save-as-template`

Takes a `Communication` record and creates an `EmailTemplate` from it:

```ts
const comm = await db.communication.findFirstOrThrow({
  where: { id, organizationId: orgId }
});

await db.emailTemplate.create({
  data: {
    organizationId: orgId,
    name: `${comm.type} — ${jobTitle}`,
    type: 'CUSTOM',
    subject: comm.subject,
    body: comm.body,
  }
});
```

---

## UI Changes

### `CandidateDetailClient.tsx`

**Remove** the Draft Email section from the per-application AI cards (the `<div>` with `<Mail>` icon and "Compose" button).

**Add** a new `Communications` panel below the Applications section (or as a top-level panel in the profile column):

```
┌─────────────────────────────────────────────────────┐
│ COMMUNICATIONS                    [✉ Compose  5 cr] │
├─────────────────────────────────────────────────────┤
│ ● INTERVIEW INVITE · Senior Software Engineer        │
│   Subject: Invitation to Interview at Acme           │
│   Mar 17, 2026 · by You              [▼] [🗑] [Save] │
│   ─────────────────────────────────────────────────  │
│   Hi Jane, we'd love to invite you to...             │
├─────────────────────────────────────────────────────┤
│ ● OUTREACH · (no job)                                │
│   Subject: Exciting opportunity at Acme              │
│   Mar 15, 2026 · by Sarah            [▼] [🗑] [Save] │
└─────────────────────────────────────────────────────┘
```

- Each entry has a colored type badge, subject, timestamp, author
- Expand/collapse body with a chevron toggle
- Delete button (own entries only — match `authorId` to `currentUserId`)
- "Save as Template" button → calls `/api/communications/[id]/save-as-template`

### Compose Modal updates

Add a **job selector** dropdown (from `candidate.applications`) so context is scoped to a role. Pre-select the job if opened from inside an application card.

After generating, show three actions:
- **Copy to clipboard** (existing)
- **Log & Close** — calls the API with `saveToHistory: true`, closes modal, refreshes communications list
- **Save as Template** — saves directly to `EmailTemplate` without logging (or log first, then save-as-template in one shot)

### Server page (`/candidates/[id]/page.tsx`)

Include `communications` in the candidate query:

```ts
communications: {
  orderBy: { createdAt: 'desc' },
  select: {
    id: true,
    type: true,
    subject: true,
    body: true,
    authorId: true,
    createdAt: true,
    job: { select: { id: true, title: true } },
  },
},
```

Pass to `CandidateDetailClient` as a new prop.

---

## Type changes

In `CandidateDetailClient`, add:

```ts
interface Communication {
  id: string;
  type: string;
  subject: string;
  body: string;
  authorId: string;
  createdAt: Date;
  job: { id: string; title: string } | null;
}
```

Add to `CandidateDetailClientProps`:
```ts
communications: Communication[];
```

---

## State

```ts
const [communications, setCommunications] = useState(initialCommunications);
const [expandedCommId, setExpandedCommId] = useState<string | null>(null);
```

On successful generate + log:
```ts
setCommunications(prev => [newComm, ...prev]);
```

On delete:
```ts
setCommunications(prev => prev.filter(c => c.id !== id));
```

---

## Email type display map

```ts
const typeLabels: Record<string, { label: string; color: string }> = {
  OUTREACH:         { label: 'Outreach',         color: 'bg-blue-50 text-blue-700' },
  INTERVIEW_INVITE: { label: 'Interview Invite',  color: 'bg-indigo-50 text-indigo-700' },
  FOLLOW_UP:        { label: 'Follow-up',         color: 'bg-gray-100 text-gray-600' },
  OFFER:            { label: 'Offer',             color: 'bg-green-50 text-green-700' },
  REJECTION:        { label: 'Rejection',         color: 'bg-red-50 text-red-700' },
};
```

---

## Files to create / modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `Communication` model + `EmailType` enum + relations |
| `prisma/migrations/YYYYMMDD_add_communications/migration.sql` | SQL migration |
| `src/app/api/ai/draft-email/route.ts` | Persist `Communication` after generation |
| `src/app/api/communications/[id]/route.ts` | `DELETE` handler |
| `src/app/api/communications/[id]/save-as-template/route.ts` | Save-as-template handler |
| `src/app/(dashboard)/candidates/[id]/page.tsx` | Include `communications` in query, pass to client |
| `src/components/candidates/CandidateDetailClient.tsx` | Add Communications panel, update Compose modal, remove Draft Email from per-app sections |

---

## Out of scope (future)

- Actually sending emails via SMTP/SendGrid (this plan only logs drafts)
- Read/unread tracking
- Bulk outreach across multiple candidates
