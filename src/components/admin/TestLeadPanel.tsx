"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Send,
  ExternalLink,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
} from "lucide-react";

interface Props {
  lead: {
    id: string;
    status: string;
    contactEmail: string;
    emailCount: number;
    lastEmail: { subject: string; sentAt: string | null } | null;
  } | null;
  org: {
    id: string;
    name: string;
    claimedStatus: string;
    jobCount: number;
  } | null;
  claimUrl: string | null;
}

export function TestLeadPanel({ lead: initialLead, org: initialOrg, claimUrl: initialClaimUrl }: Props) {
  const router = useRouter();
  const [lead, setLead] = useState(initialLead);
  const [org, setOrg] = useState(initialOrg);
  const [claimUrl, setClaimUrl] = useState(initialClaimUrl);
  const [loading, setLoading] = useState<"setup" | "send" | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleSetupOrReset() {
    setLoading("setup");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/outreach/test-setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      setClaimUrl(data.claimUrl);
      setLead({ ...data.lead, emailCount: 0, lastEmail: null });
      setOrg({ ...data.org, name: "Acme Corp (test)", jobCount: 1 });
      setMessage({ text: lead ? "Reset complete — fresh claim token generated." : "Test lead created!", type: "success" });
      router.refresh();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Error", type: "error" });
    } finally {
      setLoading(null);
    }
  }

  async function handleSendEmail() {
    if (!lead) return;
    setLoading("send");
    setMessage(null);
    try {
      // Use {{CLAIM_URL}} — the send route replaces it with the persisted token URL
      const body = `<!-- Greeting -->
<p style="margin:0 0 20px;font-size:16px;color:#111827;line-height:1.6;">
  Hi <strong>Gonelf</strong>,
</p>
<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
  Saw you&rsquo;re hiring for <strong>Senior Software Engineer</strong>. We built KiteHR — a completely
  free ATS — and set up a workspace for you so you can start managing applications today,
  without the usual setup headache.
</p>
<table cellpadding="0" cellspacing="0" role="presentation"
       style="width:100%;margin:0 0 28px;background:#f5f3ff;border-radius:14px;padding:20px 24px;">
  <tr><td>
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
      <span style="font-size:17px;">📋</span>
      <span style="font-size:14px;color:#3730a3;font-weight:500;">Unlimited jobs, candidates &amp; users</span>
    </div>
    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
      <span style="font-size:17px;">⚡</span>
      <span style="font-size:14px;color:#3730a3;font-weight:500;">Kanban pipeline + AI-assisted screening</span>
    </div>
    <div style="display:flex;align-items:flex-start;gap:10px;">
      <span style="font-size:17px;">🔒</span>
      <span style="font-size:14px;color:#3730a3;font-weight:500;">Free forever — no credit card, no trial</span>
    </div>
  </td></tr>
</table>
<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin:0 0 28px;">
  <tr>
    <td align="center">
      <a href="{{CLAIM_URL}}"
         style="display:inline-block;background:#4f46e5;color:#ffffff;
                padding:16px 40px;border-radius:12px;font-size:16px;
                font-weight:700;text-decoration:none;letter-spacing:-0.2px;
                box-shadow:0 4px 14px rgba(79,70,229,0.35);">
        Claim your free workspace &rarr;
      </a>
    </td>
  </tr>
</table>
<p style="margin:0;font-size:14px;color:#9ca3af;text-align:center;">
  No per-seat pricing. No hidden fees. Most teams are set up in under 10 minutes.
</p>
<p style="margin:24px 0 0;font-size:14px;color:#9ca3af;">&mdash; The KiteHR team</p>
<p style="margin:16px 0 0;font-size:13px;color:#d1d5db;line-height:1.6;border-top:1px solid #f3f4f6;padding-top:16px;">
  <em>P.S. Yes, this email was sent by a robot. We&rsquo;re a tiny team, so we automate
  everything we possibly can &mdash; which is exactly why we built KiteHR.
  We figured if automation is good enough for our outreach, it&rsquo;s good enough for your hiring too. 🤖</em>
</p>`;

      const res = await fetch(`/api/admin/outreach/${lead.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Acme Corp — your free ATS workspace is ready`,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");

      setMessage({ text: `Email sent to gonelf@gmail.com!`, type: "success" });
      setLead((prev) =>
        prev
          ? {
              ...prev,
              status: "contacted",
              emailCount: prev.emailCount + 1,
              lastEmail: { subject: `Free ATS for Acme Corp's hiring`, sentAt: new Date().toISOString() },
            }
          : prev
      );
      router.refresh();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Error", type: "error" });
    } finally {
      setLoading(null);
    }
  }

  const isSetUp = !!(lead && org);

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSetupOrReset}
          disabled={!!loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading === "setup" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isSetUp ? "Reset test" : "Set up test lead"}
        </button>

        {isSetUp && (
          <button
            onClick={handleSendEmail}
            disabled={!!loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading === "send" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send test email
          </button>
        )}

        {claimUrl && (
          <a
            href={claimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open /claim page
          </a>
        )}
      </div>

      {/* Feedback message */}
      {message && (
        <p
          className={`text-sm px-4 py-2.5 rounded-xl ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Status cards */}
      {isSetUp && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lead card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Test lead</h2>
            </div>
            <dl className="space-y-1.5 text-sm">
              <Row label="Email" value={lead!.contactEmail} />
              <Row label="Status">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    lead!.status === "contacted"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {lead!.status}
                </span>
              </Row>
              <Row label="Emails sent" value={String(lead!.emailCount)} />
              {lead!.lastEmail && (
                <Row
                  label="Last sent"
                  value={
                    lead!.lastEmail.sentAt
                      ? new Date(lead!.lastEmail.sentAt).toLocaleString()
                      : "pending"
                  }
                />
              )}
            </dl>
            {lead && (
              <a
                href={`/admin/outreach/${lead.id}`}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                View full lead →
              </a>
            )}
          </div>

          {/* Org card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-3">
            <div className="flex items-center gap-2">
              {org!.claimedStatus === "CLAIMED" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-amber-500" />
              )}
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Test organisation</h2>
            </div>
            <dl className="space-y-1.5 text-sm">
              <Row label="Name" value={org!.name} />
              <Row label="Claim status">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    org!.claimedStatus === "CLAIMED"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {org!.claimedStatus}
                </span>
              </Row>
              <Row label="Jobs" value={String(org!.jobCount)} />
            </dl>
            {claimUrl && (
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2 break-all">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Claim URL</p>
                <a
                  href={claimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:underline break-all"
                >
                  {claimUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {!isSetUp && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-10 text-center text-sm text-gray-400 dark:text-gray-500">
          No test lead yet. Click <strong>Set up test lead</strong> to get started.
        </div>
      )}

      {/* How it works */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-5 space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">How to test</p>
        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
          <li>Click <strong>Set up test lead</strong> (or <strong>Reset test</strong> to start over)</li>
          <li>Click <strong>Send test email</strong> — you&apos;ll receive it at gonelf@gmail.com</li>
          <li>Click the <strong>Claim your workspace</strong> link in the email</li>
          <li>Sign up or log in — the org will be marked as <strong>CLAIMED</strong></li>
          <li>Hit <strong>Reset test</strong> to wipe emails, unlink the org, and get a fresh token</li>
        </ol>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="text-gray-500 dark:text-gray-400 shrink-0">{label}</dt>
      <dd className="text-gray-900 dark:text-gray-100 text-right">{children ?? value}</dd>
    </div>
  );
}
