import { useRef, useState } from "react";
import { Check, FileText, Loader2, Pencil, Plus, Upload } from "lucide-react";
import Modal from "../Modal";
import { parseTopicsFromFile } from "../../lib/speakingFileImport";
import { topicKey } from "../../lib/speakingData";

export default function SpeakingAddModal({ boards, onAddTopics, onClose }) {
  const [mode, setMode] = useState("custom");
  const [customQuestion, setCustomQuestion] = useState("");
  const [customHints, setCustomHints] = useState("");
  const [fileTopics, setFileTopics] = useState([]);
  const [selectedFileIndexes, setSelectedFileIndexes] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [editing, setEditing] = useState({});
  const fileInputRef = useRef(null);

  const addedKeys = new Set(boards.map(topicKey));

  function addCustom() {
    const question = customQuestion.trim();
    if (!question) return;
    const hints = customHints
      .split("\n")
      .map((line) => line.trim().replace(/^[-–]\s*/, ""))
      .filter(Boolean)
      .slice(0, 8);
    onAddTopics([{ topicId: "custom", question, hints, custom: true }]);
    onClose();
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    setFileError("");
    try {
      const parsed = await parseTopicsFromFile(file);
      const fresh = parsed.filter((topic) => !addedKeys.has(topicKey(topic)));
      setFileTopics(fresh);
      setSelectedFileIndexes(fresh.map((_, index) => index));
      setEditing({});
      if (!fresh.length) {
        setFileError(
          `Không tìm thấy đề tài mới trong "${file.name}". Hãy thử tệp khác hoặc nhập tay.`
        );
      }
    } catch (error) {
      setFileTopics([]);
      setSelectedFileIndexes([]);
      setFileError(error?.message || "Không đọc được tệp. Hãy thử lại.");
    } finally {
      setFileLoading(false);
      event.target.value = "";
    }
  }

  function topicValue(topic, index, field) {
    return editing[index]?.[field] ?? (field === "hints" ? topic.hints.join("\n") : topic.question);
  }

  function updateTopicValue(index, field, value) {
    setEditing((current) => ({
      ...current,
      [index]: { ...current[index], [field]: value },
    }));
  }

  function toggleFileIndex(index) {
    setSelectedFileIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  function addFromFile() {
    if (!selectedFileIndexes.length) return;
    const chosen = selectedFileIndexes
      .map((index) => {
        const topic = fileTopics[index];
        const question = topicValue(topic, index, "question").trim();
        const hints = topicValue(topic, index, "hints")
          .split("\n")
          .map((line) => line.trim().replace(/^[-–]\s*/, ""))
          .filter(Boolean)
          .slice(0, 8);
        return { ...topic, question, hints };
      })
      .filter((topic) => topic.question);
    if (!chosen.length) return;
    onAddTopics(chosen);
    onClose();
  }

  return (
    <Modal title="Thêm đề tài luyện nói" onClose={onClose}>
      <p className="modal-hint">
        49 chủ đề Goethe A2 đã có sẵn trong danh sách Luyện nói. Dùng hình này để thêm đề tài của
        riêng bạn hoặc nhập từ tệp PDF/Word.
      </p>

      <div className="speaking-modal-tabs">
        <button
          type="button"
          className={mode === "custom" ? "active" : ""}
          onClick={() => setMode("custom")}
        >
          Tự nhập đề tài
        </button>
        <button
          type="button"
          className={mode === "file" ? "active" : ""}
          onClick={() => setMode("file")}
        >
          Từ PDF / Word
        </button>
      </div>

      {mode === "custom" && (
        <div className="speaking-modal-body speaking-custom-form">
          <label>
            Câu hỏi chính (tiếng Đức)
            <input
              value={customQuestion}
              onChange={(event) => setCustomQuestion(event.target.value)}
              placeholder="Was machen Sie gern am Sonntag?"
            />
          </label>
          <label>
            Gợi ý (mỗi dòng một ý)
            <textarea
              value={customHints}
              onChange={(event) => setCustomHints(event.target.value)}
              placeholder={"Freunde treffen?\nHobbys?\nLange schlafen?"}
              rows={4}
            />
          </label>
          <div className="speaking-modal-actions">
            <span>Tối đa 8 gợi ý</span>
            <button
              type="button"
              className="btn-primary"
              disabled={!customQuestion.trim()}
              onClick={addCustom}
            >
              <Plus size={15} /> Thêm đề tài
            </button>
          </div>
        </div>
      )}

      {mode === "file" && (
        <div className="speaking-modal-body">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <button
            type="button"
            className="speaking-file-pick"
            onClick={() => fileInputRef.current?.click()}
            disabled={fileLoading}
          >
            {fileLoading ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
            {fileLoading ? "Đang đọc tệp..." : "Chọn tệp PDF hoặc Word"}
          </button>
          <p className="modal-hint">
            Hỗ trợ <strong>.pdf</strong>, <strong>.docx</strong> và <strong>.txt</strong>. Tệp được
            đọc ngay trên thiết bị, không gửi lên máy chủ. Có thể bỏ chọn hoặc sửa từng đề tài
            trước khi thêm.
          </p>
          {fileError && <p className="form-error">{fileError}</p>}

          {fileTopics.length > 0 && (
            <>
              <div className="speaking-file-summary">
                <span>
                  <FileText size={14} /> Tìm thấy {fileTopics.length} đề tài
                </span>
                <span className="speaking-file-actions">
                  <button
                    type="button"
                    onClick={() => setSelectedFileIndexes(fileTopics.map((_, index) => index))}
                  >
                    Chọn tất cả
                  </button>
                  <button type="button" onClick={() => setSelectedFileIndexes([])}>
                    Bỏ chọn
                  </button>
                </span>
              </div>
              <div className="speaking-topic-list">
                {fileTopics.map((topic, index) => {
                  const isSelected = selectedFileIndexes.includes(index);
                  const isEditing = Boolean(editing[index]);
                  return (
                    <div key={`${topicKey(topic)}-${index}`}>
                      <div
                        role="button"
                        tabIndex={0}
                        className={`speaking-topic-item ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleFileIndex(index)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleFileIndex(index);
                          }
                        }}
                      >
                        <span className="speaking-topic-check">
                          {isSelected ? <Check size={13} /> : null}
                        </span>
                        <span className="speaking-topic-text">
                          <strong>{topicValue(topic, index, "question")}</strong>
                          <small>
                            {topicValue(topic, index, "hints")
                              .split("\n")
                              .filter(Boolean)
                              .map((line) => line.trim().replace(/^[-–]\s*/, ""))
                              .join(" · ")}
                          </small>
                        </span>
                        <button
                          type="button"
                          className="speaking-topic-edit"
                          title="Sửa đề tài"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditing((current) => ({
                              ...current,
                              [index]: current[index] ? undefined : {},
                            }));
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                      {isEditing && (
                        <div
                          className="speaking-file-editor"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            value={topicValue(topic, index, "question")}
                            onChange={(event) =>
                              updateTopicValue(index, "question", event.target.value)
                            }
                            placeholder="Câu hỏi tiếng Đức"
                          />
                          <textarea
                            rows={3}
                            value={topicValue(topic, index, "hints")}
                            onChange={(event) => updateTopicValue(index, "hints", event.target.value)}
                            placeholder="Mỗi dòng một gợi ý"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="speaking-modal-actions">
                <span>{selectedFileIndexes.length} đề tài đã chọn</span>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!selectedFileIndexes.length}
                  onClick={addFromFile}
                >
                  <Plus size={15} /> Thêm vào luyện nói
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
