"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCollection } from "@/lib/local-store";
import { getTutor } from "@/lib/tutors";
import { TutorAvatar } from "./tutor-avatar";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <SearchPanel onClose={onClose} />;
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const chats = useCollection("chats");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted.slice(0, 20).map((chat) => ({ chat, snippet: "" }));
    return sorted
      .map((chat) => {
        if (chat.title.toLowerCase().includes(q)) return { chat, snippet: "" };
        const hit = chat.messages.find((m) => m.text.toLowerCase().includes(q));
        if (!hit) return null;
        const i = hit.text.toLowerCase().indexOf(q);
        const start = Math.max(0, i - 30);
        return { chat, snippet: `${start > 0 ? "…" : ""}${hit.text.slice(start, i + q.length + 50)}…` };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [chats, query]);

  function openChat(id: string) {
    router.push(`/?c=${id}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[12vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search chats"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(c + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              } else if (e.key === "Enter" && results[cursor]) {
                openChat(results[cursor].chat.id);
              }
            }}
            placeholder="Search chats…"
            className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="rounded-md p-1 text-muted hover:bg-hover">
            <X className="size-5" />
          </button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-[15px] text-muted">
              {chats.length ? "No chats match that." : "No chats yet. Start one from New chat."}
            </li>
          )}
          {results.map(({ chat, snippet }, i) => (
            <li key={chat.id}>
              <button
                type="button"
                onClick={() => openChat(chat.id)}
                onMouseEnter={() => setCursor(i)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left ${i === cursor ? "bg-hover" : ""}`}
              >
                <TutorAvatar tutor={getTutor(chat.tutorId)} size={26} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink">{chat.title}</span>
                  {snippet && <span className="mt-0.5 block truncate text-sm text-muted">{snippet}</span>}
                </span>
                <span className="shrink-0 pt-0.5 text-xs text-muted">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
