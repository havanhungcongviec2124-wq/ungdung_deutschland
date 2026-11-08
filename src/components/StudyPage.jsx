import {
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Volume2,
  X,
  XCircle,
} from "lucide-react";
import { normalizeQuizAnswer, quizAnswer } from "../lib/appData";

export default function StudyPage({
  card,
  index,
  total,
  mode,
  options,
  selectedAnswer,
  flipped,
  setFlipped,
  onAnswer,
  onChooseAnswer,
  onContinue,
  onSpeak,
  onExit,
}) {
  const isQuiz = mode !== "flashcard";
  const correctAnswer = quizAnswer(card, mode);
  const question = mode === "vi-to-de" ? card.back : card.front;
  const label = mode === "vi-to-de" ? "TIẾNG VIỆT" : "DEUTSCH";
  const title =
    mode === "vi-to-de"
      ? "TRẮC NGHIỆM · VIỆT → ĐỨC"
      : mode === "de-to-vi"
        ? "TRẮC NGHIỆM · ĐỨC → VIỆT"
        : "ÔN TẬP TỪ VỰNG";

  return (
    <div className="study-screen">
      {/* ---------- Header + progress ---------- */}
      <div className="study-header">
        <button className="btn-secondary" onClick={onExit}>
          <X size={17} /> Kết thúc
        </button>
        <span>{title}</span>
        <strong>
          {index + 1} / {total}
        </strong>
      </div>

      <div className="progress-track">
        <div style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <div className="study-content">
        {isQuiz ? (
          /* ================= QUIZ MODE ================= */
          <>
            <div className="eyebrow">CHỌN ĐÁP ÁN ĐÚNG</div>

            {/* Prompt */}
            <div className="quiz-prompt">
              <span className="vocab-language">{label}</span>
              <div className="quiz-question-row">
                <strong>{question}</strong>
                {mode === "de-to-vi" && (
                  <button
                    className="voice-button"
                    onClick={() => onSpeak(card.front)}
                    title={`Phát âm ${card.front}`}
                    aria-label={`Phát âm ${card.front}`}
                  >
                    <Volume2 size={18} />
                  </button>
                )}
              </div>
              {mode === "de-to-vi" && card.plural && (
                <small>{card.plural}</small>
              )}
            </div>

            {/* Options */}
            <div className="quiz-options">
              {options.map((option) => {
                const isCorrect =
                  normalizeQuizAnswer(option) ===
                  normalizeQuizAnswer(correctAnswer);
                const isSelected = option === selectedAnswer;
                const stateClass =
                  selectedAnswer === null
                    ? ""
                    : isCorrect
                      ? " correct"
                      : isSelected
                        ? " incorrect"
                        : "";

                return (
                  <div key={option} className="quiz-option-row">
                    <button
                      className={`quiz-option${stateClass}`}
                      disabled={selectedAnswer !== null}
                      onClick={() => onChooseAnswer(option)}
                    >
                      {option}
                    </button>
                    {mode === "vi-to-de" && (
                      <button
                        className="voice-button"
                        onClick={() => onSpeak(option)}
                        title={`Phát âm ${option}`}
                        aria-label={`Phát âm ${option}`}
                      >
                        <Volume2 size={17} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Feedback */}
            {selectedAnswer !== null && (
              <div
                className={`quiz-feedback ${
                  normalizeQuizAnswer(selectedAnswer) ===
                  normalizeQuizAnswer(correctAnswer)
                    ? "correct"
                    : "incorrect"
                }`}
              >
                {normalizeQuizAnswer(selectedAnswer) ===
                normalizeQuizAnswer(correctAnswer) ? (
                  "Chính xác!"
                ) : (
                  <>
                    Chưa chính xác. Đáp án đúng: <strong>{correctAnswer}</strong>
                  </>
                )}
              </div>
            )}

            {/* Continue */}
            <button
              className="btn-primary quiz-continue"
              disabled={selectedAnswer === null}
              onClick={onContinue}
            >
              {index === total - 1 ? "Xem kết quả" : "Câu tiếp theo"}{" "}
              <ChevronRight size={17} />
            </button>
          </>
        ) : (
          /* ================= FLASHCARD MODE ================= */
          <>
            <div className="eyebrow">HÃY NHỚ LẠI TỪ NÀY</div>

            {/* Flip card */}
            <div
              className={`flip-card ${flipped ? "is-flipped" : ""}`}
              onClick={() => setFlipped((value) => !value)}
              role="button"
              tabIndex="0"
              onKeyDown={(event) =>
                event.key === "Enter" && setFlipped((value) => !value)
              }
            >
              <div className="flip-inner">
                {/* Front */}
                <div className="flip-face flip-front">
                  <span className="vocab-language">DEUTSCH</span>
                  <div className="flip-word-row">
                    <strong>{card.front}</strong>
                    <button
                      className="voice-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSpeak(card.front);
                      }}
                      title={`Phát âm ${card.front}`}
                      aria-label={`Phát âm ${card.front}`}
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                  {card.plural && <small>{card.plural}</small>}
                  <span className="flip-hint">
                    <RotateCcw size={15} /> Nhấn để xem nghĩa
                  </span>
                </div>

                {/* Back */}
                <div className="flip-face flip-back">
                  <span className="vocab-language">TIẾNG VIỆT</span>
                  <strong>{card.back}</strong>
                  {card.note && <small>{card.note}</small>}
                  <span className="flip-hint">
                    <RotateCcw size={15} /> Nhấn để quay lại
                  </span>
                </div>
              </div>
            </div>

            <p className="study-instruction">
              {flipped
                ? "Bạn có nhớ từ này không?"
                : "Hãy thử nhớ nghĩa trước khi lật thẻ."}
            </p>

            {/* Answer actions */}
            <div className="answer-actions">
              <button className="answer-no" onClick={() => onAnswer(false)}>
                <XCircle size={19} /> Chưa thuộc
              </button>
              <button className="answer-yes" onClick={() => onAnswer(true)}>
                <CheckCircle2 size={19} /> Đã thuộc
              </button>
            </div>

            <div className="study-keyboard">
              Bạn có thể nhấn vào thẻ để lật mặt sau.
            </div>
          </>
        )}
      </div>
    </div>
  );
}