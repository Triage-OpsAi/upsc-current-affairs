"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "./components/MobileNav";
import { AppLoader, InlineSpinner } from "./components/AppLoader";
import { api, ApiError, DashboardStats, Topic, TopicListResponse } from "../lib/api";
import { selectedAvatarUrl } from "../lib/avatars";
import { formatQuestionText } from "../lib/question-text";
import {
  StudentProfile,
  clearAuthSession,
  getAuthToken,
  getStoredStudent,
  setAuthSession,
  updateStoredStudent,
} from "../lib/student";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const navItems = [
  ["home", "Home", "/", "M3 10.5 12 3l9 7.5M5 9v10h14V9M9 19v-6h6v6"],
  ["today", "Today's Question", "/", "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"],
  ["archive", "Month Archive", "/archive", "M7 3v3M17 3v3M4 8h16M5 5h14v15H5z"],
  ["reports", "Reports", "/reports", "M5 19V9M12 19V5M19 19v-8"],
  ["settings", "Settings", "/profile", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4h2M2 12h2M12 2v2M12 20v2"],
] as const;

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

export default function HomePage() {
  const months = useMemo(monthsSinceJan2025, []);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [selected, setSelected] = useState(months[0] ?? { year: 2026, month: 7 });
  const [topics, setTopics] = useState<TopicListResponse | null>(null);
  const [practiceTopic, setPracticeTopic] = useState<Topic | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState("");

  useEffect(() => {
    let active = true;
    let refreshing = false;

    const refreshAccount = async () => {
      if (refreshing) return;
      const token = getAuthToken();
      const cached = getStoredStudent();
      if (!token || !cached) {
        if (active) {
          setStudent(null);
          setStats(null);
          setPracticeTopic(null);
          setAuthReady(true);
        }
        return;
      }

      refreshing = true;
      if (active) setStudent(cached);
      try {
        const [fresh, dashboard, practice] = await Promise.all([
          api.me(),
          api.getDashboard(),
          api.getLatestPracticeTopic().catch(() => ({ topic: null })),
        ]);
        if (!active) return;
        updateStoredStudent(fresh);
        setStudent(fresh);
        setStats(dashboard);
        setPracticeTopic(practice.topic);
      } catch {
        if (active && !getAuthToken()) {
          setStudent(null);
          setStats(null);
        }
      } finally {
        refreshing = false;
        if (active) setAuthReady(true);
      }
    };
    const refreshWhenVisible = () => {
      if (!document.hidden) void refreshAccount();
    };

    void refreshAccount();
    window.addEventListener("pageshow", refreshAccount);
    window.addEventListener("focus", refreshAccount);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.removeEventListener("pageshow", refreshAccount);
      window.removeEventListener("focus", refreshAccount);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    if (!student) return;
    setLoading(true);
    setLoadMessage("");
    api
      .listTopics({ year: selected.year, month: selected.month, page: 1, page_size: 10 })
      .then(setTopics)
      .catch((error: any) => {
        setTopics(null);
        setLoadMessage(error.message || "Could not load topics right now.");
      })
      .finally(() => setLoading(false));
  }, [student, selected]);

  if (!authReady) return <main className="grid min-h-screen place-items-center bg-[#08090d] p-4"><AppLoader label="Restoring your secure session" /></main>;
  if (!student) {
    return (
      <LoginScreen
        onAuthed={(authenticatedStudent) => {
          setStudent(authenticatedStudent);
          void api.getDashboard().then(setStats).catch(() => undefined);
          void api.getLatestPracticeTopic().then(({ topic }) => setPracticeTopic(topic)).catch(() => setPracticeTopic(null));
        }}
      />
    );
  }

  const firstTopic = topics?.items[0] ?? null;
  const totalQuestions = topics ? topics.meta.total_items : null;

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100 xl:h-screen xl:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 xl:h-screen xl:grid-cols-[280px_1fr]">
        <Sidebar
          student={student}
          active="home"
          practiceHref={practiceTopic ? `/practice/${practiceTopic.id}` : null}
          onLogout={() => { clearAuthSession(); setStudent(null); setPracticeTopic(null); }}
        />
        <section className="scroll-invisible p-3 pb-24 sm:p-4 sm:pb-24 xl:h-screen xl:overflow-y-auto xl:p-5">
          <div className="overflow-hidden rounded-[10px] border border-white/[.08] bg-[#0d0f15] shadow-2xl shadow-black/30">
            <Topbar student={student} stats={stats} />
            <div className="space-y-4 p-4 sm:p-5 lg:p-8">
              {student.device_warning && (
                <section className="rounded-lg border border-amber-300/20 bg-amber-300/[.07] p-4 text-sm font-semibold text-amber-100">
                  {student.device_warning}
                </section>
              )}
              <section className="panel p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-xs font-semibold uppercase text-cyan-300">Practice workspace</p><h2 className="mt-1 text-lg font-semibold text-white">Continue your preparation</h2></div>
                  <select
                    value={`${selected.year}-${selected.month}`}
                    onChange={(event) => {
                      const [year, month] = event.target.value.split("-").map(Number);
                      setSelected({ year, month });
                    }}
                    className="max-w-[190px] text-xs font-semibold"
                  >
                    {months.map((m) => (
                      <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                        {MONTH_NAMES[m.month - 1]} {m.year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-6 lg:grid-cols-[315px_1fr]">
                  <CalendarPanel selected={selected} activeDate={firstTopic?.source_date ?? null} totalQuestions={totalQuestions} />
                  <QuestionPreview topic={firstTopic} loading={loading} selected={selected} loadMessage={loadMessage} />
                </div>
              </section>

              <StatsStrip stats={stats} />

              <section className="grid gap-4 md:grid-cols-3">
                <ActionCard title="Question Archive" text="Filter real practice questions month by month." href="/archive" />
                <ActionCard title="Daily Report" text="Open your latest generated performance report." href="/reports" />
                <ActionCard title="Profile" text="Manage exam target and account security." href="/profile" />
              </section>
            </div>
          </div>
        </section>
      </div>
      <MobileNav active="home" />
    </main>
  );
}

function LoginScreen({ onAuthed }: { onAuthed: (student: StudentProfile) => void }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [targetExam, setTargetExam] = useState("UPSC Prelims");
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, resendIn]);

  async function requestOtp(isResend = false) {
    setBusy(true);
    setMessage("");
    try {
      const response = await api.requestOtp(email.trim());
      setAccountExists(response.account_exists);
      setResendIn(response.resend_after_seconds);
      setStep("otp");
      setMessage(isResend
        ? "A new OTP was sent. The previous code no longer works."
        : response.account_exists
          ? "OTP sent. Enter it to sign in."
          : "OTP sent. Add your profile details once to create the account.");
    } catch (error: any) {
      if (error instanceof ApiError && error.code === "otp_resend_cooldown") {
        const retryAfter = Number((error.details as any)?.retry_after_seconds);
        if (Number.isFinite(retryAfter)) setResendIn(retryAfter);
      }
      setMessage(error.message || "Could not send OTP");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setMessage("");
    try {
      const session = await api.verifyOtp({
        email: email.trim(),
        otp,
        ...(accountExists === false
          ? { name: name.trim() || undefined, target_exam: targetExam }
          : {}),
      });
      setAuthSession(session);
      onAuthed(session.student);
    } catch (error: any) {
      setMessage(error.message || "Could not verify OTP");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#08090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-100">CA</span><span className="font-semibold text-white">AspirantOS</span></a>
          <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex"><a href="#system" className="hover:text-white">System</a><a href="#workflow" className="hover:text-white">Workflow</a><a href="#signin" className="hover:text-white">Sign in</a></nav>
          <a href="#signin" className="primary-button">Open workspace</a>
        </div>
      </header>

      <section id="top" className="relative isolate overflow-hidden border-b border-white/[.07]">
        <div className="pointer-events-none absolute inset-0 grid-fade opacity-60" />
        <div className="pointer-events-none absolute -right-40 top-10 size-[520px] rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative mx-auto grid min-h-[calc(100vh-68px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.04fr_.96fr]">
          <div>
            <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/[.08] px-3 py-1 text-xs font-semibold text-cyan-100">Current affairs command center for serious aspirants</div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[.96] text-white md:text-7xl">Turn daily news into exam-ready judgment.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">Practice focused questions, work through guided breakdowns, and see exactly where your preparation is improving—without losing your place or your progress.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#signin" className="primary-button min-h-12 px-5">Start practising <span aria-hidden="true">→</span></a><a href="#system" className="ghost-button min-h-12 px-5">Explore the system</a></div>
            <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
              {[["Daily", "Question-led current affairs"], ["6-step", "Guided concept breakdowns"], ["Live", "Personal progress reports"]].map(([value, label]) => <div key={label} className="border-l border-white/[.14] pl-4"><div className="text-2xl font-semibold text-white">{value}</div><p className="mt-1 text-xs leading-5 text-zinc-500">{label}</p></div>)}
            </div>
          </div>

          <div className="panel relative overflow-hidden p-4 sm:p-6">
            <div className="absolute inset-0 grid-fade opacity-35" />
            <div className="relative">
              <div className="flex items-center justify-between border-b border-white/[.07] pb-4"><div><p className="text-xs font-semibold uppercase text-cyan-300">Today’s command center</p><p className="mt-1 text-sm text-zinc-500">UPSC Prelims · Current Affairs</p></div><span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">Ready</span></div>
              <div className="mt-5 rounded-lg border border-white/[.08] bg-white/[.035] p-5"><p className="text-xs font-semibold text-zinc-500">QUESTION OF RECORD</p><h2 className="mt-4 text-xl font-semibold leading-8 text-white">Which constitutional principle best explains the balance between executive action and judicial review?</h2><div className="mt-5 grid gap-2">{["A. Parliamentary privilege", "B. Separation of powers", "C. Collective responsibility"].map((item, index) => <div key={item} className={`rounded-lg border p-3 text-sm ${index === 1 ? "border-cyan-300/30 bg-cyan-300/[.08] text-cyan-100" : "border-white/[.07] bg-black/10 text-zinc-400"}`}>{item}</div>)}</div></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">{[["12", "day streak"], ["74%", "accuracy"], ["Top 18%", "percentile"]].map(([value, label]) => <div key={label} className="rounded-lg border border-white/[.07] bg-white/[.03] p-4"><p className="text-lg font-semibold text-white">{value}</p><p className="mt-1 text-xs text-zinc-500">{label}</p></div>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="system" className="border-b border-white/[.07] px-4 py-20 sm:px-6"><div className="mx-auto max-w-7xl"><p className="text-xs font-semibold uppercase text-cyan-300">The system</p><h2 className="mt-4 max-w-3xl text-3xl font-semibold text-white md:text-5xl">A calm study workspace built for repeated, focused work.</h2><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[["Practice", "Only available questions appear—no dead tabs or empty routes."], ["Understand", "Six-part breakdowns connect facts, concepts, and exam logic."], ["Track", "Reports use your real attempts and surface weak subjects."], ["Return", "Secure sessions and cached state keep your workspace ready."]].map(([title, text], index) => <article key={title} className="panel p-5"><div className="grid size-10 place-items-center rounded-lg bg-cyan-300/10 text-sm font-semibold text-cyan-100">0{index + 1}</div><h3 className="mt-5 text-sm font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p></article>)}</div></div></section>

      <section id="workflow" className="border-b border-white/[.07] px-4 py-20 sm:px-6"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-semibold uppercase text-emerald-300">Workflow</p><h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">Read less randomly. Recall more deliberately.</h2><p className="mt-4 text-sm leading-7 text-zinc-500">Every session follows a clear loop from question to concept to measurable progress.</p></div><div className="grid gap-3 sm:grid-cols-3">{[["01", "Choose a month", "Filter the archive to the period you want to revise."], ["02", "Answer and learn", "Submit once, then use the breakdown when a concept needs work."], ["03", "Review the signal", "Use subject and readiness scores to plan the next session."]].map(([number, title, text]) => <div key={number} className="rounded-lg border border-white/[.08] bg-white/[.035] p-5"><div className="text-xs font-semibold text-emerald-200">{number}</div><h3 className="mt-4 text-sm font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p></div>)}</div></div></section>

      <section id="signin" className="relative px-4 py-20 sm:px-6"><div className="pointer-events-none absolute inset-0 grid-fade opacity-35" /><div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.9fr_1.1fr]"><div className="self-center"><p className="text-xs font-semibold uppercase text-amber-300">Secure workspace</p><h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Continue where you stopped.</h2><p className="mt-4 max-w-lg text-sm leading-7 text-zinc-500">Email OTP keeps the account passwordless. Returning users enter only email and OTP, and sessions remain active for up to 30 days.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{["One account per device", "Redis-cached sessions", "Progress saved automatically", "Device-limit warnings"].map((item) => <div key={item} className="rounded-lg border border-white/[.08] bg-white/[.035] p-4 text-sm text-zinc-300">{item}</div>)}</div></div>

        <section className="panel p-6 sm:p-8">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-100">CA</span><div><h2 className="text-xl font-semibold text-white">Sign in with email OTP</h2><p className="mt-1 text-xs text-zinc-500">Your study history stays attached to this account.</p></div></div>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={step === "otp"}
                  className="mt-2"
                  placeholder="you@example.com"
                />
              </label>

              {step === "otp" && (
                <>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">OTP</span>
                    <input
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="mt-2 text-lg font-black tracking-[0.35em]"
                      placeholder="000000"
                    />
                  </label>
                  {accountExists === false && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className=""
                        placeholder="Name"
                      />
                      <select
                        value={targetExam}
                        onChange={(event) => setTargetExam(event.target.value)}
                        className=""
                      >
                        <option>UPSC Prelims</option>
                        <option>SSC CGL</option>
                        <option>State PSC</option>
                        <option>Banking</option>
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            {message && <p className="mt-4 rounded-lg border border-cyan-300/15 bg-cyan-300/[.06] px-3 py-2 text-sm text-cyan-100">{message}</p>}

            <button
              onClick={step === "email" ? () => requestOtp(false) : verify}
              disabled={busy || !email || (step === "otp" && otp.length < 4)}
              className="primary-button mt-6 w-full disabled:opacity-50"
            >
              {busy ? <InlineSpinner label="Please wait" /> : step === "email" ? "Send OTP" : "Verify and enter"}
            </button>
            {step === "otp" && (
              <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-zinc-500">
                <button
                  type="button"
                  onClick={() => void requestOtp(true)}
                  disabled={busy || resendIn > 0}
                  className="px-3 py-2 disabled:opacity-50"
                >
                  {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setAccountExists(null);
                    setResendIn(0);
                    setMessage("");
                  }}
                  className="px-3 py-2"
                >
                  Use a different email
                </button>
              </div>
            )}
        </section>
      </div>
      </section>
      <footer className="border-t border-white/[.07] px-4 py-8 text-center text-xs text-zinc-600">AspirantOS · Current affairs practice built for consistent revision.</footer>
    </main>
  );
}

function Sidebar({
  student,
  active,
  practiceHref,
  onLogout,
}: {
  student: StudentProfile;
  active: string;
  practiceHref: string | null;
  onLogout: () => void;
}) {
  const visibleNavItems = navItems
    .filter(([key]) => key !== "today" || practiceHref)
    .map(([key, label, href, path]) => [key, label, key === "today" ? practiceHref! : href, path] as const);

  return (
    <aside className="scroll-invisible hidden min-h-screen border-r border-white/[.07] bg-[#0d0f15] p-5 xl:block xl:h-screen xl:overflow-y-auto">
      <LogoMark />
      <nav className="mt-8 space-y-2">
        {visibleNavItems.map(([key, label, href, path]) => (
          <Link
            href={href}
            key={key}
            aria-current={active === key ? "page" : undefined}
            className={`flex h-10 items-center gap-3 rounded-[6px] border px-4 text-sm font-semibold transition ${
              active === key
                ? "border-cyan-200 bg-cyan-300 text-[#071016] shadow-[0_0_0_2px_rgba(103,232,249,0.12)]"
                : "border-transparent text-zinc-400 hover:bg-white/[.05] hover:text-white"
            }`}
          >
            <Icon path={path} className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-10 border-t border-white/[.07] pt-5">
        <Link href="/profile" className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/[.05]">
          <Avatar name={student.name || student.email || "Aspirant"} src={student.avatar_url} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{student.name || "Aspirant"}</p>
            <p className="truncate text-xs text-zinc-500">{student.target_exam}</p>
          </div>
          <span className="text-[11px] font-bold text-cyan-200">Edit</span>
        </Link>
        <button onClick={onLogout} className="mt-4 text-xs font-bold text-zinc-500 hover:text-white">
          Log out
        </button>
      </div>
    </aside>
  );
}

function Topbar({ student, stats }: { student: StudentProfile; stats: DashboardStats | null }) {
  return (
    <header className="flex min-h-[72px] flex-wrap items-center justify-between gap-3 border-b border-white/[.07] bg-[#0d0f15]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-cyan-300">AspirantOS workspace</p>
        <h1 className="mt-1 text-sm font-semibold text-white sm:text-base">Daily practice. Deep learning. Measurable progress.</h1>
      </div>
      <div className="flex items-center gap-5">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xl font-semibold text-amber-300">{stats ? stats.current_streak_days : "-"}</span>
          <div>
            <p className="text-xs text-zinc-500">Day streak</p>
          </div>
        </div>
        <Avatar name={student.name || student.email || "Aspirant"} src={student.avatar_url} />
      </div>
    </header>
  );
}

function CalendarPanel({
  selected,
  activeDate,
  totalQuestions,
}: {
  selected: { year: number; month: number };
  activeDate: string | null;
  totalQuestions: number | null;
}) {
  const daysInMonth = new Date(selected.year, selected.month, 0).getDate();
  const activeDay = activeDate ? new Date(activeDate).getDate() : null;
  return (
    <div className="rounded-lg border border-white/[.08] bg-white/[.035] px-4 py-4 sm:px-5">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-black">
          {MONTH_NAMES[selected.month - 1]} {selected.year}
        </p>
        <span className="text-xs font-bold text-zinc-500">
          {totalQuestions === null ? "Unavailable" : `${totalQuestions} questions`}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs sm:gap-3">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <span key={day} className="font-semibold text-[#71717a]">{day}</span>
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => (
          <span
            key={day}
            className={`flex h-7 items-center justify-center rounded-full font-semibold sm:h-8 ${
              activeDay === day ? "bg-cyan-300 text-zinc-950" : "text-zinc-400"
            }`}
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

function QuestionPreview({
  topic,
  loading,
  selected,
  loadMessage,
}: {
  topic: Topic | null;
  loading: boolean;
  selected: { year: number; month: number };
  loadMessage: string;
}) {
  const tag = topic?.subject_tags[0]?.replace("_", " ") ?? "current affairs";
  if (loading) return <AppLoader label="Preparing this month&apos;s practice" compact />;
  return (
    <div className="flex flex-col justify-center">
      <div className="mb-3 flex items-center gap-3">
        <h3 className="text-xl font-semibold text-white">Today&apos;s question</h3>
        {topic && <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[11px] font-bold text-emerald-200">Ready</span>}
      </div>
      <p className="text-xs font-semibold text-zinc-500">
        {MONTH_NAMES[selected.month - 1]} {selected.year} - {tag}
      </p>
      <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">
        {loadMessage || topic?.summary || "No practice question is available for this month yet."}
      </p>
      <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6 text-white">
        {formatQuestionText(topic?.question_text || topic?.title || (loadMessage ? "Practice is temporarily unavailable." : "No question available."))}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-5">
        {topic ? (
          <Link
            href={`/practice/${topic.id}`}
            className="primary-button h-11 px-5"
          >
            Start Question <span>{"->"}</span>
          </Link>
        ) : (
          <button disabled className="primary-button h-11 px-5 opacity-50">
            Start Question
          </button>
        )}
        <Link href="/archive" className="text-sm font-bold text-zinc-400 hover:text-white">Open archive</Link>
      </div>
    </div>
  );
}

function StatsStrip({ stats }: { stats: DashboardStats | null }) {
  const rankText = stats?.rank_today && stats.active_aspirants_today
    ? `${stats.rank_today} / ${stats.active_aspirants_today}`
    : "-";
  return (
    <section className="grid overflow-hidden rounded-lg border border-white/[.08] bg-[#10131a] sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Questions Attempted" value={stats ? String(stats.questions_attempted_today) : "-"} sub="Today" color="#71717a" />
      <Metric label="Accuracy" value={stats ? `${stats.accuracy_today}%` : "-"} sub={stats ? `${stats.correct_today} correct` : "Unavailable"} color="#3da35d" />
      <Metric label="Current Streak" value={stats ? String(stats.current_streak_days) : "-"} sub="Days" color="#ff7b3d" />
      <Metric label="Rank (Today)" value={rankText} sub="Active aspirants" color="#52525b" />
    </section>
  );
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-white/[.07] p-5 sm:border-r xl:border-b-0">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white" style={{ backgroundColor: color }}>
        <span className="h-3 w-3 rounded-full bg-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        <p className="text-xs text-zinc-600">{sub}</p>
      </div>
    </div>
  );
}

function ActionCard({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <Link href={href} className="panel p-5 transition hover:border-cyan-300/25 hover:bg-white/[.05]">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
    </Link>
  );
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  const initial = name.trim()[0]?.toUpperCase() || "A";
  const avatarSrc = selectedAvatarUrl(src);
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-100">
      {avatarSrc ? (
        <Image src={avatarSrc} alt="" width={40} height={40} className="h-full w-full object-cover" />
      ) : initial}
    </div>
  );
}

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
        <Icon path="M5 6c3 0 5 1 7 3 2-2 4-3 7-3v12c-3 0-5 1-7 3-2-2-4-3-7-3zM12 9v12" className="h-6 w-6" />
      </div>
      <div className="text-white">
        <p className="text-sm font-semibold leading-4">AspirantOS</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Current affairs</p>
      </div>
    </div>
  );
}

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
