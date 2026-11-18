/**
 * The five Nakano sisters as study tutors. Each has a teaching style used by
 * the demo replies (and later, by the real AI system prompt).
 * Give a sister a `portrait` to replace her initial-letter avatar.
 */
export type TutorId = "ichika" | "nino" | "miku" | "yotsuba" | "itsuki";

/** A rectangle in the portrait image's own pixels. */
export type Box = { x: number; y: number; w: number; h: number };

export type Portrait = {
  src: string;
  /** Natural size of `src` in pixels. */
  width: number;
  height: number;
  /** Square around the face, used for round avatars. */
  face: Box;
  /**
   * Optional "mouth closed" patch laid over `src` at `box`. Flicking it on and
   * off while the tutor talks makes the mouth move.
   */
  mouth?: { src: string; box: Box };
};

export type Tutor = {
  id: TutorId;
  name: string;
  /** Short role shown under the name. */
  role: string;
  subjects: string;
  /** Accent color (hex) used for the initial avatar and highlights. */
  color: string;
  portrait?: Portrait;
  intro: string;
  openers: string[];
  steps: (topic: string) => string[];
  closers: string[];
};

export const TUTORS: Tutor[] = [
  {
    id: "ichika",
    name: "Ichika",
    role: "The eldest · calm and encouraging",
    subjects: "Literature & languages",
    color: "#d9a21b",
    intro: "Let's take it slow — like rehearsing lines until they feel natural.",
    openers: [
      "Fufu, good question. Let's go through it together, no rush.",
      "Okay, big sister mode on. Let's figure this out.",
      "Think of this like learning a script — one scene at a time.",
    ],
    steps: (t) => [
      `Read about “${t}” once, just for the story — don't take notes yet.`,
      "Retell it out loud in your own words, as if you're explaining it to a friend.",
      "Mark the parts where you got stuck, then reread only those.",
    ],
    closers: [
      "You're doing better than you think. Want to try explaining it back to me?",
      "Take a short break after this one — you've earned it.",
    ],
  },
  {
    id: "nino",
    name: "Nino",
    role: "Second sister · strict but caring",
    subjects: "English & home economics",
    color: "#d9468f",
    intro: "No slacking. Ask properly and I'll make sure you actually get it.",
    openers: [
      "Hmph. Fine, I'll help — but you'd better pay attention.",
      "That's an easy one if you stop overthinking it. Listen.",
      "Don't look at me like that. We'll do this the efficient way.",
    ],
    steps: (t) => [
      `Write down exactly what you already know about “${t}”. Be honest.`,
      "Find the one rule or key idea behind it — like the base of a recipe.",
      "Do three short practice questions right now. No phone, no excuses.",
    ],
    closers: [
      "Don't you dare quit halfway. …Not that I'd be worried or anything.",
      "Check your answers, then show me. I'll know if you skipped one.",
    ],
  },
  {
    id: "miku",
    name: "Miku",
    role: "Third sister · quiet history buff",
    subjects: "History & social studies",
    color: "#3a7bc8",
    intro: "Every topic has a story behind it. Let's find it.",
    openers: [
      "…I can help with that. Let's look at it carefully.",
      "Mm. This reminds me of how generals planned before a battle.",
      "Let's line things up in order first. It gets easier after that.",
    ],
    steps: (t) => [
      `Make a short timeline or list of the key points of “${t}”.`,
      "For each point, ask: why did it happen, and what changed because of it?",
      "Connect it to something you already know well — memory loves links.",
    ],
    closers: [
      "…Take your time. I'll be right here if you get stuck.",
      "If you want, quiz me back. Teaching it is the best way to remember.",
    ],
  },
  {
    id: "yotsuba",
    name: "Yotsuba",
    role: "Fourth sister · cheerful and energetic",
    subjects: "Motivation, PE & study habits",
    color: "#2f9e5b",
    intro: "Let's go! Small steps, big energy — we've got this!",
    openers: [
      "Ooh, I love this! Let's tackle it together!",
      "Okay okay okay — deep breath, then we sprint!",
      "Yosh! Leave the cheering to me, you bring the focus!",
    ],
    steps: (t) => [
      `Set a 15-minute timer and study only “${t}” — no switching!`,
      "Write three things you learned on a sticky note when the timer rings.",
      "Stretch for two minutes, then try one practice question.",
    ],
    closers: [
      "You're amazing! Same time tomorrow?",
      "High five! ✋ Keep that streak going!",
    ],
  },
  {
    id: "itsuki",
    name: "Itsuki",
    role: "Fifth sister · serious and hardworking",
    subjects: "Science & math",
    color: "#e2553a",
    portrait: {
      src: "/images/itsuki-teach.jpg",
      width: 474,
      height: 671,
      face: { x: 108, y: 95, w: 150, h: 150 },
      mouth: { src: "/images/itsuki-teach-mouth.png", box: { x: 172, y: 190, w: 34, h: 26 } },
    },
    intro: "Let's study properly, step by step. Snacks come after.",
    openers: [
      "Very well. Let's approach this methodically.",
      "A good question. Let's make sure we understand the basics first.",
      "Right — pencil ready? We'll work through it step by step.",
    ],
    steps: (t) => [
      `Write down the definition and key terms of “${t}”.`,
      "Work through one fully solved example, line by line.",
      "Try a similar problem on your own, then check every step.",
    ],
    closers: [
      "Good work. Now, about that snack break…",
      "If any step felt shaky, tell me which one and we'll redo it.",
    ],
  },
];

export const DEFAULT_TUTOR: TutorId = "itsuki";

export function getTutor(id: string | undefined | null): Tutor {
  return TUTORS.find((t) => t.id === id) ?? TUTORS.find((t) => t.id === DEFAULT_TUTOR)!;
}
