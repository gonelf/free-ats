"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Check, Sparkles, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";

interface CreditsData {
  balance: number;
  monthly: number;
  resetAt: string | null;
  isPro: boolean;
}

function BillingContent() {
  const [loading, setLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const router = useRouter();
  const refreshed = useRef(false);

  useEffect(() => {
    // Always sync with Stripe on page load so the UI reflects the real subscription state,
    // regardless of how the user arrived (direct nav, post-checkout, post-portal cancel).
    let attempts = 0;
    const maxAttempts = 8;
    let timer: ReturnType<typeof setTimeout>;

    const syncAndPoll = async () => {
      let dbChanged = false;
      try {
        const res = await fetch("/api/stripe/sync-subscription", { method: "POST" });
        const data = await res.json();
        dbChanged = data.changed ?? false;
      } catch { /* ignore */ }

      const poll = () => {
        fetch("/api/credits")
          .then((r) => r.json())
          .then((d: CreditsData) => {
            setCredits(d);
            // After ?success, keep polling until isPro flips true.
            if (success && !d.isPro && attempts < maxAttempts) {
              attempts++;
              timer = setTimeout(poll, 1500);
            } else if ((dbChanged || success) && !refreshed.current) {
              refreshed.current = true;
              router.refresh();
            }
          })
          .catch(() => { });
      };

      poll();
    };

    syncAndPoll();
    return () => clearTimeout(timer);
  }, [success, router]);

  async function handleUpgrade() {
    setUpgradeLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setUpgradeLoading(false);
    }
  }

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  const creditsPercent = credits
    ? Math.round((credits.balance / credits.monthly) * 100)
    : 0;
  const creditsLow = creditsPercent <= 20;
  const resetLabel = credits?.resetAt
    ? new Date(credits.resetAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Billing</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Manage your subscription and AI credit usage.
      </p>

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <Check className="h-4 w-4" />
          You&apos;re now on Pro! AI features and 2,500 monthly credits are unlocked.
        </div>
      )}

      {/* Subscription */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Subscription</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your plan via Stripe</p>
          </div>
          <Button variant="outline" onClick={openPortal} disabled={loading}>
            <ExternalLink className="h-4 w-4" />
            {loading ? "Loading..." : "Manage Billing"}
          </Button>
        </div>
      </div>

      {/* AI Credits — Pro only */}
      {credits?.isPro && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-indigo-500" />
            <h2 className="font-medium text-gray-900 dark:text-gray-100">AI Credits</h2>
          </div>

          <div className="flex items-end justify-between mb-3">
            <div>
              <span className={`text-3xl font-bold tabular-nums ${creditsLow ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}>
                {credits.balance.toLocaleString()}
              </span>
              <span className="text-gray-400 dark:text-gray-500 ml-1 text-sm">
                / {credits.monthly.toLocaleString()} credits remaining
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{creditsPercent}% left</span>
          </div>

          <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${creditsLow ? "bg-red-500" : creditsPercent <= 50 ? "bg-amber-500" : "bg-indigo-500"
                }`}
              style={{ width: `${creditsPercent}%` }}
            />
          </div>

          {resetLabel && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Credits reset to {credits.monthly.toLocaleString()} on{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">{resetLabel}</span>
            </p>
          )}

          {creditsLow && (
            <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              You&apos;re running low on AI credits. They reset automatically on {resetLabel}.
            </div>
          )}

          {/* Credit costs reference */}
          <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Credits per feature
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
              {(
                [
                  ["Resume parsing", 10],
                  ["Offer letter", 10],
                  ["Pipeline insights", 10],
                  ["Job description", 8],
                  ["Candidate scoring", 5],
                  ["Candidate summary", 5],
                  ["Draft email", 5],
                  ["Interview questions", 5],
                  ["Skills gap", 5],
                  ["Bias check", 3],
                  ["Salary suggestion", 3],
                  ["Reference questions", 3],
                  ["Auto-tagging", 2],
                ] as [string, number][]
              ).map(([label, cost]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{cost} cr</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!credits?.isPro && credits !== null && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <p className="font-medium text-indigo-900">AI Credits included with Pro</p>
          </div>
          <p className="text-sm text-indigo-700 mb-4">
            Upgrade to Pro for $49/mo to get 2,500 AI credits every month —
            enough for hundreds of resume parses, candidate scores, and email drafts.
          </p>
          <Button onClick={handleUpgrade} disabled={upgradeLoading} className="w-full">
            <Sparkles className="h-4 w-4" />
            {upgradeLoading ? "Redirecting to checkout..." : "Upgrade Now"}
          </Button>
        </div>
      )}

      {/* Stripe info */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your subscription is managed through Stripe. Use &quot;Manage Billing&quot; to:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>• Update your payment method</li>
          <li>• Download invoices</li>
          <li>• Cancel your subscription</li>
          <li>• View billing history</li>
        </ul>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading billing details...</div>}>
      <BillingContent />
    </Suspense>
  );
}
