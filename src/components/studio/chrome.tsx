"use client";

import { ArrowLeft, BookOpen, Home, MessageSquare, NotebookPen, Phone, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { CAST } from "@/lib/studio/cast";
import { useStudioSettings } from "@/lib/studio/settings";
import { useOpenSettings } from "./settings-dialog";

/** Wordmark: serif title with the five sisters' colors as small dots. */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = { sm: "text-[15px] leading-[0.95]", md: "text-3xl leading-[0.9]", lg: "text-5xl leading-[0.9] sm:text-6xl" }[size];
  const dot = { sm: "size-1", md: "size-2", lg: "size-2.5" }[size];
  return (
    <span className={`inline-flex flex-col items-center font-display font-semibold tracking-tight text-sumi ${text}`}>
      <span className="italic">Go-Toubun</span>
      <span>Study Club</span>
      <span className="mt-1 flex gap-1" aria-hidden>
        {CAST.map((c) => (
          <span key={c.tutor.id} className={`${dot} rounded-full`} style={{ background: c.hue }} />
        ))}
      </span>
    </span>
  );
}

/** Faint graph-paper axes and arcs behind the menus, like a notebook page. */
export function PaperBackdrop() {
  const { decorations } = useStudioSettings();
  if (!decorations) return null;
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 size-full text-sumi/15" preserveAspectRatio="none" viewBox="0 0 1000 700">
      <line x1="60" y1="20" x2="60" y2="660" stroke="currentColor" strokeWidth="1" />
      <line x1="40" y1="640" x2="980" y2="640" stroke="currentColor" strokeWidth="1" />
      <path d="M60 640 C 300 120, 520 120, 900 40" fill="none" stroke="#e5869f" strokeOpacity="0.35" strokeWidth="1.2" />
      <circle cx="840" cy="520" r="150" fill="none" stroke="currentColor" strokeDasharray="2 5" />
      <circle cx="210" cy="180" r="90" fill="none" stroke="#56b6e8" strokeOpacity="0.3" />
      <text x="40" y="660" fontSize="14" fill="currentColor" fontStyle="italic">O</text>
      <text x="960" y="630" fontSize="16" fill="currentColor" fontStyle="italic">x</text>
      <circle cx="930" cy="230" r="3" fill="#e5869f" fillOpacity="0.6" />
      <circle cx="120" cy="420" r="3" fill="#56b6e8" fillOpacity="0.6" />
    </svg>
  );
}

type NavKey = "menu" | "new" | "chats" | "call" | "notes" | "read" | "settings";

/** Top bar of the study rooms: wordmark, room title, tutor chip and tools. */
export function StudioHeader({
  title,
  subtitle,
  chip,
  onNew,
  onChats,
  callHref,
  hide = [],
}: {
  title: string;
  subtitle?: string;
  chip?: React.ReactNode;
  onNew?: () => void;
  onChats?: () => void;
  callHref?: string;
  hide?: NavKey[];
}) {
  const openSettings = useOpenSettings();
  const show = (k: NavKey) => !hide.includes(k);
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-sepia/70 px-4 py-2">
      <Link href="/" aria-label="Main menu" className="shrink-0">
        <Logo size="sm" />
      </Link>
      <span className="h-8 w-px bg-sepia" />
      <div className="min-w-0">
        <h1 className="truncate text-lg leading-tight">{title}</h1>
        {subtitle && <p className="truncate font-sans text-[11px] text-sumi-soft">{subtitle}</p>}
      </div>
      <nav className="ml-auto flex items-center gap-0.5 font-sans text-xs text-sumi-soft">
        {show("menu") && <NavLink href="/" icon={<ArrowLeft className="size-3.5" />} label="Menu" />}
        {chip}
        {show("new") && onNew && <NavButton onClick={onNew} icon={<Plus className="size-3.5" />} label="New" />}
        {show("chats") && onChats && <NavButton onClick={onChats} icon={<MessageSquare className="size-3.5" />} label="Chats" />}
        {show("read") && <NavLink href="/read" icon={<BookOpen className="size-3.5" />} label="Read" />}
        {show("call") && <NavLink href={callHref ?? "/call"} icon={<Phone className="size-3.5" />} label="Call" />}
        {show("notes") && <NavLink href="/notes" icon={<NotebookPen className="size-3.5" />} label="Notes" />}
        {show("settings") && <NavButton onClick={openSettings} icon={<Settings className="size-3.5" />} label="Settings" />}
      </nav>
    </header>
  );
}

const navCls = "inline-flex items-center gap-1 rounded-[3px] px-2 py-1.5 transition hover:bg-sepia/40 hover:text-sumi";

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className={navCls} title={label}>
      {icon}
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}

function NavButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} className={navCls} title={label}>
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

export function BackLink({ href = "/", label = "Menu" }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 font-sans text-xs text-sumi-soft hover:text-sumi">
      <Home className="size-3.5" />
      {label}
    </Link>
  );
}
