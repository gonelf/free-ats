export type CompetitorFeature = {
  label: string;
  kitehr: string | boolean;
  competitor: string | boolean;
};

export type PricingCalculatorConfig = {
  /** Flat monthly base cost */
  baseCost: number;
  /** Cost per hiring team seat above freeSeats */
  perSeatCost: number;
  /** Cost per active job opening above freeJobs */
  perJobCost: number;
  /** Cost per total employee (for per-employee models like BambooHR) */
  perEmployeeCost: number;
  /** Seats included in the base price */
  freeSeats: number;
  /** Active jobs included in the base price */
  freeJobs: number;
  /** Minimum monthly floor */
  minimumMonthly: number;
  /** Short note shown under competitor price estimate */
  notes: string;
  /** e.g. "Per-seat pricing" */
  billingLabel: string;
};

export type Competitor = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  pricing: {
    kitehr: string;
    competitor: string;
  };
  pricingCalculator: PricingCalculatorConfig;
  features: CompetitorFeature[];
  winReasons: { title: string; description: string }[];
};

export const competitors: Record<string, Competitor> = {
  greenhouse: {
    slug: "greenhouse",
    name: "Greenhouse",
    tagline: "KiteHR vs Greenhouse — Free ATS Comparison",
    description:
      "Greenhouse is a well-known enterprise ATS with a high price tag. KiteHR gives you the same core hiring power — unlimited everything — completely free.",
    metaTitle: "KiteHR vs Greenhouse — Free ATS Alternative",
    metaDescription:
      "Compare KiteHR and Greenhouse side by side. Get unlimited jobs, users, and candidates free forever — no per-seat pricing, no contracts.",
    pricing: {
      kitehr: "Free forever ($49/mo for AI features)",
      competitor: "Starting at $6,000–$12,000+ per year (custom pricing)",
    },
    pricingCalculator: {
      baseCost: 500,
      perSeatCost: 30,
      perJobCost: 0,
      perEmployeeCost: 0,
      freeSeats: 5,
      freeJobs: 999,
      minimumMonthly: 500,
      notes: "Estimated based on Greenhouse custom pricing. Actual cost requires a sales call.",
      billingLabel: "Custom enterprise pricing",
    },
    features: [
      { label: "Free plan", kitehr: true, competitor: false },
      { label: "Unlimited users", kitehr: true, competitor: false },
      { label: "Unlimited job posts", kitehr: true, competitor: false },
      { label: "Unlimited candidates", kitehr: true, competitor: true },
      { label: "Kanban pipeline", kitehr: true, competitor: true },
      { label: "Custom pipeline stages", kitehr: true, competitor: true },
      { label: "Team collaboration", kitehr: true, competitor: true },
      { label: "Email templates", kitehr: true, competitor: true },
      { label: "Resume storage", kitehr: true, competitor: true },
      { label: "AI resume parsing", kitehr: "Pro ($49/mo)", competitor: "Add-on (extra cost)" },
      { label: "AI job description writer", kitehr: "Pro ($49/mo)", competitor: false },
      { label: "No credit card to start", kitehr: true, competitor: false },
      { label: "Per-seat pricing", kitehr: false, competitor: true },
      { label: "Annual contracts", kitehr: false, competitor: true },
    ],
    winReasons: [
      {
        title: "No per-seat pricing",
        description:
          "Greenhouse charges per user. KiteHR is unlimited users on every plan — add your whole team for free.",
      },
      {
        title: "Actually free",
        description:
          "Greenhouse's free tier doesn't exist for serious use. KiteHR's free plan has no limits on jobs, candidates, or users — forever.",
      },
      {
        title: "AI for $49/mo flat",
        description:
          "Greenhouse's AI features are expensive add-ons. KiteHR's full AI suite is $49/mo per workspace, not per seat.",
      },
      {
        title: "No contracts or setup fees",
        description:
          "Greenhouse typically requires annual contracts. KiteHR has no contracts — start free, upgrade or cancel anytime.",
      },
    ],
  },
  workable: {
    slug: "workable",
    name: "Workable",
    tagline: "KiteHR vs Workable — Free ATS Alternative",
    description:
      "Workable charges per job post and per seat. KiteHR gives you unlimited jobs, users, and candidates — free, forever.",
    metaTitle: "KiteHR vs Workable — Free Workable Alternative",
    metaDescription:
      "Compare KiteHR and Workable. KiteHR is a free alternative to Workable with unlimited jobs, users, and candidates — plus optional AI for $49/mo.",
    pricing: {
      kitehr: "Free forever ($49/mo for AI features)",
      competitor: "$189–$628/mo depending on active jobs and seats",
    },
    pricingCalculator: {
      baseCost: 189,
      perSeatCost: 0,
      perJobCost: 35,
      perEmployeeCost: 0,
      freeSeats: 999,
      freeJobs: 2,
      minimumMonthly: 189,
      notes: "Based on Workable Starter plan. Cost scales with active job postings.",
      billingLabel: "Per-job pricing",
    },
    features: [
      { label: "Free plan", kitehr: true, competitor: false },
      { label: "Unlimited job posts", kitehr: true, competitor: false },
      { label: "Unlimited users", kitehr: true, competitor: false },
      { label: "Unlimited candidates", kitehr: true, competitor: true },
      { label: "Kanban pipeline", kitehr: true, competitor: true },
      { label: "Custom pipeline stages", kitehr: true, competitor: true },
      { label: "Team collaboration", kitehr: true, competitor: true },
      { label: "Email templates", kitehr: true, competitor: true },
      { label: "Resume storage", kitehr: true, competitor: true },
      { label: "AI job description writer", kitehr: "Pro ($49/mo)", competitor: "Pro plan" },
      { label: "AI resume parsing", kitehr: "Pro ($49/mo)", competitor: "Pro plan" },
      { label: "No credit card to start", kitehr: true, competitor: false },
      { label: "Per-job pricing", kitehr: false, competitor: true },
      { label: "Per-seat charges", kitehr: false, competitor: true },
    ],
    winReasons: [
      {
        title: "No per-job charges",
        description:
          "Workable pricing scales with active job posts. KiteHR has zero limits on job posts — post as many as you need, free.",
      },
      {
        title: "No seat limits",
        description:
          "Workable charges per user on some plans. Every KiteHR plan — including free — supports unlimited team members.",
      },
      {
        title: "Free forever, no trial",
        description:
          "Workable offers a 15-day free trial. KiteHR's core ATS is free forever with no time limits or usage caps.",
      },
      {
        title: "Flat-rate AI",
        description:
          "KiteHR Pro is $49/mo per workspace regardless of users or jobs. No scaling costs as your team grows.",
      },
    ],
  },
  lever: {
    slug: "lever",
    name: "Lever",
    tagline: "KiteHR vs Lever — Free ATS Alternative",
    description:
      "Lever is a premium ATS with enterprise pricing. KiteHR gives growing teams the same core features free — with optional AI for a fraction of the cost.",
    metaTitle: "KiteHR vs Lever — Free Lever Alternative",
    metaDescription:
      "Compare KiteHR and Lever. Get unlimited recruiting software for free — KiteHR is a modern Lever alternative with no per-seat fees and optional AI at $49/mo.",
    pricing: {
      kitehr: "Free forever ($49/mo for AI features)",
      competitor: "Starting at ~$3,500+ per year (custom enterprise pricing)",
    },
    pricingCalculator: {
      baseCost: 400,
      perSeatCost: 30,
      perJobCost: 0,
      perEmployeeCost: 0,
      freeSeats: 5,
      freeJobs: 999,
      minimumMonthly: 300,
      notes: "Estimated based on Lever pricing tiers. Requires a custom quote.",
      billingLabel: "Per-seat enterprise pricing",
    },
    features: [
      { label: "Free plan", kitehr: true, competitor: false },
      { label: "Unlimited users", kitehr: true, competitor: false },
      { label: "Unlimited job posts", kitehr: true, competitor: false },
      { label: "Unlimited candidates", kitehr: true, competitor: true },
      { label: "Kanban pipeline", kitehr: true, competitor: true },
      { label: "Custom pipeline stages", kitehr: true, competitor: true },
      { label: "Team collaboration", kitehr: true, competitor: true },
      { label: "Email templates", kitehr: true, competitor: true },
      { label: "Resume storage", kitehr: true, competitor: true },
      { label: "AI features", kitehr: "Pro ($49/mo)", competitor: "Enterprise add-on" },
      { label: "No credit card to start", kitehr: true, competitor: false },
      { label: "Annual contracts required", kitehr: false, competitor: true },
      { label: "Custom implementation fees", kitehr: false, competitor: true },
    ],
    winReasons: [
      {
        title: "No enterprise contracts",
        description:
          "Lever is primarily aimed at enterprise customers with custom contracts. KiteHR works for any team size with no contracts required.",
      },
      {
        title: "Free for small teams",
        description:
          "Lever has no meaningful free tier. KiteHR's free plan is fully-featured with no user or job limits — perfect for growing teams.",
      },
      {
        title: "Affordable AI",
        description:
          "Lever's AI capabilities are tied to expensive enterprise packages. KiteHR's full AI suite is available for $49/mo flat.",
      },
      {
        title: "Set up in minutes",
        description:
          "Lever often requires implementation support. KiteHR takes minutes to set up — no IT team required.",
      },
    ],
  },
  recruitee: {
    slug: "recruitee",
    name: "Recruitee",
    tagline: "KiteHR vs Recruitee — Free ATS Alternative",
    description:
      "Recruitee charges per job slot. KiteHR gives you unlimited job postings, candidates, and users — completely free.",
    metaTitle: "KiteHR vs Recruitee — Free Recruitee Alternative",
    metaDescription:
      "Compare KiteHR and Recruitee. KiteHR offers unlimited jobs, users, and candidates for free — no per-slot pricing, no per-seat fees.",
    pricing: {
      kitehr: "Free forever ($49/mo for AI features)",
      competitor: "$99–$399/mo depending on job slots",
    },
    pricingCalculator: {
      baseCost: 199,
      perSeatCost: 0,
      perJobCost: 40,
      perEmployeeCost: 0,
      freeSeats: 999,
      freeJobs: 3,
      minimumMonthly: 99,
      notes: "Based on Recruitee Launch plan. Cost scales with number of active job slots.",
      billingLabel: "Per-job-slot pricing",
    },
    features: [
      { label: "Free plan", kitehr: true, competitor: false },
      { label: "Unlimited job posts", kitehr: true, competitor: false },
      { label: "Unlimited users", kitehr: true, competitor: false },
      { label: "Unlimited candidates", kitehr: true, competitor: true },
      { label: "Kanban pipeline", kitehr: true, competitor: true },
      { label: "Custom pipeline stages", kitehr: true, competitor: true },
      { label: "Team collaboration", kitehr: true, competitor: true },
      { label: "Email templates", kitehr: true, competitor: true },
      { label: "Resume storage", kitehr: true, competitor: true },
      { label: "AI features", kitehr: "Pro ($49/mo)", competitor: false },
      { label: "No credit card to start", kitehr: true, competitor: false },
      { label: "Per-job-slot pricing", kitehr: false, competitor: true },
    ],
    winReasons: [
      {
        title: "No job slot limits",
        description:
          "Recruitee charges per job slot and increases cost as you hire more. KiteHR has no job slot concept — unlimited posts, forever free.",
      },
      {
        title: "Truly unlimited",
        description:
          "Recruitee limits users and jobs by plan. KiteHR has zero limits on users, jobs, or candidates on every plan.",
      },
      {
        title: "Built-in AI",
        description:
          "Recruitee has limited AI capabilities. KiteHR Pro includes 12 AI features including resume parsing, scoring, and email drafting.",
      },
      {
        title: "No-surprise pricing",
        description:
          "Recruitee costs scale with usage. KiteHR is free forever for core features, and $49/mo flat for AI — no surprises.",
      },
    ],
  },
  ashby: {
    slug: "ashby",
    name: "Ashby",
    tagline: "KiteHR vs Ashby — Free ATS Alternative",
    description:
      "Ashby is a modern ATS popular with tech startups — but it comes with a steep price tag and per-seat pricing. KiteHR gives you the same recruiting power, free.",
    metaTitle: "KiteHR vs Ashby — Free Ashby Alternative",
    metaDescription:
      "Compare KiteHR and Ashby. KiteHR is a free Ashby alternative with unlimited jobs, users, and candidates — plus optional AI for $49/mo flat.",
    pricing: {
      kitehr: "Free forever ($49/mo for AI features)",
      competitor: "Starting at $300–$600+/mo (custom pricing, requires demo)",
    },
    pricingCalculator: {
      baseCost: 400,
      perSeatCost: 35,
      perJobCost: 0,
      perEmployeeCost: 0,
      freeSeats: 5,
      freeJobs: 999,
      minimumMonthly: 300,
      notes: "Estimated based on Ashby pricing. Actual cost requires a demo and custom quote.",
      billingLabel: "Per-seat pricing (requires demo)",
    },
    features: [
      { label: "Free plan", kitehr: true, competitor: false },
      { label: "Unlimited users", kitehr: true, competitor: false },
      { label: "Unlimited job posts", kitehr: true, competitor: false },
      { label: "Unlimited candidates", kitehr: true, competitor: true },
      { label: "Kanban pipeline", kitehr: true, competitor: true },
      { label: "Custom pipeline stages", kitehr: true, competitor: true },
      { label: "Team collaboration", kitehr: true, competitor: true },
      { label: "Email templates", kitehr: true, competitor: true },
      { label: "Resume storage", kitehr: true, competitor: true },
      { label: "AI resume parsing", kitehr: "Pro ($49/mo)", competitor: "Higher-tier plans" },
      { label: "AI job description writer", kitehr: "Pro ($49/mo)", competitor: false },
      { label: "No credit card to start", kitehr: true, competitor: false },
      { label: "Per-seat pricing", kitehr: false, competitor: true },
      { label: "Sales call required to start", kitehr: false, competitor: true },
    ],
    winReasons: [
      {
        title: "No sales call required",
        description:
          "Ashby requires a demo before you can get started. KiteHR lets you sign up and start hiring in minutes — no sales process, no waiting.",
      },
      {
        title: "Actually free",
        description:
          "Ashby has no meaningful free tier. KiteHR's core ATS is free forever with unlimited jobs, users, and candidates — no trial period.",
      },
      {
        title: "Flat-rate AI, not per-seat",
        description:
          "Ashby's advanced features scale with your headcount. KiteHR Pro is $49/mo per workspace — one flat price regardless of team size.",
      },
      {
        title: "Built for every team size",
        description:
          "Ashby is designed for growth-stage companies with complex hiring ops. KiteHR works for any team — from solo founders to scaling startups — with zero overhead.",
      },
    ],
  },
  bamboohr: {
    slug: "bamboohr",
    name: "BambooHR",
    tagline: "KiteHR vs BambooHR — Free ATS Alternative",
    description:
      "BambooHR charges per employee per month, so your ATS bill grows as your team does. KiteHR gives you unlimited hiring infrastructure — always free.",
    metaTitle: "KiteHR vs BambooHR — Free BambooHR Alternative",
    metaDescription:
      "Compare KiteHR and BambooHR. KiteHR is a free BambooHR alternative with unlimited jobs, users, and candidates — no per-employee fees. Optional AI at $49/mo.",
    pricing: {
      kitehr: "Free forever ($49/mo for AI features)",
      competitor: "~$8–$12+/employee/month (tiered by headcount)",
    },
    pricingCalculator: {
      baseCost: 0,
      perSeatCost: 0,
      perJobCost: 0,
      perEmployeeCost: 10,
      freeSeats: 999,
      freeJobs: 999,
      minimumMonthly: 108,
      notes: "Based on BambooHR Core plan at ~$10/employee/month. ATS is part of the broader HRIS platform.",
      billingLabel: "Per-employee pricing",
    },
    features: [
      { label: "Free plan", kitehr: true, competitor: false },
      { label: "Unlimited users", kitehr: true, competitor: false },
      { label: "Unlimited job posts", kitehr: true, competitor: false },
      { label: "Unlimited candidates", kitehr: true, competitor: true },
      { label: "Kanban pipeline", kitehr: true, competitor: true },
      { label: "Custom pipeline stages", kitehr: true, competitor: "Limited" },
      { label: "Team collaboration", kitehr: true, competitor: true },
      { label: "Email templates", kitehr: true, competitor: true },
      { label: "Resume storage", kitehr: true, competitor: true },
      { label: "AI resume parsing", kitehr: "Pro ($49/mo)", competitor: false },
      { label: "AI job description writer", kitehr: "Pro ($49/mo)", competitor: false },
      { label: "No credit card to start", kitehr: true, competitor: false },
      { label: "Per-employee pricing", kitehr: false, competitor: true },
      { label: "HRIS required to use ATS", kitehr: false, competitor: true },
    ],
    winReasons: [
      {
        title: "No per-employee fees",
        description:
          "BambooHR charges per employee, so a 50-person company pays ~$500/mo just for the platform. KiteHR's ATS is free regardless of headcount.",
      },
      {
        title: "ATS-only, no HRIS required",
        description:
          "BambooHR bundles HR and recruiting — you pay for the whole HRIS even if you only need an ATS. KiteHR is purpose-built for hiring.",
      },
      {
        title: "Free for the full hiring workflow",
        description:
          "BambooHR requires a paid plan to use recruiting features meaningfully. KiteHR gives you unlimited jobs, candidates, and pipelines for free.",
      },
      {
        title: "Modern AI included",
        description:
          "BambooHR has limited AI capabilities. KiteHR Pro adds resume parsing, candidate scoring, and job description generation for $49/mo flat.",
      },
    ],
  },
  breezyhr: {
    slug: "breezyhr",
    name: "Breezy HR",
    tagline: "KiteHR vs Breezy HR — Free ATS Alternative",
    description:
      "Breezy HR's free plan caps you at one active position. KiteHR has no such limits — post unlimited jobs, add unlimited users, track unlimited candidates, forever free.",
    metaTitle: "KiteHR vs Breezy HR — Free Breezy HR Alternative",
    metaDescription:
      "Compare KiteHR and Breezy HR. KiteHR is a free Breezy HR alternative with truly unlimited jobs and users — no per-position limits, no per-seat fees.",
    pricing: {
      kitehr: "Free forever ($49/mo for AI features)",
      competitor: "$157–$273+/mo (limited positions on lower plans)",
    },
    pricingCalculator: {
      baseCost: 273,
      perSeatCost: 0,
      perJobCost: 0,
      perEmployeeCost: 0,
      freeSeats: 999,
      freeJobs: 999,
      minimumMonthly: 157,
      notes: "Based on Breezy HR Startup plan ($273/mo) for unlimited positions. Bootstrap plan ($157/mo) is limited to 1 position.",
      billingLabel: "Per-position or flat monthly pricing",
    },
    features: [
      { label: "Free plan", kitehr: true, competitor: "Bootstrap (1 position only)" },
      { label: "Unlimited job posts", kitehr: true, competitor: false },
      { label: "Unlimited users", kitehr: true, competitor: false },
      { label: "Unlimited candidates", kitehr: true, competitor: true },
      { label: "Kanban pipeline", kitehr: true, competitor: true },
      { label: "Custom pipeline stages", kitehr: true, competitor: true },
      { label: "Team collaboration", kitehr: true, competitor: true },
      { label: "Email templates", kitehr: true, competitor: true },
      { label: "Resume storage", kitehr: true, competitor: true },
      { label: "AI resume parsing", kitehr: "Pro ($49/mo)", competitor: "Growth plan ($399/mo)" },
      { label: "AI job description writer", kitehr: "Pro ($49/mo)", competitor: false },
      { label: "No credit card to start", kitehr: true, competitor: false },
      { label: "Per-position limits on free plan", kitehr: false, competitor: true },
    ],
    winReasons: [
      {
        title: "Unlimited jobs on free plan",
        description:
          "Breezy HR's free tier caps you at one active job. KiteHR's free plan has no limits — post every role you're hiring for.",
      },
      {
        title: "No hidden upgrade walls",
        description:
          "Breezy HR gates most useful features behind paid plans. KiteHR's core ATS is fully usable for free — pipelines, email templates, team access, all included.",
      },
      {
        title: "Flat-rate AI",
        description:
          "Breezy HR's AI features are on the $399/mo Growth plan. KiteHR's full AI suite is available for $49/mo — a fraction of the cost.",
      },
      {
        title: "Unlimited team members",
        description:
          "Breezy HR charges per seat on higher plans. KiteHR has unlimited users on every plan, including free.",
      },
    ],
  },
  jazzhr: {
    slug: "jazzhr",
    name: "JazzHR",
    tagline: "KiteHR vs JazzHR — Free ATS Alternative",
    description:
      "JazzHR limits jobs on lower plans and charges per seat. KiteHR offers unlimited jobs, users, and candidates with no caps — completely free.",
    metaTitle: "KiteHR vs JazzHR — Free JazzHR Alternative",
    metaDescription:
      "Compare KiteHR and JazzHR. KiteHR is a free JazzHR alternative with unlimited jobs, users, and candidates — no per-seat pricing, no job caps.",
    pricing: {
      kitehr: "Free forever ($49/mo for AI features)",
      competitor: "$75–$359/mo depending on jobs and features",
    },
    pricingCalculator: {
      baseCost: 249,
      perSeatCost: 15,
      perJobCost: 0,
      perEmployeeCost: 0,
      freeSeats: 3,
      freeJobs: 999,
      minimumMonthly: 75,
      notes: "Based on JazzHR Plus plan ($249/mo) with unlimited job postings. Hero plan ($75/mo) is limited to 3 open jobs.",
      billingLabel: "Per-seat + tiered by job count",
    },
    features: [
      { label: "Free plan", kitehr: true, competitor: false },
      { label: "Unlimited job posts", kitehr: true, competitor: false },
      { label: "Unlimited users", kitehr: true, competitor: false },
      { label: "Unlimited candidates", kitehr: true, competitor: true },
      { label: "Kanban pipeline", kitehr: true, competitor: true },
      { label: "Custom pipeline stages", kitehr: true, competitor: true },
      { label: "Team collaboration", kitehr: true, competitor: true },
      { label: "Email templates", kitehr: true, competitor: true },
      { label: "Resume storage", kitehr: true, competitor: true },
      { label: "AI resume parsing", kitehr: "Pro ($49/mo)", competitor: false },
      { label: "AI job description writer", kitehr: "Pro ($49/mo)", competitor: false },
      { label: "No credit card to start", kitehr: true, competitor: false },
      { label: "Per-seat pricing", kitehr: false, competitor: true },
      { label: "Job caps on lower plans", kitehr: false, competitor: true },
    ],
    winReasons: [
      {
        title: "Unlimited jobs, always",
        description:
          "JazzHR's entry plan limits you to 3 open jobs. KiteHR has no job caps — post every role you're hiring for, even on the free plan.",
      },
      {
        title: "No per-seat fees",
        description:
          "JazzHR charges per additional user on higher plans. Every KiteHR plan includes unlimited team members at no extra cost.",
      },
      {
        title: "Free, not trial",
        description:
          "JazzHR has no meaningful free plan. KiteHR is free forever — no countdown, no credit card, no bait-and-switch.",
      },
      {
        title: "Modern AI for $49/mo",
        description:
          "JazzHR has no AI features. KiteHR Pro adds AI resume parsing, candidate scoring, and job description generation for $49/mo per workspace.",
      },
    ],
  },
  smartrecruiters: {
    slug: "smartrecruiters",
    name: "SmartRecruiters",
    tagline: "KiteHR vs SmartRecruiters — Free ATS Alternative",
    description:
      "SmartRecruiters is a feature-heavy enterprise platform with complex pricing. KiteHR gives growing teams a streamlined, free ATS — no setup project, no contracts.",
    metaTitle: "KiteHR vs SmartRecruiters — Free SmartRecruiters Alternative",
    metaDescription:
      "Compare KiteHR and SmartRecruiters. KiteHR is a free SmartRecruiters alternative for small and mid-size teams — unlimited jobs, users, and candidates. No contracts.",
    pricing: {
      kitehr: "Free forever ($49/mo for AI features)",
      competitor: "Starting at $500+/mo (custom enterprise pricing)",
    },
    pricingCalculator: {
      baseCost: 500,
      perSeatCost: 25,
      perJobCost: 0,
      perEmployeeCost: 0,
      freeSeats: 5,
      freeJobs: 999,
      minimumMonthly: 500,
      notes: "Estimated based on SmartRecruiters SMB pricing. Enterprise plans require a custom quote.",
      billingLabel: "Custom enterprise pricing",
    },
    features: [
      { label: "Free plan", kitehr: true, competitor: "Limited free tier" },
      { label: "Unlimited users", kitehr: true, competitor: false },
      { label: "Unlimited job posts", kitehr: true, competitor: false },
      { label: "Unlimited candidates", kitehr: true, competitor: true },
      { label: "Kanban pipeline", kitehr: true, competitor: true },
      { label: "Custom pipeline stages", kitehr: true, competitor: true },
      { label: "Team collaboration", kitehr: true, competitor: true },
      { label: "Email templates", kitehr: true, competitor: true },
      { label: "Resume storage", kitehr: true, competitor: true },
      { label: "AI resume parsing", kitehr: "Pro ($49/mo)", competitor: "Enterprise add-on" },
      { label: "AI job description writer", kitehr: "Pro ($49/mo)", competitor: "Enterprise plan" },
      { label: "No credit card to start", kitehr: true, competitor: false },
      { label: "Per-seat pricing", kitehr: false, competitor: true },
      { label: "Complex onboarding required", kitehr: false, competitor: true },
    ],
    winReasons: [
      {
        title: "No enterprise complexity",
        description:
          "SmartRecruiters is designed for enterprise recruiting teams with complex workflows. KiteHR keeps things simple — sign up and start hiring today.",
      },
      {
        title: "Free with no limits",
        description:
          "SmartRecruiters' free tier is too limited for real use. KiteHR's free plan includes unlimited jobs, users, and candidates — no upgrade required.",
      },
      {
        title: "Flat-rate pricing",
        description:
          "SmartRecruiters costs scale with users and features. KiteHR is free for core ATS and $49/mo for AI — one simple price, no per-seat math.",
      },
      {
        title: "Start in minutes, not months",
        description:
          "SmartRecruiters often involves a multi-week implementation. KiteHR is self-serve — create an account, post a job, and start reviewing candidates today.",
      },
    ],
  },
};

export function getCompetitor(slug: string): Competitor | null {
  return competitors[slug] ?? null;
}

export function getAllCompetitorSlugs(): string[] {
  return Object.keys(competitors);
}
