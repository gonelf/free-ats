"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddLeadButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    website: "",
    contactEmail: "",
    contactName: "",
    hiringFor: "",
    notes: "",
  });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setOpen(false);
      setForm({ companyName: "", website: "", contactEmail: "", contactName: "", hiringFor: "", notes: "" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        <Plus className="h-4 w-4" /> Add lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Add lead manually</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { id: "companyName", label: "Company name *", placeholder: "Acme Corp" },
                { id: "website", label: "Website", placeholder: "acme.com" },
                { id: "contactEmail", label: "Contact email", placeholder: "hr@acme.com" },
                { id: "contactName", label: "Contact name", placeholder: "Jane Smith" },
                { id: "hiringFor", label: "Hiring for", placeholder: "Senior Engineer, Product Manager" },
              ].map(({ id, label, placeholder }) => (
                <div key={id}>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input
                    value={(form as any)[id]}
                    onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
                    placeholder={placeholder}
                    required={id === "companyName"}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Adding…" : "Add lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
