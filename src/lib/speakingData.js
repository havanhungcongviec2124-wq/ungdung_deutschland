import { SPEAKING_TOPICS } from "./speakingTopics";

const STORAGE_KEY = "wortkarte.speaking.v1";

function normalizeTopic(value) {
  if (!value || typeof value !== "object") return null;
  const question = String(value.question || "").trim();
  if (!question) return null;
  const hints = Array.isArray(value.hints)
    ? value.hints.map((hint) => String(hint || "").trim()).filter(Boolean).slice(0, 8)
    : [];
  return {
    id: String(value.id || "").trim(),
    topicId: String(value.topicId || value.id || "custom").trim(),
    question,
    hints,
    custom: Boolean(value.custom),
    addedAt: String(value.addedAt || ""),
  };
}

export function topicKey(topic) {
  // Trùng câu hỏi thì coi là cùng một đề tài, dễ dàng bỏ qua dù nguồn khác nhau.
  return String(topic?.question || "").trim().toLocaleLowerCase("de");
}

export function readSpeakingBoards() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed?.boards;
    if (!Array.isArray(list)) return [];
    return list.map(normalizeTopic).filter(Boolean);
  } catch {
    return [];
  }
}

function readStore() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeOverride(value) {
  if (!value || typeof value !== "object") return null;
  const question = String(value.question || "").trim();
  if (!question) return null;
  const hints = Array.isArray(value.hints)
    ? value.hints.map((hint) => String(hint || "").trim()).filter(Boolean).slice(0, 8)
    : [];
  return { question, hints };
}

export function readSpeakingOverrides() {
  const raw = readStore().overrides;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result = {};
  for (const [id, value] of Object.entries(raw)) {
    const override = normalizeOverride(value);
    if (override) result[id] = override;
  }
  return result;
}

export function readSpeakingHidden() {
  const raw = readStore().hidden;
  if (!Array.isArray(raw)) return [];
  const libraryIds = new Set(SPEAKING_TOPICS.map((topic) => topic.id));
  return [...new Set(raw.map((id) => String(id || "").trim()).filter((id) => libraryIds.has(id)))];
}

export function saveSpeakingData(boards, overrides, hidden = readSpeakingHidden()) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ boards, overrides, hidden }));
  } catch {
    // localStorage có thể bị chặn; bỏ qua thay vì làm hỏng giao diện.
  }
}

export function saveSpeakingBoards(boards) {
  saveSpeakingData(boards, readSpeakingOverrides());
}

export function makeSpeakingBoards(incoming, existing = []) {
  const seen = new Set(existing.map(topicKey));
  const added = [];
  for (const item of incoming) {
    const topic = normalizeTopic(item);
    if (!topic || seen.has(topicKey(topic))) continue;
    seen.add(topicKey(topic));
    added.push({
      ...topic,
      id: `speaking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      addedAt: new Date().toISOString(),
    });
  }
  return added;
}

export function searchSpeakingTopics(query) {
  const needle = String(query || "").trim().toLocaleLowerCase("de");
  if (!needle) return SPEAKING_TOPICS;
  return SPEAKING_TOPICS.filter((topic) =>
    [topic.question, topic.label, ...topic.hints]
      .join(" ")
      .toLocaleLowerCase("de")
      .includes(needle)
  );
}
