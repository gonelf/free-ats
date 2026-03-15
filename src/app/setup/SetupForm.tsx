"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { createOrganization } from "./actions";

export default function SetupForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createOrganization(formData);
    // redirect happens server-side; loading stays true until navigation
  }

  return (
    <div className="flex min-h-screen bg-[#080c10] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/8 blur-[120px] rounded-full" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <Image src="/logo.svg" alt="KiteHR" width={36} height={36} className="rounded-xl" />
          <span className="font-semibold text-lg text-white">KiteHR</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15">
                <Building2 className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Create your workspace</h1>
            <p className="text-sm text-white/40 mt-1">
              Set up your organization to get started.
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="companyName" className="block text-sm font-medium text-white/70">
                  Company name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  placeholder="Acme Corp"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? "Creating workspace…" : (
                  <>Create workspace <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
