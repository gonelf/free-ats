"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  Zap,
  Brain,
  FileText,
  Mail,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Brain, text: "AI resume parsing — auto-fill candidate profiles" },
  { icon: Zap, text: "Candidate scoring — ranked 0-100 vs. job requirements" },
  { icon: FileText, text: "AI job description generator" },
  { icon: Mail, text: "AI email drafting (outreach, rejections, offers)" },
  { icon: Sparkles, text: "Interview & screening question generation" },
  { icon: BarChart3, text: "Pipeline bottleneck analysis" },
  { icon: Check, text: "Skills gap analysis" },
  { icon: Check, text: "Salary range suggestions" },
  { icon: Check, text: "Bias checker for job postings" },
  { icon: Check, text: "Auto-tagging candidates" },
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-600 mb-6">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Upgrade to Pro
        </h1>
        <p className="text-lg text-gray-500">
          Your ATS is free forever. Pro unlocks AI to save hours every week.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-xl mb-6">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <span className="text-4xl font-bold text-gray-900">$49</span>
            <span className="text-gray-500 ml-2">/ month per workspace</span>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
            All AI features included
          </span>
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <li key={i} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100">
                  <Icon className="h-3 w-3 text-indigo-600" />
                </div>
                <span className="text-sm text-gray-700">{feature.text}</span>
              </li>
            );
          })}
        </ul>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full h-12 text-base"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Redirecting to checkout..." : "Upgrade to Pro — $49/mo"}
        </Button>

        <p className="mt-4 text-center text-xs text-gray-400">
          Cancel anytime. Your free ATS features are never affected.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          Free plan always includes:
        </h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Unlimited jobs and candidates
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Custom pipeline stages
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Team collaboration
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Resume uploads
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Notes and email templates
          </li>
        </ul>
      </div>
    </div>
  );
}
