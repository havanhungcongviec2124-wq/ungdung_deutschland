import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  Loader2,
  MessageCircle,
  Plus,
  RotateCcw,
  Shuffle,
  Trash2,
  Volume2,
  XCircle,
} from "lucide-react";
import { checkSpeaking, SPEAKING_LEVEL, startSpeaking } from "../lib/aiSpeaking";
import SpeakingOverviewModal from "./modals/SpeakingOverviewModal";
import ConfirmModal from "./modals/ConfirmModal";

function SpeakingFeedback({ result }) {
  if (!result) return null;
  return (
    <div className={`speaking-feedback ${result.correct ? "good" : "bad"}`}>
      <div className="speaking-feedback-title">
        {result.correct ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
        <strong>
          {result.correct ? "Rất tốt, câu trả lời đúng!" : "Câu trả lời cần sửa"}
        </strong>
      </div>
      {!result.correct && (
        <p>
          <span>Câu gợi ý: </span>
          <em>{result.corrected}</em>
        </p>
      )}
      <p>{result.explanation}</p>
    </div>
  );
}

function SpeakingBoard({ board, onBack, onSpeak, actions }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [answers, setAnswers] = useState({});
  const [followResults, setFollowResults] = useState({});
  const [checking, setChecking] = useState({});
  const [followErrors, setFollowErrors] = useState({});
  const [showHints, setShowHints] = useState({});

  function reset() {
    setAnswer("");
    setError("");
    setResult(null);
    setFollowUps([]);
    setAnswers({});
    setFollowResults({});
    setChecking({});
    setFollowErrors({});
    setShowHints({});
  }

  async function submitMain() {
    if (!answer.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const data = await startSpeaking(board, answer);
      setResult({ correct: data.correct, corrected: data.corrected, explanation: data.explanation });
      setFollowUps(data.followUps);
    } catch (err) {
      setError(err?.message || "Không thể chấm điểm. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function submitFollowUp(item) {
    const value = answers[item.id] || "";
    if (!value.trim() || checking[item.id]) return;
    setChecking((current) => ({ ...current, [item.id]: true }));
    setFollowErrors((current) => ({ ...current, [item.id]: "" }));
    try {
      const data = await checkSpeaking(board, item.question, value);
      setFollowResults((current) => ({ ...current, [item.id]: data }));
    } catch (err) {
      setFollowErrors((current) => ({
        ...current,
        [item.id]: err?.message || "Không thể chấm điểm. Hãy thử lại.",
      }));
    } finally {
      setChecking((current) => ({ ...current, [item.id]: false }));
    }
  }

  return (
    <section className="speaking-page speaking-detail">
      <div className="speaking-head">
        <button type="button" className="btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} /> Danh sách đề tài
        </button>
        <span className="speaking-level-badge">A2 · GOETHE SPRECHEN TEIL 2</span>
        {actions}
      </div>

      <div className="speaking-detail-columns">
        <div className="speaking-detail-main">
        <div className="speaking-prompt">
          <span className="vocab-language">ĐỀ NÓI TIẾNG ĐỨC</span>
          <strong>{board.question}</strong>
          <ul>
            {board.hints.map((hint, index) => (
              <li key={`${hint}-${index}`}>- {hint}</li>
            ))}
          </ul>
          {onSpeak && (
            <button
              type="button"
              className="voice-button inline-voice"
              onClick={() => onSpeak(board.question)}
              aria-label="Nghe câu hỏi"
            >
              <Volume2 size={15} /> 
            </button>
          )}
        </div>

      <div className="speaking-form">
        <label htmlFor="speaking-main-answer">Câu trả lời của bạn (tiếng Đức)</label>
        <textarea
          id="speaking-main-answer"
          rows={4}
          value={answer}
          disabled={loading}
          placeholder="Viết câu trả lời bằng tiếng Đức..."
          onChange={(event) => setAnswer(event.target.value)}
        />
        <div className="speaking-form-actions">
          <span>{answer.trim().length} ký tự</span>
          <button
            type="button"
            className="btn-primary"
            disabled={!answer.trim() || loading}
            onClick={submitMain}
          >
            {loading ? <Loader2 size={15} className="spin" /> : <MessageCircle size={15} />}
            {loading ? "AI đang chấm..." : "Nộp câu trả lời"}
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </div>

      {result && <SpeakingFeedback result={result} />}
        </div>

      {followUps.length > 0 && (
        <div className="speaking-detail-side">
        <div className="speaking-followups">
          <div className="speaking-followups-head">
            <div>
              <h2>Câu hỏi phụ tiếp theo</h2>
              <p>
                AI tạo {followUps.length} câu hỏi từ đề tài này. Hãy trả lời từng câu rồi bấm chấm điểm.
              </p>
            </div>
            <button type="button" className="btn-ghost" onClick={reset}>
              <RotateCcw size={15} /> Làm lại
            </button>
          </div>

          {followUps.map((item, index) => (
            <div className="speaking-followup" key={item.id}>
              <div className="speaking-followup-head">
                <span className="speaking-followup-number">Câu {index + 1}</span>
                <strong>{item.question}</strong>
              </div>
              {(item.translation || item.hint) && (
                <>
                  <button
                    type="button"
                    className="speaking-hint-toggle"
                    aria-expanded={Boolean(showHints[item.id])}
                    onClick={() =>
                      setShowHints((current) => ({
                        ...current,
                        [item.id]: !current[item.id],
                      }))
                    }
                  >
                    <Lightbulb size={13} />
                    {showHints[item.id] ? "Ẩn dịch và gợi ý" : "Dịch và gợi ý"}
                  </button>
                  {showHints[item.id] && (
                    <div className="speaking-hint-panel">
                      {item.translation && <small>{item.translation}</small>}
                      {item.hint && <small>Gợi ý: {item.hint}</small>}
                    </div>
                  )}
                </>
              )}
              <textarea
                rows={2}
                value={answers[item.id] || ""}
                disabled={Boolean(checking[item.id])}
                placeholder="Trả lời bằng tiếng Đức..."
                onChange={(event) =>
                  setAnswers((current) => ({ ...current, [item.id]: event.target.value }))
                }
              />
              <div className="speaking-followup-actions">
                <span>{(answers[item.id] || "").trim().length} ký tự</span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={!(answers[item.id] || "").trim() || Boolean(checking[item.id])}
                  onClick={() => submitFollowUp(item)}
                >
                  {checking[item.id] ? <Loader2 size={14} className="spin" /> : <CheckCircle2 size={14} />}
                  {checking[item.id] ? "Đang chấm..." : "Chấm điểm"}
                </button>
              </div>
              {followErrors[item.id] && (
                <p className="form-error">{followErrors[item.id]}</p>
              )}
              {followResults[item.id] && (
                <SpeakingFeedback result={followResults[item.id]} />
              )}
            </div>
          ))}
        </div>
        </div>
      )}
      </div>
    </section>
  );
}

export default function SpeakingPage({
  boards,
  onAdd,
  onRemove,
  onSpeak,
  onSaveTopic,
  onResetTopic,
  hiddenCount = 0,
  onRestoreHidden,
}) {
  const [activeId, setActiveId] = useState("");
  const [lastRandomId, setLastRandomId] = useState("");
  const [view, setView] = useState("list");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const activeBoard = boards.find((board) => board.id === activeId);

  function pickRandomBoard() {
    const choices = boards.length > 1
      ? boards.filter((board) => board.id !== lastRandomId)
      : boards;
    if (!choices.length) return;
    const picked = choices[Math.floor(Math.random() * choices.length)];
    setLastRandomId(picked.id);
    setView("list");
    setActiveId(picked.id);
  }

  const actions = (
    <div className="speaking-head-actions">
      <button type="button" className="btn-secondary" onClick={() => setView("overview")}>
        <ListChecks size={16} /> Tổng hợp các đề
      </button>
      <button type="button" className="btn-secondary" onClick={pickRandomBoard}>
        <Shuffle size={16} /> Kiểm tra random
      </button>
      <button type="button" className="btn-primary speaking-add-button" onClick={onAdd}>
        <Plus size={16} /> Thêm đề tài
      </button>
    </div>
  );

  if (view === "overview") {
    return (
      <SpeakingOverviewModal
        boards={boards}
        onSaveTopic={onSaveTopic}
        onResetTopic={onResetTopic}
        onRemoveTopic={onRemove}
        hiddenCount={hiddenCount}
        onRestoreHidden={onRestoreHidden}
        onClose={() => setView("list")}
        inline
        headerActions={actions}
      />
    );
  }

  if (activeBoard) {
    return (
      <SpeakingBoard
        key={activeBoard.id}
        board={activeBoard}
        onBack={() => setActiveId("")}
        onSpeak={onSpeak}
        actions={actions}
      />
    );
  }

  return (
    <section className="speaking-page">
      <div className="speaking-head">
        <div>
          <h1>Luyện nói</h1>
          <p>
            49 đề tài Goethe A2 có sẵn bên dưới. Chọn đề bất kỳ, tự trả lời bằng tiếng Đức rồi để
            AI chấm điểm và hỏi tiếp.
          </p>
        </div>
        {actions}
      </div>

      <div className="speaking-grid">
        {boards.map((board, index) => (
          <article
            className="speaking-board"
            key={board.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveId(board.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveId(board.id);
              }
            }}
          >
            <div className="speaking-board-top">
              <span className="speaking-board-label">
                {board.library ? board.label.toUpperCase() : `ĐỀ ${index + 1}`}
              </span>
              <button
                type="button"
                className="icon-button"
                title="Xóa đề tài"
                aria-label="Xóa đề tài"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteTarget(board);
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <strong>{board.question}</strong>
            <ul>
              {board.hints.map((hint, hintIndex) => (
                <li key={`${hint}-${hintIndex}`}>- {hint}</li>
              ))}
            </ul>
            <span className="speaking-board-cta">Bắt đầu luyện nói →</span>
          </article>
        ))}
      </div>
      <p className="speaking-footnote">
        Trình độ chấm cố định {SPEAKING_LEVEL} theo Goethe-Zertifikat A2 Sprechen Teil 2. Câu trả lời
        được gửi tới dịch vụ AI để chấm và tạo câu hỏi phụ.
      </p>

      {deleteTarget && (
        <ConfirmModal
          title="Xóa đề tài"
          message={`Bạn có muốn xóa đề "${deleteTarget.question}" không? Đề tài sẽ biến mất khỏi danh sách Luyện nói.`}
          onConfirm={() => {
            onRemove(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </section>
  );
}
