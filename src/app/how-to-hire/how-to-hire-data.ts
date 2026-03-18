export type HowToHireRole = {
  slug: string;
  title: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  salaryRange: { min: number; max: number; currency: string; note: string };
  timeToHire: string;
  topSkills: string[];
  whereToPost: { platform: string; description: string }[];
  hiringSteps: { step: string; description: string }[];
  commonMistakes: string[];
};

export const howToHireRoles: Record<string, HowToHireRole> = {
  "senior-react-developer": {
    slug: "senior-react-developer",
    title: "Senior React Developer",
    category: "Engineering",
    metaTitle: "How to Hire a Senior React Developer — KiteHR",
    metaDescription:
      "Step-by-step guide to hiring a Senior React Developer: salary benchmarks, where to post, what to assess, and how to avoid common hiring mistakes.",
    intro:
      "Hiring a Senior React Developer is competitive. Strong candidates are rarely on job boards for long — you need a fast, structured process and a compelling pitch. This guide walks you through everything from writing the job spec to making the offer.",
    salaryRange: { min: 130000, max: 170000, currency: "USD", note: "Total compensation varies by location and equity" },
    timeToHire: "4–8 weeks",
    topSkills: ["React", "TypeScript", "Next.js", "State Management (Redux/Zustand)", "Performance Optimisation", "Testing (Jest/Cypress)", "Code Review & Mentoring"],
    whereToPost: [
      { platform: "LinkedIn", description: "Essential for senior roles — most active professionals check it daily. Sponsored posts significantly increase reach." },
      { platform: "Wellfound (AngelList)", description: "Strong for startup and scale-up roles where equity is part of the package." },
      { platform: "Hacker News 'Who is Hiring'", description: "Monthly thread with high-quality technical candidates actively looking. Free and highly effective." },
      { platform: "Remotive / We Work Remotely", description: "Ideal if your role is remote — attracts global engineering talent." },
      { platform: "GitHub Jobs / Dev communities", description: "Engage candidates where they already spend time — Discord servers, Slack communities, and open-source maintainer networks." },
    ],
    hiringSteps: [
      { step: "Write a clear, honest job description", description: "Include real tech stack, actual team size, what they'll own, and honest information about compensation band. Vague JDs attract the wrong candidates." },
      { step: "Screen applications with a lightweight filter", description: "Use a scorecard with 3-5 must-haves. Look for: relevant React experience, TypeScript proficiency, evidence of ownership (not just implementation). Reject quickly and kindly." },
      { step: "30-min intro call", description: "Screen for communication, genuine interest in your product, and salary alignment before spending hours on technical assessment." },
      { step: "Technical assessment", description: "Use a take-home or live coding exercise (max 2 hours). Assess React architecture decisions, code quality, and TypeScript usage — not algorithm puzzles." },
      { step: "Technical deep-dive interview", description: "Review the assessment together and go deeper on past projects. Ask about architecture decisions, performance challenges, and mentoring experience." },
      { step: "Team culture interview", description: "Meet the team they'll work with. Assess collaboration style, communication, and whether they'll thrive in your environment." },
      { step: "References and offer", description: "Call 2 references directly (not email). Move fast on the offer — strong candidates have multiple options in flight." },
    ],
    commonMistakes: [
      "Requiring 'years of experience' rather than assessing actual capability — great React developers exist at every experience level",
      "Overly long technical assessments (>4 hours) — top candidates will disengage and choose companies that respect their time",
      "Slow feedback loops — taking more than a week between stages causes candidate drop-off",
      "Focusing only on algorithms and ignoring React-specific architecture, component design, and testing",
      "Not involving the team until the final stage — candidates are also evaluating you",
    ],
  },
  "chief-of-staff": {
    slug: "chief-of-staff",
    title: "Chief of Staff",
    category: "Operations",
    metaTitle: "How to Hire a Chief of Staff — KiteHR",
    metaDescription:
      "Complete guide to hiring a Chief of Staff: what to look for, salary expectations, where to find candidates, and a step-by-step hiring process.",
    intro:
      "A Chief of Staff is one of the highest-leverage hires a CEO can make — and one of the hardest to get right. The role is genuinely different in every company, which makes defining success criteria critical before you start. This guide helps you hire a CoS who will multiply your impact, not just manage your calendar.",
    salaryRange: { min: 120000, max: 170000, currency: "USD", note: "Senior CoS roles at well-funded companies can reach $200k+" },
    timeToHire: "6–10 weeks",
    topSkills: ["Strategic Thinking", "Executive Communication", "Cross-functional Project Management", "Data Analysis & Financial Modelling", "OKR Design & Facilitation", "High EQ & Political Acuity"],
    whereToPost: [
      { platform: "LinkedIn", description: "Primary channel for experienced operations and strategy professionals. Targeted to people with consulting or strategy backgrounds." },
      { platform: "MBB alumni networks", description: "Former McKinsey, Bain, and BCG consultants are common CoS profiles — alumni communities and LinkedIn alumni groups are good sourcing vectors." },
      { platform: "VC portfolio networks", description: "Ask your investors for referrals — their portfolio operations teams often have a pipeline of CoS candidates." },
      { platform: "CEO & Founder peer communities", description: "Ask other founders who've hired a CoS for referrals — this role is almost always better filled through trusted referral than job boards." },
      { platform: "Wellfound (AngelList)", description: "Good for startup-oriented CoS candidates who are excited by growth-stage environments." },
    ],
    hiringSteps: [
      { step: "Define the role clearly before posting", description: "Is this CoS focused on strategy (board prep, OKRs, initiatives) or operations (process, systems, team coordination)? The answer determines your ideal candidate profile completely." },
      { step: "Structured first interview with the CEO", description: "Test for: communication clarity, strategic thinking under pressure, ability to challenge ideas respectfully, and cultural alignment. This is a proximity role — fit with the CEO matters enormously." },
      { step: "Written exercise or case study", description: "Give a real business problem — a messy strategic question or an operational challenge. Assess their structured thinking, written communication, and ability to navigate ambiguity." },
      { step: "Stakeholder panel interviews", description: "Have them meet 3-4 people they'd work closely with (key direct reports, department heads). The CoS needs to earn trust across the org — not just with the CEO." },
      { step: "Reference checks", description: "Call references directly — especially prior managers. Ask specifically about how they handle disagreement with leadership and how they manage confidential information." },
      { step: "Trial project (optional)", description: "For final candidates, consider a paid 1-2 day project on a real company challenge. Nothing reveals readiness like an actual work sample." },
    ],
    commonMistakes: [
      "Hiring a glorified EA rather than a strategic partner — undervaluing the role leads to wrong candidates",
      "Not involving the leadership team in the process — the CoS must earn their trust, not just the CEO's",
      "Skipping written exercises — verbal performance doesn't predict written communication quality",
      "Over-indexing on credentials (MBB, MBA) and under-indexing on judgment and EQ",
    ],
  },
  "product-manager": {
    slug: "product-manager",
    title: "Product Manager",
    category: "Product",
    metaTitle: "How to Hire a Product Manager — KiteHR",
    metaDescription:
      "Step-by-step guide to hiring a great Product Manager: what skills to look for, where to find them, salary benchmarks, and how to structure the process.",
    intro:
      "Product Managers are among the hardest roles to hire well because the signal is noisy — almost everyone interviews well for PM roles. The key is using work samples, reference-rich processes, and structured exercises that reveal how they actually think, not how they talk about thinking.",
    salaryRange: { min: 100000, max: 145000, currency: "USD", note: "Senior PMs and PM Directors can reach $150–$200k" },
    timeToHire: "5–8 weeks",
    topSkills: ["Customer Discovery & Research", "Roadmapping & Prioritisation", "PRD Writing & Scoping", "Cross-functional Collaboration", "Data Analysis", "Stakeholder Management"],
    whereToPost: [
      { platform: "LinkedIn", description: "Primary channel for PM roles — sponsored posts targeting PMs at similar stage companies work well." },
      { platform: "Lenny's Job Board", description: "Lenny's Newsletter job board has extremely high-quality PM candidates — well worth the investment." },
      { platform: "Mind the Product community", description: "One of the largest product communities globally — job board and Slack workspace." },
      { platform: "Product School / Reforge alumni", description: "Candidates from these communities are actively developing their PM skills." },
      { platform: "Referrals from your engineers and designers", description: "PMs who've worked with your team's tech stack and design tools are easier to evaluate and ramp faster." },
    ],
    hiringSteps: [
      { step: "Screen for customer empathy first", description: "In the first 30 minutes, ask them to walk through a product decision they're proud of. You're listening for evidence of genuine customer insight, not just feature shipping." },
      { step: "Product sense exercise", description: "Give a product improvement exercise for a product they know well. Evaluate structure, creativity, and how they balance user vs business needs — not whether their answer matches yours." },
      { step: "Prioritisation scenario", description: "Present a backlog of 6-8 items with rough data. Ask them to prioritise and defend their choices. Look for a clear framework and willingness to make trade-offs." },
      { step: "Cross-functional interview", description: "Have them meet an engineer and a designer separately. Ask those team members: 'Would you want to work with this PM? Why?' Their answer matters as much as the PM's." },
      { step: "Past project deep dive", description: "Spend 45 minutes on one project they owned end-to-end. Ask: what did the data say, what did users say, what did you ship, what did you learn, what would you change?" },
      { step: "Reference checks", description: "Call their most recent manager AND an engineer or designer who worked with them. Ask: 'On a scale of 1-10, how strongly would you rehire them? What would make it a 10?'" },
    ],
    commonMistakes: [
      "Interviewing only for communication skills — great presenters are not always great PMs",
      "Skipping reference calls with engineers and designers — they'll tell you things managers won't",
      "Hiring a PM who's too senior too early — a VP of Product mindset can be destructive in an IC PM role at an early-stage company",
      "Not assessing whether they can write — clear written communication is the most-used PM skill",
    ],
  },
  "account-executive": {
    slug: "account-executive",
    title: "Account Executive",
    category: "Sales",
    metaTitle: "How to Hire an Account Executive — KiteHR",
    metaDescription:
      "Complete guide to hiring a great Account Executive: compensation benchmarks, where to source, interview process, and what to test for.",
    intro:
      "Hiring AEs is high-stakes: a bad hire can cost you 6-12 months of missed quota and pipeline damage. The key is combining a rigorous interview process with fast decision-making — top AEs are usually off the market within 2 weeks of starting their search.",
    salaryRange: { min: 80000, max: 120000, currency: "USD", note: "Total OTE typically 2x base — $160k-$240k for strong mid-market AEs" },
    timeToHire: "3–5 weeks",
    topSkills: ["Discovery & Qualification", "Multi-threading Complex Deals", "Demo & Presentation Skills", "Objection Handling", "Forecasting & Pipeline Management", "Commercial Negotiation"],
    whereToPost: [
      { platform: "LinkedIn", description: "Best for finding AEs with specific industry or segment experience. Sponsored posts targeting reps at direct competitors are highly effective." },
      { platform: "Bravado / Pavilion community", description: "High-quality sales communities where top performers are actively networked." },
      { platform: "Employee referrals", description: "The highest quality and fastest source — great AEs know other great AEs. Offer meaningful referral bonuses." },
      { platform: "Competitive sourcing", description: "Reach out directly to AEs at your direct competitors who are in your target segment. They need minimal ramp." },
      { platform: "Revenue Collective / similar sales communities", description: "Professional sales communities often have job boards and are well-networked." },
    ],
    hiringSteps: [
      { step: "Screen for coachability and quota attainment first", description: "Ask for their quota for the past 2 years and what percentage they hit. Strong AEs know their numbers. Ask: 'What's the most important thing you've learned from a loss?'" },
      { step: "Discovery call roleplay", description: "Run a 20-minute mock discovery call with you as the prospect. You're not looking for perfection — you're assessing listening, curiosity, question quality, and ability to control the call without being pushy." },
      { step: "Pipeline review conversation", description: "Ask them to walk you through 3 deals from their current/recent pipeline — one that closed, one that stalled, one they lost. This reveals their sales methodology and how they think about deals." },
      { step: "Deal review with sales leadership", description: "Have VP Sales dig into a specific deal win and a specific loss in detail. Look for commercial maturity and honest self-assessment." },
      { step: "Culture and compensation alignment", description: "Discuss your sales motion, ICP, deal cycles, and comp plan transparently. Great AEs will ask sharp questions — that's a good sign." },
      { step: "Reference checks", description: "Call their direct manager and ask: 'Did they hit quota? Were they a good teammate? Would you rehire?' Don't accept email references only." },
    ],
    commonMistakes: [
      "Hiring for personality and charisma over qualification and methodology",
      "Not running a roleplay — the best predictor of sales performance is a work sample, not self-reported success",
      "Offering a comp plan that doesn't match market rates — losing AEs mid-process on comp is avoidable",
      "Too long an interview process — losing AEs to faster-moving competitors because your process takes 8 weeks",
    ],
  },
  "recruiter": {
    slug: "recruiter",
    title: "Recruiter",
    category: "HR",
    metaTitle: "How to Hire a Recruiter — KiteHR",
    metaDescription:
      "Guide to hiring a great in-house recruiter: what to look for, salary benchmarks, sourcing strategies, and how to structure the process.",
    intro:
      "Hiring your first or second in-house recruiter is a significant leverage point — the right person can transform your hiring velocity and quality. Look for someone who is both a great sourcer and a trusted advisor to hiring managers.",
    salaryRange: { min: 60000, max: 100000, currency: "USD", note: "Technical/executive recruiters command higher rates, £70-110k in the UK" },
    timeToHire: "3–5 weeks",
    topSkills: ["Sourcing & Boolean Search", "Candidate Qualification & Screening", "ATS Proficiency", "Hiring Manager Partnership", "Candidate Experience Management", "Data-driven Recruiting"],
    whereToPost: [
      { platform: "LinkedIn", description: "Most recruiters are active LinkedIn users and easy to source there — search for 'in-house recruiter' + your industry." },
      { platform: "ERE / RecruitingBrainfood community", description: "Top talent acquisition communities with job boards and active professionals." },
      { platform: "Sourcing certifications networks", description: "SourceCon and similar TA communities attract proactive, skills-focused recruiters." },
      { platform: "Agency-to-in-house transition networks", description: "Agency recruiters transitioning in-house often bring strong sourcing skills and urgency." },
      { platform: "Referrals from your talent network", description: "Ask your existing team and investors — good recruiters are well-networked." },
    ],
    hiringSteps: [
      { step: "Define what 'great' looks like for your stage", description: "Are you hiring for technical roles, GTM roles, or both? At Series A, you need a generalist who can source and close. At Series B+, you can specialise. Don't over-hire seniority too early." },
      { step: "Evaluate their sourcing skills directly", description: "Give them a brief for a real role you're hiring for and ask them to build a Boolean search string and find 5 relevant candidates in LinkedIn Recruiter (30-min exercise). This separates sourcers from order-takers." },
      { step: "Hiring manager roleplay", description: "Run a mock intake meeting where you play a difficult hiring manager with unrealistic expectations. How do they push back with data? How do they set realistic timelines?" },
      { step: "Metrics review", description: "Ask for their hiring metrics from the past year: time-to-fill, offer acceptance rate, pipeline source mix. Strong recruiters know their numbers." },
      { step: "Culture and tooling alignment", description: "Discuss your ATS, sourcing tools, and interview process philosophy. Ask how they structure the candidate experience from application to offer." },
    ],
    commonMistakes: [
      "Hiring someone too senior (Director-level) when you need a hands-on sourcer who can work a full desk",
      "Not testing sourcing skills directly — relying only on interview performance",
      "Failing to include hiring managers in the process — the recruiter must earn their trust",
      "Not discussing metrics expectations upfront — align on time-to-fill targets before extending an offer",
    ],
  },
  "product-designer": {
    slug: "product-designer",
    title: "Product Designer",
    category: "Design",
    metaTitle: "How to Hire a Product Designer — KiteHR",
    metaDescription:
      "Complete guide to hiring a Product Designer: portfolio review, salary benchmarks, where to post, and a structured hiring process.",
    intro:
      "Hiring a great product designer requires evaluating both craft (visual quality, interaction design) and process (research, iteration, collaboration). A strong portfolio is table stakes — the real signal comes from understanding how they think about problems and work with cross-functional teams.",
    salaryRange: { min: 100000, max: 145000, currency: "USD", note: "Senior designers at well-funded companies often reach $150-180k" },
    timeToHire: "4–7 weeks",
    topSkills: ["Figma Proficiency", "User Research & Usability Testing", "Interaction Design", "Design Systems", "Cross-functional Collaboration", "Accessibility (WCAG)"],
    whereToPost: [
      { platform: "Dribbble & Behance", description: "Portfolio platforms where designers actively share work — Dribbble job board targets active job seekers." },
      { platform: "LinkedIn", description: "Good for product and UX designers with B2B SaaS backgrounds." },
      { platform: "Layers.to / Design communities", description: "Modern design communities where junior-to-mid designers are active." },
      { platform: "ADPList / Design mentor networks", description: "Good for finding emerging talent and designers actively levelling up." },
      { platform: "Referrals from your engineering and PM team", description: "Designers who've worked well with engineers and PMs in adjacent roles are often the best fits." },
    ],
    hiringSteps: [
      { step: "Portfolio screen", description: "Look for: range of work, depth in at least one area, evidence of end-to-end process (not just polished final screens), and the ability to articulate design decisions in case study write-ups." },
      { step: "Portfolio walkthrough interview", description: "Ask them to walk through one project in depth. Focus on: how they defined the problem, how research informed decisions, and how they handled constraints and feedback." },
      { step: "Design exercise", description: "Give a scoped design challenge based on a real problem in your product (3-5 hours). Evaluate: problem framing, UX thinking, visual quality, and how they communicate their choices." },
      { step: "Cross-functional interviews", description: "Have them meet an engineer and a PM. Ask each: 'Do they communicate design decisions clearly? Would you enjoy working with them?'" },
      { step: "Offer and portfolio finalisation", description: "Move fast on strong candidates. Reference check with a PM or engineer who worked with them — not just their manager." },
    ],
    commonMistakes: [
      "Evaluating only the visual output and not the process that created it",
      "Not giving a design exercise — self-reported experience doesn't predict design quality",
      "Hiring a 'unicorn' who is expected to do design + front-end + research — this creates burnout",
      "Not involving engineers in the process — they'll work with this person daily",
    ],
  },
  "data-scientist": {
    slug: "data-scientist",
    title: "Data Scientist",
    category: "Engineering",
    metaTitle: "How to Hire a Data Scientist — KiteHR",
    metaDescription:
      "Guide to hiring a Data Scientist: what to assess, salary expectations, where to source candidates, and how to structure the interview process.",
    intro:
      "Great data scientists combine statistical rigour with business intuition and communication skills. The challenge is that many candidates have strong academic credentials but limited experience translating analysis into business impact. Test for the full package.",
    salaryRange: { min: 115000, max: 160000, currency: "USD", note: "ML specialists and senior DS roles can reach $180k+" },
    timeToHire: "5–8 weeks",
    topSkills: ["Python & SQL", "Statistical Modelling", "Machine Learning (scikit-learn/PyTorch)", "A/B Experimentation", "Data Visualisation", "Business Communication"],
    whereToPost: [
      { platform: "LinkedIn", description: "Primary channel for experienced data scientists — filter by industry and tools used." },
      { platform: "Kaggle Jobs", description: "Active data science community — candidates often have Kaggle profiles you can review before outreach." },
      { platform: "DataElixir / Data Science Weekly newsletters", description: "Job boards in popular DS newsletters reach practitioners who are not actively job seeking." },
      { platform: "Academic referrals (PhD pipelines)", description: "If you need deep ML expertise, partner with relevant university departments for PhD graduates or postdocs." },
      { platform: "GitHub sourcing", description: "Find data scientists via their public repositories and open-source contributions in relevant libraries." },
    ],
    hiringSteps: [
      { step: "Screen for business impact, not just technical credentials", description: "In the first call, ask: 'Tell me about an analysis that changed a business decision.' If they can't answer concretely, technical skills alone won't make them effective." },
      { step: "SQL and stats screen", description: "Short async test: 2-3 SQL questions on a provided schema + 1 statistics question. This screens out candidates with gaps in fundamentals." },
      { step: "Take-home project", description: "Provide a real (or realistic) dataset with a business question. Evaluate: EDA quality, method selection, and most importantly the quality of written conclusions and recommendations." },
      { step: "Project walkthrough and deep dive", description: "Review the take-home together. Ask about decisions made, what they'd do with more time, and how they'd present findings to a non-technical exec." },
      { step: "Cross-functional interview", description: "Have them meet a product manager or business stakeholder to assess communication, ability to navigate ambiguous questions, and business vocabulary." },
    ],
    commonMistakes: [
      "Hiring PhDs for applied analytics roles — the fit requires applied, production-ready work, not academic rigour",
      "Focusing take-home projects on technical complexity rather than business communication of results",
      "Not testing SQL — it's the most-used data scientist skill and easy to test",
      "Hiring without a clear definition of what the DS will own — ambiguous scope leads to misalignment and churn",
    ],
  },
  "hr-business-partner": {
    slug: "hr-business-partner",
    title: "HR Business Partner",
    category: "HR",
    metaTitle: "How to Hire an HR Business Partner — KiteHR",
    metaDescription:
      "Guide to hiring a great HRBP: what to assess, salary benchmarks, sourcing strategies, and a structured interview process.",
    intro:
      "An HR Business Partner is a strategic advisor to your leadership team — not just a policy enforcer. The best HRBPs combine business acumen with deep people expertise and the confidence to push back on leaders when necessary.",
    salaryRange: { min: 85000, max: 125000, currency: "USD", note: "Senior HRBPs at larger companies can reach $150k+" },
    timeToHire: "4–6 weeks",
    topSkills: ["Employee Relations", "Organisational Design", "Workforce Planning", "Coaching & Advisory", "HR Analytics", "Employment Law Compliance"],
    whereToPost: [
      { platform: "LinkedIn", description: "Primary channel for HR professionals. Search by CIPD/SHRM credentials and industry background." },
      { platform: "CIPD / SHRM job boards", description: "Professional HR body job boards reach credentialed practitioners actively job seeking." },
      { platform: "HR communities (People Geekly, HR Open Source)", description: "Progressive HR communities attract HRBPs who focus on business impact over compliance." },
      { platform: "Referrals from your leadership team", description: "HRBPs who come recommended by business leaders often have proven track records of building trust quickly." },
    ],
    hiringSteps: [
      { step: "Define the balance between strategic and operational work", description: "At early stages, HRBPs need to do both. Be explicit about what percentage is strategic advisory vs operational HR work — this affects who applies." },
      { step: "Business acumen screen", description: "In the first call, ask about a business initiative they supported from an HR perspective. Do they understand P&L, headcount cost, and business metrics? Red flag if they only talk about policy." },
      { step: "Employee relations case study", description: "Present a realistic ER scenario (performance issue + management team disagreement). Assess: process knowledge, judgment, risk awareness, and the ability to advise a manager under pressure." },
      { step: "Business leader panel interview", description: "Have 2 business leaders interview the HRBP candidate separately. Ask them: 'Would you trust this person to advise you on a difficult people decision?'" },
      { step: "HR director / VP People debrief", description: "Align on what the business leaders said and assess HRBP's ability to build trust quickly with diverse leadership styles." },
    ],
    commonMistakes: [
      "Hiring a policy-first HRBP when you need a business-first one — the mindset is hard to change",
      "Not involving business leaders in the process — they must trust this person implicitly",
      "Over-indexing on credentials (CIPD/SHRM) and under-indexing on judgment and business partnership",
      "Hiring at the wrong level — a senior HRBP in a 50-person company will be frustrated with operational work",
    ],
  },
  "content-marketer": {
    slug: "content-marketer",
    title: "Content Marketer",
    category: "Marketing",
    metaTitle: "How to Hire a Content Marketer — KiteHR",
    metaDescription:
      "Complete guide to hiring a Content Marketer: what skills to test, where to source, salary benchmarks, and how to evaluate writing quality.",
    intro:
      "Great content marketers are rare: they need to be strong writers, strategic SEO thinkers, and data-literate. Testing writing quality directly in the process is non-negotiable — a portfolio alone is not enough.",
    salaryRange: { min: 65000, max: 95000, currency: "USD", note: "Senior content strategists and content leads can reach £60-80k in the UK" },
    timeToHire: "3–5 weeks",
    topSkills: ["SEO & Keyword Research", "Long-form Writing & Editing", "Content Strategy", "CMS Management", "GA4 & Analytics", "Editorial Management"],
    whereToPost: [
      { platform: "LinkedIn", description: "Good for B2B content marketers with SaaS experience. Search by ATS tool proficiency or industry." },
      { platform: "Growth.Design / Demand Curve community", description: "Communities for growth and content marketers who are focused on business impact." },
      { platform: "Polywork / X (Twitter) network", description: "Strong writers often have active presences on X — search for B2B content creators." },
      { platform: "Newsletter communities", description: "Writers who run newsletters demonstrate self-motivation and audience development skills." },
      { platform: "Freelancer networks (Contently, Superpath)", description: "Strong freelancers often want to go in-house — they bring an entrepreneurial content mindset." },
    ],
    hiringSteps: [
      { step: "Portfolio review", description: "Read 3-5 pieces critically. Look for: clear structure, keyword naturalness, ability to explain complex topics simply, and evidence of SEO awareness without keyword-stuffing." },
      { step: "Keyword research exercise", description: "Give them a topic and ask them to build a keyword brief in 30 minutes using free tools. This tests whether their SEO knowledge is real or just talked about." },
      { step: "Writing sample on your topic", description: "Ask for a 500-word draft on a topic relevant to your product (1-2 hours). Evaluate: clarity, structure, voice, and SEO-friendliness — not just grammar." },
      { step: "Content strategy interview", description: "Ask: 'How would you build our content engine from scratch in the first 90 days?' Look for prioritisation thinking, channel strategy, and how they'd measure success." },
      { step: "Analytics walk-through", description: "Share a GA4 screenshot of a blog post and ask them to interpret it. Can they identify what to optimise? Do they understand the metrics?" },
    ],
    commonMistakes: [
      "Hiring on writing quality alone without testing SEO and strategy skills",
      "Not giving a writing exercise — portfolio pieces have often been heavily edited by others",
      "Expecting one person to do content + social + email + design — recipe for burnout and mediocre work",
      "Not defining what 'good content ROI' means before hiring — leads to misaligned expectations",
    ],
  },
};

export function getHowToHireRole(slug: string): HowToHireRole | null {
  return howToHireRoles[slug] ?? null;
}

export function getAllHowToHireSlugs(): string[] {
  return Object.keys(howToHireRoles);
}

export const howToHireRolesList = Object.values(howToHireRoles);
