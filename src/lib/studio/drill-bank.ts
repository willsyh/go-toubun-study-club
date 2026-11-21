/**
 * Practice questions for Exam Drill. Each bank is a "section" kind; exams
 * point at a bank through `Exam.drill`.
 */
export type DrillQuestion = {
  id: string;
  passage?: string;
  prompt: string;
  /** Simple triangle figure for geometry items. */
  figure?: "triangle";
  options: string[];
  /** Index of the right option, or several for "select all". */
  answer: number[];
  multi?: boolean;
  explain: string;
};

export type DrillBank = { id: string; label: string; minutesPer: number; questions: DrillQuestion[] };

const MOON =
  "In July 1969, millions of viewers gathered around televisions to watch Neil Armstrong take his first steps on the lunar surface. The event was hailed not only as a triumph of engineering but also as a moment that united a watching world. Newspapers described celebrations in the streets, and across the United States and abroad, the landing was presented as an achievement and a testament to human curiosity.";

export const BANKS: Record<string, DrillBank> = {
  sat: {
    id: "sat",
    label: "Reading and Writing",
    minutesPer: 1.2,
    questions: [
      {
        id: "sat1",
        passage: MOON,
        prompt: "What is the author's primary purpose in the passage?",
        options: ["to argue that the mission was a waste of money", "to celebrate the achievement and its impact on national pride", "to compare the moon landing to earlier space missions", "to describe technical details of the lunar module"],
        answer: [1],
        explain: "The passage highlights public excitement and national pride, indicating the author's main goal is to celebrate the achievement. Options focusing on criticism, comparison, or technical detail do not match the tone.",
      },
      {
        id: "sat2",
        passage: MOON,
        prompt: "As used in the passage, “hailed” most nearly means",
        options: ["called loudly", "praised", "stopped", "rained on"],
        answer: [1],
        explain: "The event was “hailed … as a triumph” — it was praised. The other meanings of “hail” don't fit the context.",
      },
      {
        id: "sat3",
        prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?\n\nThe committee, after weeks of debate, ______ its final decision on Friday.",
        options: ["announce", "have announced", "announced", "announcing"],
        answer: [2],
        explain: "The subject is the singular “committee”, and the sentence needs a finite past-tense verb: “announced”.",
      },
      {
        id: "sat4",
        prompt: "Which transition best connects the sentences?\n\nThe bridge was designed to last a century. ______, it began to show cracks after only twenty years.",
        options: ["Similarly", "However", "For example", "Therefore"],
        answer: [1],
        explain: "The second sentence contrasts with the expectation in the first, so a contrast word — “However” — is needed.",
      },
      {
        id: "sat5",
        prompt: "Which punctuation completes the sentence correctly?\n\nShe packed three things for the trip ______ a map, a flashlight, and a notebook.",
        options: [",", ";", ":", "—and"],
        answer: [2],
        explain: "A colon introduces a list after a complete independent clause.",
      },
    ],
  },
  math: {
    id: "math",
    label: "Math",
    minutesPer: 1.5,
    questions: [
      {
        id: "m1",
        prompt: "In triangle ABC, AB = 7 cm, BC = 6 cm and CA = 5 cm. Which angle is the largest?",
        figure: "triangle",
        options: ["∠A", "∠B", "∠C", "All angles are equal"],
        answer: [2],
        explain: "The largest angle is opposite the longest side. AB = 7 is the longest side, and it is opposite ∠C.",
      },
      {
        id: "m2",
        prompt: "What are the zeros of f(x) = x² − x − 6?",
        options: ["x = 2 and x = −3", "x = −2 and x = 3", "x = 1 and x = −6", "x = 6 and x = −1"],
        answer: [1],
        explain: "x² − x − 6 = (x − 3)(x + 2), so the zeros are x = 3 and x = −2.",
      },
      {
        id: "m3",
        prompt: "If 3x + 5 = 20, what is the value of 6x?",
        options: ["15", "25", "30", "35"],
        answer: [2],
        explain: "3x = 15, so x = 5 and 6x = 30. (Or double both sides: 6x + 10 = 40.)",
      },
      {
        id: "m4",
        prompt: "A shirt costs $40 after a 20% discount. What was the original price?",
        options: ["$32", "$48", "$50", "$60"],
        answer: [2],
        explain: "40 is 80% of the original price, so the original is 40 ÷ 0.8 = $50.",
      },
      {
        id: "m5",
        prompt: "What is the derivative of f(x) = x³ − 3x + 2?",
        options: ["3x² − 3", "x² − 3", "3x² + 2", "3x − 3"],
        answer: [0],
        explain: "Differentiate term by term: (x³)′ = 3x², (−3x)′ = −3, and the constant 2 disappears.",
      },
    ],
  },
  japanese: {
    id: "japanese",
    label: "Japanese as a Foreign Language",
    minutesPer: 1,
    questions: [
      {
        id: "j1",
        prompt: "次の文のうち、敬語として正しいものをすべて選びなさい。",
        multi: true,
        options: ["社長がおっしゃいました。", "先生が参りました。", "お客様がいらっしゃいました。", "私が拝見しました。"],
        answer: [0, 2, 3],
        explain: "「参る」は謙譲語なので、先生（目上）の動作には使いません。他の三つは正しい敬語です。",
      },
      {
        id: "j2",
        prompt: "「すみません」の意味として最も近いものはどれですか。",
        options: ["Thank you", "Excuse me / I'm sorry", "Good night", "Congratulations"],
        answer: [1],
        explain: "「すみません」は謝るときや人を呼ぶときに使います。",
      },
      {
        id: "j3",
        prompt: "（　）に入る最も適切な助詞はどれですか。\n図書館（　）本を読みます。",
        options: ["を", "に", "で", "へ"],
        answer: [2],
        explain: "動作をする場所は「で」で表します：図書館で本を読みます。",
      },
      {
        id: "j4",
        prompt: "「早い」の反対の意味の言葉はどれですか。",
        options: ["遅い", "高い", "近い", "古い"],
        answer: [0],
        explain: "「早い」の反対は「遅い」です。",
      },
    ],
  },
  english: {
    id: "english",
    label: "English",
    minutesPer: 1,
    questions: [
      {
        id: "e1",
        prompt: "Choose the word closest in meaning to “abundant”.",
        options: ["scarce", "plentiful", "fragile", "ordinary"],
        answer: [1],
        explain: "“Abundant” means existing in large quantities — “plentiful”.",
      },
      {
        id: "e2",
        prompt: "Choose the correct sentence.",
        options: ["She don't like coffee.", "She doesn't likes coffee.", "She doesn't like coffee.", "She not like coffee."],
        answer: [2],
        explain: "Third person singular uses “doesn't” + base verb: “She doesn't like coffee.”",
      },
      {
        id: "e3",
        prompt: "If I ______ more time, I would learn another language.",
        options: ["have", "had", "will have", "having"],
        answer: [1],
        explain: "Second conditional (unreal present): if + past simple, would + base verb.",
      },
      {
        id: "e4",
        prompt: "Which word is a synonym of “meticulous”?",
        options: ["careless", "thorough", "quick", "loud"],
        answer: [1],
        explain: "“Meticulous” means showing great attention to detail — “thorough”.",
      },
    ],
  },
};
