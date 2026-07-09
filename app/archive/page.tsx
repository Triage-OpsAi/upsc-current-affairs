"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MobileNav } from "../components/MobileNav";
import { api, Topic, TopicListResponse } from "../../lib/api";
import { getAuthToken } from "../../lib/student";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthsSinceJan2025(): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  const now = new Date();
  let y = 2025;
  let m = 1;
  while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth() + 1)) {
    out.push({ year: y, month: m });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out.reverse();
}

export default function ArchivePage() {
  const months = useMemo(monthsSinceJan2025, []);
  const [selected, setSelected] = useState(months[0] ?? { year: 2026, month: 7 });
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [topics, setTopics] = useState<Topic[]>([]);
  const [meta, setMeta] = useState<TopicListResponse["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("Loading archive...");

  useEffect(() => {
    if (!getAuthToken()) {
      setStatus("Please sign in from the home screen.");
      return;
    }
    Promise.all(
      months.map((month) =>
        api
          .listTopics({ year: month.year, month: month.month, page: 1, page_size: 1 })
          .then((response) => [`${month.year}-${month.month}`, response.meta.total_items] as const)
          .catch(() => [`${month.year}-${month.month}`, null] as const),
    ),
    ).then((pairs) => {
      setCounts(Object.fromEntries(pairs));
      const failed = pairs.some(([, total]) => total === null);
      setStatus(failed ? "Could not reach the database service. Month counts are unavailable right now." : "");
    });
  }, [months]);

  useEffect(() => {
    if (!getAuthToken()) return;
    setStatus("Loading topics...");
    api
      .listTopics({ year: selected.year, month: selected.month, page, page_size: 10 })
      .then((response) => {
        setTopics(response.items);
        setMeta(response.meta);
        setStatus("");
      })
      .catch((error: any) => {
        setTopics([]);
        setMeta(null);
        setStatus(error.message || "Could not load archive");
      });
  }, [selected, page]);

  return (
    <main className="scroll-invisible min-h-screen bg-[#f4f5f7] p-3 pb-24 text-[#18181b] sm:p-4 sm:pb-24 xl:h-screen xl:overflow-y-auto xl:pb-4">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-[8px] bg-[#fafafa] shadow-2xl shadow-black/25">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e4e7] bg-white px-4 py-5 sm:px-6">
          <div>
            <Link href="/" className="text-xs font-bold text-[#4b5563]">Back to dashboard</Link>
            <h1 className="mt-2 text-2xl font-black">Month-wise Archive</h1>
          </div>
          <p className="text-sm font-semibold text-[#6b7280]">
            {MONTH_NAMES[selected.month - 1]} {selected.year}
          </p>
        </header>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[420px_1fr]">
          <section className="scroll-invisible lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto">
            <div className="grid gap-3 sm:grid-cols-2">
              {months.map((month) => {
                const key = `${month.year}-${month.month}`;
                const total = counts[key];
                const active = selected.year === month.year && selected.month === month.month;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelected(month);
                      setPage(1);
                    }}
                    className={`rounded-[8px] border bg-white p-4 text-left shadow-sm ${
                      active ? "border-[#18181b]" : "border-[#e4e4e7]"
                    }`}
                  >
                    <p className="font-bold">{MONTH_NAMES[month.month - 1]} {month.year}</p>
                    <p className="mt-1 text-xs text-[#6b7280]">
                      {total === undefined
                        ? "Checking database..."
                        : total === null
                          ? "Unavailable"
                          : `${total} questions in database`}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="scroll-invisible rounded-[8px] border border-[#e4e4e7] bg-white p-5 lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-black">Published Topics</h2>
              {meta && <span className="text-xs font-bold text-[#6b7280]">{meta.total_items} total</span>}
            </div>

            {status && <p className="text-sm font-semibold text-[#6b7280]">{status}</p>}

            <div className="space-y-3">
              {topics.map((topic) => (
                <Link
                  href={`/practice/${topic.id}`}
                  key={topic.id}
                  className="block rounded-[8px] border border-[#e4e4e7] p-4 hover:border-[#18181b]"
                >
                  <p className="text-sm font-black text-[#18181b]">{topic.title}</p>
                  {topic.summary && <p className="mt-2 text-sm leading-6 text-[#6b7280]">{topic.summary}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {topic.subject_tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#f4f4f5] px-2 py-1 text-[11px] font-bold text-[#3f3f46]">
                        {tag.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            {meta && meta.total_pages > 1 && (
              <div className="mt-5 flex items-center gap-3 text-sm font-bold">
                <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="disabled:opacity-40">
                  Prev
                </button>
                <span className="text-[#6b7280]">Page {meta.page} of {meta.total_pages}</span>
                <button disabled={page >= meta.total_pages} onClick={() => setPage((value) => value + 1)} className="disabled:opacity-40">
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </section>
      <MobileNav active="archive" />
    </main>
  );
}
