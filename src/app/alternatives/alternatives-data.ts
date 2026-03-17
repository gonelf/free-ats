import type { PricingCalculatorConfig } from "@/app/vs/competitors";

export type AlternativePage = {
  slug: string;
  /** SEO meta title */
  metaTitle: string;
  /** SEO meta description */
  metaDescription: string;
  /** Page H1 */
  headline: string;
  subheadline: string;
  /** Intro paragraph */
  intro: string;
  /** Badge text in hero e.g. "Free Workable Alternative" */
  badge: string;
  /** Competitor(s) being replaced — used for calculator label */
  competitorName: string;
  /** Pre-filled calculator defaults */
  calculatorDefaults: { seats: number; jobs: number; employees: number };
  calculatorConfig: PricingCalculatorConfig;
  showEmployees: boolean;
  /** Key selling points */
  points: { title: string; description: string }[];
  /** Contextual FAQ */
  faqs: { q: string; a: string }[];
};

const workableConfig: PricingCalculatorConfig = {
  baseCost: 189,
  perSeatCost: 0,
  perJobCost: 35,
  perEmployeeCost: 0,
  freeSeats: 999,
  freeJobs: 2,
  minimumMonthly: 189,
  notes: "Based on Workable Starter plan. Cost increases with each active job posting.",
  billingLabel: "Per-job pricing",
};

const greenhouseConfig: PricingCalculatorConfig = {
  baseCost: 500,
  perSeatCost: 30,
  perJobCost: 0,
  perEmployeeCost: 0,
  freeSeats: 5,
  freeJobs: 999,
  minimumMonthly: 500,
  notes: "Estimated based on Greenhouse custom pricing. Actual cost requires a sales call.",
  billingLabel: "Custom enterprise pricing",
};

const bamboohrConfig: PricingCalculatorConfig = {
  baseCost: 0,
  perSeatCost: 0,
  perJobCost: 0,
  perEmployeeCost: 10,
  freeSeats: 999,
  freeJobs: 999,
  minimumMonthly: 108,
  notes: "Based on BambooHR Core plan at ~$10/employee/month.",
  billingLabel: "Per-employee pricing",
};

// Generic "typical ATS" config used for broad keyword pages
const typicalAtsConfig: PricingCalculatorConfig = {
  baseCost: 250,
  perSeatCost: 25,
  perJobCost: 20,
  perEmployeeCost: 0,
  freeSeats: 3,
  freeJobs: 3,
  minimumMonthly: 150,
  notes: "Based on median ATS pricing for teams your size. Actual costs vary by vendor.",
  billingLabel: "Typical ATS pricing",
};

export const alternativesData: Record<string, AlternativePage> = {
  "free-workable-alternative": {
    slug: "free-workable-alternative",
    metaTitle: "Free Workable Alternative — KiteHR ATS",
    metaDescription:
      "Looking for a free Workable alternative? KiteHR gives you unlimited jobs, users, and candidates at no cost. No per-job fees, no per-seat charges. Try free today.",
    headline: "The free Workable alternative",
    subheadline: "Unlimited jobs. Unlimited users. $0/month — forever.",
    intro:
      "Workable charges per active job and per seat, so your bill climbs every time you post a new role or add a team member. KiteHR is a modern ATS with no per-job fees, no per-seat pricing, and a genuinely free plan with no usage caps.",
    badge: "Free Workable Alternative",
    competitorName: "Workable",
    calculatorDefaults: { seats: 5, jobs: 5, employees: 30 },
    calculatorConfig: workableConfig,
    showEmployees: false,
    points: [
      {
        title: "No per-job fees",
        description:
          "Workable's Starter plan charges per active job opening. Post 5 jobs and you're already paying $189/mo+. KiteHR lets you post unlimited jobs for free — every role, every time.",
      },
      {
        title: "Unlimited team members",
        description:
          "Add recruiters, hiring managers, and department heads without watching your bill climb. Every KiteHR plan includes unlimited users.",
      },
      {
        title: "No free trial — actually free",
        description:
          "Workable gives you a 15-day trial. KiteHR's core ATS is free forever: unlimited jobs, pipeline management, email templates, and team collaboration.",
      },
      {
        title: "AI when you're ready",
        description:
          "Upgrade to KiteHR Pro for $49/mo (per workspace, not per seat) to unlock AI resume parsing, candidate scoring, and job description generation.",
      },
    ],
    faqs: [
      {
        q: "Is KiteHR really free?",
        a: "Yes. KiteHR's core ATS — unlimited jobs, candidates, users, and pipelines — is free forever. No credit card required. Pro ($49/mo per workspace) adds AI features.",
      },
      {
        q: "What's missing in the free plan compared to Workable?",
        a: "KiteHR's free plan includes everything you need to run your hiring process: job postings, a kanban pipeline, email templates, resume storage, and team collaboration. AI-powered features (resume parsing, scoring, job description writing) require the $49/mo Pro plan.",
      },
      {
        q: "Can I import my data from Workable?",
        a: "You can export your data from Workable and import candidates and job data into KiteHR. Our team can help you migrate.",
      },
    ],
  },

  "free-greenhouse-alternative": {
    slug: "free-greenhouse-alternative",
    metaTitle: "Free Greenhouse Alternative — KiteHR ATS",
    metaDescription:
      "Looking for a free Greenhouse alternative? KiteHR delivers the same core ATS power — unlimited jobs, users, and candidates — completely free. No contracts.",
    headline: "The free Greenhouse alternative",
    subheadline: "Enterprise-grade hiring. Zero-dollar price tag.",
    intro:
      "Greenhouse is powerful, but it starts at $6,000–$12,000+ per year with custom contracts and per-seat pricing. KiteHR gives your team the same core ATS capabilities — unlimited jobs, collaborative pipelines, email templates — free forever. Add AI for $49/mo when you need it.",
    badge: "Free Greenhouse Alternative",
    competitorName: "Greenhouse",
    calculatorDefaults: { seats: 8, jobs: 6, employees: 50 },
    calculatorConfig: greenhouseConfig,
    showEmployees: false,
    points: [
      {
        title: "No $6,000/year minimum",
        description:
          "Greenhouse pricing starts at thousands per year with a sales call required. KiteHR is free from day one — sign up in minutes, no demo needed.",
      },
      {
        title: "No per-seat pricing",
        description:
          "Greenhouse charges for every user. KiteHR's unlimited-user model means your whole team — recruiters, coordinators, hiring managers — is included for free.",
      },
      {
        title: "No annual contracts",
        description:
          "Greenhouse typically requires annual commitments. KiteHR is month-to-month on Pro and always free on the core plan — cancel or change anytime.",
      },
      {
        title: "AI for a fraction of the cost",
        description:
          "Greenhouse's AI features are expensive enterprise add-ons. KiteHR Pro is $49/mo flat and includes resume parsing, candidate scoring, and job description generation.",
      },
    ],
    faqs: [
      {
        q: "How does KiteHR compare to Greenhouse feature-by-feature?",
        a: "KiteHR covers the core ATS workflow: job posting, kanban pipeline, candidate profiles, email templates, resume storage, and team collaboration — all free. Greenhouse adds enterprise extras like advanced analytics, complex approval workflows, and integrations that most small-to-mid-size teams don't need.",
      },
      {
        q: "Is there a free trial?",
        a: "KiteHR doesn't have a trial — the core product is free forever. You can use it without a time limit and only upgrade to Pro ($49/mo) when you want AI features.",
      },
      {
        q: "What size company is KiteHR best for?",
        a: "KiteHR is ideal for teams of 1–500 employees who are tired of paying enterprise ATS prices. Startups, nonprofits, small businesses, and growing companies use it daily.",
      },
    ],
  },

  "free-bamboohr-alternative": {
    slug: "free-bamboohr-alternative",
    metaTitle: "Free BambooHR Alternative for Recruiting — KiteHR",
    metaDescription:
      "Replace BambooHR's ATS without the per-employee fees. KiteHR is a free applicant tracking system with unlimited jobs and users — no per-employee pricing.",
    headline: "Free BambooHR alternative for recruiting",
    subheadline: "Stop paying per employee just to track applicants.",
    intro:
      "BambooHR's ATS is bundled with an HRIS that charges per employee per month. If you just need to track hiring, you're paying for a lot more than you need. KiteHR is a focused, free ATS — unlimited jobs, candidates, and users — with no per-employee fees.",
    badge: "Free BambooHR Alternative",
    competitorName: "BambooHR",
    calculatorDefaults: { seats: 5, jobs: 4, employees: 50 },
    calculatorConfig: bamboohrConfig,
    showEmployees: true,
    points: [
      {
        title: "No per-employee pricing",
        description:
          "BambooHR charges ~$10/employee/month. A 50-person company pays $500/mo+ for the full platform. KiteHR's ATS is free regardless of headcount.",
      },
      {
        title: "ATS-only, no HRIS required",
        description:
          "BambooHR bundles recruiting into a broader HRIS. If you only need hiring tools — job postings, pipelines, candidate tracking — KiteHR is purpose-built for that.",
      },
      {
        title: "Modern AI hiring tools",
        description:
          "BambooHR's recruiting features are basic compared to dedicated ATS products. KiteHR Pro adds AI resume parsing, candidate scoring, and interview question generation for $49/mo.",
      },
      {
        title: "Unlimited team access",
        description:
          "Add every hiring manager without worrying about cost. KiteHR's unlimited-user model means no one gets locked out of the hiring process.",
      },
    ],
    faqs: [
      {
        q: "Does KiteHR replace BambooHR entirely?",
        a: "KiteHR is a dedicated ATS — it replaces the recruiting and hiring workflow of BambooHR. If you also need payroll, time tracking, or HR document management, you'd keep a separate HRIS for those functions.",
      },
      {
        q: "What's included in KiteHR's free plan?",
        a: "Unlimited job postings, candidate tracking, kanban pipeline with custom stages, email templates, resume storage, and unlimited team members — all free, forever.",
      },
      {
        q: "How does per-employee pricing hurt fast-growing teams?",
        a: "With per-employee pricing, every new hire you make increases your ATS bill. A team growing from 30 to 60 employees doubles their software cost. KiteHR's pricing never changes based on headcount.",
      },
    ],
  },

  "cheapest-ats-for-startups": {
    slug: "cheapest-ats-for-startups",
    metaTitle: "Cheapest ATS for Startups 2026 — KiteHR (Free)",
    metaDescription:
      "The cheapest ATS for startups is one that's actually free. KiteHR gives startups unlimited jobs, users, and candidates at $0/mo. No credit card required.",
    headline: "The cheapest ATS for startups",
    subheadline: "Spoiler: it's free.",
    intro:
      "Most ATS tools charge per seat, per job, or require annual contracts — none of which makes sense for a startup burning runway. KiteHR is genuinely free: unlimited job postings, unlimited users, unlimited candidates, and a full hiring pipeline. When you're ready for AI, add Pro for $49/mo flat.",
    badge: "Cheapest ATS for Startups",
    competitorName: "Typical ATS",
    calculatorDefaults: { seats: 4, jobs: 5, employees: 20 },
    calculatorConfig: typicalAtsConfig,
    showEmployees: false,
    points: [
      {
        title: "$0/mo for core hiring",
        description:
          "Post jobs, track candidates through a custom pipeline, collaborate with your team, and send email templates — all free. No credit card, no trial period.",
      },
      {
        title: "No per-seat pricing",
        description:
          "Startups add team members fast. Every plan on KiteHR includes unlimited users — founders, recruiters, engineers doing interviews — all at no extra cost.",
      },
      {
        title: "Hire your first 5 or your first 500",
        description:
          "KiteHR scales with you. The free plan is powerful enough for early-stage hiring, and Pro ($49/mo) adds AI tools when you're scaling fast.",
      },
      {
        title: "Set up in minutes, not weeks",
        description:
          "No implementation project, no onboarding call, no contract to sign. Sign up and post your first job in under 5 minutes.",
      },
    ],
    faqs: [
      {
        q: "What do most ATS tools cost for startups?",
        a: "Most ATS tools for startups range from $75/mo (JazzHR Hero) to $300+/mo (Ashby) with additional per-seat fees. Even 'affordable' options add up quickly. KiteHR's core ATS is $0.",
      },
      {
        q: "What does the $49/mo Pro plan add?",
        a: "KiteHR Pro adds AI resume parsing (extract structured data from any resume), candidate scoring (rank applicants by fit), AI job description generation, interview question suggestions, and skills gap analysis.",
      },
      {
        q: "Is KiteHR good enough for seed-stage startups?",
        a: "Yes — KiteHR was designed for lean teams moving fast. You get unlimited jobs, a drag-and-drop kanban pipeline, team collaboration, and email templates. That covers 90% of what a seed-stage startup needs.",
      },
    ],
  },

  "best-ats-for-nonprofits": {
    slug: "best-ats-for-nonprofits",
    metaTitle: "Best Free ATS for Nonprofits 2026 — KiteHR",
    metaDescription:
      "KiteHR is the best free ATS for nonprofits. Unlimited jobs, users, and candidates — no cost, no contracts. Keep your budget focused on your mission.",
    headline: "The best ATS for nonprofits",
    subheadline: "Spend your budget on your mission. Hiring is free.",
    intro:
      "Nonprofits hire frequently — staff, volunteers, contractors — but can rarely justify expensive software. KiteHR gives nonprofits a fully-featured ATS at no cost: unlimited job postings, candidate tracking, collaborative hiring pipelines, and professional email templates.",
    badge: "Best ATS for Nonprofits",
    competitorName: "Typical ATS",
    calculatorDefaults: { seats: 5, jobs: 6, employees: 40 },
    calculatorConfig: typicalAtsConfig,
    showEmployees: false,
    points: [
      {
        title: "Free — genuinely, permanently",
        description:
          "No discounts that expire, no nonprofit pricing tiers. KiteHR's core ATS is free forever for every organization, including nonprofits.",
      },
      {
        title: "Unlimited users — involve everyone",
        description:
          "Program managers, development staff, operations leads — everyone who hires can have full access. No per-seat fees to gatekeep the tool.",
      },
      {
        title: "Email templates for consistent outreach",
        description:
          "Build a library of templates for interview invitations, acknowledgment emails, and rejections — so every applicant gets a professional response.",
      },
      {
        title: "High-volume hiring support",
        description:
          "When hiring in volume (seasonal staff, AmeriCorps, major program launches), KiteHR Pro's AI resume parsing and candidate scoring help your team move faster. Just $49/mo.",
      },
    ],
    faqs: [
      {
        q: "Does KiteHR offer nonprofit discounts?",
        a: "The core ATS is free for everyone, including nonprofits — no discount needed. Pro is $49/mo per workspace, which is already far below what most tools charge nonprofits even with discounts.",
      },
      {
        q: "Can we manage volunteer recruitment alongside staff hiring?",
        a: "Yes. You can create separate job postings and pipelines for volunteer roles. KiteHR's unlimited jobs and pipelines make it easy to run multiple hiring tracks simultaneously.",
      },
      {
        q: "What if we only hire a few people per year?",
        a: "Perfect — KiteHR is free when you're not actively hiring and powerful when you are. There's no cost to keeping your account active between hiring cycles.",
      },
    ],
  },

  "ats-no-per-seat-pricing": {
    slug: "ats-no-per-seat-pricing",
    metaTitle: "ATS With No Per-Seat Pricing — KiteHR (Free)",
    metaDescription:
      "Looking for an ATS without per-seat pricing? KiteHR gives unlimited users, unlimited jobs, and unlimited candidates — free forever. No per-user fees.",
    headline: "An ATS with no per-seat pricing",
    subheadline: "Unlimited users. Unlimited jobs. Zero per-seat fees.",
    intro:
      "Per-seat pricing is the default business model for most ATS vendors — and it's a trap. Every new recruiter, every hiring manager, every coordinator you add increases your monthly bill. KiteHR charges nothing per user. Invite your whole team, free.",
    badge: "No Per-Seat Pricing ATS",
    competitorName: "Per-Seat ATS",
    calculatorDefaults: { seats: 10, jobs: 8, employees: 60 },
    calculatorConfig: {
      baseCost: 200,
      perSeatCost: 30,
      perJobCost: 0,
      perEmployeeCost: 0,
      freeSeats: 3,
      freeJobs: 999,
      minimumMonthly: 200,
      notes: "Based on typical per-seat ATS pricing at $30/user/month above 3 included seats.",
      billingLabel: "Per-seat pricing model",
    },
    showEmployees: false,
    points: [
      {
        title: "Invite everyone — no cost increase",
        description:
          "Add recruiters, HR managers, department heads, engineers who interview — everyone gets full access without adding a dollar to your bill.",
      },
      {
        title: "No seat-count math before every hire",
        description:
          "With per-seat ATS tools, every onboarding decision involves checking your license count. With KiteHR, there's no math — just invite whoever needs access.",
      },
      {
        title: "Scales without penalty",
        description:
          "Most teams grow their hiring team as they scale. Per-seat pricing means your ATS bill scales too. KiteHR stays flat — free for core ATS, $49/mo for AI — as your team doubles.",
      },
      {
        title: "AI for $49/mo total",
        description:
          "KiteHR Pro is $49/mo per workspace — not per user. A team of 15 using AI features pays the same $49 as a team of 3.",
      },
    ],
    faqs: [
      {
        q: "Which ATS tools use per-seat pricing?",
        a: "Greenhouse, Lever, Ashby, SmartRecruiters, and JazzHR all charge per seat. Workable and Recruitee charge per job or job slot. KiteHR charges neither.",
      },
      {
        q: "Are there any limits on the free plan?",
        a: "No limits on users, jobs, candidates, or pipelines. The only gating is AI features, which require the $49/mo Pro plan.",
      },
      {
        q: "What happens if I add 20 users?",
        a: "Nothing — your bill stays the same. KiteHR doesn't track or charge for user count. Add everyone who needs to be involved in hiring.",
      },
    ],
  },

  "free-recruiting-software": {
    slug: "free-recruiting-software",
    metaTitle: "Free Recruiting Software — KiteHR ATS",
    metaDescription:
      "KiteHR is truly free recruiting software. Unlimited jobs, users, and candidates. Full ATS pipeline with no credit card and no time limit. Try free today.",
    headline: "Free recruiting software that actually works",
    subheadline: "Not a trial. Not a freemium trap. Actually free.",
    intro:
      "Most \"free\" recruiting software is a trial, a severely limited freemium tier, or a lead-generation trap. KiteHR's free plan is a complete ATS: unlimited job postings, a fully configurable hiring pipeline, candidate profiles, email templates, team collaboration, and resume storage — all at $0, forever.",
    badge: "Free Recruiting Software",
    competitorName: "Typical ATS",
    calculatorDefaults: { seats: 5, jobs: 5, employees: 30 },
    calculatorConfig: typicalAtsConfig,
    showEmployees: false,
    points: [
      {
        title: "The full ATS workflow, free",
        description:
          "Job postings, kanban pipeline with custom stages, candidate profiles, resume uploads, email templates, and team collaboration — all free, all unlimited.",
      },
      {
        title: "No credit card required",
        description:
          "Sign up with your email. No payment info needed. No automatic upgrade after a trial period ends.",
      },
      {
        title: "Unlimited everything",
        description:
          "No caps on jobs, candidates, users, or pipelines. Post every open role. Track every applicant. Add every team member.",
      },
      {
        title: "Optional AI for power users",
        description:
          "When you need AI — resume parsing, candidate scoring, job description generation — upgrade to Pro for $49/mo per workspace. Cancel anytime.",
      },
    ],
    faqs: [
      {
        q: "What's the catch with KiteHR's free plan?",
        a: "There's no catch. The core ATS is free forever. We make money when teams upgrade to Pro ($49/mo) for AI features. The free plan is genuinely free and sustainable.",
      },
      {
        q: "How does KiteHR compare to free plans on paid ATS tools?",
        a: "Most ATS free tiers cap you at 1–3 jobs, 1 user, or a 14-day trial. KiteHR's free plan has no job cap, no user cap, and no time limit.",
      },
      {
        q: "Is KiteHR suitable for a company with no dedicated HR?",
        a: "Yes — KiteHR is designed for lean teams. Founders, office managers, and department heads use it without any recruiting background. Setup takes minutes.",
      },
    ],
  },

  "ats-for-small-teams": {
    slug: "ats-for-small-teams",
    metaTitle: "Best ATS for Small Teams — KiteHR (Free Under 50 Employees)",
    metaDescription:
      "KiteHR is the best ATS for small teams. Free for unlimited users and jobs — no per-seat fees that punish small hiring teams. Optional AI at $49/mo.",
    headline: "The best ATS for small teams",
    subheadline: "Under 50 employees? You shouldn't be paying for your ATS.",
    intro:
      "Small teams get the worst deal with traditional ATS pricing. You need the same features as enterprise teams — pipeline management, candidate tracking, email templates — but you're paying enterprise prices on a startup budget. KiteHR was built for small teams: full-featured, free, and simple.",
    badge: "ATS for Small Teams",
    competitorName: "Typical ATS",
    calculatorDefaults: { seats: 3, jobs: 4, employees: 25 },
    calculatorConfig: typicalAtsConfig,
    showEmployees: false,
    points: [
      {
        title: "Built for teams of 1–50",
        description:
          "KiteHR doesn't require an implementation project or a dedicated recruiter to run. It's simple enough for a founder, powerful enough for a hiring manager.",
      },
      {
        title: "No per-seat penalty",
        description:
          "Small teams wear many hats. The person who posts jobs, reviews resumes, and schedules interviews might be 3 different people — or just one. Either way, add them all for free.",
      },
      {
        title: "Set up today, hire tomorrow",
        description:
          "Create an account, post a job, and start reviewing applicants in under 10 minutes. No onboarding call, no implementation timeline.",
      },
      {
        title: "Upgrade when you need AI",
        description:
          "When you're hiring fast, AI resume parsing and candidate scoring save hours per week. Pro is $49/mo — less than most tools charge per seat.",
      },
    ],
    faqs: [
      {
        q: "What ATS features do small teams actually need?",
        a: "Job posting, a way to track candidates through stages, team collaboration, and communication templates. KiteHR includes all of these free — plus a kanban board, resume storage, and custom pipelines.",
      },
      {
        q: "What if our team grows beyond 50?",
        a: "KiteHR scales with you — no user cap means you can grow without switching tools or renegotiating pricing. The free plan stays free as your team grows.",
      },
      {
        q: "Can we use KiteHR for only one or two hires per year?",
        a: "Absolutely. There's no minimum usage requirement. Use it for one hire and come back next year — no cost, no account expiration.",
      },
    ],
  },
};

export function getAlternativePage(slug: string): AlternativePage | null {
  return alternativesData[slug] ?? null;
}

export function getAllAlternativeSlugs(): string[] {
  return Object.keys(alternativesData);
}
