export type QuestionType = "mc" | "open" | "style";

export type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options?: { label: string; text: string }[];
  correctIndex?: number;
  styleLabels?: string[]; // one label per option for style questions
  dictationTranscript?: string;
};

export type DemoJob = {
  id: string;
  title: string;
  tagline: string;
  questions: Question[];
};

export const demoJobs: DemoJob[] = [
  {
    id: "frontend-engineer",
    title: "Frontend Engineer",
    tagline: "Build interfaces that delight and scale",
    questions: [
      {
        id: "fe-1",
        type: "mc",
        text: "A critical production bug is reported 30 minutes before a major public launch. You estimate it's a 2-hour fix. What do you do?",
        options: [
          { label: "A", text: "Fix it and delay the launch — stability first" },
          { label: "B", text: "Ship with the bug and patch immediately post-launch" },
          { label: "C", text: "Revert to the previous stable release" },
          { label: "D", text: "Escalate to leadership without investigating further" },
        ],
        correctIndex: 0,
      },
      {
        id: "fe-2",
        type: "mc",
        text: "Which approach best reduces Largest Contentful Paint (LCP) on a landing page?",
        options: [
          { label: "A", text: "Add CSS animations to improve perceived speed" },
          { label: "B", text: "Lazy-load images below the fold and preload the hero image" },
          { label: "C", text: "Increase server RAM to handle more concurrent requests" },
          { label: "D", text: "Switch from hooks to class-based components" },
        ],
        correctIndex: 1,
      },
      {
        id: "fe-3",
        type: "mc",
        text: "You disagree with a designer's UI choice that you believe will hurt accessibility. You:",
        options: [
          { label: "A", text: "Implement it exactly as designed — it's their call" },
          { label: "B", text: "Build your own version and present both without telling them" },
          { label: "C", text: "Flag the concern with supporting data/examples in the next design review" },
          { label: "D", text: "Ask the PM to override the designer" },
        ],
        correctIndex: 2,
      },
      {
        id: "fe-4",
        type: "open",
        text: "A user reports that \"the app feels slow on mobile.\" Walk me through your debugging process from first report to root cause.",
        dictationTranscript:
          "First I'd open Chrome DevTools and run a Lighthouse audit to identify the bottleneck — whether it's LCP, FCP, or TBT. Then I'd check the network tab for large assets, slow API calls, or render-blocking resources. I'd look at the main thread for long tasks and profile JavaScript execution. Once I have a clear picture of where the time is going, I'd address the specific bottleneck — whether that's an unoptimized image, a blocking script, or a heavy component re-render — then re-run Lighthouse to verify the improvement.",
      },
      {
        id: "fe-5",
        type: "style",
        text: "Mid-sprint you discover an elegant refactor that would meaningfully improve code quality — but it adds 3 days to the timeline. You:",
        options: [
          { label: "A", text: "Refactor now — clean code is always the priority" },
          { label: "B", text: "Log it as tech debt, finish the sprint, revisit in planning" },
          { label: "C", text: "Skip it entirely — if it works, don't touch it" },
          { label: "D", text: "Ask the team to extend the sprint to accommodate it" },
        ],
        correctIndex: 1,
        styleLabels: ["Perfectionist", "Pragmatic & Agile", "Conservative", "Team-Oriented"],
      },
    ],
  },
  {
    id: "customer-success",
    title: "Customer Success Manager",
    tagline: "Turn customers into champions",
    questions: [
      {
        id: "cs-1",
        type: "mc",
        text: "A long-term customer threatens to churn because a competitor offers a lower price. You:",
        options: [
          { label: "A", text: "Immediately offer a discount to match the competitor" },
          { label: "B", text: "Explore their underlying frustration, present your unique value, and escalate if needed" },
          { label: "C", text: "Tell them the competitor's product is inferior" },
          { label: "D", text: "Transfer them directly to sales" },
        ],
        correctIndex: 1,
      },
      {
        id: "cs-2",
        type: "mc",
        text: "Your quarterly NPS drops 15 points. What's your first action?",
        options: [
          { label: "A", text: "Send a company-wide apology email to all customers" },
          { label: "B", text: "Analyze verbatims for common themes, then prioritize the top 2 issues" },
          { label: "C", text: "Increase outbound call volume across all accounts" },
          { label: "D", text: "Launch a new product feature to win customers back" },
        ],
        correctIndex: 1,
      },
      {
        id: "cs-3",
        type: "open",
        text: "A customer is technically correct in their complaint — but fixing their issue would set a problematic precedent. How do you handle it?",
        dictationTranscript:
          "I'd start by acknowledging their frustration and validating that they're right from a logical standpoint — that's important for maintaining trust. Then I'd be transparent: explain that while their individual case makes sense, this particular fix would affect how we support all customers consistently, so it's not something we can apply broadly. I'd keep the conversation focused on what I can do — whether that's an alternative workaround, a partial resolution, or escalating to see if a policy exception is warranted. The goal is for them to feel genuinely heard, even if the final answer is no.",
      },
      {
        id: "cs-4",
        type: "mc",
        text: "A customer is struggling to get value from the product 60 days after onboarding. You:",
        options: [
          { label: "A", text: "Wait — they'll figure it out on their own timeline" },
          { label: "B", text: "Schedule a proactive health check, identify blockers, and co-create a 30-day success plan" },
          { label: "C", text: "Proactively offer a refund before they ask" },
          { label: "D", text: "Send them a feature tutorial email and monitor open rate" },
        ],
        correctIndex: 1,
      },
      {
        id: "cs-5",
        type: "style",
        text: "You have 5 at-risk accounts but capacity to actively work only 3 this week. You:",
        options: [
          { label: "A", text: "Work overtime to handle all 5 — every account matters" },
          { label: "B", text: "Triage by risk severity and revenue impact, address top 3, flag the rest to your manager" },
          { label: "C", text: "Pick 3 randomly and document your reasoning" },
          { label: "D", text: "Ask your manager to hold off until you have more capacity" },
        ],
        correctIndex: 1,
        styleLabels: ["Above and Beyond", "Systematic & Strategic", "Improviser", "Escalation-First"],
      },
    ],
  },
  {
    id: "product-manager",
    title: "Product Manager",
    tagline: "Decide what to build and why it matters",
    questions: [
      {
        id: "pm-1",
        type: "mc",
        text: "Engineering, Design, and Marketing each need your full sprint capacity and all claim the highest priority. You:",
        options: [
          { label: "A", text: "Allocate to whoever advocates loudest" },
          { label: "B", text: "Build a scoring framework (reach, impact, confidence, effort) and present the ranked output" },
          { label: "C", text: "Split capacity equally across all three" },
          { label: "D", text: "Defer the decision to the CEO" },
        ],
        correctIndex: 1,
      },
      {
        id: "pm-2",
        type: "open",
        text: "A feature you shipped 3 months ago has only 2% adoption. How do you diagnose why — and what do you do next?",
        dictationTranscript:
          "I'd start by segmenting the adoption data — looking at who is using it, which user cohorts, what entry points they came from, and whether usage is sticky or one-and-done. Then I'd map the funnel: are users discovering the feature, trying it once, or returning for repeated value? I'd pair quantitative data with qualitative signals — session recordings and a handful of conversations with non-adopters to understand the real 'why.' The diagnosis shapes the response: if it's a discoverability problem, that's a UX fix. If users try it and don't come back, the value prop may be off. If no one even finds it, we have a placement issue. I'd also consider whether the feature genuinely solves a problem people have, or if we built something we assumed mattered.",
      },
      {
        id: "pm-3",
        type: "mc",
        text: "An A/B test returns statistical significance at p=0.04 but only a 1.2% lift in conversion. You:",
        options: [
          { label: "A", text: "Ship it immediately — significance means it works" },
          { label: "B", text: "Weigh the lift against implementation cost and consider long-term compounding before deciding" },
          { label: "C", text: "Ignore the result and move on to the next test" },
          { label: "D", text: "Run the test again until you get a stronger result" },
        ],
        correctIndex: 1,
      },
      {
        id: "pm-4",
        type: "mc",
        text: "Your sales team keeps requesting features that don't align with your product strategy. You:",
        options: [
          { label: "A", text: "Add everything to the backlog as requested" },
          { label: "B", text: "Meet with sales to understand the root need, explore existing solutions, and align on principles" },
          { label: "C", text: "Reject all requests outright — they don't own the roadmap" },
          { label: "D", text: "Build a parallel 'sales features' track to keep them happy" },
        ],
        correctIndex: 1,
      },
      {
        id: "pm-5",
        type: "style",
        text: "Product vision versus a pressing high-value customer request — you can only ship one this quarter. You:",
        options: [
          { label: "A", text: "Always prioritize vision — short-term noise is a distraction" },
          { label: "B", text: "Always prioritize the customer — they're the ones paying" },
          { label: "C", text: "Evaluate the strategic value of the customer request against vision alignment before deciding" },
          { label: "D", text: "Bring it to the CEO and let them decide" },
        ],
        correctIndex: 2,
        styleLabels: ["Visionary", "Customer-Led", "Strategic & Balanced", "Collaborative"],
      },
    ],
  },
  {
    id: "sales-dev-rep",
    title: "Sales Development Rep",
    tagline: "Open doors. Start conversations. Create pipeline.",
    questions: [
      {
        id: "sdr-1",
        type: "mc",
        text: "A prospect opens your cold email 4 times but never replies. Your next move:",
        options: [
          { label: "A", text: "Wait — they'll reach out when they're ready" },
          { label: "B", text: "Send a brief, non-pushy follow-up that references the topic and adds new value" },
          { label: "C", text: "Call them immediately while you know they're engaged" },
          { label: "D", text: "Remove them from the sequence — no reply means no interest" },
        ],
        correctIndex: 1,
      },
      {
        id: "sdr-2",
        type: "open",
        text: "Write a 3-sentence cold outreach message to a VP of Sales at a 200-person SaaS company for a productivity tool.",
        dictationTranscript:
          "Hi [Name], I noticed [Company] recently expanded your sales team — congrats on the growth. We help VP of Sales at companies your size cut new rep ramp time by 30% using AI-driven coaching and call analysis, without adding headcount. Would a 15-minute call this week make sense to see if it's a fit?",
      },
      {
        id: "sdr-3",
        type: "mc",
        text: "A gatekeeper tells you the decision-maker is \"not interested.\" You:",
        options: [
          { label: "A", text: "Accept it and move the lead to closed-lost" },
          { label: "B", text: "Thank them, ask if there's a better time or a different contact, and note it in the CRM" },
          { label: "C", text: "Push past them and cold-call the DM's personal number" },
          { label: "D", text: "Email the DM directly mentioning you spoke with their assistant" },
        ],
        correctIndex: 1,
      },
      {
        id: "sdr-4",
        type: "mc",
        text: "Your manager asks you to call 80 prospects today, but the list has poor fit scores. You:",
        options: [
          { label: "A", text: "Call all 80 regardless — hits the activity metric" },
          { label: "B", text: "Raise the data quality issue and request 30 minutes to scrub the list before dialing" },
          { label: "C", text: "Call 20 and log 80 in the CRM" },
          { label: "D", text: "Spend the entire day scrubbing without informing anyone" },
        ],
        correctIndex: 1,
      },
      {
        id: "sdr-5",
        type: "style",
        text: "You're behind quota with 5 days left in the month. You:",
        options: [
          { label: "A", text: "Panic-blast every contact in your CRM to maximize volume" },
          { label: "B", text: "Focus energy on highest-probability open conversations and fast-cycle prospects" },
          { label: "C", text: "Ask management to lower the quota given the timeline" },
          { label: "D", text: "Accept missing the number and start planning for next month" },
        ],
        correctIndex: 1,
        styleLabels: ["High-Volume Hustler", "Focused & Resilient", "Collaborative", "Deliberate Planner"],
      },
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    tagline: "Find the signal in the noise",
    questions: [
      {
        id: "da-1",
        type: "mc",
        text: "A marketing campaign shows a 40% spike in signups. A stakeholder immediately declares it a success. You:",
        options: [
          { label: "A", text: "Agree and help write the victory report" },
          { label: "B", text: "Segment the spike by source, cohort, and day, and check for confounding variables before concluding" },
          { label: "C", text: "Credit the campaign fully — the timing is clear enough" },
          { label: "D", text: "Dispute the claim in the meeting without data to support you" },
        ],
        correctIndex: 1,
      },
      {
        id: "da-2",
        type: "open",
        text: "Your dashboard shows DAU dropped 18% week-over-week. Walk me through how you'd investigate the root cause.",
        dictationTranscript:
          "First I'd rule out a data pipeline issue — make sure this is a real drop and not a logging failure. Then I'd segment by platform, geography, user cohort, and acquisition channel to see where the drop is concentrated. I'd cross-reference with any product releases, marketing changes, or external events that week. If it's isolated to a specific segment, that narrows the cause significantly. From there I'd look at the user journey funnel to see if people are dropping at a specific step, and surface the top two or three hypotheses for the team to validate with further investigation.",
      },
      {
        id: "da-3",
        type: "mc",
        text: "You're asked to predict next quarter's churn. You have 14 months of data and 400 churned customers. You:",
        options: [
          { label: "A", text: "Build a neural network — more complexity means better results" },
          { label: "B", text: "Start with logistic regression as a baseline, validate assumptions, then iterate on model complexity" },
          { label: "C", text: "Refuse — 14 months isn't enough data for any model" },
          { label: "D", text: "Use last quarter's churn rate as the forecast" },
        ],
        correctIndex: 1,
      },
      {
        id: "da-4",
        type: "mc",
        text: "A business stakeholder asks for a chart that \"makes the numbers look better\" before a board presentation. You:",
        options: [
          { label: "A", text: "Adjust the Y-axis scale to create a more impressive visual trend" },
          { label: "B", text: "Present the data accurately and provide context that offers fair framing" },
          { label: "C", text: "Refuse to create any chart for that presentation" },
          { label: "D", text: "Prepare two versions — one accurate, one adjusted — and let them choose" },
        ],
        correctIndex: 1,
      },
      {
        id: "da-5",
        type: "style",
        text: "You receive 10 analysis requests in one week, all marked \"urgent.\" You:",
        options: [
          { label: "A", text: "Work extended hours until every request is done" },
          { label: "B", text: "Meet with requestors to re-triage based on business impact and decision urgency" },
          { label: "C", text: "Process them in the order they were received" },
          { label: "D", text: "Pick 3 at random and communicate that the rest are queued" },
        ],
        correctIndex: 1,
        styleLabels: ["High-Output", "Analytical & Principled", "Process-Driven", "Creative"],
      },
    ],
  },
];

export function getRandomizedQuestions(jobId: string, count = 4): Question[] {
  const job = demoJobs.find((j) => j.id === jobId);
  if (!job) return [];
  return [...job.questions].sort(() => Math.random() - 0.5).slice(0, count);
}
