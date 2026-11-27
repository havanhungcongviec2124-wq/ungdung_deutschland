import { postAi } from "./aiSentence";

// Đề nói dùng trình độ cố định A2 theo bộ Goethe-Zertifikat A2 Sprechen Teil 2.
export const SPEAKING_LEVEL = "A2.2";

function topicPayload(topic) {
  return {
    level: SPEAKING_LEVEL,
    question: String(topic?.question || "").trim(),
    hints: Array.isArray(topic?.hints) ? topic.hints.filter(Boolean).slice(0, 8) : [],
  };
}

// Tạo một đề nói mới: 1 câu hỏi tiếng Đức + đúng 4 gợi ý.
export async function generateSpeakingTopic(excludeQuestions = [], context = "", mode = "") {
  const result = await postAi("/api/speaking/generate-topic", {
    mode: mode === "schedule" ? "schedule" : "",
    context: String(context || "").trim().slice(0, 400),
    nonce: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    excludeQuestions: Array.isArray(excludeQuestions)
      ? excludeQuestions.slice(0, 60).map((item) => String(item || "").trim()).filter(Boolean)
      : [],
  });

  const question = String(result?.question || "").trim();
  const hints = Array.isArray(result?.hints)
    ? result.hints.map((hint) => String(hint || "").trim()).filter(Boolean).slice(0, 4)
    : [];
  // Đề lịch trình A/B có 3 câu hướng dẫn chung + 2 phiếu, không dùng 4 gợi ý.
  const sheets = result?.sheets && typeof result.sheets === "object" ? result.sheets : null;
  if (mode === "schedule") {
    if (!question || !Array.isArray(sheets?.A?.hints) || !Array.isArray(sheets?.B?.hints)) {
      throw new Error("AI chưa tạo được đủ phiếu A và B. Hãy bấm lại để thử đề khác.");
    }
  } else if (!question || hints.length !== 4) {
    throw new Error("AI chưa tạo đủ 1 câu hỏi và 4 gợi ý. Hãy bấm lại để thử đề khác.");
  }
  const caption = String(result?.caption || "").trim();
  return {
    question,
    hints,
    ...(caption ? { caption } : {}),
    ...(sheets ? { sheets } : {}),
  };
}

// Nộp câu trả lời đầu: AI chấm và tạo 1-6 câu hỏi phụ cùng lúc.
export async function startSpeaking(topic, answer) {
  const value = String(answer || "").trim();
  if (!value) throw new Error("Hãy viết câu trả lời tiếng Đức.");
  const result = await postAi("/api/speaking/start", {
    ...topicPayload(topic),
    answer: value,
  });
  if (typeof result?.correct !== "boolean" || !Array.isArray(result?.followUps)) {
    throw new Error("AI trả về kết quả chấm điểm không hợp lệ.");
  }
  return {
    correct: result.correct,
    corrected: String(result.corrected || value).trim(),
    explanation: String(result.explanation || "AI chưa đưa ra nhận xét.").trim(),
    followUps: result.followUps
      .filter((item) => item && String(item.question || "").trim())
      .slice(0, 6)
      .map((item, index) => ({
        id: String(item.id || `f${index + 1}`),
        question: String(item.question).trim(),
        translation: String(item.translation || "").trim(),
        hint: String(item.hint || "").trim(),
      })),
  };
}

// Chấm riêng từng câu hỏi phụ.
export async function checkSpeaking(topic, question, answer) {
  const value = String(answer || "").trim();
  if (!value) throw new Error("Hãy viết câu trả lời tiếng Đức.");
  const result = await postAi("/api/speaking/check", {
    ...topicPayload(topic),
    question: String(question || "").trim(),
    answer: value,
  });
  if (typeof result?.correct !== "boolean") {
    throw new Error("AI trả về kết quả chấm điểm không hợp lệ.");
  }
  return {
    correct: result.correct,
    corrected: String(result.corrected || value).trim(),
    explanation: String(result.explanation || "AI chưa đưa ra nhận xét.").trim(),
  };
}
