import Link from "next/link";
import { legalConfig, legalContactConfigured } from "../../lib/legal-config";
import { SiteFooter } from "./SiteFooter";

export function LegalPage({
  eyebrow,
  title,
  summary,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#08090d] px-4 py-8 text-zinc-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <nav className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/" className="font-black text-cyan-200 hover:text-cyan-100">← AspirantOS</Link>
          <div className="flex gap-4 text-zinc-400">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/refund-policy" className="hover:text-white">Refund policy</Link>
          </div>
        </nav>

        <header className="mt-10 rounded-2xl border border-white/[.08] bg-[#10131a] p-6 shadow-2xl shadow-black/30 sm:p-9">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{summary}</p>
          <p className="mt-5 text-xs font-bold text-zinc-500">Effective: {legalConfig.effectiveDate}</p>
        </header>

        {!legalContactConfigured && (
          <aside className="mt-5 rounded-xl border border-amber-300/25 bg-amber-300/[.07] p-4 text-sm leading-6 text-amber-100">
            Publication safeguard: the legal entity address, support email, grievance officer name, and jurisdiction city must be configured before production publication.
          </aside>
        )}

        <article className="legal-copy mt-6 rounded-2xl border border-white/[.08] bg-[#0d0f15] p-6 sm:p-9">
          {children}
        </article>
        <SiteFooter compact />
      </div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
