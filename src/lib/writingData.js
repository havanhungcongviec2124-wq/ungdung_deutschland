import { WRITING_TOPICS } from "./writingTopics";

// Kho riêng cho Luyện viết SMS và Thư: không dùng chung với 49 đề nói hay 19 đề lịch trình.
const STORAGE_KEY = "wortkarte.writing.v1";

function text(value, max = 400) {
  return String(value || "").trim().slice(0, max);
}

function numberInRange(value, fallback, min, max) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(Math.max(Math.round(parsed), min), max) : fallback;
}

export function normalizeWritingTopic(value) {
  if (!value || typeof value !== "object") return null;
  const question = text(value.question, 1200);
  if (!question) return null;
  const hints = Array.isArray(value.hints)
    ? value.hints.map((hint) => text(hint, 300)).filter(Boolean).slice(0, 6)
    : [];
  const formatRaw = text(value.format, 20).toLowerCase();
  const format = formatRaw.includes("sms") ? "SMS" : formatRaw.includes("brief") ? "Brief" : "E-Mail";
  const minWords = numberInRange(value.minWords, format === "SMS" ? 20 : 30, 5, 200);
  let maxWords = numberInRange(value.maxWords, format === "SMS" ? 30 : 40, 5, 240);
  if (maxWords < minWords) maxWords = minWords + 10;
  return {
    id: text(value.id, 120),
    topicId: text(value.topicId || value.id || "custom", 120),
    label: text(value.label, 120),
    question,
    hints,
    format,
    minWords,
    maxWords,
    custom: Boolean(value.custom),
    aiGenerated: Boolean(value.aiGenerated),
    addedAt: text(value.addedAt, 60),
    ...(value.test ? { test: numberInRange(value.test, 0, 0, 999) } : {}),
    ...(value.part ? { part: numberInRange(value.part, 0, 0, 9) } : {}),
  };
}

export function topicKey(topic) {
  return String(topic?.question || "").trim().toLocaleLowerCase("de");
}

function readStore() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function readWritingBoards() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed?.boards;
    if (!Array.isArray(list)) return [];
    return list.map(normalizeWritingTopic).filter(Boolean);
  } catch {
    return [];
  }
}

export function readWritingOverrides() {
  const raw = readStore().overrides;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result = {};
  for (const [id, value] of Object.entries(raw)) {
    const override = normalizeWritingTopic(value);
    if (override) result[id] = override;
  }
  return result;
}

export function readWritingHidden() {
  const raw = readStore().hidden;
  if (!Array.isArray(raw)) return [];
  const libraryIds = new Set(WRITING_TOPICS.map((topic) => topic.id));
  return [...new Set(raw.map((id) => text(id, 120)).filter((id) => libraryIds.has(id)))];
}

export function saveWritingData(boards, overrides, hidden) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ boards, overrides, hidden: hidden || readWritingHidden() })
    );
  } catch {
    // localStorage có thể bị chặn; bỏ qua thay vì làm hỏng giao diện.
  }
}

export function makeWritingBoards(incoming, existing = []) {
  const seen = new Set(existing.map(topicKey));
  const added = [];
  for (const item of incoming) {
    const topic = normalizeWritingTopic(item);
    if (!topic || seen.has(topicKey(topic))) continue;
    seen.add(topicKey(topic));
    added.push({
      ...topic,
      id: `writing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      addedAt: new Date().toISOString(),
    });
  }
  return added;
}
