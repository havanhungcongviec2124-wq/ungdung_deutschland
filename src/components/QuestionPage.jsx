import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  EyeOff,
  Lightbulb,
  Loader2,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
  XCircle,
} from "lucide-react";
import {
  checkAnswer,
  normalizeAiLevel,
  requestQuestionPrompt,
} from "../lib/aiSentence";

function normalizeAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[.,!?;:]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function QuestionPage({
  card,
  index,
  total,
  level,
  onResult,
  onNext,
  onSpeak,
  onExit,
}) {
  const activeLevel = normalizeAiLevel(level);
  const [tab, setTab] = useState("read");
  const [prompt, setPrompt] = useState(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [promptRetry, setPromptRetry] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");
  const checkRunRef = useRef(0);
  const promptRequestedRef = useRef(false);

  useEffect(() => {
    checkRunRef.current += 1;
    promptRequestedRef.current = false;
    setTab("read");
    setPrompt(null);
    setPromptError("");
    setPromptRetry(0);
    setAnswer("");
    setShowHint(false);
    setFeedback(null);
    setChecking(false);
    setCheckError("");
  }, [card.id, activeLevel]);

  // Tải câu hỏi ngầm ngay khi vào thẻ để không phải chờ AI khi bắt đầu trả lời.
  useEffect(() => {
    if (prompt || promptRequestedRef.current) return undefined;
    promptRequestedRef.current = true;
    let cancelled = false;
    setPromptLoading(true);
    setPromptError("");

    requestQuestionPrompt(card, activeLevel)
      .then((data) => {
        if (!cancelled) setPrompt(data);
      })
      .catch((error) => {
        if (!cancelled) setPromptError(error.message);
      })
      .finally(() => {
        if (!cancelled) setPromptLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [card.id, activeLevel, prompt, promptRetry]);

  // Chế độ chỉ nghe: tự đọc câu hỏi một lần khi câu hỏi vừa có.
  useEffect(() => {
    if (tab === "listen" && prompt?.question) onSpeak(prompt.question);
  }, [tab, prompt?.question]);

  function resetAttempt() {
    checkRunRef.current += 1;
    setChecking(false);
    setCheckError("");
    setFeedback(null);
  }

  async function handleCheck() {
    const value = answer.trim();
    if (!value || !prompt || checking || feedback) return;
    const run = checkRunRef.current;
    setChecking(true);
    setCheckError("");

    try {
      const result = await checkAnswer(
        card,
        prompt.question,
        value,
        activeLevel,
        prompt.expectedAnswer
      );
      if (run !== checkRunRef.current) return;
      setFeedback({ ...result, userAnswer: value });
      onResult(result.correct);
    } catch (error) {
      if (run !== checkRunRef.current) return;
      // Vẫn tiếp tục bài nếu AI chấm lỗi nhưng câu trả lời khớp đáp án mẫu.
      if (prompt.expectedAnswer && normalizeAnswer(value) === normalizeAnswer(prompt.expectedAnswer)) {
        setFeedback({
          correct: true,
          corrected: prompt.expectedAnswer,
          explanation: "Câu trả lời khớp với đáp án mẫu (kiểm tra ngoại tuyến).",
          userAnswer: value,
        });
        onResult(true);
      } else {
        setCheckError(error.message);
      }
    } finally {
      if (run === checkRunRef.current) setChecking(false);
    }
  }

  const canSubmit = Boolean(answer.trim()) && Boolean(prompt) && !checking && !feedback;

  return (
    <div className="study-screen sentence-screen">
      <div className="study-header">
        <button className="btn-secondary" onClick={onExit}>
          <X size={17} /> Kết thúc
        </button>
        <span>HỎI – ĐÁP · {activeLevel} · AI CHẤM ĐIỂM</span>
        <strong>
          {index + 1} / {total}
        </strong>
      </div>

      <div className="progress-track">
        <div style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <div className="study-content sentence-content">
        <div className="eyebrow">TRẢ LỜI CÂU HỎI TỪ TỪ NÀY</div>

        <div className="sentence-word-card">
          <div className="quiz-question-row">
            <strong>{card.front}</strong>
            <button
              className="voice-button"
              onClick={() => onSpeak(card.front)}
              title={`Phát âm ${card.front}`}
              aria-label={`Phát âm ${card.front}`}
            >
              <Volume2 size={18} />
            </button>
          </div>
          {card.plural && <small className="sentence-plural">{card.plural}</small>}
          <span className="vocab-language">{card.back}</span>
        </div>

        <div className="sentence-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "read"}
            className={tab === "read" ? "active" : ""}
            onClick={() => setTab("read")}
          >
            Đọc câu hỏi
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "listen"}
            className={tab === "listen" ? "active" : ""}
            onClick={() => setTab("listen")}
          >
            Nghe, không hiện chữ
          </button>
        </div>

        {promptLoading && (
          <div className="sentence-loading">
            <Loader2 size={18} className="spin" /> AI đang tạo câu hỏi...
          </div>
        )}
        {promptError && (
          <div className="sentence-error">
            <p>{promptError}</p>
            <button
              className="btn-secondary"
              onClick={() => {
                promptRequestedRef.current = false;
                setPromptError("");
                setPromptRetry((value) => value + 1);
              }}
            >
              <RotateCcw size={15} /> Thử lại
            </button>
          </div>
        )}

        {prompt && tab === "read" && (
          <div className="sentence-task question-read">
            <span className="vocab-language">CÂU HỎI TIẾNG ĐỨC</span>
            <strong>{prompt.question}</strong>
            <div className="question-read-actions">
              <button
                className="voice-button inline-voice"
                onClick={() => onSpeak(prompt.question)}
                title="Nghe lại câu hỏi"
                aria-label="Nghe lại câu hỏi"
              >
                <Volume2 size={16} /> 
              </button>
              {(prompt.translation || prompt.hint) && (
                <button
                  type="button"
                  className="question-hint-toggle"
                  onClick={() => setShowHint((value) => !value)}
                  aria-expanded={showHint}
                >
                  {showHint ? (
                    <>
                      <EyeOff size={14} /> Ẩn dịch và gợi ý
                    </>
                  ) : (
                    <>
                      <Lightbulb size={14} /> Dịch và gợi ý
                    </>
                  )}
                </button>
              )}
            </div>
            {showHint && (prompt.translation || prompt.hint) && (
              <div className="question-hint-panel">
                {prompt.translation && <small>{prompt.translation}</small>}
                {prompt.hint && <small>Gợi ý: {prompt.hint}</small>}
              </div>
            )}
          </div>
        )}

        {prompt && tab === "listen" && (
          <div className="question-listen">
            <button
              type="button"
              className="question-listen-play"
              onClick={() => onSpeak(prompt.question)}
            >
              <Volume2 size={26} /> Nghe lại câu hỏi
            </button>
            <span className="question-listen-caption">
              Câu hỏi được đọc bằng giọng Đức, không hiển thị chữ. Hãy nghe và gõ câu trả lời bên dưới.
            </span>
            <button type="button" className="btn-secondary" onClick={() => setTab("read")}>
              Hiện câu hỏi
            </button>
          </div>
        )}

        <div className="sentence-input-wrap">
          <textarea
            autoFocus
            rows="4"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Gõ câu trả lời tiếng Đức của bạn..."
            aria-label="Câu trả lời tiếng Đức của bạn"
            disabled={!prompt || Boolean(feedback)}
          />
          <small>{answer.trim().length} ký tự</small>
        </div>

        {checkError && (
          <div className="sentence-error sentence-check-error">
            <p>{checkError}</p>
          </div>
        )}

        {!feedback ? (
          <button
            className="btn-primary sentence-submit"
            disabled={!canSubmit}
            onClick={handleCheck}
          >
            {checking ? (
              <>
                <Loader2 size={17} className="spin" /> AI đang chấm...
              </>
            ) : (
              <>
                <Sparkles size={17} /> Gửi AI chấm
              </>
            )}
          </button>
        ) : (
          <div className={`sentence-feedback ${feedback.correct ? "correct" : "incorrect"}`}>
            <div className="sentence-feedback-head">
              {feedback.correct ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
              <strong>{feedback.correct ? "Rất tốt, trả lời đúng!" : "Câu trả lời cần sửa lại"}</strong>
            </div>
            <p>
              Câu của bạn: <em>{feedback.userAnswer}</em>
            </p>
            <p>
              Câu trả lời mẫu: <strong>{feedback.corrected}</strong>{" "}
              <button
                className="voice-button inline-voice"
                onClick={() => onSpeak(feedback.corrected)}
                title="Phát âm câu trả lời mẫu"
                aria-label="Phát âm câu trả lời mẫu"
              >
                <Volume2 size={15} />
              </button>
            </p>
            {feedback.explanation && <p className="sentence-explanation">{feedback.explanation}</p>}
            <button type="button" className="btn-secondary full" onClick={resetAttempt}>
              <RotateCcw size={15} /> Thử lại câu này
            </button>
            <button className="btn-primary full" onClick={onNext}>
              {index === total - 1 ? "Xem kết quả" : "Câu hỏi tiếp theo"}{" "}
              <ChevronRight size={17} />
            </button>
          </div>
        )}

        <p className="sentence-note">
          Câu hỏi và đáp án do AI tạo theo trình độ {activeLevel}. Phát âm dùng giọng có sẵn trên
          thiết bị; câu hỏi và câu trả lời của bạn được gửi tới dịch vụ AI để chấm.
        </p>
      </div>
    </div>
  );
}
