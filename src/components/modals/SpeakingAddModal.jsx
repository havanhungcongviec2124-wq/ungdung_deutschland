import { useRef, useState } from "react";
import { CalendarClock, Check, FileText, Loader2, Pencil, Plus, Upload } from "lucide-react";
import Modal from "../Modal";
import { parseTopicsFromFile } from "../../lib/speakingFileImport";
import { topicKey } from "../../lib/speakingData";
import { buildScheduleFromLines } from "../../lib/scheduleInput";

const SHEET_HINTS = [
  "Jeder Kandidat bekommt eine eigene Aufgabe.",
  "Ihr sprecht auf Deutsch und findet einen gemeinsamen Termin.",
  "Am Ende sagt eine Person den Prüfern die Vereinbarung.",
];

export default function SpeakingAddModal({
  boards,
  onAddTopics,
  onClose,
  intro,
  scheduleMode = false,
}) {
  const [mode, setMode] = useState("custom");
  const [customQuestion, setCustomQuestion] = useState("");
  const [customSheets, setCustomSheets] = useState({
    A: { caption: "Freitag, 01.11. · Aufgabenblatt A", hints: "" },
    B: { caption: "Freitag, 01.11. · Aufgabenblatt B", hints: "" },
  });
  const [customError, setCustomError] = useState("");
  const [fileTopics, setFileTopics] = useState([]);
  const [selectedFileIndexes, setSelectedFileIndexes] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [editing, setEditing] = useState({});
  const fileInputRef = useRef(null);

  const addedKeys = new Set(boards.map(topicKey));
  const parseHints = (value) =>
    String(value || "")
      .split("\n")
      .map((line) => line.trim().replace(/^[-–]\s*/, ""))
      .filter(Boolean)
      .slice(0, 8);

  function buildSheet(lines, caption, fallbackCaption) {
    const hints = parseHints(lines);
    const schedule = buildScheduleFromLines(hints.join("\n"), caption || fallbackCaption);
    return schedule ? { hints, schedule, caption: schedule.caption } : null;
  }

  function updateCustomSheet(side, field, value) {
    setCustomSheets((current) => ({
      ...current,
      [side]: { ...current[side], [field]: value },
    }));
    setCustomError("");
  }

  function addCustom() {
    const question = customQuestion.trim();
    if (!question) return;
    if (!scheduleMode) {
      const hints = parseHints(customSheets.A.hints);
      if (!hints.length) return;
      onAddTopics([{ topicId: "custom", question, hints, custom: true }]);
      onClose();
      return;
    }
    const a = buildSheet(
      customSheets.A.hints,
      customSheets.A.caption,
      "Freitag, 01.11. · Aufgabenblatt A"
    );
    const b = buildSheet(
      customSheets.B.hints,
      customSheets.B.caption,
      "Freitag, 01.11. · Aufgabenblatt B"
    );
    if (!a || !b) {
      setCustomError("Hãy nhập lịch hợp lệ cho cả hai phiếu A và B.");
      return;
    }
    onAddTopics([
      {
        topicId: "custom",
        question,
        hints: SHEET_HINTS,
        custom: true,
        sheets: { A: a.schedule, B: b.schedule },
      },
    ]);
    onClose();
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    setFileError("");
    try {
      const parsed = await parseTopicsFromFile(file);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      let fresh = [];
      if (!scheduleMode) {
        fresh = parsed.filter((topic) => !addedKeys.has(topicKey(topic)));
      } else {
        for (let index = 0; index < parsed.length; index += 2) {
          const first = parsed[index];
          const second = parsed[index + 1] || first;
          const a = buildSheet(
            (first.hints || []).join("\n"),
            first.schedule?.caption,
            `${baseName} · A`
          );
          const b = buildSheet(
            (second.hints || []).join("\n"),
            second.schedule?.caption,
            `${baseName} · B`
          );
          if (!a || !b) continue;
          const topic = {
            topicId: "file",
            question: first.question,
            hints: SHEET_HINTS,
            custom: true,
            sheets: { A: a.schedule, B: b.schedule },
            sources: { A: a, B: b },
          };
          if (!addedKeys.has(topicKey(topic))) fresh.push(topic);
        }
      }
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
    if (editing[index]?.[field] !== undefined) return editing[index][field];
    if (field === "question") return topic.question;
    if (!scheduleMode) return (topic.hints || []).join("\n");
    if (field === "captionA") return topic.sources?.A?.caption || "";
    if (field === "captionB") return topic.sources?.B?.caption || "";
    if (field === "hintsA") return (topic.sources?.A?.hints || []).join("\n");
    if (field === "hintsB") return (topic.sources?.B?.hints || []).join("\n");
    return "";
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
        if (!question) return null;
        if (!scheduleMode) {
          return { ...topic, question, hints: parseHints(topicValue(topic, index, "hints")) };
        }
        const a = buildSheet(
          topicValue(topic, index, "hintsA"),
          topicValue(topic, index, "captionA"),
          "Aufgabenblatt A"
        );
        const b = buildSheet(
          topicValue(topic, index, "hintsB"),
          topicValue(topic, index, "captionB"),
          "Aufgabenblatt B"
        );
        if (!a || !b) return null;
        return {
          ...topic,
          question,
          hints: SHEET_HINTS,
          sheets: { A: a.schedule, B: b.schedule },
        };
      })
      .filter(Boolean);
    if (!chosen.length) {
      setFileError(
        scheduleMode
          ? "Có đề chưa đúng dạng lịch A/B (HH.MM – HH.MM: hoạt động). Hãy sửa rồi thử lại."
          : "Chưa có đề tài hợp lệ để thêm."
      );
      return;
    }
    onAddTopics(chosen);
    onClose();
  }

  return (
    <Modal title={scheduleMode ? "Thêm đề tài lịch trình A/B" : "Thêm đề tài luyện nói"} onClose={onClose}>
      <p className="modal-hint">
        {intro ||
          (scheduleMode
            ? "Mỗi đề gồm hai phiếu A/B. Bạn và AI mỗi người nhận một phiếu, ngẫu nhiên vai và lượt mở lời."
            : "49 chủ đề Goethe A2 đã có sẵn trong danh sách Luyện nói. Dùng hình này để thêm đề tài của riêng bạn hoặc nhập từ tệp PDF/Word.")}
      </p>

      <div className="speaking-modal-tabs">
        <button
          type="button"
          className={mode === "custom" ? "active" : ""}
          onClick={() => setMode("custom")}
        >
          {scheduleMode ? "Tự nhập A/B" : "Tự nhập đề tài"}
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
              onChange={(event) => {
                setCustomQuestion(event.target.value);
                setCustomError("");
              }}
              placeholder="Wann könnt ihr euch treffen?"
            />
          </label>

          {(scheduleMode ? ["A", "B"] : ["A"]).map((side) => (
            <div className="speaking-sheet-editor" key={side}>
              {scheduleMode && <h3>Phiếu {side}</h3>}
              {scheduleMode && (
                <label>
                  Tên lịch / ngày
                  <input
                    value={customSheets[side].caption}
                    onChange={(event) => updateCustomSheet(side, "caption", event.target.value)}
                    placeholder={`Freitag, 01.11. · Aufgabenblatt ${side}`}
                  />
                </label>
              )}
              <label>
                {scheduleMode ? "Lịch hoạt động (mỗi dòng một khung giờ)" : "Gợi ý (mỗi dòng một ý)"}
                <textarea
                  value={customSheets[side].hints}
                  onChange={(event) => updateCustomSheet(side, "hints", event.target.value)}
                  placeholder={
                    scheduleMode
                      ? side === "A"
                        ? "08.00 – 09.00: länger schlafen\n12.00 – 13.00: mit Marto skaten"
                        : "08.00 – 10.00: gemütlich frühstücken\n14.00 – 15.00: Bücher abgeben"
                      : "Freunde treffen?\nHobbys?\nLange schlafen?"
                  }
                  rows={5}
                />
              </label>
            </div>
          ))}

          {scheduleMode && (
            <p className="modal-hint">
              <CalendarClock size={13} /> Mỗi dòng gồm giờ bắt đầu – giờ kết thúc và hoạt động. Giờ
              trống hiện <strong>frei</strong>. Hai phiếu cần có ít nhất một giờ cùng rảnh.
            </p>
          )}
          {customError && <p className="form-error">{customError}</p>}
          <div className="speaking-modal-actions">
            <span>{scheduleMode ? "Tối đa 8 hoạt động mỗi phiếu" : "Tối đa 8 gợi ý"}</span>
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
            {scheduleMode ? (
              <>
                Tệp cần có các dạng <strong>08.00 – 09.00: joggen</strong> hoặc{" "}
                <strong>08.00: joggen</strong>. Hai đề liên tiếp được ghép thành phiếu A và B. Hỗ trợ{" "}
                <strong>.pdf</strong>, <strong>.docx</strong>, <strong>.txt</strong>; đọc ngay trên
                thiết bị.
              </>
            ) : (
              <>
                Hỗ trợ <strong>.pdf</strong>, <strong>.docx</strong> và <strong>.txt</strong>. Tệp được
                đọc ngay trên thiết bị, không gửi lên máy chủ. Có thể bỏ chọn hoặc sửa từng đề tài
                trước khi thêm.
              </>
            )}
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
                            {scheduleMode
                              ? "2 phiếu A/B"
                              : topicValue(topic, index, "hints")
                                  .split("\n")
                                  .filter(Boolean)
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
                          {(scheduleMode ? ["A", "B"] : [""]).map((side) => (
                            <div className="speaking-sheet-editor" key={side || "hints"}>
                              {scheduleMode && <h3>Phiếu {side}</h3>}
                              {scheduleMode && (
                                <input
                                  value={topicValue(topic, index, `caption${side}`)}
                                  onChange={(event) =>
                                    updateTopicValue(index, `caption${side}`, event.target.value)
                                  }
                                  placeholder="Tên lịch / ngày"
                                />
                              )}
                              <textarea
                                rows={3}
                                value={topicValue(
                                  topic,
                                  index,
                                  scheduleMode ? `hints${side}` : "hints"
                                )}
                                onChange={(event) =>
                                  updateTopicValue(
                                    index,
                                    scheduleMode ? `hints${side}` : "hints",
                                    event.target.value
                                  )
                                }
                                placeholder="08.00 – 09.00: joggen"
                              />
                            </div>
                          ))}
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
                  <Plus size={15} /> {scheduleMode ? "Thêm vào lịch trình" : "Thêm vào luyện nói"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
