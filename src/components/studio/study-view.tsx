"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { newId, useCollection, type Chat } from "@/lib/local-store";
import { usePref } from "@/lib/prefs";
import { studyReply } from "@/lib/studio/demo-brain";
import { useStudioSettings } from "@/lib/studio/settings";
import { DEFAULT_TUTOR, type TutorId } from "@/lib/tutors";
import { StudioHeader } from "./chrome";
import { GraphingCalculator, type GraphLine } from "./graphing-calculator";
import { DialogueBox, Stage, type DialogueLine } from "./stage";
import { castFromParam, ChatsDrawer, LogDialog, saveExchange, StudyComposer, toDialogue, useVoice } from "./study-parts";
import { Whiteboard, type BoardEntry } from "./whiteboard";

type Exchange = { id: string; question: string; lines: DialogueLine[]; ja?: string };

const SUGGESTIONS = ["Explain matrix multiplication", "Work done by an expanding gas", "Find the zeros of x^3 - 3x + 2", "Plot y = sin(x)", "Napoleon and Austerlitz"];

export function StudyView() {
  const params = useSearchParams();
  const router = useRouter();
  const saved = usePref<TutorId>("gt:tutor", DEFAULT_TUTOR);
  const cast = castFromParam(params.get("t"), saved);
  const castKey = cast.map((c) => c.tutor.id).join(",");
  const settings = useStudioSettings();
  const chats = useCollection("chats");

  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [board, setBoard] = useState<BoardEntry[]>([]);
  const [graphs, setGraphs] = useState<GraphLine[]>([]);
  const [tab, setTab] = useState<"board" | "graph">("board");
  const [thinking, setThinking] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showChats, setShowChats] = useState(false);
  const voice = useVoice();
  const timer = useRef<number | null>(null);
  const chatIdRef = useRef<string | null>(null);
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  // A different pair of tutors is a different session.
  const [prevKey, setPrevKey] = useState(castKey);
  if (prevKey !== castKey) {
    setPrevKey(castKey);
    setExchanges([]);
    setBoard([]);
    setGraphs([]);
    setChatId(null);
  }

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const current = exchanges[exchanges.length - 1];
  const names = cast.map((c) => c.tutor.name).join(" & ");

  function ask(question: string) {
    voice.stop();
    setThinking(true);
    timer.current = window.setTimeout(() => {
      const r = studyReply(question, cast);
      const lines = toDialogue(r.lines, cast);
      const ja = r.lines.find((l) => l.ja)?.ja;
      const ex: Exchange = { id: newId(), question, lines, ja };
      setExchanges((xs) => [...xs, ex]);
      if (r.board.length) setBoard((b) => [...b, { id: ex.id, topic: r.topic, question, blocks: r.board }]);
      if (r.graphs.length) {
        setGraphs((g) => [...g, ...r.graphs.map((src, i) => ({ id: `${ex.id}-${i}`, src, visible: true }))]);
        setTab("graph");
      } else if (r.board.length) setTab("board");
      setThinking(false);
      const savedId = saveExchange(chatIdRef.current, cast, question, lines, newId);
      chatIdRef.current = savedId;
      setChatId(savedId);
      if (settings.autoPlay) void voice.play(lines);
    }, 900);
  }

  function reset() {
    voice.stop();
    setExchanges([]);
    setBoard([]);
    setGraphs([]);
    setChatId(null);
  }

  function openChat(c: Chat) {
    setShowChats(false);
    const ids = new Set(cast.map((m) => m.tutor.id));
    if (!ids.has(c.tutorId)) router.replace(`/study?t=${c.tutorId}`);
    const pairs: Exchange[] = [];
    for (let i = 0; i < c.messages.length; i += 2) {
      const q = c.messages[i];
      const a = c.messages[i + 1];
      if (!a) break;
      pairs.push({
        id: a.id,
        question: q.text,
        lines: toDialogue([{ speaker: 0, text: a.text }], castFromParam(c.tutorId, c.tutorId)),
      });
    }
    setExchanges(pairs);
    setBoard([]);
    setGraphs([]);
    setChatId(c.id);
  }

  const speakingNow = voice.speaking ?? typing;
  const mine = chats.filter((c) => cast.some((m) => m.tutor.id === c.tutorId));

  return (
    <div className="flex h-dvh flex-col">
      <StudioHeader
        title="Study & Chat"
        subtitle={cast.length > 1 ? `Two-quint mode · ${names}` : current ? `${names} · ${current.question.slice(0, 40)}` : `with ${names}`}
        chip={
          <button
            type="button"
            onClick={() => router.push(`/characters?next=study${cast.length > 1 ? "&pair=1" : ""}`)}
            className="mx-1 rounded-[3px] border border-sepia bg-white/70 px-2 py-1 text-sumi"
            title="Change tutor"
          >
            {names}
          </button>
        }
        onNew={reset}
        onChats={() => setShowChats(true)}
        callHref={`/call?t=${cast[0].tutor.id}`}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5">
          <Stage members={cast} speaking={speakingNow} className="aspect-[16/7] max-h-[46dvh] w-full shrink-0 lg:aspect-auto lg:min-h-0 lg:flex-1 lg:max-h-none" />
          <DialogueBox
            question={current?.question}
            lines={current?.lines ?? []}
            thinking={thinking}
            thinkingName={names}
            speakingLabel={voice.speaking ? "Speaking…" : undefined}
            onPlay={() => current && void voice.play(current.lines, true)}
            onPause={voice.pause}
            onStop={voice.stop}
            onLog={() => setShowLog(true)}
            onTypingChange={setTyping}
          />
          {!current && !thinking && (
            <p className="-mt-1 px-1 font-sans text-xs text-sumi-soft">
              {cast[0].tutor.name}: “{cast[0].tutor.intro}”
            </p>
          )}
          {settings.showSubtitlesJa && current?.ja && !thinking && <p className="-mt-1 text-center font-jp text-sm text-sumi-soft">「{current.ja}」</p>}
          <StudyComposer
            placeholder={`Ask ${names} a question…`}
            onSend={ask}
            disabled={thinking}
            suggestions={exchanges.length === 0 ? SUGGESTIONS : []}
          />
        </div>

        <aside className="paper-card flex min-h-[420px] w-full shrink-0 flex-col overflow-hidden lg:h-auto lg:min-h-0 lg:w-[380px]">
          <div role="tablist" className="grid grid-cols-2 gap-1 p-1.5 font-sans text-xs">
            {(
              [
                ["board", "Whiteboard"],
                ["graph", "Graphing calculator"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`rounded-[2px] py-1.5 transition ${tab === id ? "bg-[#f6ead2] text-sumi shadow-sm" : "text-sumi-soft hover:bg-sepia/30"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1">
            {tab === "board" ? <Whiteboard entries={board} onClear={() => setBoard([])} /> : <GraphingCalculator lines={graphs} onChange={setGraphs} />}
          </div>
        </aside>
      </div>
      {showLog && <LogDialog entries={exchanges} onClose={() => setShowLog(false)} />}
      {showChats && <ChatsDrawer chats={mine} onPick={openChat} onClose={() => setShowChats(false)} />}
    </div>
  );
}
