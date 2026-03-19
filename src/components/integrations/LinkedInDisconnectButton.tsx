"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LinkedInDisconnectButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function disconnect() {
    if (!confirm("Disconnect LinkedIn? Active job distributions will be marked as closed.")) return;
    setLoading(true);
    try {
      await fetch("/api/integrations/linkedin/disconnect", { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={disconnect}
      disabled={loading}
      className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
