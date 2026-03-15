"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChangeJobStatusButtonProps {
  jobId: string;
  currentStatus: string;
}

const statuses = ["DRAFT", "OPEN", "CLOSED"];

export function ChangeJobStatusButton({ jobId, currentStatus }: ChangeJobStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update job status");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={loading}
      className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
