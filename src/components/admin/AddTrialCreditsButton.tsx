"use client";

import { useState } from "react";
import { PlusCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddTrialCreditsButtonProps {
  orgId: string;
  orgName: string;
  currentCredits: number;
}

export function AddTrialCreditsButton({ orgId, orgName, currentCredits }: AddTrialCreditsButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const credits = parseInt(amount, 10);
    if (isNaN(credits) || credits <= 0) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiCreditsBalance: currentCredits + credits }),
      });
      if (res.ok) {
        setOpen(false);
        setAmount("100");
        router.refresh();
      } else {
        alert("Failed to add credits");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Add trial credits"
        className="rounded p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
      >
        <PlusCircle className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Add Trial Credits</h2>
                <p className="mt-0.5 text-sm text-gray-500 truncate max-w-[240px]">{orgName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Current balance</p>
                <p className="text-xl font-semibold tabular-nums text-gray-900">{currentCredits.toLocaleString()}</p>
              </div>
              <div className="text-gray-300 text-lg font-light">→</div>
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500">New balance</p>
                <p className="text-xl font-semibold tabular-nums text-indigo-600">
                  {(currentCredits + (parseInt(amount, 10) || 0)).toLocaleString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="credits-amount" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Credits to add
                </label>
                <input
                  id="credits-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Adding…" : "Add Credits"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
