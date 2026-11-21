"use client";

import { ArrowLeft, Bookmark, Check, ChevronLeft, ChevronRight, Clock, Volume2, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { TutorAvatar } from "@/components/app/tutor-avatar";
import { CAST, getCast } from "@/lib/studio/cast";
import { BANKS, type DrillBank, type DrillQuestion } from "@/lib/studio/drill-bank";
import { EXAMS } from "@/lib/studio/exams";
import { speak, stopSpeaking } from "@/lib/studio/speech";
import type { TutorId } from "@/lib/tutors";

const DRILLABLE = EXAMS.filter((e) => e.drill);

type Config = { examId: string; bankId: string; count: number; difficulty: number; helper: boolean; helperId: TutorId };

export function ExamDrill() {
  const params = useSearchParams();
  const initialExam = DRILLABLE.find((e) => e.id === params.get("exam")) ?? DRILLABLE.find((e) => e.id === "sat")!;
  const [config, setConfig] = useState<Config | null>(null);
  const [runKey, setRunKey] = useState(0);

  if (!config) return <Setup initialExamId={initialExam.id} onStart={(c) => setConfig(c)} />;
  return <Runner key={runKey} config={config} onExit={() => setConfig(null)} onRetry={() => setRunKey((k) => k + 1)} />;
}

/* -------------------------------------------------------------------- setup */

function banksFor(examId: string): DrillBank[] {
  const e = EXAMS.find((x) => x.id === examId);
  if (!e?.drill) return [];
  if (e.drill === "sat") return [BANKS.sat, BANKS.math];
  return [BANKS[e.drill]];
}

function Setup({ initialExamId, onStart }: { initialExamId: string; onStart: (c: Config) => void }) {
  const [examId, setExamId] = useState(initialExamId);
  const banks = banksFor(examId);
  const [bankId, setBankId] = useState(banks[0]?.id ?? "math");
  const bank = banks.find((b) => b.id === bankId) ?? banks[0];
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState(3);
  const [helper, setHelper] = useState(true);
  const [helperId, setHelperId] = useState<TutorId>("nino");
  const exam = EXAMS.find((e) => e.id === examId)!;
  const n = Math.min(count, bank.questions.length);

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#1f2d47_0,#1f2d47_220px,#e9e6e1_220px)] px-3 py-6 font-sans">
      <div className="mx-auto max-w-3xl">
        <Link href="/exams" className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white">
          <ArrowLeft className="size-3.5" /> Exam Library
        </Link>
        <h1 className="mt-2 font-display text-3xl text-white">Exam Drill</h1>
        <p className="text-xs text-white/60">Practice under real exam conditions, with a tutor ready to explain every mistake.</p>

        <div className="mt-6 rounded-md bg-white p-5 text-[#1f2d47] shadow-xl">
          <h2 className="text-base font-semibold">Set up a drill</h2>
          <p className="text-xs text-slate-500">Every drill is written to the real specification of the section you choose, so you only ever practice what the exam actually tests.</p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field n={1} label="Exam">
              <select
                value={examId}
                onChange={(e) => {
                  setExamId(e.target.value);
                  setBankId(banksFor(e.target.value)[0].id);
                }}
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              >
                {DRILLABLE.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-slate-500">{exam.about}</p>
            </Field>
            <Field n={2} label="Section">
              <div className="space-y-1.5">
                {banks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBankId(b.id)}
                    className={`block w-full rounded border px-2.5 py-1.5 text-left text-xs ${b.id === bank.id ? "border-[#3a6fb5] bg-[#eef4fc]" : "border-slate-200"}`}
                  >
                    <span className="font-medium">{b.label}</span>
                    <span className="block text-[10px] text-slate-500">
                      {b.questions.length} questions · ~{Math.round(b.questions.length * b.minutesPer)} min
                    </span>
                  </button>
                ))}
              </div>
            </Field>
            <Field n={3} label="Questions">
              <div className="flex gap-1.5">
                {[3, 5, 10].map((c) => (
                  <button key={c} type="button" onClick={() => setCount(c)} className={`rounded border px-3 py-1 text-xs ${count === c ? "border-[#3a6fb5] bg-[#eef4fc]" : "border-slate-200"}`}>
                    {c}
                  </button>
                ))}
                <button type="button" onClick={() => setCount(99)} className={`rounded border px-3 py-1 text-xs ${count === 99 ? "border-[#3a6fb5] bg-[#eef4fc]" : "border-slate-200"}`}>
                  Full section drill
                </button>
              </div>
            </Field>
            <Field n={4} label="Difficulty">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((d) => (
                  <button key={d} type="button" onClick={() => setDifficulty(d)} className={`size-7 rounded border text-xs ${difficulty === d ? "border-[#3a6fb5] bg-[#eef4fc]" : "border-slate-200"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-5 rounded border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold">5 · Helper mode</p>
              <button
                type="button"
                role="switch"
                aria-checked={helper}
                onClick={() => setHelper((h) => !h)}
                className={`relative h-5 w-9 rounded-full ${helper ? "bg-[#e0475f]" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${helper ? "left-4.5" : "left-0.5"}`} />
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Your guide steps in the moment you choose a wrong answer, with the correction, the reasoning and her voice.</p>
            {helper && (
              <div className="mt-2 flex gap-1.5">
                {CAST.map((c) => (
                  <button
                    key={c.tutor.id}
                    type="button"
                    onClick={() => setHelperId(c.tutor.id)}
                    className={`rounded-full border-2 p-0.5 ${helperId === c.tutor.id ? "" : "border-transparent opacity-60"}`}
                    style={{ borderColor: helperId === c.tutor.id ? c.hue : undefined }}
                    title={c.tutor.name}
                  >
                    <TutorAvatar tutor={c.tutor} size={28} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            {n} questions · {Math.max(1, Math.round(n * bank.minutesPer))} minutes of exam time · {exam.name} — {bank.label}
          </p>
          <button
            type="button"
            onClick={() => onStart({ examId, bankId: bank.id, count: n, difficulty, helper, helperId })}
            className="mt-3 rounded bg-[#3a6fb5] px-5 py-2 text-sm font-medium text-white hover:bg-[#335f9c]"
          >
            Start drill
          </button>
        </div>
        <p className="mt-6 text-center font-jp text-sm text-[#1f2d47]">試験形式の問題に挑戦</p>
        <p className="text-center text-xs text-slate-500">Practice with exam-style questions.</p>
      </div>
    </div>
  );
}

function Field({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        {n} · {label}
      </p>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- runner */

type Answer = number[];

function Runner({ config, onExit, onRetry }: { config: Config; onExit: () => void; onRetry: () => void }) {
  const exam = EXAMS.find((e) => e.id === config.examId)!;
  const bank = BANKS[config.bankId];
  const questions = bank.questions.slice(0, config.count);
  const helper = getCast(config.helperId);

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [help, setHelp] = useState<DrillQuestion | null>(null);
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.max(60, Math.round(questions.length * bank.minutesPer * 60)));
  const [showDirections, setShowDirections] = useState(false);

  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => setSecondsLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [finished]);
  if (secondsLeft === 0 && !finished) setFinished(true);

  useLayoutEffect(() => () => stopSpeaking(), []);

  const q = questions[i];
  const chosen = answers[q.id] ?? [];
  const isRight = (qq: DrillQuestion) => {
    const a = [...(answers[qq.id] ?? [])].sort().join(",");
    return a === [...qq.answer].sort().join(",");
  };

  function choose(k: number) {
    const next = q.multi ? (chosen.includes(k) ? chosen.filter((x) => x !== k) : [...chosen, k]) : [k];
    setAnswers((a) => ({ ...a, [q.id]: next }));
    if (config.helper && !q.multi && !q.answer.includes(k)) setHelp(q);
  }

  function goNext() {
    if (config.helper && q.multi && chosen.length && !isRight(q)) {
      setHelp(q);
      return;
    }
    if (i + 1 < questions.length) setI(i + 1);
    else setFinished(true);
  }

  const answered = questions.filter((x) => (answers[x.id] ?? []).length > 0).length;
  const time = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  if (finished) {
    const score = questions.filter(isRight).length;
    return (
      <div className="min-h-dvh bg-[#eceae6] px-3 py-8 font-sans text-[#1f2d47]">
        <div className="mx-auto max-w-2xl rounded-md bg-white p-6 shadow">
          <h1 className="font-display text-3xl">Drill complete</h1>
          <p className="text-sm text-slate-500">
            {exam.name} · {bank.label}
          </p>
          <p className="mt-4 text-4xl font-semibold">
            {score} / {questions.length}
          </p>
          <ul className="mt-5 space-y-3">
            {questions.map((qq, k) => (
              <li key={qq.id} className="rounded border border-slate-200 p-3 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  {isRight(qq) ? <Check className="size-4 text-green-600" /> : <X className="size-4 text-red-600" />}
                  {k + 1}. <span className="line-clamp-1 whitespace-pre-line">{qq.prompt}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">Correct: {qq.answer.map((a) => qq.options[a]).join(" · ")}</p>
                {!isRight(qq) && <p className="mt-1 text-xs">{qq.explain}</p>}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={onRetry} className="rounded bg-[#3a6fb5] px-4 py-2 text-sm text-white">
              Try again
            </button>
            <button type="button" onClick={onExit} className="rounded border border-slate-300 px-4 py-2 text-sm">
              New drill
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#eceae6] font-sans text-[#1f2d47]">
      <header className="grid grid-cols-3 items-center bg-navy px-4 py-2 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{exam.name}</p>
          <p className="truncate text-[10px] text-white/60">{bank.label}</p>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-sm tabular-nums">
          <Clock className="size-3.5" /> {time}
        </p>
        <div className="flex items-center justify-end gap-3 text-xs">
          <span>
            Question {i + 1} of {questions.length}
          </span>
          <button type="button" onClick={() => setFinished(true)} className="rounded border border-white/30 px-2 py-0.5 hover:bg-white/10">
            Exit ✕
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 md:flex-row">
        <main className="flex-1 rounded-md bg-white p-5 shadow-sm">
          <button type="button" onClick={() => setShowDirections((d) => !d)} className="text-[11px] text-[#3a6fb5]">
            {showDirections ? "▾" : "▸"} Directions
          </button>
          {showDirections && (
            <p className="mt-1 rounded bg-slate-50 p-2 text-xs text-slate-600">
              Choose the best answer. {q.multi ? "This question may have more than one correct answer — select all that apply." : ""} You can move between questions and mark any to review later.
            </p>
          )}
          {q.passage && (
            <div className="mt-3 border-l-2 border-slate-200 pl-3">
              <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Read the passage</p>
              <p className="mt-1 text-sm leading-relaxed">{q.passage}</p>
            </div>
          )}
          <div className="mt-4 flex items-start justify-between gap-3">
            <p className="flex items-start gap-2 text-sm font-medium whitespace-pre-line">
              <span className="mt-0.5 inline-block size-3.5 shrink-0 bg-navy" />
              {q.prompt}
            </p>
            <button
              type="button"
              onClick={() => setMarked((m) => ({ ...m, [q.id]: !m[q.id] }))}
              className={`flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-[11px] ${marked[q.id] ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-300 text-slate-600"}`}
            >
              <Bookmark className="size-3" /> Mark for review
            </button>
          </div>
          {q.multi && <p className="mt-1 pl-5 text-[11px] text-slate-500">Select all that apply</p>}
          {q.figure === "triangle" && <TriangleFigure />}
          <div className="mt-4 space-y-2">
            {q.options.map((o, k) => {
              const on = chosen.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => choose(k)}
                  className={`flex w-full items-center gap-3 rounded border px-3 py-2 text-left text-sm transition ${on ? "border-[#3a6fb5] bg-[#eef4fc]" : "border-slate-200 hover:border-slate-400"}`}
                >
                  <span className={`flex size-5 shrink-0 items-center justify-center ${q.multi ? "rounded" : "rounded-full"} border text-[10px] ${on ? "border-[#3a6fb5] bg-[#3a6fb5] text-white" : "border-slate-400"}`}>
                    {on ? <Check className="size-3" /> : String.fromCharCode(65 + k)}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-between">
            <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="flex items-center gap-1 rounded border border-slate-300 px-3 py-1 text-xs disabled:opacity-40">
              <ChevronLeft className="size-3.5" /> Back
            </button>
            <button type="button" onClick={goNext} className="flex items-center gap-1 rounded bg-[#3a6fb5] px-4 py-1 text-xs text-white">
              {i + 1 < questions.length ? "Next" : "Finish"} <ChevronRight className="size-3.5" />
            </button>
          </div>
        </main>

        <aside className="h-fit w-full rounded-md bg-white p-4 shadow-sm md:w-56">
          <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Questions</p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {questions.map((qq, k) => {
              const done = (answers[qq.id] ?? []).length > 0;
              return (
                <button
                  key={qq.id}
                  type="button"
                  onClick={() => setI(k)}
                  className={`relative size-7 rounded text-xs ${k === i ? "ring-2 ring-[#3a6fb5]" : ""} ${done ? "bg-[#3a6fb5] text-white" : "border border-slate-300"}`}
                >
                  {k + 1}
                  {marked[qq.id] && <span className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-400" />}
                </button>
              );
            })}
          </div>
          <ul className="mt-3 space-y-1 text-[10px] text-slate-500">
            <li className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-[#3a6fb5]" /> Answered
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm border border-slate-400" /> Not answered
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400" /> Marked for review
            </li>
          </ul>
          <p className="mt-3 text-[11px] text-slate-600">
            {answered} answered · {questions.length - answered} left
          </p>
        </aside>
      </div>

      {help && <HelperDialog q={help} chosen={answers[help.id] ?? []} helperId={helper.tutor.id} index={questions.indexOf(help)} onClose={() => setHelp(null)} />}
    </div>
  );
}

const OPENERS: Record<TutorId, string> = {
  ichika: "Ah, close one. Let's look at it together, no rush.",
  nino: "Wrong. …Don't make that face — I'll show you exactly where it slipped.",
  miku: "…Hm. That one's a trap. Let me explain.",
  yotsuba: "Oops! That's okay — mistakes are how we learn! Here's the trick:",
  itsuki: "Not quite. Let's go through it properly, step by step.",
};

function HelperDialog({ q, chosen, helperId, index, onClose }: { q: DrillQuestion; chosen: number[]; helperId: TutorId; index: number; onClose: () => void }) {
  const m = getCast(helperId);
  const opener = OPENERS[helperId];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2d47]/50 p-4" onClick={onClose}>
      <div className="fade-up w-full max-w-md rounded-md bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <TutorAvatar tutor={m.tutor} size={40} />
          <div className="flex-1">
            <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: m.tutor.color }}>
              {m.tutor.name} · Helper
            </p>
            <p className="text-xs text-slate-500">Question {index + 1}</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="text-slate-400">
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-3 text-xs">
          <span className="font-semibold tracking-wider text-slate-500 uppercase">You picked </span>
          <span className="text-red-600">{chosen.map((c) => q.options[c]).join(" · ") || "—"}</span>
        </p>
        <p className="mt-1 text-xs">
          <span className="font-semibold tracking-wider text-slate-500 uppercase">Correct </span>
          <span className="text-green-700">{q.answer.map((c) => q.options[c]).join(" · ")}</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          {opener} <b>The answer is {q.answer.map((c) => q.options[c]).join(", ")}.</b> {q.explain}
        </p>
        <div className="mt-4 flex justify-between">
          <button type="button" onClick={() => void speak(`${opener} ${q.explain}`, { pitch: m.pitch, force: true })} className="flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1 text-xs">
            <Volume2 className="size-3.5" /> Listen
          </button>
          <button type="button" onClick={onClose} className="rounded bg-[#3a6fb5] px-4 py-1 text-xs text-white">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function TriangleFigure() {
  return (
    <svg viewBox="0 0 260 130" className="mt-3 ml-5 w-64" role="img" aria-label="Triangle ABC with AB = 7, BC = 6, CA = 5">
      <polygon points="20,115 240,115 120,15" fill="none" stroke="#1f2d47" strokeWidth="1.5" />
      <text x="8" y="125" fontSize="11">A</text>
      <text x="244" y="125" fontSize="11">B</text>
      <text x="116" y="11" fontSize="11">C</text>
      <text x="124" y="128" fontSize="10">7 cm</text>
      <text x="186" y="62" fontSize="10">6 cm</text>
      <text x="40" y="62" fontSize="10">5 cm</text>
    </svg>
  );
}
