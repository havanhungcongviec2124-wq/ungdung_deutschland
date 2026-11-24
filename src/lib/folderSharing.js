const MAX_SHARE_SIZE = 5 * 1024 * 1024;
const MAX_SHARE_TOKEN_LENGTH = 1024 * 1024;
const MAX_CARDS = 10000;
const MAX_SHARED_TOPICS = 200;
const SHARE_WEB_ORIGIN = "https://ungdung-deutschland.havanhungcongviec2124.workers.dev";
const SHARE_CODE_PATTERN =
  /^[23456789ABCDEFHKLMNPQRSTUVWXYZabcdefhkmnpqrstuvwxyz]{9}$/;

function bytesToBase64Url(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function transformBytes(bytes, StreamType, sizeLimit) {
  const stream = new Blob([bytes]).stream().pipeThrough(new StreamType("gzip"));
  const reader = stream.getReader();
  const chunks = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > sizeLimit) {
      await reader.cancel();
      throw new Error("Dữ liệu chia sẻ vượt quá giới hạn cho phép.");
    }
    chunks.push(value);
  }

  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

export function getApiOrigin() {
  return window.location.protocol === "app:"
    ? SHARE_WEB_ORIGIN
    : window.location.origin;
}

function buildShareLink(hash) {
  const base =
    window.location.protocol === "app:"
      ? `${SHARE_WEB_ORIGIN}/`
      : window.location.href;
  const url = new URL(base);
  url.hash = hash;
  return url.href;
}

async function createShortShareUrl(token, hashKey = "s") {
  const response = await fetch(`${getApiOrigin()}/api/shares`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    throw new Error(`Máy chủ trả về lỗi ${response.status}.`);
  }

  const body = await response.json();
  if (typeof body?.code !== "string" || !SHARE_CODE_PATTERN.test(body.code)) {
    throw new Error("Mã chia sẻ trả về không hợp lệ.");
  }
  return buildShareLink(`${hashKey}=${body.code}`);
}

async function readShortShareToken(code) {
  const value = String(code || "").trim();
  if (!SHARE_CODE_PATTERN.test(value)) {
    throw new Error("Mã chia sẻ không hợp lệ.");
  }

  let response;
  try {
    response = await fetch(
      `${getApiOrigin()}/api/shares/${encodeURIComponent(value)}`
    );
  } catch {
    throw new Error("Không thể mở link chia sẻ. Hãy kiểm tra kết nối mạng.");
  }
  if (response.status === 404) {
    throw new Error("Link chia sẻ không tồn tại hoặc đã bị xoá.");
  }
  if (!response.ok) {
    throw new Error("Không thể mở link chia sẻ. Hãy kiểm tra kết nối mạng.");
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("Link chia sẻ không hợp lệ.");
  }
  if (typeof body?.token !== "string") {
    throw new Error("Link chia sẻ không hợp lệ.");
  }
  return body.token;
}

async function encodeSharePayload(payload) {
  const jsonBytes = new TextEncoder().encode(JSON.stringify(payload));
  if (jsonBytes.length > MAX_SHARE_SIZE) {
    throw new Error("Dữ liệu chia sẻ quá lớn để tạo link.");
  }

  let prefix = "j";
  let payloadBytes = jsonBytes;
  if (typeof CompressionStream !== "undefined") {
    const compressedBytes = await transformBytes(
      jsonBytes,
      CompressionStream,
      MAX_SHARE_SIZE
    );
    if (compressedBytes.length < jsonBytes.length) {
      prefix = "g";
      payloadBytes = compressedBytes;
    }
  }

  const token = `${prefix}${bytesToBase64Url(payloadBytes)}`;
  if (token.length > MAX_SHARE_TOKEN_LENGTH) {
    throw new Error("Link chia sẻ quá dài. Hãy chia nhỏ dữ liệu trước khi gửi.");
  }
  return token;
}

async function decodeSharePayload(token) {
  if (!token || token.length > MAX_SHARE_TOKEN_LENGTH) {
    throw new Error("Link chia sẻ không hợp lệ hoặc quá dài.");
  }
  const format = token[0];
  if (format !== "g" && format !== "j") {
    throw new Error("Phiên bản link chia sẻ không được hỗ trợ.");
  }

  let bytes = base64UrlToBytes(token.slice(1));
  if (format === "g") {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("Trình duyệt này không hỗ trợ giải nén link chia sẻ.");
    }
    bytes = await transformBytes(bytes, DecompressionStream, MAX_SHARE_SIZE);
  }
  if (bytes.length > MAX_SHARE_SIZE) {
    throw new Error("Dữ liệu link chia sẻ vượt quá giới hạn cho phép.");
  }

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new Error("Không thể đọc dữ liệu từ link chia sẻ.");
  }
}

function normalizeFolderShare(payload) {
  if (
    payload?.version !== 1 ||
    typeof payload.folder?.name !== "string" ||
    !payload.folder.name.trim() ||
    payload.folder.name.length > 200 ||
    !Array.isArray(payload.cards) ||
    payload.cards.length === 0 ||
    payload.cards.length > MAX_CARDS
  ) {
    throw new Error("Link chia sẻ không chứa thư mục từ vựng hợp lệ.");
  }

  const cards = payload.cards.map((card) => {
    if (
      !card ||
      typeof card.front !== "string" ||
      typeof card.back !== "string" ||
      !card.front.trim() ||
      !card.back.trim() ||
      card.front.length > 10000 ||
      card.back.length > 10000 ||
      (card.plural != null && typeof card.plural !== "string") ||
      (card.note != null && typeof card.note !== "string") ||
      (card.plural?.length || 0) > 10000 ||
      (card.note?.length || 0) > 10000
    ) {
      throw new Error("Link chia sẻ có thẻ từ không hợp lệ.");
    }
    return {
      front: card.front.trim(),
      plural: card.plural?.trim() || "",
      back: card.back.trim(),
      note: card.note?.trim() || "",
    };
  });

  return {
    type: "folder",
    folder: {
      name: payload.folder.name.trim(),
      color: /^#[0-9a-f]{6}$/i.test(payload.folder.color) ? payload.folder.color : "#6d5dfc",
    },
    cards,
  };
}

function copySpeakingSchedule(value) {
  if (!value || typeof value !== "object") return undefined;
  const columns = Array.isArray(value.columns)
    ? value.columns.slice(0, 3).map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const rows = Array.isArray(value.rows)
    ? value.rows
        .slice(0, 10)
        .map((row) => (Array.isArray(row) ? row.slice(0, 3).map((cell) => String(cell || "").trim()) : []))
        .filter((row) => row.some(Boolean))
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
  if (columns.length && rows.length) return { caption, columns, rows };
  return undefined;
}

function normalizeSpeakingShare(payload) {
  if (
    payload?.version !== 2 ||
    payload?.type !== "speaking" ||
    !Array.isArray(payload.topics) ||
    payload.topics.length === 0 ||
    payload.topics.length > MAX_SHARED_TOPICS
  ) {
    throw new Error("Link chia sẻ không chứa đề tài luyện nói hợp lệ.");
  }

  const topics = payload.topics.map((topic) => {
    const question = String(topic?.question || "").trim();
    if (!question || question.length > 600) {
      throw new Error("Link chia sẻ có đề tài không hợp lệ.");
    }
    const hints = Array.isArray(topic.hints)
      ? topic.hints
          .map((hint) => String(hint || "").trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];
    return {
      topicId: "shared",
      question,
      hints,
      custom: true,
      aiGenerated: Boolean(topic?.aiGenerated),
      ...(copySpeakingSchedule(topic?.schedule)
        ? { schedule: copySpeakingSchedule(topic.schedule) }
        : {}),
    };
  });

  return { type: "speaking", topics };
}

// ---------- Thư mục từ vựng (link cũ, giữ nguyên định dạng) ----------
export async function createFolderShareUrl(folder, cards) {
  if (!folder?.name || !Array.isArray(cards) || !cards.length) {
    throw new Error("Thư mục cần có ít nhất một thẻ từ để chia sẻ.");
  }
  if (cards.length > MAX_CARDS) {
    throw new Error(`Chỉ có thể chia sẻ tối đa ${MAX_CARDS} thẻ trong một lần.`);
  }

  const payload = {
    version: 1,
    folder: { name: folder.name, color: folder.color },
    cards: cards.map(({ front, plural, back, note }) => ({ front, plural, back, note })),
  };
  const token = await encodeSharePayload(payload);

  try {
    return await createShortShareUrl(token);
  } catch (error) {
    console.warn("Không thể tạo link chia sẻ ngắn, dùng link dài dự phòng:", error);
  }
  return buildShareLink(`share=${token}`);
}

export async function readFolderShareToken(token) {
  return normalizeFolderShare(await decodeSharePayload(token));
}

export async function readFolderShareCode(code) {
  return readFolderShareToken(await readShortShareToken(code));
}

export async function readFolderShareLink(value) {
  const input = String(value || "").trim();
  if (!input) throw new Error("Hãy dán link chia sẻ thư mục.");

  if (SHARE_CODE_PATTERN.test(input)) return readFolderShareCode(input);
  if (/^[gj][A-Za-z0-9_-]+$/.test(input)) return readFolderShareToken(input);

  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Link không hợp lệ. Hãy dán link chia sẻ WortKarte.");
  }

  const params = new URLSearchParams(url.hash.slice(1));
  const code = params.get("s");
  if (code) return readFolderShareCode(code);

  const token = params.get("share") || "";
  if (!token) {
    throw new Error("Link không chứa dữ liệu thư mục được chia sẻ.");
  }
  return readFolderShareToken(token);
}

// ----------Đề tài luyện nói----------
export async function createSpeakingShareUrl(topics) {
  if (!Array.isArray(topics) || !topics.length) {
    throw new Error("Chọn ít nhất một đề tài để chia sẻ.");
  }
  if (topics.length > MAX_SHARED_TOPICS) {
    throw new Error(`Chỉ có thể chia sẻ tối đa ${MAX_SHARED_TOPICS} đề tài.`);
  }

  const payload = {
    version: 2,
    type: "speaking",
    topics: topics.map((topic) => ({
      question: String(topic?.question || "").trim(),
      hints: Array.isArray(topic?.hints) ? topic.hints.slice(0, 8) : [],
      aiGenerated: Boolean(topic?.aiGenerated),
      ...(copySpeakingSchedule(topic?.schedule)
        ? { schedule: copySpeakingSchedule(topic.schedule) }
        : {}),
    })),
  };
  const token = await encodeSharePayload(payload);

  try {
    return await createShortShareUrl(token, "sp");
  } catch (error) {
    console.warn("Không thể tạo link nói ngắn, dùng link dài dự phòng:", error);
  }
  return buildShareLink(`speaking=${token}`);
}

export async function readSpeakingShareToken(token) {
  return normalizeSpeakingShare(await decodeSharePayload(token));
}

export async function readSpeakingShareCode(code) {
  return readSpeakingShareToken(await readShortShareToken(code));
}

// Dùng cho cả ô "Thêm bằng link chia sẻ" và khi mở link từ thanh địa chỉ.
export async function readShareLink(value) {
  const input = String(value || "").trim();
  if (!input) throw new Error("Hãy dán link chia sẻ WortKarte.");

  if (SHARE_CODE_PATTERN.test(input) || /^[gj][A-Za-z0-9_-]+$/.test(input)) {
    const payload = SHARE_CODE_PATTERN.test(input)
      ? await decodeSharePayload(await readShortShareToken(input))
      : await decodeSharePayload(input);
    return payload?.type === "speaking"
      ? normalizeSpeakingShare(payload)
      : normalizeFolderShare(payload);
  }

  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Link không hợp lệ. Hãy dán link chia sẻ WortKarte.");
  }

  const params = new URLSearchParams(url.hash.slice(1));
  const speakingCode = params.get("sp");
  if (speakingCode) return readSpeakingShareCode(speakingCode);
  const speakingToken = params.get("speaking");
  if (speakingToken) return readSpeakingShareToken(speakingToken);

  return readFolderShareLink(input);
}

export function readShareHashParams() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return {
    shortCode: params.get("s"),
    longToken: params.get("share"),
    speakingCode: params.get("sp"),
    speakingToken: params.get("speaking"),
  };
}
