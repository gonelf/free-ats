export type JobDescriptionRole = {
  slug: string;
  title: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  skills: string[];
  salaryRange: string;
};

export const jobDescriptionRoles: Record<string, JobDescriptionRole> = {
  "senior-react-developer": {
    slug: "senior-react-developer",
    title: "Senior React Developer",
    category: "Engineering",
    metaTitle: "Senior React Developer Job Description Template — KiteHR",
    metaDescription:
      "Free Senior React Developer job description template. Copy-paste ready with responsibilities, requirements, and skills. Post the role on KiteHR in minutes.",
    overview:
      "A Senior React Developer designs and builds high-performance web interfaces using React and its ecosystem. They take ownership of front-end architecture, mentor junior engineers, and collaborate closely with product and design teams to ship reliable, accessible user experiences.",
    responsibilities: [
      "Design and implement scalable, reusable React components and front-end architecture",
      "Optimise application performance through code splitting, lazy loading, and bundle analysis",
      "Write clean, well-tested TypeScript with high unit and integration test coverage",
      "Collaborate with designers to translate Figma designs into pixel-perfect UIs",
      "Lead code reviews and set front-end standards across the engineering team",
      "Participate in sprint planning, estimations, and technical roadmap discussions",
      "Identify and resolve cross-browser and accessibility issues",
      "Mentor junior developers through pair programming and constructive feedback",
    ],
    requirements: [
      "4+ years of professional experience with React and modern JavaScript/TypeScript",
      "Strong understanding of React hooks, context, and state management patterns (Redux, Zustand, or similar)",
      "Experience with REST and GraphQL APIs and async data-fetching patterns",
      "Proficiency with testing tools such as Jest, React Testing Library, or Cypress",
      "Familiarity with CI/CD pipelines and version control best practices (Git)",
      "Excellent communication skills and ability to work in a cross-functional team",
    ],
    niceToHave: [
      "Experience with Next.js or Remix for server-side rendering",
      "Knowledge of web performance metrics (Core Web Vitals) and optimisation techniques",
      "Contributions to open-source projects",
      "Experience in a fast-paced startup or scale-up environment",
    ],
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "Jest", "CSS-in-JS", "Figma", "Git"],
    salaryRange: "$130,000 – $170,000",
  },
  "backend-engineer": {
    slug: "backend-engineer",
    title: "Backend Engineer",
    category: "Engineering",
    metaTitle: "Backend Engineer Job Description Template — KiteHR",
    metaDescription:
      "Free Backend Engineer job description template with responsibilities and requirements. Customise and post in minutes using KiteHR.",
    overview:
      "A Backend Engineer builds and maintains server-side systems, APIs, and databases that power our product. They design for scale, reliability, and security while working closely with frontend engineers and product managers to deliver features end-to-end.",
    responsibilities: [
      "Design, develop, and maintain RESTful and GraphQL APIs",
      "Build and optimise database schemas, queries, and data pipelines",
      "Write robust, well-tested code with thorough documentation",
      "Collaborate with front-end engineers to define API contracts",
      "Contribute to infrastructure decisions: containerisation, CI/CD, cloud services",
      "Participate in on-call rotations and respond to production incidents",
      "Review pull requests and uphold engineering standards",
    ],
    requirements: [
      "3+ years of backend engineering experience in Node.js, Go, Python, or Java",
      "Strong understanding of relational databases (PostgreSQL, MySQL) and query optimisation",
      "Experience building and versioning RESTful or GraphQL APIs",
      "Familiarity with cloud platforms (AWS, GCP, or Azure) and containerisation (Docker/Kubernetes)",
      "Understanding of authentication patterns (JWT, OAuth 2.0)",
      "Solid grasp of software design principles and clean code practices",
    ],
    niceToHave: [
      "Experience with event-driven architecture and message queues (Kafka, RabbitMQ)",
      "Knowledge of caching strategies (Redis, Memcached)",
      "Prior experience at a high-growth SaaS company",
    ],
    skills: ["Node.js", "PostgreSQL", "Docker", "REST APIs", "AWS", "Redis", "TypeScript", "CI/CD"],
    salaryRange: "$120,000 – $160,000",
  },
  "devops-engineer": {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    category: "Engineering",
    metaTitle: "DevOps Engineer Job Description Template — KiteHR",
    metaDescription:
      "Free DevOps Engineer job description template. Ready-to-post with key responsibilities, requirements, and must-have skills.",
    overview:
      "A DevOps Engineer bridges development and operations to improve the speed, reliability, and security of our software delivery pipeline. They own infrastructure-as-code, CI/CD systems, and cloud environments while embedding a culture of automation across the engineering organisation.",
    responsibilities: [
      "Design and maintain CI/CD pipelines using GitHub Actions, CircleCI, or Jenkins",
      "Manage cloud infrastructure on AWS/GCP/Azure using Terraform or Pulumi",
      "Monitor system health, define alerting thresholds, and lead incident response",
      "Implement container orchestration with Kubernetes or ECS",
      "Enforce security best practices: secrets management, vulnerability scanning, access controls",
      "Collaborate with engineering teams to improve deployment frequency and reduce lead time",
      "Document infrastructure architecture and runbooks",
    ],
    requirements: [
      "3+ years of experience in a DevOps, SRE, or platform engineering role",
      "Strong knowledge of AWS, GCP, or Azure services",
      "Proficiency with Infrastructure-as-Code tools (Terraform, CDK, or Pulumi)",
      "Hands-on experience with Docker and Kubernetes in production",
      "Scripting skills in Bash, Python, or Go",
      "Understanding of networking, DNS, load balancing, and TLS/SSL",
    ],
    niceToHave: [
      "Relevant cloud certifications (AWS Solutions Architect, GCP Professional)",
      "Experience with observability stacks (Datadog, Grafana, Prometheus)",
      "Background in SRE practices and SLO/SLA management",
    ],
    skills: ["Kubernetes", "Terraform", "AWS", "Docker", "CI/CD", "Prometheus", "Bash", "Python"],
    salaryRange: "$120,000 – $165,000",
  },
  "data-scientist": {
    slug: "data-scientist",
    title: "Data Scientist",
    category: "Engineering",
    metaTitle: "Data Scientist Job Description Template — KiteHR",
    metaDescription:
      "Free Data Scientist job description template. Copy-paste ready for your next hire — customise and post for free on KiteHR.",
    overview:
      "A Data Scientist extracts actionable insights from large, complex datasets to drive product and business decisions. They design and deploy machine learning models, build analytical pipelines, and communicate findings clearly to both technical and non-technical stakeholders.",
    responsibilities: [
      "Analyse large datasets to identify trends, patterns, and business opportunities",
      "Build, train, and evaluate machine learning models for prediction and classification tasks",
      "Collaborate with product and engineering to scope, instrument, and interpret A/B experiments",
      "Develop dashboards and visualisations to communicate insights to leadership",
      "Maintain and improve data pipelines and feature stores",
      "Translate complex analyses into clear, actionable recommendations",
    ],
    requirements: [
      "3+ years of experience in a data science or machine learning role",
      "Proficiency in Python (pandas, scikit-learn, NumPy) and SQL",
      "Experience with ML frameworks such as TensorFlow, PyTorch, or XGBoost",
      "Strong statistical foundations: regression, hypothesis testing, Bayesian inference",
      "Ability to write production-quality code and work in a version-controlled environment",
      "Excellent data visualisation skills (Matplotlib, Plotly, or Tableau)",
    ],
    niceToHave: [
      "Experience with distributed computing (Spark, Dask)",
      "Familiarity with MLOps tools (MLflow, Weights & Biases)",
      "Background in NLP or computer vision",
    ],
    skills: ["Python", "SQL", "scikit-learn", "PyTorch", "Spark", "A/B Testing", "Tableau", "Statistics"],
    salaryRange: "$115,000 – $160,000",
  },
  "machine-learning-engineer": {
    slug: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    category: "Engineering",
    metaTitle: "Machine Learning Engineer Job Description Template — KiteHR",
    metaDescription:
      "Free Machine Learning Engineer job description template with clear responsibilities and requirements. Post your ML role on KiteHR for free.",
    overview:
      "A Machine Learning Engineer operationalises ML research into production systems. They build scalable model training pipelines, deployment infrastructure, and monitoring tooling, working at the intersection of software engineering and data science.",
    responsibilities: [
      "Build and maintain end-to-end ML pipelines from data ingestion to model serving",
      "Deploy models to production using REST APIs, batch jobs, or streaming systems",
      "Optimise models for latency, throughput, and cost at scale",
      "Collaborate with data scientists to move experiments to production",
      "Implement model monitoring to detect drift and performance degradation",
      "Write high-quality, well-tested Python and contribute to shared ML platform tooling",
    ],
    requirements: [
      "3+ years of ML engineering or software engineering with heavy ML experience",
      "Strong Python skills and familiarity with PyTorch or TensorFlow",
      "Experience deploying models using FastAPI, TorchServe, TensorFlow Serving, or similar",
      "Solid understanding of software engineering: testing, CI/CD, containerisation",
      "Experience with cloud ML services (SageMaker, Vertex AI, or Azure ML)",
    ],
    niceToHave: [
      "Experience with feature stores (Feast, Tecton)",
      "Knowledge of LLM fine-tuning and inference optimisation",
      "Background in real-time streaming (Kafka, Flink)",
    ],
    skills: ["Python", "PyTorch", "MLflow", "FastAPI", "Docker", "AWS SageMaker", "Feature Stores", "SQL"],
    salaryRange: "$130,000 – $175,000",
  },
  "full-stack-developer": {
    slug: "full-stack-developer",
    title: "Full-Stack Developer",
    category: "Engineering",
    metaTitle: "Full-Stack Developer Job Description Template — KiteHR",
    metaDescription:
      "Free Full-Stack Developer job description template. Download, customise, and post your role on KiteHR in under 5 minutes.",
    overview:
      "A Full-Stack Developer builds product features across the entire stack — from database schema to pixel-perfect UI. They move fluidly between back-end APIs, front-end components, and infrastructure concerns, making them a force multiplier in small and growing teams.",
    responsibilities: [
      "Develop and maintain features across React/Next.js frontends and Node.js backends",
      "Design and manage PostgreSQL or MongoDB database schemas",
      "Build and consume RESTful or GraphQL APIs",
      "Write automated tests (unit, integration, E2E) to maintain code quality",
      "Participate in architecture discussions and contribute to technical decisions",
      "Review code and provide constructive feedback to peers",
    ],
    requirements: [
      "3+ years of full-stack development experience",
      "Proficiency with React (or Vue/Angular) and a Node.js back-end framework (Express, Fastify, NestJS)",
      "Solid SQL skills and database design experience",
      "Familiarity with cloud deployment and containerisation (Docker, AWS/GCP)",
      "Strong command of Git and collaborative development workflows",
    ],
    niceToHave: [
      "Experience with Next.js and server-side rendering patterns",
      "Exposure to TypeScript, GraphQL, or tRPC",
      "Interest in developer tooling, DX, and performance optimisation",
    ],
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "GraphQL", "Next.js", "AWS"],
    salaryRange: "$100,000 – $145,000",
  },
  "mobile-developer": {
    slug: "mobile-developer",
    title: "Mobile Developer",
    category: "Engineering",
    metaTitle: "Mobile Developer Job Description Template — KiteHR",
    metaDescription:
      "Free Mobile Developer job description template covering iOS, Android, and React Native roles. Post for free on KiteHR.",
    overview:
      "A Mobile Developer builds and ships high-quality native or cross-platform mobile applications. They own the full mobile development lifecycle — from design handoff through App Store release — and advocate for outstanding mobile UX.",
    responsibilities: [
      "Develop and ship features for iOS and/or Android using React Native, Swift, or Kotlin",
      "Collaborate with designers to implement smooth, accessible mobile UIs",
      "Integrate with backend APIs and handle complex state management",
      "Optimise app performance, memory usage, and battery efficiency",
      "Write unit and integration tests and maintain a healthy test suite",
      "Manage App Store and Google Play release cycles",
    ],
    requirements: [
      "3+ years of mobile development experience (React Native, Swift, or Kotlin)",
      "Strong understanding of mobile UX patterns and platform-specific guidelines (HIG, Material)",
      "Experience with app performance profiling and debugging tools",
      "Familiarity with state management libraries (Redux, MobX, or Zustand for RN)",
      "Experience with CI/CD pipelines for mobile (Fastlane, Bitrise, or EAS)",
    ],
    niceToHave: [
      "Experience shipping apps with 100k+ DAU",
      "Knowledge of native modules bridging and platform-specific optimisations",
      "Familiarity with Expo managed workflow",
    ],
    skills: ["React Native", "Swift", "Kotlin", "TypeScript", "Fastlane", "Redux", "Jest", "Xcode"],
    salaryRange: "$115,000 – $155,000",
  },
  "security-engineer": {
    slug: "security-engineer",
    title: "Security Engineer",
    category: "Engineering",
    metaTitle: "Security Engineer Job Description Template — KiteHR",
    metaDescription:
      "Free Security Engineer job description template. Ready to post — covers AppSec, cloud security, and infrastructure hardening.",
    overview:
      "A Security Engineer protects our systems, data, and customers by building security into every layer of our product and infrastructure. They lead vulnerability assessments, define security standards, and partner with engineering to make security a shared responsibility.",
    responsibilities: [
      "Conduct threat modelling, security reviews, and penetration tests on new and existing systems",
      "Define and enforce secure SDLC practices across engineering teams",
      "Manage vulnerability scanning, SIEM tooling, and incident response playbooks",
      "Harden cloud infrastructure and implement least-privilege IAM policies",
      "Lead compliance efforts (SOC 2, ISO 27001, GDPR) and liaise with auditors",
      "Build security awareness and training programmes for the broader team",
    ],
    requirements: [
      "3+ years in application security, cloud security, or information security",
      "Deep understanding of OWASP Top 10, common attack vectors, and mitigations",
      "Hands-on experience with cloud security on AWS, GCP, or Azure",
      "Proficiency with penetration testing tools and scripting in Python or Bash",
      "Knowledge of network security, PKI, and cryptography fundamentals",
    ],
    niceToHave: [
      "OSCP, CISSP, or AWS Security Specialty certification",
      "Experience with zero-trust architecture and service mesh security",
      "Background in bug bounty hunting or responsible disclosure",
    ],
    skills: ["OWASP", "AWS Security", "Terraform", "Python", "Burp Suite", "SOC 2", "IAM", "SIEM"],
    salaryRange: "$130,000 – $170,000",
  },
  "qa-engineer": {
    slug: "qa-engineer",
    title: "QA Engineer",
    category: "Engineering",
    metaTitle: "QA Engineer Job Description Template — KiteHR",
    metaDescription:
      "Free QA Engineer job description template. Covers manual and automation QA roles — copy, customise, and post for free.",
    overview:
      "A QA Engineer owns the quality of our product by designing, implementing, and maintaining comprehensive testing strategies. They champion a quality-first culture, build automated test suites, and collaborate with engineers to catch issues before they reach customers.",
    responsibilities: [
      "Design and execute manual and automated test cases for new features and regression",
      "Build and maintain E2E test suites using Playwright, Cypress, or Selenium",
      "Collaborate with engineers to define acceptance criteria and testability requirements",
      "Report, triage, and track bugs through to resolution",
      "Establish quality metrics and dashboards to monitor test coverage and defect rates",
      "Participate in sprint planning to provide quality-focused estimates and risk assessments",
    ],
    requirements: [
      "2+ years of QA engineering experience in an agile environment",
      "Experience writing automated tests in Playwright, Cypress, or Selenium",
      "Solid understanding of testing methodologies (unit, integration, E2E, regression)",
      "Familiarity with API testing tools (Postman, REST Assured)",
      "Strong analytical thinking and attention to detail",
    ],
    niceToHave: [
      "Experience with performance testing tools (k6, Locust, JMeter)",
      "Background in writing SQL queries to validate data integrity",
      "ISTQB certification",
    ],
    skills: ["Playwright", "Cypress", "Postman", "Jest", "SQL", "JIRA", "Python", "CI/CD"],
    salaryRange: "$85,000 – $125,000",
  },
  "engineering-manager": {
    slug: "engineering-manager",
    title: "Engineering Manager",
    category: "Engineering",
    metaTitle: "Engineering Manager Job Description Template — KiteHR",
    metaDescription:
      "Free Engineering Manager job description template. Clear responsibilities and requirements — post your EM role for free on KiteHR.",
    overview:
      "An Engineering Manager leads a team of engineers to deliver high-quality software while growing individuals and improving team processes. They balance technical leadership with people management, bridging product, design, and engineering to ship impactful work.",
    responsibilities: [
      "Manage, mentor, and grow a team of 5–10 engineers through 1:1s, reviews, and coaching",
      "Drive delivery of product roadmap items: planning, estimation, and unblocking the team",
      "Partner with product managers and designers to define scope and technical approaches",
      "Lead hiring: job postings, interviews, offer negotiations, and onboarding",
      "Define team rituals, engineering processes, and standards",
      "Be a technical voice in architecture discussions without being a bottleneck",
    ],
    requirements: [
      "2+ years of engineering management experience (managing teams of 3+)",
      "5+ years of hands-on software engineering experience",
      "Strong understanding of agile methodologies and software delivery principles",
      "Excellent communication and ability to give direct, actionable feedback",
      "Track record of developing engineers into senior or staff roles",
    ],
    niceToHave: [
      "Experience managing distributed or remote-first engineering teams",
      "Prior experience at a B2B SaaS company",
      "Background in full-stack or platform engineering",
    ],
    skills: ["Team Leadership", "Agile/Scrum", "Hiring", "Technical Roadmapping", "1:1s", "OKRs"],
    salaryRange: "$150,000 – $200,000",
  },

  // Marketing
  "content-marketer": {
    slug: "content-marketer",
    title: "Content Marketer",
    category: "Marketing",
    metaTitle: "Content Marketer Job Description Template — KiteHR",
    metaDescription:
      "Free Content Marketer job description template. Covers blog, SEO, and content strategy roles — post for free on KiteHR.",
    overview:
      "A Content Marketer plans, creates, and distributes high-quality content that drives organic traffic, builds brand authority, and generates leads. They are equal parts writer, strategist, and analyst, owning the content calendar from ideation to performance reporting.",
    responsibilities: [
      "Develop and execute a content strategy aligned to SEO and demand generation goals",
      "Write long-form blog posts, guides, case studies, and landing page copy",
      "Conduct keyword research and optimise existing content for organic search",
      "Manage the editorial calendar and coordinate freelance writers",
      "Collaborate with design to produce visual assets and infographics",
      "Track content performance metrics (organic traffic, MQLs, time on page) and iterate",
    ],
    requirements: [
      "2+ years of B2B content marketing experience",
      "Exceptional writing and editing skills with a strong portfolio",
      "Hands-on experience with SEO tools (Ahrefs, SEMrush, or Moz)",
      "Familiarity with CMS platforms (WordPress, Webflow, or Contentful)",
      "Data-driven mindset: comfortable pulling data from GA4 and optimising based on results",
    ],
    niceToHave: [
      "Experience with content distribution and email newsletter programmes",
      "Background in SaaS or HR tech",
      "Video or podcast production experience",
    ],
    skills: ["SEO", "Ahrefs", "WordPress", "Copywriting", "GA4", "HubSpot", "Figma", "AI Writing Tools"],
    salaryRange: "$65,000 – $95,000",
  },
  "seo-specialist": {
    slug: "seo-specialist",
    title: "SEO Specialist",
    category: "Marketing",
    metaTitle: "SEO Specialist Job Description Template — KiteHR",
    metaDescription:
      "Free SEO Specialist job description template. Ready to post — covers technical SEO, content SEO, and link building.",
    overview:
      "An SEO Specialist drives organic search growth by optimising our website's technical health, content, and authority. They conduct audits, build keyword strategies, and collaborate with content and engineering teams to improve rankings and qualified traffic.",
    responsibilities: [
      "Conduct comprehensive technical SEO audits and implement fixes (crawlability, Core Web Vitals, structured data)",
      "Build and maintain a keyword strategy targeting commercial and informational intent",
      "Manage on-page optimisation across landing pages, blog posts, and product pages",
      "Lead link-building outreach and digital PR campaigns",
      "Monitor rankings, traffic, and conversions using Google Search Console, GA4, and Ahrefs",
      "Brief and review SEO-optimised content from the content team",
    ],
    requirements: [
      "2+ years of SEO experience, ideally in a B2B SaaS environment",
      "Proficiency with Ahrefs, SEMrush, or Moz for keyword research and competitor analysis",
      "Strong understanding of technical SEO: sitemaps, schema markup, page speed, crawl budget",
      "Ability to interpret data and communicate findings to non-technical stakeholders",
      "Basic HTML/CSS knowledge to implement on-page changes",
    ],
    niceToHave: [
      "Experience with programmatic SEO or large-scale content operations",
      "Familiarity with Python or JavaScript for SEO automation",
      "Background in content marketing or digital PR",
    ],
    skills: ["Ahrefs", "SEMrush", "Google Search Console", "GA4", "Schema Markup", "HTML", "Link Building"],
    salaryRange: "$60,000 – $90,000",
  },
  "growth-marketer": {
    slug: "growth-marketer",
    title: "Growth Marketer",
    category: "Marketing",
    metaTitle: "Growth Marketer Job Description Template — KiteHR",
    metaDescription:
      "Free Growth Marketer job description template. Covers acquisition, experimentation, and funnel optimisation roles.",
    overview:
      "A Growth Marketer owns the full acquisition and activation funnel, using data-driven experimentation to find and scale channels that drive sustainable growth. They are hands-on, fast-moving, and comfortable operating across paid, organic, product, and lifecycle marketing.",
    responsibilities: [
      "Identify, test, and scale new acquisition channels (paid, SEO, partnerships, product-led)",
      "Design and run structured A/B experiments across ads, landing pages, and onboarding flows",
      "Manage paid media budgets across Google Ads, Meta, and LinkedIn",
      "Analyse funnel data to identify conversion drop-offs and prioritise experiments",
      "Work with engineering and product on growth loops and referral mechanisms",
      "Report weekly on acquisition metrics: CAC, MQLs, trial signups, and activation rate",
    ],
    requirements: [
      "2+ years in a growth marketing, performance marketing, or demand generation role",
      "Hands-on experience running paid campaigns across Google, Meta, or LinkedIn",
      "Strong analytical skills: SQL or Google Sheets proficiency, experience with attribution models",
      "Familiarity with marketing automation and CRM tools (HubSpot, Segment, Mixpanel)",
      "Scrappy, self-starting mindset with a bias for action and experimentation",
    ],
    niceToHave: [
      "Experience at a PLG (product-led growth) SaaS company",
      "Background in email lifecycle marketing and drip campaigns",
      "Knowledge of SQL for building custom cohort analyses",
    ],
    skills: ["Google Ads", "Meta Ads", "HubSpot", "Mixpanel", "SQL", "A/B Testing", "GA4", "Segment"],
    salaryRange: "$75,000 – $115,000",
  },
  "demand-generation-manager": {
    slug: "demand-generation-manager",
    title: "Demand Generation Manager",
    category: "Marketing",
    metaTitle: "Demand Generation Manager Job Description Template — KiteHR",
    metaDescription:
      "Free Demand Generation Manager job description template. Copy, customise, and post your demand gen role on KiteHR.",
    overview:
      "A Demand Generation Manager drives pipeline and revenue by building and executing integrated marketing programmes that generate qualified demand. They own the full funnel from awareness to MQL, partnering closely with sales to ensure marketing-sourced pipeline converts.",
    responsibilities: [
      "Build and execute multi-channel demand generation programmes (paid, events, content syndication, webinars)",
      "Own the MQL target and pipeline contribution from marketing",
      "Manage marketing automation workflows and lead nurture sequences in HubSpot or Marketo",
      "Partner with SDRs and AEs to define MQL criteria and improve lead quality",
      "Analyse campaign performance and allocate budget to highest-ROI channels",
      "Report monthly on pipeline metrics: MQLs, SALs, SQL conversion rates",
    ],
    requirements: [
      "4+ years of B2B demand generation or integrated marketing experience",
      "Proficiency with marketing automation platforms (HubSpot, Marketo, or Pardot)",
      "Strong understanding of the B2B buyer journey and full-funnel marketing",
      "Experience with paid media, content marketing, and event marketing",
      "Data-driven with the ability to build dashboards and attribution reports",
    ],
    niceToHave: [
      "Experience at a company with an ABM programme",
      "Background in SaaS with ACV > $10k",
      "Familiarity with Salesforce CRM and revenue operations tooling",
    ],
    skills: ["HubSpot", "Marketo", "Salesforce", "LinkedIn Ads", "ABM", "Webinar Platforms", "SQL", "Attribution"],
    salaryRange: "$85,000 – $130,000",
  },
  "product-marketing-manager": {
    slug: "product-marketing-manager",
    title: "Product Marketing Manager",
    category: "Marketing",
    metaTitle: "Product Marketing Manager Job Description Template — KiteHR",
    metaDescription:
      "Free Product Marketing Manager job description template. Covers positioning, GTM, and competitive intelligence roles.",
    overview:
      "A Product Marketing Manager sits at the intersection of product, sales, and marketing, owning the positioning, messaging, and go-to-market strategy for our product. They translate product capabilities into compelling narratives that drive acquisition, activation, and retention.",
    responsibilities: [
      "Develop and maintain product positioning, messaging frameworks, and ICP definitions",
      "Lead go-to-market launches for new features, collaborating with product and sales",
      "Create sales enablement assets: pitch decks, battlecards, one-pagers, and demo scripts",
      "Conduct competitive intelligence and maintain up-to-date competitive landscape analysis",
      "Work with content and growth teams to develop category-level marketing programmes",
      "Run win/loss interviews with customers and prospects to sharpen positioning",
    ],
    requirements: [
      "3+ years of product marketing experience in B2B SaaS",
      "Exceptional writing and storytelling skills — can distil complexity into simple narratives",
      "Experience running full product launches from beta to GA",
      "Strong cross-functional collaboration skills (product, sales, design, marketing)",
      "Data fluency: comfortable using product analytics and CRM data to validate messaging",
    ],
    niceToHave: [
      "Background as an AE or in a sales-facing role",
      "Experience in HR tech, recruiting, or adjacent SaaS verticals",
      "Familiarity with Salesforce and pipeline data for revenue attribution",
    ],
    skills: ["Positioning", "GTM Strategy", "Salesforce", "HubSpot", "Competitive Intel", "Copywriting", "Figma"],
    salaryRange: "$100,000 – $145,000",
  },
  "social-media-manager": {
    slug: "social-media-manager",
    title: "Social Media Manager",
    category: "Marketing",
    metaTitle: "Social Media Manager Job Description Template — KiteHR",
    metaDescription:
      "Free Social Media Manager job description template. Post your social role on KiteHR for free in minutes.",
    overview:
      "A Social Media Manager builds our brand presence and community across LinkedIn, Twitter/X, Instagram, and other relevant platforms. They create engaging content, grow our following, and turn social into a meaningful channel for brand awareness and lead generation.",
    responsibilities: [
      "Own social media strategy and content calendar across LinkedIn, Twitter/X, and Instagram",
      "Create written, visual, and short-form video content natively suited to each platform",
      "Engage with our audience, respond to comments, and build community",
      "Run paid social campaigns and manage targeting and budget",
      "Track performance metrics (reach, engagement, follower growth, clicks) and report monthly",
      "Collaborate with content and design teams to amplify blog content and campaigns",
    ],
    requirements: [
      "2+ years managing social media for a B2B brand",
      "Strong writing and copywriting skills, with an ear for platform-native voice",
      "Experience with social media management tools (Buffer, Hootsuite, or Sprout Social)",
      "Proficiency in Canva or Adobe for creating graphics and short videos",
      "Analytical mindset — comfortable pulling performance data and optimising based on insights",
    ],
    niceToHave: [
      "Experience growing a LinkedIn company page from scratch",
      "Video editing skills (CapCut, DaVinci Resolve)",
      "Background in influencer partnerships or employee advocacy programmes",
    ],
    skills: ["LinkedIn", "Twitter/X", "Canva", "Buffer", "Copywriting", "Video Editing", "Analytics"],
    salaryRange: "$55,000 – $80,000",
  },
  "email-marketing-specialist": {
    slug: "email-marketing-specialist",
    title: "Email Marketing Specialist",
    category: "Marketing",
    metaTitle: "Email Marketing Specialist Job Description Template — KiteHR",
    metaDescription:
      "Free Email Marketing Specialist job description template. Post your email marketing role on KiteHR for free.",
    overview:
      "An Email Marketing Specialist manages our email programmes to nurture leads, activate new users, and retain customers. They write compelling email copy, build automated workflows, and continuously optimise campaigns for open rates, click-through, and conversion.",
    responsibilities: [
      "Plan and execute email campaigns including newsletters, nurture sequences, and product announcements",
      "Build and maintain automated lifecycle email workflows in HubSpot, Klaviyo, or Customer.io",
      "Write and A/B test subject lines, CTAs, and email body copy",
      "Segment lists to personalise messaging at scale",
      "Monitor deliverability, bounce rates, and unsubscribes; maintain list hygiene",
      "Report on email performance: open rate, CTR, CTOR, conversion rate, and revenue attributed",
    ],
    requirements: [
      "2+ years of email marketing experience in a B2B or SaaS environment",
      "Hands-on experience with email platforms (HubSpot, Mailchimp, Klaviyo, or Customer.io)",
      "Strong copywriting skills with a data-driven approach to optimisation",
      "Understanding of email deliverability best practices (SPF, DKIM, DMARC)",
      "Basic HTML knowledge for editing responsive email templates",
    ],
    niceToHave: [
      "Experience with liquid templating or dynamic personalisation in emails",
      "Knowledge of GDPR and CAN-SPAM compliance requirements",
      "Background in marketing automation and lead scoring",
    ],
    skills: ["HubSpot", "Klaviyo", "Copywriting", "A/B Testing", "HTML Email", "Segmentation", "Deliverability"],
    salaryRange: "$55,000 – $85,000",
  },

  // Sales
  "account-executive": {
    slug: "account-executive",
    title: "Account Executive",
    category: "Sales",
    metaTitle: "Account Executive Job Description Template — KiteHR",
    metaDescription:
      "Free Account Executive job description template. Copy, customise, and post your AE role on KiteHR in minutes.",
    overview:
      "An Account Executive owns the full sales cycle from discovery to close for mid-market and enterprise prospects. They build relationships with buying committees, deliver compelling demos, and consistently hit or exceed quota while feeding learnings back into the go-to-market strategy.",
    responsibilities: [
      "Manage a pipeline of qualified opportunities from SQLs through to signed contract",
      "Run tailored discovery calls and product demos with economic buyers and champions",
      "Navigate complex, multi-stakeholder deals with procurement, legal, and IT teams",
      "Create and negotiate commercial proposals, MSAs, and SLAs",
      "Maintain accurate pipeline hygiene in Salesforce and forecast reliably",
      "Collaborate with SDRs to refine outbound sequences and target account lists",
      "Feed deal learnings to product marketing to sharpen positioning",
    ],
    requirements: [
      "3+ years of B2B SaaS closing experience, hitting or exceeding quota",
      "Demonstrated success with mid-market deals ($15k–$100k ACV)",
      "Strong command of a sales methodology (MEDDIC, Challenger, SPICED)",
      "Excellent communication and executive presence on video and in-person",
      "Proficiency with Salesforce CRM and sales engagement tools (Outreach, Salesloft)",
    ],
    niceToHave: [
      "Experience selling into HR, People Ops, or finance buyers",
      "Background in a PLG company transitioning to sales-assisted motions",
      "Track record of landing logo accounts that later expanded significantly",
    ],
    skills: ["Salesforce", "Outreach", "MEDDIC", "Demo", "Negotiation", "Forecasting", "HubSpot"],
    salaryRange: "$80,000 – $120,000 base + commission",
  },
  "sales-development-representative": {
    slug: "sales-development-representative",
    title: "Sales Development Representative",
    category: "Sales",
    metaTitle: "Sales Development Representative Job Description Template — KiteHR",
    metaDescription:
      "Free Sales Development Representative (SDR) job description template. Post your SDR role on KiteHR for free.",
    overview:
      "A Sales Development Representative (SDR) generates pipeline by identifying, researching, and qualifying outbound and inbound leads. They are the first point of contact for prospective customers and set up qualified meetings for the Account Executive team.",
    responsibilities: [
      "Research and identify target accounts and personas within the ICP",
      "Execute personalised multi-channel outbound sequences (email, LinkedIn, phone)",
      "Qualify inbound leads and route to the appropriate AE within defined SLAs",
      "Book discovery calls and hand off to AEs with thorough qualification notes",
      "Maintain clean, accurate data in Salesforce and prospecting tools",
      "Hit weekly and monthly activity targets (touches, connects, meetings booked)",
    ],
    requirements: [
      "1+ year of sales, customer-facing, or outbound prospecting experience",
      "High energy, coachable, and intrinsically motivated to hit targets",
      "Excellent written and verbal communication skills",
      "Familiarity with CRM (Salesforce or HubSpot) and sales engagement tools (Outreach, Apollo)",
      "Ability to research accounts quickly and tailor outreach to each persona",
    ],
    niceToHave: [
      "Experience selling into HR, ops, or finance personas",
      "Background in recruitment or HR technology",
      "Prior SDR experience at a high-growth SaaS company",
    ],
    skills: ["Salesforce", "Apollo.io", "Outreach", "LinkedIn Sales Navigator", "Cold Calling", "Sequencing"],
    salaryRange: "$50,000 – $70,000 base + OTE",
  },
  "customer-success-manager": {
    slug: "customer-success-manager",
    title: "Customer Success Manager",
    category: "Sales",
    metaTitle: "Customer Success Manager Job Description Template — KiteHR",
    metaDescription:
      "Free Customer Success Manager job description template. Covers onboarding, retention, and expansion CSM roles.",
    overview:
      "A Customer Success Manager ensures customers achieve their desired outcomes with our product, driving retention, expansion, and advocacy. They build strong relationships with key accounts, lead onboarding, and proactively surface risks and expansion opportunities.",
    responsibilities: [
      "Onboard new customers and guide them to first value within the first 30 days",
      "Manage a portfolio of accounts, maintaining regular check-ins and business reviews",
      "Identify and mitigate churn risk through health scoring and early intervention",
      "Drive upsell and expansion conversations within existing accounts",
      "Act as the voice of the customer internally, surfacing product feedback and feature requests",
      "Maintain accurate account data in CRM and provide accurate retention forecasts",
    ],
    requirements: [
      "2+ years of B2B SaaS customer success or account management experience",
      "Track record of maintaining high gross retention (>90%) across a book of business",
      "Strong relationship-building skills across multiple stakeholder levels",
      "Ability to deliver training, run QBRs, and navigate renewal negotiations",
      "Data-driven approach: comfortable using product analytics to drive conversations",
    ],
    niceToHave: [
      "Experience with HR, operations, or recruiting software",
      "Background using Gainsight, ChurnZero, or Totango",
      "Experience managing SMB and mid-market accounts simultaneously",
    ],
    skills: ["Gainsight", "Salesforce", "HubSpot", "Onboarding", "QBRs", "Retention", "Upsell", "NPS"],
    salaryRange: "$70,000 – $110,000",
  },
  "revenue-operations-manager": {
    slug: "revenue-operations-manager",
    title: "Revenue Operations Manager",
    category: "Sales",
    metaTitle: "Revenue Operations Manager Job Description Template — KiteHR",
    metaDescription:
      "Free Revenue Operations Manager job description template. Post your RevOps role on KiteHR for free.",
    overview:
      "A Revenue Operations Manager aligns sales, marketing, and customer success around shared data, processes, and tooling to drive predictable revenue growth. They own the GTM tech stack, reporting infrastructure, and process improvements that enable the revenue team to operate at peak efficiency.",
    responsibilities: [
      "Own and optimise the GTM tech stack (Salesforce, HubSpot, Outreach, Gong)",
      "Build and maintain dashboards and reports for pipeline, forecasting, and revenue metrics",
      "Define and enforce data hygiene standards across CRM and marketing automation",
      "Partner with sales leadership on territory design, quota setting, and comp plan modelling",
      "Manage onboarding and training for GTM tools across sales, marketing, and CS",
      "Identify process gaps and implement automation to reduce manual work",
    ],
    requirements: [
      "3+ years of revenue operations, sales operations, or marketing operations experience",
      "Deep Salesforce expertise (admin-level proficiency, ideally Salesforce Admin certified)",
      "Strong analytical skills: SQL, Excel, or BI tools (Tableau, Looker)",
      "Experience with lead routing, lifecycle stage management, and attribution modelling",
      "Ability to manage cross-functional stakeholders across sales, marketing, and CS",
    ],
    niceToHave: [
      "Experience at a company scaling from $5M to $50M ARR",
      "Background in financial modelling and sales capacity planning",
      "Familiarity with CPQ tools (Salesforce CPQ, DealHub)",
    ],
    skills: ["Salesforce", "HubSpot", "SQL", "Tableau", "Outreach", "Attribution", "Excel", "Gong"],
    salaryRange: "$90,000 – $130,000",
  },
  "vp-of-sales": {
    slug: "vp-of-sales",
    title: "VP of Sales",
    category: "Sales",
    metaTitle: "VP of Sales Job Description Template — KiteHR",
    metaDescription:
      "Free VP of Sales job description template. Covers SMB, mid-market, and enterprise VP of Sales roles.",
    overview:
      "A VP of Sales leads the revenue function, building and scaling the sales organisation to hit aggressive growth targets. They set GTM strategy, hire and develop a world-class sales team, and are ultimately accountable for bookings, revenue, and net revenue retention.",
    responsibilities: [
      "Own and exceed the annual bookings and revenue targets",
      "Hire, coach, and develop a team of AEs, SDRs, and sales managers",
      "Define and iterate the GTM strategy: segmentation, ICP, motion, pricing",
      "Build accurate pipeline and forecast models in partnership with RevOps",
      "Partner with marketing on demand generation and pipeline velocity",
      "Represent the sales function in board and leadership team settings",
      "Establish compensation plans, territory design, and quota structures",
    ],
    requirements: [
      "7+ years of B2B SaaS sales experience with 3+ years in sales leadership",
      "Demonstrated track record of scaling revenue from $X to $Y",
      "Experience building and managing teams of 10+ quota-carrying reps",
      "Strong command of sales forecasting, pipeline management, and revenue operations",
      "Excellent executive communication and board-level presentation skills",
    ],
    niceToHave: [
      "Experience taking a company from $5M to $30M+ ARR",
      "Background in PLG-to-sales-assisted motion transitions",
      "Prior experience in HR tech, workforce management, or adjacent SaaS",
    ],
    skills: ["Salesforce", "Forecasting", "MEDDIC", "Sales Hiring", "Compensation Design", "GTM Strategy"],
    salaryRange: "$180,000 – $250,000 base + equity + commission",
  },

  // Design
  "product-designer": {
    slug: "product-designer",
    title: "Product Designer",
    category: "Design",
    metaTitle: "Product Designer Job Description Template — KiteHR",
    metaDescription:
      "Free Product Designer job description template. Copy, customise, and post your product design role on KiteHR.",
    overview:
      "A Product Designer owns the end-to-end design of product features — from research and ideation through to polished, shipped UI. They advocate for the user at every stage of development, balancing user needs with business goals and technical constraints.",
    responsibilities: [
      "Lead design from discovery through delivery: user research, wireframes, prototypes, and final UI",
      "Conduct user interviews, usability tests, and analyse behavioural data to inform design decisions",
      "Create high-fidelity designs and interactive prototypes in Figma",
      "Collaborate closely with PMs and engineers to ensure designs are feasible and well-implemented",
      "Contribute to and maintain the design system",
      "Participate in design critiques and give constructive feedback to peers",
    ],
    requirements: [
      "3+ years of product design experience at a SaaS or tech company",
      "Strong portfolio demonstrating end-to-end product design work",
      "Expert proficiency in Figma",
      "Solid understanding of interaction design, accessibility (WCAG), and design systems",
      "Ability to work in a fast-paced environment with ambiguous problems",
    ],
    niceToHave: [
      "Experience designing for data-heavy or enterprise B2B products",
      "Basic front-end knowledge (HTML/CSS) to collaborate effectively with engineers",
      "Background in design research or UX writing",
    ],
    skills: ["Figma", "Prototyping", "User Research", "Design Systems", "Accessibility", "Usability Testing"],
    salaryRange: "$100,000 – $145,000",
  },
  "ux-researcher": {
    slug: "ux-researcher",
    title: "UX Researcher",
    category: "Design",
    metaTitle: "UX Researcher Job Description Template — KiteHR",
    metaDescription:
      "Free UX Researcher job description template. Post your user research role on KiteHR in minutes.",
    overview:
      "A UX Researcher uncovers deep user insights that drive product strategy and design decisions. They plan and conduct qualitative and quantitative studies, synthesise findings into clear recommendations, and build a culture of user-centricity across the company.",
    responsibilities: [
      "Plan and execute user research studies: interviews, surveys, usability tests, diary studies",
      "Synthesise research findings and communicate them to product, design, and engineering teams",
      "Maintain a research repository and user insight library",
      "Collaborate with designers to integrate research insights into design iterations",
      "Partner with data analytics to triangulate qualitative findings with behavioural data",
      "Champion user-centred design practices across the organisation",
    ],
    requirements: [
      "2+ years of UX research experience in a tech company",
      "Proficiency with research tools (UserTesting, Dovetail, Maze, or similar)",
      "Strong qualitative research skills: discussion guides, thematic analysis, affinity mapping",
      "Experience with survey design and basic quantitative analysis",
      "Excellent written and verbal communication skills — can tell compelling stories with data",
    ],
    niceToHave: [
      "Background in cognitive psychology, HCI, or social science",
      "Experience with eye-tracking or biometric research methods",
      "Familiarity with Figma and ability to collaborate directly with designers",
    ],
    skills: ["Dovetail", "UserTesting", "Maze", "Figma", "Survey Design", "Thematic Analysis", "Affinity Mapping"],
    salaryRange: "$90,000 – $130,000",
  },
  "ui-designer": {
    slug: "ui-designer",
    title: "UI Designer",
    category: "Design",
    metaTitle: "UI Designer Job Description Template — KiteHR",
    metaDescription:
      "Free UI Designer job description template. Covers visual design, UI, and interface design roles.",
    overview:
      "A UI Designer crafts beautiful, consistent, and accessible user interfaces that express our brand and delight our users. They work closely with product designers and engineers to ensure designs are implemented to a high standard.",
    responsibilities: [
      "Create polished, pixel-perfect UI designs in Figma for web and mobile products",
      "Develop and maintain UI components and contribute to the design system",
      "Create visual assets: icons, illustrations, and marketing design",
      "Collaborate with product designers and engineers on design implementation QA",
      "Define and uphold visual standards for typography, colour, spacing, and motion",
      "Produce responsive designs for desktop, tablet, and mobile viewports",
    ],
    requirements: [
      "2+ years of UI or visual design experience",
      "Expert proficiency in Figma with strong layout, typography, and colour sensibility",
      "Experience building and working within design systems and component libraries",
      "Strong portfolio demonstrating visual craft and attention to detail",
      "Understanding of web implementation constraints and accessibility standards",
    ],
    niceToHave: [
      "Motion design experience (Lottie, Rive, or After Effects)",
      "Basic front-end HTML/CSS knowledge",
      "Illustration or icon design portfolio",
    ],
    skills: ["Figma", "Design Systems", "Typography", "Iconography", "Lottie", "Accessibility", "Prototyping"],
    salaryRange: "$75,000 – $115,000",
  },

  // Operations
  "chief-of-staff": {
    slug: "chief-of-staff",
    title: "Chief of Staff",
    category: "Operations",
    metaTitle: "Chief of Staff Job Description Template — KiteHR",
    metaDescription:
      "Free Chief of Staff job description template. Covers executive CoS, strategic operations, and founder office roles.",
    overview:
      "A Chief of Staff amplifies the CEO's and leadership team's impact by owning strategic operations, cross-functional initiatives, and communication infrastructure. They are a trusted thought partner and executional force multiplier at the centre of the organisation.",
    responsibilities: [
      "Partner with the CEO on strategic priorities, preparing materials for board and leadership meetings",
      "Own the operating cadence: leadership team meetings, OKR reviews, and all-hands",
      "Drive cross-functional strategic projects from scoping through to execution",
      "Serve as a communication hub between the CEO and the rest of the organisation",
      "Track OKRs, identify strategic gaps, and proactively surface risks to leadership",
      "Manage special projects and high-priority one-time initiatives as assigned by the CEO",
    ],
    requirements: [
      "4+ years of experience in strategy, consulting, operations, or a prior CoS role",
      "Strong executive presence and ability to represent the CEO in internal and external settings",
      "Excellent written communication: can write tight memos, board decks, and executive updates",
      "Superior organisational and project management skills",
      "High EQ: politically savvy, trustworthy, and able to navigate complex interpersonal dynamics",
    ],
    niceToHave: [
      "Background in management consulting (MBB) or investment banking",
      "Prior experience at a high-growth startup",
      "MBA from a top-tier programme",
    ],
    skills: ["Strategic Planning", "Executive Communication", "Project Management", "OKRs", "Stakeholder Management"],
    salaryRange: "$120,000 – $170,000",
  },
  "project-manager": {
    slug: "project-manager",
    title: "Project Manager",
    category: "Operations",
    metaTitle: "Project Manager Job Description Template — KiteHR",
    metaDescription:
      "Free Project Manager job description template. Covers technical PM, cross-functional PM, and programme manager roles.",
    overview:
      "A Project Manager keeps complex, cross-functional initiatives on track by defining scope, managing timelines, resolving blockers, and ensuring clear communication across stakeholders. They bring structure and accountability to everything they touch.",
    responsibilities: [
      "Define project scope, goals, deliverables, timelines, and resource requirements",
      "Run project rituals: kickoffs, weekly standups, status updates, and retrospectives",
      "Identify and mitigate project risks proactively",
      "Manage dependencies across teams and escalate blockers promptly",
      "Maintain project documentation and decision logs in Confluence or Notion",
      "Report progress to stakeholders and leadership with clarity and precision",
    ],
    requirements: [
      "3+ years of project or programme management experience",
      "Proficiency with project management tools (Jira, Asana, Linear, or Monday.com)",
      "Strong organisational skills and ability to manage multiple workstreams simultaneously",
      "Excellent communication and stakeholder management skills",
      "Experience facilitating workshops and cross-functional meetings",
    ],
    niceToHave: [
      "PMP or PRINCE2 certification",
      "Experience managing software product delivery",
      "Background in agile/scrum methodologies",
    ],
    skills: ["Jira", "Asana", "Confluence", "Agile", "Scrum", "Risk Management", "Stakeholder Management"],
    salaryRange: "$80,000 – $120,000",
  },
  "operations-manager": {
    slug: "operations-manager",
    title: "Operations Manager",
    category: "Operations",
    metaTitle: "Operations Manager Job Description Template — KiteHR",
    metaDescription:
      "Free Operations Manager job description template. Post your ops manager role on KiteHR for free.",
    overview:
      "An Operations Manager ensures the business runs efficiently by owning processes, tooling, and cross-functional coordination. They identify operational bottlenecks, drive continuous improvement, and build the infrastructure that enables the team to scale.",
    responsibilities: [
      "Identify, design, and implement process improvements across business operations",
      "Own the operational technology stack and vendor relationships",
      "Build and maintain dashboards and operational metrics reporting",
      "Coordinate cross-departmental initiatives and drive accountability",
      "Manage facilities, office administration, and operational budgets",
      "Support leadership with strategic planning, modelling, and special projects",
    ],
    requirements: [
      "3+ years of business operations, strategy, or general management experience",
      "Strong analytical skills: comfortable with Excel/Google Sheets and BI tooling",
      "Experience designing and implementing scalable business processes",
      "Proven ability to manage multiple priorities and meet deadlines",
      "Excellent written and verbal communication skills",
    ],
    niceToHave: [
      "Experience in a startup or scale-up environment",
      "Background in management consulting or investment banking",
      "Familiarity with SQL and data analysis tools",
    ],
    skills: ["Process Design", "Excel", "Notion", "Asana", "Data Analysis", "Vendor Management", "OKRs"],
    salaryRange: "$75,000 – $115,000",
  },

  // HR
  "recruiter": {
    slug: "recruiter",
    title: "Recruiter",
    category: "HR",
    metaTitle: "Recruiter Job Description Template — KiteHR",
    metaDescription:
      "Free Recruiter job description template. Covers in-house recruiter, technical recruiter, and talent acquisition roles.",
    overview:
      "A Recruiter sources, screens, and hires top talent across the business by building strong candidate pipelines and delivering an outstanding candidate experience. They partner closely with hiring managers to understand team needs and fill roles efficiently.",
    responsibilities: [
      "Manage full-cycle recruitment for technical and business roles",
      "Source candidates through LinkedIn, job boards, referrals, and outbound outreach",
      "Screen applications and conduct initial phone and video interviews",
      "Partner with hiring managers to define role requirements and evaluate candidates",
      "Coordinate interviews, manage feedback collection, and present offers",
      "Track pipeline data and report on time-to-fill, offer acceptance rate, and source quality",
    ],
    requirements: [
      "2+ years of in-house or agency recruiting experience",
      "Experience recruiting for technical roles (engineering, data, product) a strong plus",
      "Proficiency with an ATS (Greenhouse, Lever, Ashby, or similar)",
      "Strong sourcing skills using LinkedIn Recruiter and Boolean search",
      "Excellent candidate communication and relationship management skills",
    ],
    niceToHave: [
      "Experience scaling hiring at a startup from seed to Series B",
      "Background in technical or executive search",
      "Familiarity with inclusive hiring practices and structured interview design",
    ],
    skills: ["LinkedIn Recruiter", "ATS", "Boolean Search", "Sourcing", "Interview Coordination", "Offer Negotiation"],
    salaryRange: "$60,000 – $100,000",
  },
  "hr-business-partner": {
    slug: "hr-business-partner",
    title: "HR Business Partner",
    category: "HR",
    metaTitle: "HR Business Partner Job Description Template — KiteHR",
    metaDescription:
      "Free HR Business Partner (HRBP) job description template. Post your HRBP role on KiteHR for free.",
    overview:
      "An HR Business Partner works directly with business leaders to align people strategy with business objectives. They advise on organisational design, employee relations, performance management, and change initiatives, acting as a trusted strategic partner to leadership.",
    responsibilities: [
      "Partner with senior leaders to identify people priorities and develop HR programmes",
      "Lead employee relations cases, investigations, and performance management processes",
      "Support organisational design, workforce planning, and headcount modelling",
      "Advise managers on coaching, development, and difficult people conversations",
      "Partner with talent acquisition on workforce planning and hiring strategy",
      "Analyse people data (engagement, attrition, headcount) and surface insights to leadership",
    ],
    requirements: [
      "4+ years of HR generalist or HRBP experience in a fast-paced environment",
      "Deep knowledge of employment law and HR compliance",
      "Strong advisory and coaching skills — able to influence at senior levels",
      "Experience leading complex employee relations cases and investigations",
      "Excellent data literacy and ability to turn people metrics into business recommendations",
    ],
    niceToHave: [
      "CIPD Level 7 or SHRM-SCP certification",
      "Experience at a rapidly scaling tech or SaaS company",
      "Background in organisational development or L&D",
    ],
    skills: ["Employee Relations", "HR Compliance", "Workforce Planning", "Coaching", "HRIS", "People Analytics"],
    salaryRange: "$85,000 – $125,000",
  },
  "hr-director": {
    slug: "hr-director",
    title: "HR Director",
    category: "HR",
    metaTitle: "HR Director Job Description Template — KiteHR",
    metaDescription:
      "Free HR Director job description template. Covers head of people, VP HR, and director of HR roles.",
    overview:
      "An HR Director leads the people function, developing and executing the HR strategy that enables the company to attract, develop, and retain exceptional talent. They oversee all aspects of HR including talent acquisition, L&D, compensation, and employee relations.",
    responsibilities: [
      "Develop and execute a people strategy aligned to the company's growth ambitions",
      "Lead and develop the HR team across talent acquisition, HR operations, and L&D",
      "Own compensation benchmarking, levelling frameworks, and total rewards strategy",
      "Partner with the CEO and leadership team on OD, culture, and headcount planning",
      "Ensure HR compliance across all jurisdictions where the company operates",
      "Champion DEI initiatives and build programmes that drive an inclusive culture",
    ],
    requirements: [
      "8+ years of progressive HR experience with 3+ years in an HR leadership role",
      "Demonstrated track record of building people functions at a scaling tech company",
      "Deep expertise across the full HR lifecycle: TA, comp & ben, L&D, ER, OD",
      "Strong business acumen and ability to partner with C-suite executives",
      "Experience managing an HR team of 3+ people",
    ],
    niceToHave: [
      "Experience taking a company through a Series B to Series C journey",
      "Background in international HR and multi-jurisdiction employment law",
      "CIPD Level 7 or SHRM-SCP certification",
    ],
    skills: ["People Strategy", "Compensation Design", "HR Compliance", "OD", "L&D", "DEI", "Workforce Planning"],
    salaryRange: "$140,000 – $200,000",
  },
  "people-operations-manager": {
    slug: "people-operations-manager",
    title: "People Operations Manager",
    category: "HR",
    metaTitle: "People Operations Manager Job Description Template — KiteHR",
    metaDescription:
      "Free People Operations Manager job description template. Post your PeopleOps role on KiteHR for free.",
    overview:
      "A People Operations Manager ensures the day-to-day engine of the HR function runs smoothly — managing HRIS systems, benefits, onboarding, compliance, and employee lifecycle processes. They are the operational backbone of the People team.",
    responsibilities: [
      "Manage and optimise the HRIS (BambooHR, Workday, or HiBob) and connected toolchain",
      "Own employee onboarding and offboarding processes end-to-end",
      "Administer benefits programmes and liaise with brokers and benefit providers",
      "Maintain HR compliance: employee records, contracts, right-to-work, and policy documentation",
      "Build and automate people processes to improve efficiency and employee experience",
      "Support payroll processing in partnership with finance",
    ],
    requirements: [
      "3+ years of HR operations or people operations experience",
      "Hands-on experience with HRIS platforms (BambooHR, Workday, Rippling, or similar)",
      "Strong process design skills and attention to detail",
      "Knowledge of employment law fundamentals and HR compliance requirements",
      "Excellent stakeholder management and customer service orientation",
    ],
    niceToHave: [
      "Experience implementing a new HRIS from scratch",
      "Background in payroll administration",
      "Familiarity with international employment practices",
    ],
    skills: ["BambooHR", "Workday", "Rippling", "Benefits Administration", "Onboarding", "HRIS", "Payroll", "Compliance"],
    salaryRange: "$70,000 – $100,000",
  },

  // Finance
  "chief-financial-officer": {
    slug: "chief-financial-officer",
    title: "Chief Financial Officer",
    category: "Finance",
    metaTitle: "Chief Financial Officer (CFO) Job Description Template — KiteHR",
    metaDescription:
      "Free CFO job description template. Covers VP Finance and CFO roles at startup and scale-up companies.",
    overview:
      "A Chief Financial Officer leads all financial operations and strategy, ensuring the company has the capital, reporting infrastructure, and financial discipline to achieve its goals. They are a key strategic partner to the CEO and board on fundraising, M&A, and long-range planning.",
    responsibilities: [
      "Own all financial reporting: P&L, balance sheet, cash flow, and board-level financial packages",
      "Lead financial planning and analysis (FP&A): annual budget, quarterly forecasts, and scenario modelling",
      "Manage investor relations, board reporting, and fundraising processes",
      "Build and lead the finance and accounting team",
      "Oversee legal, compliance, and risk management in partnership with external counsel",
      "Identify opportunities to optimise the cost structure and improve unit economics",
    ],
    requirements: [
      "10+ years of finance experience with 3+ years in a CFO or VP Finance role",
      "Track record managing finances at a high-growth startup through a major fundraise or exit",
      "Deep expertise in SaaS financial metrics: ARR, NRR, LTV, CAC, burn rate",
      "Strong command of GAAP/IFRS accounting principles",
      "Excellent board-level communication and ability to synthesise complex financial data",
    ],
    niceToHave: [
      "CPA, ACA, or ACCA qualification",
      "Experience managing an M&A process or IPO preparation",
      "Investment banking or private equity background",
    ],
    skills: ["FP&A", "GAAP", "SaaS Metrics", "Fundraising", "Board Reporting", "Excel", "NetSuite", "Investor Relations"],
    salaryRange: "$200,000 – $300,000 + equity",
  },
  "fp-and-a-analyst": {
    slug: "fp-and-a-analyst",
    title: "FP&A Analyst",
    category: "Finance",
    metaTitle: "FP&A Analyst Job Description Template — KiteHR",
    metaDescription:
      "Free FP&A Analyst job description template. Post your financial planning and analysis role on KiteHR.",
    overview:
      "An FP&A Analyst supports the finance team by building financial models, producing management reports, and providing analytical insights that inform strategic decisions. They are the analytical backbone of the finance function.",
    responsibilities: [
      "Build and maintain financial models for budgeting, forecasting, and scenario analysis",
      "Produce monthly management accounts and variance analysis vs. budget and forecast",
      "Analyse SaaS KPIs: ARR, churn, cohort analysis, LTV/CAC, and unit economics",
      "Support the annual budgeting process and quarterly rolling forecast cycles",
      "Create board and investor presentations with financial charts and commentary",
      "Partner with department heads on headcount planning and budget management",
    ],
    requirements: [
      "2+ years of FP&A or financial analysis experience",
      "Advanced Excel/Google Sheets skills: complex formulas, pivot tables, financial models",
      "Strong understanding of SaaS metrics and subscription revenue models",
      "Experience with accounting software (NetSuite, QuickBooks, or Xero)",
      "Excellent analytical thinking and attention to detail",
    ],
    niceToHave: [
      "Experience with BI tools (Tableau, Looker, or Power BI)",
      "CPA, ACCA, or CFA Part I progress",
      "SQL skills for pulling data directly from databases",
    ],
    skills: ["Excel", "Google Sheets", "NetSuite", "SaaS Metrics", "Financial Modelling", "SQL", "Tableau"],
    salaryRange: "$70,000 – $100,000",
  },

  // Product
  "product-manager": {
    slug: "product-manager",
    title: "Product Manager",
    category: "Product",
    metaTitle: "Product Manager Job Description Template — KiteHR",
    metaDescription:
      "Free Product Manager job description template. Covers SaaS PM, B2B PM, and growth PM roles.",
    overview:
      "A Product Manager defines what we build and why by deeply understanding customer needs, market opportunities, and business goals. They lead cross-functional teams through discovery, scoping, and delivery to ship products that customers love and that drive business outcomes.",
    responsibilities: [
      "Define and maintain the product roadmap, prioritised against customer value and business impact",
      "Conduct customer discovery: interviews, surveys, data analysis, and synthesis",
      "Write clear, well-scoped PRDs and user stories for the engineering team",
      "Collaborate with design on UX flows and with engineering on technical feasibility",
      "Define success metrics for features and track outcomes post-launch",
      "Communicate roadmap priorities and trade-offs to stakeholders and leadership",
    ],
    requirements: [
      "3+ years of product management experience at a B2B SaaS company",
      "Track record of shipping successful products end-to-end",
      "Strong product intuition balanced with data-driven decision-making",
      "Excellent written communication: clear, concise PRDs and stakeholder updates",
      "Ability to work in a fast-paced environment with competing priorities",
    ],
    niceToHave: [
      "Experience with HR tech, recruiting software, or workforce management",
      "Background as a software engineer or designer",
      "Familiarity with SQL and product analytics (Mixpanel, Amplitude)",
    ],
    skills: ["Roadmapping", "User Interviews", "PRDs", "Agile", "Figma", "Mixpanel", "JIRA", "SQL"],
    salaryRange: "$100,000 – $145,000",
  },
  "director-of-product": {
    slug: "director-of-product",
    title: "Director of Product",
    category: "Product",
    metaTitle: "Director of Product Job Description Template — KiteHR",
    metaDescription:
      "Free Director of Product job description template. Covers senior product leadership roles at SaaS companies.",
    overview:
      "A Director of Product leads the product management function, setting product strategy, managing a team of PMs, and ensuring the product roadmap drives meaningful business outcomes. They are a key partner to the CEO, CTO, and Go-to-Market teams.",
    responsibilities: [
      "Define and own the product strategy and multi-quarter roadmap",
      "Manage, coach, and develop a team of 3–6 Product Managers",
      "Partner with engineering leadership on resource allocation, architecture, and delivery",
      "Drive alignment between product, sales, marketing, and customer success",
      "Lead product discovery at the strategic level: market research, competitive analysis, customer advisory boards",
      "Define product KPIs and build a culture of outcome-driven development",
    ],
    requirements: [
      "6+ years of product management experience with 2+ years managing PMs",
      "Track record of shipping and iterating on complex B2B SaaS products",
      "Strong strategic thinking: able to set a clear vision and align a team around it",
      "Excellent cross-functional influence and ability to manage up and down",
      "Deep customer empathy and a structured approach to discovery",
    ],
    niceToHave: [
      "Experience at a company that scaled from Series A to Series C",
      "Background in adjacent markets: HR tech, fintech, or productivity SaaS",
      "MBA or equivalent business education",
    ],
    skills: ["Product Strategy", "Roadmapping", "Team Leadership", "Agile", "OKRs", "Customer Research", "Analytics"],
    salaryRange: "$150,000 – $200,000",
  },
  "product-analyst": {
    slug: "product-analyst",
    title: "Product Analyst",
    category: "Product",
    metaTitle: "Product Analyst Job Description Template — KiteHR",
    metaDescription:
      "Free Product Analyst job description template. Covers data analysis, product analytics, and growth analytics roles.",
    overview:
      "A Product Analyst turns raw product data into actionable insights that guide product strategy, prioritisation, and feature decisions. They build dashboards, run experiments, and partner closely with PMs and engineers to understand how customers use the product.",
    responsibilities: [
      "Build and maintain product analytics dashboards and funnels in Mixpanel, Amplitude, or Looker",
      "Analyse feature adoption, retention cohorts, and user journeys to surface insights",
      "Design and analyse A/B experiments with appropriate statistical rigour",
      "Define and monitor product KPIs: activation, retention, NPS, and feature engagement",
      "Write and maintain data pipelines and transformation logic in SQL/dbt",
      "Present findings to PMs and leadership with clear, data-driven recommendations",
    ],
    requirements: [
      "2+ years of product analytics or data analysis experience",
      "Strong SQL skills — comfortable writing complex queries across large datasets",
      "Experience with product analytics tools (Mixpanel, Amplitude, FullStory)",
      "Proficiency with BI tools (Looker, Tableau, or Metabase)",
      "Solid statistical knowledge: A/B testing, significance, cohort analysis",
    ],
    niceToHave: [
      "Experience with dbt or other data transformation tools",
      "Python skills for exploratory analysis",
      "Background in product management or UX",
    ],
    skills: ["SQL", "Mixpanel", "Amplitude", "Looker", "dbt", "Python", "A/B Testing", "Statistics"],
    salaryRange: "$75,000 – $110,000",
  },
};

export function getJobDescriptionRole(slug: string): JobDescriptionRole | null {
  return jobDescriptionRoles[slug] ?? null;
}

export function getAllJobDescriptionSlugs(): string[] {
  return Object.keys(jobDescriptionRoles);
}

export const jobDescriptionRolesList = Object.values(jobDescriptionRoles);
