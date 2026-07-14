"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, SubjectSummary } from "../../lib/api";
import { AppLoader } from "../components/AppLoader";
import { ContentTabs } from "../components/ContentTabs";
import { MobileNav } from "../components/MobileNav";
import { SiteFooter } from "../components/SiteFooter";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [status, setStatus] = useState("Loading subjects...");

  useEffect(() => {
    let active = true;
    api.listSubjects()
      .then((items) => {
        if (!active) return;
        setSubjects(items);
        setStatus(items.length ? "" : "No subjects are configured yet.");
      })
      .catch((error: any) => {
        if (active) setStatus(error.message || "Could not load subjects.");
      });
    return () => { active = false; };
  }, []);

  const hiddenCount = subjects.filter((subject) => !subject.visible).length;

  return (
    <main className="min-h-screen bg-[#08090d] p-3 pb-24 text-zinc-100 sm:p-5">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[10px] border border-white/[.08] bg-[#0d0f15] shadow-2xl shadow-black/30">
        <header className="border-b border-white/[.07] bg-[#10131a] px-4 py-6 sm:px-7">
          <Link href="/" className="text-xs font-bold text-cyan-200">← Back to dashboard</Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-cyan-300">Static syllabus</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Subjects</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Chapter-based questions built around exact articles, amendments, dates, classifications, and cases.
          </p>
        </header>
        <div className="space-y-6 p-4 sm:p-7">
          <ContentTabs active="subjects" />
          {status === "Loading subjects..." ? <AppLoader label="Loading subjects" compact /> : null}
          {status && status !== "Loading subjects..." ? (
            <div className="panel p-5 text-sm font-semibold text-zinc-400">{status}</div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => {
              const href = subject.key === "current_affairs" ? "/" : `/subjects/${subject.key}`;
              if (!subject.visible) {
                return (
                  <div key={subject.key} aria-disabled="true" className="rounded-[10px] border border-white/[.06] bg-white/[.025] p-5 opacity-55">
                    <span className="text-[10px] font-black uppercase tracking-[.16em] text-zinc-600">Locked</span>
                    <h2 className="mt-3 text-lg font-semibold text-zinc-400">{subject.name}</h2>
                    <p className="mt-2 text-sm text-zinc-600">Content is being prepared.</p>
                  </div>
                );
              }
              return (
                <Link key={subject.key} href={href} className="group rounded-[10px] border border-cyan-300/15 bg-cyan-300/[.055] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-cyan-300/[.09]">
                  <span className="text-[10px] font-black uppercase tracking-[.16em] text-cyan-300">Available</span>
                  <h2 className="mt-3 text-lg font-semibold text-white">{subject.name}</h2>
                  <p className="mt-2 text-sm text-zinc-400">Open practice <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span></p>
                </Link>
              );
            })}
          </div>
          {hiddenCount > 0 && (
            <p className="rounded-lg border border-white/[.06] bg-white/[.025] px-4 py-3 text-center text-sm font-semibold text-zinc-500">
              Other subjects loading soon
            </p>
          )}
        </div>
      </section>
      <div className="mx-auto max-w-6xl"><SiteFooter compact /></div>
      <MobileNav active="subjects" />
    </main>
  );
}
