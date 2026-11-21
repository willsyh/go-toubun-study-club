"use client";

import { Brain, Database, Mic, Palette, User, X } from "lucide-react";
import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { clearAllLocalData } from "@/lib/local-store";
import { setPref, usePref } from "@/lib/prefs";
import { CAST } from "@/lib/studio/cast";
import {
  DEFAULT_SETTINGS,
  LANGUAGES,
  saveStudioSettings,
  useStudioSettings,
  type StudioSettings,
} from "@/lib/studio/settings";
import { speak } from "@/lib/studio/speech";
import { DEFAULT_TUTOR, type TutorId } from "@/lib/tutors";

const SettingsContext = createContext<{ open: () => void }>({ open: () => {} });

export function useOpenSettings() {
  return useContext(SettingsContext).open;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  // Close when the page gets hidden by a navigation (Activity keeps state).
  useLayoutEffect(() => () => setOpen(false), []);
  return (
    <SettingsContext value={{ open: () => setOpen(true) }}>
      {children}
      {open && <SettingsDialog onClose={() => setOpen(false)} />}
    </SettingsContext>
  );
}

const TABS = [
  { id: "ai", label: "AI", icon: Brain },
  { id: "character", label: "Character", icon: User },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "storage", label: "Storage", icon: Database },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SettingsDialog({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabId>("voice");
  const s = useStudioSettings();
  const set = <K extends keyof StudioSettings>(k: K, v: StudioSettings[K]) => saveStudioSettings({ ...s, [k]: v });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2622]/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="paper-card fade-up flex max-h-[88dvh] w-full max-w-xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-5">
          <div>
            <h2 className="text-2xl">Settings</h2>
            <p className="text-sm text-sumi-soft">Everything is saved locally on this device.</p>
          </div>
          <button type="button" aria-label="Close settings" onClick={onClose} className="rounded p-1 text-sumi-soft hover:bg-sepia/40">
            <X className="size-5" />
          </button>
        </div>

        <div role="tablist" className="mt-4 grid grid-cols-5 gap-1 border-y border-sepia/70 px-4 py-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1.5 rounded-[3px] py-1.5 font-sans text-xs transition ${
                tab === id ? "bg-rose/15 text-rose" : "text-sumi-soft hover:bg-sepia/30"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-6 py-4 font-sans">
          {tab === "ai" && (
            <>
              <Row title="Reply language" hint="Language the tutors answer in once an AI model is connected.">
                <LangSelect value={s.replyLang} onChange={(v) => set("replyLang", v)} />
              </Row>
              <Row title="Japanese subtitles" hint="Show the Japanese line under the dialogue box.">
                <Toggle on={s.showSubtitlesJa} onChange={(v) => set("showSubtitlesJa", v)} />
              </Row>
              <p className="rounded-[3px] border border-dashed border-sepia bg-paper/60 p-3 text-xs leading-relaxed text-sumi-soft">
                Replies are demo answers for now. Connect a model in <code>src/lib/studio/demo-brain.ts</code>.
              </p>
            </>
          )}
          {tab === "character" && <CharacterTab />}
          {tab === "voice" && (
            <>
              <Row title="Voice enabled" hint="Tutors read their lines aloud.">
                <Toggle on={s.voiceEnabled} onChange={(v) => set("voiceEnabled", v)} />
              </Row>
              <Row title="Auto-play replies" hint="Speak every new reply without pressing play.">
                <Toggle on={s.autoPlay} onChange={(v) => set("autoPlay", v)} />
              </Row>
              <Row title={`Speed · ${s.speed.toFixed(1)}×`} hint="How fast the voice talks.">
                <Slider min={0.5} max={2} step={0.1} value={s.speed} onChange={(v) => set("speed", v)} />
              </Row>
              <Row title={`Volume · ${Math.round(s.volume * 100)}%`}>
                <Slider min={0} max={1} step={0.05} value={s.volume} onChange={(v) => set("volume", v)} />
              </Row>
              <Row title="Voice language" hint="Uses the voices installed in your browser. 13 languages.">
                <LangSelect value={s.voiceLang} onChange={(v) => set("voiceLang", v)} />
              </Row>
              <div className="flex justify-end pt-1">
                <button type="button" className="paper-btn" onClick={() => speak("Hello! Ready to study together?", { force: true, pitch: 1.2 })}>
                  Test voice
                </button>
              </div>
            </>
          )}
          {tab === "appearance" && (
            <>
              <Row title={`Text speed · ${s.textSpeed === 0 ? "instant" : `${s.textSpeed} chars/s`}`} hint="Typewriter speed in the dialogue box.">
                <Slider min={0} max={120} step={10} value={s.textSpeed} onChange={(v) => set("textSpeed", v)} />
              </Row>
              <Row title="Paper decorations" hint="Faint graph lines and circles behind the menus.">
                <Toggle on={s.decorations} onChange={(v) => set("decorations", v)} />
              </Row>
              <Row title="Replay intro" hint="Show the opening sequence next time you open the main menu.">
                <button
                  type="button"
                  className="paper-btn"
                  onClick={() => {
                    try {
                      sessionStorage.removeItem("gt:intro-seen");
                    } catch {}
                  }}
                >
                  Reset
                </button>
              </Row>
              <div className="flex justify-end pt-1">
                <button type="button" className="paper-btn" onClick={() => saveStudioSettings(DEFAULT_SETTINGS)}>
                  Restore defaults
                </button>
              </div>
            </>
          )}
          {tab === "storage" && <StorageTab />}
        </div>
      </div>
    </div>
  );
}

function CharacterTab() {
  const tutorId = usePref<TutorId>("gt:tutor", DEFAULT_TUTOR);
  return (
    <>
      <p className="pb-2 text-sm text-sumi-soft">Default tutor for new study sessions.</p>
      <div className="grid grid-cols-5 gap-2">
        {CAST.map((c) => (
          <button
            key={c.tutor.id}
            type="button"
            onClick={() => setPref("gt:tutor", c.tutor.id)}
            className="rounded-[3px] border-2 px-1 py-2 text-center text-xs transition"
            style={{
              borderColor: c.tutor.id === tutorId ? c.hue : "transparent",
              background: `${c.hue}26`,
            }}
          >
            <span className="block font-jp text-sm">{c.kanji.slice(2)}</span>
            {c.tutor.name}
          </button>
        ))}
      </div>
    </>
  );
}

function StorageTab() {
  const [done, setDone] = useState(false);
  return (
    <>
      <Row title="Local data" hint="Study chats, notes and memory are stored in this browser only.">
        <button
          type="button"
          className="paper-btn text-red-700!"
          onClick={() => {
            if (window.confirm("Delete all chats, notes and memory on this device? This cannot be undone.")) {
              clearAllLocalData();
              setDone(true);
            }
          }}
        >
          Clear
        </button>
      </Row>
      {done && <p className="text-sm text-green-700">Local data cleared.</p>}
      <Row title="Account" hint="Password, backup and account deletion.">
        <a href="/account" className="paper-btn">
          Open
        </a>
      </Row>
    </>
  );
}

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dashed border-sepia/70 py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {hint && <p className="text-xs text-sumi-soft">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition ${on ? "bg-rose" : "bg-sepia"}`}
    >
      <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${on ? "left-4.5" : "left-0.5"}`} />
    </button>
  );
}

function Slider(props: { min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="range"
      min={props.min}
      max={props.max}
      step={props.step}
      value={props.value}
      onChange={(e) => props.onChange(Number(e.target.value))}
      className="w-40 accent-[var(--rose)]"
    />
  );
}

function LangSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="paper-field w-48! py-1! text-sm!">
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
