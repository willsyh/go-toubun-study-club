"use client";

import { ArrowLeft, Flame, Heart, Keyboard, Sparkles, Volume2, X } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useMemo, useState } from "react";
import { PortraitView } from "@/components/app/tutor-avatar";
import { setPref, usePref } from "@/lib/prefs";
import { getCast } from "@/lib/studio/cast";
import { COURSES, NINO_PRAISE, NINO_SCOLD, type LangItem } from "@/lib/studio/language-bank";
import { speak, stopSpeaking } from "@/lib/studio/speech";
import { PaperBackdrop } from "./chrome";
import { useOpenSettings } from "./settings-dialog";

const ROUND = 5;
const nino = getCast("nino");

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "answer" | "right" | "wrong" | "done";

export function LanguageView() {
  const courseId = usePref<string>("gt:lang-course", "ja");
  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
  const xpTotal = Number(usePref<string>("gt:lang-xp", "0")) || 0;
  const streak = Number(usePref<string>("gt:lang-streak", "0")) || 0;
  const openSettings = useOpenSettings();

  const [round, setRound] = useState(1);
  const items = useMemo(() => shuffle(course.items, round * 7919 + course.id.length).slice(0, ROUND), [course, round]);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [keyboard, setKeyboard] = useState(false);
  const [phase, setPhase] = useState<Phase>("answer");
  const [hearts, setHearts] = useState(5);
  const [xp, setXp] = useState(0);
  const [line, setLine] = useState({ en: "Pick the right translation. I'll be watching.", ja: "正しい訳を選んで。見てるからね。" });
  const [why, setWhy] = useState(false);

  useLayoutEffect(() => () => stopSpeaking(), []);

  const item: LangItem | undefined = items[step];
  const options = useMemo(() => (item ? shuffle(item.options, step * 31 + round) : []), [item, step, round]);

  function nino_say(l: { en: string; ja: string }) {
    setLine(l);
    void speak(l.en, { pitch: nino.pitch });
  }

  function check() {
    if (!item) return;
    const answer = keyboard ? typed.trim() : picked;
    if (!answer) return;
    const ok = answer.replace(/[。.!！\s]/g, "").toLowerCase() === item.answer.replace(/[。.!！\s]/g, "").toLowerCase();
    if (ok) {
      setPhase("right");
      setXp((x) => x + 10);
      nino_say(NINO_PRAISE[step % NINO_PRAISE.length]);
      void speak(item.answer, { lang: course.speechLang });
    } else {
      setPhase("wrong");
      setHearts((h) => Math.max(0, h - 1));
      nino_say(NINO_SCOLD[step % NINO_SCOLD.length]);
    }
  }

  function next() {
    setPicked(null);
    setTyped("");
    setWhy(false);
    if (step + 1 >= items.length || hearts === 0) {
      setPhase("done");
      setPref("gt:lang-xp", String(xpTotal + xp));
      setPref("gt:lang-streak", String(streak + 1));
      nino_say({ en: `Lesson done. ${xp} XP — I expect even more next time.`, ja: "お疲れさま。次はもっと頑張りなさいよ。" });
      return;
    }
    setStep((s) => s + 1);
    setPhase("answer");
  }

  function restart() {
    setRound((r) => r + 1);
    setStep(0);
    setHearts(5);
    setXp(0);
    setPhase("answer");
    setPicked(null);
    setTyped("");
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <PaperBackdrop />
      <header className="relative flex items-center justify-between px-5 py-3 font-sans text-xs text-sumi-soft">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-sumi">
          <ArrowLeft className="size-3.5" /> Menu
        </Link>
        <h1 className="font-mono text-base tracking-wide text-sumi">Nino&apos;s Language Class</h1>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1" title="Lessons finished">
            <Flame className="size-3.5 text-orange-500" /> {streak}
          </span>
          <span className="inline-flex items-center gap-1" title="XP">
            <Sparkles className="size-3.5 text-amber-500" /> {xpTotal + xp} XP
          </span>
          <span className="inline-flex items-center gap-1" title="Hearts">
            <Heart className="size-3.5 fill-rose text-rose" /> {hearts}/5
          </span>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-5 px-4 pb-8 md:flex-row md:items-start md:pt-10">
        <section className="paper-card w-full max-w-lg p-5">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Quit lesson" className="text-sumi-soft">
              <X className="size-4" />
            </Link>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-sepia/60">
              <div className="h-full rounded-full bg-rose transition-all" style={{ width: `${((phase === "done" ? items.length : step) / items.length) * 100}%` }} />
            </div>
            <span className="font-sans text-xs text-sumi-soft">
              {Math.min(step + 1, items.length)}/{items.length}
            </span>
          </div>

          {phase === "done" ? (
            <div className="py-10 text-center">
              <p className="font-jp text-xl">お疲れさま！</p>
              <p className="mt-1 text-2xl">Lesson complete</p>
              <p className="mt-3 font-sans text-sm text-sumi-soft">
                +{xp} XP · {hearts} hearts left
              </p>
              <button type="button" onClick={restart} className="paper-btn-rose mt-6 px-6! py-2!">
                Next lesson
              </button>
            </div>
          ) : (
            item && (
              <>
                <div className="mt-4 flex items-center justify-between font-sans text-[10px] tracking-[0.15em] text-sumi-soft">
                  <span>FIRST WORDS · {course.label.toUpperCase()} · {items.length} TO TRANSLATE</span>
                  <select
                    value={course.id}
                    onChange={(e) => {
                      setPref("gt:lang-course", e.target.value);
                      restart();
                    }}
                    className="rounded-[2px] border border-sepia bg-white px-1 py-0.5 text-[11px] tracking-normal"
                    aria-label="Course"
                  >
                    {COURSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <h2 className="mt-2 font-mono text-lg">Choose the translation</h2>
                <div className="mt-3 flex items-center justify-between rounded-[3px] border border-sepia bg-white px-4 py-3">
                  <span className="font-mono text-lg">{item.prompt}</span>
                  <button type="button" aria-label="Hear it" onClick={() => void speak(item.prompt, { lang: "en-US", force: true })} className="text-sumi-soft hover:text-sumi">
                    <Volume2 className="size-4" />
                  </button>
                </div>

                {keyboard ? (
                  <input
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (phase === "answer" ? check() : next())}
                    disabled={phase !== "answer"}
                    placeholder={`Type it in ${course.label}`}
                    className="paper-field mt-3 font-jp"
                    autoFocus
                  />
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {options.map((o) => {
                      const isAnswer = o === item.answer;
                      const state =
                        phase !== "answer" && isAnswer ? "bg-navy text-white border-navy" : picked === o ? (phase === "wrong" ? "bg-red-100 border-red-400" : "bg-[#5a7490] text-white border-[#5a7490]") : "bg-white border-sepia hover:border-sumi-soft";
                      return (
                        <button key={o} type="button" disabled={phase !== "answer"} onClick={() => setPicked(o)} className={`rounded-[3px] border px-3 py-2.5 font-jp text-sm transition ${state}`}>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between font-sans text-[11px] text-sumi-soft">
                  <button type="button" onClick={() => setKeyboard((k) => !k)} className="inline-flex items-center gap-1 hover:text-sumi">
                    <Keyboard className="size-3.5" /> {keyboard ? "Use choices" : "Use keyboard"}
                  </button>
                  {phase !== "answer" && (
                    <button type="button" onClick={() => setWhy(true)} className="hover:text-sumi">
                      Ask Nino why
                    </button>
                  )}
                </div>

                {phase !== "answer" && (
                  <div className={`mt-3 rounded-[3px] px-4 py-2.5 font-mono text-sm text-white ${phase === "right" ? "bg-[#33506f]" : "bg-[#a33a4f]"}`}>
                    {phase === "right" ? "Correct!" : `Answer: ${item.answer}`}
                    {item.reading && <span className="ml-2 text-xs opacity-80">({item.reading})</span>}
                    {why && (
                      <p className="mt-1 font-sans text-xs opacity-90">
                        “{item.prompt}” is “{item.answer}”{item.reading ? `, read ${item.reading}` : ""}. Say it out loud three times — that&apos;s how it sticks.
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  {phase === "answer" ? (
                    <button type="button" onClick={check} disabled={keyboard ? !typed.trim() : !picked} className="paper-btn-rose px-5!">
                      Check
                    </button>
                  ) : (
                    <button type="button" onClick={next} className="paper-btn-rose px-5!">
                      Continue
                    </button>
                  )}
                </div>
              </>
            )
          )}
        </section>

        <aside className="paper-card w-56 shrink-0 p-3 text-center">
          <div className="relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-[3px]" style={{ background: `${nino.hue}22` }}>
            <PortraitView portrait={nino.sprite} crop={{ x: 380, y: 90, w: 420, h: 560 }} talking={false} sizePx={200} />
          </div>
          <span className="mt-2 inline-block rounded-[2px] px-3 py-0.5 font-sans text-xs text-white" style={{ background: nino.hue }}>
            Nino
          </span>
          <p className="mt-2 font-mono text-xs leading-relaxed">{line.en}</p>
          <p className="mt-1 font-jp text-[11px] text-sumi-soft">{line.ja}</p>
          <button type="button" onClick={openSettings} className="mt-3 font-sans text-[11px] text-sumi-soft underline-offset-2 hover:underline">
            Voice &amp; language settings
          </button>
        </aside>
      </main>
    </div>
  );
}
