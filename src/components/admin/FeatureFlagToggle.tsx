"use client";

import { useState } from "react";

type Rollout = "DISABLED" | "ADMINS" | "EVERYONE";

const OPTIONS: { value: Rollout; label: string; description: string }[] = [
  { value: "DISABLED", label: "Off", description: "Disabled for everyone" },
  { value: "ADMINS", label: "Admins", description: "Visible to app admins only" },
  { value: "EVERYONE", label: "Everyone", description: "Enabled for all users" },
];

interface FeatureFlagToggleProps {
  flagKey: string;
  initialRollout: Rollout;
}

export function FeatureFlagToggle({ flagKey, initialRollout }: FeatureFlagToggleProps) {
  const [rollout, setRollout] = useState<Rollout>(initialRollout);
  const [loading, setLoading] = useState(false);

  async function select(value: Rollout) {
    if (value === rollout || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: flagKey, rollout: value }),
      });
      if (res.ok) setRollout(value);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={[
        "inline-flex rounded-lg border border-gray-200 overflow-hidden",
        loading ? "opacity-50" : "",
      ].join(" ")}
    >
      {OPTIONS.map((opt) => {
        const isActive = rollout === opt.value;
        const activeClass =
          opt.value === "DISABLED"
            ? "bg-gray-700 text-white"
            : opt.value === "ADMINS"
              ? "bg-amber-500 text-white"
              : "bg-green-500 text-white";
        return (
          <button
            key={opt.value}
            onClick={() => select(opt.value)}
            disabled={loading}
            title={opt.description}
            className={[
              "px-3 py-1.5 text-xs font-medium transition-colors",
              isActive ? activeClass : "bg-white text-gray-500 hover:bg-gray-50",
              loading ? "cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
