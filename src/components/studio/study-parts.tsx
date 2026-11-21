"use client";

import { ArrowUp, Mic, Paperclip, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { getCollection, update, type Chat } from "@/lib/local-store";
import { CAST, getCast, isTutorId, type CastMember } from "@/lib/studio/cast";
import type { ReplyLine } from "@/lib/studio/demo-brain";
import { createRecognizer, speak, stopSpeaking } from "@/lib/studio/speech";
import type { DialogueLine } from "./stage";

/** Tutors from "?t=miku,nino", falling back to the saved tutor. */
export function castFromParam(param: string | null, fallback: string): CastMember[] {
  const ids = (param ?? "").split(",").filter(isTutorId);
  const unique = [...new Set(ids)].slice(0, 2);
  return (unique.length ? unique : [fallback]).map((id) => getCast(id));
}

export function toDialogue(lines: ReplyLine[], cast: CastMember[]): DialogueLine[] {
  return lines.map((l) => {
    const m = cast[l.speaker] ?? cast[0];
    return { speaker: m.tutor.id, name: m.tutor.name, color: m.hue === "#f2d94e" ? "#b39114" : m.tutor.color, text: l.text };
  });
}

/** Plays a list of dialogue lines through the browser voice, one sister at a time. */
export function useVoice() {
  const [speaking, setSpeaking] = useState<string | null>(null);
  const run = useRef(0);

  // Stop talking when the page is hidden by a navigation.
  useLayoutEffect(
    () => () => {
      run.current++;
      stopSpeaking();
    },
    [],
  );

  async function play(lines: DialogueLine[], force = false) {
    const id = ++run.current;
    stopSpeaking();
    for (const l of lines) {
      if (run.current !== id) return;
      setSpeaking(l.speaker);
      await speak(l.text, { pitch: getCast(l.speaker).pitch, force });
    }
    if (run.current === id) setSpeaking(null);
  }

  function stop() {
    run.current++;
    stopSpeaking();
    setSpeaking(null);
  }

  return {
    speaking,
    play,
    stop,
    pause: () => window.speechSynthesis?.pause(),
    resume: () => window.speechSynthesis?.resume(),
  };
}

/** Saves an exchange into the shared chats collection (so Search/Chats can find it). */
export function saveExchange(chatId: string | null, cast: CastMember[], question: string, lines: DialogueLine[], newId: () => string) {
  const now = Date.now();
  const text = lines.map((l) => (cast.length > 1 ? `${l.name}: ${l.text}` : l.text)).join("\n\n");
  const user = { id: newId(), role: "user" as const, text: question, createdAt: now };
  const tutor = { id: newId(), role: "tutor" as const, text, demo: true, createdAt: now + 1 };
  if (chatId && getCollection("chats").some((c) => c.id === chatId)) {
    update("chats", (chats) => chats.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, user, tutor], updatedAt: now } : c)));
    return chatId;
  }
  const chat: Chat = {
    id: newId(),
    title: `${cast.map((c) => c.tutor.name).join(" & ")} · ${question.slice(0, 48)}`,
    tutorId: cast[0].tutor.id,
    messages: [user, tutor],
    createdAt: now,
    updatedAt: now,
  };
  update("chats", (chats) => [chat, ...chats]);
  return chat.id;
}

/** Bottom input of the study rooms: tool icons, question box, rose send button. */
export function StudyComposer({
  placeholder,
  onSend,
  disabled,
  onAttach,
  suggestions = [],
}: {
  placeholder: string;
  onSend: (text: string) => void;
  disabled?: boolean;
  onAttach?: () => void;
  suggestions?: string[];
}) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);

  function send(value = text) {
    const v = value.trim();
    if (!v || disabled) return;
    onSend(v);
    setText("");
  }

  function dictate() {
    const r = createRecognizer();
    if (!r) {
      window.alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    setListening(true);
    r.onresult = (e) => {
      const res = Array.from(e.results as ArrayLike<ArrayLike<{ transcript: string }>>)
        .map((x) => x[0].transcript)
        .join("");
      setText(res);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
  }

  return (
    <div className="shrink-0">
      {suggestions.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => send(s)} disabled={disabled} className="rounded-full border border-sepia bg-white/70 px-2.5 py-0.5 font-sans text-[11px] text-sumi-soft transition hover:border-rose hover:text-rose disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        className="flex items-center gap-2 rounded-[3px] border border-sepia bg-white/85 px-2 py-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        {onAttach && (
          <button type="button" onClick={onAttach} aria-label="Add material" title="Add material" className="rounded p-1 text-sumi-soft hover:bg-sepia/40">
            <Paperclip className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={dictate}
          aria-label="Speak your question"
          title="Speak your question"
          className={`rounded p-1 hover:bg-sepia/40 ${listening ? "text-rose" : "text-sumi-soft"}`}
        >
          <Mic className="size-4" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-sumi-soft/70"
          aria-label={placeholder}
        />
        <button type="submit" aria-label="Send" disabled={disabled || !text.trim()} className="paper-btn-rose px-3! py-1!">
          <ArrowUp className="size-4" />
        </button>
      </form>
    </div>
  );
}

/** Scrollable history of every line said in this session. */
export function LogDialog({ entries, onClose }: { entries: { question: string; lines: DialogueLine[] }[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2622]/40 p-4" onClick={onClose}>
      <div className="paper-card fade-up flex max-h-[80dvh] w-full max-w-2xl flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-sepia px-5 py-3">
          <h2 className="text-xl">Log</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-sumi-soft">
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-3">
          {entries.length === 0 && <p className="text-sm text-sumi-soft">Nothing said yet.</p>}
          {entries.map((e, i) => (
            <div key={i} className="mb-4">
              <p className="font-sans text-xs text-sumi-soft">You: {e.question}</p>
              {e.lines.map((l, j) => (
                <p key={j} className="mt-1 text-[15px]">
                  <b style={{ color: l.color }}>{l.name}:</b> {l.text}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Past study sessions (from the shared chats store). */
export function ChatsDrawer({ chats, onPick, onClose }: { chats: Chat[]; onPick: (c: Chat) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#2b2622]/30" onClick={onClose}>
      <aside className="paper-card fade-in h-full w-80 overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl">Chats</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-sumi-soft">
            <X className="size-4" />
          </button>
        </div>
        {chats.length === 0 && <p className="text-sm text-sumi-soft">No saved sessions yet.</p>}
        <ul className="space-y-1">
          {chats.map((c) => {
            const m = CAST.find((x) => x.tutor.id === c.tutorId);
            return (
              <li key={c.id}>
                <button type="button" onClick={() => onPick(c)} className="w-full rounded-[3px] px-2 py-1.5 text-left hover:bg-sepia/30">
                  <span className="block truncate text-sm">{c.title}</span>
                  <span className="font-sans text-[10px] text-sumi-soft">
                    <span style={{ color: m?.tutor.color }}>{m?.tutor.name}</span> · {new Date(c.updatedAt).toLocaleString()}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
