/**
 * Translation practice for Nino's Language Class. Each item has a prompt in
 * English and the right answer in the target language, plus distractors.
 */
export type LangItem = { prompt: string; answer: string; options: string[]; reading?: string };

export type Course = { id: string; label: string; speechLang: string; items: LangItem[] };

export const COURSES: Course[] = [
  {
    id: "ja",
    label: "Japanese",
    speechLang: "ja-JP",
    items: [
      { prompt: "Goodbye", answer: "さようなら", reading: "sayōnara", options: ["さようなら", "を", "こんにちは", "分かりません。"] },
      { prompt: "Thank you", answer: "ありがとう", reading: "arigatō", options: ["ー", "こんにちは", "私の名前は二乃です。", "ありがとう"] },
      { prompt: "Hello", answer: "こんにちは", reading: "konnichiwa", options: ["おやすみ", "こんにちは", "すみません", "はい"] },
      { prompt: "My name is Nino.", answer: "私の名前は二乃です。", reading: "watashi no namae wa Nino desu", options: ["私の名前は二乃です。", "二乃は学生です。", "これはペンです。", "おはよう"] },
      { prompt: "I don't understand.", answer: "分かりません。", reading: "wakarimasen", options: ["分かりました。", "分かりません。", "いただきます。", "ごめんね"] },
      { prompt: "Good morning", answer: "おはよう", reading: "ohayō", options: ["こんばんは", "おはよう", "さようなら", "いいえ"] },
      { prompt: "Excuse me", answer: "すみません", reading: "sumimasen", options: ["すみません", "ありがとう", "どうぞ", "はじめまして"] },
      { prompt: "Nice to meet you", answer: "はじめまして", reading: "hajimemashite", options: ["お元気ですか", "はじめまして", "また明日", "おめでとう"] },
    ],
  },
  {
    id: "id",
    label: "Indonesian",
    speechLang: "id-ID",
    items: [
      { prompt: "Good morning", answer: "Selamat pagi", options: ["Selamat malam", "Selamat pagi", "Terima kasih", "Sampai jumpa"] },
      { prompt: "Thank you", answer: "Terima kasih", options: ["Maaf", "Terima kasih", "Permisi", "Tolong"] },
      { prompt: "I don't understand.", answer: "Saya tidak mengerti.", options: ["Saya tidak mengerti.", "Saya lapar.", "Saya mengerti.", "Siapa nama kamu?"] },
      { prompt: "Where is the library?", answer: "Di mana perpustakaan?", options: ["Di mana perpustakaan?", "Kapan kelasnya?", "Berapa harganya?", "Apa kabar?"] },
      { prompt: "See you tomorrow", answer: "Sampai jumpa besok", options: ["Selamat tidur", "Sampai jumpa besok", "Hati-hati", "Selamat datang"] },
    ],
  },
  {
    id: "es",
    label: "Spanish",
    speechLang: "es-ES",
    items: [
      { prompt: "Hello", answer: "Hola", options: ["Adiós", "Hola", "Gracias", "Por favor"] },
      { prompt: "Thank you", answer: "Gracias", options: ["Lo siento", "De nada", "Gracias", "Perdón"] },
      { prompt: "My name is Nino.", answer: "Me llamo Nino.", options: ["Me llamo Nino.", "Soy de Japón.", "Tengo hambre.", "¿Cómo estás?"] },
      { prompt: "I don't understand.", answer: "No entiendo.", options: ["No sé.", "No entiendo.", "No quiero.", "Entiendo."] },
      { prompt: "Goodbye", answer: "Adiós", options: ["Adiós", "Buenas noches", "Hasta luego", "Bienvenido"] },
    ],
  },
];

export const NINO_PRAISE = [
  { en: "Good. You got it. Keep going.", ja: "いいじゃない。正解よ。その調子。" },
  { en: "Hmph, not bad at all.", ja: "ふん、悪くないわね。" },
  { en: "See? You can do it when you focus.", ja: "ほら、集中すればできるじゃない。" },
];

export const NINO_SCOLD = [
  { en: "Wrong! Look again — I'll show you.", ja: "違うわよ！もう一回見て。" },
  { en: "Careful. Don't just guess.", ja: "適当に選ばないで。" },
];
