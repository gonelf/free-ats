"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiGateProps {
  hasAiAccess: boolean;
  children: React.ReactNode;
  featureName?: string;
}

export function AiGate({ hasAiAccess, children, featureName = "AI feature" }: AiGateProps) {
  if (hasAiAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 p-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
            <Lock className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {featureName} is a Pro feature
            </p>
            <p className="text-xs text-gray-500">
              Upgrade to unlock AI-powered tools
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/upgrade">
              <Sparkles className="h-3 w-3" />
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AiButtonProps {
  hasAiAccess: boolean;
  onClick: () => void;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  creditCost?: number;
}

export function AiButton({
  hasAiAccess,
  onClick,
  children,
  loading,
  className,
  creditCost,
}: AiButtonProps) {
  if (!hasAiAccess) {
    return (
      <Link href="/upgrade">
        <Button variant="outline" size="sm" className={className}>
          <Lock className="h-3 w-3 mr-1" />
          {children}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={loading}
      className={className}
    >
      <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
      {loading ? "Generating..." : children}
      {creditCost !== undefined && !loading && (
        <span className="ml-1.5 flex items-center gap-0.5 border-l border-gray-200 pl-1.5">
          <span className="text-[10px] font-semibold tabular-nums text-indigo-400">{creditCost}</span>
          <span className="text-[9px] font-medium text-indigo-300">cr</span>
        </span>
      )}
    </Button>
  );
}
