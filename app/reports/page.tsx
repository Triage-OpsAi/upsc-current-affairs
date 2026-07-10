"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MobileNav } from "../components/MobileNav";
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
    <main className="scroll-invisible min-h-screen bg-[#f4f5f7] p-3 pb-24 text-[#18181b] sm:p-4 sm:pb-24 xl:h-screen xl:overflow-y-auto xl:pb-4">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[8px] bg-[#fafafa] shadow-2xl shadow-black/25">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e4e7] bg-white px-4 py-5 sm:px-6">
          <div>
            <Link href="/" className="text-xs font-bold text-[#4b5563]">Back to dashboard</Link>
            <h1 className="mt-2 text-2xl font-black">Personalized Report</h1>
          </div>
          {report && <p className="text-sm font-bold text-[#6b7280]">{report.report_date}</p>}
        </header>

        <div className="p-4 sm:p-6">
          {status && !report && (
            <div className="rounded-[8px] border border-[#e4e4e7] bg-white p-6 text-sm font-semibold text-[#6b7280]">
              {status}
            </div>
          )}

          {report && (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.1fr]">
                <section className="rounded-[8px] border border-[#e4e4e7] bg-white p-5">
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

                <section className="rounded-[8px] border border-[#e4e4e7] bg-white p-5">
                  <p className="text-sm font-black">Your Rank ({report.report_date})</p>
                  <p className="mt-4 text-3xl font-black text-[#18181b]">{report.percentile}%</p>
                  <p className="mt-2 text-sm text-[#6b7280]">Percentile among aspirants active on this report date.</p>
                </section>

                <section className="rounded-[8px] border border-[#e4e4e7] bg-white p-5">
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

              <section className="rounded-[8px] border border-[#e4e4e7] bg-white p-5">
                <p className="text-sm font-black">Subject Breakdown</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(report.subject_breakdown).length === 0 && (
                    <p className="text-sm text-[#6b7280]">No subject breakdown stored for this report.</p>
                  )}
                  {Object.entries(report.subject_breakdown).map(([subject, value]) => {
                    const pct = value.total ? Math.round((value.correct / value.total) * 100) : 0;
                    return (
                      <div key={subject} className="rounded-[8px] border border-[#e4e4e7] p-4">
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

              {report.ai_feedback && (
                <section className="rounded-[8px] border border-[#e4e4e7] bg-[#f4f4f5] p-5">
                  <p className="font-black text-[#3f3f46]">Focus for You</p>
                  <p className="mt-2 text-sm leading-6 text-[#3f3f46]">{report.ai_feedback}</p>
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
