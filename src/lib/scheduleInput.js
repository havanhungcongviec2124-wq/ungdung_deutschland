// Chuyển các dòng dạng "08.00 – 09.00: joggen?" thành dữ liệu bảng lịch.
// Cũng nhận dạng "08.00: joggen" = 08.00 – 09.00.

function hourToken(value) {
  const match = String(value || "")
    .trim()
    .match(/^(\d{1,2})(?:[.:](\d{2}))?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  return hour;
}

function formatHour(hour) {
  return `${String(hour).padStart(2, "0")}.00`;
}

export function parseScheduleLines(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^(?:[-–•]\s*|\d+[.)]\s+)/, ""))
    .filter(Boolean);

  const blocks = [];
  for (const line of lines) {
    const range = line.match(
      /^(\d{1,2}(?:[.:]\d{2})?)\s*(?:-|–|—|bis)\s*(\d{1,2}(?:[.:]\d{2})?)\s*[:\-–]\s*(.+)$/i
    );
    const single = !range && line.match(/^(\d{1,2}(?:[.:]\d{2})?)\s*[:\-–]\s*(.+)$/);
    const startHour = hourToken(range?.[1] ?? single?.[1]);
    if (startHour === null) continue;
    const endHour = range ? hourToken(range[2]) : startHour + 1;
    if (endHour === null || endHour <= startHour || endHour > 24) continue;
    const label = String((range?.[3] ?? single?.[2]) || "")
      .replace(/[?？]+$/, "")
      .trim();
    if (!label) continue;
    blocks.push({ start: formatHour(startHour), end: formatHour(endHour), label });
  }
  if (!blocks.length) return null;

  blocks.sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
  const startHours = blocks.map((block) => Number(block.start.slice(0, 2)));
  const endHours = blocks.map((block) => Number(block.end.slice(0, 2)));
  const first = Math.min(...startHours);
  const last = Math.max(...endHours);
  const slots = [];
  for (let hour = first; hour <= last; hour += 1) slots.push(formatHour(hour));

  return {
    slots,
    blocks,
    hints: blocks.map((block) => `${block.start} – ${block.end}: ${block.label}?`),
  };
}

export function buildScheduleFromLines(text, caption = "Terminplan") {
  const parsed = parseScheduleLines(text);
  if (!parsed) return null;
  return {
    caption: String(caption || "Terminplan").trim() || "Terminplan",
    columns: ["Uhrzeit", "Termin"],
    slots: parsed.slots,
    blocks: parsed.blocks,
  };
}

export function withScheduleFromHints(topic, caption = "Terminplan") {
  if (!topic || !Array.isArray(topic.hints)) return topic;
  const parsed = parseScheduleLines(topic.hints.join("\n"));
  if (!parsed) return topic;
  return {
    ...topic,
    hints: parsed.hints,
    schedule: buildScheduleFromLines(topic.hints.join("\n"), caption),
  };
}
