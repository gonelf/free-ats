export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  category: string;
  content: BlogSection[];
};

export type BlogSection = {
  type: "h2" | "h3" | "p" | "ul" | "ol";
  content: string | string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "free-ats-guide",
    title: "The Complete Guide to Free ATS Tools",
    description:
      "What to look for in a free applicant tracking system, which tools are genuinely free, and how to choose the right one for your team.",
    publishedAt: "2025-01-15",
    readingTime: "8 min read",
    category: "Guides",
    content: [
      {
        type: "p",
        content:
          "Most 'free' ATS tools aren't actually free. They're free trials, or they're free with so many limits they're effectively useless. Here's how to find one that actually works.",
      },
      {
        type: "h2",
        content: "What is an ATS?",
      },
      {
        type: "p",
        content:
          "An applicant tracking system (ATS) is software that helps you manage job openings and candidates. At its core, an ATS lets you post jobs, collect applications, organize candidates into hiring stages, and collaborate with your team. Instead of tracking everything in spreadsheets and email threads, an ATS centralizes your hiring process.",
      },
      {
        type: "h2",
        content: "Why most 'free' ATS tools aren't actually free",
      },
      {
        type: "p",
        content:
          "Free tiers from established ATS vendors usually come with significant restrictions. Common limitations include:",
      },
      {
        type: "ul",
        content: [
          "Maximum of 1–3 active job posts",
          "Maximum of 2–5 users",
          "A cap on total candidate records",
          "No team collaboration features",
          "Forced upgrade after 14–30 days",
          "Watermarked job listings",
        ],
      },
      {
        type: "p",
        content:
          "These restrictions mean most free tiers are designed to convert you to a paid plan, not actually serve your hiring needs.",
      },
      {
        type: "h2",
        content: "What to look for in a genuinely free ATS",
      },
      {
        type: "p",
        content:
          "A free ATS worth using should include these things at no cost:",
      },
      {
        type: "ul",
        content: [
          "Unlimited job postings — you shouldn't pay more because you're hiring more",
          "Unlimited users — your whole team should be able to access the tool",
          "Unlimited candidates — no caps on applicant volume",
          "A visual pipeline — kanban-style boards make it easy to see where everyone is",
          "Resume storage — candidates should be able to submit resumes you can store and search",
          "Team collaboration — notes, comments, and shared access across your hiring team",
        ],
      },
      {
        type: "h2",
        content: "When to consider paying for an ATS",
      },
      {
        type: "p",
        content:
          "Once the core ATS is working for you, the next upgrade worth considering is AI features. Specifically:",
      },
      {
        type: "ul",
        content: [
          "AI resume parsing: automatically extract candidate data from uploaded resumes, saving hours of manual entry",
          "Candidate scoring: rank applicants by fit score so you know who to prioritize",
          "Job description generation: write compelling job posts in seconds from a title",
          "AI email drafting: generate outreach, rejection, and offer emails for each candidate",
        ],
      },
      {
        type: "p",
        content:
          "These features save meaningful time — but they're only worth paying for once your free ATS is working well. Don't pay for AI until you've built a solid baseline process.",
      },
      {
        type: "h2",
        content: "How KiteHR approaches this",
      },
      {
        type: "p",
        content:
          "KiteHR's free plan includes unlimited jobs, candidates, users, and pipelines — no time limits, no usage caps, no credit card required. AI features are available for $49/mo per workspace when you're ready to level up. The goal: a free ATS that's genuinely useful, with optional AI acceleration on top.",
      },
    ],
  },
  {
    slug: "how-to-choose-ats",
    title: "How to Choose an ATS for Your Team",
    description:
      "A practical framework for evaluating applicant tracking systems — what questions to ask, what to avoid, and how to get your team to actually use it.",
    publishedAt: "2025-02-03",
    readingTime: "6 min read",
    category: "Guides",
    content: [
      {
        type: "p",
        content:
          "Picking the wrong ATS is expensive — not just in dollars, but in time. A tool your team doesn't use, or that doesn't fit your process, creates more work, not less. Here's how to make a good choice.",
      },
      {
        type: "h2",
        content: "Start with your actual needs",
      },
      {
        type: "p",
        content:
          "Before evaluating any tool, answer these questions about your current hiring process:",
      },
      {
        type: "ul",
        content: [
          "How many jobs do you typically have open at once?",
          "How many people are involved in hiring decisions?",
          "Do you get high volume of applicants, or a trickle?",
          "What's your current biggest pain point — organization, communication, speed, or all three?",
          "Do you need integrations with other tools (Slack, Google Calendar, HRIS)?",
        ],
      },
      {
        type: "p",
        content:
          "Your answers will narrow the field quickly. A 5-person startup with 2–3 open roles has different needs than a 200-person company hiring 50 people a year.",
      },
      {
        type: "h2",
        content: "The questions every vendor will avoid answering",
      },
      {
        type: "p",
        content:
          "ATS vendors are experts at showing you demos that look great. Push them on specifics:",
      },
      {
        type: "ul",
        content: [
          "What's the per-seat price, and how does it scale?",
          "Are there limits on job posts, candidates, or storage?",
          "What's the contract term and cancellation policy?",
          "What features are add-ons vs. included?",
          "What does the pricing look like in 12 months if we grow by X users?",
        ],
      },
      {
        type: "h2",
        content: "Red flags to watch for",
      },
      {
        type: "ul",
        content: [
          "Per-seat pricing that doesn't have a ceiling",
          "Annual contracts required from the start",
          "Free trials shorter than 14 days",
          'Key features labeled as "Enterprise" or "Contact us"',
          "Setup fees or implementation requirements for a basic plan",
          "Data export restrictions if you want to leave",
        ],
      },
      {
        type: "h2",
        content: "How to get your team to actually use it",
      },
      {
        type: "p",
        content:
          "The best ATS in the world is worthless if your team works around it. A few things that help with adoption:",
      },
      {
        type: "ul",
        content: [
          "Choose simplicity over features — a tool your team understands beats a powerful one nobody uses",
          "Get hiring managers into the tool early — not just recruiters",
          "Make the tool part of your process, not an addition to it — if email is the fallback, the ATS won't stick",
          "Start with one job and get the workflow right before rolling it out broadly",
        ],
      },
      {
        type: "h2",
        content: "Our recommendation",
      },
      {
        type: "p",
        content:
          "For most small teams, start free. Use a tool like KiteHR that offers a genuinely unlimited free tier — no trial period, no artificial limits. Get your process working, then evaluate whether AI features are worth the upgrade. Don't pay for a tool until you've proven it works for your team.",
      },
    ],
  },
  {
    slug: "ats-vs-spreadsheets",
    title: "ATS vs. Spreadsheets: Why You Need Proper Candidate Management",
    description:
      "Spreadsheets can work for your first few hires. Here's when they break — and what an ATS actually solves that Excel can't.",
    publishedAt: "2025-02-20",
    readingTime: "5 min read",
    category: "Hiring Tips",
    content: [
      {
        type: "p",
        content:
          "Almost every hiring team starts with a spreadsheet. It's fast, familiar, and free. For two or three roles, it works fine. But there's a point where spreadsheets start costing more time than they save.",
      },
      {
        type: "h2",
        content: "What spreadsheets do well",
      },
      {
        type: "p",
        content:
          "Spreadsheets are flexible, fast to set up, and require no training. For a very small team doing occasional hiring, a Google Sheet with columns for name, role, status, and notes can do the job.",
      },
      {
        type: "h2",
        content: "Where spreadsheets break down",
      },
      {
        type: "ul",
        content: [
          "Multiple people editing at once — version conflicts, accidental overwrites, stale data",
          "Tracking more than a few candidates — rows get unwieldy, sorting breaks, context disappears",
          "Following up — there's no built-in reminder, status tracking, or pipeline view",
          "Sharing context — a new hiring manager has to read every row to understand where things stand",
          "Resumes — you end up with a folder full of files disconnected from your tracking sheet",
          "Compliance — no audit trail, no structured data, harder to show a consistent process",
        ],
      },
      {
        type: "h2",
        content: "What an ATS actually solves",
      },
      {
        type: "p",
        content: "A good ATS addresses the specific failure modes of spreadsheets:",
      },
      {
        type: "ul",
        content: [
          "A visual pipeline shows every candidate's status at a glance — no scrolling through rows",
          "Candidates are attached to jobs — context is always there without reading back through notes",
          "Resumes, notes, and emails are stored together — no more hunting through folders",
          "The whole team sees the same data in real time — no version conflicts",
          "You can see movement — who advanced, who was rejected, how long each stage takes",
        ],
      },
      {
        type: "h2",
        content: "The right time to switch",
      },
      {
        type: "p",
        content:
          "If any of these are true, it's time to move off spreadsheets:",
      },
      {
        type: "ul",
        content: [
          "You have more than one person involved in hiring decisions",
          "You're managing more than 5 open roles at a time",
          "You've lost track of a candidate because of a spreadsheet mix-up",
          "You're emailing candidates from your personal inbox instead of a shared template",
          "You can't easily answer 'where is this candidate in our process?'",
        ],
      },
      {
        type: "h2",
        content: "The switch is easier than you think",
      },
      {
        type: "p",
        content:
          "Modern ATS tools — including KiteHR — are designed to be set up in minutes, not weeks. You don't need an IT team, an implementation project, or a long-term contract. Sign up, create your first job, and start moving candidates. Your spreadsheet habits will translate directly — there's just a better interface for them.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | null {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
