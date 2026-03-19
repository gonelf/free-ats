"use client";

import { useState } from "react";

interface FeatureFlagToggleProps {
  flagKey: string;
  initialEnabled: boolean;
}

export function FeatureFlagToggle({ flagKey, initialEnabled }: FeatureFlagToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: flagKey, enabled: !enabled }),
      });
      if (res.ok) {
        setEnabled((v) => !v);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={enabled ? "Disable flag" : "Enable flag"}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
        enabled ? "bg-green-500" : "bg-gray-300",
        loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          enabled ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
