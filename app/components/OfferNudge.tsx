"use client";

import { useEffect, useState } from "react";
import { getStoredStudent, StudentProfile } from "../../lib/student";
import { OfferCard } from "./OfferCard";

const OFFER_INTERVAL_MS = 15 * 60 * 1000;
const NEXT_OFFER_KEY = "gazette_next_offer_nudge_at";
const LOGIN_REMINDER_KEY = "gazette_trial_login_reminder_seen";

export function OfferNudge() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [showOffer, setShowOffer] = useState(false);
  const [showTrialReminder, setShowTrialReminder] = useState(false);

  useEffect(() => {
    const profile = getStoredStudent();
    if (!profile) return;
    setStudent(profile);

    const trialEndMs = profile.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : null;
    const expired = profile.subscription_status === "expired"
      || profile.has_content_access === false
      || (profile.subscription_status !== "active" && trialEndMs !== null && trialEndMs <= Date.now());
    if (expired) setShowOffer(true);

    const loginReminderKey = `${LOGIN_REMINDER_KEY}:${profile.id}`;
    if (!expired && profile.subscription_status === "trial" && !sessionStorage.getItem(loginReminderKey)) {
      sessionStorage.setItem(loginReminderKey, "1");
      setShowTrialReminder(true);
      const reminderTimer = window.setTimeout(() => setShowTrialReminder(false), 8000);
      return () => window.clearTimeout(reminderTimer);
    }
  }, []);

  useEffect(() => {
    if (!student || student.subscription_status === "active") return;
    const now = Date.now();
    const storedNext = Number(sessionStorage.getItem(NEXT_OFFER_KEY));
    const nextAt = Number.isFinite(storedNext) && storedNext > now ? storedNext : now + OFFER_INTERVAL_MS;
    sessionStorage.setItem(NEXT_OFFER_KEY, String(nextAt));

    const timeout = window.setTimeout(() => {
      setShowOffer(true);
      sessionStorage.setItem(NEXT_OFFER_KEY, String(Date.now() + OFFER_INTERVAL_MS));
    }, Math.max(0, nextAt - now));
    return () => window.clearTimeout(timeout);
  }, [student]);

  if (!student) return null;

  return (
    <>
      {showTrialReminder && (
        <div role="status" className="fixed right-3 top-3 z-[70] max-w-sm rounded-xl border border-cyan-200/20 bg-[#101820]/95 p-4 text-zinc-100 shadow-2xl shadow-black/50 backdrop-blur-xl sm:right-5 sm:top-5">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-300 text-sm font-black text-[#071016]">7d</span>
            <div>
              <p className="text-sm font-black">Free trial active</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                {student.trial_days_remaining ?? 7} day{student.trial_days_remaining === 1 ? "" : "s"} remaining with full question and breakdown access.
              </p>
            </div>
            <button onClick={() => setShowTrialReminder(false)} className="rounded p-1 text-zinc-500 hover:bg-white/10 hover:text-white" aria-label="Dismiss trial reminder">×</button>
          </div>
        </div>
      )}

      {showOffer && (
        <div role="dialog" aria-modal="true" aria-label="Membership offer" className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setShowOffer(false)}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/30 text-lg text-zinc-300 hover:bg-white/10 hover:text-white"
              aria-label="Close membership offer"
            >
              ×
            </button>
            <OfferCard student={student} actionHref="/profile#membership" />
          </div>
        </div>
      )}
    </>
  );
}
