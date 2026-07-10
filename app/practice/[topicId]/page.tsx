"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MobileNav } from "../../components/MobileNav";
import { api, AttemptResult, BreakdownSlide, Question, Topic } from "../../../lib/api";
import { ensureStudentId } from "../../../lib/student";

type Stage = "loading" | "question" | "answered-correct" | "answered-wrong" | "breakdown" | "retry" | "error";

export default function PracticePage({ params }: { params: { topicId: string } }) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [nextTopic, setNextTopic] = useState<Topic | null>(null);
  const [slides, setSlides] = useState<BreakdownSlide[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  async function loadPractice() {
    try {
      setStage("loading");
      setSelected(null);
      setResult(null);
      setNextTopic(null);
      setSlides([]);
      setSlideIndex(0);
      setErrorMsg("");
      setActionError("");
      const sid = await ensureStudentId();
      setStudentId(sid);
      const [fetched, next] = await Promise.all([
        api.getQuestionForTopic(params.topicId),
        api.getNextTopic(params.topicId).catch(() => ({ topic: null })),
      ]);
      setQuestion(fetched);
      setNextTopic(next.topic);
      setStage("question");
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong");
      setStage("error");
    }
  }

  useEffect(() => {
    void loadPractice();
    // The route id is the complete identity of this practice screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.topicId]);

  async function submit(attemptNumber: number, wentThroughBreakdown: boolean) {
    if (!question || !selected || !studentId) return;
    setActionBusy(true);
    setActionError("");
    try {
      const response = await api.submitAttempt({
        student_id: studentId,
        question_id: question.id,
        selected_option: selected,
        attempt_number: attemptNumber,
        went_through_breakdown: wentThroughBreakdown,
      });
      setResult(response);
      setStage(response.is_correct ? "answered-correct" : "answered-wrong");
    } catch (error: any) {
      setActionError(error.message || "Could not submit your answer. Tap submit to try again.");
    } finally {
      setActionBusy(false);
    }
  }

  async function startBreakdown() {
    if (!question) return;
    setActionBusy(true);
    setActionError("");
    try {
      const fetched = await api.getBreakdown(question.id);
      setSlides(fetched);
      setSlideIndex(0);
      setStage("breakdown");
    } catch (error: any) {
      setActionError(error.message || "Could not load the breakdown. Please try again.");
    } finally {
      setActionBusy(false);
    }
  }

  function retryMainQuestion() {
    setSelected(null);
    setResult(null);
    setStage("retry");
  }

  if (stage === "loading") return <ShellMessage>Loading question from database...</ShellMessage>;
  if (stage === "error") {
    return (
      <ShellMessage>
        <p>Could not load this question: {errorMsg}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => void loadPractice()} className="rounded-[6px] bg-[#18181b] px-4 py-2 text-white">
            Try again
          </button>
          <Link href="/archive" className="rounded-[6px] border border-[#d4d4d8] px-4 py-2">Back to archive</Link>
        </div>
      </ShellMessage>
    );
  }
  if (!question) return null;

  return (
    <main className="scroll-invisible min-h-screen bg-[#f4f5f7] p-3 pb-24 text-[#18181b] sm:p-4 sm:pb-24 xl:h-screen xl:overflow-y-auto xl:pb-4">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[8px] bg-[#fafafa] shadow-2xl shadow-black/25">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e4e7] bg-white px-4 py-5 sm:px-6">
          <div>
            <Link href="/" className="text-xs font-bold text-[#4b5563]">Back to dashboard</Link>
            <h1 className="mt-2 text-2xl font-black">
              {stage === "breakdown" ? "Question Breakdown" : "Today's Question"}
            </h1>
          </div>
          {stage === "breakdown" && <p className="text-sm font-bold text-[#6b7280]">{slideIndex + 1} / {slides.length}</p>}
        </header>

        {stage !== "breakdown" && (
          <div className="p-4 sm:p-6">
            <QuestionCard
              question={question}
              selected={selected}
              setSelected={setSelected}
              disabled={stage === "answered-correct" || stage === "answered-wrong"}
              busy={actionBusy}
              onSubmit={() => submit(stage === "retry" ? 2 : 1, stage === "retry")}
            />

            {actionError && (
              <div className="mt-4 rounded-[8px] border border-[#fca5a5] bg-[#fef2f2] p-4 text-sm font-semibold text-[#991b1b]">
                {actionError}
              </div>
            )}

            {stage === "answered-correct" && (
              <ResultBanner ok>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span>Correct. {result?.explanation}</span>
                  {nextTopic ? (
                    <Link
                      href={`/practice/${nextTopic.id}`}
                      className="rounded-[6px] bg-[#18181b] px-4 py-2 text-sm font-bold text-white"
                    >
                      Next Question
                    </Link>
                  ) : (
                    <Link href="/archive" className="rounded-[6px] bg-[#18181b] px-4 py-2 text-sm font-bold text-white">
                      Open Archive
                    </Link>
                  )}
                </div>
              </ResultBanner>
            )}

            {stage === "answered-wrong" && (
              <ResultBanner ok={false}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    Not quite.
                    {result?.correct_option && ` Correct answer: ${result.correct_option}. ${result.explanation ?? ""}`}
                  </span>
                  {result?.breakdown_available && !result.correct_option && (
                    <button disabled={actionBusy} onClick={startBreakdown} className="rounded-[6px] bg-[#18181b] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                      {actionBusy ? "Loading breakdown..." : "Work through breakdown"}
                    </button>
                  )}
                </div>
              </ResultBanner>
            )}
          </div>
        )}

        {stage === "breakdown" && slides.length > 0 && studentId && (
          <BreakdownDeck
            slides={slides}
            index={slideIndex}
            studentId={studentId}
            onSelect={setSlideIndex}
            onNext={() => {
              if (slideIndex + 1 >= slides.length) retryMainQuestion();
              else setSlideIndex((value) => value + 1);
            }}
          />
        )}
      </section>
      <MobileNav active="today" />
    </main>
  );
}

function QuestionCard({
  question,
  selected,
  setSelected,
  disabled,
  busy,
  onSubmit,
}: {
  question: Question;
  selected: string | null;
  setSelected: (key: string) => void;
  disabled: boolean;
  busy: boolean;
  onSubmit: () => void;
}) {
  return (
    <section className="rounded-[8px] border border-[#e4e4e7] bg-white p-4 sm:p-6">
      <p className="text-xs font-black uppercase tracking-wide text-[#6b7280]">Question of Record</p>
      <p className="mt-4 text-lg font-black leading-7 text-[#18181b] sm:text-xl sm:leading-8">{question.question_text}</p>
      <div className="mt-6 space-y-3">
        {question.options.map((option) => (
          <button
            key={option.key}
            disabled={disabled}
            onClick={() => setSelected(option.key)}
            className={`w-full rounded-[8px] border p-4 text-left text-sm font-semibold ${
              selected === option.key
                ? "border-[#18181b] bg-[#18181b] text-white"
                : "border-[#e4e4e7] bg-white text-[#18181b] hover:border-[#18181b]"
            } ${disabled ? "opacity-70" : ""}`}
          >
            <span className="mr-2 font-black">{option.key}.</span>
            {option.text}
          </button>
        ))}
      </div>
      {!disabled && (
        <button
          disabled={!selected || busy}
          onClick={onSubmit}
          className="mt-6 rounded-[6px] bg-[#18181b] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          {busy ? "Submitting..." : "Submit Answer"}
        </button>
      )}
    </section>
  );
}

function BreakdownDeck({
  slides,
  index,
  studentId,
  onSelect,
  onNext,
}: {
  slides: BreakdownSlide[];
  index: number;
  studentId: string;
  onSelect: (index: number) => void;
  onNext: () => void;
}) {
  const slide = slides[index];
  const [chosen, setChosen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ is_correct: boolean; correct_option: string; explanation: string | null } | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setChosen(null);
    setFeedback(null);
    setSubmitError("");
    setSubmitting(false);
  }, [index]);

  async function submitPractice() {
    if (!chosen) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await api.submitBreakdownAnswer({ student_id: studentId, slide_id: slide.id, selected_option: chosen });
      setFeedback(response);
    } catch (error: any) {
      setSubmitError(error.message || "Could not submit this answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr]">
      <aside className="scroll-invisible border-b border-[#e4e4e7] bg-white p-4 lg:max-h-[calc(100vh-98px)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <p className="mb-4 text-xs font-black">Breakdown</p>
        <div className="space-y-3">
          {slides.map((item, itemIndex) => (
            <button
              key={item.id}
              onClick={() => onSelect(itemIndex)}
              className={`flex w-full items-center gap-3 rounded-[6px] border p-3 text-left ${
                itemIndex === index ? "border-[#3da35d] bg-[#f8fff9]" : "border-[#e4e4e7] bg-white"
              }`}
            >
              <span className="text-xs font-black text-[#374151]">{item.slide_order}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-[#3da35d] capitalize">{item.slide_type}</p>
                <p className="truncate text-[11px] font-bold text-[#18181b]">{item.subject.replace("_", " ")}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="scroll-invisible min-h-[420px] bg-[#fafafa] p-4 sm:p-6 md:p-9 lg:max-h-[calc(100vh-98px)] lg:overflow-y-auto">
        <span className="rounded-full bg-[#eaf7ee] px-3 py-1 text-xs font-bold text-[#287946]">
          {slide.slide_type} {index + 1} of {slides.length}
        </span>

        {slide.slide_type === "theory" ? (
          <article className="mt-7 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-[#27272a]">
            {slide.content}
          </article>
        ) : (
          <div className="mt-7 max-w-3xl">
            <h2 className="text-xl font-black text-[#18181b]">{slide.practice_question}</h2>
            <div className="mt-5 space-y-3">
              {slide.practice_options?.map((option) => (
                <button
                  key={option.key}
                  disabled={!!feedback || submitting}
                  onClick={() => setChosen(option.key)}
                  className={`w-full rounded-[8px] border p-4 text-left text-sm font-semibold ${
                    chosen === option.key ? "border-[#18181b] bg-[#18181b] text-white" : "border-[#e4e4e7] bg-white"
                  }`}
                >
                  <span className="mr-2 font-black">{option.key}.</span>
                  {option.text}
                </button>
              ))}
            </div>
            {!feedback && (
              <button
                disabled={!chosen || submitting}
                onClick={submitPractice}
                className="mt-5 rounded-[6px] bg-[#18181b] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                {submitting ? "Checking..." : "Check Answer"}
              </button>
            )}
            {submitError && (
              <div className="mt-4 rounded-[8px] border border-[#fca5a5] bg-[#fef2f2] p-4 text-sm font-semibold text-[#991b1b]">
                {submitError}
              </div>
            )}
            {feedback && (
              <ResultBanner ok={feedback.is_correct}>
                {feedback.is_correct
                  ? "Correct."
                  : feedback.correct_option
                    ? `Correct answer: ${feedback.correct_option}.`
                    : ""} {feedback.explanation}
              </ResultBanner>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            disabled={slide.slide_type === "practice" && !feedback}
            className="rounded-[6px] bg-[#18181b] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            {index + 1 >= slides.length ? "Return to Question" : "Next"}
          </button>
        </div>
      </section>
    </div>
  );
}

function ResultBanner({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className={`mt-4 rounded-[8px] border p-4 text-sm font-semibold ${
      ok ? "border-[#b8dfc2] bg-[#f1faf3] text-[#1d6d38]" : "border-[#ffd6d1] bg-[#fff1f0] text-[#ad3d35]"
    }`}>
      {children}
    </div>
  );
}

function ShellMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f5f7] p-4">
      <div className="rounded-[8px] bg-white px-5 py-4 text-sm font-semibold text-[#18181b]">{children}</div>
    </main>
  );
}
