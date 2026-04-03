# Signal Demo — Implementation Plan & Reference

**Branch:** `claude/homepage-demo-planning-JowVk`
**Last updated:** 2026-04-03

---

## What's been built (committed)

### 1. Homepage messaging shift (`src/app/page.tsx`)
- H1 → "Hire on **Proof**, Not Paper."
- Badge → "Introducing Signal · Free forever"
- Subtext → "KiteHR Signal replaces resume uploads with 4-minute AI skill assessments. Get your top 3 candidates in 72 hours — zero resumes required."
- Primary CTA → "Try a Demo Assessment" (currently opens `DemoModal`)
- Secondary CTA → "Start for free →" → `/signup`
- Trust indicators → `>80% interview conversion · 72hr time-to-shortlist · Zero resumes` (now `flex-wrap` for mobile)
- Right column → `SignalDemoPreview` animated loop (replaced `AiFeaturesPreview`)

### 2. `src/components/home/demo-data.ts`
- 5 demo jobs with 5 questions each (pool)
- Types: `mc` (multiple choice), `open` (free text), `style` (operating style trade-off)
- Each question has: `id`, `type`, `text`, `options`, `correctIndex`, `styleLabels?`, `dictationTranscript?`
- Exports: `demoJobs`, `getRandomizedQuestions(jobId, count = 4)`

| Job | id |
|-----|----|
| Frontend Engineer | `frontend-engineer` |
| Customer Success Manager | `customer-success` |
| Product Manager | `product-manager` |
| Sales Development Rep | `sales-dev-rep` |
| Data Analyst | `data-analyst` |

### 3. `src/components/home/DemoModal.tsx`
- Modal (using `Dialog` from `@/components/ui/dialog`) triggered from homepage
- 3-phase flow: `job-select → questions → results`
- Draws 4 random questions from pool per session
- Paste detection toast, mic/dictation simulation (1.2s delay)
- Results screen with 2 tabs:
  - **Candidate Report**: animated score ring, pass/fail banner, integrity badge, style chip, per-question breakdown
  - **Hiring Manager Report**: candidate card, collapsible Show Proof audit trail, Team Dynamics block, Approve/Archive buttons (demo toast), CTA to `/signup`

### 4. `src/components/home/SignalDemoPreview.tsx`
- Auto-advancing 4-stage animation in the hero right column
- Stages: job select → live question → candidate results → hiring manager view
- Pauses on hover, manual dot navigation
- Visual language matches DemoModal

---

## What still needs to be built

### Task 1 — Expand questions to 13 per job (`demo-data.ts`)

**Goal:** Each job needs 13 questions so the full test takes ~10 minutes (≈46s per question).

**Change `getRandomizedQuestions` → add `getAllQuestions`:**
```typescript
// New export — returns all questions shuffled (for full test)
export function getAllQuestions(jobId: string): Question[] {
  const job = demoJobs.find((j) => j.id === jobId);
  if (!job) return [];
  return [...job.questions].sort(() => Math.random() - 0.5);
}
```

**Question mix per job (13 total):**
- 9 MC questions
- 2 open-text questions
- 2 style questions

**8 new questions per job — write these in `demo-data.ts`:**

#### Frontend Engineer (8 new: fe-6 → fe-13)
| id | type | text |
|----|------|------|
| fe-6 | mc | Which CSS selector has the highest specificity? → **B: `#header` (ID selector)** |
| fe-7 | mc | `useEffect` with `[]` runs when? → **C: Once after initial render** |
| fe-8 | mc | Cumulative Layout Shift (CLS) measures: → **C: Unexpected visual shifts** |
| fe-9 | mc | Code review: O(n²) loop blocking release. You: → **B: Comment, offer to pair, don't block release if impact is low** |
| fe-10 | mc | PM says 3-day estimate must be 1 day. You: → **C: Break it down — negotiate scope** |
| fe-11 | style | You introduced a prod regression. You: → **B: Own it, blameless post-mortem, propose process changes** · styleLabels: `["Conflict-Avoider","Accountable & Growth-Oriented","Blame-Shifter","Passive"]` |
| fe-12 | open | How do you make a multi-step form accessible? · dictationTranscript: covers labels, tab order, ARIA live regions, VoiceOver/NVDA testing, visible focus indicators |
| fe-13 | mc | CSS works in Chrome/Firefox, breaks Safari. First step: → **B: Check caniuse, evaluate polyfill/fallback** |

#### Customer Success Manager (8 new: cs-6 → cs-13)
| id | type | text |
|----|------|------|
| cs-6 | mc | Customer frequently requests off-roadmap feature. You: → **B: Log request, connect with PM, set honest expectations** |
| cs-7 | mc | Champion leaves the account. You: → **B: Immediately identify new stakeholder, rebuild proactively, resurface value data** |
| cs-8 | mc | Customer emails you, bypassing their CSM. You: → **B: Handle ask, loop in CSM, clarify escalation paths** |
| cs-9 | open | How do you assess customer health / at-risk signals? · dictationTranscript: covers product usage, relationship signals, business signals, two-or-more degrading simultaneously |
| cs-10 | mc | Inherited 3 unhappy accounts. First week: → **B: Listen-only discovery calls, no commitments yet** |
| cs-11 | mc | Customer blames your product for their process failure. You: → **B: Acknowledge outcome, present context without blame, focus forward** |
| cs-12 | style | Renewal in 30 days, champion unresponsive 3 weeks. You: → **B: Multi-thread — find another stakeholder, LinkedIn, AE, value summary** · styleLabels: `["Passive Acceptance","Proactive & Multi-Threaded","Avoidant","Over-Escalator"]` |
| cs-13 | mc | What makes a QBR effective? → **B: Progress vs. success criteria, ROI data, co-create next quarter goals** |

#### Product Manager (8 new: pm-6 → pm-13)
| id | type | text |
|----|------|------|
| pm-6 | mc | Most critical element of a PRD: → **B: Success metrics that define when goal is achieved** |
| pm-7 | mc | Engineer says spec is impossible in timeline. You: → **B: Explore constraints together, update stakeholders on revised expectations** |
| pm-8 | open | Define success metrics for a new onboarding flow · dictationTranscript: covers time-to-first-value, step completion rates, day-7 retention, drop-off per step, usability tests, support tickets |
| pm-9 | style | Q3 slot: safe 8% lift vs. risky 40% lift / 30% regression risk. You: → **C: Evaluate research, technical confidence, reversibility** · styleLabels: `["Risk-Averse","Risk-Seeking","Calculated Decision-Maker","Delegator"]` |
| pm-10 | mc | Stakeholder keeps changing requirements mid-sprint. You: → **B: Change request process — changes enter next sprint unless critical blockers** |
| pm-11 | mc | User research says Feature X; data shows Feature Y drives retention. You: → **C: Qual tells you "why", quant tells you "what" — use both** |
| pm-12 | mc | Inherited messy backlog of 200 items. Approach: → **C: Lightweight scoring session, archive anything with no clear owner** |
| pm-13 | mc | Post-launch: 40% adoption vs. 70% expected. You: → **C: Segment adopters vs. non-adopters, identify friction** |

#### Sales Development Rep (8 new: sdr-6 → sdr-13)
| id | type | text |
|----|------|------|
| sdr-6 | mc | Prospect says "not in budget." You: → **B: Explore if it's real or unclear ROI — ask about current spend on the problem** |
| sdr-7 | mc | 5 voicemails, no callback. You: → **B: Try different channel/angle, or re-sequence in 60 days** |
| sdr-8 | mc | Discovery call: clearly not a fit. You: → **B: Be honest, end respectfully, document why** |
| sdr-9 | mc | Best time to reach B2B prospects: → **B: Tue–Thu, 10–11am or 4–5pm** |
| sdr-10 | open | Prospect says "we already use a competitor." Write your response. · dictationTranscript: acknowledges value, asks about gaps, doesn't oversell, offers 15-minute call |
| sdr-11 | mc | 12 deals stuck 45+ days. You: → **B: Pipeline scrub — identify last meaningful next step, re-engage or close-out** |
| sdr-12 | style | Manager gives harsh call coaching feedback. You: → **B: Ask for examples, request co-call, implement one change at a time** · styleLabels: `["Defensive","Coachable & Deliberate","Resistant","Avoider"]` |
| sdr-13 | mc | Strong interest, asked for proposal, now 10 days silent. You: → **B: Value-add follow-up with close question, set final breakup email date** |

#### Data Analyst (8 new: da-6 → da-13)
| id | type | text |
|----|------|------|
| da-6 | mc | p-value of 0.03 means: → **C: 3% probability of observing this result if null hypothesis were true** |
| da-7 | mc | Found error in report already sent to leadership. You: → **C: Immediately notify, provide corrected version with explanation** |
| da-8 | mc | SQL: when to prefer JOIN over subquery? → **B: When referencing multiple columns from related table — better optimization** |
| da-9 | style | You present data-backed conclusion; senior stakeholder strongly disagrees. You: → **B: Walk through methodology, ask for specific counter-evidence, investigate together** · styleLabels: `["People-Pleaser","Principled & Collaborative","Deferential","Escalator"]` |
| da-10 | mc | Dashboard for VP with no data background. Approach: → **B: 3–5 KPIs tied to their decisions, plain language, designed for their question** |
| da-11 | mc | Strong correlation between variables; stakeholder claims causation. You: → **B: Challenge the conclusion, identify confounders, propose causation study design** |
| da-12 | mc | Key column has 30% missing values. You: → **C: Investigate missingness pattern (MCAR/MAR/MNAR), choose appropriate strategy, document** |
| da-13 | open | How do you validate a new third-party data source before using it in production? · dictationTranscript: covers methodology review, cross-validation, schema stability, parallel run, lineage documentation |

---

### Task 2 — Job selection page (`src/app/demo/page.tsx`)

**Server component. Route: `/demo`**

Layout:
- Simple header: KiteHR logo (link to `/`) + "Signal Demo" label
- Hero: "Experience a Signal Micro-Audition" headline + short blurb
- 5 job cards (2-col grid on desktop, 1-col on mobile)
- Each card: emoji icon, job title, tagline, `13 questions · ~10 min` badge, arrow on hover
- Clicking a card navigates to `/demo/[jobId]`
- Footer note: "No account needed · Free · Results shown immediately"
- Use `PublicNav` and `PublicFooter` from `@/components/public-layout`

```typescript
// src/app/demo/page.tsx
import { demoJobs } from "@/components/home/demo-data";
// static server component — no auth check needed
```

---

### Task 3 — Assessment page

#### 3a. Server wrapper (`src/app/demo/[jobId]/page.tsx`)
```typescript
import { notFound } from "next/navigation";
import { demoJobs } from "@/components/home/demo-data";
import { AssessmentClient } from "./AssessmentClient";

export function generateStaticParams() {
  return demoJobs.map((j) => ({ jobId: j.id }));
}

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = demoJobs.find((j) => j.id === jobId);
  if (!job) notFound();
  return <AssessmentClient job={job} />;
}
```

#### 3b. Assessment client (`src/app/demo/[jobId]/AssessmentClient.tsx`)
`"use client"` — manages all state.

**Phases:** `"intro" | "questions" | "results"`

**State:**
```typescript
phase: Phase
activeQuestions: Question[]   // all 13, shuffled on mount
currentQIndex: number         // 0-based
answers: Record<string, number | string>
timeLeft: number              // seconds, starts at 600 (10:00)
timerStarted: boolean         // timer starts when user clicks "Begin"
integrityLog: IntegrityEvent[]
activeResultTab: "candidate" | "manager"
```

**`IntegrityEvent` type:**
```typescript
type IntegrityEvent = {
  timeRemaining: string;  // e.g. "7:42"
  questionNum: number;    // 1-based
  description: string;    // "Paste detected in open-response question"
  severity: "low" | "medium" | "high";
};
```

**Timer:** `useEffect` with `setInterval(1000)`. When `timeLeft === 0`: auto-submit (advance to results phase).

**Integrity event listeners (attach on questions phase, remove on cleanup):**
```typescript
document.addEventListener("visibilitychange", ...)  // tab switch
window.addEventListener("blur", ...)                 // window focus lost
// paste events attached per-textarea in question component
```

**Scoring (scales to question count):**
```
MC correct:    8 pts
MC wrong:      0 pts
Open:          6 pts  (auto-awarded — "AI reviewed")
Style correct: 8 pts
Style wrong:   3 pts

score = Math.round((earnedPts / (questions.length * 8)) * 100)
```

**Pass threshold:** ≥ 75

**Integrity signal:**
```
High:   0 events
Medium: 1–2 events
Low:    3+ events
```

**Operating style label:** from the `styleLabels` array of whichever `style` question appears, using the selected option's index. Default: `"Results-Oriented"`.

---

**Intro screen layout:**
```
[Back to /demo]

[Job emoji + title]
"Signal Micro-Audition"

[Info row]: 13 questions · 10 minutes · Monitored session

[What's monitored list]:
• Tab and window focus events
• Paste activity in text responses
• Typing patterns

[Button] "Begin Assessment →"  (timer starts on click)
```

---

**Questions screen layout:**

```
[Sticky header]
  [← Signal]  [Job Title]  [Q X / 13]  [⏱ MM:SS]  [🔍 N events]
[Progress bar — full width, 2px, teal fill]

[Main content — max-w-2xl mx-auto px-4]
  [Question type badge]
  [Question text]
  [Answer area — MC radios OR textarea+mic]
  
[Bottom nav]
  [← Previous]          [Next → / Submit →]
```

Timer color classes:
- `> 300s`: `text-slate-600`
- `120–300s`: `text-amber-600`
- `< 120s`: `text-red-600 animate-pulse`

---

**Results screen layout (full page, same route):**

```
[PublicNav or simple header with "Back to demo" link]

[Hero]: "Your Results — [Job Title]"

[Tab bar]: "Candidate Report" | "Hiring Manager View"

--- Candidate Report tab ---
[Score ring — large, 120px]
[Pass/Fail banner]
[Badge row]: Integrity | Style chip
[Section: Question Breakdown]
  — per-question rows (same as DemoModal)
[Integrity Log section]:
  Table: Time Remaining | Question | Event | Severity
  (empty state: "No integrity events logged")
[CTA]: "Start hiring on proof →" → /signup

--- Hiring Manager View tab ---
[Candidate summary card]: score, integrity, style
[Show Proof audit trail]: expandable per question
[Team Dynamics]: complementary skills + friction warning (illustrative)
[Action buttons]: Approve | Archive (both → "Sign up to use real workflows" toast)
[CTA]: "Build this pipeline →" → /signup
```

---

### Task 4 — Update homepage CTA (`src/app/page.tsx`)

Replace `<DemoModal />` with a `<Link>` to `/demo`:

```tsx
// Remove:
import { DemoModal } from "@/components/home/DemoModal";
// ...
<DemoModal />

// Add:
<Link
  href="/demo"
  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-7 py-3.5 text-base font-bold text-white hover:bg-teal-800 transition-all active:scale-95"
>
  Try a Demo Assessment
  <ArrowRight className="h-4 w-4" />
</Link>
```

---

## File map — what exists vs. what to create

| File | Status |
|------|--------|
| `src/app/page.tsx` | ✅ Exists — needs CTA swap |
| `src/components/home/demo-data.ts` | ✅ Exists — needs 8 new Qs per job + `getAllQuestions()` |
| `src/components/home/DemoModal.tsx` | ✅ Exists — no longer used from homepage after Task 4 |
| `src/components/home/SignalDemoPreview.tsx` | ✅ Exists — no changes needed |
| `src/app/demo/page.tsx` | ❌ Create — job selection |
| `src/app/demo/[jobId]/page.tsx` | ❌ Create — server wrapper |
| `src/app/demo/[jobId]/AssessmentClient.tsx` | ❌ Create — full assessment client |

---

## Key conventions to follow

- `PublicNav` / `PublicFooter` from `@/components/public-layout` on all public pages
- Background: `bg-white`, text: `text-slate-900` (light design system post-#126)
- Primary teal: `bg-teal-700 hover:bg-teal-800`
- All CTAs → `/signup`, never `/login`
- No `export const dynamic = "force-dynamic"` on public pages
- Timer uses `useEffect` + `setInterval` — always clear interval on cleanup
- Event listeners (visibilitychange, blur) — always remove on cleanup

---

## Testing checklist (post-implementation)

- [ ] `/demo` loads — 5 job cards visible, no auth required
- [ ] Clicking "Frontend Engineer" → `/demo/frontend-engineer`
- [ ] Intro screen shows with job title + "Begin Assessment" button
- [ ] Timer starts (10:00) on Begin click
- [ ] 13 questions shown, one at a time
- [ ] Progress bar + Q X/13 counter update correctly
- [ ] MC: selecting option enables Next; previous selection preserved on back-nav
- [ ] Open: typing enables Next; mic button fills transcript after 1.2s
- [ ] Paste in textarea → integrity event logged + toast shown
- [ ] Tab away from window → integrity event logged
- [ ] Timer < 2 min → turns red + pulses
- [ ] Timer hits 0:00 → auto-submits (transitions to results)
- [ ] Results: score ring animates to final value
- [ ] Results: Integrity log table shows all events (or "none" empty state)
- [ ] Results: both tabs render correctly
- [ ] Results: Approve/Archive buttons show toast, not redirect
- [ ] All CTAs → `/signup`
- [ ] Homepage "Try a Demo Assessment" → `/demo` (not modal)
- [ ] Mobile: header doesn't overflow, progress bar visible, textarea usable
- [ ] Invalid jobId (e.g. `/demo/fake-job`) → 404
