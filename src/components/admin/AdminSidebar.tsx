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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orgs", label: "Organizations", icon: Building2, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, exact: false },
  { href: "/admin/candidates", label: "Candidates & Resumes", icon: UserCheck, exact: false },
  { href: "/admin/non-ats-jobs", label: "Non-ATS Import", icon: Import, exact: false },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList, exact: false },
  { href: "/admin/salary-data", label: "Salary Data", icon: DollarSign, exact: false },
  { href: "/admin/cron-logs", label: "Cron Logs", icon: Clock, exact: false },
  { href: "/admin/feature-flags", label: "Feature Flags", icon: Flag, exact: false },
];

interface AdminSidebarProps {
  userEmail: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <Image src="/logo.png" alt="KiteHR" width={32} height={32} className="rounded-lg" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">Admin Panel</span>
          <span className="text-xs text-red-600 font-medium">App Administrator</span>
        </div>
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
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-red-50 text-red-700 font-medium"
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

        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-700">Signed in as</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{userEmail}</p>
        </div>

        <div className="mt-4">
          <Link
            href="/jobs"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Briefcase className="h-4 w-4 shrink-0" />
            Back to App
          </Link>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 px-3 py-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
