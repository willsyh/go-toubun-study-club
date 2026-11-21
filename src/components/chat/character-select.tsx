"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { PortraitView } from "@/components/app/tutor-avatar";
import { TUTORS, type Box, type Portrait, type Tutor, type TutorId } from "@/lib/tutors";

/**
 * Character select shown before every new study session. Hovering a card
 * makes that sister "talk"; picking one and pressing Start opens the chat.
 */
export function CharacterSelect({
  initial,
  onStart,
}: {
  initial: TutorId;
  onStart: (id: TutorId) => void;
}) {
  const [selected, setSelected] = useState<TutorId>(initial);
  const tutor = TUTORS.find((t) => t.id === selected)!;

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-8">
      <div className="w-full max-w-6xl pt-2 sm:pt-6">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Choose your tutor
        </h1>
        <p className="mt-2 text-center text-[15px] text-muted">
          Which Nakano sister do you want to study with today?
        </p>

        <div
          role="radiogroup"
          aria-label="Tutor"
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5"
        >
          {TUTORS.map((t) => (
            <CharacterCard
              key={t.id}
              tutor={t}
              selected={t.id === selected}
              onSelect={() => setSelected(t.id)}
              onConfirm={() => onStart(t.id)}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="max-w-md text-center text-[15px] text-ink-soft">
            <span className="font-semibold" style={{ color: tutor.color }}>
              {tutor.name}:
            </span>{" "}
            “{tutor.intro}”
          </p>
          <button
            type="button"
            onClick={() => onStart(selected)}
            className="btn-primary h-12! w-auto! px-8 text-base!"
          >
            Start learning with {tutor.name}
            <ArrowRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CharacterCard({
  tutor,
  selected,
  onSelect,
  onConfirm,
}: {
  tutor: Tutor;
  selected: boolean;
  onSelect: () => void;
  onConfirm: () => void;
}) {
  const [hover, setHover] = useState(false);
  const art = tutor.cardArt ?? tutor.portrait;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${tutor.name}, ${tutor.subjects}`}
      onClick={onSelect}
      onDoubleClick={onConfirm}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={`group flex flex-col overflow-hidden rounded-2xl border-2 bg-canvas text-left transition duration-200 outline-none ${
        selected ? "-translate-y-1 shadow-lg" : "border-line hover:-translate-y-0.5 hover:shadow-md"
      }`}
      style={selected ? { borderColor: tutor.color } : undefined}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden" style={{ backgroundColor: `${tutor.color}22` }}>
        {art ? (
          <PortraitView
            portrait={art}
            crop={cardCrop(art)}
            talking={hover || selected}
            sizePx={240}
            priority
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-white"
            style={{ background: `linear-gradient(160deg, ${tutor.color}, ${tutor.color}aa)` }}
          >
            {tutor.name[0]}
          </span>
        )}
        {selected && (
          <span
            className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white shadow"
            style={{ backgroundColor: tutor.color }}
          >
            Selected
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <span className="text-lg font-semibold text-ink">{tutor.name}</span>
        <span className="text-sm font-medium" style={{ color: tutor.color }}>
          {tutor.subjects}
        </span>
        <span className="text-[13px] leading-snug text-muted">{tutor.role}</span>
      </div>
    </button>
  );
}

/** A 3:4 window from the top of the art, unless the art defines its own. */
function cardCrop(p: Portrait): Box {
  if (p.card) return p.card;
  const h = Math.min(p.height, Math.round((p.width * 4) / 3));
  return { x: 0, y: 0, w: p.width, h };
}
