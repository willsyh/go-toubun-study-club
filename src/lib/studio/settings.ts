"use client";

import { setPref, usePref } from "@/lib/prefs";

export const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "ja-JP", label: "日本語 (Japanese)" },
  { code: "id-ID", label: "Bahasa Indonesia" },
  { code: "ko-KR", label: "한국어 (Korean)" },
  { code: "zh-CN", label: "中文 (Chinese)" },
  { code: "es-ES", label: "Español (Spanish)" },
  { code: "fr-FR", label: "Français (French)" },
  { code: "de-DE", label: "Deutsch (German)" },
  { code: "pt-BR", label: "Português (Portuguese)" },
  { code: "it-IT", label: "Italiano (Italian)" },
  { code: "vi-VN", label: "Tiếng Việt (Vietnamese)" },
  { code: "th-TH", label: "ภาษาไทย (Thai)" },
  { code: "ar-SA", label: "العربية (Arabic)" },
] as const;

export type StudioSettings = {
  voiceEnabled: boolean;
  autoPlay: boolean;
  speed: number;
  volume: number;
  voiceLang: string;
  replyLang: string;
  /** Characters per second for the dialogue typewriter; 0 = instant. */
  textSpeed: number;
  showSubtitlesJa: boolean;
  decorations: boolean;
};

export const DEFAULT_SETTINGS: StudioSettings = {
  voiceEnabled: true,
  autoPlay: false,
  speed: 1,
  volume: 0.8,
  voiceLang: "en-US",
  replyLang: "en-US",
  textSpeed: 60,
  showSubtitlesJa: true,
  decorations: true,
};

const KEY = "gt:studio-settings";

export function useStudioSettings(): StudioSettings {
  const raw = usePref<string>(KEY, "");
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<StudioSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStudioSettings(next: StudioSettings) {
  setPref(KEY, JSON.stringify(next));
}

export function readStudioSettings(): StudioSettings {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<StudioSettings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
