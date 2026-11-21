"use client";

import {
  BookOpen,
  BookOpenCheck,
  Brain,
  Clapperboard,
  GraduationCap,
  Languages,
  Library,
  MessagesSquare,
  NotebookPen,
  Phone,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
import { useUser } from "@/components/app/user-context";
import { CAST } from "@/lib/studio/cast";
import { Logo, PaperBackdrop } from "./chrome";
import { Intro } from "./intro";
import { useOpenSettings } from "./settings-dialog";

const INTRO_KEY = "gt:intro-seen";
const introListeners = new Set<() => void>();

function useIntroSeen() {
  return useSyncExternalStore(
    (l) => {
      introListeners.add(l);
      return () => introListeners.delete(l);
    },
    () => {
      try {
        return sessionStorage.getItem(INTRO_KEY) === "1";
      } catch {
        return true;
      }
    },
    () => true,
  );
}

type Item = { label: string; jp: string; href?: string; icon: React.ElementType; action?: "settings" | "credits" };

const ITEMS: Item[] = [
  { label: "Study & Chat", jp: "学習＆チャット", href: "/characters?next=study", icon: MessagesSquare },
  { label: "Read & Chat", jp: "読書＆チャット", href: "/characters?next=read", icon: BookOpen },
  { label: "Call & Chat", jp: "通話＆チャット", href: "/characters?next=call", icon: Phone },
  { label: "Two-quint mode", jp: "ふたりのチューター", href: "/characters?next=study&pair=1", icon: Users },
  { label: "Language Class", jp: "語学クラス", href: "/language", icon: Languages },
  { label: "Exam Library", jp: "試験ライブラリー", href: "/exams", icon: Library },
  { label: "Exam Drill", jp: "試験演習", href: "/exams/drill", icon: GraduationCap },
  { label: "Characters", jp: "キャラクター", href: "/characters", icon: Clapperboard },
  { label: "Notes", jp: "ノート", href: "/notes", icon: NotebookPen },
  { label: "Memory", jp: "メモリー", href: "/memory", icon: Brain },
  { label: "Settings", jp: "設定", icon: Settings, action: "settings" },
  { label: "Credits", jp: "クレジット", icon: BookOpenCheck, action: "credits" },
];

export function MainMenu() {
  const seen = useIntroSeen();
  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}
    introListeners.forEach((l) => l());
  }, []);
  const openSettings = useOpenSettings();
  const [credits, setCredits] = useState(false);
  const { user } = useUser();

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-8">
      {!seen && <Intro onDone={finishIntro} />}
      <PaperBackdrop />
      <div className="paper-card fade-up relative w-full max-w-md px-8 pt-8 pb-6 text-center">
        <p className="font-sans text-[10px] tracking-[0.3em] text-sumi-soft">メインメニュー ／ MAIN MENU</p>
        <div className="mt-4">
          <Logo size="md" />
        </div>
        <p className="mt-3 text-sm italic text-sumi-soft">Finding the answer behind every problem.</p>
        <div className="mt-3 flex justify-center gap-1.5">
          {CAST.map((c) => (
            <span key={c.tutor.id} title={c.tutor.name} className="font-jp text-xs" style={{ color: c.hue }}>
              {c.numeral}
            </span>
          ))}
        </div>

        <nav className="mx-auto mt-5 grid w-fit gap-0.5 text-left">
          {ITEMS.map((it) => {
            const content = (
              <>
                <it.icon className="size-4 text-sumi-soft transition group-hover:text-rose" />
                <span className="text-[17px]">{it.label}</span>
                <span className="ml-auto pl-6 font-jp text-[10px] text-sumi-soft/70">{it.jp}</span>
              </>
            );
            const cls = "group flex items-center gap-3 rounded-[3px] px-3 py-1 transition hover:bg-rose/10";
            return it.href ? (
              <Link key={it.label} href={it.href} className={cls}>
                {content}
              </Link>
            ) : (
              <button
                key={it.label}
                type="button"
                className={cls}
                onClick={() => (it.action === "settings" ? openSettings() : setCredits(true))}
              >
                {content}
              </button>
            );
          })}
        </nav>

        <div className="dotted-rule mt-5" />
        <p className="mt-3 font-jp text-sm">学ぶ、読む、話す。</p>
        <p className="font-sans text-xs text-sumi-soft">Choose how you want to study.</p>
        <div className="mt-4 flex items-center justify-center gap-3 font-sans text-[11px] text-sumi-soft">
          {user && <span className="max-w-48 truncate">{user.email}</span>}
          <Link href="/chat" className="underline-offset-2 hover:underline">
            Classic chat
          </Link>
          <Link href="/account" className="underline-offset-2 hover:underline">
            Account
          </Link>
        </div>
      </div>
      {credits && <Credits onClose={() => setCredits(false)} />}
    </div>
  );
}

function Credits({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2622]/40 p-4" onClick={onClose}>
      <div className="paper-card fade-up relative w-full max-w-sm p-7 text-center" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute top-3 right-3 text-sumi-soft">
          <X className="size-4" />
        </button>
        <h2 className="text-2xl">Credits</h2>
        <div className="dotted-rule my-4" />
        <p className="text-sm leading-relaxed">
          A fan-made study companion inspired by <i>The Quintessential Quintuplets</i> (五等分の花嫁) by Negi Haruba.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-sumi-soft">
          Characters and artwork belong to their respective owners. This project is non-commercial.
        </p>
        <p className="mt-4 font-sans text-xs text-sumi-soft">Built with Next.js · Voices by your browser&apos;s speech engine</p>
      </div>
    </div>
  );
}
