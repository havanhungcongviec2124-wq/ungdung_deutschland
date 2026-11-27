import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../Modal";

export default function WritingAddModal({ onAddTopics, onClose }) {
  const [question, setQuestion] = useState("");
  const [points, setPoints] = useState("");
  const [format, setFormat] = useState("SMS");
  const [error, setError] = useState("");

  function submit() {
    const value = question.trim();
    const hints = points
      .split("\n")
      .map((line) => line.trim().replace(/^[-–]\s*/, ""))
      .filter(Boolean);
    if (!value) {
      setError("Hãy nhập đề bài tiếng Đức.");
      return;
    }
    if (hints.length !== 3) {
      setError("Hãy nhập đúng 3 ý cần viết, mỗi ý một dòng.");
      return;
    }
    const added = onAddTopics?.([
      {
        question: value,
        hints,
        format,
        minWords: format === "SMS" ? 20 : 30,
        maxWords: format === "SMS" ? 30 : 40,
        label: "ĐỀ TỰ THÊM",
      },
    ]);
    if (added) onClose();
  }

  return (
    <Modal title="Thêm đề viết SMS / Thư" onClose={onClose}>
      <div className="speaking-modal-body">
        <p className="modal-hint">
          Nhập đề bài bằng tiếng Đức và đúng 3 ý học sinh cần viết. Đề mới được lưu riêng trong mục
          Luyện viết, không ảnh hưởng đến đề Luyện nói.
        </p>

        <label className="writing-add-label" htmlFor="writing-add-question">
          Đề bài (tiếng Đức)
        </label>
        <textarea
          id="writing-add-question"
          rows={4}
          value={question}
          placeholder="Sie sind unterwegs ... Schreiben Sie eine SMS an ..."
          onChange={(event) => setQuestion(event.target.value)}
        />

        <label className="writing-add-label" htmlFor="writing-add-format">
          Dạng bài
        </label>
        <select
          id="writing-add-format"
          value={format}
          onChange={(event) => setFormat(event.target.value)}
        >
          <option value="SMS">SMS (khuyến nghị 20–30 từ)</option>
          <option value="E-Mail">E-Mail (khuyến nghị 30–40 từ)</option>
          <option value="Brief">Brief (khuyến nghị 30–40 từ)</option>
        </select>

        <label className="writing-add-label" htmlFor="writing-add-points">
          3 ý cần viết (mỗi ý một dòng)
        </label>
        <textarea
          id="writing-add-points"
          rows={4}
          value={points}
          placeholder={"Entschuldigen Sie sich, dass Sie zu spät kommen.\nSchreiben Sie, warum.\nNennen Sie einen neuen Ort und eine neue Uhrzeit."}
          onChange={(event) => setPoints(event.target.value)}
        />

        {error && <p className="form-error">{error}</p>}

        <div className="speaking-modal-actions">
          <span>{points.split("\n").filter((line) => line.trim()).length} / 3 ý</span>
          <button type="button" className="btn-primary" onClick={submit}>
            <Plus size={15} /> Thêm đề tài
          </button>
        </div>
      </div>
    </Modal>
  );
}
