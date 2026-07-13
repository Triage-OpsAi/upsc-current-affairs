"use client";

import Link from "next/link";
import { StudentProfile } from "../../lib/student";

export function OfferCard({
  student = null,
  spotsRemaining = null,
  compact = false,
  actionHref = "#signin",
  showAction = true,
}: {
  student?: StudentProfile | null;
  spotsRemaining?: number | null;
  compact?: boolean;
  actionHref?: string;
  showAction?: boolean;
}) {
  const eligible = student?.early_offer_eligible ?? (spotsRemaining === null || spotsRemaining > 0);
  const trialEndMs = student?.trial_ends_at ? new Date(student.trial_ends_at).getTime() : null;
  const locallyExpired = student?.subscription_status !== "active" && trialEndMs !== null && trialEndMs <= Date.now();
  const trialActive = student?.subscription_status === "trial" && !locallyExpired;
  const active = student?.subscription_status === "active";
  const expired = locallyExpired || student?.subscription_status === "expired" || student?.has_content_access === false;
  const remaining = trialEndMs && !expired
    ? Math.max(1, Math.ceil((trialEndMs - Date.now()) / 86400000))
    : (student?.trial_days_remaining ?? 7);

  return (
    <section className={`offer-card relative overflow-hidden rounded-[16px] border border-cyan-200/20 bg-[#0d131a] ${compact ? "p-4" : "p-5 sm:p-7"}`}>
      <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-cyan-300/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 size-44 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className={`relative grid items-center ${compact ? "gap-4 md:grid-cols-[1fr_auto]" : "gap-6 lg:grid-cols-[1fr_auto]"}`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-200/25 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-200">
              Founding 500 offer
            </span>
            {student?.early_offer_number && student.early_offer_number <= 500 && (
              <span className="text-xs font-bold text-cyan-200">Your founder spot: #{student.early_offer_number}</span>
            )}
            {!student && spotsRemaining !== null && spotsRemaining > 0 && (
              <span className="text-xs font-bold text-zinc-400">{spotsRemaining} spots remaining</span>
            )}
          </div>
          <h2 className={`${compact ? "mt-3 text-xl" : "mt-4 text-2xl sm:text-3xl"} font-semibold text-white`}>
            {active ? "Your full access is active." : expired ? "Keep your preparation moving." : trialActive ? `${remaining} trial day${remaining === 1 ? "" : "s"} remaining.` : "Study free for 7 days."}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Full access to every precision question, guided breakdown, archive, and performance report during your trial.
          </p>
        </div>

        <div className="flex min-w-[250px] flex-col gap-3 rounded-xl border border-white/[.08] bg-white/[.04] p-4">
          <div className="flex items-end gap-2">
            {eligible && <del className="pb-1 text-base font-bold text-zinc-500">₹299</del>}
            <strong className="text-4xl font-semibold tracking-tight text-white">₹{eligible ? 99 : 299}</strong>
            <span className="pb-1 text-xs font-bold text-zinc-400">/ month</span>
          </div>
          <p className="text-xs font-semibold text-emerald-200">
            {eligible ? "₹99/month locked for life for early members" : "Standard monthly access"}
          </p>
          {!active && showAction && (
            <Link href={actionHref} className="group inline-flex min-h-11 items-center justify-between rounded-lg bg-cyan-300 px-4 py-2 text-sm font-black text-[#071016] transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100">
              <span>{student ? (expired ? "View membership offer" : "Keep my founder price") : "Start 7 days free"}</span>
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
          )}
          {!active && !showAction && eligible && (
            <p className="rounded-lg border border-cyan-200/15 bg-cyan-300/[.07] px-3 py-2 text-center text-xs font-black text-cyan-100">
              Founder price reserved for this account
            </p>
          )}
          <p className="text-[11px] leading-5 text-zinc-500">No question access after the trial unless a plan is activated.</p>
        </div>
      </div>
    </section>
  );
}
