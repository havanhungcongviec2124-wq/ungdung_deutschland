import { getApiOrigin } from "./folderSharing";
import { shuffle } from "./appData";

const AI_TIMEOUT_MS = 25000;
const AI_LEVEL_STORAGE_KEY = "wortkarte.ai.sentenceLevel";
export const DEFAULT_AI_LEVEL = "A1.1";

export const AI_LEVELS = [
  {
    id: "A1.1",
    label: "Mới bắt đầu",
    description: "Câu rất ngắn (3–6 từ), thì hiện tại, từ vựng quen thuộc nhất.",
  },
  {
    id: "A1.2",
    label: "Hoàn thành A1",
    description: "Câu ngắn (5–8 từ), mạo từ, số nhiều và câu hỏi đơn giản.",
  },
  {
    id: "A2.1",
    label: "Bắt đầu A2",
    description: "Câu 6–10 từ, thêm quá khứ Perfekt, động từ modal và und/aber.",
  },
  {
    id: "A2.2",
    label: "Hoàn thành A2",
    description: "Câu 8–12 từ, dùng weil/dass và trật tự từ tự nhiên hơn.",
  },
  {
    id: "B1.1",
    label: "Bắt đầu B1",
    description: "Câu 10–15 từ, có mệnh đề phụ và Konjunktiv II cơ bản.",
  },
  {
    id: "B1.2",
    label: "Hoàn thành B1",
    description: "Câu tự nhiên với wenn/obwohl và các cấu trúc B1 quen thuộc.",
  },
  {
    id: "B2.1",
    label: "Bắt đầu B2",
    description: "Câu phức tạp hơn, dùng Passiv, Konjunktiv II và liên từ B2.",
  },
  {
    id: "B2.2",
    label: "Hoàn thành B2",
    description: "Câu dài tự nhiên, diễn đạt ý kiến và dùng từ nối nâng cao.",
  },
];

export function normalizeAiLevel(level) {
  const value = String(level || "").trim().toUpperCase();
  return AI_LEVELS.some((item) => item.id === value) ? value : DEFAULT_AI_LEVEL;
}

export function readSavedAiLevel() {
  try {
    return normalizeAiLevel(window.localStorage.getItem(AI_LEVEL_STORAGE_KEY));
  } catch {
    return DEFAULT_AI_LEVEL;
  }
}

export function saveAiLevel(level) {
  try {
    window.localStorage.setItem(AI_LEVEL_STORAGE_KEY, normalizeAiLevel(level));
  } catch {
    // Trình duyệt có thể chặn localStorage; bỏ qua, không ảnh hưởng bài học.
  }
}

function cardPayload(card, level) {
  return {
    level: normalizeAiLevel(level),
    word: card?.front || "",
    plural: card?.plural || "",
    meaning: card?.back || "",
    note: card?.note || "",
  };
}

async function postAi(path, payload) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${getApiOrigin()}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("AI phản hồi quá lâu. Hãy thử lại.");
    }
    throw new Error("Không kết nối được dịch vụ AI. Hãy kiểm tra kết nối Internet.");
  } finally {
    window.clearTimeout(timer);
  }

  const raw = await response.text();
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error(
      `Dịch vụ AI trả về dữ liệu không hợp lệ (HTTP ${response.status}). Hãy thử lại.`
    );
  }
  if (!response.ok) {
    throw new Error(body?.error || `Dịch vụ AI lỗi (${response.status}).`);
  }
  return body;
}

export async function requestSentencePrompt(card, level) {
  const result = await postAi("/api/sentence/prompt", cardPayload(card, level));
  if (typeof result?.sentence !== "string" || !result.sentence.trim()) {
    throw new Error("AI không tạo được câu mẫu. Hãy thử lại.");
  }
  return {
    sentence: result.sentence.trim(),
    translation: typeof result.translation === "string" ? result.translation.trim() : "",
    hint: typeof result.hint === "string" ? result.hint.trim() : "",
    tokens: shuffle(
      Array.isArray(result.tokens)
        ? result.tokens.filter((token) => typeof token === "string" && token.trim())
        : result.sentence.trim().split(/\s+/).filter(Boolean)
    ),
  };
}

export async function checkSentence(card, sentence, level) {
  const value = String(sentence || "").trim();
  if (!value) throw new Error("Hãy viết câu cần kiểm tra.");
  const result = await postAi("/api/sentence/check", {
    ...cardPayload(card, level),
    sentence: value,
  });
  if (typeof result?.correct !== "boolean") {
    throw new Error("AI trả về kết quả chấm điểm không hợp lệ.");
  }
  return {
    correct: result.correct,
    corrected: typeof result.corrected === "string" && result.corrected.trim()
      ? result.corrected.trim()
      : value,
    explanation: typeof result.explanation === "string" ? result.explanation.trim() : "",
  };
}

export async function requestQuestionPrompt(card, level) {
  const result = await postAi("/api/sentence/question", cardPayload(card, level));
  if (typeof result?.question !== "string" || !result.question.trim()) {
    throw new Error("AI không tạo được câu hỏi. Hãy thử lại.");
  }
  return {
    question: result.question.trim(),
    translation: typeof result.translation === "string" ? result.translation.trim() : "",
    hint: typeof result.hint === "string" ? result.hint.trim() : "",
    expectedAnswer:
      typeof result.expectedAnswer === "string" ? result.expectedAnswer.trim() : "",
  };
}

const ANSWER_STOPWORDS = new Set([
  "das", "die", "der", "den", "dem", "des", "ein", "eine", "einer", "einem", "einen",
  "mein", "meine", "meiner", "meinem", "meinen", "dein", "deine", "deiner", "deinem",
  "deinen", "ich", "du", "er", "sie", "es", "wir", "ihr", "wer", "was", "wo", "wohin",
  "wie", "wann", "warum", "welche", "welcher", "ist", "bin", "bist", "sind", "seid",
  "hat", "habe", "haben", "gehe", "gehst", "gehen", "zum", "zur", "zu", "in", "im",
  "mit", "und", "aber", "oder", "für", "von", "vom", "auf", "bei", "nach",
]);
const ANSWER_NEGATIONS = new Set([
  "nicht", "kein", "keine", "keinen", "keinem", "keiner", "nie", "niemals", "ohne",
]);

function answerWords(value) {
  return String(value || "")
    .toLocaleLowerCase("de")
    .match(/[\p{L}\p{N}]+/gu) || [];
}

function carriesExpectedMeaning(expected, answer) {
  const answerTokens = answerWords(answer);
  if (answerTokens.some((word) => ANSWER_NEGATIONS.has(word))) return false;
  const expectedTokens = answerWords(expected).filter((word) => !ANSWER_STOPWORDS.has(word));
  const meaningful = expectedTokens.length ? expectedTokens : answerWords(expected);
  if (!meaningful.length) return false;
  const answerSet = new Set(answerTokens);
  return meaningful.every((word) => answerSet.has(word));
}

export async function checkAnswer(card, question, answer, level, expectedAnswer = "") {
  const value = String(answer || "").trim();
  if (!value) throw new Error("Hãy gõ câu trả lời.");
  const result = await postAi("/api/sentence/check", {
    ...cardPayload(card, level),
    kind: "question",
    question: String(question || "").trim(),
    sentence: value,
    expectedAnswer: String(expectedAnswer || "").trim(),
  });
  if (typeof result?.correct !== "boolean") {
    throw new Error("AI trả về kết quả chấm điểm không hợp lệ.");
  }

  let corrected = typeof result.corrected === "string" && result.corrected.trim()
    ? result.corrected.trim()
    : value;
  let correct = result.correct;
  let explanation = typeof result.explanation === "string" ? result.explanation.trim() : "";

  // AI đôi khi vẫn bám mẫu câu, ví dụ bắt "Das ist Bách." mà chấm sai
  // "Bách ist mein bester Freund.". So theo từ nội dung thì câu này vẫn đúng ý.
  if (!correct && carriesExpectedMeaning(expectedAnswer, value)) {
    correct = true;
    corrected = value;
    explanation =
      "Câu trả lời đúng ý câu hỏi và đúng ngữ pháp. Bạn không nhất thiết phải dùng đúng cấu trúc của đáp án mẫu.";
  }

  return { correct, corrected, explanation };
}
