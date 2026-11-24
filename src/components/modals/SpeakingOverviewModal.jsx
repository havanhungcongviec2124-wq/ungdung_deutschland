import { useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Loader2, Pencil, RotateCcw, Share2, Trash2, X } from "lucide-react";
import Modal from "../Modal";
import ConfirmModal from "./ConfirmModal";
import { createSpeakingShareUrl } from "../../lib/folderSharing";
import { buildScheduleFromLines } from "../../lib/scheduleInput";

export default function SpeakingOverviewModal({
  boards,
  onSaveTopic,
  onResetTopic,
  onRemoveTopic,
  hiddenCount = 0,
  onRestoreHidden,
  onClose,
  inline = false,
  headerActions = null,
  scheduleMode = false,
}) {
  const allTopics = useMemo(() => {
    const seen = new Set();
    return boards.filter((topic) => {
      if (!topic?.id || seen.has(topic.id)) return false;
      seen.add(topic.id);
      return true;
    });
  }, [boards]);

  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set(allTopics.map((topic) => topic.id)));
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState({ question: "", hints: "", caption: "" });
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const visibleTopics = useMemo(() => {
    const needle = String(query || "").trim().toLocaleLowerCase("de");
    if (!needle) return allTopics;
    return allTopics.filter((topic) =>
      [topic.question, topic.label, ...(topic.hints || [])]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("de")
        .includes(needle)
    );
  }, [allTopics, query]);

  function toggleTopic(id) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(allTopics.map((topic) => topic.id)));
  }

  function clearAll() {
    setSelectedIds(new Set());
  }

  function handleDeleteSelected() {
    const ids = allTopics.filter((topic) => selectedIds.has(topic.id)).map((topic) => topic.id);
    ids.forEach((id) => onRemoveTopic?.(id));
    setSelectedIds(new Set());
    setShareUrl("");
    setError("");
    setConfirmDelete(false);
  }

  function startEdit(topic) {
    setEditingId(topic.id);
    setDraft({
      question: topic.question,
      hints: (topic.hints || []).join("\n"),
      caption: topic.schedule?.caption || "",
    });
    setError("");
  }

  function saveEdit(topic) {
    if (!draft.question.trim()) {
      setError("Hãy nhập câu hỏi tiếng Đức.");
      return;
    }
    if (scheduleMode) {
      const schedule = buildScheduleFromLines(draft.hints, draft.caption);
      if (!schedule) {
        setError("Hãy nhập lịch dạng 08.00 – 09.00: joggen (mỗi hoạt động một dòng).");
        return;
      }
      onSaveTopic?.(topic, { question: draft.question, hints: draft.hints, schedule });
    } else {
      onSaveTopic?.(topic, { question: draft.question, hints: draft.hints });
    }
    setEditingId("");
    setError("");
  }

  function resetEdit(topic) {
    onResetTopic?.(topic);
    setEditingId("");
    setError("");
  }

  async function handleCreateLink() {
    const chosen = allTopics.filter((topic) => selectedIds.has(topic.id));
    if (!chosen.length) {
      setError("Chọn ít nhất một đề tài để chia sẻ.");
      return;
    }
    setSharing(true);
    setError("");
    setCopied(false);
    try {
      setShareUrl(await createSpeakingShareUrl(chosen));
    } catch (err) {
      setError(err?.message || "Không thể tạo link chia sẻ. Hãy thử lại.");
    } finally {
      setSharing(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setError("Không thể tự sao chép. Hãy chọn và sao chép link trong ô bên trên.");
    }
  }

  async function sendLink() {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: "Đề tài luyện nói Goethe A2", url: shareUrl });
    } catch (err) {
      if (err.name !== "AbortError") console.error("Không thể chia sẻ link:", err);
    }
  }

  const content = (
    <div className="speaking-modal-body">
        <p className="modal-hint">
          Tất cả {allTopics.length} đề tài từ 49 chủ đề Goethe A2 và các đề tài bạn đã thêm được gộp
          tại đây (đã bỏ trùng). Bấm biểu tượng bút chì để sửa đề, sau đó chọn đề và tạo link chia
          sẻ.
        </p>

        <input
          className="speaking-search"
          type="search"
          value={query}
          placeholder="Tìm chủ đề, ví dụ: Sonntag, Urlaub..."
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="speaking-file-summary">
          <span>
            Đã chọn {selectedIds.size} / {allTopics.length} đề tài
          </span>
          <span className="speaking-file-actions">
            <button type="button" onClick={selectAll}>
              Chọn tất cả
            </button>
            <button type="button" onClick={clearAll}>
              Bỏ chọn
            </button>
          </span>
        </div>

        <div className="speaking-topic-list speaking-overview-list">
          {visibleTopics.map((topic) => {
            const isSelected = selectedIds.has(topic.id);
            const isEditing = editingId === topic.id;
            return (
              <div key={topic.id}>
                <div
                  role="button"
                  tabIndex={0}
                  className={`speaking-topic-item ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleTopic(topic.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleTopic(topic.id);
                    }
                  }}
                >
                  <span className="speaking-topic-check">
                    {isSelected ? <Check size={13} /> : null}
                  </span>
                  <span className="speaking-topic-text">
                    <strong>{topic.question}</strong>
                    <small>
                      {topic.aiGenerated ? "(đề do AI tạo) · " : ""}
                      {topic.edited ? "Đã sửa · " : ""}
                      {(topic.hints || []).join(" · ")}
                    </small>
                  </span>
                  <button
                    type="button"
                    className="speaking-topic-edit"
                    title="Sửa đề tài"
                    aria-label="Sửa đề tài"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (isEditing) setEditingId("");
                      else startEdit(topic);
                    }}
                  >
                    {isEditing ? <X size={13} /> : <Pencil size={13} />}
                  </button>
                </div>
                {isEditing && (
                  <div className="speaking-file-editor speaking-overview-editor">
                    <input
                      value={draft.question}
                      onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))}
                      placeholder="Câu hỏi tiếng Đức"
                    />
                    {scheduleMode && (
                      <input
                        value={draft.caption}
                        onChange={(event) => setDraft((current) => ({ ...current, caption: event.target.value }))}
                        placeholder="Tên lịch / ngày"
                      />
                    )}
                    <textarea
                      rows={scheduleMode ? 5 : 3}
                      value={draft.hints}
                      onChange={(event) => setDraft((current) => ({ ...current, hints: event.target.value }))}
                      placeholder={scheduleMode ? "08.00 – 09.00: joggen" : "Mỗi dòng một gợi ý"}
                    />
                    <div className="speaking-editor-actions">
                      {topic.library && topic.edited && (
                        <button type="button" className="btn-ghost" onClick={() => resetEdit(topic)}>
                          <RotateCcw size={13} /> Khôi phục đề gốc
                        </button>
                      )}
                      <button type="button" className="btn-primary" onClick={() => saveEdit(topic)}>
                        <Check size={14} /> Lưu đề tài
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!visibleTopics.length && (
            <p className="empty-small">Không tìm thấy đề tài phù hợp.</p>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="speaking-modal-actions">
          <span>Người nhận link có thể thêm đề tài vào ứng dụng của họ.</span>
          <div className="speaking-bulk-actions">
            {hiddenCount > 0 && onRestoreHidden && (
              <button type="button" className="btn-ghost" onClick={onRestoreHidden}>
                <RotateCcw size={14} /> Khôi phục {hiddenCount} đề đã xóa
              </button>
            )}
            <button
              type="button"
              className="btn-danger gap-2 flex"
              disabled={!selectedIds.size}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} /> Xóa đã chọn
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={sharing || !selectedIds.size}
              onClick={handleCreateLink}
            >
              {sharing ? <Loader2 size={15} className="spin" /> : <Share2 size={15} />}
              {sharing ? "Đang tạo link..." : "Tạo link chia sẻ"}
            </button>
          </div>
        </div>

        {shareUrl && (
          <div className="share-folder-content speaking-share-result">
            <p>
              Link chứa bản sao của {allTopics.filter((topic) => selectedIds.has(topic.id)).length} đề
              tài. Ai có link đều mở được trong mục <strong> Thêm bằng link chia sẻ</strong>.
            </p>
            <textarea
              className="share-link-input"
              aria-label="Link chia sẻ đề tài luyện nói"
              readOnly
              value={shareUrl}
              onFocus={(event) => event.target.select()}
              rows="4"
            />
            <div className="heading-actions">
              <button type="button" className="btn-secondary" onClick={copyLink}>
                <Copy size={16} /> {copied ? "Đã sao chép" : "Sao chép link"}
              </button>
              {typeof navigator.share === "function" && (
                <button type="button" className="btn-primary" onClick={sendLink}>
                  <Share2 size={16} /> Chia sẻ...
                </button>
              )}
            </div>
            <p className="small">Các thay đổi sau này không tự cập nhật vào link đã tạo.</p>
          </div>
        )}

        {confirmDelete && (
          <ConfirmModal
            title="Xóa các đề tài đã chọn"
            message={`Bạn có muốn xóa ${selectedIds.size} đề tài đã chọn không? Đề thư viện có thể khôi phục lại từ bảng này.`}
            confirmLabel="Xóa đã chọn"
            onConfirm={handleDeleteSelected}
            onClose={() => setConfirmDelete(false)}
          />
        )}
    </div>
  );

  if (inline) {
    return (
      <section className="speaking-page speaking-overview-panel">
        <div className="speaking-head">
          <button type="button" className="btn-ghost" onClick={onClose}>
            <ArrowLeft size={16} /> Danh sách đề tài
          </button>
          <h1>Tổng hợp các đề</h1>
          {headerActions}
        </div>
        {content}
      </section>
    );
  }

  return (
    <Modal title="Tổng hợp đề tài luyện nói" onClose={onClose}>
      {content}
    </Modal>
  );
}
