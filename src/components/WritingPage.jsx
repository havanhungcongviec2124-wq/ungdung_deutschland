import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  ListChecks,
  Loader2,
  Plus,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { checkWriting, countGermanWords, generateWritingTopic, WRITING_LEVEL } from "../lib/aiWriting";
import ConfirmModal from "./modals/ConfirmModal";
import SpeakingOverviewModal from "./modals/SpeakingOverviewModal";

const WRITING_PAGE_SIZE = 20;
// Dưới 15 từ mới là lỗi độ dài; dài hơn khoảng gợi ý (20-30 / 30-40 từ) vẫn được chấp nhận.
const WRITING_MIN_ACCEPTED_WORDS = 15;

function shorten(value, max = 150) {
  const text = String(value || "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

// Đề thư viện có test/part riêng; đề tự thêm thì suy từ dạng bài để vẫn vào đúng nhóm random.
function writingPart(board) {
  const part = Number(board?.part);
  if (part === 1 || part === 2) return part;
  return String(board?.format || "").toLowerCase().includes("sms") ? 1 : 2;
}

function writingTest(board) {
  const test = Number(board?.test);
  if (Number.isInteger(test) && test > 0) return test;
  const match = String(board?.id || "").match(/test[-\s]?(\d+)/i);
  return match ? Number(match[1]) : null;
}

function pickFrom(pool, excludedId = "") {
  const choices = pool.length > 1 ? pool.filter((board) => board.id !== excludedId) : pool;
  return choices[Math.floor(Math.random() * choices.length)] || null;
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

function WritingFeedback({ result }) {
  if (!result) return null;
  return (
    <div className={`speaking-feedback ${result.correct ? "good" : "bad"}`}>
      <div className="speaking-feedback-title">
        {result.correct ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
        <strong>{result.correct ? "Bài viết đạt yêu cầu" : "Bài viết cần sửa"}</strong>
        <span className="writing-score">{result.score}/10</span>
      </div>
      {result.points && (
        <div className="writing-points">
          {result.points.map((covered, index) => (
            <span key={index} className={covered ? "covered" : "missed"}>
              {covered ? <Check size={12} /> : <XCircle size={12} />} Ý {index + 1}
            </span>
          ))}
        </div>
      )}
      {!result.correct && (
        <p>
          <span>Bài gợi ý đã sửa: </span>
          <em>{result.corrected}</em>
        </p>
      )}
      <p>{result.explanation}</p>
    </div>
  );
}

function WritingBoard({
  board,
  onBack,
  actions,
  onKeep,
  onDiscard,
  onPractice,
  levelBadge,
  embedded = false,
  submitLabel = "Nộp bài chấm điểm",
  partLabel = "",
}) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const answerId = `writing-answer-${String(board?.id || "board").replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const wordCount = countGermanWords(answer);
  const minWords = Number(board.minWords) || 20;
  const maxWords = Number(board.maxWords) || 30;
  const tooShort = wordCount > 0 && wordCount < WRITING_MIN_ACCEPTED_WORDS;

  function reset() {
    setAnswer("");
    setError("");
    setResult(null);
  }

  async function submit() {
    if (!answer.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      setResult(await checkWriting(board, answer));
      onPractice?.(board.id);
    } catch (err) {
      setError(err?.message || "Không thể chấm bài. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className={`speaking-page speaking-detail writing-detail ${
        embedded ? "writing-pair-part" : ""
      }`}
    >
      {!embedded && (
        <div className="speaking-head">
          <button type="button" className="btn-ghost" onClick={onBack}>
            <ArrowLeft size={16} /> Danh sách đề tài
          </button>
          <span className="speaking-level-badge">{levelBadge || `A2 · GOETHE SCHREIBEN`}</span>
          {actions}
        </div>
      )}
      {embedded && partLabel && <div className="writing-pair-part-head">{partLabel}</div>}

      <div className="speaking-detail-columns">
        <div className="speaking-detail-main">
          <div className="speaking-prompt">
            <span className="vocab-language">
              ĐỀ VIẾT TIẾNG ĐỨC
              {board.aiGenerated && (
                <span className="speaking-ai-inline"> (đề do AI tạo)</span>
              )}
            </span>
            <span className="writing-format-badge">
              <FileText size={13} /> {board.format || "SMS"} · khuyến nghị {minWords}–{maxWords} từ
            </span>
            <strong>{board.question}</strong>
            <ul>
              {(board.hints || []).map((hint, index) => (
                <li key={`${hint}-${index}`}>- {hint}</li>
              ))}
            </ul>
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

          <div className="speaking-form writing-editor">
            <label htmlFor={answerId}>Bài viết của bạn (tiếng Đức)</label>
            <textarea
              id={answerId}
              rows={10}
              value={answer}
              disabled={loading}
              placeholder="Viết bài bằng tiếng Đức..."
              onChange={(event) => setAnswer(event.target.value)}
            />
            <div className="speaking-form-actions">
              <span className={tooShort ? "writing-word-count warn" : "writing-word-count"}>
                {tooShort
                  ? `${wordCount} từ · cần tối thiểu ${WRITING_MIN_ACCEPTED_WORDS} từ`
                  : `${wordCount} từ`}
              </span>
              <div className="writing-editor-actions">
                {result && (
                  <button type="button" className="btn-ghost" onClick={reset}>
                    <RotateCcw size={14} /> Làm lại
                  </button>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!answer.trim() || loading}
                  onClick={submit}
                >
                  {loading ? <Loader2 size={15} className="spin" /> : <FileText size={15} />}
                  {loading ? "AI đang chấm..." : submitLabel}
                </button>
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>

          {result && <WritingFeedback result={result} />}
        </div>
      </div>
    </section>
  );
}

export default function WritingPage({
  boards,
  onAdd,
  onSaveAiTopic,
  onRemove,
  onSaveTopic,
  onResetTopic,
  hiddenCount = 0,
  onRestoreHidden,
  practice = {},
  onPractice,
  pageSize = WRITING_PAGE_SIZE,
}) {
  const [activeId, setActiveId] = useState("");
  const [lastRandomId, setLastRandomId] = useState("");
  const [lastRandomTest, setLastRandomTest] = useState("");
  const [randomMenuOpen, setRandomMenuOpen] = useState(false);
  const [randomPair, setRandomPair] = useState(null);
  const [randomError, setRandomError] = useState("");
  const [view, setView] = useState("list");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);
  const [aiPair, setAiPair] = useState(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [keptId, setKeptId] = useState("");
  const [page, setPage] = useState(1);

  const activeBoard = boards.find((board) => board.id === activeId);
  const totalPages = Math.max(1, Math.ceil(boards.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageBoards = boards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, totalPages]);

  // Nếu một trong hai đề bị xóa mất khi đang mở cặp random, quay về danh sách.
  useEffect(() => {
    if (view !== "random-pair" || !randomPair?.ids) return;
    const remaining = boards.filter((board) => randomPair.ids.includes(board.id)).length;
    if (remaining !== 2) {
      setRandomPair(null);
      setView("list");
    }
  }, [view, randomPair, boards]);

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
      .getElementById(`writing-board-${keptId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [view, keptId, boards, currentPage, pageSize]);

  // Menu random và menu tạo đề AI đóng khi bấm ra ngoài hoặc nhấn Escape.
  useEffect(() => {
    if (!randomMenuOpen && !aiMenuOpen) return;
    const closeOnOutside = (event) => {
      if (!event.target?.closest?.(".writing-random-wrap")) {
        setRandomMenuOpen(false);
        setAiMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setRandomMenuOpen(false);
        setAiMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [randomMenuOpen, aiMenuOpen]);

  function goToPage(number) {
    const target = Math.min(Math.max(number, 1), totalPages);
    setPage(target);
    document
      .querySelector(".speaking-grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleRandom(mode) {
    setRandomMenuOpen(false);
    setRandomError("");

    if (mode === "both") {
      const groups = new Map();
      for (const board of boards) {
        const test = writingTest(board);
        if (!test) continue;
        if (!groups.has(test)) groups.set(test, {});
        const part = writingPart(board);
        if (!groups.get(test)[part]) groups.get(test)[part] = board;
      }
      const pairs = [...groups.entries()]
        .filter(([, parts]) => parts[1] && parts[2])
        .map(([test, parts]) => ({
          test,
          boards: [parts[1], parts[2]],
          ids: [parts[1].id, parts[2].id],
        }));
      if (!pairs.length) {
        setRandomError("Không tìm thấy cặp đề Teil 1 và Teil 2 cùng một Test.");
        return;
      }
      const choices =
        pairs.length > 1 ? pairs.filter((item) => String(item.test) !== lastRandomTest) : pairs;
      const picked = choices[Math.floor(Math.random() * choices.length)];
      setLastRandomTest(String(picked.test));
      setRandomPair(picked);
      setActiveId("");
      setView("random-pair");
      return;
    }

    const wantedPart = mode === "email2" ? 2 : 1;
    const pool = boards.filter((board) => writingPart(board) === wantedPart);
    const picked = pickFrom(pool, lastRandomId);
    if (!picked) {
      setRandomError(wantedPart === 2 ? "Không có đề Teil 2 nào." : "Không có đề Teil 1 nào.");
      return;
    }
    setLastRandomId(picked.id);
    setRandomPair(null);
    setActiveId(picked.id);
    setView("list");
  }

  async function handleGenerateTopic(mode) {
    if (generating) return;
    setAiMenuOpen(false);
    setGenerating(true);
    setGenerateError("");
    const excluded = boards.map((board) => board.question);
    try {
      if (mode === "both") {
        const sms = await generateWritingTopic(excluded, "sms1");
        const email = await generateWritingTopic([...excluded, sms.question], "email2");
        const stamp = Date.now();
        setAiPair({
          boards: [
            {
              ...sms,
              part: 1,
              id: `ai-draft-${stamp}-1`,
              label: "Teil 1",
              aiGenerated: true,
              custom: true,
            },
            {
              ...email,
              part: 2,
              id: `ai-draft-${stamp}-2`,
              label: "Teil 2",
              aiGenerated: true,
              custom: true,
            },
          ],
        });
        setAiDraft(null);
        setActiveId("");
        setRandomPair(null);
        setView("ai-pair");
        return;
      }
      const part = mode === "email2" ? 2 : 1;
      const generated = await generateWritingTopic(
        excluded,
        part === 2 ? "email2" : "sms1"
      );
      setAiDraft({
        ...generated,
        part,
        id: `ai-draft-${Date.now()}`,
        label: "ĐỀ DO AI TẠO",
        aiGenerated: true,
        custom: true,
      });
      setAiPair(null);
      setActiveId("");
      setRandomPair(null);
      setView("ai-draft");
    } catch (err) {
      setGenerateError(err?.message || "Không tạo được đề. Hãy thử lại.");
      setAiDraft(null);
      setAiPair(null);
      setActiveId("");
      setView("list");
    } finally {
      setGenerating(false);
    }
  }

  function handleKeepAiPair() {
    const saved = (aiPair?.boards || [])
      .map((board) => onSaveAiTopic?.(board))
      .filter(Boolean);
    setAiPair(null);
    setAiDraft(null);
    setActiveId("");
    setRandomPair(null);
    setView("list");
    setKeptId(saved[0]?.id || "");
  }

  function handleKeepAiTopic() {
    const saved = onSaveAiTopic?.(aiDraft);
    setAiDraft(null);
    setActiveId("");
    setRandomPair(null);
    setView("list");
    setKeptId(saved?.id || "");
  }

  function handleDiscardAiTopic() {
    setAiDraft(null);
    setAiPair(null);
    setConfirmDiscard(false);
    setActiveId("");
    setRandomPair(null);
    setView("list");
  }

  const actions = (
    <div className="speaking-head-actions">
      <button type="button" className="btn-secondary" onClick={() => setView("overview")}>
        <ListChecks size={16} /> Tổng hợp các đề
      </button>
      <div className="writing-random-wrap">
        <button
          type="button"
          className="btn-secondary"
          aria-haspopup="menu"
          aria-expanded={randomMenuOpen}
          onClick={() => setRandomMenuOpen((open) => !open)}
        >
          <Shuffle size={16} /> Kiểm tra random
        </button>
        {randomMenuOpen && (
          <div className="writing-random-menu" role="menu" aria-label="Chọn kiểu kiểm tra random">
            <button type="button" role="menuitem" onClick={() => handleRandom("sms1")}>
              Đề SMS teil 1
            </button>
            <button type="button" role="menuitem" onClick={() => handleRandom("email2")}>
              Đề Email teil 2
            </button>
            <button type="button" role="menuitem" onClick={() => handleRandom("both")}>
              Cả SMS và Email
            </button>
          </div>
        )}
      </div>
      <div className="writing-random-wrap">
        <button
          type="button"
          className="btn-secondary speaking-ai-trigger"
          aria-haspopup="menu"
          aria-expanded={aiMenuOpen}
          disabled={generating}
          onClick={() => setAiMenuOpen((open) => !open)}
        >
          {generating ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
          {generating ? "AI đang tạo đề..." : "Tạo đề từ AI"}
          <ChevronDown size={14} />
        </button>
        {aiMenuOpen && (
          <div className="writing-random-menu" role="menu" aria-label="Chọn kiểu đề AI tạo">
            <button type="button" role="menuitem" onClick={() => handleGenerateTopic("sms1")}>
              Đề SMS teil 1
            </button>
            <button type="button" role="menuitem" onClick={() => handleGenerateTopic("email2")}>
              Đề Email teil 2
            </button>
            <button type="button" role="menuitem" onClick={() => handleGenerateTopic("both")}>
              Cả SMS và Email
            </button>
          </div>
        )}
      </div>
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
        writingMode
      />
    );
  }

  if (view === "ai-draft" && aiDraft) {
    return (
      <>
        <WritingBoard
          key={aiDraft.id}
          board={aiDraft}
          onBack={() => setView("list")}
          onKeep={handleKeepAiTopic}
          onDiscard={() => setConfirmDiscard(true)}
        />
        {confirmDiscard && (
          <ConfirmModal
            title="Xóa đề do AI tạo"
            message={`Bạn có muốn xóa đề "${aiDraft.question}" không? Đề sẽ không được lưu vào danh sách Luyện viết.`}
            confirmLabel="Xóa đề"
            onConfirm={handleDiscardAiTopic}
            onClose={() => setConfirmDiscard(false)}
          />
        )}
      </>
    );
  }

  if (view === "ai-pair" && aiPair?.boards?.length === 2) {
    return (
      <section className="speaking-page writing-page writing-pair">
        <div className="speaking-head">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setAiPair(null);
              setView("list");
            }}
          >
            <ArrowLeft size={16} /> Danh sách đề tài
          </button>
          <span className="speaking-level-badge">A2 · GOETHE SCHREIBEN · ĐỀ AI TẠO</span>
          <div className="speaking-ai-save-actions">
            <button type="button" className="btn-secondary" onClick={() => setConfirmDiscard(true)}>
              <Trash2 size={14} /> Xóa đề tài
            </button>
            <button type="button" className="btn-primary" onClick={handleKeepAiPair}>
              <Check size={15} /> Lưu 2 đề
            </button>
          </div>
        </div>

        <div className="writing-pair-intro">
          <strong>Cả SMS và Email (đề do AI tạo)</strong>
          <span>
            Teil 1 SMS ở trên, Teil 2 E-Mail ở dưới; mỗi phần có ô nhập và nút chấm điểm riêng.
          </span>
        </div>

        {aiPair.boards.map((board, index) => (
          <WritingBoard
            key={board.id}
            board={board}
            embedded
            partLabel={`${board.label || `Teil ${index + 1}`} · ${board.format || "SMS"}`}
            submitLabel={`Chấm điểm Teil ${index + 1}`}
          />
        ))}
        {confirmDiscard && (
          <ConfirmModal
            title="Xóa đề do AI tạo"
            message="Bạn có muốn xóa 2 đề vừa tạo không? Các đề sẽ không được lưu vào danh sách Luyện viết."
            confirmLabel="Xóa đề"
            onConfirm={handleDiscardAiTopic}
            onClose={() => setConfirmDiscard(false)}
          />
        )}
      </section>
    );
  }

  // Lấy lại đề mới nhất từ boards để sửa/xóa trong Tổng hợp vẫn phản ánh đúng đề đang làm.
  const pairBoards = randomPair?.ids
    ? randomPair.ids.map((id) => boards.find((board) => board.id === id)).filter(Boolean)
    : [];

  if (view === "random-pair" && pairBoards.length === 2) {
    return (
      <section className="speaking-page writing-page writing-pair">
        <div className="speaking-head">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setRandomPair(null);
              setView("list");
            }}
          >
            <ArrowLeft size={16} /> Danh sách đề tài
          </button>
          <span className="speaking-level-badge">
            A2 · GOETHE SCHREIBEN · TEST {randomPair.test}
          </span>
        </div>

        <div className="writing-pair-intro">
          <strong>Đề random: TEST {randomPair.test}</strong>
          <span>
            Đúng Teil 1 và Teil 2 của cùng một Test. Teil 1 ở trên, Teil 2 ở dưới; mỗi phần có ô
            nhập và nút chấm điểm riêng.
          </span>
        </div>

        {pairBoards.map((board, index) => (
          <WritingBoard
            key={board.id}
            board={board}
            embedded
            partLabel={`${board.label || `Teil ${index + 1}`} · ${board.format || "SMS"}`}
            submitLabel={`Chấm điểm Teil ${index + 1}`}
            onPractice={() => onPractice?.(board.id)}
          />
        ))}
      </section>
    );
  }

  if (activeBoard) {
    return (
      <WritingBoard
        key={activeBoard.id}
        board={activeBoard}
        onBack={() => setActiveId("")}
        onPractice={onPractice}
        levelBadge={`A2 · GOETHE SCHREIBEN`}
      />
    );
  }

  const pagination = totalPages > 1 && (
    <div className="speaking-pagination">
      <span>
        {boards.length} đề viết · Trang {currentPage} / {totalPages}
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
    <section className="speaking-page writing-page">
      <div className="speaking-head">
        <div>
          <h1>Luyện viết SMS và Thư</h1>
          <p>
            120 đề Goethe A2 Schreiben trích từ bộ NOI VIET A2 (60 Test × 2 phần). Chọn đề, viết bài
            tiếng Đức rồi gửi cho AI chấm theo 3 ý, số từ và ngữ pháp; giải thích bằng tiếng Việt.
          </p>
        </div>
        {actions}
      </div>

      {generateError && <p className="form-error speaking-generate-error">{generateError}</p>}
      {randomError && <p className="form-error speaking-generate-error">{randomError}</p>}

      <div className="speaking-grid">
        {pageBoards.map((board, index) => (
          <article
            id={`writing-board-${board.id}`}
            className={`speaking-board writing-board ${keptId === board.id ? "ai-kept" : ""}`}
            key={board.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              setRandomPair(null);
              setActiveId(board.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setRandomPair(null);
                setActiveId(board.id);
              }
            }}
          >
            <div className="speaking-board-top">
              <span className="speaking-board-label">
                {board.label || `ĐỀ ${(currentPage - 1) * pageSize + index + 1}`}
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
            <span className="writing-format-badge">
              <FileText size={12} /> {board.format || "SMS"} · khuyến nghị {board.minWords || 20}–{board.maxWords || 30} từ
            </span>
            <strong className="writing-card-question">{shorten(board.question)}</strong>
            <ul>
              {(board.hints || []).slice(0, 3).map((hint, hintIndex) => (
                <li key={`${hint}-${hintIndex}`}>- {hint}</li>
              ))}
            </ul>
            <span className="speaking-board-cta">Bắt đầu viết →</span>
          </article>
        ))}
      </div>
      {pagination}
      <p className="speaking-footnote">
        Trình độ chấm cố định {WRITING_LEVEL} theo Goethe-Zertifikat A2 Schreiben. Bài viết được gửi
        tới dịch vụ AI để chấm 3 ý, độ dài và ngữ pháp; không lưu bài viết của bạn vào thiết bị.
      </p>

      {deleteTarget && (
        <ConfirmModal
          title="Xóa đề tài"
          message={`Bạn có muốn xóa đề "${shorten(deleteTarget.question, 90)}" không? Đề sẽ biến mất khỏi danh sách Luyện viết.`}
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
