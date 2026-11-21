"use client";

import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, EXAMS, type ExamCategory } from "@/lib/studio/exams";
import { PaperBackdrop } from "./chrome";

export function ExamLibrary() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<ExamCategory | "All">("All");
  const q = query.trim().toLowerCase();
  const list = EXAMS.filter(
    (e) =>
      (cat === "All" || e.category === cat) &&
      (!q || [e.name, e.native, e.about, e.region].some((s) => s?.toLowerCase().includes(q))),
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="relative min-h-dvh overflow-hidden px-3 py-5 sm:px-6">
      <PaperBackdrop />
      <div className="paper-card relative mx-auto max-w-5xl p-5 sm:p-7">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl hover:text-rose">
          <ArrowLeft className="size-4" /> Exam Library
        </Link>
        <p className="mt-0.5 pl-6 font-sans text-[11px] text-sumi-soft">
          Standardized, school and professional exams from around the world · {EXAMS.length} exams
        </p>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sumi-soft" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, region or subject" className="paper-field pl-9! font-sans text-sm!" aria-label="Search exams" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 font-sans text-[11px]">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-[2px] border px-2.5 py-1 transition ${cat === c ? "border-rose bg-rose/10 text-rose" : "border-sepia bg-white/70 text-sumi-soft hover:text-sumi"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <article key={e.id} className="flex flex-col rounded-[3px] border border-sepia/80 bg-white/70 p-3 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg leading-tight">{e.name}</h2>
                <span className="shrink-0 text-[11px] tracking-tighter text-rose" title={`Difficulty ${e.level}/5`}>
                  {"★".repeat(e.level)}
                  <span className="text-sepia">{"★".repeat(5 - e.level)}</span>
                </span>
              </div>
              {e.native && <p className="font-jp text-[11px] text-sumi-soft">{e.native}</p>}
              <p className="mt-1 line-clamp-2 flex-1 font-sans text-xs leading-snug text-sumi-soft">{e.about}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[9px] tracking-wider text-sumi-soft uppercase">
                <span>{e.category}</span>
                <span className="text-sepia">|</span>
                <span className="normal-case tracking-normal">{e.region}</span>
                <span className="text-sepia">|</span>
                <span className="normal-case tracking-normal">{e.format}</span>
                {e.drill && (
                  <Link href={`/exams/drill?exam=${e.id}`} className="ml-auto rounded-[2px] bg-navy px-2 py-0.5 tracking-normal text-white normal-case hover:brightness-125">
                    Practice
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        {list.length === 0 && <p className="mt-6 text-center text-sumi-soft">No exams match “{query}”.</p>}
      </div>
      <p className="relative mt-4 text-center font-jp text-sm">世界各地の試験から選ぶ</p>
      <p className="relative text-center font-sans text-xs text-sumi-soft">Browse exams from around the world.</p>
    </div>
  );
}
