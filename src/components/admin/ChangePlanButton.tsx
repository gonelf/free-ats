"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChangePlanButtonProps {
  orgId: string;
  orgName: string;
  currentPlan: string;
}

export function ChangePlanButton({ orgId, orgName, currentPlan }: ChangePlanButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    try {
      const newPlan = currentPlan === "PRO" ? "FREE" : "PRO";
      const res = await fetch(`/api/admin/orgs/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update plan");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={currentPlan === "PRO" ? "Downgrade to Free" : "Upgrade to Pro"}
      className={`rounded p-1.5 transition-colors disabled:opacity-50 ${
        currentPlan === "PRO"
          ? "text-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
          : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
      }`}
    >
      <Crown className="h-4 w-4" />
    </button>
  );
}
