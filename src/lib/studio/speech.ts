"use client";

import { readStudioSettings } from "./settings";

/**
 * Tutor voices through the browser's built-in speech synthesis. Each sister
 * gets her own pitch; language, speed and volume come from Settings.
 */

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const base = lang.split("-")[0];
  return (
    voices.find((v) => v.lang === lang && /female|woman|zira|haruka|ayumi|nanami|google/i.test(v.name)) ??
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(base))
  );
}

/** Speaks `text`; resolves when done (or immediately when voice is off). */
export function speak(text: string, opts: { pitch?: number; lang?: string; force?: boolean } = {}): Promise<void> {
  const s = readStudioSettings();
  if (!canSpeak() || (!s.voiceEnabled && !opts.force) || !text.trim()) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text.replace(/[*_`#>]/g, ""));
    u.lang = opts.lang ?? s.voiceLang;
    const voice = pickVoice(u.lang);
    if (voice) u.voice = voice;
    u.rate = s.speed;
    u.volume = s.volume;
    u.pitch = opts.pitch ?? 1;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/** Browser speech recognition, when available (Chrome / Edge). */
export function createRecognizer(): Recognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = readStudioSettings().voiceLang;
  r.interimResults = true;
  r.continuous = false;
  return r;
}
