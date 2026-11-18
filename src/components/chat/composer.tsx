"use client";

import { ArrowUp, FileText, Paperclip, X } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import type { Attachment } from "@/lib/local-store";

const MAX_FILES = 5;

export function Composer({
  onSend,
  disabled = false,
  autoFocus = false,
  placeholder = "Ask anything",
}: {
  onSend: (text: string, attachments: Attachment[]) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canSend = !disabled && (text.trim().length > 0 || files.length > 0);

  function resize() {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }

  function send() {
    if (!canSend) return;
    onSend(text.trim(), files);
    setText("");
    setFiles([]);
    requestAnimationFrame(resize);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="w-full rounded-[28px] border border-line-strong bg-field shadow-[0_2px_10px_rgba(15,35,66,0.06)] transition focus-within:border-muted">
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2 px-4 pt-3">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex max-w-56 items-center gap-2 rounded-lg border border-line bg-bubble py-1.5 pr-1.5 pl-2.5 text-sm text-ink"
            >
              <FileText className="size-4 shrink-0 text-muted" />
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => setFiles((list) => list.filter((_, j) => j !== i))}
                aria-label={`Remove ${f.name}`}
                className="rounded p-0.5 text-muted hover:bg-hover hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-end gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Attach files"
          title="Attach files"
          disabled={files.length >= MAX_FILES}
          className="mb-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-hover disabled:opacity-40"
        >
          <Paperclip className="size-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []).map((f) => ({ name: f.name, size: f.size, type: f.type }));
            setFiles((list) => [...list, ...picked].slice(0, MAX_FILES));
            e.target.value = "";
          }}
        />
        <textarea
          ref={textRef}
          rows={1}
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => {
            setText(e.target.value);
            resize();
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Message"
          className="max-h-[220px] min-h-11 flex-1 resize-none bg-transparent py-2.5 text-lg leading-6 text-ink outline-none placeholder:text-muted"
        />
        <button
          type="button"
          onClick={send}
          disabled={!canSend}
          aria-label="Send message"
          className="mb-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-brand-fg transition hover:bg-brand-hover disabled:bg-line-strong disabled:text-canvas"
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
    </div>
  );
}
