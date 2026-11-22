const SHARE_CODE_ALPHABET = "23456789ABCDEFHKLMNPQRSTUVWXYZabcdefhkmnpqrstuvwxyz";
const SHARE_CODE_LENGTH = 9;
const SHARE_CODE_PATTERN = new RegExp(
  `^[${SHARE_CODE_ALPHABET}]{${SHARE_CODE_LENGTH}}$`
);
const SHARE_TOKEN_PATTERN = /^[gj][A-Za-z0-9_-]+$/;
const MAX_TOKEN_LENGTH = 1024 * 1024;
const MAX_BODY_BYTES = MAX_TOKEN_LENGTH + 1024;
const SHARE_KEY_PREFIX = "share:";
function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400"
  };
}
function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...corsHeaders(),
      ...headers
    }
  });
}
function corsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
function generateShareCode() {
  const bytes = new Uint8Array(SHARE_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const byte of bytes) {
    code += SHARE_CODE_ALPHABET[byte % SHARE_CODE_ALPHABET.length];
  }
  return code;
}
async function createShare(request, env) {
  if (!env.SHARE_KV) {
    return json({ error: "Dịch vụ lưu link chia sẻ chưa được cấu hình." }, 503);
  }
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ error: "Dữ liệu gửi lên phải là JSON." }, 415);
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: "Dữ liệu chia sẻ quá lớn." }, 413);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Không đọc được dữ liệu chia sẻ." }, 400);
  }
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token || token.length > MAX_TOKEN_LENGTH || !SHARE_TOKEN_PATTERN.test(token)) {
    return json({ error: "Dữ liệu chia sẻ không hợp lệ." }, 400);
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateShareCode();
    const key = `${SHARE_KEY_PREFIX}${code}`;
    const existing = await env.SHARE_KV.get(key);
    if (existing) continue;
    await env.SHARE_KV.put(key, token);
    return json({ code }, 201);
  }
  return json({ error: "Không thể tạo mã chia sẻ. Hãy thử lại." }, 503);
}
async function readShare(code, env) {
  if (!env.SHARE_KV) {
    return json({ error: "Dịch vụ lưu link chia sẻ chưa được cấu hình." }, 503);
  }
  if (!SHARE_CODE_PATTERN.test(code)) {
    return json({ error: "Mã chia sẻ không hợp lệ." }, 400);
  }
  const token = await env.SHARE_KV.get(`${SHARE_KEY_PREFIX}${code}`);
  if (!token) {
    return json(
      { error: "Link chia sẻ không tồn tại hoặc đã bị xoá." },
      404
    );
  }
  return json({ token }, 200, {
    "cache-control": "public, max-age=300"
  });
}
const index = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/shares" || url.pathname === "/api/shares/") {
      if (request.method === "OPTIONS") return corsPreflight();
      if (request.method === "POST") return createShare(request, env);
      return json({ error: "Phương thức không được hỗ trợ." }, 405, {
        allow: "POST, OPTIONS"
      });
    }
    const match = url.pathname.match(/^\/api\/shares\/([^/]+)$/);
    if (match) {
      if (request.method === "OPTIONS") return corsPreflight();
      if (request.method === "GET") return readShare(match[1], env);
      return json({ error: "Phương thức không được hỗ trợ." }, 405, {
        allow: "GET, OPTIONS"
      });
    }
    if (url.pathname.startsWith("/api/")) {
      return json({ error: "Không tìm thấy API." }, 404);
    }
    return env.ASSETS.fetch(request);
  }
};
const workerEntry = index ?? {};
export {
  workerEntry as default
};
//# sourceMappingURL=index.js.map
