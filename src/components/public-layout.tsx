"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

const useCases = [
  { href: "/for/startups", label: "Startups" },
  { href: "/for/small-business", label: "Small Businesses" },
  { href: "/for/nonprofits", label: "Nonprofits" },
  { href: "/for/agencies", label: "Recruitment Agencies" },
];

const competitors = [
  { href: "/vs/greenhouse", label: "vs Greenhouse" },
  { href: "/vs/workable", label: "vs Workable" },
  { href: "/vs/lever", label: "vs Lever" },
  { href: "/vs/recruitee", label: "vs Recruitee" },
  { href: "/vs/ashby", label: "vs Ashby" },
  { href: "/vs/bamboohr", label: "vs BambooHR" },
  { href: "/vs/breezyhr", label: "vs Breezy HR" },
  { href: "/vs/jazzhr", label: "vs JazzHR" },
  { href: "/vs/smartrecruiters", label: "vs SmartRecruiters" },
];

const alternatives = [
  { href: "/alternatives/free-workable-alternative", label: "Free Workable Alternative" },
  { href: "/alternatives/free-greenhouse-alternative", label: "Free Greenhouse Alternative" },
  { href: "/alternatives/free-bamboohr-alternative", label: "Free BambooHR Alternative" },
  { href: "/alternatives/cheapest-ats-for-startups", label: "Cheapest ATS for Startups" },
  { href: "/alternatives/best-ats-for-nonprofits", label: "Best ATS for Nonprofits" },
  { href: "/alternatives/ats-no-per-seat-pricing", label: "ATS Without Per-Seat Pricing" },
  { href: "/alternatives/free-recruiting-software", label: "Free Recruiting Software" },
  { href: "/alternatives/ats-for-small-teams", label: "ATS for Small Teams" },
];

interface PublicNavProps {
  variant?: "light" | "dark";
}

export function PublicNav({ variant = "light" }: PublicNavProps) {
  const [useCasesOpen, setUseCasesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setUseCasesOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setUseCasesOpen(false), 100);
  };

  const isLight = variant === "light";

  return (
    <header
      className={
        isLight
          ? "border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-10"
          : "border-b border-white/5 bg-[#080c10]/80 backdrop-blur sticky top-0 z-10"
      }
    >
      <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="KiteHR logo" width={32} height={32} className="rounded-lg" />
          <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>KiteHR</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/features/hiring-pipeline"
            className={`text-sm transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-white/75 hover:text-white"}`}
          >
            Features
          </Link>
          {/* Use Cases dropdown */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1 text-sm transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-white/75 hover:text-white"}`}
            >
              Use Cases
              <ChevronDown className={`w-3 h-3 transition-transform ${useCasesOpen ? "rotate-180" : ""}`} />
            </button>
            {useCasesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                <div
                  className={`rounded-xl p-2 min-w-[200px] shadow-xl border ${
                    isLight
                      ? "bg-white border-slate-200"
                      : "bg-[#0d1117] border-white/10"
                  }`}
                >
                  {useCases.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        isLight
                          ? "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                          : "text-white/75 hover:text-white hover:bg-white/5"
                      }`}
                      onClick={() => setUseCasesOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link
            href="/hr-sop"
            className={`text-sm transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-white/75 hover:text-white"}`}
          >
            SOP Library
          </Link>
          <Link
            href="/pricing"
            className={`text-sm transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-white/75 hover:text-white"}`}
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className={`text-sm transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-white/75 hover:text-white"}`}
          >
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`text-sm transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-white/75 hover:text-white"}`}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isLight
                ? "bg-teal-700 text-white hover:bg-teal-800"
                : "bg-cyan-500 text-[#080c10] hover:bg-cyan-400"
            }`}
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/60 py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Product */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Product</p>
            <ul className="space-y-2.5">
              <li><Link href="/features/hiring-pipeline" className="text-sm text-slate-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/blog" className="text-sm text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/faq" className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          {/* Use Cases */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Use Cases</p>
            <ul className="space-y-2.5">
              {useCases.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Compare */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Compare</p>
            <ul className="space-y-2.5">
              {competitors.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Account */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Account</p>
            <ul className="space-y-2.5">
              <li><Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link></li>
              <li><Link href="/signup" className="text-sm text-slate-400 hover:text-white transition-colors">Sign up free</Link></li>
            </ul>
          </div>
        </div>
        {/* Alternatives — full-width row for SEO link equity */}
        <div className="border-t border-slate-800/60 pt-8 mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Alternatives</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {alternatives.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-slate-800/60 pt-6 flex items-center gap-2.5">
          <Image src="/logo.png" alt="KiteHR" width={20} height={20} className="rounded-md opacity-40" />
          <span className="text-sm text-slate-500">KiteHR</span>
        </div>
      </div>
    </footer>
  );
}
