"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Users,
  GitBranch,
  Mail,
  Settings,
  Users2,
  BarChart3,
  Sparkles,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/pipelines", label: "Pipelines", icon: GitBranch },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/email-templates", label: "Email Templates", icon: Mail },
  { href: "/team", label: "Team", icon: Users2 },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  orgName: string;
  isPro: boolean;
  aiCreditsBalance: number;
  aiCreditsMonthly: number;
  aiCreditsResetAt: Date | null;
}

export function Sidebar({
  orgName,
  isPro,
  aiCreditsBalance,
  aiCreditsMonthly,
  aiCreditsResetAt,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const creditsPercent = Math.round((aiCreditsBalance / aiCreditsMonthly) * 100);
  const creditsLow = creditsPercent <= 20;
  const resetLabel = aiCreditsResetAt
    ? new Date(aiCreditsResetAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Briefcase className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
            {orgName}
          </span>
          {isPro ? (
            <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
              <Sparkles className="h-3 w-3" />
              Pro
            </span>
          ) : (
            <span className="text-xs text-gray-400">Free Plan</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* AI Credits — shown for all plans */}
        {aiCreditsBalance > 0 || isPro ? (
          <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className={cn("h-3.5 w-3.5", creditsLow ? "text-red-500" : "text-indigo-500")} />
                <span className="text-xs font-semibold text-gray-700">
                  {isPro ? "AI Credits" : "Trial Credits"}
                </span>
              </div>
              <span className={cn("text-xs font-medium tabular-nums", creditsLow ? "text-red-600" : "text-gray-600")}>
                {aiCreditsBalance.toLocaleString()} / {aiCreditsMonthly.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  creditsLow ? "bg-red-500" : creditsPercent <= 50 ? "bg-amber-500" : "bg-indigo-500"
                )}
                style={{ width: `${creditsPercent}%` }}
              />
            </div>
            {isPro && resetLabel && (
              <p className="text-[11px] text-gray-400 mt-1.5">
                Resets {resetLabel}
              </p>
            )}
            {!isPro && (
              <p className="text-[11px] text-gray-400 mt-1.5">
                One-time trial
              </p>
            )}
            {creditsLow && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">
                {isPro ? "Running low on credits" : "Almost out — upgrade for monthly credits"}
              </p>
            )}
          </div>
        ) : null}

        {!isPro && (
          <div className="mt-6 rounded-lg bg-indigo-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-900">
                Upgrade to Pro
              </span>
            </div>
            <p className="text-xs text-indigo-700 mb-3">
              Unlock AI features: resume parsing, candidate scoring, email drafting, and more.
            </p>
            <Link
              href="/upgrade"
              className="block w-full rounded-md bg-indigo-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-indigo-700"
            >
              Upgrade Now
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 px-3 py-4">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
