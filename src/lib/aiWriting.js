import { postAi } from "./aiSentence";

// Đề viết Goethe A2 Schreiben dùng trình độ cố định A2.2, giống phần nói.
export const WRITING_LEVEL = "A2.2";

export function countGermanWords(value) {
  return String(value || "")
    .match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu)?.length || 0;
}

function topicPayload(topic, answer) {
  const hints = Array.isArray(topic?.hints)
    ? topic.hints.filter(Boolean).slice(0, 6).map((item) => String(item).trim())
    : [];
  return {
    level: WRITING_LEVEL,
    question: String(topic?.question || "").trim(),
    format: String(topic?.format || "SMS").trim(),
    hints,
    minWords: Number(topic?.minWords) || 20,
    maxWords: Number(topic?.maxWords) || 30,
    wordCount: countGermanWords(answer),
  };
}

// Gửi bài viết tiếng Đức để AI chấm theo 3 ý, số từ và ngữ pháp A2.
export async function checkWriting(topic, answer) {
  const value = String(answer || "").trim();
  if (!value) throw new Error("Hãy viết bài cần chấm.");
  const question = String(topic?.question || "").trim();
  if (!question) throw new Error("Thiếu đề bài viết.");

  const result = await postAi("/api/writing/check", {
    ...topicPayload(topic, value),
    answer: value,
  });
  if (typeof result?.correct !== "boolean") {
    throw new Error("AI trả về kết quả chấm điểm không hợp lệ.");
  }
  const points = Array.isArray(result.points)
    ? result.points.slice(0, 3).map((item) => item === true)
    : [];
  while (points.length < 3) points.push(false);
  return {
    correct: result.correct,
    corrected: String(result.corrected || value).trim(),
    explanation: String(result.explanation || "AI chưa đưa ra nhận xét.").trim(),
    score: Math.min(10, Math.max(0, Number(result.score) || 0)),
    points,
    wordCount: countGermanWords(value),
  };
}

// Tạo một đề SMS (Teil 1) hoặc E-Mail (Teil 2) mới: 1 đề bài + đúng 3 ý cần viết.
export async function generateWritingTopic(excludeQuestions = [], mode = "sms1") {
  const part = mode === "email2" ? "email2" : "sms1";
  const result = await postAi("/api/writing/generate-topic", {
    nonce: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    mode: part,
    // Worker giới hạn thân yêu cầu 8 KB; chỉ gửi một phần đề gần đây để tránh trùng mà vẫn gọn.
    excludeQuestions: Array.isArray(excludeQuestions)
      ? excludeQuestions
          .slice(-30)
          .map((item) => String(item || "").trim().slice(0, 180))
          .filter(Boolean)
      : [],
  });

  const question = String(result?.question || "").trim();
  const hints = Array.isArray(result?.hints)
    ? result.hints.map((hint) => String(hint || "").trim()).filter(Boolean).slice(0, 3)
    : [];
  if (!question || hints.length !== 3) {
    throw new Error("AI chưa tạo đủ 1 đề bài và 3 ý. Hãy bấm lại để thử đề khác.");
  }
  const format = part === "email2" ? "E-Mail" : "SMS";
  return {
    question,
    hints,
    format,
    minWords: format === "SMS" ? 20 : 30,
    maxWords: format === "SMS" ? 30 : 40,
  };
}
