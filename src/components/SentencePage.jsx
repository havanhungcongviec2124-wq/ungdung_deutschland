import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
  XCircle,
} from "lucide-react";
import {
  checkSentence,
  normalizeAiLevel,
  requestSentencePrompt,
} from "../lib/aiSentence";

function normalizeSentence(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[.,!?;:]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function SentencePage({
  card,
  index,
  total,
  level,
  onResult,
  onNext,
  onExit,
  onSpeak,
}) {
  const activeLevel = normalizeAiLevel(level);
  const [tab, setTab] = useState("type");
  const [sentence, setSentence] = useState("");
  const [prompt, setPrompt] = useState(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [promptRetry, setPromptRetry] = useState(0);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");
  const checkRunRef = useRef(0);
  const promptRequestedRef = useRef(false);

  useEffect(() => {
    checkRunRef.current += 1;
    promptRequestedRef.current = false;
    setTab("type");
    setSentence("");
    setPrompt(null);
    setPromptError("");
    setPromptRetry(0);
    setSelected([]);
    setFeedback(null);
    setChecking(false);
    setCheckError("");
  }, [card.id, activeLevel]);

  useEffect(() => {
    if (tab !== "arrange" || prompt || promptRequestedRef.current) return undefined;
    promptRequestedRef.current = true;
    let cancelled = false;
    setPromptLoading(true);
    setPromptError("");

    requestSentencePrompt(card, activeLevel)
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
  }, [tab, card.id, activeLevel, prompt, promptRetry]);

  const assembled = prompt
    ? selected
        .map((tokenIndex) => prompt.tokens[tokenIndex] || "")
        .join(" ")
        .replace(/\s+([.,!?;:])/g, "$1")
    : "";
  const activeSentence = tab === "type" ? sentence.trim() : assembled.trim();
  const canSubmit = Boolean(activeSentence) && !checking && !feedback;

  function handleTabChange(nextTab) {
    if (nextTab === tab) return;
    // Bỏ kết quả của tab trước để tab kia có thể làm và chấm lại cùng một từ.
    checkRunRef.current += 1;
    setChecking(false);
    setCheckError("");
    setFeedback(null);
    setTab(nextTab);
  }

  async function handleCheck() {
    const value = activeSentence;
    if (!value || checking || feedback) return;
    const run = checkRunRef.current;
    setChecking(true);
    setCheckError("");

    try {
      const result = await checkSentence(card, value, activeLevel);
      if (run !== checkRunRef.current) return;
      setFeedback({ ...result, source: "ai", userSentence: value });
      onResult(result.correct);
    } catch (error) {
      // Xếp từ vẫn chấm được ngoại tuyến nếu đã có câu mẫu từ AI.
      if (
        tab === "arrange" &&
        prompt &&
        normalizeSentence(value) === normalizeSentence(prompt.sentence)
      ) {
        if (run !== checkRunRef.current) return;
        setFeedback({
          correct: true,
          corrected: prompt.sentence,
          explanation: "Câu của bạn khớp với câu mẫu (kiểm tra ngoại tuyến).",
          source: "local",
          userSentence: value,
        });
        onResult(true);
      } else if (run === checkRunRef.current) {
        setCheckError(error.message);
      }
    } finally {
      if (run === checkRunRef.current) setChecking(false);
    }
  }

  return (
    <div className="study-screen sentence-screen">
      <div className="study-header">
        <button className="btn-secondary" onClick={onExit}>
          <X size={17} /> Kết thúc
        </button>
        <span>ĐẶT CÂU · {activeLevel} · AI CHẤM ĐIỂM</span>
        <strong>
          {index + 1} / {total}
        </strong>
      </div>

      <div className="progress-track">
        <div style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <div className="study-content sentence-content">
        <div className="eyebrow">HÃY ĐẶT MỘT CÂU VỚI TỪ NÀY</div>

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
            aria-selected={tab === "type"}
            className={tab === "type" ? "active" : ""}
            onClick={() => handleTabChange("type")}
          >
            Gõ câu tự do
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "arrange"}
            className={tab === "arrange" ? "active" : ""}
            onClick={() => handleTabChange("arrange")}
          >
            Xếp từ thành câu
          </button>
        </div>

        {tab === "type" ? (
          <div className="sentence-input-wrap">
            <textarea
              autoFocus
              rows="4"
              value={sentence}
              onChange={(event) => setSentence(event.target.value)}
              placeholder={`Viết một câu tiếng Đức có chứa "${card.front}"...`}
              aria-label="Câu tiếng Đức của bạn"
              disabled={Boolean(feedback)}
            />
            <small>{sentence.trim().length} ký tự</small>
          </div>
        ) : (
          <div className="sentence-arrange">
            {promptLoading && (
              <div className="sentence-loading">
                <Loader2 size={18} className="spin" /> AI đang tạo câu mẫu...
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
            {prompt && (
              <>
                <div className="sentence-task">
                  <span className="vocab-language">NGHĨA CỦA CÂU CẦN XẾP</span>
                  <strong>{prompt.translation || card.back}</strong>
                  {prompt.hint && <small>{prompt.hint}</small>}
                </div>

                <div className="sentence-slots" aria-label="Câu của bạn">
                  {selected.length ? (
                    selected.map((tokenIndex, position) => (
                      <button
                        type="button"
                        key={tokenIndex}
                        className="sentence-token selected-token"
                        onClick={() =>
                          setSelected((prev) => prev.filter((_, i) => i !== position))
                        }
                        disabled={Boolean(feedback)}
                      >
                        {prompt.tokens[tokenIndex]}
                      </button>
                    ))
                  ) : (
                    <span className="sentence-slots-empty">
                      Bấm các từ bên dưới theo thứ tự bạn muốn
                    </span>
                  )}
                </div>

                <div className="sentence-bank" aria-label="Các từ có sẵn">
                  {prompt.tokens.map((token, tokenIndex) => (
                    <button
                      type="button"
                      key={tokenIndex}
                      className="sentence-token"
                      disabled={selected.includes(tokenIndex) || Boolean(feedback)}
                      onClick={() => setSelected((prev) => [...prev, tokenIndex])}
                    >
                      {token}
                    </button>
                  ))}
                </div>

                {selected.length > 0 && !feedback && (
                  <button
                    className="btn-secondary sentence-clear"
                    onClick={() => setSelected([])}
                  >
                    <RotateCcw size={15} /> Chọn lại
                  </button>
                )}
              </>
            )}
          </div>
        )}

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
              <strong>{feedback.correct ? "Rất tốt, câu đúng!" : "Câu này cần sửa lại"}</strong>
            </div>
            <p>
              Câu của bạn: <em>{feedback.userSentence}</em>
            </p>
            <p>
              Câu đúng: <strong>{feedback.corrected}</strong>{" "}
              <button
                className="voice-button inline-voice"
                onClick={() => onSpeak(feedback.corrected)}
                title="Phát âm câu đúng"
                aria-label="Phát âm câu đúng"
              >
                <Volume2 size={15} />
              </button>
            </p>
            {feedback.explanation && <p className="sentence-explanation">{feedback.explanation}</p>}
            <small className="sentence-retry-note">
              Muốn thử cách khác? Chuyển sang tab kia để làm lại; hoặc bấm „Câu tiếp theo“ để bỏ qua.
            </small>
            <button className="btn-primary full" onClick={onNext}>
              {index === total - 1 ? "Xem kết quả" : "Câu tiếp theo"}{" "}
              <ChevronRight size={17} />
            </button>
          </div>
        )}

        <p className="sentence-note">
          Chấm bằng Gemini AI · cần Internet. Từ vựng và câu của bạn được gửi tới Google để kiểm tra.
        </p>
      </div>
    </div>
  );
}
