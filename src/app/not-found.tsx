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
    <div className="min-h-screen bg-[#080c10] text-white flex flex-col">
      <PublicNav />

      <main className="flex-1 flex items-center justify-center px-6">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/8 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-green-500/6 blur-[80px] rounded-full" />
        </div>

        <div className="relative text-center max-w-lg mx-auto py-24">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full scale-150" />
              <Image
                src="/logo.png"
                alt="KiteHR"
                width={64}
                height={64}
                className="relative rounded-2xl opacity-80"
              />
            </div>
          </div>

          {/* 404 */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-6">
            <Search className="h-3.5 w-3.5" />
            404 — Page not found
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            This page{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              doesn&apos;t exist
            </span>
          </h1>

          <p className="text-white/50 mb-10 text-lg leading-relaxed">
            The page you&apos;re looking for may have been moved, deleted, or never existed.
            Let&apos;s get you back on track.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-base font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-semibold text-white/80 hover:bg-white/10 transition-colors"
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
