import type { Tutor } from "./tutors";

/**
 * Demo replies while no AI is connected. Replace `createReply` with a call to
 * your AI endpoint later; the chat UI only needs the returned text.
 */

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h;
}

/** Pulls a short topic phrase out of the question for the study steps. */
function topicOf(question: string): string {
  const cleaned = question
    .replace(/\s+/g, " ")
    .replace(/^(please\s+)?(can you\s+|could you\s+)?(help me\s+)?(explain|teach me|tell me about|what is|what are|what's|how do i|how does|why is|why do)\s+/i, "")
    .replace(/^(tolong\s+)?(jelaskan|ajarkan|apa itu|apa yang dimaksud|bagaimana cara|kenapa)\s+/i, "")
    .replace(/[?.!]+$/, "")
    .trim();
  const short = cleaned.length > 60 ? `${cleaned.slice(0, 57).trimEnd()}…` : cleaned;
  return short || "this topic";
}

export function createReply(opts: {
  tutor: Tutor;
  question: string;
  attachmentNames: string[];
  memory: string[];
}): string {
  const { tutor, question, attachmentNames, memory } = opts;
  const seed = hash(question);
  const topic = topicOf(question);
  const parts: string[] = [pick(tutor.openers, seed)];

  if (attachmentNames.length) {
    parts.push(
      `I see you attached ${attachmentNames.join(", ")}. I can't open files yet in demo mode, but keep it nearby while we work.`,
    );
  }
  if (memory.length) {
    parts.push(`I remember you told me: “${pick(memory, seed)}”. I'll keep that in mind.`);
  }

  const steps = tutor.steps(topic).map((s, i) => `${i + 1}. ${s}`);
  parts.push(`Here's how I'd study ${topic === "this topic" ? "it" : `“${topic}”`}:\n${steps.join("\n")}`);
  parts.push(pick(tutor.closers, seed >> 3));
  return parts.join("\n\n");
}
