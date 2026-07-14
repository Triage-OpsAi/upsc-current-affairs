"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, SubjectQuestionListResponse } from "../../../../lib/api";
import { formatQuestionText } from "../../../../lib/question-text";
import { AppLoader } from "../../../components/AppLoader";
import { MobileNav } from "../../../components/MobileNav";
import { SiteFooter } from "../../../components/SiteFooter";

const FORMAT_LABELS: Record<string, string> = {
  statement: "Statements",
  assertion_reason: "Assertion–Reason",
  negative: "Negative framing",
  matching: "Matching",
};

export default function SubjectQuestionListPage({ params }: { params: { subjectKey: string; chapterId: string } }) {
  const [response, setResponse] = useState<SubjectQuestionListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("Loading questions...");

  useEffect(() => {
    let active = true;
    setStatus("Loading questions...");
    api.listSubjectQuestions(params.subjectKey, params.chapterId, page)
      .then((data) => {
        if (!active) return;
        setResponse(data);
        setStatus(data.items.length ? "" : "No questions are available in this chapter yet.");
      })
      .catch((error: any) => {
        if (!active) return;
        setResponse(null);
        setStatus(error.message || "Could not load questions.");
      });
    return () => { active = false; };
  }, [params.subjectKey, params.chapterId, page]);

  return (
    <main className="min-h-screen bg-[#08090d] p-3 pb-24 text-zinc-100 sm:p-5">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[10px] border border-white/[.08] bg-[#0d0f15]">
        <header className="border-b border-white/[.07] bg-[#10131a] px-4 py-6 sm:px-7">
          <Link href={`/subjects/${params.subjectKey}`} className="text-xs font-bold text-cyan-200">← Back to chapters</Link>
          <p className="mt-5 text-xs font-semibold uppercase text-cyan-300">Very hard static practice</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Chapter questions</h1>
          {response && <p className="mt-2 text-sm text-zinc-500">{response.meta.total_items} precision-tested questions</p>}
        </header>
        <div className="p-4 sm:p-7">
          {status === "Loading questions..." ? <AppLoader label="Loading questions" compact /> : null}
          {status && status !== "Loading questions..." ? <div className="panel p-5 text-sm font-semibold text-zinc-400">{status}</div> : null}
          <div className="space-y-3">
            {response?.items.map((question, index) => (
              <Link key={question.id} href={`/subjects/${params.subjectKey}/${params.chapterId}/${question.id}`} className="block rounded-[10px] border border-white/[.08] bg-[#10131a] p-4 transition hover:border-cyan-300/25 hover:bg-white/[.05] sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-xs font-black text-cyan-100">{(page - 1) * 10 + index + 1}</span>
                  <div className="min-w-0">
                    <p className="line-clamp-4 whitespace-pre-line text-sm font-semibold leading-6 text-white">{formatQuestionText(question.question_text)}</p>
                    <span className="mt-3 inline-block rounded-full border border-white/[.08] bg-white/[.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-zinc-400">{FORMAT_LABELS[question.format || ""] || "UPSC archetype"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {response && response.meta.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-5 text-sm font-bold">
              <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="disabled:opacity-40">Previous</button>
              <span className="text-zinc-500">Page {page} of {response.meta.total_pages}</span>
              <button disabled={page >= response.meta.total_pages} onClick={() => setPage((value) => value + 1)} className="disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </section>
      <div className="mx-auto max-w-5xl"><SiteFooter compact /></div>
      <MobileNav active="subjects" />
    </main>
  );
}
