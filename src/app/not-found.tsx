import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Home, Search } from "lucide-react";
import { PublicNav, PublicFooter } from "@/components/public-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | KiteHR",
  description: "The page you're looking for doesn't exist. Head back to KiteHR to manage your hiring pipeline.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <PublicNav />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-lg mx-auto py-24">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="KiteHR"
              width={64}
              height={64}
              className="rounded-2xl opacity-80"
            />
          </div>

          {/* 404 */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 mb-6">
            <Search className="h-3.5 w-3.5" />
            404 — Page not found
          </div>

          <h1 className="font-heading font-bold text-5xl md:text-6xl tracking-tight text-slate-900 mb-4">
            This page doesn&apos;t exist
          </h1>

          <p className="text-slate-500 mb-10 text-lg leading-relaxed">
            The page you&apos;re looking for may have been moved, deleted, or never existed.
            Let&apos;s get you back on track.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-7 py-3.5 text-base font-bold text-white hover:bg-teal-800 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
