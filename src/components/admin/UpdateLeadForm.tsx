"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["new", "contacted", "responded", "converted", "bounced", "unsubscribed"] as const;

interface Lead {
  id: string;
  companyName: string;
  contactEmail: string | null;
  contactName: string | null;
  website: string | null;
  hiringFor: string | null;
  notes: string | null;
  status: string;
  source: string;
  sourceUrl: string | null;
}

export function UpdateLeadForm({ lead }: { lead: Lead }) {
  const [form, setForm] = useState({
    status: lead.status,
    contactEmail: lead.contactEmail ?? "",
    contactName: lead.contactName ?? "",
    website: lead.website ?? "",
    hiringFor: lead.hiringFor ?? "",
    notes: lead.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/admin/outreach/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Lead Details</h2>
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
        {[
          { id: "contactEmail", label: "Contact email", placeholder: "hr@company.com" },
          { id: "contactName", label: "Contact name", placeholder: "Jane Smith" },
          { id: "website", label: "Website", placeholder: "company.com" },
          { id: "hiringFor", label: "Hiring for", placeholder: "Senior Engineers, PM…" },
        ].map(({ id, label, placeholder }) => (
          <div key={id}>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input
              value={(form as any)[id]}
              onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
              placeholder={placeholder}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Internal notes…"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {lead.sourceUrl && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Source: <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{lead.source.replace("_", " ")}</a>
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-gray-900 dark:bg-gray-100 px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
