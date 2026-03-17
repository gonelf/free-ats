export type SegmentData = {
  slug: string;
  name: string;
  headline: string;
  subheadline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  painPoints: { title: string; description: string }[];
  benefits: { title: string; description: string }[];
  testimonialQuote?: string;
  testimonialAuthor?: string;
};

export const segmentsData: Record<string, SegmentData> = {
  startups: {
    slug: "startups",
    name: "Startups",
    headline: "The free ATS built for fast-moving startups",
    subheadline: "Hire your first 10 — or your first 100. KiteHR scales with you.",
    description:
      "Startups need to move fast, keep costs low, and build a great team. KiteHR is a free applicant tracking system with no per-seat pricing, no job post limits, and optional AI when you're ready to scale.",
    metaTitle: "Free ATS for Startups — KiteHR",
    metaDescription:
      "KiteHR is the free applicant tracking system for startups. Unlimited jobs, candidates, and users — no credit card, no per-seat pricing. Add AI for $49/mo.",
    painPoints: [
      {
        title: "Can't justify expensive ATS tools",
        description:
          "Enterprise ATS products cost thousands per year. KiteHR's core recruiting tool is free forever — so you can invest that budget in your first hires.",
      },
      {
        title: "Team is too small for per-seat pricing",
        description:
          "Most ATS tools charge per recruiter seat. KiteHR has unlimited users — founders, HR, hiring managers, all included.",
      },
      {
        title: "Hiring in bursts, not constantly",
        description:
          "Startups hire in waves. You shouldn't pay for a tool you're not using. KiteHR is free when you're slow and powerful when you're scaling.",
      },
    ],
    benefits: [
      {
        title: "Free forever for core ATS",
        description:
          "Post jobs, track candidates, manage your pipeline, and collaborate with your team — all free. No credit card, no time limits.",
      },
      {
        title: "Unlimited everything from day one",
        description:
          "No limits on users, job posts, candidates, or pipelines. Add everyone who needs access without worrying about seat costs.",
      },
      {
        title: "AI when you need it",
        description:
          "When hiring picks up, add AI resume parsing, candidate scoring, and job description generation for $49/mo — not per seat.",
      },
      {
        title: "Set up in minutes",
        description:
          "No implementation project, no onboarding call required. Create an account, post a job, and start reviewing candidates today.",
      },
    ],
  },
  "small-business": {
    slug: "small-business",
    name: "Small Businesses",
    headline: "Recruiting software that doesn't punish small teams",
    subheadline: "All the ATS features you need. None of the per-seat fees.",
    description:
      "Small businesses hire steadily but don't need enterprise complexity or enterprise pricing. KiteHR is a full-featured ATS that's free forever — with unlimited users and job posts from day one.",
    metaTitle: "Free ATS for Small Business — KiteHR",
    metaDescription:
      "KiteHR is the best free ATS for small businesses. Unlimited users, jobs, and candidates — no per-seat pricing, no contracts. Optional AI at $49/mo.",
    painPoints: [
      {
        title: "Per-seat pricing kills the budget",
        description:
          "Adding a recruiter, an HR manager, and hiring managers quickly inflates your ATS bill. KiteHR charges nothing per seat — ever.",
      },
      {
        title: "Overpaying for features you don't use",
        description:
          "Enterprise ATS tools are packed with features built for 500-person recruiting teams. KiteHR keeps it simple and focused.",
      },
      {
        title: "Hard to get the whole team involved",
        description:
          "When seats are expensive, only one or two people use the ATS. Everyone else gets left out of the loop.",
      },
    ],
    benefits: [
      {
        title: "Truly unlimited users",
        description:
          "Every manager, recruiter, and team lead gets access without adding to your bill. Collaborate openly across the team.",
      },
      {
        title: "Unlimited job posts",
        description:
          "Post every open role — full-time, part-time, seasonal — with no per-job fees or slot limits.",
      },
      {
        title: "Simple pipeline management",
        description:
          "Drag-and-drop kanban board with custom stages. See every candidate's status at a glance without spreadsheet gymnastics.",
      },
      {
        title: "No contracts, no lock-in",
        description:
          "KiteHR is free forever for core features. Upgrade to Pro month-to-month when you want AI — cancel anytime.",
      },
    ],
  },
  nonprofits: {
    slug: "nonprofits",
    name: "Nonprofits",
    headline: "Free recruiting software for mission-driven organizations",
    subheadline: "Spend your budget on your mission. Let KiteHR handle hiring — free.",
    description:
      "Nonprofits often have high hiring needs and tight budgets. KiteHR's completely free ATS gives you unlimited job posts, users, and candidates — with professional-grade tools at no cost.",
    metaTitle: "Free ATS for Nonprofits — KiteHR",
    metaDescription:
      "KiteHR is a free applicant tracking system for nonprofits. Unlimited jobs, candidates, and team members — no cost, no contracts. Perfect for mission-driven orgs.",
    painPoints: [
      {
        title: "Can't justify software costs",
        description:
          "Every dollar spent on software is a dollar not spent on your mission. KiteHR is free — genuinely, permanently, no strings attached.",
      },
      {
        title: "High volunteer and staff turnover",
        description:
          "Nonprofits often hire or onboard frequently. An ATS that charges per hire or per user gets expensive fast.",
      },
      {
        title: "Multiple departments hiring at once",
        description:
          "Program managers, operations, development — everyone's hiring. KiteHR supports unlimited users and jobs across your whole organization.",
      },
    ],
    benefits: [
      {
        title: "Completely free — always",
        description:
          "No trial period. No freemium limitations. KiteHR's core ATS is free forever — for as many users, jobs, and candidates as you need.",
      },
      {
        title: "Collaborative hiring",
        description:
          "Add every hiring manager, program director, and volunteer coordinator. Unlimited users means no one is left out.",
      },
      {
        title: "Email templates for consistent outreach",
        description:
          "Build a library of templates for acknowledgment emails, interview invites, and rejections — so every applicant gets a professional response.",
      },
      {
        title: "Optional AI for high-volume hiring",
        description:
          "When you're hiring for many roles at once, AI resume parsing and scoring can save your team hours. Available on Pro for $49/mo.",
      },
    ],
  },
  agencies: {
    slug: "agencies",
    name: "Recruitment Agencies",
    headline: "ATS for recruiters who hire for multiple clients",
    subheadline: "Manage unlimited clients, jobs, and candidates — all from one workspace.",
    description:
      "Recruitment agencies need an ATS that scales without scaling costs. KiteHR's free plan supports unlimited organizations, jobs, and candidates — ideal for agencies running concurrent searches.",
    metaTitle: "Free ATS for Recruitment Agencies — KiteHR",
    metaDescription:
      "KiteHR is a free ATS for recruitment agencies. Manage unlimited jobs, candidates, and clients — no per-seat pricing. Optional AI features at $49/mo.",
    painPoints: [
      {
        title: "Per-seat pricing kills margins",
        description:
          "Agency teams grow with clients. An ATS that charges per recruiter eats directly into your margin — KiteHR is unlimited users.",
      },
      {
        title: "Juggling multiple client pipelines",
        description:
          "Agencies run multiple simultaneous searches. KiteHR's unlimited jobs and pipelines let you track every search without limits.",
      },
      {
        title: "Scaling up for busy periods",
        description:
          "Agency volume fluctuates. You shouldn't pay peak pricing during slow months — KiteHR is free for core features all the time.",
      },
    ],
    benefits: [
      {
        title: "Unlimited concurrent searches",
        description:
          "Run as many active job searches as you have — no limits on open roles, active pipelines, or candidate volume.",
      },
      {
        title: "Full team access",
        description:
          "Every recruiter, coordinator, and account manager gets full access. No per-seat fees eating into your margins.",
      },
      {
        title: "AI to accelerate placements",
        description:
          "AI resume parsing, candidate scoring, and interview question generation help recruiters move faster on every search. Available on Pro.",
      },
      {
        title: "Email templates for every stage",
        description:
          "From outreach to offer letters, build a template library your whole team can use — consistent, professional communications at scale.",
      },
    ],
  },
};

export function getSegment(slug: string): SegmentData | null {
  return segmentsData[slug] ?? null;
}

export function getAllSegmentSlugs(): string[] {
  return Object.keys(segmentsData);
}
