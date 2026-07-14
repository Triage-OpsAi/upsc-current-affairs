"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, SubjectChapter } from "../../../lib/api";
import { AppLoader } from "../../components/AppLoader";
import { ContentTabs } from "../../components/ContentTabs";
import { MobileNav } from "../../components/MobileNav";
import { SiteFooter } from "../../components/SiteFooter";

function displayName(key: string) {
  return key.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export default function SubjectChaptersPage({ params }: { params: { subjectKey: string } }) {
  const [chapters, setChapters] = useState<SubjectChapter[]>([]);
  const [status, setStatus] = useState("Loading chapters...");

  useEffect(() => {
    let active = true;
    api.listChapters(params.subjectKey)
      .then((items) => {
        if (!active) return;
        setChapters(items);
        setStatus(items.length ? "" : "No chapters are available yet.");
      })
      .catch((error: any) => {
        if (active) setStatus(error.message || "Could not load chapters.");
      });
    return () => { active = false; };
  }, [params.subjectKey]);

  return (
    <main className="min-h-screen bg-[#08090d] p-3 pb-24 text-zinc-100 sm:p-5">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[10px] border border-white/[.08] bg-[#0d0f15]">
        <header className="border-b border-white/[.07] bg-[#10131a] px-4 py-6 sm:px-7">
          <Link href="/subjects" className="text-xs font-bold text-cyan-200">← All subjects</Link>
          <p className="mt-5 text-xs font-semibold uppercase text-cyan-300">Static syllabus</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{displayName(params.subjectKey)}</h1>
          <p className="mt-2 text-sm text-zinc-500">Choose a chapter to begin precision-level practice.</p>
        </header>
        <div className="space-y-5 p-4 sm:p-7">
          <ContentTabs active="subjects" />
          {status === "Loading chapters..." ? <AppLoader label="Loading chapters" compact /> : null}
          {status && status !== "Loading chapters..." ? <div className="panel p-5 text-sm font-semibold text-zinc-400">{status}</div> : null}
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <Link key={chapter.id} href={`/subjects/${params.subjectKey}/${chapter.id}`} className="group flex items-center gap-4 rounded-[10px] border border-white/[.08] bg-[#10131a] p-5 transition hover:border-cyan-300/25 hover:bg-white/[.05]">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-sm font-black text-cyan-100">{chapter.chapter_order}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white">{chapter.name}</h2>
                  <p className="mt-1 text-xs font-bold text-zinc-500">{chapter.question_count} questions</p>
                </div>
                <span className="text-xl text-cyan-200 transition group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-5xl"><SiteFooter compact /></div>
      <MobileNav active="subjects" />
    </main>
  );
}
