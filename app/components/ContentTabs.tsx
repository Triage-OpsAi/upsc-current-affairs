"use client";

import Link from "next/link";

export function ContentTabs({ active }: { active: "current_affairs" | "subjects" }) {
  return (
    <nav
      aria-label="Practice content"
      className="grid grid-cols-2 rounded-[10px] border border-white/[.08] bg-[#10131a] p-1"
    >
      <Link
        href="/"
        aria-current={active === "current_affairs" ? "page" : undefined}
        className={`rounded-lg px-4 py-3 text-center text-sm font-black transition ${
          active === "current_affairs"
            ? "bg-cyan-300 text-[#071016] shadow-[0_8px_24px_rgba(34,211,238,0.16)]"
            : "text-zinc-400 hover:bg-white/[.05] hover:text-white"
        }`}
      >
        Current Affairs
      </Link>
      <Link
        href="/subjects"
        aria-current={active === "subjects" ? "page" : undefined}
        className={`rounded-lg px-4 py-3 text-center text-sm font-black transition ${
          active === "subjects"
            ? "bg-cyan-300 text-[#071016] shadow-[0_8px_24px_rgba(34,211,238,0.16)]"
            : "text-zinc-400 hover:bg-white/[.05] hover:text-white"
        }`}
      >
        Subjects
      </Link>
    </nav>
  );
}
