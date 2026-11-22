import Modal from "../Modal";
import { AI_LEVELS } from "../../lib/aiSentence";

export default function SentenceLevelModal({
  sourceCount,
  limitValue,
  level,
  onLevelChange,
  onStart,
  onBack,
  onClose,
}) {
  return (
    <Modal title="Chọn trình độ tiếng Đức" onClose={onClose}>
      <div className="study-mode-list">
        <p className="muted">
          Chọn trình độ hiện tại của bạn. AI sẽ tạo câu mẫu và chấm điểm đúng mức đó, không bắt
          bạn dùng cấu trúc cao hơn.
        </p>

        <div className="ai-level-list" role="radiogroup" aria-label="Trình độ tiếng Đức">
          {AI_LEVELS.map((item) => (
            <label
              key={item.id}
              className={`ai-level-option ${level === item.id ? "active" : ""}`}
            >
              <input
                type="radio"
                name="ai-sentence-level"
                value={item.id}
                checked={level === item.id}
                onChange={() => onLevelChange(item.id)}
              />
              <span className="ai-level-copy">
                <strong>
                  <span className="ai-level-badge">{item.id}</span> {item.label}
                </strong>
                <small>{item.description}</small>
              </span>
            </label>
          ))}
        </div>

        <p className="muted">
          Bài này sẽ lấy {limitValue} thẻ ngẫu nhiên trong {sourceCount} thẻ. Bạn có thể gõ câu tự
          do hoặc xếp từ thành câu.
        </p>

        <div className="ai-level-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            Quay lại
          </button>
          <button type="button" className="btn-primary" onClick={onStart}>
            Bắt đầu đặt câu
          </button>
        </div>
      </div>
    </Modal>
  );
}
