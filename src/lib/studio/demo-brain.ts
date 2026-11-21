import type { CastMember } from "./cast";

/**
 * Demo "brain" for the study rooms while no AI model is connected.
 * It recognises a few showcase topics (matrices, thermodynamics, kinematics,
 * polynomials, graphs, Napoleon) and otherwise falls back to each tutor's
 * own study steps. Swap `studyReply` for a real model call later: the UI only
 * needs `lines`, plus optional whiteboard blocks and graph lines.
 */

export type BoardBlock =
  | { kind: "note"; title: string; text: string }
  | { kind: "math"; title?: string; lines: string[] }
  | { kind: "matrix"; label: string; rows: (number | string)[][] };

export type ReplyLine = { speaker: number; text: string; ja?: string };

export type StudyReply = {
  lines: ReplyLine[];
  board: BoardBlock[];
  graphs: string[];
  topic: string;
};

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function topicOf(q: string) {
  const cleaned = q
    .replace(/\s+/g, " ")
    .replace(/^(please\s+)?(can you\s+|could you\s+)?(help me\s+)?(explain|teach me|tell me about|what is|what are|what's|how do i|how does|why is|why do)\s+/i, "")
    .replace(/^(tolong\s+)?(jelaskan|ajarkan|apa itu|apa yang dimaksud|bagaimana cara|kenapa)\s+/i, "")
    .replace(/[?.!]+$/, "")
    .trim();
  return cleaned.length > 50 ? `${cleaned.slice(0, 47).trimEnd()}…` : cleaned || "this topic";
}

/** Pulls an expression to plot out of the question, e.g. "plot y = x^2 - 4". */
function plottable(q: string): string | null {
  const m = /(?:plot|graph|grafik|gambar(?:kan)?|sketch)\s+(?:of\s+|the\s+)?(?:y\s*=|f\(x\)\s*=)?\s*([-+*/^().\sx\d a-z]+)$/i.exec(q.trim());
  if (m && /x/.test(m[1])) return m[1].trim();
  const eq = /(?:y|f\(x\))\s*=\s*([-+*/^().\sx\d a-z]+)/i.exec(q);
  if (eq && /x/.test(eq[1])) return eq[1].trim().replace(/[?.!]+$/, "");
  return null;
}

type Topic = {
  test: RegExp;
  build: (cast: CastMember[]) => Omit<StudyReply, "topic"> & { topic?: string };
};

const TOPICS: Topic[] = [
  {
    test: /matri(x|ks|ces)/i,
    build: () => ({
      topic: "Matrix multiplication",
      lines: [
        {
          speaker: 0,
          text: "Alright, listen up. Each entry of C = AB is a row of A times a column of B: c_ij = Σ a_ik · b_kj. Take row one of A, column one of B, multiply matching entries and add.",
          ja: "一行目と一列目を掛け合わせて足すと、三十よ。",
        },
        {
          speaker: 1,
          text: "For our example: c₁₁ = 1·9 + 2·6 + 3·3 = 30, c₁₂ = 1·8 + 2·5 + 3·2 = 24, c₁₃ = 1·7 + 2·4 + 3·1 = 18. Do the same for rows two and three and you get the full matrix on the whiteboard.",
        },
      ],
      board: [
        { kind: "note", title: "Matrix multiplication (3×3)", text: "Today is a bit different — let's learn matrix multiplication." },
        { kind: "math", lines: ["c_ij = Σ_k a_ik · b_kj   (k = 1…3)"] },
        { kind: "matrix", label: "A", rows: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
        { kind: "matrix", label: "B", rows: [[9, 8, 7], [6, 5, 4], [3, 2, 1]] },
        { kind: "matrix", label: "C = AB", rows: [[30, 24, 18], [84, 69, 54], [138, 114, 90]] },
      ],
      graphs: [],
    }),
  },
  {
    test: /thermo|gas expand|kilojoule|work done by (a|the) gas|termodinamika/i,
    build: () => ({
      topic: "Thermodynamics",
      lines: [
        {
          speaker: 0,
          text: "At constant pressure the work done by a gas is W = PΔV. With P = 2.0×10⁵ Pa and ΔV = 0.0175 m³: W = 2.0×10⁵ × 0.0175 = 3.5×10³ J.",
        },
        {
          speaker: 0,
          text: "Sign convention: positive work means the gas does work on the surroundings. Since the gas expands, it does work on them, so W is positive. Answer: about 3.5 kJ.",
          ja: "膨張するとき、気体は外部に約三・五キロジュールの仕事をします。",
        },
      ],
      board: [
        { kind: "note", title: "Work done by an expanding gas", text: "Constant pressure process" },
        { kind: "math", lines: ["W = P · ΔV", "W = (2.0×10⁵ Pa)(0.0175 m³)", "W = 3.5×10³ J ≈ 3.5 kJ"] },
        { kind: "note", title: "Sign convention", text: "W > 0 → the gas does work on its surroundings (expansion)." },
      ],
      graphs: [],
    }),
  },
  {
    test: /kinemat|velocity|acceleration|percepatan|kecepatan/i,
    build: () => ({
      topic: "Kinematics",
      lines: [
        {
          speaker: 0,
          text: "Let's tackle some physics together, starting with kinematics. For constant acceleration from rest, the distance is s = ut + ½at², and the velocity is v = u + at.",
        },
        { speaker: 0, text: "Plugging in u = 0, a = 2 m/s², t = 5 s: s = ½·2·5² = 25 m and v = 2·5 = 10 m/s." },
      ],
      board: [
        { kind: "note", title: "Kinematic basics", text: "Constant acceleration" },
        { kind: "math", lines: ["s = ut + ½at²", "v = u + at"] },
        { kind: "math", title: "Kinematic calculation", lines: ["u = 0, a = 2 m/s², t = 5 s", "s = ½(2)(5²) = 25 m", "v = (2)(5) = 10 m/s"] },
      ],
      graphs: ["y = x^2", "(5, 25)"],
    }),
  },
  {
    test: /rational function|fungsi rasional/i,
    build: () => ({
      topic: "Rational functions",
      lines: [
        {
          speaker: 0,
          text: "Rational functions are fractions where both the numerator and the denominator are polynomials: f(x) = p(x) / q(x), with q(x) ≠ 0.",
          ja: "有理関数は、分子も分母も多項式なの。",
        },
        { speaker: 1, text: "Watch for the vertical asymptotes where q(x) = 0! Try y = 1/(x − 1) on the calculator." },
      ],
      board: [
        { kind: "note", title: "Rational functions", text: "f(x) = p(x) / q(x),  q(x) ≠ 0" },
        { kind: "math", lines: ["f(x) = 1 / (x − 1)", "vertical asymptote: x = 1", "horizontal asymptote: y = 0"] },
      ],
      graphs: ["y = 1/(x - 1)"],
    }),
  },
  {
    test: /zeros?|roots?|derivative|turunan|akar|critical point|polynomial graph/i,
    build: () => ({
      topic: "Graphing a polynomial",
      lines: [
        {
          speaker: 0,
          text: "Let's graph f(x) = x³ − 3x + 2. First find the zeros: it factors as (x − 1)²(x + 2), so the zeros are at x = −2 and x = 1.",
          ja: "零点は、マイナス二と一です。",
        },
        {
          speaker: 0,
          text: "Next, the derivative f′(x) = 3x² − 3 gives critical points at x = ±1. f(−1) = 4 is a local max, and f(1) = 0 a local min. I've plotted it for you.",
        },
      ],
      board: [
        { kind: "note", title: "Sketching a cubic", text: "Zeros → derivative → critical points → sketch" },
        { kind: "math", lines: ["f(x) = x³ − 3x + 2 = (x − 1)²(x + 2)", "zeros: x = −2, x = 1", "f′(x) = 3x² − 3 = 0 → x = ±1", "max (−1, 4), min (1, 0)"] },
      ],
      graphs: ["y = x^3 - 3x + 2", "(-2, 0)", "(1, 0)", "(-1, 4)"],
    }),
  },
  {
    test: /polynomial|polinom|suku banyak/i,
    build: () => ({
      topic: "Polynomial functions",
      lines: [
        {
          speaker: 0,
          text: "Polynomial functions are just sums of terms like aₙxⁿ + aₙ₋₁xⁿ⁻¹ + … + a₁x + a₀, where each a is a real coefficient!",
          ja: "多項式は、いくつかの項を足したものですよ！",
        },
        { speaker: 1, text: "The highest power n is the degree. Degree 2 is a parabola, degree 3 a cubic — here's one on the graph." },
      ],
      board: [
        { kind: "note", title: "Polynomial functions", text: "P(x) = aₙxⁿ + … + a₁x + a₀" },
        { kind: "math", lines: ["degree = highest power n", "example: P(x) = x³ − 2x² − x + 2"] },
      ],
      graphs: ["y = x^3 - 2x^2 - x + 2"],
    }),
  },
  {
    test: /napoleon|austerlitz|waterloo|french revolution/i,
    build: (cast) => ({
      topic: "The Napoleonic Wars",
      lines: [
        {
          speaker: 0,
          text: "The Napoleonic Wars spanned from 1803 to 1815, following the French Revolutionary Wars. France, under Napoleon, fought a series of coalitions of European powers, reshaping borders and politics across the continent.",
          ja: "ナポレオンは、ヨーロッパの連合軍と戦ったの。",
        },
        {
          speaker: cast.length > 1 ? 1 : 0,
          text: "Hmph! Don't think it's just a bunch of battles. The Battle of Austerlitz in 1805 was a masterpiece — Napoleon crushed the Austro-Russian forces with a clever feint. Then there's the Peninsular War, where guerrilla fighting wore France down.",
          ja: "アウステルリッツでは、ナポレオンの陽動が決め手よ。",
        },
      ],
      board: [
        { kind: "note", title: "Napoleonic Wars · timeline", text: "1803 – 1815" },
        { kind: "math", lines: ["1805  Austerlitz — feint, decisive French win", "1808  Peninsular War begins", "1812  Invasion of Russia", "1815  Waterloo — final defeat"] },
      ],
      graphs: [],
    }),
  },
];

export function studyReply(question: string, cast: CastMember[]): StudyReply {
  const q = question.trim();
  const expr = plottable(q);
  const topic = TOPICS.find((t) => t.test.test(q));
  const seed = hash(q);

  if (topic) {
    const r = topic.build(cast);
    const lines = r.lines.map((l) => ({ ...l, speaker: Math.min(l.speaker, cast.length - 1) }));
    return { lines, board: r.board, graphs: expr ? [`y = ${expr}`, ...r.graphs] : r.graphs, topic: r.topic ?? topicOf(q) };
  }

  const t = topicOf(q);
  if (expr) {
    return {
      topic: `Graph of ${expr}`,
      lines: [
        { speaker: 0, text: `${cast[0].tutor.openers[seed % cast[0].tutor.openers.length]} I've drawn y = ${expr} on the graphing calculator.` },
        {
          speaker: cast.length - 1,
          text: "Look at where it crosses the x-axis — those are the zeros, and I marked them for you. Then check where it turns: that's where the derivative is zero.",
        },
      ],
      board: [{ kind: "math", title: "Function", lines: [`y = ${expr}`] }],
      graphs: [`y = ${expr}`],
    };
  }

  // Generic: opener, the study steps, closer — split across the tutors.
  const lead = cast[0].tutor;
  const steps = lead.steps(t);
  const lines: ReplyLine[] = [
    { speaker: 0, text: `${lead.openers[seed % lead.openers.length]} Let's work on “${t}”.` },
    { speaker: cast.length - 1, text: `First: ${steps[0]} Then: ${steps[1]}` },
    { speaker: 0, text: `${steps[2]} ${lead.closers[(seed >> 3) % lead.closers.length]}` },
  ];
  return {
    topic: t,
    lines,
    board: [
      { kind: "note", title: t, text: "Study plan" },
      { kind: "math", lines: steps.map((s, i) => `${i + 1}. ${s}`) },
    ],
    graphs: [],
  };
}

/** Short comment from a tutor about something on the reading desk. */
export function readingReply(question: string, material: string | null, cast: CastMember[]): ReplyLine[] {
  const base = studyReply(question, cast);
  if (!material) {
    return [{ speaker: 0, text: "Put something on the reading desk first — a photo, a PDF, a video or a YouTube link — and we'll go through it together." }, ...base.lines.slice(0, 1)];
  }
  return [{ speaker: 0, text: `I'm looking at “${material}” with you.` }, ...base.lines];
}
