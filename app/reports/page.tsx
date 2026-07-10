"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MobileNav } from "../components/MobileNav";
import { AppLoader } from "../components/AppLoader";
import { api, DailyReport } from "../../lib/api";
import { getAuthToken } from "../../lib/student";

export default function ReportsPage() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [status, setStatus] = useState("Loading report...");

  useEffect(() => {
    let active = true;
    let loading = false;
    const loadReport = async () => {
      if (loading) return;
      if (!getAuthToken()) {
        if (active) setStatus("Please sign in from the home screen.");
        return;
      }
      loading = true;
      if (active && !report) setStatus("Loading your latest report...");
      try {
        const value = await api.getMyReport();
        if (active) {
          setReport(value);
          setStatus("");
        }
      } catch {
        if (active) {
          setReport(null);
          setStatus(getAuthToken()
            ? "No saved practice attempts were found for this account yet."
            : "Your session has expired. Please sign in again from the home screen.");
        }
      } finally {
        loading = false;
      }
    };
    const loadWhenVisible = () => {
      if (!document.hidden) void loadReport();
    };

    void loadReport();
    window.addEventListener("pageshow", loadReport);
    window.addEventListener("focus", loadReport);
    document.addEventListener("visibilitychange", loadWhenVisible);
    return () => {
      active = false;
      window.removeEventListener("pageshow", loadReport);
      window.removeEventListener("focus", loadReport);
      document.removeEventListener("visibilitychange", loadWhenVisible);
    };
  }, []);

  return (
    <main className="scroll-invisible min-h-screen bg-[#08090d] p-3 pb-24 text-zinc-100 sm:p-4 sm:pb-24 xl:h-screen xl:overflow-y-auto xl:pb-4">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[10px] border border-white/[.08] bg-[#0d0f15] shadow-2xl shadow-black/30">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] bg-[#10131a] px-4 py-5 sm:px-6">
          <div>
            <Link href="/" className="text-xs font-bold text-cyan-200">← Back to dashboard</Link>
            <p className="mt-4 text-xs font-semibold uppercase text-emerald-300">Performance intelligence</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Personalized report</h1>
          </div>
          {report && <p className="text-sm font-bold text-[#6b7280]">{report.report_date}</p>}
        </header>

        <div className="p-4 sm:p-6">
          {status.startsWith("Loading") && !report ? (
            <AppLoader label="Preparing your latest report" compact />
          ) : status && !report ? (
            <div className="panel p-6 text-sm font-semibold text-zinc-500">
              {status}
            </div>
          ) : null}

          {report && (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.1fr]">
                <section className="panel p-5">
                  <p className="text-sm font-black">Your Performance</p>
                  <div className="mt-5 flex items-center gap-5">
                    <div className="grid h-28 w-28 place-items-center rounded-full border-[9px] border-[#3da35d] text-center">
                      <div>
                        <p className="text-2xl font-black">{report.accuracy}%</p>
                        <p className="text-xs">Accuracy</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <ReportLine label="Attempted" value={String(report.total_attempted)} color="#71717a" />
                      <ReportLine label="Correct" value={String(report.total_correct)} color="#3da35d" />
                      <ReportLine label="Incorrect" value={String(report.total_attempted - report.total_correct)} color="#ff7b3d" />
                    </div>
                  </div>
                </section>

                <section className="panel p-5">
                  <p className="text-sm font-black">Your Rank ({report.report_date})</p>
                  <p className="mt-4 text-3xl font-black text-[#18181b]">{report.percentile}%</p>
                  <p className="mt-2 text-sm text-[#6b7280]">Percentile among aspirants active on this report date.</p>
                </section>

                <section className="panel p-5">
                  <p className="text-sm font-black">Exam Readiness</p>
                  <div className="mt-4 space-y-3 text-xs">
                    {Object.entries(report.exam_wise_readiness).length === 0 && (
                      <p className="text-sm text-[#6b7280]">No readiness data stored for this report.</p>
                    )}
                    {Object.entries(report.exam_wise_readiness).map(([exam, score]) => (
                      <div key={exam} className="grid grid-cols-[minmax(76px,110px)_minmax(0,1fr)_36px] items-center gap-2">
                        <span>{exam}</span>
                        <div className="h-1.5 rounded-full bg-[#e4e4e7]">
                          <div className="h-full rounded-full bg-[#3da35d]" style={{ width: `${score}%` }} />
                        </div>
                        <span className="text-right font-bold">{score}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className="panel p-5">
                <p className="text-sm font-black">Subject Breakdown</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(report.subject_breakdown).length === 0 && (
                    <p className="text-sm text-[#6b7280]">No subject breakdown stored for this report.</p>
                  )}
                  {Object.entries(report.subject_breakdown).map(([subject, value]) => {
                    const pct = value.total ? Math.round((value.correct / value.total) * 100) : 0;
                    return (
                      <div key={subject} className="rounded-lg border border-white/[.08] bg-white/[.03] p-4">
                        <p className="font-bold capitalize">{subject.replace("_", " ")}</p>
                        <p className="mt-1 text-xs text-[#6b7280]">{value.correct} correct / {value.total} attempted</p>
                        <div className="mt-3 h-2 rounded-full bg-[#e4e4e7]">
                          <div className="h-full rounded-full bg-[#3da35d]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="panel p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Learning map</p>
                    <h2 className="mt-2 text-lg font-semibold text-white">Concept-wise understanding</h2>
                  </div>
                  <p className="max-w-md text-xs leading-5 text-zinc-500">
                    Based on your first answer for every concept attempted on this report date.
                  </p>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {Object.entries(report.concept_breakdown ?? {}).length === 0 && (
                    <p className="text-sm text-zinc-500">Concept data will appear after your next practice attempt.</p>
                  )}
                  {Object.entries(report.concept_breakdown ?? {}).map(([concept, value]) => {
                    const level = value.accuracy >= 80 ? "Strong" : value.accuracy >= 50 ? "Developing" : "Needs practice";
                    const tone = value.accuracy >= 80 ? "text-emerald-300" : value.accuracy >= 50 ? "text-amber-300" : "text-rose-300";
                    const bar = value.accuracy >= 80 ? "bg-emerald-400" : value.accuracy >= 50 ? "bg-amber-400" : "bg-rose-400";
                    return (
                      <article key={value.topic_id} className="rounded-xl border border-white/[.08] bg-white/[.025] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold leading-5 text-zinc-100">{concept}</h3>
                            <p className="mt-1 text-xs text-zinc-500">{value.correct} correct / {value.total} attempted</p>
                          </div>
                          <span className={`shrink-0 text-xs font-black ${tone}`}>{level}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[.07]">
                            <div className={`h-full rounded-full ${bar}`} style={{ width: `${value.accuracy}%` }} />
                          </div>
                          <span className="w-10 text-right text-xs font-black text-zinc-300">{value.accuracy}%</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-amber-300/15 bg-gradient-to-br from-amber-300/[.07] via-[#10131a] to-cyan-300/[.04] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Next action</p>
                <h2 className="mt-2 text-lg font-semibold text-white">Where you should practise</h2>
                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {(report.practice_recommendations ?? []).length === 0 && (
                    <p className="text-sm text-zinc-400">
                      No weak concept was detected in this report. Keep your streak going with the next question.
                    </p>
                  )}
                  {(report.practice_recommendations ?? []).map((recommendation, recommendationIndex) => (
                    <article key={recommendation.topic_id} className="flex min-h-48 flex-col rounded-xl border border-white/[.08] bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                          Priority {recommendationIndex + 1}
                        </span>
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/[.07] px-2 py-1 text-[10px] font-black text-amber-200">
                          {recommendation.accuracy}%
                        </span>
                      </div>
                      <h3 className="mt-4 font-semibold leading-5 text-white">{recommendation.concept}</h3>
                      <p className="mt-2 flex-1 text-xs leading-5 text-zinc-400">{recommendation.reason}</p>
                      <Link
                        href={`/practice/${recommendation.topic_id}`}
                        className="mt-4 inline-flex items-center gap-2 text-xs font-black text-cyan-200 hover:text-cyan-100"
                      >
                        Practise this concept <span aria-hidden="true">→</span>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>

              {report.ai_feedback && (
                <section className="rounded-lg border border-cyan-300/15 bg-cyan-300/[.06] p-5">
                  <p className="font-semibold text-cyan-100">Focus for you</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{report.ai_feedback}</p>
                </section>
              )}
            </div>
          )}
        </div>
      </section>
      <MobileNav active="reports" />
    </main>
  );
}

function ReportLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="grid grid-cols-[10px_1fr_32px] items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
      <span className="text-right font-black">{value}</span>
    </div>
  );
}
