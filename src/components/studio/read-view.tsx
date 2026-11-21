"use client";

import { ChevronLeft, ChevronRight, FileText, Film, Image as ImageIcon, Link2, MonitorPlay, Trash2, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { newId } from "@/lib/local-store";
import { usePref } from "@/lib/prefs";
import { readingReply } from "@/lib/studio/demo-brain";
import { useStudioSettings } from "@/lib/studio/settings";
import { DEFAULT_TUTOR, type TutorId } from "@/lib/tutors";
import { StudioHeader } from "./chrome";
import { DialogueBox, Stage, type DialogueLine } from "./stage";
import { castFromParam, LogDialog, StudyComposer, toDialogue, useVoice } from "./study-parts";

type Material =
  | { id: string; kind: "image"; name: string; url: string }
  | { id: string; kind: "pdf"; name: string; url: string }
  | { id: string; kind: "video"; name: string; url: string }
  | { id: string; kind: "youtube"; name: string; videoId: string };

const ICONS = { image: ImageIcon, pdf: FileText, video: Film, youtube: MonitorPlay };

function youtubeId(link: string): string | null {
  const m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/.exec(link.trim());
  return m ? m[1] : null;
}

export function ReadView() {
  const params = useSearchParams();
  const saved = usePref<TutorId>("gt:tutor", DEFAULT_TUTOR);
  const cast = castFromParam(params.get("t"), saved);
  const names = cast.map((c) => c.tutor.name).join(" & ");
  const settings = useStudioSettings();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [index, setIndex] = useState(0);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [log, setLog] = useState<{ question: string; lines: DialogueLine[] }[]>([]);
  const [thinking, setThinking] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const voice = useVoice();
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const current = materials[Math.min(index, materials.length - 1)];
  const last = log[log.length - 1];

  function addFiles(files: FileList | null) {
    if (!files) return;
    const added: Material[] = [];
    for (const f of Array.from(files)) {
      const url = URL.createObjectURL(f);
      urls.current.push(url);
      if (f.type.startsWith("image/")) added.push({ id: newId(), kind: "image", name: f.name, url });
      else if (f.type === "application/pdf") added.push({ id: newId(), kind: "pdf", name: f.name, url });
      else if (f.type.startsWith("video/")) added.push({ id: newId(), kind: "video", name: f.name, url });
      else URL.revokeObjectURL(url);
    }
    if (!added.length) return;
    setMaterials((m) => [...m, ...added]);
    setIndex(materials.length);
    react(`I added ${added.map((a) => a.name).join(", ")}.`, added[0].name);
  }

  function addLink() {
    const id = youtubeId(link);
    if (!id) {
      setLinkError("That doesn't look like a YouTube link.");
      return;
    }
    setLinkError("");
    setMaterials((m) => [...m, { id: newId(), kind: "youtube", name: `YouTube · ${id}`, videoId: id }]);
    setIndex(materials.length);
    setLink("");
    react("I added a YouTube video.", "this video");
  }

  function remove(id: string) {
    setMaterials((m) => {
      const gone = m.find((x) => x.id === id);
      if (gone && "url" in gone) URL.revokeObjectURL(gone.url);
      return m.filter((x) => x.id !== id);
    });
    setIndex(0);
  }

  function react(question: string, material: string | null) {
    voice.stop();
    setThinking(true);
    window.setTimeout(() => {
      const lines = toDialogue(readingReply(question, material, cast), cast);
      setLog((l) => [...l, { question, lines }]);
      setThinking(false);
      if (settings.autoPlay) void voice.play(lines);
    }, 800);
  }

  return (
    <div className="flex h-dvh flex-col">
      <StudioHeader
        title="Read & Chat"
        subtitle={`${names} · ${materials.length} item${materials.length === 1 ? "" : "s"} on the desk`}
        hide={["read"]}
        callHref={`/call?t=${cast[0].tutor.id}`}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5">
          <Stage members={cast} speaking={voice.speaking ?? typing} className="aspect-[16/8] w-full shrink-0 lg:aspect-auto lg:min-h-0 lg:flex-1" />
          <DialogueBox
            question={last?.question}
            lines={last?.lines ?? []}
            thinking={thinking}
            thinkingName={names}
            speakingLabel={voice.speaking ? "Speaking…" : undefined}
            onPlay={() => last && void voice.play(last.lines, true)}
            onPause={voice.pause}
            onStop={voice.stop}
            onLog={() => setShowLog(true)}
            onTypingChange={setTyping}
            compact
          />
          <StudyComposer
            placeholder={current ? `Ask ${names} about “${current.name}”…` : `Ask ${names} about your reading…`}
            onSend={(q) => react(q, current?.name ?? null)}
            disabled={thinking}
            onAttach={() => fileInput.current?.click()}
          />
        </div>

        <aside className="paper-card flex min-h-[460px] w-full shrink-0 flex-col overflow-hidden lg:min-h-0 lg:w-[400px]">
          <div className="flex items-center justify-between border-b border-sepia/70 px-3 py-2">
            <p className="font-sans text-[11px] font-semibold tracking-[0.2em] text-sumi-soft">YOUR READING DESK</p>
            <button type="button" onClick={() => fileInput.current?.click()} className="paper-btn py-1! text-xs!">
              <Upload className="size-3.5" /> Upload
            </button>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/*,application/pdf,video/*"
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {materials.length > 0 && (
            <div className="flex gap-2 overflow-x-auto border-b border-sepia/50 px-3 py-2">
              {materials.map((m, i) => {
                const Icon = ICONS[m.kind];
                return (
                  <div key={m.id} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      title={m.name}
                      className={`flex h-16 w-12 items-center justify-center overflow-hidden rounded-[2px] border bg-white ${i === index ? "border-rose ring-1 ring-rose" : "border-sepia"}`}
                    >
                      {m.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element -- local object URL
                        <img src={m.url} alt="" className="size-full object-cover" />
                      ) : (
                        <Icon className="size-5 text-sumi-soft" />
                      )}
                    </button>
                    <button type="button" aria-label={`Remove ${m.name}`} onClick={() => remove(m.id)} className="absolute -top-1.5 -right-1.5 rounded-full bg-white p-0.5 text-sumi-soft shadow">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative min-h-0 flex-1 bg-white">
            {!current ? (
              <label
                className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center text-sumi-soft"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  addFiles(e.dataTransfer.files);
                }}
              >
                <Upload className="size-6" />
                <span className="font-jp text-sm text-sumi">写真・PDF・ローカル動画・YouTubeリンクを追加</span>
                <span className="text-lg">Upload photos, PDFs, local videos, or a YouTube link</span>
                <span className="font-sans text-[11px]">Drop files here or click to browse. Files stay in this tab.</span>
                <input type="file" multiple accept="image/*,application/pdf,video/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
              </label>
            ) : current.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL
              <img src={current.url} alt={current.name} className="size-full object-contain" />
            ) : current.kind === "pdf" ? (
              <iframe src={current.url} title={current.name} className="size-full" />
            ) : current.kind === "video" ? (
              <video src={current.url} controls className="size-full bg-black" />
            ) : (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${current.videoId}`}
                title={current.name}
                className="size-full"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {materials.length > 0 && (
            <div className="flex items-center justify-between border-t border-sepia/60 px-3 py-1.5 font-sans text-xs text-sumi-soft">
              <button type="button" disabled={index === 0} onClick={() => setIndex((i) => i - 1)} className="inline-flex items-center gap-0.5 disabled:opacity-40">
                <ChevronLeft className="size-3.5" /> Prev
              </button>
              <span>
                Page {Math.min(index, materials.length - 1) + 1} / {materials.length}
              </span>
              <button type="button" disabled={index >= materials.length - 1} onClick={() => setIndex((i) => i + 1)} className="inline-flex items-center gap-0.5 disabled:opacity-40">
                Next <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}

          <form
            className="border-t border-sepia/70 px-3 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              addLink();
            }}
          >
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-sumi-soft" />
                <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Paste a YouTube link" className="paper-field py-1! pl-7! font-sans text-xs!" />
              </div>
              <button type="submit" className="paper-btn-rose px-3! py-1! text-xs!">
                Add
              </button>
            </div>
            {linkError && <p className="mt-1 font-sans text-[11px] text-red-700">{linkError}</p>}
          </form>
        </aside>
      </div>
      {showLog && <LogDialog entries={log} onClose={() => setShowLog(false)} />}
    </div>
  );
}
