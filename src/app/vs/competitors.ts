export type CompetitorFeature = {
  label: string;
  kitehr: string | boolean;
  competitor: string | boolean;
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
};

export function getCompetitor(slug: string): Competitor | null {
  return competitors[slug] ?? null;
}

export function getAllCompetitorSlugs(): string[] {
  return Object.keys(competitors);
}
