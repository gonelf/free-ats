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
      {
        id: "fe-6",
        type: "mc",
        text: "Which CSS selector has the highest specificity?",
        options: [
          { label: "A", text: ".header (class selector)" },
          { label: "B", text: "#header (ID selector)" },
          { label: "C", text: "header (element selector)" },
          { label: "D", text: "* (universal selector)" },
        ],
        correctIndex: 1,
      },
      {
        id: "fe-7",
        type: "mc",
        text: "A React `useEffect` with an empty dependency array `[]` runs:",
        options: [
          { label: "A", text: "Every time the component renders" },
          { label: "B", text: "Only when specific state values change" },
          { label: "C", text: "Once after the initial render" },
          { label: "D", text: "Before the component mounts" },
        ],
        correctIndex: 2,
      },
      {
        id: "fe-8",
        type: "mc",
        text: "Cumulative Layout Shift (CLS) measures:",
        options: [
          { label: "A", text: "Total bytes transferred during page load" },
          { label: "B", text: "Time until the first byte is received from the server" },
          { label: "C", text: "Unexpected visual shifts in page layout during load" },
          { label: "D", text: "Number of DOM nodes on the page" },
        ],
        correctIndex: 2,
      },
      {
        id: "fe-9",
        type: "mc",
        text: "During code review you spot an O(n²) loop. It's blocking the release. You:",
        options: [
          { label: "A", text: "Approve it silently — raising it now will delay the release" },
          { label: "B", text: "Comment on it, offer to pair on a fix, but don't block the release if performance impact is low" },
          { label: "C", text: "Reject the PR until the loop is optimised, regardless of impact" },
          { label: "D", text: "Rewrite it yourself without telling the author" },
        ],
        correctIndex: 1,
      },
      {
        id: "fe-10",
        type: "mc",
        text: "A PM says your 3-day estimate must ship in 1 day. You:",
        options: [
          { label: "A", text: "Agree and work through the night — deadlines are deadlines" },
          { label: "B", text: "Refuse entirely and escalate to your manager" },
          { label: "C", text: "Break down the work, identify what can be cut, and negotiate scope explicitly" },
          { label: "D", text: "Submit a half-finished feature and mark it done" },
        ],
        correctIndex: 2,
      },
      {
        id: "fe-11",
        type: "style",
        text: "You introduced a regression that made it to production. You:",
        options: [
          { label: "A", text: "Stay quiet and hope no one notices" },
          { label: "B", text: "Own it immediately, run a blameless post-mortem, and propose process changes" },
          { label: "C", text: "Blame the reviewer who approved your PR" },
          { label: "D", text: "Fix it silently without telling anyone" },
        ],
        correctIndex: 1,
        styleLabels: ["Conflict-Avoider", "Accountable & Growth-Oriented", "Blame-Shifter", "Passive"],
      },
      {
        id: "fe-12",
        type: "open",
        text: "How do you make a multi-step form accessible to keyboard and screen-reader users?",
        dictationTranscript:
          "I'd start by ensuring every input has a visible, associated label — never relying on placeholder text alone. Tab order should follow a logical reading sequence, and I'd use ARIA live regions to announce step transitions so screen readers surface progress updates automatically. Each step's active fields need visible focus indicators that meet contrast requirements. I'd test with VoiceOver on macOS and NVDA on Windows to catch anything that looks fine visually but breaks in assistive technology. For error states, I'd use aria-describedby to link the input to its error message so the relationship is explicit in the accessibility tree.",
      },
      {
        id: "fe-13",
        type: "mc",
        text: "Your CSS works in Chrome and Firefox but breaks in Safari. What's your first step?",
        options: [
          { label: "A", text: "Rewrite the entire stylesheet to avoid the issue" },
          { label: "B", text: "Check caniuse.com, identify the gap, and evaluate a polyfill or fallback" },
          { label: "C", text: "Add `!important` to force the styles to apply" },
          { label: "D", text: "Tell users to switch to Chrome" },
        ],
        correctIndex: 1,
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
      {
        id: "cs-6",
        type: "mc",
        text: "A customer frequently requests a feature that's off your roadmap. You:",
        options: [
          { label: "A", text: "Promise it will be built next quarter to keep them happy" },
          { label: "B", text: "Log the request, connect them with the PM, and set honest expectations about the roadmap" },
          { label: "C", text: "Tell them to submit a support ticket and move on" },
          { label: "D", text: "Ignore the request — it's not your responsibility" },
        ],
        correctIndex: 1,
      },
      {
        id: "cs-7",
        type: "mc",
        text: "Your champion at a key account has just left the company. You:",
        options: [
          { label: "A", text: "Wait and see if anyone else reaches out" },
          { label: "B", text: "Immediately identify a new stakeholder, rebuild the relationship proactively, and resurface value data" },
          { label: "C", text: "Escalate to your manager and let them handle it" },
          { label: "D", text: "Send a generic welcome email to the whole account team" },
        ],
        correctIndex: 1,
      },
      {
        id: "cs-8",
        type: "mc",
        text: "An executive at a customer account emails you directly, bypassing their dedicated CSM. You:",
        options: [
          { label: "A", text: "Ignore it — they should go through the proper channel" },
          { label: "B", text: "Handle the immediate ask, loop your CSM in, and clarify escalation paths going forward" },
          { label: "C", text: "Forward it to the CSM without responding" },
          { label: "D", text: "Take over the account from your CSM" },
        ],
        correctIndex: 1,
      },
      {
        id: "cs-9",
        type: "open",
        text: "How do you assess whether a customer is healthy or at risk of churning?",
        dictationTranscript:
          "I look at signals across three areas: product usage, relationship, and business health. On the product side I track login frequency, feature adoption relative to their tier, and whether they're hitting their stated success criteria. Relationship signals include responsiveness to outreach, whether the champion is still engaged, and sentiment in recent conversations. Business health covers any news about their company — layoffs, leadership changes, funding rounds — since those often precede churn. The most reliable indicator is when two or more of these dimensions degrade simultaneously. That's when I open a proactive health call rather than waiting for them to raise a flag.",
      },
      {
        id: "cs-10",
        type: "mc",
        text: "You've just inherited 3 unhappy accounts. Your first week priority is:",
        options: [
          { label: "A", text: "Immediately promise fixes to every complaint to rebuild trust fast" },
          { label: "B", text: "Run listen-only discovery calls with no commitments yet" },
          { label: "C", text: "Review internal notes and avoid contacting them until you have a plan" },
          { label: "D", text: "Escalate all 3 to leadership to set expectations" },
        ],
        correctIndex: 1,
      },
      {
        id: "cs-11",
        type: "mc",
        text: "A customer blames your product for a failed internal process. The product works as designed. You:",
        options: [
          { label: "A", text: "Defend the product and show them the documentation" },
          { label: "B", text: "Acknowledge the outcome, present context without blame, and focus the conversation forward" },
          { label: "C", text: "Apologise and offer a refund to resolve it quickly" },
          { label: "D", text: "Escalate to your product team to have them respond directly" },
        ],
        correctIndex: 1,
      },
      {
        id: "cs-12",
        type: "style",
        text: "Renewal is in 30 days and your champion has been unresponsive for 3 weeks. You:",
        options: [
          { label: "A", text: "Accept it — if they don't respond they probably won't renew" },
          { label: "B", text: "Multi-thread: find another stakeholder, try LinkedIn, loop in the AE, and send a value summary" },
          { label: "C", text: "Send one more email and wait" },
          { label: "D", text: "Immediately escalate to your VP and let them take over" },
        ],
        correctIndex: 1,
        styleLabels: ["Passive Acceptance", "Proactive & Multi-Threaded", "Avoidant", "Over-Escalator"],
      },
      {
        id: "cs-13",
        type: "mc",
        text: "What makes a Quarterly Business Review (QBR) effective?",
        options: [
          { label: "A", text: "A detailed product demo of every new feature released in the quarter" },
          { label: "B", text: "Progress against success criteria, ROI data, and co-creating goals for next quarter" },
          { label: "C", text: "A long slide deck covering all support tickets resolved" },
          { label: "D", text: "Having your VP present to show executive support" },
        ],
        correctIndex: 1,
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
      {
        id: "pm-6",
        type: "mc",
        text: "The most critical element of a well-written PRD is:",
        options: [
          { label: "A", text: "Detailed wireframes for every screen" },
          { label: "B", text: "Success metrics that define when the goal is achieved" },
          { label: "C", text: "A complete list of edge cases to handle" },
          { label: "D", text: "Sign-off from all stakeholders before writing begins" },
        ],
        correctIndex: 1,
      },
      {
        id: "pm-7",
        type: "mc",
        text: "An engineer says the spec is impossible to deliver in the agreed timeline. You:",
        options: [
          { label: "A", text: "Push back — they should have flagged this earlier" },
          { label: "B", text: "Explore the constraints together and update stakeholders on revised expectations" },
          { label: "C", text: "Find a different engineer who can meet the original estimate" },
          { label: "D", text: "Silently slip the deadline without telling anyone" },
        ],
        correctIndex: 1,
      },
      {
        id: "pm-8",
        type: "open",
        text: "Define the success metrics you'd use to evaluate a new onboarding flow.",
        dictationTranscript:
          "The primary metric I'd anchor to is time-to-first-value — how quickly a new user completes their first meaningful action after signing up. I'd pair that with step completion rates across the funnel to identify where users drop off, and day-7 retention as the lagging indicator of whether the onboarding experience actually delivers on its promise. I'd look at drop-off per step to find specific friction points, run usability tests with new users to surface confusion in the flow itself, and track support ticket volume related to onboarding topics — a rising ticket count often means something in the flow is unclear even if completion rates look fine.",
      },
      {
        id: "pm-9",
        type: "style",
        text: "Q3 roadmap slot: a safe feature with an 8% lift estimate vs. a risky bet with a 40% upside but 30% regression risk. You:",
        options: [
          { label: "A", text: "Always take the safe option — regression risk is unacceptable" },
          { label: "B", text: "Always take the bigger bet — incremental gains don't move the needle" },
          { label: "C", text: "Evaluate research quality, technical confidence, and reversibility before deciding" },
          { label: "D", text: "Let the engineering lead decide — it's their code" },
        ],
        correctIndex: 2,
        styleLabels: ["Risk-Averse", "Risk-Seeking", "Calculated Decision-Maker", "Delegator"],
      },
      {
        id: "pm-10",
        type: "mc",
        text: "A stakeholder keeps changing requirements mid-sprint. You:",
        options: [
          { label: "A", text: "Accept all changes — stakeholders are always right" },
          { label: "B", text: "Implement a change request process: changes enter the next sprint unless they're critical blockers" },
          { label: "C", text: "Refuse all mid-sprint changes categorically" },
          { label: "D", text: "Stop the sprint and replan from scratch each time" },
        ],
        correctIndex: 1,
      },
      {
        id: "pm-11",
        type: "mc",
        text: "User research recommends Feature X, but retention data shows Feature Y has the strongest impact. You:",
        options: [
          { label: "A", text: "Trust the data — qualitative research is too biased" },
          { label: "B", text: "Trust the research — users know best" },
          { label: "C", text: "Qual tells you 'why', quant tells you 'what' — use both to form a view" },
          { label: "D", text: "Ship both and let the A/B test decide" },
        ],
        correctIndex: 2,
      },
      {
        id: "pm-12",
        type: "mc",
        text: "You've inherited a messy backlog with 200 items and no clear priorities. Your approach:",
        options: [
          { label: "A", text: "Groom every item methodically before touching any of them" },
          { label: "B", text: "Delete everything and start fresh" },
          { label: "C", text: "Run a lightweight scoring session and archive anything with no clear owner or business case" },
          { label: "D", text: "Let engineers pick what to work on until the backlog is cleaned up" },
        ],
        correctIndex: 2,
      },
      {
        id: "pm-13",
        type: "mc",
        text: "Post-launch: the new feature has 40% adoption vs. a 70% target. You:",
        options: [
          { label: "A", text: "Declare success — 40% is still meaningful adoption" },
          { label: "B", text: "Launch a marketing campaign to drive awareness" },
          { label: "C", text: "Segment adopters vs. non-adopters and identify the friction points" },
          { label: "D", text: "Add more features to make it more compelling" },
        ],
        correctIndex: 2,
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
      {
        id: "sdr-6",
        type: "mc",
        text: "A prospect says \"it's not in our budget.\" You:",
        options: [
          { label: "A", text: "Accept it and mark them as closed-lost" },
          { label: "B", text: "Explore whether it's a real budget constraint or unclear ROI — ask what they're currently spending on the problem" },
          { label: "C", text: "Offer a 50% discount immediately" },
          { label: "D", text: "Argue that your product pays for itself" },
        ],
        correctIndex: 1,
      },
      {
        id: "sdr-7",
        type: "mc",
        text: "You've left 5 voicemails with no callback. You:",
        options: [
          { label: "A", text: "Leave 5 more — persistence always wins" },
          { label: "B", text: "Try a different channel or angle, or re-sequence them in 60 days" },
          { label: "C", text: "Send an angry follow-up email" },
          { label: "D", text: "Escalate to your manager to make the call" },
        ],
        correctIndex: 1,
      },
      {
        id: "sdr-8",
        type: "mc",
        text: "Midway through a discovery call it's clear the prospect is not a good fit. You:",
        options: [
          { label: "A", text: "Keep going — maybe they'll become a fit later" },
          { label: "B", text: "Be honest, end the call respectfully, and document why" },
          { label: "C", text: "Push hard anyway — any deal is a good deal" },
          { label: "D", text: "Transfer them to a different rep" },
        ],
        correctIndex: 1,
      },
      {
        id: "sdr-9",
        type: "mc",
        text: "What is generally the best time to reach B2B prospects by phone?",
        options: [
          { label: "A", text: "Monday mornings and Friday afternoons" },
          { label: "B", text: "Tuesday through Thursday, 10–11am or 4–5pm" },
          { label: "C", text: "Any time — persistence matters more than timing" },
          { label: "D", text: "Lunchtime — they're more relaxed" },
        ],
        correctIndex: 1,
      },
      {
        id: "sdr-10",
        type: "open",
        text: "A prospect tells you \"we already use a competitor.\" How do you respond?",
        dictationTranscript:
          "I'd start by acknowledging that — it means they've already identified this as a problem worth solving, which is a good sign. Then I'd ask a couple of genuine questions about how it's going: what they like about the current tool and where it falls short. I'm not trying to oversell; I want to understand if there's a real gap. If there is, I'd offer a 15-minute call to show specifically how we address those gaps. If there's no gap, I'd be honest that it's probably not worth switching, and I'd stay in touch for when their contract comes up for renewal.",
      },
      {
        id: "sdr-11",
        type: "mc",
        text: "You have 12 deals that have been stuck in the pipeline for 45+ days. You:",
        options: [
          { label: "A", text: "Leave them — they'll move when the prospect is ready" },
          { label: "B", text: "Run a pipeline scrub: identify the last meaningful next step and either re-engage or close them out" },
          { label: "C", text: "Add them all to an automated nurture sequence" },
          { label: "D", text: "Discount each deal by 20% to create urgency" },
        ],
        correctIndex: 1,
      },
      {
        id: "sdr-12",
        type: "style",
        text: "Your manager gives you harsh coaching feedback after listening to a call. You:",
        options: [
          { label: "A", text: "Push back — your approach has worked before" },
          { label: "B", text: "Ask for specific examples, request a co-call, and implement one change at a time" },
          { label: "C", text: "Nod along but ignore the feedback" },
          { label: "D", text: "Avoid taking calls until the tension passes" },
        ],
        correctIndex: 1,
        styleLabels: ["Defensive", "Coachable & Deliberate", "Resistant", "Avoider"],
      },
      {
        id: "sdr-13",
        type: "mc",
        text: "A prospect showed strong interest, asked for a proposal, then went silent for 10 days. You:",
        options: [
          { label: "A", text: "Wait — don't push or you'll lose them" },
          { label: "B", text: "Send a value-add follow-up with a close question and set a final breakup email date" },
          { label: "C", text: "Call them every day until they respond" },
          { label: "D", text: "Mark them as closed-lost and move on" },
        ],
        correctIndex: 1,
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
      {
        id: "da-6",
        type: "mc",
        text: "A p-value of 0.03 means:",
        options: [
          { label: "A", text: "There is a 97% chance the result is true" },
          { label: "B", text: "The effect size is large enough to matter in practice" },
          { label: "C", text: "There is a 3% probability of observing this result if the null hypothesis were true" },
          { label: "D", text: "The experiment should be run again to confirm" },
        ],
        correctIndex: 2,
      },
      {
        id: "da-7",
        type: "mc",
        text: "You discover an error in a report you already sent to leadership. You:",
        options: [
          { label: "A", text: "Hope no one noticed and quietly update the underlying data" },
          { label: "B", text: "Wait to see if anyone asks before taking action" },
          { label: "C", text: "Immediately notify leadership, provide the corrected version, and explain what changed" },
          { label: "D", text: "Send a corrected version without mentioning the original error" },
        ],
        correctIndex: 2,
      },
      {
        id: "da-8",
        type: "mc",
        text: "In SQL, when should you prefer a JOIN over a subquery?",
        options: [
          { label: "A", text: "Always — JOINs are faster in every scenario" },
          { label: "B", text: "When referencing multiple columns from a related table — JOINs allow better query optimisation" },
          { label: "C", text: "Never — subqueries are more readable and should be preferred" },
          { label: "D", text: "Only when working with temporary tables" },
        ],
        correctIndex: 1,
      },
      {
        id: "da-9",
        type: "style",
        text: "You present a data-backed conclusion. A senior stakeholder strongly disagrees without citing specific data. You:",
        options: [
          { label: "A", text: "Defer immediately — they have more experience" },
          { label: "B", text: "Walk through your methodology, ask for specific counter-evidence, and investigate together" },
          { label: "C", text: "Withdraw the finding to avoid conflict" },
          { label: "D", text: "Escalate to your manager to resolve the disagreement" },
        ],
        correctIndex: 1,
        styleLabels: ["People-Pleaser", "Principled & Collaborative", "Deferential", "Escalator"],
      },
      {
        id: "da-10",
        type: "mc",
        text: "You're building a dashboard for a VP with no data background. Your approach:",
        options: [
          { label: "A", text: "Include all available metrics so they have full context" },
          { label: "B", text: "3–5 KPIs tied to their key decisions, in plain language, designed around their primary question" },
          { label: "C", text: "A raw data table so they can explore it themselves" },
          { label: "D", text: "Ask them to hire a data analyst before using the dashboard" },
        ],
        correctIndex: 1,
      },
      {
        id: "da-11",
        type: "mc",
        text: "You find a strong correlation between two variables. A stakeholder claims this proves causation. You:",
        options: [
          { label: "A", text: "Agree — strong correlation is sufficient evidence" },
          { label: "B", text: "Challenge the conclusion, identify potential confounders, and propose a causation study design" },
          { label: "C", text: "Add a disclaimer to the slide and move on" },
          { label: "D", text: "Run more correlations to find further support" },
        ],
        correctIndex: 1,
      },
      {
        id: "da-12",
        type: "mc",
        text: "A key column in your dataset has 30% missing values. You:",
        options: [
          { label: "A", text: "Drop all rows with missing values and proceed" },
          { label: "B", text: "Fill all missing values with the column mean" },
          { label: "C", text: "Investigate the missingness pattern (MCAR/MAR/MNAR), choose an appropriate strategy, and document your decision" },
          { label: "D", text: "Ignore the column entirely" },
        ],
        correctIndex: 2,
      },
      {
        id: "da-13",
        type: "open",
        text: "How do you validate a new third-party data source before using it in production?",
        dictationTranscript:
          "I start by reviewing how the data is collected — the methodology matters more than the size of the dataset. Then I cross-validate a sample against a trusted internal source to check alignment on fields I can verify independently. I look at schema stability: has the structure changed over the past 6–12 months, and is there a changelog? Before using it in production I run both sources in parallel for a defined period and compare outputs. Finally, I document the data lineage clearly so that anyone downstream understands where the data comes from and what assumptions were made when it was ingested.",
      },
    ],
  },
];

export function getRandomizedQuestions(jobId: string, count = 4): Question[] {
  const job = demoJobs.find((j) => j.id === jobId);
  if (!job) return [];
  return [...job.questions].sort(() => Math.random() - 0.5).slice(0, count);
}

export function getAllQuestions(jobId: string): Question[] {
  const job = demoJobs.find((j) => j.id === jobId);
  if (!job) return [];
  return [...job.questions].sort(() => Math.random() - 0.5);
}
