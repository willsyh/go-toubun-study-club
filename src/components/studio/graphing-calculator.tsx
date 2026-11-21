"use client";

import { Maximize2, Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { findZeros, parseGraphLine, type GraphItem } from "@/lib/studio/math-expr";
import { ToolBtn } from "./whiteboard";

const COLORS = ["#e8742c", "#3a7bc8", "#2f9e5b", "#b46be0", "#d9468f", "#d9a21b"];
const W = 400;
const H = 300;

export type GraphLine = { id: string; src: string; visible: boolean };

/** Desmos-style plotter: type functions or points, drag to pan, buttons to zoom. */
export function GraphingCalculator({
  lines,
  onChange,
}: {
  lines: GraphLine[];
  onChange: (next: GraphLine[]) => void;
}) {
  const [view, setView] = useState({ cx: 0, cy: 0, scale: 5 }); // half-width in units
  const [draft, setDraft] = useState("");
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const items = useMemo(() => lines.map((l) => ({ line: l, item: parseGraphLine(l.src) })), [lines]);

  const xr = view.scale;
  const yr = (view.scale * H) / W;
  const toX = (x: number) => ((x - (view.cx - xr)) / (2 * xr)) * W;
  const toY = (y: number) => H - ((y - (view.cy - yr)) / (2 * yr)) * H;

  const step = niceStep(xr / 4);
  const ticksX: number[] = [];
  for (let x = Math.ceil((view.cx - xr) / step) * step; x <= view.cx + xr; x += step) ticksX.push(+x.toFixed(6));
  const ticksY: number[] = [];
  for (let y = Math.ceil((view.cy - yr) / step) * step; y <= view.cy + yr; y += step) ticksY.push(+y.toFixed(6));

  function pathFor(f: (x: number) => number) {
    let d = "";
    let pen = false;
    let prevY = 0;
    for (let i = 0; i <= 480; i++) {
      const x = view.cx - xr + (2 * xr * i) / 480;
      const y = f(x);
      const sy = toY(y);
      if (!Number.isFinite(y) || Math.abs(sy) > H * 4 || (pen && Math.abs(sy - prevY) > H * 1.5)) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${toX(x).toFixed(1)} ${sy.toFixed(1)}`;
      pen = true;
      prevY = sy;
    }
    return d;
  }

  function add(src: string) {
    const s = src.trim();
    if (!s) return;
    onChange([...lines, { id: `${Date.now()}`, src: s, visible: true }]);
    setDraft("");
  }

  const zeros = items.flatMap(({ line, item }) =>
    item.kind === "fn" && line.visible ? findZeros(item.f, view.cx - xr, view.cx + xr, 800).map((x) => ({ x, key: line.id })) : [],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-sepia/70 px-2 py-1 font-sans text-[11px] text-sumi-soft">
        <span className="mr-auto rounded-[2px] bg-paper px-2 py-0.5 font-medium text-sumi">Graphing calculator</span>
        <ToolBtn label="Zoom in" onClick={() => setView((v) => ({ ...v, scale: Math.max(0.5, v.scale / 1.5) }))}>
          <Plus className="size-3.5" />
        </ToolBtn>
        <ToolBtn label="Zoom out" onClick={() => setView((v) => ({ ...v, scale: Math.min(200, v.scale * 1.5) }))}>
          <Minus className="size-3.5" />
        </ToolBtn>
        <ToolBtn label="Reset view" onClick={() => setView({ cx: 0, cy: 0, scale: 5 })}>
          <Maximize2 className="size-3.5" />
        </ToolBtn>
        <ToolBtn label="Clear graph" onClick={() => onChange([])}>
          <Trash2 className="size-3.5" />
        </ToolBtn>
      </div>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full shrink-0 cursor-grab touch-none bg-white active:cursor-grabbing"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy };
        }}
        onPointerMove={(e) => {
          if (!drag.current || !svg.current) return;
          const k = (2 * xr) / svg.current.getBoundingClientRect().width;
          setView((v) => ({ ...v, cx: drag.current!.cx - (e.clientX - drag.current!.x) * k, cy: drag.current!.cy + (e.clientY - drag.current!.y) * k }));
        }}
        onPointerUp={() => (drag.current = null)}
        onWheel={(e) => setView((v) => ({ ...v, scale: Math.min(200, Math.max(0.5, v.scale * (e.deltaY > 0 ? 1.1 : 0.9))) }))}
        role="img"
        aria-label="Graph"
      >
        {ticksX.map((x) => (
          <line key={`gx${x}`} x1={toX(x)} x2={toX(x)} y1={0} y2={H} stroke="#eee8de" />
        ))}
        {ticksY.map((y) => (
          <line key={`gy${y}`} y1={toY(y)} y2={toY(y)} x1={0} x2={W} stroke="#eee8de" />
        ))}
        <line x1={toX(0)} x2={toX(0)} y1={0} y2={H} stroke="#8a7f74" />
        <line y1={toY(0)} y2={toY(0)} x1={0} x2={W} stroke="#8a7f74" />
        {ticksX.map((x) =>
          x === 0 ? null : (
            <text key={`tx${x}`} x={toX(x)} y={Math.min(H - 3, Math.max(10, toY(0) + 11))} fontSize="8" textAnchor="middle" fill="#8a7f74">
              {fmt(x)}
            </text>
          ),
        )}
        {ticksY.map((y) =>
          y === 0 ? null : (
            <text key={`ty${y}`} x={Math.min(W - 12, Math.max(3, toX(0) + 3))} y={toY(y) + 3} fontSize="8" fill="#8a7f74">
              {fmt(y)}
            </text>
          ),
        )}
        {items.map(({ line, item }, i) =>
          !line.visible ? null : item.kind === "fn" ? (
            <path key={line.id} d={pathFor(item.f)} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="2" />
          ) : item.kind === "point" ? (
            <g key={line.id}>
              <circle cx={toX(item.x)} cy={toY(item.y)} r="3.5" fill={COLORS[i % COLORS.length]} />
              <text x={toX(item.x) + 5} y={toY(item.y) - 5} fontSize="9" fill="#2b2622">
                {item.label}
              </text>
            </g>
          ) : null,
        )}
        {zeros.map((z) => (
          <circle key={`${z.key}-${z.x}`} cx={toX(z.x)} cy={toY(0)} r="2.5" fill="#fff" stroke="#2b2622" />
        ))}
      </svg>
      <form
        className="flex items-center gap-1 border-y border-sepia/70 px-2 py-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          add(draft);
        }}
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="y = x^2 − 4   or   (1, 0)" className="paper-field py-1! font-sans text-xs!" aria-label="New expression" />
        <button type="submit" className="paper-btn-rose px-2! py-1! text-xs!">
          Add
        </button>
      </form>
      <ul className="min-h-0 flex-1 overflow-y-auto font-sans text-xs">
        {items.length === 0 && <li className="px-3 py-3 text-sumi-soft">Ask for a graph, or type an expression above.</li>}
        {items.map(({ line, item }, i) => (
          <li key={line.id} className="flex items-center gap-2 border-b border-dashed border-sepia/60 px-2 py-1.5">
            <input
              type="checkbox"
              checked={line.visible}
              onChange={() => onChange(lines.map((l) => (l.id === line.id ? { ...l, visible: !l.visible } : l)))}
              aria-label={`Show ${line.src}`}
              className="accent-[var(--rose)]"
            />
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className={`min-w-0 flex-1 truncate ${item.kind === "error" ? "text-red-700" : ""}`} title={item.kind === "error" ? item.message : item.src}>
              {item.kind === "error" ? `${item.src} — ${item.message}` : item.label}
            </span>
            {item.kind === "fn" && <ZerosHint item={item} />}
            <button type="button" aria-label="Remove" onClick={() => onChange(lines.filter((l) => l.id !== line.id))} className="text-sumi-soft hover:text-sumi">
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ZerosHint({ item }: { item: Extract<GraphItem, { kind: "fn" }> }) {
  const z = useMemo(() => findZeros(item.f).slice(0, 4), [item]);
  if (!z.length) return null;
  return <span className="shrink-0 text-[10px] text-sumi-soft">zeros: {z.map(fmt).join(", ")}</span>;
}

function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p;
}

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}
