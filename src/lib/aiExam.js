import { postAi } from "./aiSentence";

// Chấm tối đa 4 bài tự luận trong một yêu cầu để AI phản hồi nhanh và ổn định.
export async function gradeExamItems(level, items) {
  const payload = (Array.isArray(items) ? items : [])
    .filter((item) => item && String(item.answer || "").trim())
    .slice(0, 4)
    .map((item) => ({
      id: String(item.id || ""),
      taskType: String(item.taskType || "speaking"),
      prompt: String(item.prompt || "").trim().slice(0, 700),
      hints: Array.isArray(item.hints) ? item.hints.slice(0, 6).map((hint) => String(hint || "").trim()).filter(Boolean) : [],
      answer: String(item.answer || "").trim().slice(0, 1800),
      maxScore: Math.min(25, Math.max(1, Math.round(Number(item.maxScore) || 25))),
      ...(item.reference ? { reference: String(item.reference).trim().slice(0, 600) } : {}),
    }));
  if (!payload.length) throw new Error("Hãy trả lời ít nhất một câu trước khi nộp bài.");

  const result = await postAi("/api/exam/grade", { level, items: payload }, 40000);
  if (!Array.isArray(result?.grades)) {
    throw new Error("AI trả về kết quả chấm điểm không hợp lệ.");
  }
  return result.grades;
}

// Dùng endpoint nói hiện có để tạo 3–4 câu hỏi phụ theo đúng trình độ của bài thi.
export async function startExamSpeaking(level, prompt, hints, answer) {
  const value = String(answer || "").trim();
  if (!value) throw new Error("Hãy viết câu trả lời tiếng Đức.");
  const result = await postAi("/api/speaking/start", {
    level,
    question: String(prompt || "").trim(),
    hints: Array.isArray(hints) ? hints.slice(0, 8).map((hint) => String(hint || "").trim()).filter(Boolean) : [],
    answer: value,
  });
  if (!Array.isArray(result?.followUps)) {
    throw new Error("AI chưa tạo được câu hỏi phụ. Hãy thử lại.");
  }
  return result.followUps
    .filter((item) => item && String(item.question || "").trim())
    .slice(0, 4)
    .map((item, index) => ({
      id: String(item.id || `f${index + 1}`),
      question: String(item.question).trim(),
      translation: String(item.translation || "").trim(),
      hint: String(item.hint || "").trim(),
    }));
}
