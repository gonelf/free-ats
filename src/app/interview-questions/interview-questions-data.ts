export type InterviewQuestion = {
  question: string;
  whatToLookFor: string;
};

export type InterviewQuestionsRole = {
  slug: string;
  title: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  behavioralQuestions: InterviewQuestion[];
  technicalQuestions: InterviewQuestion[];
  redFlags: string[];
};

export const interviewQuestionsRoles: Record<string, InterviewQuestionsRole> = {
  "senior-react-developer": {
    slug: "senior-react-developer",
    title: "Senior React Developer",
    category: "Engineering",
    metaTitle: "Senior React Developer Interview Questions — KiteHR",
    metaDescription:
      "15 expert Senior React Developer interview questions with ideal answer guidance. Assess front-end architecture skills, React depth, and engineering maturity.",
    intro:
      "Senior React Developers need to demonstrate not just React fluency, but architectural thinking, performance awareness, and the ability to mentor others. Use these questions to assess technical depth, code quality standards, and collaborative mindset.",
    behavioralQuestions: [
      {
        question: "Tell me about a complex front-end architecture decision you led. What were the trade-offs and how did you decide?",
        whatToLookFor: "Look for structured thinking, awareness of trade-offs (performance vs maintainability, flexibility vs complexity), and ownership of the decision.",
      },
      {
        question: "Describe a time you significantly improved a slow React application. What was your diagnostic process?",
        whatToLookFor: "Should mention profiling tools (React DevTools, Lighthouse), specific optimisations (memoisation, code splitting, lazy loading), and measurable results.",
      },
      {
        question: "How do you approach mentoring junior developers on your team? Can you give a concrete example?",
        whatToLookFor: "Look for genuine investment in others' growth — pair programming, code review habits, structured feedback. Avoid candidates who treat this as secondary.",
      },
      {
        question: "Tell me about a significant disagreement you had with a designer or product manager about a UI decision. How did you handle it?",
        whatToLookFor: "Look for respectful disagreement backed by user or technical reasoning, willingness to compromise, and a collaborative outcome.",
      },
      {
        question: "Describe a time a production front-end bug affected users. How did you identify and resolve it?",
        whatToLookFor: "Look for urgency, systematic debugging (error monitoring, reproduction, root cause), and a post-mortem mindset to prevent recurrence.",
      },
      {
        question: "How do you keep your front-end skills current given how fast the ecosystem moves?",
        whatToLookFor: "Should show genuine curiosity — following React releases, reading RFCs, contributing to or learning from open source, not just tutorial-hopping.",
      },
    ],
    technicalQuestions: [
      {
        question: "Explain the difference between useCallback, useMemo, and React.memo. When would you use each?",
        whatToLookFor: "Should clearly explain: useMemo for expensive calculations, useCallback for stable function references, React.memo for preventing child re-renders. Bonus: discusses pitfalls of over-optimisation.",
      },
      {
        question: "Walk me through how you'd design a shared state solution for a large React app. Compare at least two approaches.",
        whatToLookFor: "Should compare Context + useReducer, Redux (RTK), Zustand, Jotai — with clear criteria for choosing (bundle size, devX, server state vs client state). Avoids one-size-fits-all answers.",
      },
      {
        question: "How does React's reconciliation algorithm work? Why does key matter in lists?",
        whatToLookFor: "Should explain the virtual DOM diffing process, O(n) heuristic, and why stable, unique keys prevent incorrect DOM mutations during list re-renders.",
      },
      {
        question: "How would you architect a Next.js app that needs to mix static, SSR, and client-side-rendered pages?",
        whatToLookFor: "Should discuss generateStaticParams for SSG, dynamic rendering for per-request SSR, React Server Components, and ISR — matching each pattern to an appropriate use case.",
      },
      {
        question: "How do you approach accessibility (a11y) in your components? What are common pitfalls?",
        whatToLookFor: "Should mention semantic HTML, ARIA attributes, focus management, keyboard navigation, colour contrast, and ideally screen reader testing. Red flag if they only mention colour.",
      },
    ],
    redFlags: [
      "Cannot explain why they chose specific state management patterns — just uses what they've seen before",
      "Dismissive of accessibility, testing, or performance as 'nice to haves'",
      "Has never mentored anyone or views it as outside their job",
      "Cannot describe a failed decision or a time they were wrong",
    ],
  },
  "backend-engineer": {
    slug: "backend-engineer",
    title: "Backend Engineer",
    category: "Engineering",
    metaTitle: "Backend Engineer Interview Questions — KiteHR",
    metaDescription:
      "15 expert Backend Engineer interview questions with answer guidance. Assess API design, database skills, and systems thinking.",
    intro:
      "Backend engineers need strong foundations in API design, database optimisation, and distributed systems. These questions are designed to assess both technical depth and the judgment to make pragmatic engineering decisions.",
    behavioralQuestions: [
      {
        question: "Tell me about a time you designed an API that other teams depended on. What decisions did you make and why?",
        whatToLookFor: "Look for contract-first thinking, versioning strategy, documentation, and consideration of consumer needs not just internal convenience.",
      },
      {
        question: "Describe a production incident you were involved in. What happened, and what was your role in resolving it?",
        whatToLookFor: "Look for calm under pressure, systematic diagnosis, clear communication, and post-incident improvements. Avoid candidates who blame others.",
      },
      {
        question: "Tell me about a time you inherited legacy code or a poorly designed system. How did you approach improving it?",
        whatToLookFor: "Should show pragmatism — not rewriting everything — but incremental improvements: tests first, then refactoring, with business continuity in mind.",
      },
      {
        question: "How do you decide when to introduce a new dependency vs. building something in-house?",
        whatToLookFor: "Should consider: maturity of the library, maintenance burden, security, licensing, and whether the problem is core to the product.",
      },
      {
        question: "Give an example of a database performance problem you identified and fixed.",
        whatToLookFor: "Should describe the diagnostic process (slow query logs, EXPLAIN plans), the fix (index, query rewrite, denormalisation), and measurable improvement.",
      },
    ],
    technicalQuestions: [
      {
        question: "What are the ACID properties? Can you give an example of when you'd need full ACID compliance versus eventual consistency?",
        whatToLookFor: "Should explain Atomicity, Consistency, Isolation, Durability clearly. Strong answers contrast relational transaction requirements vs. distributed system trade-offs (CAP theorem).",
      },
      {
        question: "How would you design a rate limiting system for a public API?",
        whatToLookFor: "Should discuss token bucket or sliding window algorithms, Redis for distributed counters, where to apply limits (per-user, per-IP, per-endpoint), and handling burst vs sustained traffic.",
      },
      {
        question: "Explain the N+1 query problem and how you'd detect and fix it in an ORM-based application.",
        whatToLookFor: "Should explain the problem clearly (separate query per record), detection method (query logs, Bullet gem for Rails), and solutions (eager loading, DataLoader for GraphQL).",
      },
      {
        question: "Walk me through how you'd design a job queue system for background processing.",
        whatToLookFor: "Should cover: queue persistence (Redis, SQS, Kafka), at-least-once vs exactly-once delivery, idempotency, dead-letter queues, retry strategies with backoff.",
      },
      {
        question: "How do you handle database migrations in a zero-downtime deployment?",
        whatToLookFor: "Should describe expand-contract pattern: backward-compatible migrations first, deploy, then remove old columns. Understands that locking operations must be avoided on large tables.",
      },
    ],
    redFlags: [
      "Designs everything from scratch without considering existing tools and libraries",
      "Cannot explain their own database schema choices beyond 'it works'",
      "Never written a meaningful test or treats testing as optional",
      "Has never been involved in a production incident or cannot recall one",
    ],
  },
  "product-manager": {
    slug: "product-manager",
    title: "Product Manager",
    category: "Product",
    metaTitle: "Product Manager Interview Questions — KiteHR",
    metaDescription:
      "15 expert Product Manager interview questions with answer guidance. Assess strategic thinking, customer empathy, and prioritisation skills.",
    intro:
      "Great PMs combine customer empathy, analytical rigour, and cross-functional influence. These questions probe for genuine customer obsession, the ability to make and defend hard trade-offs, and a track record of shipping outcomes rather than outputs.",
    behavioralQuestions: [
      {
        question: "Tell me about a product you owned end-to-end. What was your biggest learning from the process?",
        whatToLookFor: "Look for ownership, honesty about failures, and evidence that they adapted based on feedback. Avoid candidates who only describe success.",
      },
      {
        question: "Describe a time you had to say no to a feature request from sales or a senior stakeholder. How did you handle it?",
        whatToLookFor: "Should show backbone — ability to say no with data and reasoning, while maintaining the relationship. Avoid candidates who only talk about consensus.",
      },
      {
        question: "Walk me through how you would prioritise a backlog when everything seems urgent.",
        whatToLookFor: "Should describe a clear framework (RICE, ICE, impact vs. effort) and how they calibrate with customer data and business metrics. Avoid gut-feel-only approaches.",
      },
      {
        question: "Tell me about a feature you shipped that didn't perform as expected. What did you learn?",
        whatToLookFor: "Key indicator of product maturity. Look for honesty, analysis of why it failed, and specific changes they made to their process.",
      },
      {
        question: "How do you keep the engineering team motivated and aligned when they have to work on tech debt or unglamorous work?",
        whatToLookFor: "Should show understanding of engineering concerns, ability to explain the 'why', and methods for carving out space for tech debt alongside features.",
      },
    ],
    technicalQuestions: [
      {
        question: "How do you define success metrics for a new feature before you build it?",
        whatToLookFor: "Should distinguish between input metrics (feature adoption, activation) and output metrics (retention, revenue). Uses leading and lagging indicators. Sets targets, not just tracking.",
      },
      {
        question: "Walk me through how you'd run an A/B test for a significant UX change.",
        whatToLookFor: "Should cover hypothesis formulation, sample size calculation, primary/guardrail metrics, test duration, statistical significance, and decision criteria including novelty effect.",
      },
      {
        question: "How do you conduct user interviews to uncover problems rather than confirm solutions?",
        whatToLookFor: "Should mention open-ended questions, avoiding leading questions, probing for past behaviour not hypothetical, and synthesising across sessions to find patterns.",
      },
      {
        question: "Explain how you'd build a product roadmap for the next two quarters starting from scratch.",
        whatToLookFor: "Should describe a top-down process: start with strategy and goals, then discovery (customer data, sales/CS input, usage data), then theme-level prioritisation, then sequencing. Avoids feature laundry lists.",
      },
      {
        question: "How do you work with engineers during discovery to assess technical feasibility without compromising the exploration?",
        whatToLookFor: "Should involve engineers early as thought partners, not just after specs are written. Understands the value of rough feasibility checks without full scoping.",
      },
    ],
    redFlags: [
      "Cannot name metrics they've moved — only talks about features shipped",
      "Has never changed direction based on user feedback",
      "Views engineers as order-takers rather than collaborative partners",
      "Relies entirely on stakeholder requests rather than customer data for prioritisation",
    ],
  },
  "account-executive": {
    slug: "account-executive",
    title: "Account Executive",
    category: "Sales",
    metaTitle: "Account Executive Interview Questions — KiteHR",
    metaDescription:
      "15 expert Account Executive interview questions with answer guidance. Assess closing skills, methodology, and sales maturity.",
    intro:
      "Great AEs combine curiosity, persistence, and commercial acumen. These questions assess sales methodology depth, ability to navigate complex deals, and whether they take genuine ownership of their pipeline and results.",
    behavioralQuestions: [
      {
        question: "Tell me about the largest deal you've ever closed. Walk me through the full sales cycle.",
        whatToLookFor: "Look for clear multi-threading (multiple stakeholders), a structured approach to discovery, and how they navigated objections and procurement. Avoid candidates who rely only on champion-driven deals.",
      },
      {
        question: "Describe a deal you lost. What happened, and what would you do differently?",
        whatToLookFor: "Reveals coachability and self-awareness. Strong candidates analyse the loss honestly (lost on value, champion didn't have authority, competed poorly on pricing) and have a specific lesson.",
      },
      {
        question: "How do you manage a pipeline that has stalled? Walk me through your approach to re-engaging stuck deals.",
        whatToLookFor: "Should have a specific playbook: re-engaging with new value, escalating to executive sponsors, using a mutual close plan or trial extension. Avoids 'just following up'.",
      },
      {
        question: "Tell me about a time you pushed back on a prospect who was demanding a discount you couldn't justify.",
        whatToLookFor: "Shows commercial discipline. Should anchor on value delivered, understand the commercial concern, and find creative alternatives before discounting.",
      },
      {
        question: "How do you hit quota consistently even when your inbound pipeline is light?",
        whatToLookFor: "Strong AEs build their own pipeline through outbound, referrals, and account expansion — not just relying on marketing.",
      },
    ],
    technicalQuestions: [
      {
        question: "Walk me through your discovery process. What are the key questions you always ask?",
        whatToLookFor: "Should have a structured discovery framework. Strong candidates ask about current state, desired state, consequences of inaction, decision process, timeline, and budget — not just surface-level pain.",
      },
      {
        question: "How do you qualify an opportunity? What would make you disqualify a prospect?",
        whatToLookFor: "Should reference a qualification framework (MEDDIC, BANT, SPICED). Crucially, should be willing to disqualify bad-fit prospects rather than just chasing pipeline.",
      },
      {
        question: "How do you structure a compelling business case or ROI story for an economic buyer?",
        whatToLookFor: "Should move beyond feature-benefit selling to quantified business impact: cost savings, time savings, revenue uplift. Can translate product capabilities to CFO language.",
      },
      {
        question: "Describe your approach to handling the 'we already have a solution' objection.",
        whatToLookFor: "Should probe for dissatisfaction with the existing tool, quantify the switching cost, and create urgency around the cost of staying with a suboptimal solution.",
      },
      {
        question: "How do you approach end-of-quarter deals that the prospect wants to delay?",
        whatToLookFor: "Should have a mutual close plan strategy — working backwards from the prospect's desired outcome date, making the case for why delay hurts them, not just the seller.",
      },
    ],
    redFlags: [
      "Cannot recall specific deals with specifics — talks in generalities",
      "Blames lost deals entirely on product gaps or pricing, never on their own approach",
      "Has no opinion on their favourite discovery questions or qualification framework",
      "Has never built their own outbound pipeline — purely inbound dependent",
    ],
  },
  "customer-success-manager": {
    slug: "customer-success-manager",
    title: "Customer Success Manager",
    category: "Sales",
    metaTitle: "Customer Success Manager Interview Questions — KiteHR",
    metaDescription:
      "15 expert Customer Success Manager interview questions with answer guidance. Assess onboarding, retention, and expansion skills.",
    intro:
      "Great CSMs are proactive, commercially minded relationship builders who drive customer outcomes — not just reactive support providers. These questions assess strategic account management, churn identification, and the ability to drive expansion revenue.",
    behavioralQuestions: [
      {
        question: "Tell me about an at-risk customer you saved from churning. What early signals did you pick up on, and what did you do?",
        whatToLookFor: "Should describe specific health signals (low usage, executive sponsor departure, missed check-ins), a proactive intervention plan, and a measurable outcome.",
      },
      {
        question: "Describe the most complex onboarding you've led. What made it hard and how did you drive the customer to first value?",
        whatToLookFor: "Reveals onboarding methodology — milestone-driven, stakeholder coordination, change management. Strong candidates define 'first value' clearly and had a plan to reach it.",
      },
      {
        question: "Tell me about a time you identified an expansion opportunity that wasn't initially on your radar.",
        whatToLookFor: "Shows commercial awareness. Should describe a discovery process (QBR, usage review, business review conversation) that surfaced an unmet need, not just order-taking.",
      },
      {
        question: "How do you manage a book of business where customers have very different levels of engagement?",
        whatToLookFor: "Should describe a tiered engagement model (high-touch, scaled, digital) based on ARR, health score, and growth potential — not just spreading time evenly.",
      },
      {
        question: "Tell me about a time you had to deliver difficult feedback to a customer (e.g., a feature won't be built, a contract term they disliked).",
        whatToLookFor: "Shows professionalism and honesty. Should handle it directly but empathetically, with a plan to retain the relationship despite the bad news.",
      },
    ],
    technicalQuestions: [
      {
        question: "How do you build a health score for your book of business?",
        whatToLookFor: "Should describe a multi-dimensional model: product usage, NPS/CSAT, support ticket volume, licence utilisation, executive engagement, contract renewal date. Understands leading vs lagging indicators.",
      },
      {
        question: "How do you structure a QBR to demonstrate business value?",
        whatToLookFor: "Should describe a structured agenda: business goals review, usage and adoption metrics, ROI demonstrated, strategic roadmap discussion, and next quarter goals. Not just a product update.",
      },
      {
        question: "How do you handle a customer who is unhappy with the product but whose contract is up for renewal in 60 days?",
        whatToLookFor: "Should describe an emergency intervention plan: executive alignment, root cause analysis, specific remediation plan with timelines, and a formal success plan to rebuild trust.",
      },
      {
        question: "How do you position an upsell or expansion without it feeling like a pushy sales call?",
        whatToLookFor: "Strong CSMs connect expansion to customer-defined goals — they're expanding because it helps the customer, not just because the CSM has an expansion target.",
      },
      {
        question: "What tools do you use to manage your book of business, and how do you prioritise your week?",
        whatToLookFor: "Should describe a system: health score dashboards (Gainsight/ChurnZero), renewal date tracking, proactive vs reactive time allocation, and a weekly check-in cadence.",
      },
    ],
    redFlags: [
      "Defines customer success as 'making customers happy' without any commercial or outcome focus",
      "Cannot recall a specific churn save or expansion deal they drove",
      "Has never built a success plan or business case for a customer",
      "Treats all customers identically regardless of ARR or growth potential",
    ],
  },
  "product-designer": {
    slug: "product-designer",
    title: "Product Designer",
    category: "Design",
    metaTitle: "Product Designer Interview Questions — KiteHR",
    metaDescription:
      "15 expert Product Designer interview questions with answer guidance. Assess UX process, design thinking, and collaboration skills.",
    intro:
      "Great product designers combine user empathy, strong visual craft, and the ability to navigate ambiguity. These questions assess their end-to-end design process, how they handle constraints, and how effectively they collaborate with product and engineering.",
    behavioralQuestions: [
      {
        question: "Walk me through your design process for a recent complex feature — from initial problem to shipped product.",
        whatToLookFor: "Should show a structured process: problem framing, research, ideation, prototyping, testing, iteration, and delivery. Avoids jumping straight to Figma.",
      },
      {
        question: "Tell me about a time your design was significantly changed by engineering constraints. How did you handle it?",
        whatToLookFor: "Shows maturity — strong designers adapt without compromising core UX goals. Should describe the trade-off discussion and an alternative that preserved intent.",
      },
      {
        question: "Describe a situation where user research changed your design direction completely.",
        whatToLookFor: "Reveals whether they truly incorporate research or use it to validate pre-existing solutions. Look for genuine pivots based on user insight.",
      },
      {
        question: "How do you handle strong disagreements with a PM about a design direction?",
        whatToLookFor: "Should describe principled disagreement backed by user data or research, while remaining collaborative and flexible if the PM has valid business reasoning.",
      },
      {
        question: "Tell me about a design decision you're most proud of and one you'd do differently.",
        whatToLookFor: "Reveals self-reflection and growth. The 'do differently' answer is often more revealing than the success story.",
      },
    ],
    technicalQuestions: [
      {
        question: "How do you approach designing for accessibility from the start rather than retrofitting it?",
        whatToLookFor: "Should discuss semantic structure, colour contrast ratios, focus states, keyboard navigation, and using accessibility annotations in design files.",
      },
      {
        question: "How do you decide when to use a standard component vs. designing something custom?",
        whatToLookFor: "Should balance familiarity (standard patterns reduce cognitive load) against genuine UX gaps that custom components solve. Aware of implementation cost.",
      },
      {
        question: "Walk me through how you contribute to and maintain a design system.",
        whatToLookFor: "Should describe component architecture, token systems (spacing, colour, typography), documentation, and change management when updating shared components.",
      },
      {
        question: "How do you validate a design before handing it off to engineering?",
        whatToLookFor: "Should mention usability testing (even lightweight), prototype walkthroughs with stakeholders, design review sessions, and edge case/empty state documentation.",
      },
      {
        question: "How do you communicate your designs to engineers to minimise implementation gaps?",
        whatToLookFor: "Should describe annotated Figma files, design specs, interactive prototypes for complex interactions, and availability for questions during implementation.",
      },
    ],
    redFlags: [
      "Cannot explain their design rationale beyond 'it looked better'",
      "Has never run a usability test or conducted a user interview",
      "Treats accessibility as a compliance checkbox, not a design principle",
      "Becomes defensive when designs are challenged or changed",
    ],
  },
  "recruiter": {
    slug: "recruiter",
    title: "Recruiter",
    category: "HR",
    metaTitle: "Recruiter Interview Questions — KiteHR",
    metaDescription:
      "15 expert Recruiter interview questions with answer guidance. Assess sourcing, candidate experience, and hiring manager partnership.",
    intro:
      "Great recruiters are part sourcer, part advisor, and part project manager. These questions assess their ability to build talent pipelines, advise hiring managers, and deliver a consistent candidate experience at speed.",
    behavioralQuestions: [
      {
        question: "Tell me about a role you filled that was particularly hard to source for. What was your strategy?",
        whatToLookFor: "Should describe diversified sourcing beyond LinkedIn: niche communities, GitHub, conferences, referral programmes, Boolean search strings, and creative outreach personalisation.",
      },
      {
        question: "Describe a time a hiring manager had unrealistic expectations about a role. How did you handle it?",
        whatToLookFor: "Shows advisory confidence — should have data-backed conversations about market rates, talent availability, and trade-offs rather than just accepting impossible briefs.",
      },
      {
        question: "How do you deliver a great candidate experience while managing a high volume of applicants?",
        whatToLookFor: "Should describe processes: prompt acknowledgements, clear communication at each stage, personalised rejection messaging, and gathering feedback to improve.",
      },
      {
        question: "Tell me about a hire you made that didn't work out. What did you learn?",
        whatToLookFor: "Reveals self-awareness and process improvement mindset. Strong recruiters trace misses back to a gap in the process — unclear criteria, poor reference calls, or rushed timelines.",
      },
      {
        question: "How do you build a strong pipeline for roles before they're officially open?",
        whatToLookFor: "Shows strategic, proactive thinking — tracking competitors, warming talent pools, maintaining relationships with passive candidates, and workforce planning conversations with managers.",
      },
    ],
    technicalQuestions: [
      {
        question: "How do you write a sourcing Boolean string for a senior technical role? Give me an example.",
        whatToLookFor: "Should confidently demonstrate: AND/OR/NOT operators, quotation marks, site: operator, title variations, skill combinations — and explain the logic behind their construction.",
      },
      {
        question: "How do you structure an intake meeting with a new hiring manager to set the role up for success?",
        whatToLookFor: "Should cover: must-have vs nice-to-have criteria, ideal candidate profile, interview process design, timeline expectations, market context, and communication cadence.",
      },
      {
        question: "How do you assess culture fit without introducing bias into your process?",
        whatToLookFor: "Should distinguish between culture add (desired) and culture fit (risk of bias). Should describe structured interviews, consistent scoring rubrics, and diverse interviewer panels.",
      },
      {
        question: "How do you use data to improve your recruiting process?",
        whatToLookFor: "Should reference metrics: time-to-fill, source quality, offer acceptance rate, pass-through rates by stage, and D&I funnel analysis — not just total hires.",
      },
      {
        question: "How do you handle counter-offers when your finalist candidate gets one?",
        whatToLookFor: "Should describe early and continuous dialogue about candidate motivations, proactive close planning, and understanding what matters to the candidate beyond compensation.",
      },
    ],
    redFlags: [
      "Relies exclusively on LinkedIn and job boards — no creative sourcing strategies",
      "Cannot name key metrics from their previous role (time-to-fill, offer acceptance rate)",
      "Views relationship with hiring manager as order-taker, not strategic advisor",
      "Has no clear process for delivering feedback to rejected candidates",
    ],
  },
  "chief-of-staff": {
    slug: "chief-of-staff",
    title: "Chief of Staff",
    category: "Operations",
    metaTitle: "Chief of Staff Interview Questions — KiteHR",
    metaDescription:
      "15 expert Chief of Staff interview questions with answer guidance. Assess strategic thinking, executive partnership, and operational impact.",
    intro:
      "An exceptional Chief of Staff combines sharp analytical thinking with political intelligence and flawless execution. These questions assess whether a candidate can serve as a true force multiplier for the CEO while building trust across the organisation.",
    behavioralQuestions: [
      {
        question: "Tell me about a strategic initiative you drove from idea to execution. What was your role?",
        whatToLookFor: "Should demonstrate end-to-end ownership: problem definition, stakeholder alignment, project management, and impact measurement — not just facilitation.",
      },
      {
        question: "Describe a situation where you had to push back on the CEO or a senior leader. How did you approach it?",
        whatToLookFor: "Shows the ability to 'speak truth to power' — critical for a CoS. Should handle it with data, the right timing, and a constructive framing.",
      },
      {
        question: "How have you managed competing priorities between multiple senior leaders who all believe their projects are the top priority?",
        whatToLookFor: "Should describe a principled prioritisation framework tied to company-level goals, not personal relationships. Shows political acuity without politics.",
      },
      {
        question: "Tell me about a time you identified an organisational problem before it became a crisis.",
        whatToLookFor: "Shows pattern recognition and proactivity. Should describe clear early warning signals and a decisive response.",
      },
      {
        question: "How do you earn trust from the CEO and leadership team in the first 90 days?",
        whatToLookFor: "Should describe a structured listening tour, quick wins that demonstrate reliability, and careful management of information with discretion.",
      },
    ],
    technicalQuestions: [
      {
        question: "How do you design and run an effective leadership team meeting?",
        whatToLookFor: "Should describe agenda design (decision items vs. updates vs. discussions), pre-reads, facilitation techniques, decision logging, and follow-up tracking.",
      },
      {
        question: "How would you build a company-wide OKR process from scratch?",
        whatToLookFor: "Should cover: top-down strategy cascade, objective setting workshops, key result calibration, check-in cadence, and how to handle OKRs that consistently miss.",
      },
      {
        question: "How do you prepare a board deck for a quarterly business review?",
        whatToLookFor: "Should describe gathering inputs from function heads, synthesising financial and operational data, narrative structure, and distilling complexity into a clear story for the board.",
      },
      {
        question: "How do you manage confidential information as Chief of Staff?",
        whatToLookFor: "Should describe clear principles: need-to-know sharing, no corridor gossip, sensitivity to timing of announcements, and knowing when to escalate an information risk.",
      },
      {
        question: "How would you evaluate whether a new initiative should be added to the company's strategic priorities?",
        whatToLookFor: "Should apply a strategic filter: strategic alignment, resource requirements, opportunity cost, timing, and risk. Not just 'does the CEO want it?'",
      },
    ],
    redFlags: [
      "Sees the role primarily as calendar management and logistics — not strategic partnership",
      "Cannot demonstrate influence without formal authority",
      "Struggles to describe situations where they challenged leadership",
      "Has poor information hygiene — talks openly about confidential topics",
    ],
  },
  "data-scientist": {
    slug: "data-scientist",
    title: "Data Scientist",
    category: "Engineering",
    metaTitle: "Data Scientist Interview Questions — KiteHR",
    metaDescription:
      "15 expert Data Scientist interview questions with answer guidance. Assess statistical thinking, ML skills, and business communication.",
    intro:
      "Strong data scientists combine statistical rigour with business intuition and clear communication. These questions assess their ability to frame problems correctly, select appropriate methods, and translate findings into decisions.",
    behavioralQuestions: [
      {
        question: "Tell me about a data science project that had a significant business impact. How did you measure it?",
        whatToLookFor: "Should describe a clear problem, appropriate methodology, and a business metric that moved — not just a model accuracy improvement.",
      },
      {
        question: "Describe a time your analysis led to a conclusion that surprised the business. How did you communicate it?",
        whatToLookFor: "Shows communication skill and confidence in data-driven conclusions. Strong candidates find ways to tell uncomfortable truths constructively.",
      },
      {
        question: "Tell me about a time you realised your model had a flaw after deploying it. What did you do?",
        whatToLookFor: "Reveals intellectual honesty and monitoring practices. Should have a systematic response: root cause analysis, communication to stakeholders, remediation plan.",
      },
      {
        question: "How do you collaborate with software engineers to deploy a model to production?",
        whatToLookFor: "Should demonstrate ML engineering awareness: containerisation, API design, model versioning, monitoring, and rollback plans. Not just notebook → email to engineer.",
      },
    ],
    technicalQuestions: [
      {
        question: "How do you choose between a simpler model (logistic regression) and a more complex one (gradient boosting) for a classification task?",
        whatToLookFor: "Should consider: interpretability needs, data size, training/inference latency, overfitting risk, and whether the performance gain justifies the added complexity.",
      },
      {
        question: "Explain how you'd design an A/B test to measure the impact of a recommendation algorithm.",
        whatToLookFor: "Should cover: randomisation unit (user vs session), sample size calculation, primary/guardrail metrics, test duration (avoiding novelty effect), and statistical testing approach.",
      },
      {
        question: "How do you handle class imbalance in a classification problem?",
        whatToLookFor: "Should mention: resampling techniques (SMOTE, undersampling), class weights, threshold tuning, and appropriate evaluation metrics (F1, PR-AUC rather than accuracy).",
      },
      {
        question: "What is regularisation and when would you use L1 vs L2?",
        whatToLookFor: "L1 (Lasso) for feature selection/sparse models; L2 (Ridge) for handling multicollinearity and shrinking all coefficients. Should relate to the practical choice.",
      },
      {
        question: "How would you detect and address data leakage in a predictive model?",
        whatToLookFor: "Should explain leakage clearly, how to detect it (suspiciously high validation accuracy, feature importance surprises), and how to prevent it through proper train/test splits and temporal holdouts.",
      },
    ],
    redFlags: [
      "Optimises purely for model accuracy metrics without connecting to business value",
      "Cannot explain their model's predictions or limitations in plain language",
      "Has never monitored a deployed model or dealt with production drift",
      "Uses complex methods when simpler ones would suffice — complexity as a status signal",
    ],
  },
  "content-marketer": {
    slug: "content-marketer",
    title: "Content Marketer",
    category: "Marketing",
    metaTitle: "Content Marketer Interview Questions — KiteHR",
    metaDescription:
      "15 expert Content Marketer interview questions with answer guidance. Assess SEO skills, writing quality, and content strategy thinking.",
    intro:
      "Great content marketers combine strategic thinking, SEO fluency, and outstanding writing craft. These questions assess whether candidates can build a content engine that drives organic growth, not just publish blog posts.",
    behavioralQuestions: [
      {
        question: "Tell me about a piece of content you created that had a significant impact on organic traffic or pipeline. Walk me through your process.",
        whatToLookFor: "Should describe keyword strategy, content creation, on-page optimisation, distribution, and measurable results. Not just 'I wrote a blog post'.",
      },
      {
        question: "How do you decide what to write about when you have limited resources?",
        whatToLookFor: "Should describe a systematic prioritisation approach: keyword difficulty vs. volume, business priority, funnel stage, competitive gap analysis — not just personal interest.",
      },
      {
        question: "Describe a time you had to repurpose or update existing content instead of creating something new. What was your approach?",
        whatToLookFor: "Shows understanding that content refresh can outperform new content. Should describe audit process, identifying under-performers with high potential, and specific improvements made.",
      },
      {
        question: "How do you collaborate with subject matter experts (e.g., engineers, founders) who are too busy to contribute?",
        whatToLookFor: "Should describe efficient interview formats (30-min calls, async written Q&As), extraction templates, and ghostwriting processes that minimise expert time.",
      },
    ],
    technicalQuestions: [
      {
        question: "How do you conduct keyword research for a new content topic?",
        whatToLookFor: "Should describe a full process: seed keywords, Ahrefs/SEMrush exploration, SERP analysis to understand intent, difficulty assessment, and clustering into topic pillars.",
      },
      {
        question: "How do you optimise a blog post for SEO without making it feel formulaic?",
        whatToLookFor: "Should balance: primary keyword in title/H1, semantic keywords throughout, internal linking, meta description, image alt text, and structured data — while maintaining readability.",
      },
      {
        question: "How do you measure the ROI of content marketing?",
        whatToLookFor: "Should describe a multi-touch attribution approach: organic sessions, MQLs sourced from content, assisted conversions, and pipeline influenced by content. Not just pageviews.",
      },
      {
        question: "Walk me through how you'd build a content calendar for a new B2B SaaS company from scratch.",
        whatToLookFor: "Should describe: ICP definition, keyword gap analysis, competitor content audit, funnel stage mapping (TOFU/MOFU/BOFU), editorial rhythm, and distribution channels.",
      },
    ],
    redFlags: [
      "Measures content success only in pageviews with no connection to pipeline or revenue",
      "Cannot describe a keyword research process beyond 'Googling ideas'",
      "Has never updated or refreshed existing content",
      "Writes for search engines rather than for humans",
    ],
  },
};

export function getInterviewQuestionsRole(slug: string): InterviewQuestionsRole | null {
  return interviewQuestionsRoles[slug] ?? null;
}

export function getAllInterviewQuestionsSlugs(): string[] {
  return Object.keys(interviewQuestionsRoles);
}

export const interviewQuestionsRolesList = Object.values(interviewQuestionsRoles);
