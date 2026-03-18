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
  {
    slug: "what-is-an-applicant-tracking-system",
    title:
      "What Is an Applicant Tracking System? A Plain-English Guide for Small Businesses",
    description:
      "A jargon-free explanation of what an ATS is, how it works, what features to expect, and when your small business actually needs one.",
    publishedAt: "2026-03-18",
    readingTime: "9 min read",
    category: "Guides",
    content: [
      {
        type: "p",
        content:
          "If you've ever lost a candidate's resume in your inbox, accidentally emailed the wrong person, or realized mid-interview that you had no idea which stage three other candidates were at — you already understand the problem an ATS solves. You just may not have known there was a name for the solution.",
      },
      {
        type: "h2",
        content: "What Is an ATS? (Simple definition, no jargon)",
      },
      {
        type: "p",
        content:
          "An applicant tracking system — ATS for short — is software that manages your hiring process from start to finish. It's the single place where your job postings live, applications come in, candidates get organized, your team collaborates, and offers go out.",
      },
      {
        type: "p",
        content:
          "The name sounds more complicated than the reality. Think of it as a CRM, but for job candidates instead of customers. Instead of tracking sales leads through a pipeline, you're tracking applicants through your hiring stages: Applied → Phone Screen → Interview → Offer → Hired.",
      },
      {
        type: "p",
        content:
          "Before ATS software became accessible to small businesses, hiring was managed through a patchwork of tools: job boards for posting, email for receiving applications, spreadsheets for tracking, and calendar apps for scheduling. An ATS replaces all of that with one system that's designed specifically for hiring.",
      },
      {
        type: "h2",
        content: "How an ATS Actually Works: The Candidate Journey",
      },
      {
        type: "p",
        content:
          "Here's what happens from the moment you post a job to the moment you make a hire, inside an ATS:",
      },
      {
        type: "ol",
        content: [
          "You create a job posting inside the ATS. The system generates a public-facing application page with a link you can share anywhere — LinkedIn, Indeed, your website, or a direct link in an email.",
          "Candidates apply through that link. Their information — name, contact details, resume, cover letter, answers to any screening questions — flows directly into the ATS.",
          "Every applicant appears in a visual pipeline. Most ATS tools use a kanban-style board: columns represent stages (Applied, Screened, Interviewed, Offer), and candidate cards move across as they progress.",
          "Your team reviews, rates, and leaves notes on each candidate inside the system. No more hunting through email threads to find out what your co-founder thought of someone.",
          "You communicate with candidates from inside the ATS, or it logs emails you send from your regular email client so there's a full history in one place.",
          "When you're ready to hire, you move the candidate to an Offer or Hired stage, and the ATS keeps the record of when and why.",
        ],
      },
      {
        type: "p",
        content:
          "The result: every person involved in your hiring — whether it's just you, or a team of five — always knows exactly where every candidate stands.",
      },
      {
        type: "h2",
        content: "What Features Does a Typical ATS Include?",
      },
      {
        type: "p",
        content:
          "ATS tools vary widely in complexity, but most include some version of these core features:",
      },
      {
        type: "ul",
        content: [
          "Job posting management: Create, publish, and close job postings. Better tools let you post to multiple job boards from one place.",
          "Application collection: A branded careers page or shareable application link that funnels candidates into your system.",
          "Candidate pipeline: A visual board showing where every candidate is in your process.",
          "Team collaboration: Multiple users can view, rate, and comment on candidates. Hiring is rarely a solo decision.",
          "Resume storage and search: Uploaded resumes are stored and searchable, so you can find past applicants when a new role opens up.",
          "Email and communication: Message candidates directly, or log communications automatically.",
          "Basic reporting: How many people applied, how long your process takes, where candidates drop off.",
        ],
      },
      {
        type: "p",
        content:
          "More advanced (and usually paid) tiers layer on features like AI resume screening, candidate scoring, structured interview kits, offer letter generation, and onboarding workflows. But for most small businesses, the core features above are all you need to get dramatically more organized.",
      },
      {
        type: "h2",
        content: "Who Uses an ATS? (Not Just Enterprise Companies)",
      },
      {
        type: "p",
        content:
          "ATS software was originally built for large companies managing thousands of applications. The early systems were expensive, complex, and required dedicated HR staff to operate. That's why small business owners often assume an ATS \"isn't for them.\"",
      },
      {
        type: "p",
        content:
          "That's no longer true. The market has shifted dramatically. Today, ATS tools exist specifically for:",
      },
      {
        type: "ul",
        content: [
          "Startups hiring their first 5–20 employees",
          "Small businesses with no dedicated HR department",
          "Recruiting agencies managing multiple client pipelines",
          "Non-profits with no budget for enterprise software",
          "Founders who are doing their own hiring",
        ],
      },
      {
        type: "p",
        content:
          "In fact, small teams often benefit more from an ATS than large enterprises do. When you have a small team and limited time, the chaos of disorganized hiring is proportionally more painful. An ATS gives you enterprise-level organization without enterprise-level complexity or cost.",
      },
      {
        type: "h2",
        content: "Free ATS vs. Paid ATS: What's the Real Difference?",
      },
      {
        type: "p",
        content:
          "There are genuinely free ATS tools on the market — not just free trials, but permanently free products with no credit card required. The difference between free and paid typically comes down to AI-powered features, not core functionality.",
      },
      {
        type: "p",
        content:
          "A good free ATS will give you unlimited job postings, unlimited candidates, unlimited users, and a visual pipeline. That's enough to run a professional hiring process for most small businesses.",
      },
      {
        type: "p",
        content:
          "Paid tiers typically add things like:",
      },
      {
        type: "ul",
        content: [
          "AI resume screening that automatically scores candidates against your job requirements",
          "Candidate ranking so you know who to prioritize reviewing first",
          "AI-generated job descriptions that save hours of writing",
          "Smart email drafting for outreach, rejections, and offers",
          "Salary benchmarking to make competitive offers",
        ],
      },
      {
        type: "p",
        content:
          "If you're hiring occasionally — a few roles per year — a free ATS will likely cover everything you need. If you're scaling fast or want AI to help you screen and prioritize, a paid tier makes sense. For a detailed comparison of what's free versus what costs money, see our guide to free ATS software.",
      },
      {
        type: "h2",
        content: "When Is the Right Time to Get an ATS?",
      },
      {
        type: "p",
        content:
          "Most small businesses wait too long. They add an ATS only after they've already lost candidates, made a bad hire due to a disorganized process, or felt overwhelmed managing applications in their inbox.",
      },
      {
        type: "p",
        content:
          "A better rule of thumb: get an ATS before you post your first job. Here's why that makes sense:",
      },
      {
        type: "ul",
        content: [
          "Setup takes minutes, not days. Modern ATS tools are designed to be usable from day one.",
          "The habits you build on your first hire carry forward to your tenth. Starting organized is easier than getting organized after the fact.",
          "Even one job posting can attract dozens of applicants. Losing even one strong candidate to inbox chaos is a costly mistake.",
          "It's free. If the tool costs nothing, the only question is whether it makes your process better — and it will.",
        ],
      },
      {
        type: "p",
        content:
          "If you're already hiring without an ATS and tracking candidates in spreadsheets, the signs that it's time to switch are obvious: you've lost emails, you're not sure who reviewed which candidate, your team is using different tracking methods, or you're spending more time managing information than actually evaluating people.",
      },
      {
        type: "h2",
        content: "What About ATS and Job Board Integrations?",
      },
      {
        type: "p",
        content:
          "One practical question small businesses often have: do I still need to post on LinkedIn, Indeed, and other job boards if I have an ATS?",
      },
      {
        type: "p",
        content:
          "Yes — and a good ATS makes that easier, not harder. Your ATS generates a link for each job posting. You paste that link when posting on job boards. Applications from every source funnel into your ATS automatically. You get full visibility into where your best candidates are coming from, without managing separate inboxes for each channel.",
      },
      {
        type: "p",
        content:
          "Some ATS tools also integrate directly with major job boards so you can post to multiple boards in one click. This is a time-saver when you're hiring across several roles at once.",
      },
      {
        type: "h2",
        content: "How to Get Started",
      },
      {
        type: "p",
        content:
          "Getting started with an ATS is straightforward. Here's the typical path:",
      },
      {
        type: "ol",
        content: [
          "Sign up for a free account — no credit card required for tools like KiteHR.",
          "Create your first job posting. Give it a title, description, and any screening questions you want candidates to answer.",
          "Copy the application link and share it wherever you're sourcing candidates.",
          "As applications come in, review them in your pipeline, leave notes, and move candidates forward.",
          "Invite your hiring team so they can review candidates and add their own feedback.",
        ],
      },
      {
        type: "p",
        content:
          "The learning curve is minimal. If you've used a spreadsheet to track candidates before, you'll find an ATS immediately intuitive — it's just a purpose-built version of what you were already trying to do. For tips on writing the job descriptions you'll post through your ATS, browse our job description templates library. And if you're still deciding between tools, our guide to choosing the right ATS walks through the key questions.",
      },
      {
        type: "h2",
        content: "The Bottom Line",
      },
      {
        type: "p",
        content:
          "An applicant tracking system is not enterprise software dressed up for small businesses. It's a tool that solves a real, specific problem: the chaos that comes from managing hiring through email and spreadsheets. If you're hiring even one person, the right ATS will make the process faster, more organized, and less likely to result in a good candidate falling through the cracks.",
      },
      {
        type: "p",
        content:
          "The best part: you don't have to pay to find out if it works. Start free, get organized, and upgrade only if and when you need the AI features. There's no reason to wait.",
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
