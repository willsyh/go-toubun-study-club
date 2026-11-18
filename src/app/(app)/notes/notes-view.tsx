"use client";

import { ArrowLeft, Plus, Search, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { newId, update, useCollection, type Note } from "@/lib/local-store";

export function NotesView() {
  const notes = useCollection("notes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...notes]
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, query]);
  const selected = notes.find((n) => n.id === selectedId) ?? null;

  function create() {
    const now = Date.now();
    const note: Note = { id: newId(), title: "", body: "", createdAt: now, updatedAt: now };
    update("notes", (list) => [...list, note]);
    setSelectedId(note.id);
  }

  function edit(id: string, patch: Partial<Pick<Note, "title" | "body">>) {
    update("notes", (list) => list.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));
  }

  function remove(id: string) {
    if (!window.confirm("Delete this note?")) return;
    update("notes", (list) => list.filter((n) => n.id !== id));
    setSelectedId(null);
  }

  return (
    <div className="flex min-h-0 flex-1 border-t border-line">
      <section
        className={`flex w-full flex-col border-r border-line md:w-80 md:shrink-0 ${selected ? "hidden md:flex" : "flex"}`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h1 className="text-2xl font-semibold text-ink">Notes</h1>
          <button
            type="button"
            onClick={create}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-fg hover:bg-brand-hover"
          >
            <Plus className="size-4" /> New note
          </button>
        </div>
        <div className="px-4 pb-3">
          <label className="flex items-center gap-2 rounded-lg border border-line px-3">
            <Search className="size-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes"
              className="h-10 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
            />
          </label>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {sorted.length === 0 && (
            <li className="px-3 py-10 text-center text-[15px] text-muted">
              {notes.length
                ? "No notes match."
                : "No notes yet. Write one here, or save a tutor's answer from a chat."}
            </li>
          )}
          {sorted.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => setSelectedId(n.id)}
                className={`w-full rounded-lg px-3 py-2.5 text-left transition hover:bg-hover ${
                  n.id === selectedId ? "bg-hover" : ""
                }`}
              >
                <span className="block truncate text-[15px] font-medium text-ink">{n.title || "Untitled"}</span>
                <span className="mt-0.5 block truncate text-sm text-muted">
                  {new Date(n.updatedAt).toLocaleDateString()} · {n.body.slice(0, 60) || "Empty note"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={`min-w-0 flex-1 flex-col ${selected ? "flex" : "hidden md:flex"}`}>
        {selected ? (
          <>
            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-ink-soft hover:bg-hover md:invisible"
              >
                <ArrowLeft className="size-4" /> All notes
              </button>
              <div className="flex items-center gap-3 text-sm text-muted">
                <span>Saved · {new Date(selected.updatedAt).toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => remove(selected.id)}
                  aria-label="Delete note"
                  title="Delete note"
                  className="rounded-md p-2 hover:bg-hover hover:text-danger"
                >
                  <Trash className="size-4" />
                </button>
              </div>
            </div>
            <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col px-6 pb-8">
              <input
                value={selected.title}
                onChange={(e) => edit(selected.id, { title: e.target.value })}
                placeholder="Title"
                aria-label="Note title"
                className="bg-transparent py-2 text-3xl font-semibold text-ink outline-none placeholder:text-muted/60"
              />
              <textarea
                value={selected.body}
                onChange={(e) => edit(selected.id, { body: e.target.value })}
                placeholder="Start writing…"
                aria-label="Note body"
                className="mt-2 min-h-0 flex-1 resize-none bg-transparent text-[17px] leading-relaxed text-ink outline-none placeholder:text-muted"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-muted">
            Pick a note, or start a new one.
          </div>
        )}
      </section>
    </div>
  );
}
