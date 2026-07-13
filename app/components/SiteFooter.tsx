import Link from "next/link";
import { legalConfig } from "../../lib/legal-config";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`${compact ? "mt-5 rounded-xl border border-white/[.07] bg-[#0d0f15] px-4 py-5" : "border-t border-white/[.07] px-4 py-10 sm:px-6"} text-zinc-500`}>
      <div className={`${compact ? "" : "mx-auto max-w-7xl"} grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end`}>
        <div>
          <Link href="/" className="inline-flex items-center gap-3 text-zinc-100">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-xs font-black text-cyan-100">CA</span>
            <span className="font-semibold">AspirantOS</span>
          </Link>
          <p className="mt-3 max-w-xl text-xs leading-5">Independent exam-preparation software. Not affiliated with UPSC or any government examination authority.</p>
          <p className="mt-2 text-xs">Support and grievances: <a className="text-cyan-200 hover:text-cyan-100" href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail}</a></p>
        </div>
        <div className="sm:text-right">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold sm:justify-end">
            <Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
            <Link href="/refund-policy" className="hover:text-white">Refund Policy</Link>
          </nav>
          <p className="mt-3 text-[11px]">© {new Date().getFullYear()} {legalConfig.businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
