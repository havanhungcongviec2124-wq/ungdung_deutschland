import Modal from "../Modal";

export default function StudySetupModal({
  sourceCount,
  limit,
  limitValue,
  limitInvalid,
  onLimitChange,
  onSelectAll,
  onStart,
  onOpenSentenceLevel,
  onOpenQuestionLevel,
  onClose,
}) {
  return (
    <Modal title="Chọn kiểu kiểm tra" onClose={onClose}>
      <div className="study-mode-list">
        <p className="muted">
          Chọn cách ôn tập cho {sourceCount} thẻ từ
          {limitValue < sourceCount ? ` (sẽ lấy ngẫu nhiên ${limitValue} thẻ)` : ""}.
        </p>

        <div className="study-limit-field">
          <div className="study-limit-heading">
            <label htmlFor="study-limit-input">Số thẻ muốn kiểm tra</label>
            <button type="button" className="study-limit-all" onClick={onSelectAll}>
              Tất cả
            </button>
          </div>
          <div className="study-limit-control">
            <input
              id="study-limit-input"
              type="number"
              min="1"
              max={sourceCount}
              value={limit}
              onChange={(event) => onLimitChange(event.target.value)}
            />
            <span>/ {sourceCount} thẻ</span>
          </div>
          <small className={limitInvalid ? "study-limit-error" : ""}>
            {limitInvalid
              ? `Nhập số từ 1 đến ${sourceCount}.`
              : "Thẻ sẽ được chọn ngẫu nhiên và không trùng nhau."}
          </small>
        </div>

        <button className="study-mode-option" onClick={() => onStart("flashcard")}>
          <strong>Lật thẻ từ vựng</strong>
          <span>Xem từ tiếng Đức rồi tự nhớ nghĩa tiếng Việt.</span>
        </button>
        <button className="study-mode-option" onClick={() => onStart("de-to-vi")}>
          <strong>Trắc nghiệm: Đức → Việt</strong>
          <span>Hiện từ tiếng Đức, chọn đáp án nghĩa tiếng Việt.</span>
        </button>
        <button className="study-mode-option" onClick={() => onStart("vi-to-de")}>
          <strong>Trắc nghiệm: Việt → Đức</strong>
          <span>Hiện nghĩa tiếng Việt, chọn đáp án từ tiếng Đức.</span>
        </button>
        <button className="study-mode-option" onClick={onOpenSentenceLevel}>
          <strong>Đặt câu với AI</strong>
          <span>
            Chọn trình độ tiếng Đức; AI tạo câu, sửa lỗi và giải thích theo đúng trình độ đó.
          </span>
        </button>
        <button className="study-mode-option" onClick={onOpenQuestionLevel}>
          <strong>Hỏi – đáp với AI</strong>
          <span>
            AI tạo câu hỏi từ mỗi thẻ; bạn đọc hoặc chỉ nghe rồi gõ câu trả lời tiếng Đức, AI chấm đúng trình độ.
          </span>
        </button>
      </div>
    </Modal>
  );
}
