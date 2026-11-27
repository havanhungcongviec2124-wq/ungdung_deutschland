import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  Loader2,
  MessageCircle,
  Plus,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trash2,
  Volume2,
  XCircle,
} from "lucide-react";
import {
  checkSpeaking,
  generateSpeakingTopic,
  SPEAKING_LEVEL,
  startSpeaking,
} from "../lib/aiSpeaking";
import ScheduleDialogue from "./ScheduleDialogue";
import ScheduleTable from "./ScheduleTable";
import { withScheduleFromHints } from "../lib/scheduleInput";
import SpeakingOverviewModal from "./modals/SpeakingOverviewModal";
import ConfirmModal from "./modals/ConfirmModal";

const SPEAKING_PAGE_SIZE = 20;

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

function PracticeBadge({ count }) {
  const times = Number(count) || 0;
  if (!times) return null;
  return (
    <span
      className="practice-badge"
      title={`Đã làm ${times} lần${times > 1 ? `, làm lại ${times - 1} lần` : ""}`}
    >
      <CheckCircle2 size={11} /> Đã làm · {times} lần
      {times > 1 && <span className="practice-redo"> · làm lại {times - 1}</span>}
    </span>
  );
}

function SpeakingBoard({
  board,
  onBack,
  onSpeak,
  actions,
  onKeep,
  onDiscard,
  onPractice,
  levelBadge,
  conversation,
}) {
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
      onPractice?.(board.id);
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
        <span className="speaking-level-badge">
          {levelBadge || "A2 · GOETHE SPRECHEN TEIL 2"}
        </span>
        {actions}
      </div>

      <div className="speaking-detail-columns">
        <div className="speaking-detail-main">
        <div className="speaking-prompt">
          <span className="vocab-language">
            ĐỀ NÓI TIẾNG ĐỨC
            {board.aiGenerated && (
              <span className="speaking-ai-inline"> (đề do AI tạo)</span>
            )}
          </span>
          <strong>{board.question}</strong>
          {board.schedule ? (
            <ScheduleTable schedule={board.schedule} />
          ) : (
            <ul>
              {board.hints.map((hint, index) => (
                <li key={`${hint}-${index}`}>- {hint}</li>
              ))}
            </ul>
          )}
          {onSpeak && (
            <button
              type="button"
              className="voice-button inline-voice"
              onClick={() => onSpeak(board.question)}
            >
              <Volume2 size={15} /> 
            </button>
          )}
        </div>

        {onKeep && (
          <div className="speaking-ai-save">
            <div>
              <strong>Đề do AI tạo</strong>
              <p>
                {result
                  ? "Bạn đã làm xong đề. Lưu lại để luyện tập sau, hoặc xóa nếu không cần nữa."
                  : "Bạn có thể làm đề ngay, hoặc lưu đề tài này vào danh sách để luyện sau."}
              </p>
            </div>
            <div className="speaking-ai-save-actions">
              <button type="button" className="btn-secondary" onClick={onDiscard}>
                <Trash2 size={14} /> Xóa đề tài
              </button>
              <button type="button" className="btn-primary" onClick={onKeep}>
                <Check size={15} /> Lưu đề tài
              </button>
            </div>
          </div>
        )}

      {conversation ? (
        <ScheduleDialogue board={board} onSpeak={onSpeak} onPractice={onPractice} />
      ) : (
        <>
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
        </>
      )}
        </div>

      {!conversation && followUps.length > 0 && (
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
  onSaveAiTopic,
  onRemove,
  onSpeak,
  onSaveTopic,
  onResetTopic,
  hiddenCount = 0,
  onRestoreHidden,
  practice = {},
  onPractice,
  pageSize = SPEAKING_PAGE_SIZE,
  title = "Luyện nói",
  description = "49 đề tài Goethe A2 có sẵn bên dưới. Chọn đề bất kỳ, tự trả lời bằng tiếng Đức rồi để AI chấm điểm và hỏi tiếp.",
  levelBadge = "A2 · GOETHE SPRECHEN TEIL 2",
  topicContext = "",
  conversation = false,
  footnote = `Trình độ chấm cố định ${SPEAKING_LEVEL} theo Goethe-Zertifikat A2 Sprechen Teil 2. Câu trả lời được gửi tới dịch vụ AI để chấm và tạo câu hỏi phụ.`,
}) {
  const [activeId, setActiveId] = useState("");
  const [lastRandomId, setLastRandomId] = useState("");
  const [view, setView] = useState("list");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [aiDraft, setAiDraft] = useState(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [keptId, setKeptId] = useState("");
  const [page, setPage] = useState(1);
  const activeBoard = boards.find((board) => board.id === activeId);
  const totalPages = Math.max(1, Math.ceil(boards.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageBoards = boards.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (view !== "list" || !keptId) return;
    const index = boards.findIndex((board) => board.id === keptId);
    if (index < 0) return;
    const targetPage = Math.floor(index / pageSize) + 1;
    if (currentPage !== targetPage) {
      setPage(targetPage);
      return;
    }
    document
      .getElementById(`speaking-board-${keptId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [view, keptId, boards, currentPage, pageSize]);

  function goToPage(number) {
    const target = Math.min(Math.max(number, 1), totalPages);
    setPage(target);
    document
      .querySelector(".speaking-grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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

  async function handleGenerateTopic() {
    if (generating) return;
    setGenerating(true);
    setGenerateError("");
    try {
      const generated = await generateSpeakingTopic(
        boards.map((board) => board.question),
        topicContext,
        conversation ? "schedule" : ""
      );
      const topic = conversation
        ? withScheduleFromHints(generated, generated.caption || "Terminplan")
        : generated;
      if (conversation && !topic.schedule) {
        throw new Error("AI chưa tạo được lịch đúng khung giờ. Hãy bấm lại để thử đề khác.");
      }
      setAiDraft({
        ...topic,
        id: `ai-draft-${Date.now()}`,
        aiGenerated: true,
        custom: true,
      });
      setActiveId("");
      setView("ai-draft");
    } catch (err) {
      setGenerateError(err?.message || "Không tạo được đề. Hãy thử lại.");
      setAiDraft(null);
      setActiveId("");
      setView("list");
    } finally {
      setGenerating(false);
    }
  }

  function handleKeepAiTopic() {
    const saved = onSaveAiTopic?.(aiDraft);
    setAiDraft(null);
    setActiveId("");
    setView("list");
    setKeptId(saved?.id || "");
  }

  function handleDiscardAiTopic() {
    setAiDraft(null);
    setConfirmDiscard(false);
    setActiveId("");
    setView("list");
  }

  const actions = (
    <div className="speaking-head-actions">
      <button type="button" className="btn-secondary" onClick={() => setView("overview")}>
        <ListChecks size={16} /> Tổng hợp các đề
      </button>
      <button type="button" className="btn-secondary" onClick={pickRandomBoard}>
        <Shuffle size={16} /> Kiểm tra random
      </button>
      <button
        type="button"
        className="btn-secondary speaking-ai-trigger"
        disabled={generating}
        onClick={handleGenerateTopic}
      >
        {generating ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
        {generating ? "AI đang tạo đề..." : "Tạo đề từ AI"}
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
        practice={practice}
      />
    );
  }

  if (view === "ai-draft" && aiDraft) {
    return (
      <>
        <SpeakingBoard
          key={aiDraft.id}
          board={aiDraft}
          onBack={() => setView("list")}
          onSpeak={onSpeak}
          onKeep={handleKeepAiTopic}
          onDiscard={() => setConfirmDiscard(true)}
          levelBadge={levelBadge}
          conversation={conversation}
        />
        {confirmDiscard && (
          <ConfirmModal
            title="Xóa đề do AI tạo"
            message={`Bạn có muốn xóa đề "${aiDraft.question}" không? Đề sẽ không được lưu vào danh sách Luyện nói.`}
            confirmLabel="Xóa đề"
            onConfirm={handleDiscardAiTopic}
            onClose={() => setConfirmDiscard(false)}
          />
        )}
      </>
    );
  }

  if (activeBoard) {
    return (
      <SpeakingBoard
        key={activeBoard.id}
        board={activeBoard}
        onBack={() => setActiveId("")}
        onSpeak={onSpeak}
        onPractice={onPractice}
        levelBadge={levelBadge}
        conversation={conversation}
      />
    );
  }

  const pagination = totalPages > 1 && (
    <div className="speaking-pagination">
      <span>
        {boards.length} đề tài · Trang {currentPage} / {totalPages}
      </span>
      <div className="speaking-pagination-actions">
        <button
          type="button"
          className="btn-ghost"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          <ArrowLeft size={14} /> Trang trước
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
          <button
            key={number}
            type="button"
            className={`speaking-page-number ${number === currentPage ? "active" : ""}`}
            aria-label={`Trang ${number}`}
            aria-current={number === currentPage ? "page" : undefined}
            onClick={() => goToPage(number)}
          >
            {number}
          </button>
        ))}
        <button
          type="button"
          className="btn-ghost"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Trang sau <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <section className="speaking-page">
      <div className="speaking-head">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actions}
      </div>

      {generateError && (
        <p className="form-error speaking-generate-error">{generateError}</p>
      )}

      <div className="speaking-grid">
        {pageBoards.map((board, index) => (
          <article
            id={`speaking-board-${board.id}`}
            className={`speaking-board ${keptId === board.id ? "ai-kept" : ""}`}
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
                {board.library
                  ? board.label.toUpperCase()
                  : `ĐỀ ${(currentPage - 1) * pageSize + index + 1}`}
                {board.aiGenerated && (
                  <span className="speaking-ai-label"> (đề do AI tạo)</span>
                )}
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
            <PracticeBadge count={practice[board.id]} />
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
      {pagination}
      <p className="speaking-footnote">{footnote}</p>

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
