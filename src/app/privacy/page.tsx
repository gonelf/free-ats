import Link from "next/link";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — KiteHR",
  description:
    "Learn how KiteHR collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "Information We Collect",
    content: [
      {
        subtitle: "Account information",
        text: "When you create a KiteHR account, we collect your name, email address, and password. If you upgrade to Pro, we also collect billing information via Stripe — we do not store your full card number.",
      },
      {
        subtitle: "Usage data",
        text: "We collect information about how you use KiteHR, including pages visited, features used, and actions taken within the app. This helps us improve the product.",
      },
      {
        subtitle: "Candidate data",
        text: "When you use KiteHR to manage hiring, you may upload candidate resumes, notes, and other information. You are the data controller for this information — we process it on your behalf.",
      },
      {
        subtitle: "Cookies and analytics",
        text: "We use cookies and third-party analytics tools (including Google Analytics, Amplitude, and Vercel Analytics) to understand how visitors use our site and improve our service.",
      },
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "To provide the service",
        text: "We use your information to operate KiteHR, including authenticating you, processing payments, and storing your hiring data.",
      },
      {
        subtitle: "To improve the product",
        text: "Aggregated and anonymized usage data helps us understand which features are valuable and where to invest in improvements.",
      },
      {
        subtitle: "To communicate with you",
        text: "We may send you transactional emails (password resets, billing receipts) and occasional product updates. You can opt out of marketing emails at any time.",
      },
      {
        subtitle: "AI features",
        text: "If you use Pro AI features, resume and job data you submit is sent to Google's Generative AI API for processing. We do not use your data to train third-party AI models.",
      },
    ],
  },
  {
    title: "Data Storage and Security",
    content: [
      {
        subtitle: "Where data is stored",
        text: "Your data is stored in a PostgreSQL database hosted on Supabase, with infrastructure in the United States. Resume files are stored in AWS S3.",
      },
      {
        subtitle: "Security measures",
        text: "We use industry-standard security practices including encrypted connections (TLS), hashed passwords, and access controls. We regularly review our security posture.",
      },
      {
        subtitle: "Data retention",
        text: "We retain your account data as long as your account is active. If you delete your account, we will delete your data within 30 days, except where required by law.",
      },
    ],
  },
  {
    title: "Sharing Your Information",
    content: [
      {
        subtitle: "We do not sell your data",
        text: "We will never sell your personal information or candidate data to third parties.",
      },
      {
        subtitle: "Service providers",
        text: "We share data with trusted service providers who help us operate KiteHR, including Supabase (database), AWS (file storage), Stripe (payments), Resend (email), and Google (AI features). Each provider is bound by data processing agreements.",
      },
      {
        subtitle: "Legal requirements",
        text: "We may disclose your information if required by law, court order, or to protect the rights and safety of KiteHR and its users.",
      },
    ],
  },
  {
    title: "Your Rights",
    content: [
      {
        subtitle: "Access and portability",
        text: "You can export your data at any time from your account settings. You have the right to request a copy of all personal data we hold about you.",
      },
      {
        subtitle: "Correction and deletion",
        text: "You can update your account information at any time. To delete your account and all associated data, contact us at privacy@kitehr.com.",
      },
      {
        subtitle: "GDPR and CCPA",
        text: "If you are located in the European Economic Area or California, you have additional rights including the right to object to processing and the right to restrict processing. Contact us to exercise these rights.",
      },
    ],
  },
  {
    title: "Cookies",
    content: [
      {
        subtitle: "Essential cookies",
        text: "We use cookies necessary to operate the service, such as authentication tokens that keep you logged in.",
      },
      {
        subtitle: "Analytics cookies",
        text: "We use analytics cookies to understand how visitors use KiteHR. You can opt out of analytics by using browser privacy settings or tools like uBlock Origin.",
      },
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      {
        subtitle: "Updates",
        text: "We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by displaying a notice in the app. The date of the last update is shown at the top of this page.",
      },
    ],
  },
  {
    title: "Contact Us",
    content: [
      {
        subtitle: "Questions or requests",
        text: "If you have any questions about this Privacy Policy or want to exercise your data rights, contact us at privacy@kitehr.com.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav />

      {/* Hero */}
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-5 tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            How we collect, use, and protect your information.
          </p>
          <p className="text-sm text-slate-400 mt-4">Last updated: March 25, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-8">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8"
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-5">
                  {section.title}
                </h2>
                <div className="space-y-5">
                  {section.content.map((item) => (
                    <div key={item.subtitle}>
                      <h3 className="text-sm font-semibold text-slate-700 mb-1.5">
                        {item.subtitle}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              Have questions?{" "}
              <Link
                href="mailto:privacy@kitehr.com"
                className="text-teal-700 hover:text-teal-800 transition-colors font-medium"
              >
                privacy@kitehr.com
              </Link>
            </p>
          </div>
        </div>
      </section>

      <div className="py-8" />
      <PublicFooter />
    </div>
  );
}
