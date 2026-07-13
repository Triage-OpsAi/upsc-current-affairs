"use client";

import Link from "next/link";
import { OfferNudge } from "./OfferNudge";

const mobileNavItems = [
  ["home", "Home", "/", "M3 10.5 12 3l9 7.5M5 9v10h14V9M9 19v-6h6v6"],
  ["archive", "Archive", "/archive", "M7 3v3M17 3v3M4 8h16M5 5h14v15H5z"],
  ["reports", "Reports", "/reports", "M5 19V9M12 19V5M19 19v-8"],
  ["settings", "Profile", "/profile", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4h2M2 12h2M12 2v2M12 20v2"],
] as const;

export function MobileNav({ active }: { active: string }) {
  return (
    <>
    <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-[10px] border border-white/[.09] bg-[#10131a]/95 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl xl:hidden">
      {mobileNavItems.map(([key, label, href, path]) => (
        <Link
          key={key}
          href={href}
          aria-current={active === key ? "page" : undefined}
          className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-[10px] font-bold transition ${
            active === key
              ? "border-cyan-200 bg-cyan-300 text-[#071016] shadow-[0_0_0_2px_rgba(103,232,249,0.18),0_8px_24px_rgba(34,211,238,0.18)]"
              : "border-transparent text-zinc-400 hover:bg-white/[.06] hover:text-white"
          }`}
        >
          <Icon path={path} />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
    <OfferNudge />
    </>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
