"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  UserCheck,
  FileText,
  LogOut,
  Shield,
  Import,
  ClipboardList,
  Clock,
  DollarSign,
  Flag,
  MessageSquare,
  Menu,
  X,
  Mail,
  Globe,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orgs", label: "Organizations", icon: Building2, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, exact: false },
  { href: "/admin/candidates", label: "Candidates & Resumes", icon: UserCheck, exact: false },
  { href: "/admin/non-ats-jobs", label: "Non-ATS Import", icon: Import, exact: false },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList, exact: false },
  { href: "/admin/cron-logs", label: "Cron Logs", icon: Clock, exact: false },
  { href: "/admin/feature-flags", label: "Feature Flags", icon: Flag, exact: false },
  { href: "/admin/requests", label: "Requests", icon: MessageSquare, exact: false },
  { href: "/admin/outreach", label: "Outreach", icon: Mail, exact: false },
  { href: "/admin/indexing", label: "Google Indexing", icon: Globe, exact: false },
];

const pseoItems = [
  { href: "/admin/salary-data", label: "Salary Data", icon: DollarSign, exact: false },
  { href: "/admin/sop-library", label: "SOP Library", icon: FileText, exact: false },
];

interface AdminSidebarProps {
  userEmail: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-6">
        <Image src="/logo.png" alt="KiteHR" width={32} height={32} className="rounded-lg" />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Admin Panel</span>
          <span className="text-xs text-red-600 dark:text-red-400 font-medium">App Administrator</span>
        </div>
        {/* Mobile close button */}
        <button
          className="md:hidden ml-auto text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-red-50 text-red-700 font-medium dark:bg-red-900/30 dark:text-red-400"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* pSEO Content section */}
        <div className="mt-4">
          <div className="flex items-center gap-2 px-3 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              pSEO Content
            </span>
          </div>
          <ul className="space-y-1">
            {pseoItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-red-50 text-red-700 font-medium dark:bg-red-900/30 dark:text-red-400"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Signed in as</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{userEmail}</p>
        </div>

        <div className="mt-4">
          <Link
            href="/jobs"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Briefcase className="h-4 w-4 shrink-0" />
            Back to App
          </Link>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="KiteHR" width={24} height={24} className="rounded-md" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Admin Panel</span>
        </div>
        <span className="text-xs text-red-600 dark:text-red-400 font-medium">Administrator</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 flex h-full w-72 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
