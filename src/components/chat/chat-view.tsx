"use client";

import { Check, Copy, FileText, NotebookPen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PortraitView, TutorAvatar } from "@/components/app/tutor-avatar";
import { useUser } from "@/components/app/user-context";
import {
  getCollection,
  newId,
  update,
  useCollection,
  type Attachment,
  type Chat,
  type Message,
} from "@/lib/local-store";
import { createReply } from "@/lib/mock-tutor";
import { setPref, usePref } from "@/lib/prefs";
import { DEFAULT_TUTOR, TUTORS, getTutor, type Tutor, type TutorId } from "@/lib/tutors";
import { Composer } from "./composer";

const DISCLAIMER = "Answers can be wrong. Check anything important.";

export function ChatView() {
  const chatId = useSearchParams().get("c");
  const chats = useCollection("chats");
  const { user } = useUser();
  const chat = chatId ? chats.find((c) => c.id === chatId) : undefined;

  if (!user) return null; // waiting for the account (and its local data) to load
  if (chatId && !chat) return <MissingChat />;
  return chat ? <Conversation key={chat.id} chat={chat} /> : <NewChat />;
}

// ---------------------------------------------------------------- new chat

function NewChat() {
  const router = useRouter();
  const tutorId = usePref<TutorId>("gt:tutor", DEFAULT_TUTOR);
  const tutor = getTutor(tutorId);

  function start(text: string, attachments: Attachment[]) {
    const now = Date.now();
    const chat: Chat = {
      id: newId(),
      title: makeTitle(text, attachments),
      tutorId: tutor.id,
      messages: [userMessage(text, attachments)],
      createdAt: now,
      updatedAt: now,
    };
    update("chats", (list) => [...list, chat]);
    router.push(`/?c=${chat.id}`);
    scheduleReply(chat.id);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between overflow-y-auto px-4">
      <div className="flex w-full max-w-244 flex-1 flex-col items-center justify-center pb-10">
        <TutorAvatar tutor={tutor} size={150} />
        <h1 className="mt-6 text-center text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          What do you want to learn?
        </h1>
        <p className="mt-2 text-center text-[15px] text-muted">
          Studying with <span className="font-medium text-ink">{tutor.name}</span> · {tutor.subjects}
        </p>
        <div className="mt-8 w-full">
          <Composer onSend={start} autoFocus />
        </div>
        <TutorPicker selected={tutor.id} />
      </div>
      <p className="py-3 text-center text-sm text-muted">{DISCLAIMER}</p>
    </div>
  );
}

function TutorPicker({ selected }: { selected: TutorId }) {
  return (
    <div className="mt-8 w-full">
      <p className="mb-3 text-center text-sm text-muted">Choose your tutor</p>
      <div role="radiogroup" aria-label="Tutor" className="flex flex-wrap justify-center gap-2">
        {TUTORS.map((t) => {
          const active = t.id === selected;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={`${t.role} — ${t.intro}`}
              onClick={() => setPref("gt:tutor", t.id)}
              className={`flex items-center gap-2 rounded-full border py-1 pr-3.5 pl-1 text-[15px] transition ${
                active ? "border-transparent font-medium text-ink" : "border-line text-ink-soft hover:bg-hover"
              }`}
              style={active ? { backgroundColor: `${t.color}1f`, borderColor: t.color } : undefined}
            >
              <TutorAvatar tutor={t} size={28} />
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ conversation

function Conversation({ chat }: { chat: Chat }) {
  const tutor = getTutor(chat.tutorId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typing = useTyping(chat.id);
  const speaking = useSpeaking(chat.id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [chat.messages.length, typing]);

  function send(text: string, attachments: Attachment[]) {
    update("chats", (list) =>
      list.map((c) =>
        c.id === chat.id
          ? { ...c, messages: [...c.messages, userMessage(text, attachments)], updatedAt: Date.now() }
          : c,
      ),
    );
    scheduleReply(chat.id);
  }

  return (
    <div className="flex min-h-0 flex-1">
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4">
        <div className="mx-auto w-full max-w-3xl pt-2 pb-8">
          <div className="mb-6 flex items-center gap-3 border-b border-line pb-4">
            <TutorAvatar tutor={tutor} size={40} talking={speaking} />
            <div className="min-w-0">
              <p className="font-semibold text-ink">{tutor.name}</p>
              <p className="truncate text-sm text-muted">
                {speaking ? `${tutor.name} is explaining…` : typing ? `${tutor.name} is thinking…` : tutor.role}
              </p>
            </div>
          </div>
          <ul className="space-y-6">
            {chat.messages.map((m) => (
              <li key={m.id}>
                {m.role === "user" ? (
                  <UserBubble message={m} />
                ) : (
                  <TutorMessage message={m} chat={chat} animate={freshReplies.has(m.id)} />
                )}
              </li>
            ))}
            {typing && (
              <li className="flex items-center gap-3">
                <TutorAvatar tutor={tutor} size={32} />
                <span className="flex gap-1" aria-label={`${tutor.name} is typing`}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="typing-dot size-2 rounded-full bg-muted" />
                  ))}
                </span>
              </li>
            )}
          </ul>
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="px-4">
        <div className="mx-auto w-full max-w-3xl">
          <Composer onSend={send} disabled={typing} placeholder={`Ask ${tutor.name} anything`} />
          <p className="py-3 text-center text-sm text-muted">{DISCLAIMER}</p>
        </div>
      </div>
    </div>
    {tutor.portrait && <TeachingStage tutor={tutor} talking={speaking} thinking={typing} />}
    </div>
  );
}

/** The tutor's full portrait beside the chat on wide screens; her mouth moves while she talks. */
function TeachingStage({ tutor, talking, thinking }: { tutor: Tutor; talking: boolean; thinking: boolean }) {
  const portrait = tutor.portrait!;
  return (
    <aside className="hidden w-85 shrink-0 flex-col justify-end gap-3 pr-6 pb-20 xl:flex" aria-hidden>
      <div className="relative w-full self-end">
        <p
          className={`absolute -top-3 left-4 z-10 max-w-[85%] -translate-y-full rounded-2xl rounded-bl-sm border border-line bg-canvas px-4 py-2 text-[15px] text-ink shadow-sm transition-opacity ${
            talking || thinking ? "opacity-100" : "opacity-0"
          }`}
        >
          {talking ? "Listen carefully, okay?" : "Hmm, let me think…"}
        </p>
        <div
          className="relative w-full overflow-hidden rounded-3xl border border-line shadow-sm"
          style={{ aspectRatio: `${portrait.width} / ${portrait.height}`, borderColor: talking ? tutor.color : undefined }}
        >
          <span className={`absolute inset-0 block ${talking ? "talk-bob" : ""}`}>
            <PortraitView portrait={portrait} talking={talking} sizePx={340} />
          </span>
        </div>
      </div>
    </aside>
  );
}

function UserBubble({ message }: { message: Message }) {
  return (
    <div className="flex flex-col items-end gap-2">
      {message.attachments?.length ? <AttachmentList items={message.attachments} /> : null}
      {message.text && (
        <p className="max-w-[85%] rounded-3xl bg-bubble px-5 py-3 text-[17px] leading-relaxed whitespace-pre-wrap text-ink">
          {message.text}
        </p>
      )}
    </div>
  );
}

function TutorMessage({ message, chat, animate }: { message: Message; chat: Chat; animate: boolean }) {
  const tutor = getTutor(chat.tutorId);
  const shown = useTypewriter(message.text, animate);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const done = shown.length >= message.text.length;
  const talking = animate && !done;
  const endRef = useRef<HTMLSpanElement>(null);

  // While the reply is being "spoken", animate the tutor's mouth and keep the text in view.
  useEffect(() => {
    if (!talking) return;
    setSpeaking(chat.id, true);
    return () => setSpeaking(chat.id, false);
  }, [talking, chat.id]);

  useEffect(() => {
    if (talking) endRef.current?.scrollIntoView({ block: "nearest" });
    if (animate && done) freshReplies.delete(message.id);
  }, [shown, talking, animate, done, message.id]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  function saveToNotes() {
    const now = Date.now();
    update("notes", (notes) => [
      ...notes,
      { id: newId(), title: chat.title, body: `${tutor.name}:\n${message.text}`, createdAt: now, updatedAt: now },
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex gap-3">
      <TutorAvatar tutor={tutor} size={32} talking={talking} />
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-[17px] leading-relaxed whitespace-pre-wrap text-ink">
          {shown}
          <span ref={endRef} />
        </p>
        {done && (
          <div className="mt-2 flex items-center gap-1 text-muted">
            <ActionButton label={copied ? "Copied" : "Copy"} onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </ActionButton>
            <ActionButton label={saved ? "Saved to notes" : "Save to notes"} onClick={saveToNotes}>
              {saved ? <Check className="size-4" /> : <NotebookPen className="size-4" />}
            </ActionButton>
            {message.demo && (
              <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs">
                Demo reply · AI not connected yet
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-md transition hover:bg-hover hover:text-ink"
    >
      {children}
    </button>
  );
}

function AttachmentList({ items }: { items: Attachment[] }) {
  return (
    <ul className="flex max-w-[85%] flex-wrap justify-end gap-2">
      {items.map((a, i) => (
        <li key={`${a.name}-${i}`} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-ink">
          <FileText className="size-4 text-muted" />
          <span className="max-w-48 truncate">{a.name}</span>
          <span className="text-muted">{formatSize(a.size)}</span>
        </li>
      ))}
    </ul>
  );
}

function MissingChat() {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-lg text-ink">This chat isn&apos;t in this browser.</p>
      <p className="max-w-md text-muted">Chats are saved only on the device where you had them.</p>
      <button type="button" onClick={() => router.replace("/")} className="btn-primary h-11! w-auto! px-6 text-base!">
        Start a new chat
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ helpers

function userMessage(text: string, attachments: Attachment[]): Message {
  return { id: newId(), role: "user", text, attachments: attachments.length ? attachments : undefined, createdAt: Date.now() };
}

function makeTitle(text: string, attachments: Attachment[]) {
  const base = text.replace(/\s+/g, " ").trim() || attachments[0]?.name || "New chat";
  return base.length > 48 ? `${base.slice(0, 45).trimEnd()}…` : base;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Chats currently waiting for a reply; module-level so the typing dots survive navigation. */
const typingChats = new Set<string>();
const typingListeners = new Set<() => void>();
/** Replies written during this page visit; only these get the typewriter effect. */
const freshReplies = new Set<string>();

function setTyping(chatId: string, on: boolean) {
  if (on) typingChats.add(chatId);
  else typingChats.delete(chatId);
  typingListeners.forEach((l) => l());
}

function subscribeTyping(listener: () => void) {
  typingListeners.add(listener);
  return () => void typingListeners.delete(listener);
}

function useTyping(chatId: string) {
  return useSyncExternalStore(
    subscribeTyping,
    () => typingChats.has(chatId),
    () => false,
  );
}

/** Chats whose tutor is currently "speaking" (reply being revealed). Shares the typing listeners. */
const speakingChats = new Set<string>();

function setSpeaking(chatId: string, on: boolean) {
  if (on) speakingChats.add(chatId);
  else speakingChats.delete(chatId);
  typingListeners.forEach((l) => l());
}

function useSpeaking(chatId: string) {
  return useSyncExternalStore(
    subscribeTyping,
    () => speakingChats.has(chatId),
    () => false,
  );
}

/**
 * Writes the tutor's reply after a short "typing" pause.
 * This is the one place to swap for a real AI call later.
 */
function scheduleReply(chatId: string) {
  setTyping(chatId, true);
  setTimeout(() => {
    const chat = getCollection("chats").find((c) => c.id === chatId);
    if (!chat) return setTyping(chatId, false);
    const question = [...chat.messages].reverse().find((m) => m.role === "user");
    const text = createReply({
      tutor: getTutor(chat.tutorId),
      question: question?.text ?? "",
      attachmentNames: question?.attachments?.map((a) => a.name) ?? [],
      memory: getCollection("memory").map((m) => m.text),
    });
    const reply: Message = { id: newId(), role: "tutor", text, demo: true, createdAt: Date.now() };
    freshReplies.add(reply.id);
    update("chats", (list) =>
      list.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, reply], updatedAt: Date.now() } : c)),
    );
    setTyping(chatId, false);
  }, 900 + Math.random() * 600);
}

/** Reveals text a few characters at a time for freshly written replies. */
function useTypewriter(text: string, animate: boolean) {
  const [count, setCount] = useState(animate ? 0 : text.length);
  useEffect(() => {
    if (count >= text.length) return;
    // ~2 characters every 28ms: slow enough to read along while the tutor "talks".
    const id = setTimeout(() => setCount((c) => Math.min(text.length, c + 2)), 28);
    return () => clearTimeout(id);
  }, [count, text.length]);
  return text.slice(0, count);
}
