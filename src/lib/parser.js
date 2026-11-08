import Papa from "papaparse";

const clean = (value = "") => String(value).replace(/^["']|["']$/g, "").trim();

/**
 * Accepts rows like:
 * der Fehler | die Fehler | lỗi, sai sót
 * der Fehler, die Fehler, lỗi, sai sót
 * CSV with headers: front,plural,back
 */
export function parseVocabularyText(text) {
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean);
  if (!lines.length) return [];

  const first = lines[0].toLowerCase();
  if (first.includes("front") && (first.includes("back") || first.includes("meaning"))) {
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true }).data;
    return parsed.map(row => ({
      front: clean(row.front || row.word || row.vocabulary),
      plural: clean(row.plural || row.plural_form),
      back: clean(row.back || row.meaning || row.translation),
      note: clean(row.note || row.example)
    })).filter(row => row.front && row.back);
  }

  return lines.map(line => {
    let parts = line.includes("\t") ? line.split("\t") : line.split(/\s*[|;]\s*/);
    if (parts.length < 2) parts = line.split(/\s{2,}/);
    parts = parts.map(clean);
    if (parts.length >= 3) return { front: parts[0], plural: parts[1], back: parts.slice(2).join(" "), note: "" };

    // Fallback: "der Fehler - lỗi, sai sót" or "der Fehler: lỗi, sai sót"
    const match = line.match(/^(.+?)\s*(?:[-–—:]|=>)\s*(.+)$/);
    if (match) return { front: clean(match[1]), plural: "", back: clean(match[2]), note: "" };
    return null;
  }).filter(row => row?.front && row?.back);
}

export function parseOcrText(text) {
  return parseVocabularyText(text.replace(/[|]/g, " | "));
}

const normalizeOcrText = value => String(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/Đ/g, "D")
  .toLowerCase()
  .trim();

function groupWordsByRow(words) {
  const sorted = words
    .filter(word => word.text?.trim() && word.bbox)
    .map(word => ({ ...word, centerY: (word.bbox.y0 + word.bbox.y1) / 2, height: word.bbox.y1 - word.bbox.y0 }))
    .sort((a, b) => a.centerY - b.centerY || a.bbox.x0 - b.bbox.x0);
  const heights = sorted.map(word => word.height).filter(height => height > 0).sort((a, b) => a - b);
  const rowTolerance = Math.max(8, (heights[Math.floor(heights.length / 2)] || 16) * 0.7);
  const rows = [];

  for (const word of sorted) {
    const row = rows.at(-1);
    if (row && Math.abs(word.centerY - row.centerY) <= rowTolerance) {
      row.words.push(word);
      row.centerY = row.words.reduce((sum, item) => sum + item.centerY, 0) / row.words.length;
    } else {
      rows.push({ centerY: word.centerY, words: [word] });
    }
  }
  return rows.map(row => row.words.sort((a, b) => a.bbox.x0 - b.bbox.x0));
}

function findHeaderAnchors(rows) {
  const frontPattern = /^(tu|vung|vocabulary|word|front)$/;
  const pluralPattern = /^(so|nhieu|plural|pluralform)$/;
  const backPattern = /^(nghia|meaning|translation|back|viet|vietnamese)$/;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const texts = row.map(word => normalizeOcrText(word.text));
    const joined = texts.join(" ");
    const hasFront = texts.some(text => frontPattern.test(text)) || joined.includes("tu vung");
    const hasPlural = texts.some(text => pluralPattern.test(text)) || joined.includes("so nhieu");
    const hasBack = texts.some(text => backPattern.test(text)) || joined.includes("nghia tieng viet");
    if (!hasFront || !hasBack) continue;

    const anchors = {
      front: row.filter(word => frontPattern.test(normalizeOcrText(word.text))).map(word => (word.bbox.x0 + word.bbox.x1) / 2),
      plural: row.filter(word => pluralPattern.test(normalizeOcrText(word.text))).map(word => (word.bbox.x0 + word.bbox.x1) / 2),
      back: row.filter(word => backPattern.test(normalizeOcrText(word.text))).map(word => (word.bbox.x0 + word.bbox.x1) / 2)
    };
    if (joined.includes("tu vung") && !anchors.front.length) {
      anchors.front = row.filter(word => ["tu", "vung"].includes(normalizeOcrText(word.text))).map(word => (word.bbox.x0 + word.bbox.x1) / 2);
    }
    if (joined.includes("nghia tieng viet") && !anchors.back.length) {
      anchors.back = row.filter(word => ["nghia", "tieng", "viet"].includes(normalizeOcrText(word.text))).map(word => (word.bbox.x0 + word.bbox.x1) / 2);
    }
    return { index, anchors, hasPlural };
  }
  return null;
}

function textForWords(words) {
  const text = words.map(word => word.text).join(" ").replace(/\s+/g, " ").trim();
  return /^[-—–=]+$/.test(text) ? "" : text;
}

function cellsFromRow(row, anchors, hasPlural) {
  if (anchors) {
    const keys = hasPlural ? ["front", "plural", "back"] : ["front", "back"];
    const centers = Object.fromEntries(keys.map(key => {
      const positions = anchors[key];
      return [key, positions.length ? positions.reduce((sum, position) => sum + position, 0) / positions.length : null];
    }));
    if (keys.every(key => centers[key] !== null)) {
      const cells = Object.fromEntries(keys.map(key => [key, []]));
      for (const word of row) {
        const centerX = (word.bbox.x0 + word.bbox.x1) / 2;
        const closest = keys.reduce((best, key) =>
          Math.abs(centerX - centers[key]) < Math.abs(centerX - centers[best]) ? key : best, keys[0]);
        cells[closest].push(word);
      }
      return keys.map(key => textForWords(cells[key]));
    }
  }

  const averageHeight = row.reduce((sum, word) => sum + word.height, 0) / row.length;
  const gapThreshold = Math.max(28, averageHeight * 2.3);
  const cells = [];
  let cell = [];
  for (const word of row) {
    const gap = cell.length ? word.bbox.x0 - cell[cell.length - 1].bbox.x1 : 0;
    if (cell.length && gap > gapThreshold) {
      cells.push(cell);
      cell = [];
    }
    cell.push(word);
  }
  if (cell.length) cells.push(cell);
  const values = cells.map(textForWords);
  if (values.length >= 3) return [values[0], values[1], values.slice(2).filter(Boolean).join(" ")];
  if (values.length === 2) return [values[0], "", values[1]];
  return [];
}

/**
 * Turns OCR words with bounding boxes into editable cards from aligned table rows.
 * The OCR engine runs locally; column and row detection is geometric, not generative.
 */
export function parseOcrTable(blocks) {
  const words = (blocks || []).flatMap(block =>
    (block.paragraphs || []).flatMap(paragraph =>
      (paragraph.lines || []).flatMap(line => line.words || [])
    )
  );
  const rows = groupWordsByRow(words);
  const header = findHeaderAnchors(rows);
  const dataRows = rows.slice(header ? header.index + 1 : 0);

  return dataRows.map(row => {
    const [front, plural, back] = cellsFromRow(row, header?.anchors, header?.hasPlural ?? true);
    return { front, plural, back, note: "" };
  }).filter(row => row.front && row.back);
}