import Link from "next/link";
import Image from "next/image";

export function PublicNav() {
  return (
    <header className="border-b border-white/5 bg-[#080c10]/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="KiteHR logo" width={32} height={32} className="rounded-lg" />
          <span className="font-semibold text-white">KiteHR</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">
            Pricing
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
    <footer className="border-t border-white/5 py-8">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/25">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="KiteHR" width={24} height={24} className="rounded-md opacity-70" />
          <span>KiteHR</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
          <Link href="/login" className="hover:text-white/60 transition-colors">Sign in</Link>
          <Link href="/signup" className="hover:text-white/60 transition-colors">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
