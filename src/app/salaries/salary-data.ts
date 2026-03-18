// ─────────────────────────────────────────────────────────────
//  KiteHR Salary Directory — core data & helpers
//  Used by all /salaries/* page templates and the seed script
// ─────────────────────────────────────────────────────────────

export type SalaryCity = {
  slug: string;
  name: string;
  state: string;        // "CA", "NY", "England", "Scotland"
  country: "US" | "UK";
  tier: 1 | 2 | 3;     // Controls rollout order via cron
  costOfLivingIndex: number; // US average = 100
  currency: "USD" | "GBP";
};

export type SalaryRole = {
  slug: string;
  title: string;
  category: string;
  remoteRatio: number;        // Remote median = local median × remoteRatio
  relatedRoleSlugs: string[]; // For internal linking (same category)
};

// ─── Category remote ratios ────────────────────────────────────
// Based on global talent market depth for each category
export const CATEGORY_REMOTE_RATIOS: Record<string, number> = {
  Engineering: 0.48,
  Product: 0.52,
  Design: 0.50,
  Marketing: 0.55,
  Sales: 0.60,
  Finance: 0.55,
  HR: 0.62,
  Operations: 0.58,
  Legal: 0.65,
};

// ─── 50 Cities (Tier 1 → 3, US + UK) ─────────────────────────
export const SALARY_CITIES: SalaryCity[] = [
  // Tier 1 — deploy first (top 10 most expensive)
  { slug: "san-francisco",  name: "San Francisco",  state: "CA",      country: "US", tier: 1, costOfLivingIndex: 185, currency: "USD" },
  { slug: "new-york",       name: "New York",        state: "NY",      country: "US", tier: 1, costOfLivingIndex: 187, currency: "USD" },
  { slug: "seattle",        name: "Seattle",          state: "WA",      country: "US", tier: 1, costOfLivingIndex: 150, currency: "USD" },
  { slug: "boston",         name: "Boston",           state: "MA",      country: "US", tier: 1, costOfLivingIndex: 162, currency: "USD" },
  { slug: "washington-dc",  name: "Washington DC",    state: "DC",      country: "US", tier: 1, costOfLivingIndex: 155, currency: "USD" },
  { slug: "los-angeles",    name: "Los Angeles",      state: "CA",      country: "US", tier: 1, costOfLivingIndex: 165, currency: "USD" },
  { slug: "austin",         name: "Austin",           state: "TX",      country: "US", tier: 1, costOfLivingIndex: 128, currency: "USD" },
  { slug: "san-jose",       name: "San Jose",         state: "CA",      country: "US", tier: 1, costOfLivingIndex: 182, currency: "USD" },
  { slug: "chicago",        name: "Chicago",          state: "IL",      country: "US", tier: 1, costOfLivingIndex: 110, currency: "USD" },
  { slug: "denver",         name: "Denver",           state: "CO",      country: "US", tier: 1, costOfLivingIndex: 130, currency: "USD" },

  // Tier 2 — deploy weeks 3–5
  { slug: "miami",          name: "Miami",            state: "FL",      country: "US", tier: 2, costOfLivingIndex: 125, currency: "USD" },
  { slug: "san-diego",      name: "San Diego",        state: "CA",      country: "US", tier: 2, costOfLivingIndex: 152, currency: "USD" },
  { slug: "portland",       name: "Portland",         state: "OR",      country: "US", tier: 2, costOfLivingIndex: 135, currency: "USD" },
  { slug: "minneapolis",    name: "Minneapolis",      state: "MN",      country: "US", tier: 2, costOfLivingIndex: 112, currency: "USD" },
  { slug: "philadelphia",   name: "Philadelphia",     state: "PA",      country: "US", tier: 2, costOfLivingIndex: 120, currency: "USD" },
  { slug: "atlanta",        name: "Atlanta",          state: "GA",      country: "US", tier: 2, costOfLivingIndex: 110, currency: "USD" },
  { slug: "dallas",         name: "Dallas",           state: "TX",      country: "US", tier: 2, costOfLivingIndex: 105, currency: "USD" },
  { slug: "houston",        name: "Houston",          state: "TX",      country: "US", tier: 2, costOfLivingIndex: 100, currency: "USD" },
  { slug: "raleigh",        name: "Raleigh",          state: "NC",      country: "US", tier: 2, costOfLivingIndex: 108, currency: "USD" },
  { slug: "nashville",      name: "Nashville",        state: "TN",      country: "US", tier: 2, costOfLivingIndex: 112, currency: "USD" },
  { slug: "phoenix",        name: "Phoenix",          state: "AZ",      country: "US", tier: 2, costOfLivingIndex: 103, currency: "USD" },
  { slug: "salt-lake-city", name: "Salt Lake City",   state: "UT",      country: "US", tier: 2, costOfLivingIndex: 118, currency: "USD" },
  { slug: "charlotte",      name: "Charlotte",        state: "NC",      country: "US", tier: 2, costOfLivingIndex: 108, currency: "USD" },
  { slug: "baltimore",      name: "Baltimore",        state: "MD",      country: "US", tier: 2, costOfLivingIndex: 118, currency: "USD" },
  { slug: "pittsburgh",     name: "Pittsburgh",       state: "PA",      country: "US", tier: 2, costOfLivingIndex: 100, currency: "USD" },
  { slug: "hartford",       name: "Hartford",         state: "CT",      country: "US", tier: 2, costOfLivingIndex: 120, currency: "USD" },
  { slug: "richmond",       name: "Richmond",         state: "VA",      country: "US", tier: 2, costOfLivingIndex: 105, currency: "USD" },
  { slug: "columbus",       name: "Columbus",         state: "OH",      country: "US", tier: 2, costOfLivingIndex: 98,  currency: "USD" },
  { slug: "detroit",        name: "Detroit",          state: "MI",      country: "US", tier: 2, costOfLivingIndex: 90,  currency: "USD" },
  { slug: "london",         name: "London",           state: "England", country: "UK", tier: 2, costOfLivingIndex: 145, currency: "GBP" },

  // Tier 3 — deploy weeks 6–8
  { slug: "kansas-city",    name: "Kansas City",      state: "MO",      country: "US", tier: 3, costOfLivingIndex: 95,  currency: "USD" },
  { slug: "st-louis",       name: "St. Louis",        state: "MO",      country: "US", tier: 3, costOfLivingIndex: 93,  currency: "USD" },
  { slug: "indianapolis",   name: "Indianapolis",     state: "IN",      country: "US", tier: 3, costOfLivingIndex: 96,  currency: "USD" },
  { slug: "louisville",     name: "Louisville",       state: "KY",      country: "US", tier: 3, costOfLivingIndex: 93,  currency: "USD" },
  { slug: "las-vegas",      name: "Las Vegas",        state: "NV",      country: "US", tier: 3, costOfLivingIndex: 105, currency: "USD" },
  { slug: "sacramento",     name: "Sacramento",       state: "CA",      country: "US", tier: 3, costOfLivingIndex: 135, currency: "USD" },
  { slug: "orlando",        name: "Orlando",          state: "FL",      country: "US", tier: 3, costOfLivingIndex: 100, currency: "USD" },
  { slug: "tampa",          name: "Tampa",            state: "FL",      country: "US", tier: 3, costOfLivingIndex: 103, currency: "USD" },
  { slug: "new-orleans",    name: "New Orleans",      state: "LA",      country: "US", tier: 3, costOfLivingIndex: 100, currency: "USD" },
  { slug: "albuquerque",    name: "Albuquerque",      state: "NM",      country: "US", tier: 3, costOfLivingIndex: 93,  currency: "USD" },
  { slug: "tucson",         name: "Tucson",           state: "AZ",      country: "US", tier: 3, costOfLivingIndex: 90,  currency: "USD" },
  { slug: "edinburgh",      name: "Edinburgh",        state: "Scotland",country: "UK", tier: 3, costOfLivingIndex: 115, currency: "GBP" },
  { slug: "bristol",        name: "Bristol",          state: "England", country: "UK", tier: 3, costOfLivingIndex: 110, currency: "GBP" },
  { slug: "manchester",     name: "Manchester",       state: "England", country: "UK", tier: 3, costOfLivingIndex: 105, currency: "GBP" },
  { slug: "cambridge",      name: "Cambridge",        state: "England", country: "UK", tier: 3, costOfLivingIndex: 120, currency: "GBP" },
  { slug: "oxford",         name: "Oxford",           state: "England", country: "UK", tier: 3, costOfLivingIndex: 125, currency: "GBP" },
  { slug: "birmingham",     name: "Birmingham",       state: "England", country: "UK", tier: 3, costOfLivingIndex: 100, currency: "GBP" },
  { slug: "leeds",          name: "Leeds",            state: "England", country: "UK", tier: 3, costOfLivingIndex: 100, currency: "GBP" },
  { slug: "brighton",       name: "Brighton",         state: "England", country: "UK", tier: 3, costOfLivingIndex: 118, currency: "GBP" },
  { slug: "reading",        name: "Reading",          state: "England", country: "UK", tier: 3, costOfLivingIndex: 115, currency: "GBP" },
];

// ─── 100 Roles across 9 categories ────────────────────────────
export const SALARY_ROLES: SalaryRole[] = [
  // Engineering (25)
  { slug: "senior-software-engineer",   title: "Senior Software Engineer",       category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["backend-engineer", "frontend-engineer", "full-stack-engineer", "staff-engineer"] },
  { slug: "backend-engineer",           title: "Backend Engineer",               category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["senior-software-engineer", "data-engineer", "node-js-developer", "platform-engineer"] },
  { slug: "frontend-engineer",          title: "Frontend Engineer",              category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["react-developer", "senior-software-engineer", "full-stack-engineer", "ui-designer"] },
  { slug: "full-stack-engineer",        title: "Full Stack Engineer",            category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["backend-engineer", "frontend-engineer", "react-developer", "senior-software-engineer"] },
  { slug: "devops-engineer",            title: "DevOps Engineer",                category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["site-reliability-engineer", "cloud-architect", "platform-engineer", "security-engineer"] },
  { slug: "site-reliability-engineer",  title: "Site Reliability Engineer",      category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["devops-engineer", "platform-engineer", "cloud-architect", "backend-engineer"] },
  { slug: "data-engineer",              title: "Data Engineer",                  category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["data-scientist", "machine-learning-engineer", "backend-engineer", "python-developer"] },
  { slug: "machine-learning-engineer",  title: "Machine Learning Engineer",      category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["data-scientist", "data-engineer", "python-developer", "senior-software-engineer"] },
  { slug: "data-scientist",             title: "Data Scientist",                 category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["machine-learning-engineer", "data-engineer", "python-developer", "product-analyst"] },
  { slug: "ios-engineer",               title: "iOS Engineer",                   category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["android-engineer", "senior-software-engineer", "full-stack-engineer", "react-developer"] },
  { slug: "android-engineer",           title: "Android Engineer",               category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["ios-engineer", "senior-software-engineer", "full-stack-engineer", "java-developer"] },
  { slug: "react-developer",            title: "React Developer",                category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["frontend-engineer", "full-stack-engineer", "node-js-developer", "ui-designer"] },
  { slug: "node-js-developer",          title: "Node.js Developer",              category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["backend-engineer", "react-developer", "full-stack-engineer", "python-developer"] },
  { slug: "python-developer",           title: "Python Developer",               category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["data-engineer", "backend-engineer", "machine-learning-engineer", "data-scientist"] },
  { slug: "java-developer",             title: "Java Developer",                 category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["backend-engineer", "senior-software-engineer", "android-engineer", "solutions-architect"] },
  { slug: "cloud-architect",            title: "Cloud Architect",                category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["solutions-architect", "devops-engineer", "site-reliability-engineer", "platform-engineer"] },
  { slug: "security-engineer",          title: "Security Engineer",              category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["devops-engineer", "cloud-architect", "site-reliability-engineer", "backend-engineer"] },
  { slug: "qa-engineer",                title: "QA Engineer",                    category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["senior-software-engineer", "backend-engineer", "devops-engineer", "scrum-master"] },
  { slug: "engineering-manager",        title: "Engineering Manager",            category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["vp-of-engineering", "senior-software-engineer", "staff-engineer", "director-of-product"] },
  { slug: "vp-of-engineering",          title: "VP of Engineering",              category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["engineering-manager", "cto", "cloud-architect", "vp-of-product"] },
  { slug: "solutions-architect",        title: "Solutions Architect",            category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["cloud-architect", "senior-software-engineer", "backend-engineer", "technical-product-manager"] },
  { slug: "platform-engineer",          title: "Platform Engineer",              category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["devops-engineer", "site-reliability-engineer", "backend-engineer", "cloud-architect"] },
  { slug: "golang-developer",           title: "Golang Developer",               category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["backend-engineer", "site-reliability-engineer", "platform-engineer", "python-developer"] },
  { slug: "staff-engineer",             title: "Staff Engineer",                 category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["senior-software-engineer", "principal-engineer", "engineering-manager", "solutions-architect"] },
  { slug: "principal-engineer",         title: "Principal Engineer",             category: "Engineering", remoteRatio: 0.48, relatedRoleSlugs: ["staff-engineer", "vp-of-engineering", "solutions-architect", "engineering-manager"] },

  // Product (8)
  { slug: "product-manager",            title: "Product Manager",                category: "Product", remoteRatio: 0.52, relatedRoleSlugs: ["senior-product-manager", "technical-product-manager", "product-analyst", "director-of-product"] },
  { slug: "senior-product-manager",     title: "Senior Product Manager",         category: "Product", remoteRatio: 0.52, relatedRoleSlugs: ["product-manager", "director-of-product", "technical-product-manager", "vp-of-product"] },
  { slug: "director-of-product",        title: "Director of Product",            category: "Product", remoteRatio: 0.52, relatedRoleSlugs: ["vp-of-product", "senior-product-manager", "chief-product-officer", "engineering-manager"] },
  { slug: "vp-of-product",              title: "VP of Product",                  category: "Product", remoteRatio: 0.52, relatedRoleSlugs: ["director-of-product", "chief-product-officer", "vp-of-engineering", "chief-revenue-officer"] },
  { slug: "product-analyst",            title: "Product Analyst",                category: "Product", remoteRatio: 0.52, relatedRoleSlugs: ["product-manager", "data-scientist", "business-analyst", "ux-researcher"] },
  { slug: "technical-product-manager",  title: "Technical Product Manager",      category: "Product", remoteRatio: 0.52, relatedRoleSlugs: ["product-manager", "solutions-architect", "engineering-manager", "senior-product-manager"] },
  { slug: "product-operations-manager", title: "Product Operations Manager",     category: "Product", remoteRatio: 0.52, relatedRoleSlugs: ["product-manager", "operations-manager", "program-manager", "business-analyst"] },
  { slug: "chief-product-officer",      title: "Chief Product Officer",          category: "Product", remoteRatio: 0.52, relatedRoleSlugs: ["vp-of-product", "director-of-product", "vp-of-engineering", "chief-revenue-officer"] },

  // Design (8)
  { slug: "product-designer",           title: "Product Designer",               category: "Design", remoteRatio: 0.50, relatedRoleSlugs: ["ux-designer", "ui-designer", "ux-researcher", "design-director"] },
  { slug: "ux-designer",                title: "UX Designer",                    category: "Design", remoteRatio: 0.50, relatedRoleSlugs: ["product-designer", "ui-designer", "ux-researcher", "design-systems-engineer"] },
  { slug: "ui-designer",                title: "UI Designer",                    category: "Design", remoteRatio: 0.50, relatedRoleSlugs: ["ux-designer", "product-designer", "frontend-engineer", "design-systems-engineer"] },
  { slug: "ux-researcher",              title: "UX Researcher",                  category: "Design", remoteRatio: 0.50, relatedRoleSlugs: ["product-designer", "ux-designer", "product-analyst", "product-manager"] },
  { slug: "design-director",            title: "Design Director",                category: "Design", remoteRatio: 0.50, relatedRoleSlugs: ["product-designer", "brand-designer", "ux-designer", "vp-of-product"] },
  { slug: "brand-designer",             title: "Brand Designer",                 category: "Design", remoteRatio: 0.50, relatedRoleSlugs: ["design-director", "ui-designer", "motion-designer", "brand-manager"] },
  { slug: "motion-designer",            title: "Motion Designer",                category: "Design", remoteRatio: 0.50, relatedRoleSlugs: ["brand-designer", "ui-designer", "product-designer", "content-marketer"] },
  { slug: "design-systems-engineer",    title: "Design Systems Engineer",        category: "Design", remoteRatio: 0.50, relatedRoleSlugs: ["frontend-engineer", "ui-designer", "ux-designer", "react-developer"] },

  // Marketing (12)
  { slug: "marketing-manager",          title: "Marketing Manager",              category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["marketing-director", "growth-marketer", "product-marketing-manager", "content-marketer"] },
  { slug: "content-marketer",           title: "Content Marketer",               category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["seo-specialist", "marketing-manager", "social-media-manager", "email-marketing-specialist"] },
  { slug: "seo-specialist",             title: "SEO Specialist",                 category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["content-marketer", "growth-marketer", "performance-marketing-manager", "marketing-manager"] },
  { slug: "growth-marketer",            title: "Growth Marketer",                category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["performance-marketing-manager", "demand-generation-manager", "seo-specialist", "product-marketing-manager"] },
  { slug: "demand-generation-manager",  title: "Demand Generation Manager",      category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["growth-marketer", "performance-marketing-manager", "marketing-manager", "vp-of-marketing"] },
  { slug: "product-marketing-manager",  title: "Product Marketing Manager",      category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["marketing-manager", "product-manager", "demand-generation-manager", "brand-manager"] },
  { slug: "social-media-manager",       title: "Social Media Manager",           category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["content-marketer", "email-marketing-specialist", "brand-manager", "marketing-manager"] },
  { slug: "email-marketing-specialist", title: "Email Marketing Specialist",     category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["content-marketer", "social-media-manager", "growth-marketer", "marketing-manager"] },
  { slug: "performance-marketing-manager", title: "Performance Marketing Manager", category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["growth-marketer", "demand-generation-manager", "seo-specialist", "vp-of-marketing"] },
  { slug: "brand-manager",              title: "Brand Manager",                  category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["marketing-manager", "product-marketing-manager", "brand-designer", "social-media-manager"] },
  { slug: "marketing-director",         title: "Marketing Director",             category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["vp-of-marketing", "marketing-manager", "demand-generation-manager", "product-marketing-manager"] },
  { slug: "vp-of-marketing",            title: "VP of Marketing",                category: "Marketing", remoteRatio: 0.55, relatedRoleSlugs: ["marketing-director", "cmo", "chief-revenue-officer", "vp-of-sales"] },

  // Sales (10)
  { slug: "account-executive",          title: "Account Executive",              category: "Sales", remoteRatio: 0.60, relatedRoleSlugs: ["enterprise-account-executive", "sales-development-representative", "customer-success-manager", "sales-manager"] },
  { slug: "sales-development-representative", title: "Sales Development Representative", category: "Sales", remoteRatio: 0.60, relatedRoleSlugs: ["account-executive", "revenue-operations-manager", "sales-manager", "customer-success-manager"] },
  { slug: "sales-manager",              title: "Sales Manager",                  category: "Sales", remoteRatio: 0.60, relatedRoleSlugs: ["account-executive", "vp-of-sales", "revenue-operations-manager", "customer-success-director"] },
  { slug: "vp-of-sales",                title: "VP of Sales",                    category: "Sales", remoteRatio: 0.60, relatedRoleSlugs: ["chief-revenue-officer", "sales-manager", "vp-of-marketing", "revenue-operations-manager"] },
  { slug: "chief-revenue-officer",      title: "Chief Revenue Officer",          category: "Sales", remoteRatio: 0.60, relatedRoleSlugs: ["vp-of-sales", "vp-of-marketing", "chief-product-officer", "vp-of-product"] },
  { slug: "enterprise-account-executive", title: "Enterprise Account Executive", category: "Sales", remoteRatio: 0.60, relatedRoleSlugs: ["account-executive", "sales-engineer", "sales-manager", "customer-success-director"] },
  { slug: "sales-engineer",             title: "Sales Engineer",                 category: "Sales", remoteRatio: 0.60, relatedRoleSlugs: ["solutions-architect", "enterprise-account-executive", "technical-product-manager", "account-executive"] },
  { slug: "customer-success-manager",   title: "Customer Success Manager",       category: "Sales", remoteRatio: 0.60, relatedRoleSlugs: ["account-executive", "customer-success-director", "revenue-operations-manager", "sales-manager"] },
  { slug: "customer-success-director",  title: "Customer Success Director",      category: "Sales", remoteRatio: 0.60, relatedRoleSlugs: ["customer-success-manager", "vp-of-sales", "chief-revenue-officer", "revenue-operations-manager"] },
  { slug: "revenue-operations-manager", title: "Revenue Operations Manager",     category: "Sales", remoteRatio: 0.60, relatedRoleSlugs: ["sales-manager", "customer-success-manager", "business-analyst", "operations-manager"] },

  // Finance (10)
  { slug: "financial-analyst",          title: "Financial Analyst",              category: "Finance", remoteRatio: 0.55, relatedRoleSlugs: ["fp-and-a-analyst", "investment-analyst", "accounting-manager", "business-analyst"] },
  { slug: "fp-and-a-analyst",           title: "FP&A Analyst",                   category: "Finance", remoteRatio: 0.55, relatedRoleSlugs: ["financial-analyst", "controller", "finance-manager", "chief-financial-officer"] },
  { slug: "controller",                 title: "Controller",                     category: "Finance", remoteRatio: 0.55, relatedRoleSlugs: ["chief-financial-officer", "accounting-manager", "fp-and-a-analyst", "finance-manager"] },
  { slug: "chief-financial-officer",    title: "Chief Financial Officer",        category: "Finance", remoteRatio: 0.55, relatedRoleSlugs: ["controller", "vp-of-sales", "chief-revenue-officer", "chief-people-officer"] },
  { slug: "accounting-manager",         title: "Accounting Manager",             category: "Finance", remoteRatio: 0.55, relatedRoleSlugs: ["controller", "financial-analyst", "tax-manager", "finance-manager"] },
  { slug: "tax-manager",                title: "Tax Manager",                    category: "Finance", remoteRatio: 0.55, relatedRoleSlugs: ["accounting-manager", "controller", "compliance-manager", "chief-financial-officer"] },
  { slug: "treasury-analyst",           title: "Treasury Analyst",               category: "Finance", remoteRatio: 0.55, relatedRoleSlugs: ["financial-analyst", "fp-and-a-analyst", "investment-analyst", "accounting-manager"] },
  { slug: "internal-auditor",           title: "Internal Auditor",               category: "Finance", remoteRatio: 0.55, relatedRoleSlugs: ["compliance-manager", "controller", "accounting-manager", "tax-manager"] },
  { slug: "finance-manager",            title: "Finance Manager",                category: "Finance", remoteRatio: 0.55, relatedRoleSlugs: ["controller", "fp-and-a-analyst", "chief-financial-officer", "accounting-manager"] },
  { slug: "investment-analyst",         title: "Investment Analyst",             category: "Finance", remoteRatio: 0.55, relatedRoleSlugs: ["financial-analyst", "treasury-analyst", "fp-and-a-analyst", "finance-manager"] },

  // HR (10)
  { slug: "recruiter",                  title: "Recruiter",                      category: "HR", remoteRatio: 0.62, relatedRoleSlugs: ["technical-recruiter", "talent-acquisition-manager", "hr-generalist", "people-operations-manager"] },
  { slug: "technical-recruiter",        title: "Technical Recruiter",            category: "HR", remoteRatio: 0.62, relatedRoleSlugs: ["recruiter", "talent-acquisition-manager", "hr-business-partner", "people-operations-manager"] },
  { slug: "hr-business-partner",        title: "HR Business Partner",            category: "HR", remoteRatio: 0.62, relatedRoleSlugs: ["hr-director", "people-operations-manager", "hr-generalist", "compensation-analyst"] },
  { slug: "hr-director",                title: "HR Director",                    category: "HR", remoteRatio: 0.62, relatedRoleSlugs: ["chief-people-officer", "hr-business-partner", "people-operations-manager", "talent-acquisition-manager"] },
  { slug: "people-operations-manager",  title: "People Operations Manager",      category: "HR", remoteRatio: 0.62, relatedRoleSlugs: ["hr-business-partner", "hr-director", "recruiter", "chief-people-officer"] },
  { slug: "compensation-analyst",       title: "Compensation Analyst",           category: "HR", remoteRatio: 0.62, relatedRoleSlugs: ["hr-business-partner", "financial-analyst", "people-operations-manager", "hr-director"] },
  { slug: "chief-people-officer",       title: "Chief People Officer",           category: "HR", remoteRatio: 0.62, relatedRoleSlugs: ["hr-director", "chief-financial-officer", "chief-product-officer", "chief-revenue-officer"] },
  { slug: "learning-and-development-manager", title: "L&D Manager",             category: "HR", remoteRatio: 0.62, relatedRoleSlugs: ["people-operations-manager", "hr-business-partner", "hr-director", "program-manager"] },
  { slug: "talent-acquisition-manager", title: "Talent Acquisition Manager",    category: "HR", remoteRatio: 0.62, relatedRoleSlugs: ["recruiter", "technical-recruiter", "hr-director", "people-operations-manager"] },
  { slug: "hr-generalist",              title: "HR Generalist",                  category: "HR", remoteRatio: 0.62, relatedRoleSlugs: ["recruiter", "hr-business-partner", "people-operations-manager", "compensation-analyst"] },

  // Operations (10)
  { slug: "operations-manager",         title: "Operations Manager",             category: "Operations", remoteRatio: 0.58, relatedRoleSlugs: ["chief-of-staff", "program-manager", "project-manager", "business-analyst"] },
  { slug: "chief-of-staff",             title: "Chief of Staff",                 category: "Operations", remoteRatio: 0.58, relatedRoleSlugs: ["operations-manager", "program-manager", "chief-financial-officer", "chief-people-officer"] },
  { slug: "project-manager",            title: "Project Manager",                category: "Operations", remoteRatio: 0.58, relatedRoleSlugs: ["program-manager", "scrum-master", "operations-manager", "product-operations-manager"] },
  { slug: "program-manager",            title: "Program Manager",                category: "Operations", remoteRatio: 0.58, relatedRoleSlugs: ["project-manager", "operations-manager", "chief-of-staff", "engineering-manager"] },
  { slug: "business-analyst",           title: "Business Analyst",               category: "Operations", remoteRatio: 0.58, relatedRoleSlugs: ["product-analyst", "data-scientist", "operations-manager", "product-manager"] },
  { slug: "scrum-master",               title: "Scrum Master",                   category: "Operations", remoteRatio: 0.58, relatedRoleSlugs: ["project-manager", "agile-coach", "program-manager", "engineering-manager"] },
  { slug: "agile-coach",                title: "Agile Coach",                    category: "Operations", remoteRatio: 0.58, relatedRoleSlugs: ["scrum-master", "program-manager", "engineering-manager", "operations-manager"] },
  { slug: "supply-chain-manager",       title: "Supply Chain Manager",           category: "Operations", remoteRatio: 0.58, relatedRoleSlugs: ["operations-manager", "program-manager", "logistics-coordinator", "business-analyst"] },
  { slug: "office-manager",             title: "Office Manager",                 category: "Operations", remoteRatio: 0.58, relatedRoleSlugs: ["operations-manager", "executive-assistant", "hr-generalist", "chief-of-staff"] },
  { slug: "executive-assistant",        title: "Executive Assistant",            category: "Operations", remoteRatio: 0.58, relatedRoleSlugs: ["office-manager", "chief-of-staff", "operations-manager", "project-manager"] },

  // Legal (7)
  { slug: "general-counsel",            title: "General Counsel",                category: "Legal", remoteRatio: 0.65, relatedRoleSlugs: ["corporate-attorney", "compliance-manager", "legal-operations-manager", "chief-financial-officer"] },
  { slug: "corporate-attorney",         title: "Corporate Attorney",             category: "Legal", remoteRatio: 0.65, relatedRoleSlugs: ["general-counsel", "compliance-manager", "privacy-counsel", "contracts-manager"] },
  { slug: "compliance-manager",         title: "Compliance Manager",             category: "Legal", remoteRatio: 0.65, relatedRoleSlugs: ["corporate-attorney", "general-counsel", "privacy-counsel", "internal-auditor"] },
  { slug: "privacy-counsel",            title: "Privacy Counsel",                category: "Legal", remoteRatio: 0.65, relatedRoleSlugs: ["compliance-manager", "corporate-attorney", "security-engineer", "general-counsel"] },
  { slug: "legal-operations-manager",   title: "Legal Operations Manager",       category: "Legal", remoteRatio: 0.65, relatedRoleSlugs: ["general-counsel", "operations-manager", "compliance-manager", "contracts-manager"] },
  { slug: "contracts-manager",          title: "Contracts Manager",              category: "Legal", remoteRatio: 0.65, relatedRoleSlugs: ["corporate-attorney", "legal-operations-manager", "compliance-manager", "revenue-operations-manager"] },
  { slug: "paralegal",                  title: "Paralegal",                      category: "Legal", remoteRatio: 0.65, relatedRoleSlugs: ["corporate-attorney", "contracts-manager", "compliance-manager", "legal-operations-manager"] },
];

// ─── Helper functions ──────────────────────────────────────────

export function getCityBySlug(slug: string): SalaryCity | undefined {
  return SALARY_CITIES.find((c) => c.slug === slug);
}

export function getRoleBySlug(slug: string): SalaryRole | undefined {
  return SALARY_ROLES.find((r) => r.slug === slug);
}

export function getAllCitySlugs(): string[] {
  return SALARY_CITIES.map((c) => c.slug);
}

export function getAllRoleSlugs(): string[] {
  return SALARY_ROLES.map((r) => r.slug);
}

export function getCitiesByTier(tier: 1 | 2 | 3): SalaryCity[] {
  return SALARY_CITIES.filter((c) => c.tier === tier);
}

export function getRolesByCategory(category: string): SalaryRole[] {
  return SALARY_ROLES.filter((r) => r.category === category);
}

export function getAllCategories(): string[] {
  return [...new Set(SALARY_ROLES.map((r) => r.category))];
}

/** Format a salary number as a human-readable string */
export function formatSalary(amount: number, currency: "USD" | "GBP"): string {
  const symbol = currency === "GBP" ? "£" : "$";
  if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${symbol}${Math.round(amount / 1_000)}k`;
  return `${symbol}${amount}`;
}

/** Calculate remote salary from local median using category ratio */
export function calcRemoteSalary(
  localMedian: number,
  category: string
): { low: number; median: number; high: number } {
  const ratio = CATEGORY_REMOTE_RATIOS[category] ?? 0.55;
  return {
    low: Math.round(localMedian * (ratio - 0.05)),
    median: Math.round(localMedian * ratio),
    high: Math.round(localMedian * (ratio + 0.05)),
  };
}

/** Calculate savings percent and annual savings */
export function calcSavings(
  localMedian: number,
  remoteMedian: number
): { savingsPercent: number; annualSavings: number } {
  const savingsPercent = Math.round((1 - remoteMedian / localMedian) * 100);
  const annualSavings = localMedian - remoteMedian;
  return { savingsPercent, annualSavings };
}

/** Get the canonical location label for display */
export function getCityLabel(city: SalaryCity): string {
  if (city.country === "UK") return `${city.name}, ${city.state}`;
  return `${city.name}, ${city.state}`;
}
