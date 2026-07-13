"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MobileNav } from "../components/MobileNav";
import { AppLoader } from "../components/AppLoader";
import { SiteFooter } from "../components/SiteFooter";
import { formatQuestionText } from "../../lib/question-text";
import { api, ArchiveMonth, Topic, TopicListResponse } from "../../lib/api";
import { getAuthToken } from "../../lib/student";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ArchivePage() {
  const [months, setMonths] = useState<ArchiveMonth[]>([]);
  const [selected, setSelected] = useState<ArchiveMonth | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [meta, setMeta] = useState<TopicListResponse["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [monthStatus, setMonthStatus] = useState("Loading available months...");
  const [topicStatus, setTopicStatus] = useState("");

  useEffect(() => {
    let active = true;
    let loading = false;
    const loadMonths = async () => {
      if (loading) return;
      if (!getAuthToken()) {
        if (active) setMonthStatus("Please sign in from the home screen.");
        return;
      }
      loading = true;
      try {
        const available = await api.getAvailableMonths();
        if (!active) return;
        setMonths(available);
        setSelected((current) => {
          if (current && available.some((item) => item.year === current.year && item.month === current.month)) {
            return current;
          }
          return available[0] ?? null;
        });
        setMonthStatus(available.length ? "" : "No practice questions are available yet.");
      } catch (error: any) {
        if (active) setMonthStatus(error.message || "Could not load archive months.");
      } finally {
        loading = false;
      }
    };
    const loadWhenVisible = () => {
      if (!document.hidden) void loadMonths();
    };

    void loadMonths();
    window.addEventListener("pageshow", loadMonths);
    document.addEventListener("visibilitychange", loadWhenVisible);
    return () => {
      active = false;
      window.removeEventListener("pageshow", loadMonths);
      document.removeEventListener("visibilitychange", loadWhenVisible);
    };
  }, []);

  useEffect(() => {
    if (!selected || !getAuthToken()) {
      setTopics([]);
      setMeta(null);
      return;
    }
    let active = true;
    setTopicStatus("Loading questions...");
    api
      .listTopics({ year: selected.year, month: selected.month, page, page_size: 10 })
      .then((response) => {
        if (!active) return;
        setTopics(response.items);
        setMeta(response.meta);
        setTopicStatus(response.items.length ? "" : "No questions are available for this month.");
      })
      .catch((error: any) => {
        if (!active) return;
        setTopics([]);
        setMeta(null);
        setTopicStatus(error.message || "Could not load questions.");
      });
    return () => {
      active = false;
    };
  }, [selected, page]);

  return (
    <main className="scroll-invisible min-h-screen bg-[#08090d] p-3 pb-24 text-zinc-100 sm:p-4 sm:pb-24 xl:h-screen xl:overflow-y-auto xl:pb-4">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[10px] border border-white/[.08] bg-[#0d0f15] shadow-2xl shadow-black/30">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[.07] bg-[#10131a] px-4 py-5 sm:px-6">
          <div>
            <Link href="/" className="text-xs font-bold text-cyan-200">← Back to dashboard</Link>
            <p className="mt-4 text-xs font-semibold uppercase text-cyan-300">Revision library</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Question archive</h1>
            <p className="mt-1 text-sm text-zinc-500">Choose a month, then open any question listed below.</p>
          </div>

          {months.length > 0 && selected && (
            <label className="min-w-[230px]">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Filter by month</span>
              <select
                value={`${selected.year}-${selected.month}`}
                onChange={(event) => {
                  const [year, month] = event.target.value.split("-").map(Number);
                  const next = months.find((item) => item.year === year && item.month === month) ?? null;
                  setSelected(next);
                  setPage(1);
                }}
                className="w-full text-sm font-semibold"
              >
                {months.map((item) => (
                  <option key={`${item.year}-${item.month}`} value={`${item.year}-${item.month}`}>
                    {MONTH_NAMES[item.month - 1]} {item.year} ({item.question_count})
                  </option>
                ))}
              </select>
            </label>
          )}
        </header>

        <section className="p-4 sm:p-6">
          {monthStatus === "Loading available months..." ? (
            <AppLoader label="Preparing the question archive" compact />
          ) : monthStatus ? (
            <div className="panel p-5 text-sm font-semibold text-zinc-500">
              {monthStatus}
            </div>
          ) : null}

          {selected && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-white">
                  {MONTH_NAMES[selected.month - 1]} {selected.year} questions
                </h2>
                {meta && <span className="text-xs font-bold text-zinc-500">{meta.total_items} total</span>}
              </div>

              {topicStatus === "Loading questions..." ? (
                <AppLoader label="Preparing this month&apos;s questions" compact />
              ) : topicStatus ? (
                <div className="panel mb-4 p-5 text-sm font-semibold text-zinc-500">
                  {topicStatus}
                </div>
              ) : null}

              <div className="space-y-3">
                {topics.map((topic, index) => (
                  <Link
                    href={`/practice/${topic.id}`}
                    key={topic.id}
                    className="block rounded-lg border border-white/[.08] bg-[#10131a] p-4 transition hover:border-cyan-300/25 hover:bg-white/[.05] sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-xs font-black text-cyan-100">
                        {(page - 1) * 10 + index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="whitespace-pre-line text-sm font-semibold leading-6 text-white">
                          {formatQuestionText(topic.question_text || topic.title)}
                        </p>
                        {topic.question_text && (
                          <p className="mt-2 text-xs font-bold text-zinc-500">Topic: {topic.title}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {topic.subject_tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-white/[.07] bg-white/[.04] px-2 py-1 text-[11px] font-bold capitalize text-zinc-400">
                              {tag.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {meta && meta.total_pages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-5 text-sm font-bold">
                  <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="disabled:opacity-40">
                    Previous
                  </button>
                  <span className="text-zinc-500">Page {meta.page} of {meta.total_pages}</span>
                  <button disabled={page >= meta.total_pages} onClick={() => setPage((value) => value + 1)} className="disabled:opacity-40">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </section>
      <div className="mx-auto max-w-5xl"><SiteFooter compact /></div>
      <MobileNav active="archive" />
    </main>
  );
}
