"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  api,
  ApiError,
  AttemptResult,
  SubjectBreakdownSlide,
  SubjectQuestion,
} from "../../../../../lib/api";
import { formatQuestionText } from "../../../../../lib/question-text";
import { ensureStudentId, getStoredStudent } from "../../../../../lib/student";
import { AppLoader, InlineSpinner } from "../../../../components/AppLoader";
import { MobileNav } from "../../../../components/MobileNav";
import { OfferCard } from "../../../../components/OfferCard";
import { SiteFooter } from "../../../../components/SiteFooter";

type Stage = "loading" | "question" | "answered-correct" | "answered-wrong" | "breakdown" | "retry" | "error";

export default function SubjectPracticePage({ params }: { params: { subjectKey: string; chapterId: string; questionId: string } }) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [question, setQuestion] = useState<SubjectQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [slides, setSlides] = useState<SubjectBreakdownSlide[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const chapterHref = `/subjects/${params.subjectKey}/${params.chapterId}`;

  useEffect(() => {
    let active = true;
    setStage("loading");
    Promise.all([
      ensureStudentId(),
      api.getSubjectQuestion(params.subjectKey, params.chapterId, params.questionId),
    ])
      .then(([sid, fetched]) => {
        if (!active) return;
        setStudentId(sid);
        setQuestion(fetched);
        setStage("question");
      })
      .catch((reason: any) => {
        if (!active) return;
        setErrorCode(reason instanceof ApiError ? reason.code : null);
        setError(reason.message || "Could not load this question.");
        setStage("error");
      });
    return () => { active = false; };
  }, [params.subjectKey, params.chapterId, params.questionId]);

  async function submit(attemptNumber: number, throughBreakdown: boolean) {
    if (!studentId || !question || !selected) return;
    setBusy(true);
    setError("");
    try {
      const response = await api.submitSubjectAttempt({
        student_id: studentId,
        question_id: question.id,
        selected_option: selected,
        attempt_number: attemptNumber,
        went_through_breakdown: throughBreakdown,
      });
      setResult(response);
      setStage(response.is_correct ? "answered-correct" : "answered-wrong");
    } catch (reason: any) {
      handleActionError(reason, "Could not submit this answer.");
    } finally {
      setBusy(false);
    }
  }

  async function openBreakdown() {
    if (!question) return;
    setBusy(true);
    setError("");
    try {
      const fetched = await api.getSubjectBreakdown(question.id);
      setSlides(fetched);
      setSlideIndex(0);
      setStage("breakdown");
    } catch (reason: any) {
      handleActionError(reason, "Could not load the breakdown.");
    } finally {
      setBusy(false);
    }
  }

  function handleActionError(reason: any, fallback: string) {
    if (reason instanceof ApiError && reason.code === "trial_expired") {
      setErrorCode(reason.code);
      setError(reason.message);
      setStage("error");
      return;
    }
    setError(reason.message || fallback);
  }

  function retry() {
    setSelected(null);
    setResult(null);
    setError("");
    setStage("retry");
  }

  if (stage === "loading") {
    return <main className="grid min-h-screen place-items-center bg-[#08090d]"><AppLoader label="Preparing static question" /></main>;
  }
  if (stage === "error") {
    if (errorCode === "trial_expired") {
      return (
        <main className="grid min-h-screen place-items-center bg-[#08090d] p-4 text-zinc-100">
          <div className="w-full max-w-4xl"><OfferCard student={getStoredStudent()} actionHref="/profile#membership" /></div>
        </main>
      );
    }
    return (
      <main className="grid min-h-screen place-items-center bg-[#08090d] p-4 text-zinc-100">
        <div className="panel max-w-xl p-5 text-sm font-semibold"><p>{error}</p><Link href={chapterHref} className="mt-4 inline-block text-cyan-200">Back to chapter</Link></div>
      </main>
    );
  }
  if (!question) return null;

  return (
    <main className="min-h-screen bg-[#08090d] p-3 pb-24 text-zinc-100 sm:p-5">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[10px] border border-white/[.08] bg-[#0d0f15] shadow-2xl shadow-black/30">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] bg-[#10131a] px-4 py-5 sm:px-6">
          <div>
            <Link href={chapterHref} className="text-xs font-bold text-cyan-200">← Back to chapter</Link>
            <h1 className="mt-2 text-2xl font-semibold text-white">{stage === "breakdown" ? "Precision breakdown" : "Static syllabus question"}</h1>
          </div>
          {stage === "breakdown" && <span className="text-sm font-black text-zinc-500">{slideIndex + 1} / {slides.length}</span>}
        </header>

        {stage !== "breakdown" && (
          <div className="p-4 sm:p-6">
            <section className="panel p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Very hard</span>
                {question.format && <span className="rounded-full border border-white/[.08] bg-white/[.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-zinc-400">{question.format.replace("_", " ")}</span>}
              </div>
              <p className="mt-4 whitespace-pre-line text-lg font-semibold leading-8 text-white">{formatQuestionText(question.question_text)}</p>
              <div className="mt-6 space-y-3">
                {question.options.map((option) => (
                  <button key={option.key} disabled={stage === "answered-correct" || stage === "answered-wrong" || busy} onClick={() => setSelected(option.key)} className={`w-full rounded-[8px] border p-4 text-left text-sm font-semibold ${selected === option.key ? "border-cyan-200 bg-cyan-300 text-[#071016]" : "border-[#e4e4e7] bg-white text-[#18181b] hover:border-cyan-400"} disabled:opacity-70`}>
                    <span className="mr-2 font-black">{option.key}.</span>{option.text}
                  </button>
                ))}
              </div>
              {stage !== "answered-correct" && stage !== "answered-wrong" && (
                <button disabled={!selected || busy} onClick={() => void submit(stage === "retry" ? 2 : 1, stage === "retry")} className="primary-button mt-6 disabled:opacity-40">
                  {busy ? <InlineSpinner label="Submitting answer" /> : "Submit answer"}
                </button>
              )}
            </section>

            {error && <div className="mt-4 rounded-lg border border-rose-300/20 bg-rose-300/[.07] p-4 text-sm font-semibold text-rose-100">{error}</div>}
            {stage === "answered-correct" && (
              <ResultBanner ok>
                <p className="font-bold">Correct.</p>
                {result?.explanation && <p className="mt-2 font-medium leading-6">{result.explanation}</p>}
                <Link href={chapterHref} className="mt-4 inline-flex items-center gap-2 font-black text-emerald-200">Choose another question <span aria-hidden="true">→</span></Link>
              </ResultBanner>
            )}
            {stage === "answered-wrong" && (
              <ResultBanner ok={false}>
                <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto]">
                  <div><p className="text-base font-bold text-white">One precise detail changed the answer.</p><p className="mt-1 font-medium leading-6 text-zinc-400">{result?.correct_option ? `Correct answer: ${result.correct_option}. ${result.explanation || ""}` : "Use the four-step breakdown to isolate the exact distinction before retrying."}</p></div>
                  {result?.breakdown_available && !result.correct_option && (
                    <button disabled={busy} onClick={() => void openBreakdown()} className="breakdown-cta group flex min-h-[64px] items-center justify-between gap-5 rounded-[10px] border border-cyan-100/70 bg-gradient-to-r from-cyan-300 to-emerald-300 px-5 py-3 text-left text-[#061016] transition hover:-translate-y-0.5 disabled:opacity-50">
                      {busy ? <InlineSpinner label="Preparing breakdown" /> : <><span><span className="block text-sm font-black">Open precision breakdown</span><span className="block text-xs font-semibold text-[#12313a]">4 focused steps · exact factual hinge</span></span><span className="breakdown-cta-arrow text-2xl font-black" aria-hidden="true">→</span></>}
                    </button>
                  )}
                </div>
              </ResultBanner>
            )}
          </div>
        )}

        {stage === "breakdown" && slides.length > 0 && studentId && (
          <SubjectBreakdownDeck
            slides={slides}
            index={slideIndex}
            studentId={studentId}
            onSelect={setSlideIndex}
            onNext={() => slideIndex + 1 >= slides.length ? retry() : setSlideIndex((value) => value + 1)}
          />
        )}
      </section>
      <div className="mx-auto max-w-6xl"><SiteFooter compact /></div>
      <MobileNav active="subjects" />
    </main>
  );
}

function SubjectBreakdownDeck({ slides, index, studentId, onSelect, onNext }: { slides: SubjectBreakdownSlide[]; index: number; studentId: string; onSelect: (index: number) => void; onNext: () => void }) {
  const slide = slides[index];
  const [chosen, setChosen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ is_correct: boolean; correct_option: string; explanation: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setChosen(null); setFeedback(null); setBusy(false); setError(""); }, [index]);

  async function check() {
    if (!chosen) return;
    setBusy(true);
    setError("");
    try {
      setFeedback(await api.submitSubjectBreakdownAnswer({ student_id: studentId, slide_id: slide.id, selected_option: chosen }));
    } catch (reason: any) {
      setError(reason.message || "Could not check this answer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <nav aria-label="Breakdown slides" className="scroll-invisible overflow-x-auto border-b border-white/[.07] bg-[#10131a]">
        <div role="tablist" className="flex min-w-max gap-2 p-3 sm:p-4">
          {slides.map((item, itemIndex) => (
            <button key={item.id} role="tab" aria-selected={itemIndex === index} onClick={() => onSelect(itemIndex)} className={`flex min-w-[180px] items-center gap-3 rounded-lg border px-3 py-2.5 text-left ${itemIndex === index ? "border-cyan-100 bg-cyan-300 text-[#071016]" : "border-white/[.08] bg-white/[.035] text-zinc-300"}`}>
              <span className={`grid size-7 place-items-center rounded-full text-xs font-black ${itemIndex === index ? "bg-[#071016] text-cyan-200" : "bg-white/[.08]"}`}>{item.slide_order}</span>
              <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wide">{item.slide_type}</p><p className="mt-0.5 max-w-[130px] truncate text-xs font-bold">{item.concept}</p></div>
            </button>
          ))}
        </div>
      </nav>
      <section className="min-h-[420px] p-4 sm:p-8">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{slide.slide_type} {index + 1} of {slides.length}</span>
        <h2 className="mt-6 text-xl font-semibold text-white">{slide.concept}</h2>
        {slide.slide_type === "theory" ? (
          <article className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-zinc-300">{slide.content}</article>
        ) : (
          <div className="mt-5 max-w-3xl">
            <p className="whitespace-pre-line text-lg font-semibold leading-7 text-white">{formatQuestionText(slide.practice_question)}</p>
            <div className="mt-5 space-y-3">{slide.practice_options?.map((option) => <button key={option.key} disabled={!!feedback || busy} onClick={() => setChosen(option.key)} className={`w-full rounded-lg border p-4 text-left text-sm font-semibold transition ${chosen === option.key ? "border-cyan-200 bg-cyan-300 text-[#071016]" : "border-white/[.12] bg-white/[.04] text-zinc-100 hover:border-cyan-300/60 hover:bg-white/[.07]"}`}><span className="mr-2 font-black">{option.key}.</span>{option.text}</button>)}</div>
            {!feedback && <button disabled={!chosen || busy} onClick={() => void check()} className="primary-button mt-5 disabled:opacity-40">{busy ? <InlineSpinner label="Checking answer" /> : "Check answer"}</button>}
            {error && <p className="mt-4 text-sm font-semibold text-rose-200">{error}</p>}
            {feedback && <ResultBanner ok={feedback.is_correct}>{feedback.is_correct ? "Correct." : `Correct answer: ${feedback.correct_option}.`} {feedback.explanation}</ResultBanner>}
          </div>
        )}
        <div className="mt-8 flex justify-end"><button onClick={onNext} disabled={slide.slide_type === "practice" && !feedback} className="primary-button disabled:opacity-40">{index + 1 >= slides.length ? "Retry main question" : "Next"}</button></div>
      </section>
    </div>
  );
}

function ResultBanner({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <div className={`mt-4 rounded-[12px] border p-5 text-sm font-semibold ${ok ? "border-emerald-300/20 bg-emerald-300/[.07] text-emerald-100" : "border-rose-300/20 bg-rose-300/[.07] text-zinc-100"}`}>{children}</div>;
}
