export type HrEmailTemplateVariant = {
  label: string;
  subject: string;
  body: string;
};

export type HrEmailTemplate = {
  slug: string;
  title: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  subject: string;
  body: string;
  tips: string[];
  variants: HrEmailTemplateVariant[];
};

export const hrEmailTemplates: Record<string, HrEmailTemplate> = {
  "application-rejection-email": {
    slug: "application-rejection-email",
    title: "Application Rejection Email",
    category: "Rejection",
    metaTitle: "Application Rejection Email Template — KiteHR",
    metaDescription:
      "Free application rejection email template. Professional, empathetic, and ready to send. Automate for 100s of candidates with KiteHR.",
    description:
      "A respectful rejection email sent after reviewing an application — before any interviews have taken place. Keeps your employer brand strong and treats every candidate with dignity.",
    subject: "Your application to [COMPANY_NAME] — [JOB_TITLE]",
    body: `Hi [CANDIDATE_FIRST_NAME],

Thank you for taking the time to apply for the [JOB_TITLE] role at [COMPANY_NAME].

After carefully reviewing your application, we've decided to move forward with other candidates whose experience more closely matches what we're looking for at this stage.

We genuinely appreciate you considering us, and we encourage you to keep an eye on our careers page for future opportunities that may be a better fit.

We wish you the very best in your search.

Warm regards,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Send within 5 business days of reviewing — candidates appreciate timely responses even if it's a no",
      "Use their first name, not 'Dear Applicant' — small personalisation matters for your employer brand",
      "Avoid listing specific reasons for rejection — this opens the door to lengthy back-and-forth",
      "If you have a talent pool, consider adding: 'We'd love to keep your details on file for future roles'",
    ],
    variants: [
      {
        label: "With feedback offer",
        subject: "Your application to [COMPANY_NAME] — [JOB_TITLE]",
        body: `Hi [CANDIDATE_FIRST_NAME],

Thank you for applying for the [JOB_TITLE] position at [COMPANY_NAME].

We've reviewed your application and, while your background is impressive, we've decided to progress with candidates whose experience more closely aligns with our current requirements.

If you'd find it helpful, we're happy to share brief feedback. Just reply to this email and we'll do our best to assist.

Thank you again for your interest in [COMPANY_NAME] — we hope our paths cross again.

Best,
[RECRUITER_NAME]`,
      },
      {
        label: "High-volume / short form",
        subject: "Re: [JOB_TITLE] Application — [COMPANY_NAME]",
        body: `Hi [CANDIDATE_FIRST_NAME],

Thank you for applying to [COMPANY_NAME] for the [JOB_TITLE] role.

After reviewing your application, we won't be moving forward at this time. We appreciate your interest and wish you success in your search.

Best,
The [COMPANY_NAME] Team`,
      },
    ],
  },
  "post-interview-rejection-email": {
    slug: "post-interview-rejection-email",
    title: "Post-Interview Rejection Email",
    category: "Rejection",
    metaTitle: "Post-Interview Rejection Email Template — KiteHR",
    metaDescription:
      "Free post-interview rejection email template. Kind, professional, and easy to personalise. Send to candidates after first or final round interviews.",
    description:
      "A rejection email sent after one or more interview rounds. This carries more weight than an application rejection — candidates have invested time, so the message should be warm, specific, and prompt.",
    subject: "Following up on your interview for [JOB_TITLE] at [COMPANY_NAME]",
    body: `Hi [CANDIDATE_FIRST_NAME],

It was great speaking with you about the [JOB_TITLE] role at [COMPANY_NAME]. We genuinely appreciated the time you invested in our process.

After careful consideration, we've decided to move forward with another candidate whose background is a closer match for what we need right now. This was a genuinely difficult decision — you interviewed well.

[OPTIONAL: One specific positive observation, e.g. "Your experience with [X] was particularly impressive."]

We'd welcome the opportunity to stay in touch — please connect with me on LinkedIn if you haven't already, and do keep an eye on our future openings.

Thank you again, [CANDIDATE_FIRST_NAME]. We wish you every success.

Warm regards,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Call strong finalists before emailing — a phone rejection after a multi-stage process shows respect",
      "Include one genuine positive observation — it softens the blow and is memorable",
      "Avoid 'We'll keep your CV on file' unless you actually mean it",
      "Send within 24-48 hours of making the decision — don't leave candidates in limbo",
    ],
    variants: [
      {
        label: "After final round",
        subject: "Thank you for interviewing with [COMPANY_NAME]",
        body: `Hi [CANDIDATE_FIRST_NAME],

Thank you so much for going through our full interview process for the [JOB_TITLE] role. We know it's a significant time investment and we genuinely appreciate it.

After thorough consideration, we've made the difficult decision to move forward with a candidate whose specific background matched our needs more closely at this point in time.

We want you to know that this was a tough call — your skills and approach clearly impressed our team. We'd love to stay connected and will certainly reach out if a more fitting opportunity arises.

Please do stay in touch.

Best wishes,
[RECRUITER_NAME]
[COMPANY_NAME]`,
      },
    ],
  },
  "interview-invitation-email": {
    slug: "interview-invitation-email",
    title: "Interview Invitation Email",
    category: "Scheduling",
    metaTitle: "Interview Invitation Email Template — KiteHR",
    metaDescription:
      "Free interview invitation email template. Professional and clear — includes all the details candidates need to prepare confidently.",
    description:
      "An email inviting a candidate to interview for a role. A well-written invitation sets a professional tone and gives the candidate everything they need to prepare.",
    subject: "Interview Invitation — [JOB_TITLE] at [COMPANY_NAME]",
    body: `Hi [CANDIDATE_FIRST_NAME],

Thank you for applying for the [JOB_TITLE] position at [COMPANY_NAME]. We've reviewed your application and would love to invite you to an interview.

Here are the details:

📅 Date: [DATE]
🕐 Time: [TIME] [TIMEZONE]
📍 Format: [Video call / In-person at: ADDRESS]
⏱ Duration: Approximately [DURATION]
👤 Interviewer(s): [INTERVIEWER_NAME(S)], [TITLE(S)]

[If video call: We'll be using [Zoom / Google Meet / Teams]. The link is: [MEETING_LINK]]

During the interview, we'll discuss your background and experience, and you'll have the opportunity to learn more about the role and our team.

To confirm your attendance, please reply to this email or click here: [BOOKING_LINK]

If the proposed time doesn't work for you, let me know and we'll find an alternative.

Looking forward to speaking with you!

Best regards,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Include all logistical details in the first email — candidates shouldn't have to ask for the meeting link",
      "Mention the interviewers' names and titles so candidates can research them in advance",
      "Specify the duration accurately — this helps candidates plan their day",
      "Add a booking link (Calendly) to reduce back-and-forth scheduling",
    ],
    variants: [
      {
        label: "Technical / assessment round",
        subject: "Technical Interview Invitation — [JOB_TITLE] at [COMPANY_NAME]",
        body: `Hi [CANDIDATE_FIRST_NAME],

Congratulations on progressing to the next stage of our [JOB_TITLE] interview process at [COMPANY_NAME]!

We'd like to invite you to a technical interview with [INTERVIEWER_NAME], [TITLE].

📅 Date: [DATE]
🕐 Time: [TIME] [TIMEZONE]
📍 Format: [Video call / In-person]
⏱ Duration: [DURATION]
🔗 Meeting link: [LINK]

What to expect:
[BRIEF DESCRIPTION OF FORMAT — e.g., "This will be a 45-minute live coding session. You're welcome to use your preferred language and IDE."]

Please come prepared to discuss your approach and ask any questions you may have about the role.

Let me know if the time works for you, or suggest an alternative and we'll make it work.

Best,
[RECRUITER_NAME]`,
      },
    ],
  },
  "interview-confirmation-email": {
    slug: "interview-confirmation-email",
    title: "Interview Confirmation Email",
    category: "Scheduling",
    metaTitle: "Interview Confirmation Email Template — KiteHR",
    metaDescription:
      "Free interview confirmation email template. A clear, friendly confirmation that gives candidates everything they need for the day.",
    description:
      "A confirmation email sent after a candidate has accepted an interview invitation. Reinforces the key details and makes the candidate feel welcomed.",
    subject: "Confirmed: Your interview for [JOB_TITLE] on [DATE]",
    body: `Hi [CANDIDATE_FIRST_NAME],

This is a confirmation of your upcoming interview for the [JOB_TITLE] role at [COMPANY_NAME].

Here's a summary of the details:

📅 Date: [DATE]
🕐 Time: [TIME] [TIMEZONE]
📍 [Video call link: LINK / Address: ADDRESS]
👤 You'll be meeting with: [INTERVIEWER_NAME], [TITLE]
⏱ Duration: [DURATION]

A few things that may be helpful:
• [Any specific preparation — e.g., "Feel free to come prepared to discuss a project you're proud of"]
• [If in-person: parking/transport directions, building entry instructions]

If anything comes up and you need to reschedule, please let me know as soon as possible and we'll make it work.

We're looking forward to meeting you!

Best,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Send the confirmation immediately after the candidate confirms — don't wait until the day before",
      "Include practical details like parking instructions or building entry for in-person interviews",
      "Add one light preparation prompt to help them feel ready without pressure",
      "Always include a clear contact in case they need to reschedule",
    ],
    variants: [],
  },
  "interview-reschedule-email": {
    slug: "interview-reschedule-email",
    title: "Interview Reschedule Email",
    category: "Scheduling",
    metaTitle: "Interview Reschedule Email Template — KiteHR",
    metaDescription:
      "Free interview reschedule email template. Professional and apologetic — covers rescheduling from both the company and candidate side.",
    description:
      "An email requesting or acknowledging a reschedule of a confirmed interview. Should be apologetic (if company-initiated), prompt, and offer immediate alternatives.",
    subject: "Rescheduling your interview — [JOB_TITLE] at [COMPANY_NAME]",
    body: `Hi [CANDIDATE_FIRST_NAME],

I hope you're well. Unfortunately, I need to reach out about a scheduling conflict that has come up on our end for your interview on [ORIGINAL_DATE].

I sincerely apologise for any inconvenience this causes. We'd love to reschedule and suggest the following alternative times:

• [OPTION 1: DATE, TIME, TIMEZONE]
• [OPTION 2: DATE, TIME, TIMEZONE]
• [OPTION 3: DATE, TIME, TIMEZONE]

If none of these work for you, please let me know your availability and we'll find a time that suits.

Again, I'm sorry for the disruption — we remain very interested in speaking with you and appreciate your flexibility.

Best regards,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Always offer at least 3 alternative time slots — makes it easy to confirm quickly",
      "Be genuinely apologetic — candidates notice when reschedule messages feel automated",
      "Confirm the new time promptly once agreed — send an updated calendar invite immediately",
      "If rescheduling more than once, consider a personal phone call instead of another email",
    ],
    variants: [
      {
        label: "Candidate-initiated reschedule acknowledgment",
        subject: "Re: Rescheduling — [JOB_TITLE] interview",
        body: `Hi [CANDIDATE_FIRST_NAME],

No problem at all — thank you for letting us know in advance.

Here are some alternative times that work for us:

• [OPTION 1: DATE, TIME, TIMEZONE]
• [OPTION 2: DATE, TIME, TIMEZONE]
• [OPTION 3: DATE, TIME, TIMEZONE]

Just let me know which works best for you and I'll send a new invite straight away.

Best,
[RECRUITER_NAME]`,
      },
    ],
  },
  "job-offer-email": {
    slug: "job-offer-email",
    title: "Job Offer Email",
    category: "Offer",
    metaTitle: "Job Offer Email Template — KiteHR",
    metaDescription:
      "Free job offer email template. A warm, clear offer email that gets candidates excited to say yes.",
    description:
      "The email that accompanies or precedes a formal offer letter. Should be warm, celebratory, and clear on next steps. This is the moment — make it memorable.",
    subject: "Offer of Employment — [JOB_TITLE] at [COMPANY_NAME] 🎉",
    body: `Hi [CANDIDATE_FIRST_NAME],

We're delighted to offer you the position of [JOB_TITLE] at [COMPANY_NAME]!

On behalf of the whole team, I want to say how excited we are about the prospect of you joining us. You impressed everyone you spoke with throughout the process and we genuinely believe you'll make a huge impact here.

Here's a summary of your offer:

Position: [JOB_TITLE]
Start date: [PROPOSED_START_DATE]
Salary: [SALARY] per year
Benefits: [KEY BENEFITS — health, pension, equity, etc.]
Location: [LOCATION / Remote]

A formal offer letter with the complete terms and conditions is attached / will follow shortly.

Please take the time you need to review everything. We'd love to hear back from you by [DECISION_DATE] if possible.

In the meantime, please don't hesitate to reach out with any questions — I'm happy to jump on a call to discuss anything further.

Congratulations again, [CANDIDATE_FIRST_NAME]. We can't wait to welcome you to the team!

Warm regards,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Make it warm and personal — this is an exciting moment for the candidate",
      "Include the key compensation details in the email body — don't make them search the attachment",
      "Set a clear decision deadline (usually 3-7 days) but be flexible if they ask for more time",
      "Offer to jump on a call — candidates often have questions they're hesitant to put in writing",
    ],
    variants: [
      {
        label: "Verbal offer follow-up",
        subject: "Following up on our call — Offer for [JOB_TITLE]",
        body: `Hi [CANDIDATE_FIRST_NAME],

It was wonderful speaking with you earlier today! As discussed, I'm following up to confirm our offer for the [JOB_TITLE] role at [COMPANY_NAME].

As outlined on our call:
• Salary: [SALARY]
• Start date: [START_DATE]
• Benefits: [SUMMARY]

The formal offer letter will be sent to [EMAIL] shortly. Please review everything at your leisure and let us know if you have any questions.

We're so excited about the possibility of you joining us. Looking forward to hearing from you!

Best,
[RECRUITER_NAME]`,
      },
    ],
  },
  "application-received-confirmation": {
    slug: "application-received-confirmation",
    title: "Application Received Confirmation",
    category: "Follow-up",
    metaTitle: "Application Received Confirmation Email Template — KiteHR",
    metaDescription:
      "Free application received confirmation email template. Acknowledge every applicant instantly and set clear expectations.",
    description:
      "An automated acknowledgment email sent immediately when a candidate submits an application. Sets expectations and makes a strong first impression before you've even reviewed their CV.",
    subject: "We received your application — [JOB_TITLE] at [COMPANY_NAME]",
    body: `Hi [CANDIDATE_FIRST_NAME],

Thank you for applying for the [JOB_TITLE] position at [COMPANY_NAME]!

We've received your application and our team will review it carefully. We aim to be in touch within [TIMEFRAME — e.g., 5-7 business days] with an update.

In the meantime, you're welcome to learn more about us:
🌐 [COMPANY WEBSITE]
💼 [CAREERS PAGE / ABOUT US]

If you have any questions, feel free to reach out to [RECRUITER_EMAIL].

Thanks again for your interest — we look forward to reviewing your application.

Best,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Automate this immediately upon application submission — candidates who don't hear back often re-apply or assume their application was lost",
      "Set a realistic review timeframe and stick to it",
      "Include a link to your company's 'about us' page — gives candidates something to explore while waiting",
      "KiteHR can send this automatically for every application to your jobs",
    ],
    variants: [],
  },
  "candidate-follow-up-email": {
    slug: "candidate-follow-up-email",
    title: "Candidate Follow-Up Email",
    category: "Follow-up",
    metaTitle: "Candidate Follow-Up Email Template — KiteHR",
    metaDescription:
      "Free candidate follow-up email template. Re-engage candidates who haven't responded or check in with candidates mid-process.",
    description:
      "A follow-up email to re-engage a candidate who hasn't responded, or to update them on where they are in the process. Keeps the relationship warm and your pipeline moving.",
    subject: "Following up — [JOB_TITLE] at [COMPANY_NAME]",
    body: `Hi [CANDIDATE_FIRST_NAME],

I wanted to follow up on my previous message regarding the [JOB_TITLE] role at [COMPANY_NAME].

[Customise one of the following:]

Option A (no response): I understand you may be busy, but we're genuinely interested in speaking with you and didn't want you to miss out if timing or circumstances have changed. If you're still interested, I'd love to connect — just reply to this email and we'll take it from there.

Option B (process update): We're still actively progressing with your application and expect to have an update for you by [DATE]. Thank you for your patience — we appreciate it.

Please feel free to reach out if you have any questions in the meantime.

Best,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Send follow-ups no earlier than 5 business days after the initial message",
      "Limit to one follow-up — two unanswered emails is a clear signal",
      "Keep the tone light and not pushy — they may genuinely be busy",
      "Include your direct contact details to make it easy to respond",
    ],
    variants: [],
  },
  "hiring-process-update-email": {
    slug: "hiring-process-update-email",
    title: "Hiring Process Update Email",
    category: "Follow-up",
    metaTitle: "Hiring Process Update Email Template — KiteHR",
    metaDescription:
      "Free hiring process update email template. Keep candidates informed when your process is taking longer than expected.",
    description:
      "An email to update candidates when your hiring process is taking longer than anticipated. Prevents drop-off and maintains your employer brand.",
    subject: "Update on your application — [JOB_TITLE] at [COMPANY_NAME]",
    body: `Hi [CANDIDATE_FIRST_NAME],

I wanted to reach out with a quick update on your application for the [JOB_TITLE] role at [COMPANY_NAME].

Our hiring process is taking a little longer than we anticipated due to [BRIEF REASON — e.g., "a high volume of strong applications" / "some internal scheduling changes"]. We expect to be in touch with next steps by [NEW TIMELINE].

We remain very interested in your application and appreciate your patience. Please don't hesitate to reach out if you have any questions.

Best regards,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Send proactively before candidates start chasing you — it shows professionalism",
      "Be specific about the new timeline — vague updates frustrate candidates",
      "Even a brief update goes a long way for candidate experience",
      "KiteHR lets you trigger these updates with one click across all active candidates",
    ],
    variants: [],
  },
  "welcome-new-hire-email": {
    slug: "welcome-new-hire-email",
    title: "Welcome New Hire Email",
    category: "Onboarding",
    metaTitle: "Welcome New Hire Email Template — KiteHR",
    metaDescription:
      "Free welcome new hire email template. Give your new employee an amazing first impression before their start date.",
    description:
      "A warm welcome email sent to a new employee after they've signed their contract — before their first day. Sets the tone for a positive onboarding experience.",
    subject: "Welcome to [COMPANY_NAME], [FIRST_NAME]! 🎉",
    body: `Hi [FIRST_NAME],

On behalf of the entire [COMPANY_NAME] team — welcome! We're so excited you're joining us.

Your first day is [START_DATE]. Here's what to expect:

📍 Where to go: [OFFICE ADDRESS / Remote login instructions]
🕐 What time to arrive / sign on: [TIME]
👤 Who to ask for: [BUDDY/MANAGER NAME]
💻 What to bring: [ID for right-to-work / laptop if BYOD / nothing — we'll provide everything]

Before you start, we'll be in touch about:
• Equipment delivery / IT access
• Any paperwork we still need from you
• Your first day schedule

In the meantime, feel free to browse [COMPANY WEBSITE / Glassdoor / team LinkedIn] to get a feel for the team you're joining. And of course, reach out any time with questions — my inbox is always open.

We cannot wait to have you on board. See you on [START_DATE]!

Warm regards,
[MANAGER / HR_NAME]
[COMPANY_NAME]`,
    tips: [
      "Send within 24 hours of contract signing — excitement fades quickly if there's silence",
      "Be specific about Day 1 logistics — ambiguity is stressful for new joiners",
      "Introduce them to their buddy or direct manager by name",
      "Consider cc'ing their line manager so they can send a personal welcome note too",
    ],
    variants: [],
  },
  "pre-start-onboarding-email": {
    slug: "pre-start-onboarding-email",
    title: "Pre-Start Onboarding Email",
    category: "Onboarding",
    metaTitle: "Pre-Start Onboarding Email Template — KiteHR",
    metaDescription:
      "Free pre-start onboarding email template. Send before Day 1 to share practical info and make new hires feel ready.",
    description:
      "An email sent 2-5 days before a new employee's start date with practical onboarding information. Reduces Day 1 anxiety and ensures everything is in place.",
    subject: "Getting ready for your first day — [START_DATE]",
    body: `Hi [FIRST_NAME],

We're counting down to your first day on [START_DATE] — we can't wait!

Here are a few things to know before you start:

📋 Documents to bring / complete
[List any outstanding right-to-work documents, ID, bank details forms, etc.]

💻 IT & Access
[Equipment delivery confirmation / laptop setup instructions / login details if pre-provisioned]

📅 Your first week schedule
[Brief summary — e.g., "Monday: team intro + onboarding sessions. Tuesday onwards: you'll start working with your team on [PROJECT/AREA]"]

📖 Some useful reading if you fancy it:
• [Company handbook / culture doc link]
• [Team wiki / Notion / Confluence link]

Anything else you need before Monday — just shout!

See you very soon,
[HR_NAME / MANAGER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Send 3-5 days before start date, not on the eve — gives time to action any outstanding items",
      "Confirm equipment and IT access status — nothing demoralises a new hire faster than a blank screen on Day 1",
      "Optional reading is better than required reading — respects their time and sets a positive tone",
    ],
    variants: [],
  },
  "first-day-instructions-email": {
    slug: "first-day-instructions-email",
    title: "First Day Instructions Email",
    category: "Onboarding",
    metaTitle: "First Day Instructions Email Template — KiteHR",
    metaDescription:
      "Free first day instructions email template. Ensure your new hire knows exactly what to expect on their first day.",
    description:
      "A practical email sent the evening before or morning of a new employee's first day with all the logistical details they need to arrive confidently.",
    subject: "See you tomorrow, [FIRST_NAME]! — First day details",
    body: `Hi [FIRST_NAME],

Tomorrow's the day! Here are the details for your first day with [COMPANY_NAME].

🗓 Date: [START_DATE]
🕐 Time: Please arrive / sign on at [TIME]

📍 If coming to the office:
Address: [FULL ADDRESS]
Parking: [PARKING DETAILS]
Building entry: [ENTRY INSTRUCTIONS / buzz for reception / look for X]
Ask for: [RECEPTIONIST / BUDDY NAME]

💻 If working remotely:
Log in to [SLACK / TEAMS / ZOOM] at [TIME]
Your login credentials: [INSTRUCTIONS / will be waiting in your inbox]
Your buddy [NAME] will ping you to say hello

👤 Your first meeting: [TIME] — [MEETING DESCRIPTION] with [HOST NAME]

If anything comes up this evening or tomorrow morning, don't hesitate to call me directly: [PHONE NUMBER]

So looking forward to having you with us. See you tomorrow!

[HR_NAME / MANAGER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Send the evening before — first-day nerves are real and this gives them reassurance",
      "Include a direct phone number for genuine emergencies",
      "Be specific about building entry — 'walk to reception' is not enough in large offices",
    ],
    variants: [],
  },
  "reference-check-request-email": {
    slug: "reference-check-request-email",
    title: "Reference Check Request Email",
    category: "Reference",
    metaTitle: "Reference Check Request Email Template — KiteHR",
    metaDescription:
      "Free reference check request email template. A professional, clear request that gets prompt responses from references.",
    description:
      "An email sent to a professional reference to request feedback on a candidate. Should be clear about what you're asking, respectful of the reference's time, and include all relevant context.",
    subject: "Reference request for [CANDIDATE_FULL_NAME]",
    body: `Hi [REFERENCE_FIRST_NAME],

My name is [RECRUITER_NAME] and I'm [TITLE] at [COMPANY_NAME]. [CANDIDATE_FULL_NAME] has applied for a [JOB_TITLE] position with us and has given your name as a professional reference.

[CANDIDATE_FIRST_NAME] mentioned they worked with you at [PREVIOUS_COMPANY] as [THEIR ROLE], where they [BRIEF CONTEXT OF WORKING RELATIONSHIP — e.g., "reported to you directly" / "worked closely with your team"].

I'd be very grateful if you'd be willing to speak with me briefly — it would take no more than 15-20 minutes. I'd like to understand [CANDIDATE_FIRST_NAME]'s working style, strengths, and areas for growth.

Are you available for a call this week or next? I'm flexible on timing and happy to work around your schedule.

Alternatively, if you'd prefer to respond in writing, I'd be happy to send over a few questions by email.

Thank you so much for your time — I appreciate it.

Best regards,
[RECRUITER_NAME]
[COMPANY_NAME]
[PHONE NUMBER]`,
    tips: [
      "Always call for reference checks rather than relying solely on email — you get far more candid responses",
      "Mention the candidate's name and their relationship with the reference in the first paragraph",
      "Give them the option of a call or written response — increases response rates",
      "Never conduct reference checks before the candidate has accepted an offer in principle",
    ],
    variants: [],
  },
  "outbound-candidate-outreach-email": {
    slug: "outbound-candidate-outreach-email",
    title: "Outbound Candidate Outreach Email",
    category: "Sourcing",
    metaTitle: "Outbound Candidate Outreach Email Template — KiteHR",
    metaDescription:
      "Free outbound candidate sourcing email template. Personalised, respectful cold outreach that gets replies from passive candidates.",
    description:
      "A cold outreach email to a passive candidate who is not actively job seeking. The key is personalisation — generic outreach is immediately deleted. Show you've done your research.",
    subject: "Quick note from [COMPANY_NAME] — [JOB_TITLE] opportunity",
    body: `Hi [CANDIDATE_FIRST_NAME],

I came across your profile and was genuinely impressed by [SPECIFIC OBSERVATION — e.g., "your work on [PROJECT/COMPANY]" / "your background in [SPECIFIC SKILL/INDUSTRY]"].

I'm [YOUR_NAME], [TITLE] at [COMPANY_NAME]. We're [1-sentence description of what the company does and current stage — e.g., "a Series A HR tech startup building the free alternative to Greenhouse"].

We're looking for a [JOB_TITLE] to [1-sentence description of what they'd own/build]. Based on your background, I think you could be a great fit — and I'd love to hear your perspective even if you're not actively looking.

A few things that might be relevant:
• [COMPELLING DETAIL 1 — e.g., "Remote-first team across 5 countries"]
• [COMPELLING DETAIL 2 — e.g., "Series A, $8M raised, strong growth"]
• [COMPELLING DETAIL 3 — e.g., "Competitive salary + meaningful equity"]

Would you be open to a 20-minute exploratory call? No pressure at all — I'd genuinely value the conversation.

Best,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Personalise the first sentence to something specific on their profile — generic openers are ignored",
      "Keep it under 150 words — passive candidates won't read a novel",
      "Lead with what's interesting about them, not what you want from them",
      "Give 3 compelling reasons to engage — stage, remote policy, compensation signal, mission",
    ],
    variants: [],
  },
  "salary-negotiation-response-email": {
    slug: "salary-negotiation-response-email",
    title: "Salary Negotiation Response Email",
    category: "Offer",
    metaTitle: "Salary Negotiation Response Email Template — KiteHR",
    metaDescription:
      "Free salary negotiation response email template. Handle counter-offers professionally and keep candidates engaged.",
    description:
      "A response email when a candidate comes back with a salary counter-offer. Should be professional, warm, and aim to find a path to yes — while protecting the company's commercial position.",
    subject: "Re: [JOB_TITLE] Offer — [CANDIDATE_FIRST_NAME]",
    body: `Hi [CANDIDATE_FIRST_NAME],

Thank you for getting back to us and for your transparency — we appreciate you sharing what you need.

[OPTION A — If you can meet their ask:]
We've reviewed your request and are happy to offer [REVISED SALARY / ADJUSTED PACKAGE]. We hope this works for you — we'd love to welcome you to the team!

[OPTION B — If you can partially meet their ask:]
While [ORIGINAL SALARY] is at the top of our salary band for this role, we'd like to explore whether we can make the overall package work for you. We can offer [ALTERNATIVE — e.g., additional annual leave / sign-on bonus / earlier salary review after 6 months].

[OPTION C — If the band is firm:]
We've reviewed our position carefully and I want to be transparent — [SALARY] is the maximum we're able to offer for this role at this time. We believe it's competitive for the scope and impact of the position, and we remain very excited about having you on the team.

Would it be helpful to jump on a quick call to talk through the full package? I want to make sure we've explored every option.

Best,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Always respond by phone first for significant negotiations — email can feel cold in this moment",
      "Never respond to a counter with a flat no by email — explore alternatives first",
      "Know your walk-away point before the negotiation starts — base, sign-on bonus, equity, benefits",
      "Maintain warmth throughout — the negotiation is still part of their first impression of the company",
    ],
    variants: [],
  },
  "background-check-request-email": {
    slug: "background-check-request-email",
    title: "Background Check Request Email",
    category: "Compliance",
    metaTitle: "Background Check Request Email Template — KiteHR",
    metaDescription:
      "Free background check request email template. Clear and professional — sets expectations before starting the background verification process.",
    description:
      "An email to a candidate explaining that a background check is required as part of the hiring process, and providing instructions to complete it.",
    subject: "Background check — next step for your [JOB_TITLE] offer",
    body: `Hi [CANDIDATE_FIRST_NAME],

Congratulations again on your offer for the [JOB_TITLE] role at [COMPANY_NAME]!

As part of our standard onboarding process, we conduct a background check for all new hires. This is routine and applies to all positions.

What this includes:
• [LIST OF CHECKS — e.g., identity verification, right-to-work, employment history, DBS check]

What we need from you:
Please complete the background check process by [DEADLINE] using the link below:
[BACKGROUND CHECK PROVIDER LINK]

The process typically takes [TIMEFRAME — e.g., 2-5 business days] once you've submitted your details. You'll be notified directly by [PROVIDER NAME] once it's complete.

If you have any questions or concerns, please don't hesitate to get in touch.

Best,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Always mention that background checks are standard for all new hires — prevents candidates feeling singled out",
      "Set a clear deadline for completion to keep the start date on track",
      "Explain exactly what the check covers — surprises create anxiety",
      "Ensure your background check process complies with local employment law (GDPR, EEOC, etc.)",
    ],
    variants: [],
  },
  "employment-verification-email": {
    slug: "employment-verification-email",
    title: "Employment Verification Email",
    category: "Compliance",
    metaTitle: "Employment Verification Email Template — KiteHR",
    metaDescription:
      "Free employment verification email template. Use when responding to third-party requests to confirm an employee's employment.",
    description:
      "An email response to a third-party request (bank, landlord, mortgage provider) to confirm an employee's or former employee's employment details.",
    subject: "Employment Verification — [EMPLOYEE_FULL_NAME]",
    body: `To Whom It May Concern,

This letter confirms that [EMPLOYEE_FULL_NAME] [is/was] employed at [COMPANY_NAME].

Position: [JOB_TITLE]
Employment start date: [START_DATE]
[Employment end date: [END_DATE] / Current status: Currently employed]
Employment type: [Full-time / Part-time / Contract]
[Annual salary: [SALARY] — only include if the employee has provided written consent]

Please note that we are only able to confirm the information above. For any further details, please contact [HR_EMAIL / HR_PHONE].

Yours sincerely,
[HR_NAME]
[TITLE]
[COMPANY_NAME]
[DATE]`,
    tips: [
      "Only share salary information if the employee has given explicit written consent",
      "Always verify the identity of who is requesting the information before responding",
      "Keep a record of all verification requests and responses for compliance purposes",
      "Respond to verification requests from banks and landlords within 2 business days where possible",
    ],
    variants: [],
  },
  "thank-you-for-applying-email": {
    slug: "thank-you-for-applying-email",
    title: "Thank You For Applying Email",
    category: "Follow-up",
    metaTitle: "Thank You For Applying Email Template — KiteHR",
    metaDescription:
      "Free thank you for applying email template. Acknowledge applicants personally after interview to strengthen your employer brand.",
    description:
      "A personalised thank-you email sent after a candidate has completed an interview. Different from a rejection — this is a warm post-interview touchpoint while you're still deciding.",
    subject: "Thank you for interviewing with [COMPANY_NAME]",
    body: `Hi [CANDIDATE_FIRST_NAME],

Thank you so much for taking the time to interview for the [JOB_TITLE] role at [COMPANY_NAME]. We genuinely enjoyed our conversation.

We're currently completing our final interviews and expect to be in touch with an update by [DATE].

In the meantime, please don't hesitate to reach out if you have any questions.

Best,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Send within 24 hours of the interview — don't leave candidates in silence",
      "Include a specific timeline for the next update — reduces candidate anxiety",
      "This is NOT a rejection — it is a holding email while you complete the process",
    ],
    variants: [],
  },
  "internal-job-posting-email": {
    slug: "internal-job-posting-email",
    title: "Internal Job Posting Email",
    category: "Internal",
    metaTitle: "Internal Job Posting Email Template — KiteHR",
    metaDescription:
      "Free internal job posting email template. Announce open roles to your team before going external.",
    description:
      "An email sent to the company's employees to announce an open role and invite internal applications. Posting internally first supports career development and shows investment in your team.",
    subject: "Internal opportunity: [JOB_TITLE] — applications open",
    body: `Hi team,

We're excited to share that we're hiring for [JOB_TITLE] — and we're opening up applications internally first.

📌 Role: [JOB_TITLE]
📍 Location: [LOCATION / Remote]
💰 Salary: [SALARY BAND]
⏱ Start date: [TARGET START DATE]

About the role:
[2-3 sentences summarising what this person will own and why it matters]

Who we're looking for:
[2-3 key requirements]

How to apply:
If you're interested, please send your CV and a short note explaining your interest to [CONTACT EMAIL] by [INTERNAL DEADLINE].

If you know a great external candidate, please refer them via our referral programme — [REFERRAL DETAILS / LINK].

Questions? Reach out to [HIRING_MANAGER_NAME] directly.

Thanks,
[HR_NAME / HIRING_MANAGER]`,
    tips: [
      "Post internally at least 1 week before going external — shows respect for your team's growth",
      "Include the salary band — employees shouldn't have to apply blind",
      "Remind employees of the referral programme — internal networks are a great source",
      "Be clear about whether internal applicants will be prioritised or evaluated equally",
    ],
    variants: [],
  },
  "candidate-withdrawal-acknowledgment-email": {
    slug: "candidate-withdrawal-acknowledgment-email",
    title: "Candidate Withdrawal Acknowledgment Email",
    category: "Process",
    metaTitle: "Candidate Withdrawal Acknowledgment Email Template — KiteHR",
    metaDescription:
      "Free candidate withdrawal acknowledgment email template. Respond professionally when a candidate withdraws from your process.",
    description:
      "An email sent when a candidate withdraws their application. Should be gracious, leave the door open for future opportunities, and ask for brief feedback where appropriate.",
    subject: "Re: Withdrawal from [JOB_TITLE] process",
    body: `Hi [CANDIDATE_FIRST_NAME],

Thank you for letting us know — we completely understand and appreciate you taking the time to inform us.

We're sorry it didn't work out this time, but we hold you in high regard and would love to stay in touch. Please do keep an eye on our future openings at [CAREERS PAGE LINK], and we'd encourage you to connect with me on LinkedIn.

If you're comfortable sharing, we'd genuinely value any feedback about your experience with our process — it helps us improve for future candidates.

Wishing you the very best in whatever comes next!

Warm regards,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Always respond graciously — you never know when a withdrawn candidate may reapply or refer others",
      "Ask for feedback softly — 'if you're comfortable' reduces pressure and increases response rate",
      "Add them to a talent pool in your ATS if they're a strong candidate",
      "Don't take withdrawals personally — timing, competing offers, and personal circumstances all play a role",
    ],
    variants: [],
  },
  "offer-letter-follow-up-email": {
    slug: "offer-letter-follow-up-email",
    title: "Offer Letter Follow-Up Email",
    category: "Offer",
    metaTitle: "Offer Letter Follow-Up Email Template — KiteHR",
    metaDescription:
      "Free offer letter follow-up email template. Check in with candidates who haven't signed yet without applying pressure.",
    description:
      "A follow-up email to a candidate who received an offer letter but hasn't responded within the expected decision window. Should be warm and curious, not pressuring.",
    subject: "Checking in — [JOB_TITLE] offer from [COMPANY_NAME]",
    body: `Hi [CANDIDATE_FIRST_NAME],

I just wanted to check in about the offer we sent over for the [JOB_TITLE] role. I hope you've had a chance to review everything.

We remain very excited about you joining the team and want to make sure you have everything you need to make your decision.

If you have any outstanding questions about the role, team, compensation, or anything else — please don't hesitate to reach out. I'm happy to jump on a call and talk through anything.

We're hoping to finalise things by [DATE] if possible. Please let us know if you need any additional time.

Looking forward to hearing from you!

Best,
[RECRUITER_NAME]
[COMPANY_NAME]`,
    tips: [
      "Wait the full decision window before following up — respect the candidate's timeline",
      "Keep it warm and curious, not pressuring — you want them to want to join",
      "Offer a call — sometimes hesitation is about an unanswered question, not the offer itself",
      "If they need more time, give it graciously unless you genuinely have a competing candidate",
    ],
    variants: [],
  },
};

export function getHrEmailTemplate(slug: string): HrEmailTemplate | null {
  return hrEmailTemplates[slug] ?? null;
}

export function getAllHrEmailTemplateSlugs(): string[] {
  return Object.keys(hrEmailTemplates);
}

export const hrEmailTemplatesList = Object.values(hrEmailTemplates);
