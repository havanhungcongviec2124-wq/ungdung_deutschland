// Đọc đề tài từ PDF / Word ngay trên trình duyệt, không gửi tệp lên máy chủ.

const BOILERPLATE = /^(GOETHE|ZERTIFIKAT|SPRECHEN|von sich erzählen|Thema\s+\d+|Seite\s+\d+|\d+\s*\/\s*\d+)/i;
const QUESTION_START =
  /^(was|wer|wie|wo|wann|warum|welche[rsn]?|wieviel|wie viele|was für)\b/i;

function cleanLine(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripBullet(value) {
  return cleanLine(value).replace(/^(?:[-–—•*]|\d+[.)])\s*/, "").trim();
}

function isNewTopicStart(line) {
  return QUESTION_START.test(line) && line.length > 12;
}

function hintsFromLines(lines) {
  const joined = lines.map(stripBullet).filter(Boolean).join(" ");
  return joined
    .split(/(?<=\?)\s+/)
    .map(cleanLine)
    .filter(Boolean)
    .slice(0, 8);
}

function topicFromChunk(chunk) {
  const lines = chunk.filter((line) => line && !BOILERPLATE.test(line));
  let questionEnd = -1;
  for (let index = 0; index < Math.min(lines.length, 6); index += 1) {
    if (/\?\s*$/.test(lines[index])) {
      questionEnd = index;
      break;
    }
  }
  // Một số trang chỉ có tiêu đề + từ khóa (VD "Gesundheit"), không có dấu "?".
  const hasQuestion = questionEnd >= 0;
  if (!hasQuestion && !lines.length) return null;
  return {
    topicId: "file",
    question: lines
      .slice(0, hasQuestion ? questionEnd + 1 : 1)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300),
    hints: hintsFromLines(lines.slice(hasQuestion ? questionEnd + 1 : 1)),
    custom: true,
  };
}

export function parseTopicsFromText(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);

  const markers = lines
    .map((line, index) => (/^Thema\s+\d+$/i.test(line) ? index : -1))
    .filter((index) => index >= 0);

  let topics = [];
  if (markers.length >= 2) {
    // File Goethe có mốc "Thema N" ở cuối mỗi trang: dùng làm ranh giới chính xác.
    const boundaries = [0, ...markers, lines.length];
    for (let position = 0; position < boundaries.length - 1; position += 1) {
      const topic = topicFromChunk(lines.slice(boundaries[position], boundaries[position + 1]));
      if (topic) topics.push(topic);
    }
  } else {
    // Tệp thường: ghép dòng gãy tới dấu "?", dòng sau là các gợi ý.
    const body = lines.filter((line) => !BOILERPLATE.test(line));
    let index = 0;
    while (index < body.length) {
      let questionEnd = -1;
      for (let next = index; next < Math.min(index + 6, body.length); next += 1) {
        if (/\?\s*$/.test(body[next])) {
          questionEnd = next;
          break;
        }
        if (next > index && isNewTopicStart(body[next])) break;
      }
      if (questionEnd < 0) {
        index += 1;
        continue;
      }
      const topic = topicFromChunk(body.slice(index));
      if (topic && topic.question) {
        topics.push(topic);
        index += questionEnd + 1;
      } else {
        index += 1;
      }
    }
  }

  const seen = new Set();
  return topics.filter((topic) => {
    const key = topic.question.toLocaleLowerCase("de");
    if (!topic.question || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function linesFromPdfTextContent(items) {
  const rows = [];
  for (const item of items || []) {
    const text = String(item?.str || "");
    if (!text.trim()) continue;
    const y = Math.round(item.transform?.[5] ?? 0);
    const x = item.transform?.[4] ?? 0;
    let row = rows.find((candidate) => Math.abs(candidate.y - y) <= 3);
    if (!row) {
      row = { y, parts: [] };
      rows.push(row);
    }
    row.parts.push({ x, text });
  }
  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) =>
      row.parts
        .sort((a, b) => a.x - b.x)
        .map((part) => part.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

async function readPdf(file) {
  const [pdfjs, workerModule] = await Promise.all([
    import("pdfjs-dist/build/pdf.mjs"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?raw"),
  ]);
  const workerUrl = URL.createObjectURL(
    new Blob([workerModule.default], { type: "text/javascript" })
  );
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    const pdf = await task.promise;
    const lines = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      lines.push(...linesFromPdfTextContent(content.items));
    }
    await task.destroy();
    return lines.join("\n");
  } finally {
    URL.revokeObjectURL(workerUrl);
  }
}

async function readDocx(file) {
  const mammoth = await import("mammoth/mammoth.browser");
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value || "";
}

export async function parseTopicsFromFile(file) {
  const name = String(file?.name || "").toLocaleLowerCase();
  if (name.endsWith(".pdf") || file?.type === "application/pdf") {
    return parseTopicsFromText(await readPdf(file));
  }
  if (name.endsWith(".docx") || String(file?.type || "").includes("wordprocessingml")) {
    return parseTopicsFromText(await readDocx(file));
  }
  if (name.endsWith(".txt") || file?.type === "text/plain") {
    return parseTopicsFromText(await file.text());
  }
  throw new Error("Chỉ hỗ trợ tệp PDF, Word (.docx) hoặc văn bản (.txt).");
}
