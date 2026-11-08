const MAX_SHARE_SIZE = 5 * 1024 * 1024;
const MAX_SHARE_TOKEN_LENGTH = 1024 * 1024;
const MAX_CARDS = 10000;
const SHARE_WEB_ORIGIN = "https://ungdung-deutschland.havanhungcongviec2124.workers.dev";

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
  const jsonBytes = new TextEncoder().encode(JSON.stringify(payload));
  if (jsonBytes.length > MAX_SHARE_SIZE) {
    throw new Error("Dữ liệu thư mục quá lớn để tạo link chia sẻ.");
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
    throw new Error("Link chia sẻ quá dài. Hãy chia thư mục thành các bộ nhỏ hơn.");
  }

  const shareUrl =
    window.location.protocol === "app:"
      ? `${SHARE_WEB_ORIGIN}/`
      : window.location.href;
  const url = new URL(shareUrl);
  url.hash = `share=${token}`;
  return url.href;
}

export async function readFolderShareToken(token) {
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
    bytes = await transformBytes(
      bytes,
      DecompressionStream,
      MAX_SHARE_SIZE
    );
  }
  if (bytes.length > MAX_SHARE_SIZE) {
    throw new Error("Dữ liệu link chia sẻ vượt quá giới hạn cho phép.");
  }

  let payload;
  try {
    payload = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new Error("Không thể đọc dữ liệu từ link chia sẻ.");
  }
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
    folder: {
      name: payload.folder.name.trim(),
      color: /^#[0-9a-f]{6}$/i.test(payload.folder.color) ? payload.folder.color : "#6d5dfc",
    },
    cards,
  };
}

export async function readFolderShareLink(value) {
  const input = String(value || "").trim();
  if (!input) {
    throw new Error("Hãy dán link chia sẻ thư mục.");
  }

  let token = input;
  if (!/^[gj][A-Za-z0-9_-]+$/.test(input)) {
    let url;
    try {
      url = new URL(input);
    } catch {
      throw new Error("Link không hợp lệ. Hãy dán link chia sẻ WortKarte.");
    }
    token = new URLSearchParams(url.hash.slice(1)).get("share") || "";
  }

  if (!token) {
    throw new Error("Link không chứa dữ liệu thư mục được chia sẻ.");
  }
  return readFolderShareToken(token);
}
