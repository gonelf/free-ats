"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage your subscription and payment details.
      </p>

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <Check className="h-4 w-4" />
          You&apos;re now on Pro! AI features are unlocked.
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Current Plan</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your subscription via Stripe
            </p>
          </div>
          <Button
            variant="outline"
            onClick={openPortal}
            disabled={loading}
          >
            <ExternalLink className="h-4 w-4" />
            {loading ? "Loading..." : "Manage Billing"}
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm text-gray-500">
          Your subscription is managed through Stripe. Use the &quot;Manage Billing&quot; button to:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          <li>• Update your payment method</li>
          <li>• Download invoices</li>
          <li>• Cancel your subscription</li>
          <li>• View billing history</li>
        </ul>
      </div>
    </div>
  );
}
