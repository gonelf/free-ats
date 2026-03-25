"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { analytics } from "@/lib/analytics";
import { ArrowRight, AlertCircle, Check } from "lucide-react";
import { Suspense } from "react";

const perks = [
  "Unlimited users, jobs & candidates",
  "Kanban pipeline & custom stages",
  "Team collaboration — free forever",
];

function SignupForm() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("invitation_token");
  const claimToken = searchParams.get("claim_token");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, company_name: companyName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      analytics.signedUp({ has_invitation: !!invitationToken });
      if (claimToken) {
        router.push(`/claim?token=${encodeURIComponent(claimToken)}`);
        router.refresh();
      } else if (invitationToken) {
        router.push(`/invitations/accept?token=${encodeURIComponent(invitationToken)}`);
        router.refresh();
      } else {
        router.push("/jobs");
        router.refresh();
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-[#080c10] text-white">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/8 blur-[120px] rounded-full" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <Image src="/logo.png" alt="KiteHR" width={36} height={36} className="rounded-xl" />
          <span className="font-semibold text-lg text-white">KiteHR</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-white/40 mt-1">Free forever. No credit card needed.</p>
          </div>

          {/* Perks */}
          <ul className="space-y-2 mb-7">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-white/50">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                  <Check className="h-2.5 w-2.5 text-green-400" />
                </div>
                {p}
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-medium text-white/70">
                    Your name
                  </label>
                  <input
                    id="name"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="company" className="block text-sm font-medium text-white/70">
                    Company
                  </label>
                  <input
                    id="company"
                    placeholder="Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-white/70">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="jane@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-white/70">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-[#080c10] hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? "Creating account…" : (
                  <>Create free account <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/35">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-white/20">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#080c10]">
        <div className="text-sm text-white/30">Loading…</div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
