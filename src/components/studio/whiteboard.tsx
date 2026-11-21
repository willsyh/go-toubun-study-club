"use client";

import { Minus, PencilLine, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import type { BoardBlock } from "@/lib/studio/demo-brain";

export type BoardEntry = { id: string; topic: string; question: string; blocks: BoardBlock[] };

/** The tutor's worked solutions, newest at the bottom. */
export function Whiteboard({ entries, onClear }: { entries: BoardEntry[]; onClear: () => void }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-sepia/70 px-2 py-1 font-sans text-[11px] text-sumi-soft">
        <span className="mr-auto rounded-[2px] bg-paper px-2 py-0.5 font-medium text-sumi">Whiteboard</span>
        <ToolBtn label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}>
          <Minus className="size-3.5" />
        </ToolBtn>
        <span className="w-9 text-center">{Math.round(zoom * 100)}%</span>
        <ToolBtn label="Zoom in" onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}>
          <Plus className="size-3.5" />
        </ToolBtn>
        <ToolBtn label="Reset zoom" onClick={() => setZoom(1)}>
          <RotateCcw className="size-3.5" />
        </ToolBtn>
        <ToolBtn label="Clear whiteboard" onClick={onClear}>
          <Trash2 className="size-3.5" />
        </ToolBtn>
      </div>
      <div
        className="min-h-0 flex-1 overflow-auto bg-white"
        style={{ backgroundImage: "linear-gradient(#f1ece455 1px, transparent 1px), linear-gradient(90deg, #f1ece455 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      >
        {entries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center text-sumi-soft">
            <span className="mb-3 rounded-[3px] border border-sepia p-2">
              <PencilLine className="size-5" />
            </span>
            <p className="text-sm">Your mathematical work will appear here.</p>
            <p className="mt-1 font-sans text-[11px]">Ask the tutor a question or solve a problem to begin.</p>
          </div>
        ) : (
          <div className="origin-top-left space-y-5 p-4" style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}>
            {entries.map((e) => (
              <section key={e.id} className="fade-in">
                <div className="mb-2 border-l-2 border-rose/70 pl-2 font-sans text-[11px] leading-snug text-sumi-soft">
                  <p className="truncate">{e.question}</p>
                  <p className="text-sumi">{e.topic}</p>
                </div>
                <div className="space-y-3">
                  {e.blocks.map((b, i) => (
                    <Block key={i} block={b} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Block({ block }: { block: BoardBlock }) {
  if (block.kind === "note") {
    return (
      <div className="font-sans text-xs">
        <p className="font-semibold text-sumi">{block.title}</p>
        <p className="text-sumi-soft">{block.text}</p>
      </div>
    );
  }
  if (block.kind === "math") {
    return (
      <div className="pl-3">
        {block.title && <p className="mb-1 font-sans text-[11px] font-semibold text-sumi-soft">{block.title}</p>}
        {block.lines.map((l, i) => (
          <p key={i} className="text-center text-[16px] italic leading-relaxed text-sumi">
            {l}
          </p>
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-2 text-[16px] italic">
      <span>{block.label} =</span>
      <span className="relative inline-grid gap-x-3 px-2 py-0.5 not-italic" style={{ gridTemplateColumns: `repeat(${block.rows[0]?.length ?? 1}, auto)` }}>
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 rounded-l-full border-y border-l border-sumi" />
        <span aria-hidden className="absolute inset-y-0 right-0 w-1.5 rounded-r-full border-y border-r border-sumi" />
        {block.rows.flat().map((v, i) => (
          <span key={i} className="text-right tabular-nums">
            {v}
          </span>
        ))}
      </span>
    </div>
  );
}

export function ToolBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="rounded p-1 transition hover:bg-sepia/40 hover:text-sumi">
      {children}
    </button>
  );
}
