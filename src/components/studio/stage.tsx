"use client";

import { FastForward, List, Pause, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PortraitView } from "@/components/app/tutor-avatar";
import type { CastMember } from "@/lib/studio/cast";
import { saveStudioSettings, useStudioSettings } from "@/lib/studio/settings";

/* ------------------------------------------------------------------ scene */

/** The Nakano living room, painted in SVG: window, sofa, staircase. */
export function RoomScene({ time = "day" }: { time?: "day" | "evening" }) {
  const sky = time === "day" ? ["#bfe3f7", "#eaf6fb"] : ["#f6b98a", "#fbe3c6"];
  return (
    <svg aria-hidden viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe6d8" />
          <stop offset="1" stopColor="#ddd0bd" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a77d5a" />
          <stop offset="1" stopColor="#7d5a3e" />
        </linearGradient>
        <linearGradient id="light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1600" height="700" fill="url(#wall)" />
      {/* window wall */}
      <rect x="0" y="0" width="620" height="520" fill="#3b3f46" />
      <rect x="18" y="18" width="584" height="490" fill="url(#sky)" />
      <path d="M18 380 Q 150 330 300 372 T 602 350 L602 508 L18 508Z" fill="#9cc8a6" opacity="0.55" />
      <rect x="18" y="430" width="584" height="78" fill="#c9d6dd" opacity="0.7" />
      {[160, 310, 460].map((x) => (
        <rect key={x} x={x} y="18" width="10" height="490" fill="#3b3f46" />
      ))}
      <rect x="18" y="250" width="584" height="8" fill="#3b3f46" />
      {/* staircase */}
      <rect x="1180" y="0" width="420" height="520" fill="#d8cab4" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={1180 + i * 46} y={470 - i * 52} width={420 - i * 46} height="14" fill="#8a6446" />
      ))}
      <path d="M1170 520 L1600 60" stroke="#4b4b50" strokeWidth="10" />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={1200 + i * 42} y1={498 - i * 47} x2={1200 + i * 42} y2={430 - i * 47} stroke="#4b4b50" strokeWidth="4" />
      ))}
      {/* floor */}
      <rect x="0" y="520" width="1600" height="180" fill="url(#floor)" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="0" y1={540 + i * 22} x2="1600" y2={540 + i * 22} stroke="#5d412c" strokeOpacity="0.25" />
      ))}
      <rect x="0" y="514" width="1600" height="8" fill="#6a4c35" />
      {/* sofa */}
      <rect x="640" y="400" width="470" height="70" rx="18" fill="#f2efe8" />
      <rect x="620" y="450" width="510" height="90" rx="16" fill="#e8e3d9" />
      <rect x="610" y="420" width="50" height="120" rx="18" fill="#efebe3" />
      <rect x="1090" y="420" width="50" height="120" rx="18" fill="#efebe3" />
      <rect x="690" y="420" width="90" height="60" rx="14" fill="#bcd27a" />
      <rect x="980" y="420" width="90" height="60" rx="14" fill="#a8cfc4" />
      {/* table + plant */}
      <rect x="380" y="560" width="300" height="20" rx="4" fill="#4a3a30" />
      <rect x="400" y="580" width="14" height="70" fill="#4a3a30" />
      <rect x="646" y="580" width="14" height="70" fill="#4a3a30" />
      <rect x="1460" y="560" width="70" height="90" rx="6" fill="#efe9df" />
      <ellipse cx="1495" cy="535" rx="70" ry="60" fill="#6f9a5a" />
      <rect width="1600" height="700" fill="url(#light)" />
    </svg>
  );
}

/* ----------------------------------------------------------------- sprites */

export function Sprite({
  member,
  talking,
  left,
  dim = false,
}: {
  member: CastMember;
  talking: boolean;
  /** Center of the sprite, as a percentage of the stage width. */
  left: number;
  dim?: boolean;
}) {
  const { stage, sprite } = member;
  return (
    <div
      className="sprite-in absolute bottom-0 h-[104%] transition-[filter] duration-300"
      style={{
        left: `${left}%`,
        aspectRatio: `${stage.w} / ${stage.h}`,
        transform: "translateX(-50%)",
        filter: dim ? "brightness(0.82) saturate(0.85)" : undefined,
      }}
    >
      <div className={`relative size-full ${talking && !sprite.mouth ? "talk-bob" : ""}`}>
        <PortraitView portrait={sprite} crop={stage} talking={talking} sizePx={320} priority />
      </div>
    </div>
  );
}

/** Scene with one or two tutors standing in it. */
export function Stage({
  members,
  speaking,
  className = "",
  children,
}: {
  members: CastMember[];
  speaking: string | null;
  className?: string;
  children?: React.ReactNode;
}) {
  const slots = members.length === 1 ? [50] : [32, 68];
  return (
    <div className={`relative overflow-hidden rounded-[3px] border border-sepia bg-[#ddd0bd] ${className}`}>
      <RoomScene />
      {members.map((m, i) => (
        <Sprite
          key={m.tutor.id}
          member={m}
          left={slots[i] ?? 50}
          talking={speaking === m.tutor.id}
          dim={speaking !== null && speaking !== m.tutor.id && members.length > 1}
        />
      ))}
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- dialogue */

export type DialogueLine = { speaker: string; name: string; color: string; text: string };

/** Reveals `total` characters over time at the configured text speed. */
export function useTypewriter(key: string, total: number) {
  const { textSpeed } = useStudioSettings();
  const [shown, setShown] = useState(0);
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setShown(0);
  }
  useEffect(() => {
    if (textSpeed === 0) return;
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n >= total) {
          window.clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 1000 / textSpeed);
    return () => window.clearInterval(id);
  }, [key, total, textSpeed]);
  const done = textSpeed === 0 || shown >= total;
  return { shown: done ? total : shown, done, skip: () => setShown(total) };
}

/**
 * The visual-novel text box: speaker tag, the question on top in grey, each
 * tutor line typed out, and playback controls along the bottom.
 */
export function DialogueBox({
  question,
  lines,
  thinking,
  thinkingName,
  speakingLabel,
  onPlay,
  onPause,
  onStop,
  onLog,
  onTypingChange,
  compact = false,
}: {
  question?: string;
  lines: DialogueLine[];
  thinking: boolean;
  thinkingName: string;
  speakingLabel?: string;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onLog?: () => void;
  onTypingChange?: (typingSpeaker: string | null) => void;
  compact?: boolean;
}) {
  const settings = useStudioSettings();
  const total = lines.reduce((n, l) => n + l.text.length, 0);
  const key = lines.map((l) => l.text).join("|");
  const { shown, done, skip } = useTypewriter(key, total);
  const scroller = useRef<HTMLDivElement>(null);

  // Who is "talking" right now: the line the typewriter is in.
  let rest = shown;
  let typing: string | null = null;
  for (const l of lines) {
    if (rest < l.text.length) {
      typing = l.speaker;
      break;
    }
    rest -= l.text.length;
  }
  if (done) typing = null;
  const reported = useRef<string | null>(null);
  useEffect(() => {
    if (reported.current !== typing) {
      reported.current = typing;
      onTypingChange?.(typing);
    }
  });

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [shown]);

  const tagNames = [...new Set(lines.map((l) => l.name))].join(" & ") || thinkingName;
  // Characters typed so far within each line.
  const starts = lines.reduce<number[]>((acc, l, i) => [...acc, i === 0 ? 0 : acc[i - 1] + lines[i - 1].text.length], []);

  return (
    <div className="relative flex flex-col rounded-[3px] border border-[#ecd9b8] bg-[linear-gradient(180deg,#fffaf0_0%,#fdf0dc_100%)] shadow-[0_8px_24px_-16px_#7a5a3a88]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/3 opacity-60"
        style={{ backgroundImage: "radial-gradient(circle, #f3c98f55 1.2px, transparent 1.6px)", backgroundSize: "9px 9px" }}
      />
      <div className="flex items-center gap-2 px-4 pt-2.5">
        <span className="rounded-[2px] bg-[#f3dfbd] px-2.5 py-0.5 text-xs font-semibold text-[#8a6a43]">{tagNames}</span>
        {lines.length > 0 && <span className="font-sans text-[10px] text-sumi-soft">{lines.length} line{lines.length > 1 ? "s" : ""}</span>}
      </div>
      <div
        ref={scroller}
        onClick={skip}
        className={`relative cursor-pointer overflow-y-auto px-4 pt-1.5 pb-2 text-[15px] leading-relaxed ${compact ? "h-24" : "h-32"}`}
        aria-live="polite"
      >
        {question && <p className="mb-1 truncate font-sans text-xs text-sumi-soft/80">{question}</p>}
        {thinking && lines.length === 0 && (
          <p className="text-sumi-soft">
            <span className="font-semibold" style={{ color: "#8a6a43" }}>
              {thinkingName}
            </span>{" "}
            is thinking<span className="typing-dot">.</span>
            <span className="typing-dot">.</span>
            <span className="typing-dot">.</span>
          </p>
        )}
        {lines.map((l, i) => {
          const visible = l.text.slice(0, Math.max(0, shown - starts[i]));
          if (!visible) return null;
          const inProgress = shown - starts[i] < l.text.length;
          return (
            <p key={i} className="mb-1 whitespace-pre-wrap">
              {lines.length > 1 && (
                <span className="font-semibold" style={{ color: l.color }}>
                  {l.name}:{" "}
                </span>
              )}
              {visible}
              {!done && inProgress && <span className="vn-caret text-rose">▍</span>}
            </p>
          );
        })}
      </div>
      <div className="relative flex items-center gap-1 border-t border-[#f0dfc4] px-3 py-1.5 font-sans text-sumi-soft">
        <button
          type="button"
          role="switch"
          aria-checked={settings.voiceEnabled}
          aria-label="Voice"
          title="Voice"
          onClick={() => saveStudioSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
          className={`relative mr-1 h-4 w-7 rounded-full transition ${settings.voiceEnabled ? "bg-rose" : "bg-sepia"}`}
        >
          <span className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${settings.voiceEnabled ? "left-3.5" : "left-0.5"}`} />
        </button>
        <CtlButton label="Play voice" onClick={onPlay}>
          <Play className="size-3.5" />
        </CtlButton>
        <CtlButton label="Pause" onClick={onPause}>
          <Pause className="size-3.5" />
        </CtlButton>
        <CtlButton label="Stop" onClick={onStop}>
          <Square className="size-3.5" />
        </CtlButton>
        <CtlButton label="Skip typing" onClick={skip}>
          <FastForward className="size-3.5" />
        </CtlButton>
        {onLog && (
          <CtlButton label="Log" onClick={onLog}>
            <List className="size-3.5" />
          </CtlButton>
        )}
        <span className="ml-2 text-[11px] italic">{speakingLabel ?? (thinking ? "Thinking…" : done ? "" : "Speaking…")}</span>
      </div>
    </div>
  );
}

function CtlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="rounded p-1.5 transition hover:bg-[#f3dfbd] hover:text-sumi">
      {children}
    </button>
  );
}
