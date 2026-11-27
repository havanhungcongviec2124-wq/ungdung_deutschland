import { SPEAKING_TOPICS } from "./speakingTopics";

const STORAGE_KEY = "wortkarte.speaking.v1";

// Mỗi khu vực luyện nói có thể dùng riêng một kho lưu trữ và một danh mục đề.
// Mặc định giữ nguyên hành vi của 49 đề Goethe để không ảnh hưởng dữ liệu cũ.
function resolveConfig(options = {}) {
  return {
    storageKey: options.storageKey || STORAGE_KEY,
    catalog: options.catalog || SPEAKING_TOPICS,
    idPrefix: options.idPrefix || "speaking",
  };
}

function normalizeSchedule(value) {
  if (!value || typeof value !== "object") return null;
  const columns = Array.isArray(value.columns)
    ? value.columns.slice(0, 3).map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const rows = Array.isArray(value.rows)
    ? value.rows
        .slice(0, 20)
        .map((row) => (Array.isArray(row) ? row.slice(0, 3).map((cell) => String(cell || "").trim()) : []))
        .filter((row) => row.some(Boolean))
    : [];
  const items = Array.isArray(value.items)
    ? value.items.slice(0, 20).map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const slots = Array.isArray(value.slots)
    ? value.slots.slice(0, 24).map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const blocks = Array.isArray(value.blocks)
    ? value.blocks
        .slice(0, 16)
        .map((block) => ({
          start: String(block?.start || "").trim(),
          end: String(block?.end || "").trim(),
          label: String(block?.label || "").trim(),
        }))
        .filter((block) => block.start && block.end && block.label)
    : [];
  const caption = String(value.caption || "").trim();
  if (columns.length && slots.length && blocks.length) {
    return { caption, columns, slots, blocks };
  }
  if (columns.length && items.length) return { caption, columns, items };
  if (columns.length && rows.length) return { caption, columns, rows };
  return null;
}

function normalizeSheets(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const sheets = {};
  for (const side of ["A", "B"]) {
    const sheet = normalizeSchedule(value[side]);
    if (sheet) sheets[side] = sheet;
  }
  return Object.keys(sheets).length === 2 ? sheets : null;
}

function normalizeTopic(value) {
  if (!value || typeof value !== "object") return null;
  const question = String(value.question || "").trim();
  if (!question) return null;
  const hints = Array.isArray(value.hints)
    ? value.hints.map((hint) => String(hint || "").trim()).filter(Boolean).slice(0, 8)
    : [];
  const schedule = normalizeSchedule(value.schedule);
  const sheets = normalizeSheets(value.sheets);
  return {
    id: String(value.id || "").trim(),
    topicId: String(value.topicId || value.id || "custom").trim(),
    question,
    hints,
    custom: Boolean(value.custom),
    aiGenerated: Boolean(value.aiGenerated),
    addedAt: String(value.addedAt || ""),
    ...(schedule ? { schedule } : {}),
    ...(sheets ? { sheets } : {}),
  };
}

export function topicKey(topic) {
  // Trùng câu hỏi thì coi là cùng một đề tài, dễ dàng bỏ qua dù nguồn khác nhau.
  return String(topic?.question || "").trim().toLocaleLowerCase("de");
}

export function readSpeakingBoards(options = {}) {
  const { storageKey } = resolveConfig(options);
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed?.boards;
    if (!Array.isArray(list)) return [];
    return list.map(normalizeTopic).filter(Boolean);
  } catch {
    return [];
  }
}

function readStore(options = {}) {
  const { storageKey } = resolveConfig(options);
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
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
  const schedule = normalizeSchedule(value.schedule);
  const sheets = normalizeSheets(value.sheets);
  return {
    question,
    hints,
    ...(schedule ? { schedule } : {}),
    ...(sheets ? { sheets } : {}),
  };
}

export function readSpeakingOverrides(options = {}) {
  const raw = readStore(options).overrides;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result = {};
  for (const [id, value] of Object.entries(raw)) {
    const override = normalizeOverride(value);
    if (override) result[id] = override;
  }
  return result;
}

export function readSpeakingHidden(options = {}) {
  const raw = readStore(options).hidden;
  if (!Array.isArray(raw)) return [];
  const { catalog } = resolveConfig(options);
  const libraryIds = new Set(catalog.map((topic) => topic.id));
  return [...new Set(raw.map((id) => String(id || "").trim()).filter((id) => libraryIds.has(id)))];
}

export function saveSpeakingData(boards, overrides, hidden, options = {}) {
  const { storageKey } = resolveConfig(options);
  const finalHidden = hidden || readSpeakingHidden(options);
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ boards, overrides, hidden: finalHidden })
    );
  } catch {
    // localStorage có thể bị chặn; bỏ qua thay vì làm hỏng giao diện.
  }
}

export function saveSpeakingBoards(boards, options = {}) {
  saveSpeakingData(boards, readSpeakingOverrides(options), undefined, options);
}

export function makeSpeakingBoards(incoming, existing = [], options = {}) {
  const { idPrefix } = resolveConfig(options);
  const seen = new Set(existing.map(topicKey));
  const added = [];
  for (const item of incoming) {
    const topic = normalizeTopic(item);
    if (!topic || seen.has(topicKey(topic))) continue;
    seen.add(topicKey(topic));
    added.push({
      ...topic,
      id: `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      addedAt: new Date().toISOString(),
    });
  }
  return added;
}

export function searchSpeakingTopics(query, options = {}) {
  const { catalog } = resolveConfig(options);
  const needle = String(query || "").trim().toLocaleLowerCase("de");
  if (!needle) return catalog;
  return catalog.filter((topic) =>
    [topic.question, topic.label, ...topic.hints]
      .join(" ")
      .toLocaleLowerCase("de")
      .includes(needle)
  );
}
