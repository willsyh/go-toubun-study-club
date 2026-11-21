"use client";

import { useEffect, useState } from "react";
import { PortraitView } from "@/components/app/tutor-avatar";
import { CAST, type CastMember } from "@/lib/studio/cast";
import { Logo } from "./chrome";

/**
 * Opening sequence: starfield and tagline, the countdown 一…五, a name card
 * for each sister, then the title. Click or press any key to skip.
 */
type Scene =
  | { kind: "stars" }
  | { kind: "tagline" }
  | { kind: "numeral"; n: number }
  | { kind: "card"; n: number }
  | { kind: "title" }
  | { kind: "motto" }
  | { kind: "logo" };

const TIMELINE: [Scene, number][] = [
  [{ kind: "stars" }, 900],
  [{ kind: "tagline" }, 2600],
  ...[0, 1, 2, 3, 4].map((n): [Scene, number] => [{ kind: "numeral", n }, 520]),
  ...[0, 1, 2, 3, 4].map((n): [Scene, number] => [{ kind: "card", n }, 1900]),
  [{ kind: "title" }, 2400],
  [{ kind: "motto" }, 2200],
  [{ kind: "logo" }, 2600],
];

export function Intro({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= TIMELINE.length) {
      onDone();
      return;
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), TIMELINE[step][1]);
    return () => window.clearTimeout(id);
  }, [step, onDone]);

  useEffect(() => {
    const onKey = () => onDone();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  const scene = TIMELINE[Math.min(step, TIMELINE.length - 1)][0];
  const dark = scene.kind === "stars" || scene.kind === "tagline" || scene.kind === "numeral";

  return (
    <div
      className={`fixed inset-0 z-40 cursor-pointer overflow-hidden transition-colors duration-300 ${dark ? "bg-black text-white" : "bg-paper text-sumi"}`}
      onClick={onDone}
      role="presentation"
    >
      {dark && <Starfield />}
      <div key={step} className="relative flex size-full items-center justify-center">
        {scene.kind === "tagline" && (
          <div className="fade-in text-center">
            <div className="absolute inset-0 -z-10 m-auto size-[70vmin] rounded-full bg-[radial-gradient(circle,#3a1f3333_0%,transparent_70%)]" />
            <p className="font-jp text-xl tracking-wider sm:text-2xl">五つの個性、ひとつの学び。</p>
            <p className="mt-2 text-base italic opacity-80">Five perspectives. One place to learn.</p>
          </div>
        )}
        {scene.kind === "numeral" && <p className="fade-in font-jp text-7xl sm:text-8xl">{CAST[scene.n].numeral}</p>}
        {scene.kind === "card" && <NameCard member={CAST[scene.n]} flip={scene.n % 2 === 1} />}
        {scene.kind === "title" && (
          <div className="fade-up text-center">
            <p className="font-jp text-3xl tracking-widest sm:text-4xl">五等分の勉強会</p>
            <p className="mt-1 text-lg">Go-Toubun Study Club</p>
            <div className="dotted-rule mx-auto my-5 w-72" />
            <p className="font-jp text-4xl font-semibold tracking-wider sm:text-5xl">デスクトップ版</p>
            <p className="mt-2 text-lg text-sumi-soft">Desktop Edition</p>
          </div>
        )}
        {scene.kind === "motto" && (
          <div className="fade-up text-center">
            <p className="text-5xl sm:text-6xl">Five perspectives.</p>
            <p className="mt-3 text-2xl italic text-sumi-soft">One place to learn.</p>
            <BrushStrokes />
          </div>
        )}
        {scene.kind === "logo" && (
          <div className="fade-up text-center">
            <Logo size="lg" />
            <p className="mt-8 text-xl italic text-sumi-soft">Finding the answer behind every problem.</p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onDone}
        className={`absolute right-5 bottom-5 rounded-full border px-4 py-1.5 font-sans text-xs ${dark ? "border-white/30 text-white/80" : "border-sepia text-sumi-soft"}`}
      >
        Skip ›
      </button>
    </div>
  );
}

// Seeded PRNG (mulberry32) so server and client agree.
const STARS = (() => {
  let a = 0x5eed;
  const r = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: 160 }, () => ({ x: r() * 100, y: r() * 100, s: r() * 1.6 + 0.6, d: 2 + r() * 3, delay: r() * 3 }));
})();

function Starfield() {
  const stars = STARS;
  return (
    <div aria-hidden className="absolute inset-0">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star absolute rounded-full bg-white"
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              "--d": `${s.d}s`,
              "--delay": `${s.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Character name card: colored slanted panel with art, and the name plate. */
export function NameCard({ member, flip }: { member: CastMember; flip: boolean }) {
  const art = member.sprite;
  return (
    <div className={`flex size-full items-center ${flip ? "flex-row-reverse" : ""}`}>
      <div className="relative flex h-full w-1/2 items-center justify-center">
        <div className="panel-in w-full max-w-sm px-6" style={{ "--from": flip ? "60px" : "-60px" } as React.CSSProperties}>
          <div className="relative py-3 pl-6" style={{ background: `linear-gradient(90deg, ${member.hue}33, ${member.hue}10 70%, transparent)` }}>
            <p className="font-jp text-4xl tracking-wider sm:text-5xl">{member.kanji}</p>
          </div>
          <p className="mt-2 bg-white/70 py-1 pl-8 text-lg">{member.romaji}</p>
          <div className="dotted-rule my-2 ml-8 w-3/4" />
          <p className="bg-white/60 py-1 pl-8 font-sans text-xs tracking-wide text-sumi-soft">{member.tutor.role}</p>
        </div>
      </div>
      <div className="relative h-full w-1/2 overflow-hidden">
        <div
          className="panel-in absolute inset-y-[-10%] left-[8%] w-[80%] border-x-4 border-white/70"
          style={{ background: `linear-gradient(180deg, ${member.hue}, ${member.hue}bb)`, "--from": flip ? "-80px" : "80px" } as React.CSSProperties}
        />
        <div className="fade-up absolute bottom-[-35%] left-1/2 h-[140%] -translate-x-1/2" style={{ aspectRatio: `${art.width} / ${art.height}` }}>
          <PortraitView portrait={art} talking sizePx={420} priority />
        </div>
      </div>
    </div>
  );
}

function BrushStrokes() {
  return (
    <svg aria-hidden viewBox="0 0 600 80" className="mx-auto mt-10 w-[min(560px,80vw)]">
      {["#56b6e8", "#ee6f8d", "#f2d94e", "#9fd94a", "#b46be0"].map((c, i) => (
        <path
          key={c}
          d={`M10 ${30 + i * 7} C 160 ${10 + i * 8}, 360 ${50 - i * 4}, ${560 - i * 40} ${26 + i * 6}`}
          stroke={c}
          strokeWidth={7 - i}
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
          className="fade-in"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </svg>
  );
}
