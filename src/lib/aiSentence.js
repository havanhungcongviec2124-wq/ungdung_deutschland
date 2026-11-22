import { getApiOrigin } from "./folderSharing";
import { shuffle } from "./appData";

const AI_TIMEOUT_MS = 60000;

function cardPayload(card) {
  return {
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

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("Dịch vụ AI trả về dữ liệu không hợp lệ.");
  }
  if (!response.ok) {
    throw new Error(body?.error || `Dịch vụ AI lỗi (${response.status}).`);
  }
  return body;
}

export async function requestSentencePrompt(card) {
  const result = await postAi("/api/sentence/prompt", cardPayload(card));
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

export async function checkSentence(card, sentence) {
  const value = String(sentence || "").trim();
  if (!value) throw new Error("Hãy viết câu cần kiểm tra.");
  const result = await postAi("/api/sentence/check", { ...cardPayload(card), sentence: value });
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
