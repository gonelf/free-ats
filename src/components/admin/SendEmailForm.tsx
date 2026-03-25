"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

const DEFAULT_SUBJECT = (companyName: string) =>
  `Free ATS for ${companyName}'s hiring`;

const DEFAULT_BODY = (companyName: string, hiringFor: string) => `Hi ${companyName},

${hiringFor ? `Saw you're hiring for ${hiringFor} — congrats on the growth.\n\n` : ""}We built KiteHR — a completely free ATS (unlimited jobs, unlimited candidates, unlimited users). No per-seat pricing, no hidden fees, no trial period.

Most ATS tools charge $200-500/month. We don't.

Worth a look if you're managing hiring in spreadsheets or email:
https://app.kitehr.co/signup

— The KiteHR team`;

interface Props {
  leadId: string;
  companyName: string;
  hiringFor: string;
}

export function SendEmailForm({ leadId, companyName, hiringFor }: Props) {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT(companyName));
  const [body, setBody] = useState(DEFAULT_BODY(companyName, hiringFor));
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/outreach/${leadId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to send email");
        return;
      }

      setSent(true);
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
        <Send className="h-4 w-4 shrink-0" />
        Email sent successfully
        <button
          onClick={() => setSent(false)}
          className="ml-auto text-green-600 dark:text-green-500 hover:underline text-xs"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Body (plain text)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          required
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Plain text only. Links to app.kitehr.co will be click-tracked automatically.
        </p>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        <Send className="h-4 w-4" />
        {loading ? "Sending…" : "Send email"}
      </button>
    </form>
  );
}
