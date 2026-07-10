"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MobileNav } from "./components/MobileNav";
import { api, ApiError, DashboardStats, Topic, TopicListResponse } from "../lib/api";
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

  if (!authReady) return <FullPageMessage>Loading secure session...</FullPageMessage>;
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
    <main className="min-h-screen bg-[#f4f5f7] text-[#18181b] xl:h-screen xl:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 xl:h-screen xl:grid-cols-[270px_1fr]">
        <Sidebar
          student={student}
          active="home"
          practiceHref={practiceTopic ? `/practice/${practiceTopic.id}` : null}
          onLogout={() => { clearAuthSession(); setStudent(null); setPracticeTopic(null); }}
        />
        <section className="scroll-invisible p-3 pb-24 sm:p-4 sm:pb-24 xl:h-screen xl:overflow-y-auto xl:p-5">
          <div className="overflow-hidden rounded-[8px] bg-[#fafafa] shadow-2xl shadow-black/20 ring-1 ring-white/20">
            <Topbar student={student} stats={stats} />
            <div className="space-y-4 p-4 sm:p-5 lg:p-8">
              {student.device_warning && (
                <section className="rounded-[8px] border border-[#f59e0b] bg-[#fffbeb] p-4 text-sm font-semibold text-[#92400e]">
                  {student.device_warning}
                </section>
              )}
              <section className="rounded-[8px] border border-[#e4e4e7] bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-[#18181b]">Continue Your Practice</h2>
                  <select
                    value={`${selected.year}-${selected.month}`}
                    onChange={(event) => {
                      const [year, month] = event.target.value.split("-").map(Number);
                      setSelected({ year, month });
                    }}
                    className="rounded-[6px] border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-semibold text-[#374151]"
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
                <ActionCard title="Month Archive" text="Browse every stored topic from the database." href="/archive" />
                <ActionCard title="Daily Report" text="Open your latest generated performance report." href="/reports" />
                <ActionCard title="Profile" text="Manage exam target and account security." href="/profile" />
              </section>
            </div>
          </div>
        </section>
      </div>
      <MobileNav active="home" practiceHref={practiceTopic ? `/practice/${practiceTopic.id}` : null} />
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
    <main className="min-h-screen bg-[#f4f5f7] px-3 py-4 text-[#18181b] sm:px-4 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl overflow-hidden rounded-[10px] bg-[#fafafa] shadow-2xl shadow-black/30 lg:grid-cols-[1fr_430px]">
        <section className="relative hidden bg-[#18181b] p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#18181b,#27272a)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <LogoMark />
              <h1 className="mt-10 max-w-xl text-4xl font-black tracking-tight">
                Master Current Affairs. Ace Your Exams.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-200">
                Sign in once, practice from the live database, and keep one secure account per device.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {["One email per device", "One active session", "30-day sessions", "Email OTP login"].map((item) => (
                <div key={item} className="rounded-[8px] border border-white/15 bg-white/10 p-4">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-10">
          <div className="w-full">
            <LogoMark dark />
            <h2 className="mt-8 text-2xl font-black text-[#18181b]">Sign in with email OTP</h2>
            <p className="mt-2 text-sm text-[#6b7280]">
              Each device can be linked to one email only. You stay signed in for up to 30 days.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-[#6b7280]">Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={step === "otp"}
                  className="mt-2 w-full rounded-[8px] border border-[#e4e4e7] bg-white px-4 py-3 text-sm outline-none focus:border-[#18181b]"
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
                      className="mt-2 w-full rounded-[8px] border border-[#e4e4e7] bg-white px-4 py-3 text-lg font-black tracking-[0.35em] outline-none focus:border-[#18181b]"
                      placeholder="000000"
                    />
                  </label>
                  {accountExists === false && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="rounded-[8px] border border-[#e4e4e7] bg-white px-4 py-3 text-sm outline-none focus:border-[#18181b]"
                        placeholder="Name"
                      />
                      <select
                        value={targetExam}
                        onChange={(event) => setTargetExam(event.target.value)}
                        className="rounded-[8px] border border-[#e4e4e7] bg-white px-4 py-3 text-sm outline-none focus:border-[#18181b]"
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

            {message && <p className="mt-4 rounded-[6px] bg-[#f4f4f5] px-3 py-2 text-sm text-[#3f3f46]">{message}</p>}

            <button
              onClick={step === "email" ? () => requestOtp(false) : verify}
              disabled={busy || !email || (step === "otp" && otp.length < 4)}
              className="mt-6 w-full rounded-[8px] bg-[#18181b] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#18181b]/20 disabled:opacity-50"
            >
              {busy ? "Please wait..." : step === "email" ? "Send OTP" : "Verify and Enter"}
            </button>
            {step === "otp" && (
              <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-[#6b7280]">
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
          </div>
        </section>
      </div>
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
    <aside className="scroll-invisible hidden min-h-screen bg-[#fafafa] p-5 shadow-xl shadow-black/20 xl:block xl:h-screen xl:overflow-y-auto">
      <LogoMark dark />
      <nav className="mt-8 space-y-2">
        {visibleNavItems.map(([key, label, href, path]) => (
          <Link
            href={href}
            key={key}
            className={`flex h-10 items-center gap-3 rounded-[6px] px-4 text-sm font-semibold ${
              active === key ? "bg-[#18181b] text-white" : "text-[#374151] hover:bg-[#f4f4f5]"
            }`}
          >
            <Icon path={path} className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-10 border-t border-[#e4e4e7] pt-5">
        <Link href="/profile" className="flex items-center gap-3 rounded-[8px] p-2 hover:bg-[#f4f4f5]">
          <Avatar name={student.name || student.email || "Aspirant"} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-[#18181b]">{student.name || "Aspirant"}</p>
            <p className="truncate text-xs text-[#6b7280]">{student.target_exam}</p>
          </div>
          <span className="text-[11px] font-bold text-[#18181b]">Edit</span>
        </Link>
        <button onClick={onLogout} className="mt-4 text-xs font-bold text-[#6b7280] hover:text-[#18181b]">
          Log out
        </button>
      </div>
    </aside>
  );
}

function Topbar({ student, stats }: { student: StudentProfile; stats: DashboardStats | null }) {
  return (
    <header className="flex min-h-[72px] flex-wrap items-center justify-between gap-3 border-b border-[#e4e4e7] px-4 py-4 sm:px-6 lg:px-10">
      <div className="min-w-0">
        <h1 className="text-sm font-black text-[#18181b] sm:text-base">Master Current Affairs. Ace Your Exams.</h1>
        <p className="mt-1 text-xs font-medium text-[#6b7280]">Daily practice. Deep learning. Measurable progress.</p>
      </div>
      <div className="flex items-center gap-5">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xl font-black text-[#ff7b3d]">{stats ? stats.current_streak_days : "-"}</span>
          <div>
            <p className="text-xs text-[#6b7280]">Day Streak</p>
          </div>
        </div>
        <Avatar name={student.name || student.email || "Aspirant"} />
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
    <div className="rounded-[8px] border border-[#e4e4e7] bg-white px-4 py-4 sm:px-5">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-black">
          {MONTH_NAMES[selected.month - 1]} {selected.year}
        </p>
        <span className="text-xs font-bold text-[#6b7280]">
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
              activeDay === day ? "bg-[#18181b] text-white" : "text-[#374151]"
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
  return (
    <div className="flex flex-col justify-center">
      <div className="mb-3 flex items-center gap-3">
        <h3 className="text-xl font-black text-[#18181b]">Today's Question</h3>
        {topic && <span className="rounded-full border border-[#d4d4d8] bg-[#f4f4f5] px-2 py-0.5 text-[11px] font-bold text-[#3f3f46]">Live</span>}
      </div>
      <p className="text-xs font-semibold text-[#6b7280]">
        {MONTH_NAMES[selected.month - 1]} {selected.year} - {tag}
      </p>
      <p className="mt-4 max-w-xl text-sm leading-6 text-[#18181b]">
        {loading ? "Loading from the database..." : loadMessage || topic?.summary || "No published topic is available for this month yet."}
      </p>
      <p className="mt-3 text-sm font-bold text-[#18181b]">
        {topic?.title || (loadMessage ? "Database unavailable." : "No question available.")}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-5">
        {topic ? (
          <Link
            href={`/practice/${topic.id}`}
            className="inline-flex h-11 items-center gap-3 rounded-[6px] bg-[#18181b] px-5 text-sm font-bold text-white shadow-lg shadow-[#18181b]/20"
          >
            Start Question <span>{"->"}</span>
          </Link>
        ) : (
          <button disabled className="h-11 rounded-[6px] bg-[#18181b] px-5 text-sm font-bold text-white opacity-50">
            Start Question
          </button>
        )}
        <Link href="/archive" className="text-sm font-bold text-[#374151]">Open Archive</Link>
      </div>
    </div>
  );
}

function StatsStrip({ stats }: { stats: DashboardStats | null }) {
  const rankText = stats?.rank_today && stats.active_aspirants_today
    ? `${stats.rank_today} / ${stats.active_aspirants_today}`
    : "-";
  return (
    <section className="grid overflow-hidden rounded-[8px] border border-[#e4e4e7] bg-white shadow-sm sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Questions Attempted" value={stats ? String(stats.questions_attempted_today) : "-"} sub="Today" color="#71717a" />
      <Metric label="Accuracy" value={stats ? `${stats.accuracy_today}%` : "-"} sub={stats ? `${stats.correct_today} correct` : "Unavailable"} color="#3da35d" />
      <Metric label="Current Streak" value={stats ? String(stats.current_streak_days) : "-"} sub="Days" color="#ff7b3d" />
      <Metric label="Rank (Today)" value={rankText} sub="Active aspirants" color="#52525b" />
    </section>
  );
}

function Metric({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-[#e4e4e7] p-5 sm:border-r xl:border-b-0">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white" style={{ backgroundColor: color }}>
        <span className="h-3 w-3 rounded-full bg-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-[#4b5563]">{label}</p>
        <p className="mt-2 text-2xl font-black text-[#18181b]">{value}</p>
        <p className="text-xs text-[#6b7280]">{sub}</p>
      </div>
    </div>
  );
}

function ActionCard({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <Link href={href} className="rounded-[8px] border border-[#e4e4e7] bg-white p-5 shadow-sm hover:border-[#18181b]">
      <p className="text-sm font-black text-[#18181b]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#6b7280]">{text}</p>
    </Link>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim()[0]?.toUpperCase() || "A";
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#f4f4f5,#d4d4d8)] text-sm font-black text-[#18181b]">
      {initial}
    </div>
  );
}

function LogoMark({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid h-10 w-10 place-items-center rounded-[8px] ${dark ? "bg-[#18181b] text-white" : "bg-white text-[#18181b]"}`}>
        <Icon path="M5 6c3 0 5 1 7 3 2-2 4-3 7-3v12c-3 0-5 1-7 3-2-2-4-3-7-3zM12 9v12" className="h-6 w-6" />
      </div>
      <div className={dark ? "text-[#18181b]" : "text-white"}>
        <p className="text-sm font-black leading-4">The Current</p>
        <p className="text-sm font-black leading-4">Affairs Gazette</p>
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

function FullPageMessage({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-[#f4f5f7] text-sm font-semibold text-[#18181b]">{children}</main>;
}
