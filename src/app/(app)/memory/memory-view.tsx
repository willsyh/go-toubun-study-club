"use client";

import { Bookmark, Trash } from "lucide-react";
import { useState, type FormEvent } from "react";
import { newId, update, useCollection } from "@/lib/local-store";

const EXAMPLES = [
  "I'm in grade 11 and my weakest subject is chemistry.",
  "My final exams start on 10 December.",
  "I learn best with short examples, not long explanations.",
];

export function MemoryView() {
  const memory = useCollection("memory");
  const [text, setText] = useState("");

  function add(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    update("memory", (list) => [...list, { id: newId(), text: value.slice(0, 300), createdAt: Date.now() }]);
    setText("");
  }

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="mx-auto w-full max-w-2xl py-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Memory</h1>
        <p className="mt-2 text-[17px] text-muted">
          Things your tutors should remember about you. Memory stays in this browser and is used in every new
          chat.
        </p>

        <form onSubmit={add} className="mt-6 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            placeholder={EXAMPLES[memory.length % EXAMPLES.length]}
            aria-label="New memory"
            className="field h-12! flex-1"
          />
          <button type="submit" disabled={!text.trim()} className="btn-primary h-12! w-auto! px-5 text-base!">
            Add
          </button>
        </form>

        <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
          {memory.length === 0 && (
            <li className="flex flex-col items-center gap-2 px-6 py-12 text-center text-muted">
              <Bookmark className="size-6" />
              Nothing saved yet. Add your goals, exam dates or how you like to learn.
            </li>
          )}
          {memory.map((m) => (
            <li key={m.id} className="group flex items-start gap-3 px-4 py-3">
              <p className="flex-1 text-[16px] leading-relaxed text-ink">{m.text}</p>
              <button
                type="button"
                onClick={() => update("memory", (list) => list.filter((x) => x.id !== m.id))}
                aria-label="Forget this"
                title="Forget this"
                className="rounded-md p-1.5 text-muted hover:bg-hover hover:text-danger"
              >
                <Trash className="size-4" />
              </button>
            </li>
          ))}
        </ul>

        {memory.length > 1 && (
          <button
            type="button"
            onClick={() => window.confirm("Forget everything in memory?") && update("memory", () => [])}
            className="mt-4 text-sm text-muted hover:text-danger hover:underline"
          >
            Clear all memory
          </button>
        )}
      </div>
    </div>
  );
}
