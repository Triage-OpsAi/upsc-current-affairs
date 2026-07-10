"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "../../lib/api";
import { getAuthToken } from "../../lib/student";

const baseNavItems = [
  ["home", "Home", "/", "M3 10.5 12 3l9 7.5M5 9v10h14V9M9 19v-6h6v6"],
  ["archive", "Archive", "/archive", "M7 3v3M17 3v3M4 8h16M5 5h14v15H5z"],
  ["reports", "Reports", "/reports", "M5 19V9M12 19V5M19 19v-8"],
  ["settings", "Profile", "/profile", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4h2M2 12h2M12 2v2M12 20v2"],
] as const;

const practiceNavItem = [
  "today", "Practice", "", "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
] as const;

export function MobileNav({
  active,
  practiceHref,
}: {
  active: string;
  practiceHref?: string | null;
}) {
  const pathname = usePathname();
  const [resolvedPracticeHref, setResolvedPracticeHref] = useState<string | null>(
    practiceHref ?? (active === "today" ? pathname : null),
  );

  useEffect(() => {
    if (practiceHref !== undefined) {
      setResolvedPracticeHref(practiceHref);
      return;
    }
    if (!getAuthToken()) {
      setResolvedPracticeHref(null);
      return;
    }
    let activeRequest = true;
    api.getLatestPracticeTopic()
      .then(({ topic }) => {
        if (activeRequest) setResolvedPracticeHref(topic ? `/practice/${topic.id}` : null);
      })
      .catch(() => {
        if (activeRequest && active !== "today") setResolvedPracticeHref(null);
      });
    return () => {
      activeRequest = false;
    };
  }, [active, pathname, practiceHref]);

  const navItems = useMemo(() => {
    const items: Array<readonly [string, string, string, string]> = [...baseNavItems];
    if (resolvedPracticeHref) {
      items.splice(2, 0, [practiceNavItem[0], practiceNavItem[1], resolvedPracticeHref, practiceNavItem[3]]);
    }
    return items;
  }, [resolvedPracticeHref]);

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 grid rounded-[8px] border border-[#e4e4e7] bg-white/95 p-1 shadow-2xl shadow-black/20 backdrop-blur xl:hidden"
      style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
    >
      {navItems.map(([key, label, href, path]) => (
        <Link
          key={key}
          href={href}
          className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[6px] px-1 py-2 text-[10px] font-bold ${
            active === key ? "bg-[#18181b] text-white" : "text-[#4b5563]"
          }`}
        >
          <Icon path={path} />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
