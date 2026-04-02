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
    <div className="flex min-h-screen bg-white text-slate-900">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <Image src="/logo.png" alt="KiteHR" width={36} height={36} className="rounded-xl" />
          <span className="font-semibold text-lg text-slate-900">KiteHR</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
                <Building2 className="h-6 w-6 text-teal-700" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create your workspace</h1>
            <p className="text-sm text-slate-500 mt-1">
              Set up your organization to get started.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
                  Company name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  placeholder="Acme Corp"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
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
