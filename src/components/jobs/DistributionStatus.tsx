import { CheckCircle2, XCircle, Clock, WifiOff } from "lucide-react";
import type { JobDistribution } from "@prisma/client";

interface DistributionStatusProps {
  distributions: JobDistribution[];
  linkedinConnected: boolean;
  indeedFeedUrl: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  indeed_feed: "Indeed Feed",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "distributed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Posted
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        <XCircle className="h-3 w-3" />
        Failed
      </span>
    );
  }
  if (status === "closed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        <WifiOff className="h-3 w-3" />
        Closed
      </span>
    );
  }
  return null;
}

export function DistributionStatus({
  distributions,
  linkedinConnected,
  indeedFeedUrl,
}: DistributionStatusProps) {
  const distByPlatform = Object.fromEntries(distributions.map((d) => [d.platform, d]));

  const platforms = [
    { key: "linkedin", connected: linkedinConnected },
    { key: "indeed_feed", connected: true },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Distribution
      </p>
      <div className="flex flex-wrap gap-4">
        {platforms.map(({ key, connected }) => {
          const dist = distByPlatform[key];
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{PLATFORM_LABELS[key] ?? key}</span>
              {!connected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
                  <WifiOff className="h-3 w-3" />
                  Not connected
                </span>
              ) : dist ? (
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={dist.status} />
                  {dist.status === "failed" && dist.errorMessage && (
                    <span
                      className="text-xs text-red-500 cursor-help"
                      title={dist.errorMessage}
                    >
                      (hover for details)
                    </span>
                  )}
                  {key === "indeed_feed" && dist.status === "distributed" && (
                    <a
                      href={indeedFeedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      View feed
                    </a>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  <Clock className="h-3 w-3" />
                  Not posted
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
