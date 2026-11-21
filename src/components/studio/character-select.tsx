"use client";

import { ArrowLeft, ArrowRight, Check, Lock, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { PortraitView } from "@/components/app/tutor-avatar";
import { setPref, usePref } from "@/lib/prefs";
import { CAST, getCast, type CastMember } from "@/lib/studio/cast";
import { DEFAULT_TUTOR, type TutorId } from "@/lib/tutors";
import { Logo, PaperBackdrop } from "./chrome";

const NEXT: Record<string, { href: string; label: string }> = {
  study: { href: "/study", label: "Study & Chat" },
  read: { href: "/read", label: "Read & Chat" },
  call: { href: "/call", label: "Call & Chat" },
};

export function CharacterSelectScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const next = NEXT[params.get("next") ?? ""] ?? NEXT.study;
  const [pair, setPair] = useState(params.get("pair") === "1");
  const saved = usePref<TutorId>("gt:tutor", DEFAULT_TUTOR);
  const [picked, setPicked] = useState<TutorId[]>([saved]);
  const [outfitsFor, setOutfitsFor] = useState<CastMember | null>(null);
  const focus = getCast(picked[picked.length - 1]);

  function toggle(id: TutorId) {
    if (!pair) return setPicked([id]);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-2)));
  }

  const ready = pair ? picked.length === 2 : picked.length === 1;

  function start() {
    if (!ready) return;
    setPref("gt:tutor", picked[0]);
    router.push(`${next.href}?t=${picked.join(",")}`);
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-3 py-6">
      <PaperBackdrop />
      <div className="paper-card fade-up relative w-full max-w-5xl px-4 pt-5 pb-5 sm:px-8">
        <Link href="/" className="absolute top-4 left-4 inline-flex items-center gap-1 font-sans text-xs text-sumi-soft hover:text-sumi">
          <ArrowLeft className="size-3.5" /> Menu
        </Link>
        <p className="absolute top-4 right-4 font-sans text-[10px] tracking-[0.2em] text-sumi-soft">チューター選択</p>
        <div className="text-center">
          <Logo size="sm" />
          <h1 className="mt-3 text-3xl">Choose your guide</h1>
          <div className="mt-2 flex items-center justify-center gap-2 font-sans text-[11px]">
            <button
              type="button"
              onClick={() => setOutfitsFor(focus)}
              className="rounded-[2px] border border-sepia bg-white px-2 py-0.5 text-sumi-soft hover:text-sumi"
            >
              Outfits · {focus.tutor.name}
            </button>
            <button
              type="button"
              onClick={() => {
                setPair((p) => !p);
                setPicked((p) => p.slice(0, 1));
              }}
              className={`rounded-[2px] border px-2 py-0.5 ${pair ? "border-rose bg-rose/10 text-rose" : "border-sepia bg-white text-sumi-soft"}`}
            >
              Two-quint mode {pair ? "on" : "off"}
            </button>
          </div>
          <p className="mt-1.5 font-sans text-[11px] text-sumi-soft">
            {pair ? "Pick two sisters to teach together." : "Five tutors, five ways to understand. Hold a card to explore their outfits."}
          </p>
        </div>

        <div role={pair ? "group" : "radiogroup"} aria-label="Tutor" className="mt-5 grid grid-cols-5 gap-2 sm:gap-4">
          {CAST.map((c) => (
            <Card
              key={c.tutor.id}
              member={c}
              order={picked.indexOf(c.tutor.id)}
              pair={pair}
              onSelect={() => toggle(c.tutor.id)}
              onHold={() => setOutfitsFor(c)}
              onConfirm={start}
            />
          ))}
        </div>

        <p className="mt-4 text-center text-[15px] text-sumi-soft">
          {pair && picked.length === 2
            ? `${getCast(picked[0]).tutor.name} & ${getCast(picked[1]).tutor.name} — two voices, one lesson.`
            : focus.blurb}
        </p>
        <div className="mt-3 flex justify-center">
          <button type="button" disabled={!ready} onClick={start} className="paper-btn-rose px-6! py-2! text-[15px]!">
            {next.label} with {picked.map((id) => getCast(id).tutor.name).join(" & ") || "…"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <p className="relative mt-4 font-jp text-sm">五人からチューターを選ぶ</p>
      <p className="relative font-sans text-xs text-sumi-soft">Choose your tutor.</p>
      {outfitsFor && <OutfitDialog member={outfitsFor} onClose={() => setOutfitsFor(null)} />}
    </div>
  );
}

function Card({
  member,
  order,
  pair,
  onSelect,
  onHold,
  onConfirm,
}: {
  member: CastMember;
  order: number;
  pair: boolean;
  onSelect: () => void;
  onHold: () => void;
  onConfirm: () => void;
}) {
  const selected = order >= 0;
  const [hover, setHover] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const held = useRef(false);
  const { tutor, sprite, hue } = member;

  const startHold = () => {
    held.current = false;
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      onHold();
    }, 550);
  };
  const endHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
  };

  return (
    <button
      type="button"
      role={pair ? "checkbox" : "radio"}
      aria-checked={selected}
      aria-label={`${tutor.name}, ${tutor.subjects}`}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={() => {
        endHold();
        setHover(false);
      }}
      onPointerEnter={() => setHover(true)}
      onClick={() => !held.current && onSelect()}
      onDoubleClick={onConfirm}
      onContextMenu={(e) => e.preventDefault()}
      className={`group relative flex flex-col items-stretch transition duration-300 outline-none select-none focus-visible:ring-2 focus-visible:ring-rose ${
        selected ? "-translate-y-2" : "hover:-translate-y-1"
      }`}
    >
      <div
        className="relative aspect-[9/18] w-full overflow-hidden rounded-t-[40px] border-2 transition"
        style={{
          borderColor: selected ? hue : "transparent",
          background: `linear-gradient(180deg, ${hue}22 0%, ${hue}55 100%)`,
          boxShadow: selected ? `0 12px 26px -12px ${hue}` : undefined,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: `repeating-linear-gradient(135deg, ${hue}33 0 6px, transparent 6px 14px)` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[98%]">
          <div className="relative mx-auto h-full" style={{ aspectRatio: `${sprite.width} / ${sprite.height}` }}>
            <PortraitView portrait={sprite} talking={hover || selected} sizePx={200} priority />
          </div>
        </div>
        {pair && selected && (
          <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-white font-sans text-xs font-bold shadow" style={{ color: hue }}>
            {order + 1}
          </span>
        )}
      </div>
      <div className="relative -mt-1 rounded-b-[4px] px-1 py-1.5 text-center" style={{ background: selected ? hue : `${hue}88` }}>
        <span className="font-mono text-sm tracking-wide text-white drop-shadow-[0_1px_0_#0004]">{tutor.name}</span>
      </div>
      <span className="mt-1 hidden text-center font-sans text-[10px] text-sumi-soft sm:block">{selected ? "Your study guide" : member.tagline}</span>
    </button>
  );
}

const EXPRESSIONS = ["Neutral", "Happy", "Talking"] as const;

function OutfitDialog({ member, onClose }: { member: CastMember; onClose: () => void }) {
  const [expr, setExpr] = useState<(typeof EXPRESSIONS)[number]>("Neutral");
  const [variation, setVariation] = useState(0);
  const ready = member.outfits.filter((o) => o.ready);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2622]/45 p-4" onClick={onClose}>
      <div className="paper-card fade-up w-full max-w-3xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">{member.tutor.name} · Outfits</h2>
          <button type="button" onClick={onClose} className="paper-btn py-1! text-xs!">
            <X className="size-3.5" /> Back
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 font-sans text-xs">
          <label className="flex items-center gap-2 text-sumi-soft">
            Preview expression
            <select value={expr} onChange={(e) => setExpr(e.target.value as typeof expr)} className="paper-field w-28! py-1! text-xs!">
              {EXPRESSIONS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <button type="button" className="paper-btn py-1! text-xs!" onClick={() => setVariation((v) => Math.max(0, v - 1))}>
            Previous variation
          </button>
          <button type="button" className="paper-btn py-1! text-xs!" onClick={() => setVariation((v) => Math.min(ready.length - 1, v + 1))}>
            Next variation
          </button>
          <span className="rounded-[2px] bg-rose px-2 py-1 text-white">Outfit selected</span>
          <span className="text-sumi-soft">
            Reserved · {variation + 1} / {ready.length} variations in School uniform
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {member.outfits.map((o) => (
            <div
              key={o.id}
              className={`flex flex-col items-center rounded-[3px] border p-2 ${o.ready ? "border-sumi-soft bg-white" : "border-sepia bg-paper/60"}`}
            >
              <div className="relative h-56 w-full overflow-hidden">
                <div
                  className={`relative mx-auto h-full ${o.ready ? "" : "opacity-25 grayscale"}`}
                  style={{ aspectRatio: `${member.sprite.width} / ${member.sprite.height}` }}
                >
                  <PortraitView portrait={member.sprite} talking={o.ready && expr === "Talking"} sizePx={140} />
                </div>
                {!o.ready && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Lock className="size-6 text-sumi-soft" />
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm">
                {o.name} {o.ready && <Check className="size-3.5 text-rose" />}
              </p>
              <p className="font-sans text-[10px] text-sumi-soft">{o.ready ? `${o.variations} variation` : "Art coming soon"}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center font-jp text-sm">チューターの衣装を選ぶ</p>
        <p className="text-center font-sans text-xs text-sumi-soft">Choose your tutor&apos;s outfit.</p>
      </div>
    </div>
  );
}
