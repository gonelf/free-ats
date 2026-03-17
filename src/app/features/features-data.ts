export type FeatureData = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  plan: "free" | "pro";
  heroIcon: string;
  benefits: { title: string; description: string }[];
  howItWorks: string[];
  relatedFeatures: string[];
};

export const featuresData: Record<string, FeatureData> = {
  "ai-resume-parsing": {
    slug: "ai-resume-parsing",
    name: "AI Resume Parsing",
    tagline: "Instantly extract candidate data from any resume",
    description:
      "Upload a PDF or paste resume text and KiteHR's AI automatically fills in name, contact info, work history, skills, and education — in seconds.",
    metaTitle: "AI Resume Parsing — KiteHR",
    metaDescription:
      "Auto-fill candidate profiles from resumes with AI. KiteHR's resume parser extracts skills, experience, and contact info instantly. Pro feature — $49/mo.",
    plan: "pro",
    heroIcon: "FileText",
    benefits: [
      {
        title: "Save hours of manual entry",
        description:
          "Stop copying and pasting from resumes. KiteHR reads PDF and text resumes and populates every field automatically.",
      },
      {
        title: "Never miss key details",
        description:
          "AI extracts skills, job titles, companies, dates, and education — even from complex resume formats.",
      },
      {
        title: "Works with any format",
        description:
          "From clean modern resumes to messy Word exports, the parser handles all common resume styles.",
      },
      {
        title: "Instant candidate profiles",
        description:
          "Go from raw resume to fully-formed candidate profile in one click — ready to review and score.",
      },
    ],
    howItWorks: [
      "Upload a PDF resume or paste resume text into a candidate's profile",
      "KiteHR sends the content to the AI parser",
      "The AI extracts name, email, phone, work history, skills, and education",
      "Fields are auto-filled in the candidate profile — review and save",
    ],
    relatedFeatures: ["candidate-scoring", "candidate-summary", "skills-gap-analysis"],
  },
  "candidate-scoring": {
    slug: "candidate-scoring",
    name: "Candidate Scoring",
    tagline: "Rank candidates 0–100 against job requirements",
    description:
      "KiteHR's AI evaluates each candidate's resume against the job description and gives a 0–100 score — so you always know who your best matches are.",
    metaTitle: "AI Candidate Scoring — KiteHR",
    metaDescription:
      "Rank candidates automatically with AI scoring. KiteHR scores candidates 0–100 based on fit to job requirements. Pro feature — $49/mo.",
    plan: "pro",
    heroIcon: "Zap",
    benefits: [
      {
        title: "Prioritize your best candidates",
        description:
          "With a 0–100 fit score, you know exactly which candidates to review first — no more guesswork.",
      },
      {
        title: "Reduce screening time",
        description:
          "Stop reading every resume from scratch. The score gives instant signal on who's worth a closer look.",
      },
      {
        title: "Objective first pass",
        description:
          "AI scoring is based on skills, experience, and requirements — not gut feeling or unconscious bias.",
      },
      {
        title: "Works with any job",
        description:
          "The AI reads your job description and calibrates scoring to match your specific requirements.",
      },
    ],
    howItWorks: [
      "Open a candidate profile within a job",
      "Click 'Score candidate' to trigger AI evaluation",
      "The AI compares the candidate's resume to the job description",
      "A 0–100 score appears on the candidate card — sortable across your pipeline",
    ],
    relatedFeatures: ["ai-resume-parsing", "skills-gap-analysis", "hiring-pipeline"],
  },
  "hiring-pipeline": {
    slug: "hiring-pipeline",
    name: "Kanban Hiring Pipeline",
    tagline: "Drag-and-drop candidates through custom stages",
    description:
      "Visualize your entire hiring process in a kanban board. Create custom stages, move candidates with a drag, and keep every team member on the same page.",
    metaTitle: "Kanban Hiring Pipeline — KiteHR",
    metaDescription:
      "Manage your hiring pipeline with a visual kanban board. Custom stages, drag-and-drop, and team collaboration — free forever on KiteHR.",
    plan: "free",
    heroIcon: "GitBranch",
    benefits: [
      {
        title: "See every candidate at a glance",
        description:
          "Your full pipeline in one view — who's applied, who's interviewing, who's in offer stage. No spreadsheets needed.",
      },
      {
        title: "Custom stages for every role",
        description:
          "Design your pipeline to match your process. Add, remove, and rename stages per job — phone screen, technical, culture fit, offer.",
      },
      {
        title: "Move candidates instantly",
        description:
          "Drag a card to advance a candidate. The whole team sees updates in real time.",
      },
      {
        title: "Team collaboration built in",
        description:
          "Hiring managers, recruiters, and interviewers all work from the same board — unlimited team members, always free.",
      },
    ],
    howItWorks: [
      "Create a job posting and define your pipeline stages",
      "Candidates are added to the first stage when they apply",
      "Drag candidates across stages as they progress",
      "Leave notes, add tags, and review feedback — all in the same view",
    ],
    relatedFeatures: ["ai-resume-parsing", "candidate-scoring", "email-templates"],
  },
  "job-description-generator": {
    slug: "job-description-generator",
    name: "Job Description Generator",
    tagline: "Generate compelling job posts in seconds with AI",
    description:
      "Type a job title and let KiteHR write a full job description — with responsibilities, requirements, and benefits — ready to post in under a minute.",
    metaTitle: "AI Job Description Generator — KiteHR",
    metaDescription:
      "Generate job descriptions with AI. KiteHR writes full job posts from a title — responsibilities, requirements, and benefits included. Pro feature — $49/mo.",
    plan: "pro",
    heroIcon: "FileText",
    benefits: [
      {
        title: "Write job posts in seconds",
        description:
          "No more starting from a blank page. Enter a job title and get a full, well-structured description instantly.",
      },
      {
        title: "Professionally written",
        description:
          "AI-generated descriptions follow hiring best practices — clear responsibilities, reasonable requirements, and engaging tone.",
      },
      {
        title: "Fully editable",
        description:
          "The AI gives you a strong draft. Customize it to match your company's tone, culture, and specific needs.",
      },
      {
        title: "Save hours per hire",
        description:
          "Writing a job description from scratch takes 30–60 minutes. KiteHR does it in seconds.",
      },
    ],
    howItWorks: [
      "Create a new job in KiteHR",
      "Click 'Generate job description' and enter the role title",
      "The AI writes a full job post with responsibilities, requirements, and benefits",
      "Review, edit, and publish — or use it as a starting point for your own version",
    ],
    relatedFeatures: ["job-bias-checker", "ai-resume-parsing", "hiring-pipeline"],
  },
  "email-templates": {
    slug: "email-templates",
    name: "Email Templates",
    tagline: "Send consistent, professional candidate communications",
    description:
      "Create reusable email templates for every stage of your hiring process — outreach, interview invites, rejections, and offers. Free on every plan.",
    metaTitle: "Recruiting Email Templates — KiteHR",
    metaDescription:
      "Save time with reusable recruiting email templates. KiteHR includes email templates for outreach, rejections, and offers — free on every plan.",
    plan: "free",
    heroIcon: "Mail",
    benefits: [
      {
        title: "Consistent candidate experience",
        description:
          "Every candidate gets a professional, on-brand response — not a rushed one-off written in a hurry.",
      },
      {
        title: "Save time on every hire",
        description:
          "Write templates once, use them forever. One click to send an interview invite or rejection email.",
      },
      {
        title: "Templates for every stage",
        description:
          "Outreach, screening, interview invite, offer, rejection — build a library that covers your entire pipeline.",
      },
      {
        title: "AI email drafting on Pro",
        description:
          "Upgrade to Pro to have AI draft personalized emails for each candidate — outreach, rejections, and offer letters in seconds.",
      },
    ],
    howItWorks: [
      "Navigate to Email Templates in your KiteHR workspace",
      "Create a template with a name, subject, and body",
      "Use the template when communicating with candidates in a pipeline",
      "Pro: Click 'AI Draft' to generate a personalized email for any candidate automatically",
    ],
    relatedFeatures: ["hiring-pipeline", "job-description-generator", "candidate-scoring"],
  },
  "skills-gap-analysis": {
    slug: "skills-gap-analysis",
    name: "Skills Gap Analysis",
    tagline: "See exactly how a candidate stacks up against your requirements",
    description:
      "KiteHR's AI compares a candidate's skills to your job requirements and highlights what's missing — so you know what to focus on in interviews.",
    metaTitle: "Skills Gap Analysis — KiteHR",
    metaDescription:
      "Compare candidate skills to job requirements with AI. KiteHR's skills gap analysis shows exactly what's missing — Pro feature at $49/mo.",
    plan: "pro",
    heroIcon: "Target",
    benefits: [
      {
        title: "Know the gaps before you interview",
        description:
          "See which required skills a candidate lacks before you spend time on a phone screen or interview.",
      },
      {
        title: "More focused interviews",
        description:
          "Use the gap report to structure interviews around areas that need clarification — not repeating what's on the resume.",
      },
      {
        title: "Better hiring decisions",
        description:
          "Understand trade-offs clearly. Is this candidate missing a nice-to-have or a must-have? The analysis tells you.",
      },
      {
        title: "Works alongside scoring",
        description:
          "Pair skills gap analysis with the 0–100 candidate score for a complete picture of each applicant.",
      },
    ],
    howItWorks: [
      "Open a candidate profile attached to a job",
      "Click 'Skills gap analysis' to run the AI comparison",
      "The AI maps the candidate's skills to the job requirements",
      "Review a clear breakdown of matched skills, partial matches, and gaps",
    ],
    relatedFeatures: ["candidate-scoring", "ai-resume-parsing", "job-description-generator"],
  },
};

export function getFeature(slug: string): FeatureData | null {
  return featuresData[slug] ?? null;
}

export function getAllFeatureSlugs(): string[] {
  return Object.keys(featuresData);
}
