import { postAi } from "./aiSentence";

// Một lượt trong hội thoại thống nhất lịch trình.
// history gồm các lượt đã diễn ra, opener quyết định ai mở lời ở lượt đầu.
export async function chatSchedule({ question, schedule, history = [], opener = "ai" }) {
  const result = await postAi("/api/schedule/chat", {
    question: String(question || "").trim(),
    schedule: schedule || null,
    history: history.slice(-12).map((item) => ({
      role: item.role === "user" ? "user" : "ai",
      text: String(item.text || "").trim(),
    })),
    opener: opener === "user" ? "user" : "ai",
  });

  const message = String(result?.message || "").trim();
  if (!message) throw new Error("AI chưa phản hồi được. Hãy thử lại.");
  return {
    message,
    translation: String(result?.translation || "").trim(),
    explanation: String(result?.explanation || "").trim(),
    userTranslation: String(result?.userTranslation || "").trim(),
    done: Boolean(result?.done),
    agreement: String(result?.agreement || message).trim(),
  };
}
