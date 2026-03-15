"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpdateResumeExpiryButtonProps {
  candidateId: string;
  currentExpiry: string | null;
}

export function UpdateResumeExpiryButton({
  candidateId,
  currentExpiry,
}: UpdateResumeExpiryButtonProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(
    currentExpiry ? new Date(currentExpiry).toISOString().split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeExpiresAt: date ? new Date(date).toISOString() : null,
        }),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        alert("Failed to update expiry");
      }
    } finally {
      setLoading(false);
    }
  }

  if (open) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded px-2 py-1 text-xs bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "..." : "Save"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="rounded p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
      title="Update resume expiry"
    >
      <Calendar className="h-4 w-4" />
    </button>
  );
}
