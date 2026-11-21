/** Catalog for the Exam Library. `drill` marks exams with practice questions. */
export type ExamCategory = "University admission" | "School leaving" | "Graduate admission" | "Language proficiency" | "Professional" | "International";

export type Exam = {
  id: string;
  name: string;
  native?: string;
  about: string;
  category: ExamCategory;
  region: string;
  format: "Paper" | "Digital" | "Adaptive digital" | "Paper or digital";
  level: 1 | 2 | 3 | 4 | 5;
  drill?: string;
};

export const CATEGORIES: ExamCategory[] = ["University admission", "School leaving", "Graduate admission", "Language proficiency", "Professional", "International"];

export const EXAMS: Exam[] = [
  { id: "a-level", name: "A-Level", about: "Two-year subject qualifications, usually three or four subjects, taken at 18.", category: "School leaving", region: "United Kingdom", format: "Paper", level: 4 },
  { id: "act", name: "ACT", about: "US college admission test: English, math, reading and optional science and writing.", category: "University admission", region: "United States", format: "Paper or digital", level: 3, drill: "math" },
  { id: "ap", name: "AP", about: "Advanced Placement exams in 38 subjects, scored 1–5 for college credit.", category: "University admission", region: "United States", format: "Paper or digital", level: 4, drill: "math" },
  { id: "bac", name: "Baccalauréat", native: "Le bac", about: "French end-of-school diploma with written and oral exams.", category: "School leaving", region: "France", format: "Paper", level: 4 },
  { id: "csat", name: "CSAT", native: "대학수학능력시험", about: "Korea's one-day university entrance exam, taken in November.", category: "University admission", region: "South Korea", format: "Paper", level: 5, drill: "math" },
  { id: "csca", name: "CSCA", about: "Standardized assessment for international students applying to Chinese universities.", category: "University admission", region: "China", format: "Digital", level: 3 },
  { id: "common-test", name: "Common Test", native: "大学入学共通テスト", about: "Japan's national university entrance test, held every January.", category: "University admission", region: "Japan", format: "Paper", level: 4, drill: "math" },
  { id: "duolingo", name: "Duolingo English Test", about: "Online adaptive English test you can take at home in about an hour.", category: "Language proficiency", region: "Global", format: "Adaptive digital", level: 2, drill: "english" },
  { id: "eju", name: "EJU", native: "日本留学試験", about: "Examination for Japanese University Admission for International Students.", category: "University admission", region: "Japan", format: "Paper", level: 3, drill: "japanese" },
  { id: "gcse", name: "GCSE", about: "Subject exams taken at 16 in England, Wales and Northern Ireland.", category: "School leaving", region: "United Kingdom", format: "Paper", level: 2 },
  { id: "gmat", name: "GMAT", about: "Business school admission: quantitative, verbal and data insights.", category: "Graduate admission", region: "Global", format: "Adaptive digital", level: 4, drill: "math" },
  { id: "gaokao", name: "Gaokao", native: "普通高等学校招生全国统一考试", about: "China's national college entrance exam, taken by over 13 million students.", category: "University admission", region: "China", format: "Paper", level: 5, drill: "math" },
  { id: "gre", name: "GRE", about: "Graduate admission: verbal reasoning, quantitative reasoning, analytical writing.", category: "Graduate admission", region: "Global", format: "Adaptive digital", level: 4, drill: "english" },
  { id: "hkdse", name: "HKDSE", native: "香港中學文憑考試", about: "Hong Kong Diploma of Secondary Education, the school-leaving exam.", category: "School leaving", region: "Hong Kong", format: "Paper", level: 4 },
  { id: "hsk", name: "HSK", native: "汉语水平考试", about: "Chinese proficiency test with six (now nine) levels.", category: "Language proficiency", region: "Global", format: "Paper or digital", level: 3 },
  { id: "ib", name: "IB Diploma", about: "Two-year international diploma with six subjects, an extended essay and TOK.", category: "International", region: "Global", format: "Paper", level: 5 },
  { id: "ielts", name: "IELTS", about: "Four-skill English test for study, migration and work; paper or computer.", category: "Language proficiency", region: "Global", format: "Paper or digital", level: 3, drill: "english" },
  { id: "igcse", name: "IGCSE", about: "International equivalent of GCSE, taken in over 150 countries.", category: "International", region: "Global", format: "Paper", level: 2 },
  { id: "jee", name: "JEE Main", about: "India's main engineering entrance exam for NITs, IIITs and the qualifier for JEE Advanced.", category: "University admission", region: "India", format: "Digital", level: 5, drill: "math" },
  { id: "jlpt", name: "JLPT", native: "日本語能力試験", about: "Japanese-Language Proficiency Test, levels N5 (easiest) to N1.", category: "Language proficiency", region: "Global", format: "Paper", level: 3, drill: "japanese" },
  { id: "kaoyan", name: "Kaoyan", native: "全国硕士研究生招生考试", about: "China's unified postgraduate entrance exam, held each December.", category: "Graduate admission", region: "China", format: "Paper", level: 5 },
  { id: "lsat", name: "LSAT", about: "Law school admission test for North America: reasoning and reading.", category: "Graduate admission", region: "United States", format: "Digital", level: 4, drill: "english" },
  { id: "mcat", name: "MCAT", about: "Medical school admission: biology, chemistry, physics, psychology and reading.", category: "Graduate admission", region: "United States", format: "Digital", level: 5 },
  { id: "neet", name: "NEET", about: "India's single entrance test for MBBS, BDS and allied medical courses.", category: "University admission", region: "India", format: "Paper", level: 5 },
  { id: "pisa", name: "PISA", about: "OECD survey of 15-year-olds in reading, math and science, every three years.", category: "International", region: "Global", format: "Digital", level: 2, drill: "math" },
  { id: "psat", name: "PSAT/NMSQT", about: "Practice SAT and qualifier for the National Merit Scholarship.", category: "University admission", region: "United States", format: "Adaptive digital", level: 2, drill: "english" },
  { id: "sat", name: "SAT", about: "Digital adaptive college admission test: Reading & Writing and Math.", category: "University admission", region: "United States", format: "Adaptive digital", level: 3, drill: "sat" },
  { id: "spm", name: "SPM", native: "Sijil Pelajaran Malaysia", about: "Malaysia's main school-leaving certificate, taken at the end of Form 5.", category: "School leaving", region: "Malaysia", format: "Paper", level: 3 },
  { id: "a-level-sg", name: "Singapore A-Level", about: "Senior college leaving qualification with H1, H2 and H3 subjects.", category: "School leaving", region: "Singapore", format: "Paper", level: 4 },
  { id: "thpt", name: "THPT", native: "Kỳ thi tốt nghiệp THPT", about: "Vietnam's national high school graduation and university entrance exam.", category: "School leaving", region: "Vietnam", format: "Paper", level: 3 },
  { id: "toefl", name: "TOEFL iBT", about: "Academic English test for university admission, delivered at test centers or at home.", category: "Language proficiency", region: "Global", format: "Digital", level: 3, drill: "english" },
  { id: "toeic", name: "TOEIC", about: "Workplace English test: listening and reading, scored out of 990.", category: "Language proficiency", region: "Global", format: "Paper", level: 2, drill: "english" },
  { id: "utbk", name: "UTBK-SNBT", about: "Indonesia's computer-based test for state university admission.", category: "University admission", region: "Indonesia", format: "Digital", level: 3, drill: "math" },
  { id: "abitur", name: "Abitur", about: "German school-leaving qualification that grants university access.", category: "School leaving", region: "Germany", format: "Paper", level: 4 },
  { id: "matura", name: "Matura", about: "Final secondary exams in Austria, Switzerland, Poland and others.", category: "School leaving", region: "Europe", format: "Paper", level: 3 },
  { id: "enem", name: "ENEM", about: "Brazil's national high school exam, used for federal university admission.", category: "University admission", region: "Brazil", format: "Paper", level: 3 },
  { id: "yks", name: "YKS", about: "Turkey's higher education institutions exam in three sessions.", category: "University admission", region: "Turkey", format: "Paper", level: 4 },
  { id: "delf", name: "DELF / DALF", about: "French language diplomas from A1 to C2, valid for life.", category: "Language proficiency", region: "Global", format: "Paper", level: 3 },
  { id: "dele", name: "DELE", about: "Spanish language diplomas from the Instituto Cervantes, A1 to C2.", category: "Language proficiency", region: "Global", format: "Paper", level: 3 },
  { id: "topik", name: "TOPIK", native: "한국어능력시험", about: "Test of Proficiency in Korean, levels 1 to 6.", category: "Language proficiency", region: "Global", format: "Paper or digital", level: 3 },
  { id: "goethe", name: "Goethe-Zertifikat", about: "German language certificates from A1 to C2.", category: "Language proficiency", region: "Global", format: "Paper", level: 3 },
  { id: "cfa", name: "CFA Level I", about: "Investment analysis and ethics; the first of three CFA exams.", category: "Professional", region: "Global", format: "Digital", level: 5 },
  { id: "usmle", name: "USMLE Step 1", about: "First licensing exam for medical doctors in the United States.", category: "Professional", region: "United States", format: "Digital", level: 5 },
  { id: "bar", name: "Uniform Bar Exam", about: "Two-day lawyer licensing exam used by most US jurisdictions.", category: "Professional", region: "United States", format: "Paper or digital", level: 5 },
];
