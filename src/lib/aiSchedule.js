import { postAi } from "./aiSentence";

// Một lượt trong hội thoại Teil 3. opener/reporter là Kandidat A hoặc B;
// history ghi rõ bên nói để AI không nhầm lịch của hai phiếu.
export async function chatSchedule({
  question,
  sheets,
  history = [],
  userSide = "A",
  opener = "A",
  reporter = "A",
  finalReport = false,
}) {
  const result = await postAi("/api/schedule/chat", {
    question: String(question || "").trim(),
    sheets: sheets || null,
    history: history.slice(-12).map((item) => ({
      side: item.side === "A" || item.side === "B" ? item.side : "A",
      role: item.role === "user" ? "user" : "ai",
      text: String(item.text || "").trim(),
    })),
    userSide: userSide === "B" ? "B" : "A",
    opener: opener === "A" || opener === "B" ? opener : "A",
    reporter: reporter === "A" || reporter === "B" ? reporter : "A",
    finalReport: Boolean(finalReport),
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
    awaitingReport: Boolean(result?.awaitingReport),
    reporter: result?.reporter === "A" || result?.reporter === "B" ? result.reporter : "A",
  };
}
