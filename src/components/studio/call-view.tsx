"use client";

import { ArrowLeft, Mic, MicOff, PhoneOff, PhoneCall, Send, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TutorAvatar } from "@/components/app/tutor-avatar";
import { usePref } from "@/lib/prefs";
import { studyReply } from "@/lib/studio/demo-brain";
import { createRecognizer, speak, stopSpeaking } from "@/lib/studio/speech";
import { DEFAULT_TUTOR, type TutorId } from "@/lib/tutors";
import { castFromParam } from "./study-parts";

type Turn = { who: "you" | "tutor"; text: string };

/** Voice call with one tutor: dark call screen, live caption, mic and speaker. */
export function CallView() {
  const params = useSearchParams();
  const router = useRouter();
  const saved = usePref<TutorId>("gt:tutor", DEFAULT_TUTOR);
  const member = castFromParam(params.get("t"), saved)[0];
  const { tutor } = member;

  const [tab, setTab] = useState<"phone" | "message">("phone");
  const [status, setStatus] = useState<"calling" | "live" | "ended">("calling");
  const [seconds, setSeconds] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [talking, setTalking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");
  const speakerRef = useRef(speakerOn);
  const recRef = useRef<ReturnType<typeof createRecognizer>>(null);

  useEffect(() => {
    speakerRef.current = speakerOn;
  }, [speakerOn]);

  // Ring, then pick up and greet.
  useEffect(() => {
    if (status !== "calling") return;
    const id = window.setTimeout(() => {
      setStatus("live");
      say(`Hi, it's ${tutor.name}! ${tutor.intro} What would you like to go over on this call? You can ask me anything — just press the mic and talk.`);
    }, 1600);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- greet once per call
  }, [status, tutor.id]);

  useEffect(() => {
    if (status !== "live") return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  // Hang up when the page is hidden by a navigation.
  useLayoutEffect(
    () => () => {
      stopSpeaking();
      recRef.current?.stop();
    },
    [],
  );

  async function say(text: string) {
    setTurns((t) => [...t, { who: "tutor", text }]);
    setTalking(true);
    if (speakerRef.current) await speak(text, { pitch: member.pitch, force: true });
    else await new Promise((r) => window.setTimeout(r, Math.min(6000, text.length * 45)));
    setTalking(false);
  }

  function answer(question: string) {
    const q = question.trim();
    if (!q || status !== "live") return;
    setTurns((t) => [...t, { who: "you", text: q }]);
    const r = studyReply(q, [member]);
    window.setTimeout(() => void say(r.lines.map((l) => l.text).join(" ")), 500);
  }

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    if (muted) return;
    const r = createRecognizer();
    if (!r) {
      setTab("message");
      return;
    }
    stopSpeaking();
    recRef.current = r;
    let finalText = "";
    r.onresult = (e) => {
      finalText = Array.from(e.results as ArrayLike<ArrayLike<{ transcript: string }>>)
        .map((x) => x[0].transcript)
        .join("");
      setDraft(finalText);
    };
    r.onend = () => {
      setListening(false);
      setDraft("");
      if (finalText) answer(finalText);
    };
    r.onerror = () => setListening(false);
    setListening(true);
    r.start();
  }

  function hangUp() {
    stopSpeaking();
    recRef.current?.stop();
    setStatus("ended");
  }

  const lastTutor = [...turns].reverse().find((t) => t.who === "tutor");
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_50%_0%,#3a2a3a_0%,#111722_60%)] p-4 font-sans text-white">
      <div className="flex h-[min(760px,94dvh)] w-full max-w-md flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#1b2230] shadow-2xl">
        <div className="flex items-center justify-between px-4 pt-3">
          <Link href="/" aria-label="Back to menu" className="rounded p-1 text-white/70 hover:text-white">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex rounded-full bg-white/10 p-0.5 text-[11px]">
            {(["phone", "message"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full px-3 py-0.5 capitalize ${tab === t ? "bg-white text-[#1b2230]" : "text-white/70"}`}>
                {t}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => router.push(`/characters?next=call`)} className="rounded px-1 text-[11px] text-white/70 hover:text-white" title="Change tutor">
            Switch
          </button>
        </div>

        <div className="mt-3 text-center">
          <p className="text-base font-semibold">{tutor.name}</p>
          <p className="text-[11px] text-white/60">{status === "calling" ? "Calling…" : status === "ended" ? "Call ended" : time}</p>
        </div>

        {tab === "phone" ? (
          <div className="flex min-h-0 flex-1 flex-col items-center px-6">
            <div className="mt-8 rounded-full p-1.5" style={{ background: `conic-gradient(${member.hue}, ${tutor.color}, ${member.hue})` }}>
              <span className={`block rounded-full ${talking ? "ring-pulse" : ""}`} style={{ "--ring": `${member.hue}99` } as React.CSSProperties}>
                <span className="block rounded-full bg-[#1b2230] p-1">
                  <TutorAvatar tutor={tutor} size={132} talking={talking} />
                </span>
              </span>
            </div>
            <p className="mt-6 min-h-24 max-w-sm text-center text-[13px] leading-relaxed text-white/85" aria-live="polite">
              {listening ? <span className="text-white/60">{draft || "Listening…"}</span> : (lastTutor?.text ?? (status === "calling" ? "Ringing…" : ""))}
            </p>
            <p className="mt-2 text-center text-[10px] text-white/40">
              {status === "live" ? "Press the mic to talk, or switch to Message to type." : status === "ended" ? "Thanks for studying together!" : ""}
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4 text-[13px]">
              {turns.map((t, i) => (
                <div key={i} className={`flex ${t.who === "you" ? "justify-end" : "justify-start"}`}>
                  <p className={`max-w-[80%] rounded-2xl px-3 py-2 ${t.who === "you" ? "bg-[#e5869f] text-white" : "bg-white/10 text-white/90"}`}>{t.text}</p>
                </div>
              ))}
            </div>
            <form
              className="flex gap-2 border-t border-white/10 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                answer(draft);
                setDraft("");
              }}
            >
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${tutor.name}`} className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2 text-sm outline-none placeholder:text-white/40" disabled={status !== "live"} />
              <button type="submit" aria-label="Send" className="rounded-full bg-[#e5869f] p-2" disabled={status !== "live"}>
                <Send className="size-4" />
              </button>
            </form>
          </div>
        )}

        <div className="flex items-end justify-center gap-6 pt-3 pb-6">
          <CallButton label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((m) => !m)} active={muted}>
            {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </CallButton>
          <CallButton label={listening ? "Stop" : "Talk"} onClick={toggleMic} active={listening} disabled={status !== "live" || muted}>
            <Mic className={`size-5 ${listening ? "text-[#e5869f]" : ""}`} />
          </CallButton>
          <CallButton label="Speaker" onClick={() => setSpeakerOn((s) => !s)} active={!speakerOn}>
            {speakerOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </CallButton>
          {status === "ended" ? (
            <CallButton
              label="Call again"
              onClick={() => {
                setTurns([]);
                setSeconds(0);
                setStatus("calling");
              }}
              green
            >
              <PhoneCall className="size-5" />
            </CallButton>
          ) : (
            <CallButton label="End" onClick={hangUp} red>
              <PhoneOff className="size-5" />
            </CallButton>
          )}
        </div>
      </div>
    </div>
  );
}

function CallButton({
  label,
  onClick,
  children,
  active,
  red,
  green,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  red?: boolean;
  green?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`flex size-12 items-center justify-center rounded-full transition disabled:opacity-40 ${
          red ? "bg-[#e0475f] hover:bg-[#ef566e]" : green ? "bg-[#2f9e5b]" : active ? "bg-white text-[#1b2230]" : "bg-white/10 hover:bg-white/20"
        }`}
      >
        {children}
      </button>
      <span className="text-[10px] text-white/50">{label}</span>
    </div>
  );
}
