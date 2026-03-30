"use client";

import { useState } from "react";
import { Puzzle, Trash2, Copy, Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Token = {
  id: string;
  label: string;
  lastUsedAt: string | null;
  createdAt: string;
};

type Props = {
  initialTokens: Token[];
};

export function ExtensionTokenManager({ initialTokens }: Props) {
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/extension/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "Chrome Extension" }),
      });
      if (!res.ok) throw new Error("Failed to generate token");
      const data = await res.json();
      setTokens((prev) => [{ id: data.id, label: data.label, lastUsedAt: null, createdAt: data.createdAt }, ...prev]);
      setNewToken(data.token);
    } catch {
      setError("Could not generate token. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function revoke(id: string) {
    setRevoking(id);
    setError(null);
    try {
      const res = await fetch(`/api/extension/token?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke token");
      setTokens((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Could not revoke token. Please try again.");
    } finally {
      setRevoking(null);
    }
  }

  async function copyToken() {
    if (!newToken) return;
    await navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Puzzle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Chrome Extension</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Source candidates from LinkedIn directly into KiteHR
            </p>
          </div>
        </div>
        <Button size="sm" onClick={generate} disabled={generating}>
          <Plus className="h-4 w-4 mr-1" />
          {generating ? "Generating…" : "Generate Token"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
      )}

      {/* One-time token display */}
      {newToken && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Copy this token now — it won&apos;t be shown again.
            </p>
            <button
              onClick={() => setNewToken(null)}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs font-mono text-gray-800 dark:text-gray-200 truncate">
              {newToken}
            </code>
            <button
              onClick={copyToken}
              className="shrink-0 rounded-md border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center gap-1"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            Paste this into the KiteHR Sourcer extension settings.
          </p>
        </div>
      )}

      {/* Token list */}
      {tokens.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No tokens yet. Generate one to connect the Chrome extension.
        </p>
      ) : (
        <ul className="space-y-2">
          {tokens.map((token) => (
            <li
              key={token.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{token.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {token.lastUsedAt
                    ? `Last used ${new Date(token.lastUsedAt).toLocaleDateString()}`
                    : "Never used"}
                  {" · "}
                  Created {new Date(token.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => revoke(token.id)}
                disabled={revoking === token.id}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 p-1 rounded"
                title="Revoke token"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
