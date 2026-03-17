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

export function PublicNav() {
  const [useCasesOpen, setUseCasesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setUseCasesOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setUseCasesOpen(false), 100);
  };

  return (
    <header className="border-b border-white/5 bg-[#080c10]/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="KiteHR logo" width={32} height={32} className="rounded-lg" />
          <span className="font-semibold text-white">KiteHR</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/features/hiring-pipeline" className="text-sm text-white/50 hover:text-white transition-colors">
            Features
          </Link>
          {/* Use Cases dropdown */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors">
              Use Cases
              <ChevronDown className={`w-3 h-3 transition-transform ${useCasesOpen ? "rotate-180" : ""}`} />
            </button>
            {useCasesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                <div className="bg-[#0d1117] border border-white/10 rounded-xl p-2 min-w-[200px] shadow-xl">
                  {useCases.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setUseCasesOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/blog" className="text-sm text-white/50 hover:text-white transition-colors">
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-[#080c10] hover:bg-cyan-400 transition-colors"
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
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/25 mb-3">Product</p>
            <ul className="space-y-2">
              <li><Link href="/features/hiring-pipeline" className="text-sm text-white/40 hover:text-white/70 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-white/40 hover:text-white/70 transition-colors">Pricing</Link></li>
              <li><Link href="/blog" className="text-sm text-white/40 hover:text-white/70 transition-colors">Blog</Link></li>
              <li><Link href="/about" className="text-sm text-white/40 hover:text-white/70 transition-colors">About</Link></li>
              <li><Link href="/faq" className="text-sm text-white/40 hover:text-white/70 transition-colors">FAQ</Link></li>
            </ul>
          </div>
          {/* Use Cases */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/25 mb-3">Use Cases</p>
            <ul className="space-y-2">
              {useCases.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Compare */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/25 mb-3">Compare</p>
            <ul className="space-y-2">
              {competitors.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Account */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/25 mb-3">Account</p>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-white/40 hover:text-white/70 transition-colors">Sign in</Link></li>
              <li><Link href="/signup" className="text-sm text-white/40 hover:text-white/70 transition-colors">Sign up free</Link></li>
            </ul>
          </div>
        </div>
        {/* Alternatives — full-width row for SEO link equity */}
        <div className="border-t border-white/5 pt-8 mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/25 mb-3">Alternatives</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {alternatives.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-white/5 pt-6 flex items-center gap-2">
          <Image src="/logo.png" alt="KiteHR" width={20} height={20} className="rounded-md opacity-50" />
          <span className="text-sm text-white/25">KiteHR</span>
        </div>
      </div>
    </footer>
  );
}
