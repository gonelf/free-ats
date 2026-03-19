"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyFeedUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <code className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 truncate">
        {url}
      </code>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
