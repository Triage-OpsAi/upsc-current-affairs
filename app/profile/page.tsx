"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "../components/MobileNav";
import { AppLoader, InlineSpinner } from "../components/AppLoader";
import { OfferCard } from "../components/OfferCard";
import { SiteFooter } from "../components/SiteFooter";
import { api } from "../../lib/api";
import { AVATAR_OPTIONS, selectedAvatarUrl } from "../../lib/avatars";
import {
  StudentProfile,
  clearAuthSession,
  getAuthToken,
  getStoredStudent,
  updateStoredStudent,
} from "../../lib/student";

export default function ProfilePage() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState({ name: "", target_exam: "UPSC Prelims", city: "", bio: "", avatar_url: "" });
  const [status, setStatus] = useState("Loading profile...");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const cached = getStoredStudent();
    if (!token || !cached) {
      setStatus("Please sign in again from the home screen.");
      return;
    }
    setStudent(cached);
    setForm({
      name: cached.name || "",
      target_exam: cached.target_exam || "UPSC Prelims",
      city: cached.city || "",
      bio: cached.bio || "",
      avatar_url: selectedAvatarUrl(cached.avatar_url),
    });
    api
      .me()
      .then((fresh) => {
        updateStoredStudent(fresh);
        setStudent(fresh);
        setForm({
          name: fresh.name || "",
          target_exam: fresh.target_exam || "UPSC Prelims",
          city: fresh.city || "",
          bio: fresh.bio || "",
          avatar_url: selectedAvatarUrl(fresh.avatar_url),
        });
        setStatus("");
      })
      .catch((error: any) => setStatus(error.message || "Could not load profile"));
  }, []);

  async function saveProfile() {
    setSaving(true);
    setStatus("");
    try {
      const updated = await api.updateProfile(form);
      updateStoredStudent(updated);
      setStudent(updated);
      setStatus("Profile updated.");
    } catch (error: any) {
      setStatus(error.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      // Session may already be expired locally.
    }
    clearAuthSession();
    window.location.href = "/";
  }

  if (!student && status.startsWith("Loading")) {
    return <main className="grid min-h-screen place-items-center bg-[#08090d] p-4"><AppLoader label="Preparing your profile" /></main>;
  }

  return (
    <main className="scroll-invisible min-h-screen bg-[#08090d] p-3 pb-24 text-zinc-100 sm:p-4 sm:pb-24 xl:h-screen xl:overflow-y-auto xl:pb-4">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[10px] border border-white/[.08] bg-[#0d0f15] shadow-2xl shadow-black/30">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] bg-[#10131a] px-4 py-5 sm:px-6">
          <div>
            <Link href="/" className="text-xs font-bold text-cyan-200">← Back to dashboard</Link>
            <p className="mt-4 text-xs font-semibold uppercase text-cyan-300">Identity and security</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Profile &amp; account security</h1>
          </div>
          <button onClick={logout} className="ghost-button">
            Log out
          </button>
        </header>

        <div id="membership" className="p-4 pb-0 sm:p-6 sm:pb-0">
          <OfferCard student={student} showAction={false} />
        </div>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[320px_1fr]">
          <aside className="panel p-5">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-2xl font-black text-cyan-100">
              {form.avatar_url ? (
                <Image src={form.avatar_url} alt="Selected profile avatar" width={80} height={80} className="h-full w-full object-cover" priority />
              ) : (
                (form.name || student?.email || "A")[0]?.toUpperCase()
              )}
            </div>
            <h2 className="mt-4 text-xl font-black">{student?.name || "Aspirant"}</h2>
            <p className="mt-1 text-sm text-[#6b7280]">{student?.email}</p>
            {student?.device_warning && (
              <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/[.07] p-3 text-xs font-semibold leading-5 text-amber-100">
                {student.device_warning}
              </div>
            )}
            <div className="mt-5 space-y-3 text-sm">
              <SecurityRow label="Session duration" value="30 days" />
              <SecurityRow
                label="Recent devices"
                value={`${student?.recent_device_count ?? "-"} / ${student?.device_limit ?? 2}`}
              />
              <SecurityRow label="Email per device" value="1 allowed" />
              <SecurityRow label="Device limit" value={`${student?.device_limit ?? 2} / 30 days`} />
              <SecurityRow label="Suspension window" value="3 days" />
            </div>
          </aside>

          <section className="panel p-5">
            <h2 className="text-sm font-black">Profile Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="input" />
              </Field>
              <Field label="Target exam">
                <select value={form.target_exam} onChange={(event) => setForm({ ...form, target_exam: event.target.value })} className="input">
                  <option>UPSC Prelims</option>
                  <option>UPSC Mains</option>
                  <option>SSC CGL</option>
                  <option>State PSC</option>
                  <option>Banking</option>
                </select>
              </Field>
              <Field label="City">
                <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="input" />
              </Field>
              <Field label="Profile picture">
                <select value={form.avatar_url} onChange={(event) => setForm({ ...form, avatar_url: event.target.value })} className="input">
                  {AVATAR_OPTIONS.map((option) => (
                    <option key={option.value || "initials"} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Study focus">
                  <textarea
                    value={form.bio}
                    onChange={(event) => setForm({ ...form, bio: event.target.value })}
                    className="input min-h-28 resize-none"
                    placeholder="Optional note about your exam plan, weak areas, or study schedule."
                  />
                </Field>
              </div>
            </div>
            {status && <p className="mt-4 rounded-lg border border-cyan-300/15 bg-cyan-300/[.06] px-3 py-2 text-sm font-semibold text-cyan-100">{status}</p>}
            <button
              onClick={saveProfile}
              disabled={saving}
              className="primary-button mt-5 disabled:opacity-50"
            >
              {saving ? <InlineSpinner label="Saving profile" /> : "Save profile"}
            </button>
          </section>
        </div>
      </section>
      <div className="mx-auto max-w-5xl"><SiteFooter compact /></div>
      <MobileNav active="settings" />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wide text-[#6b7280]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function SecurityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[.06] bg-white/[.035] px-3 py-2">
      <span className="text-[#6b7280]">{label}</span>
      <span className="shrink-0 text-right font-black text-[#18181b]">{value}</span>
    </div>
  );
}
