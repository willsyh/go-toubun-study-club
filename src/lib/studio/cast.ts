import { TUTORS, type Box, type Portrait, type Tutor, type TutorId } from "@/lib/tutors";

/**
 * Extra per-sister data for the studio screens: Japanese name, the card color
 * used on the character select, and the full-body sprite drawn on the stage.
 * `<name>-sprite.webp` is `<name>-art.webp` with the big numeral removed.
 */
export type CastMember = {
  tutor: Tutor;
  kanji: string;
  romaji: string;
  /** Number in Japanese (一…五), used by the intro countdown. */
  numeral: string;
  /** Card / label color, matching the sisters' usual palette. */
  hue: string;
  /** Short line under the card on the select screen. */
  tagline: string;
  /** Description shown when she is selected. */
  blurb: string;
  sprite: Portrait;
  /** Window of `sprite` shown on the stage (upper body). */
  stage: Box;
  /** Available outfits (only "School uniform" has art for now). */
  outfits: { id: string; name: string; variations: number; ready: boolean }[];
  /** Pitch used by the browser voice so the five sound a little different. */
  pitch: number;
};

const ART = (id: string, width: number, height: number, mouth?: Portrait["mouth"]): Portrait => ({
  src: `/images/${id}-sprite.webp`,
  width,
  height,
  face: { x: 0, y: 0, w: width, h: width },
  mouth,
});

const outfits = (extra: string[]) => [
  { id: "uniform", name: "School uniform", variations: 1, ready: true },
  ...extra.map((name) => ({ id: name.toLowerCase().replace(/\s+/g, "-"), name, variations: 0, ready: false })),
];

const tutor = (id: TutorId) => TUTORS.find((t) => t.id === id)!;

export const CAST: CastMember[] = [
  {
    tutor: tutor("ichika"),
    kanji: "中野一花",
    romaji: "Ichika Nakano",
    numeral: "一",
    hue: "#f2d94e",
    tagline: "School outfit · cardigan · Neutral",
    blurb: "Gentle and encouraging — explains step by step until it clicks.",
    sprite: ART("ichika", 900, 1678, {
      src: "/images/ichika-art-mouth.png",
      box: { x: 530, y: 310, w: 52, h: 30 },
    }),
    stage: { x: 280, y: 110, w: 600, h: 820 },
    outfits: outfits(["Casual summer", "Yukata"]),
    pitch: 1.05,
  },
  {
    tutor: tutor("nino"),
    kanji: "中野二乃",
    romaji: "Nino Nakano",
    numeral: "二",
    hue: "#b46be0",
    tagline: "Your study guide",
    blurb: "Sharp and a little proud — cuts to the core of the problem.",
    sprite: ART("nino", 900, 1678, {
      src: "/images/nino-art-mouth.png",
      box: { x: 584, y: 293, w: 52, h: 31 },
    }),
    stage: { x: 300, y: 100, w: 600, h: 820 },
    outfits: outfits(["Pink dress", "Blouse and skirt"]),
    pitch: 1.2,
  },
  {
    tutor: tutor("miku"),
    kanji: "中野三玖",
    romaji: "Miku Nakano",
    numeral: "三",
    hue: "#56b6e8",
    tagline: "Hold to explore",
    blurb: "Quiet and thoughtful — every topic has a story behind it.",
    sprite: ART("miku", 327, 611),
    stage: { x: 90, y: 30, w: 237, h: 330 },
    outfits: outfits(["Hoodie", "Kimono"]),
    pitch: 0.95,
  },
  {
    tutor: tutor("yotsuba"),
    kanji: "中野四葉",
    romaji: "Yotsuba Nakano",
    numeral: "四",
    hue: "#9fd94a",
    tagline: "Hold to explore",
    blurb: "Bright and full of energy — makes studying feel like a game.",
    sprite: ART("yotsuba", 264, 384),
    stage: { x: 60, y: 0, w: 204, h: 270 },
    outfits: outfits(["Track suit"]),
    pitch: 1.3,
  },
  {
    tutor: tutor("itsuki"),
    kanji: "中野五月",
    romaji: "Itsuki Nakano",
    numeral: "五",
    hue: "#ee6f8d",
    tagline: "Hold to explore",
    blurb: "Serious and hardworking — proper methods, then snacks.",
    sprite: ART("itsuki", 900, 1678, {
      src: "/images/itsuki-art-mouth.png",
      box: { x: 514, y: 297, w: 46, h: 38 },
    }),
    stage: { x: 260, y: 50, w: 640, h: 860 },
    outfits: outfits(["Casual sweater", "Winter coat"]),
    pitch: 1.1,
  },
];

export function getCast(id: string | null | undefined): CastMember {
  return CAST.find((c) => c.tutor.id === id) ?? CAST[4];
}

export function isTutorId(id: string | null | undefined): id is TutorId {
  return CAST.some((c) => c.tutor.id === id);
}
