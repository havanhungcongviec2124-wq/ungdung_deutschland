import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Headphones,
  Lightbulb,
  Mic,
  PenLine,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from "lucide-react";
import { EXAM_LEVELS, GRAMMAR_PASS, GRAMMAR_TOTAL, SKILL_PASS_TOTAL, SPEAKING_MIN_FROM_A22, getExamLevel } from "../lib/examLevels";
import { countGermanWords } from "../lib/aiWriting";

const SECTION_ICONS = {
  grammar: BookOpenCheck,
  listening: Headphones,
  reading: ClipboardCheck,
  writing: PenLine,
  speaking: Mic,
  rewrite: PenLine,
  cards: Sparkles,
};

function German({ children, className = "" }) {
  return <span className={`exam-german ${className}`}>{children}</span>;
}

function LevelPicker({ flow }) {
  const selected = getExamLevel(flow.levelId);
  return (
    <div className="exam-page">
      <div className="exam-hero">
        <div>
          <div className="exam-eyebrow">LÀM BÀI TEST · 6 TRÌNH ĐỘ</div>
          <h1 className="section-title">Chọn trình độ bạn muốn thi thử</h1>
          <p className="exam-lead">
            Mỗi trình độ có cấu trúc đề riêng, câu hỏi được lấy ngẫu nhiên từ ngân hàng đề.
            Bạn làm từng phần theo thứ tự, AI chấm các bài viết và bài nói bằng tiếng Việt,
            còn ngữ pháp, nghe và đọc được chấm ngay trên thiết bị.
          </p>
        </div>
        <div className="exam-rule-card">
          <strong>Quy định chung</strong>
          <ul>
            <li>Grammatik 25 câu, đỗ riêng từ {GRAMMAR_PASS}/{GRAMMAR_TOTAL} câu, không cộng vào tổng điểm.</li>
            <li>Từ A2.1: 4 kỹ năng mỗi kỹ năng /25, tổng /100, đỗ từ {SKILL_PASS_TOTAL}/100.</li>
            <li>Từ A2.2: cần thêm Sprechen ≥ {SPEAKING_MIN_FROM_A22}/25 dù tổng đã đạt.</li>
          </ul>
        </div>
      </div>

      <div className="exam-level-grid">
        {EXAM_LEVELS.map((level) => {
          const active = level.id === flow.levelId;
          return (
            <button
              type="button"
              key={level.id}
              className={`exam-level-card ${active ? "active" : ""}`}
              onClick={() => flow.selectLevel(level.id)}
            >
              <div className="exam-level-top">
                <span className="exam-level-badge">{level.label}</span>
                <span className="exam-level-name">{level.name}</span>
              </div>
              <p className="exam-level-summary">{level.summary}</p>
              <ul className="exam-level-structure">
                {level.structure.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <span className="exam-level-select">{active ? "Đã chọn" : "Chọn trình độ"}</span>
            </button>
          );
        })}
      </div>

      <div className="exam-start-row">
        {selected ? (
          <p className="exam-selected-note">
            Bạn đã chọn <strong>{selected.label}</strong> · {selected.summary}. Nhấn nút bên phải để bắt đầu.
          </p>
        ) : (
          <p className="exam-selected-note">Chọn một trình độ ở trên để xem cấu trúc đề trước khi làm bài.</p>
        )}
        <button type="button" className="btn-primary" disabled={!selected} onClick={flow.startExam}>
          Bắt đầu làm bài <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function McqList({ questions, answers, onAnswer, start = 1 }) {
  return (
    <div className="exam-question-list">
      {questions.map((question, index) => (
        <div className="exam-question" key={question.id}>
          <div className="exam-question-head">
            <span className="exam-question-number">Câu {start + index}</span>
            <German>{question.text}</German>
          </div>
          <div className="exam-options">
            {question.options.map((option, optionIndex) => (
              <button
                type="button"
                key={`${question.id}-${optionIndex}`}
                className={`exam-option ${answers[question.id] === option ? "selected" : ""}`}
                onClick={() => onAnswer(question.id, option)}
              >
                <span className="exam-option-key">{String.fromCharCode(65 + optionIndex)}</span>
                <German>{option}</German>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GrammarView({ section, state, onAnswer }) {
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const totalPages = Math.ceil(section.questions.length / pageSize);
  const questions = section.questions.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <div>
      <div className="exam-subnav">
        <span>Trang {page + 1} / {totalPages}</span>
        <div className="exam-subnav-buttons">
          <button type="button" className="btn-secondary btn-small" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ArrowLeft size={14} /> Trước
          </button>
          <button type="button" className="btn-secondary btn-small" disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Sau <ArrowRight size={14} />
          </button>
        </div>
      </div>
      <McqList questions={questions} answers={state.answers} onAnswer={onAnswer} start={page * pageSize + 1} />
    </div>
  );
}

function ListeningView({ section, state, onAnswer, onSpeak }) {
  return (
    <div className="exam-clip-list">
      {section.clips.map((clip, index) => (
        <div className="exam-clip" key={clip.id}>
          <div className="exam-clip-head">
            <div>
              <strong>Đoạn {index + 1}</strong>
              <p className="exam-muted">Nghe bản ghi rồi trả lời 3 câu bên dưới. Transcript chỉ hiện ở trang kết quả.</p>
            </div>
            <button type="button" className="btn-secondary" onClick={() => onSpeak(clip.script)}>
              <Volume2 size={16} /> Nghe lại
            </button>
          </div>
          <McqList questions={clip.questions} answers={state.answers} onAnswer={onAnswer} />
        </div>
      ))}
    </div>
  );
}

function ReadingView({ section, state, onAnswer }) {
  return (
    <div className="exam-clip-list">
      {section.texts.map((text, index) => (
        <div className="exam-clip" key={text.id}>
          <div className="exam-clip-head">
            <strong>Đoạn {index + 1}</strong>
          </div>
          <div className="exam-reading-text">
            <German>{text.text}</German>
          </div>
          <McqList questions={text.questions} answers={state.answers} onAnswer={onAnswer} />
        </div>
      ))}
    </div>
  );
}

function GradeCard({ task, grade }) {
  if (!grade) return null;
  return (
    <div className={`exam-grade ${grade.score >= 15 ? "good" : "weak"}`}>
      <div className="exam-grade-head">
        <strong>{task.label || "Kết quả chấm"}</strong>
        <span className="exam-grade-score">{grade.score}/25</span>
      </div>
      <div className="exam-grade-grid">
        <div>
          <span className="exam-feedback-label">Câu đã sửa đúng bằng tiếng Đức</span>
          <German className="exam-feedback-german">{grade.corrected}</German>
        </div>
        <div>
          <span className="exam-feedback-label">Đáp án mẫu</span>
          <German className="exam-feedback-german">{grade.reference || "—"}</German>
        </div>
      </div>
      {grade.errors.length > 0 && (
        <div className="exam-feedback-block">
          <span className="exam-feedback-label">Lỗi cụ thể</span>
          <ul>{grade.errors.map((error, index) => <li key={index}>{error}</li>)}</ul>
        </div>
      )}
      <p className="exam-feedback-text">{grade.explanation}</p>
      {grade.tips.length > 0 && (
        <div className="exam-feedback-block tips">
          <span className="exam-feedback-label"><Lightbulb size={14} /> Gợi ý cải thiện</span>
          <ul>{grade.tips.map((tip, index) => <li key={index}>{tip}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function BoardView({ boardA, boardB }) {
  if (!boardA || !boardB) return null;
  return (
    <div className="exam-board">
      <div>
        <span className="exam-board-label">PHIẾU CỦA BẠN</span>
        {boardA.map((line, index) => <German key={index}>{line}</German>)}
      </div>
      <div>
        <span className="exam-board-label">PHIẾU CỦA AI</span>
        {boardB.map((line, index) => <German key={index}>{line}</German>)}
      </div>
    </div>
  );
}

function TaskView({ task, section, state, flow, onSpeak }) {
  const answer = state.taskAnswers[task.id] || "";
  const grade = state.grades[task.id];
  const followUps = state.followUps[task.id] || [];
  const followAnswers = state.followUpAnswers[task.id] || {};
  const readOnly = Boolean(grade);

  return (
    <div className="exam-task">
      <div className="exam-task-head">
        <span className="exam-task-label">{task.label || section.title}</span>
        {task.format && <span className="exam-format-badge">{task.format}</span>}
      </div>
      <German className="exam-task-prompt">{task.prompt}</German>
      {task.hints.length > 0 && (
        <ul className="exam-hints">
          {task.hints.map((hint, index) => <li key={index}>{hint}</li>)}
        </ul>
      )}
      <BoardView boardA={task.boardA} boardB={task.boardB} />
      <textarea
        className="exam-textarea"
        value={answer}
        readOnly={readOnly}
        placeholder="Viết câu trả lời tiếng Đức của bạn ở đây…"
        onChange={(event) => flow.setTaskAnswer(task.id, event.target.value)}
      />
      <div className="exam-task-foot">
        <span className="exam-muted">
          {countGermanWords(answer)} từ {task.minWords ? `· gợi ý ${task.minWords}–${task.maxWords} từ` : ""}
        </span>
        <div className="exam-task-actions">
          <button type="button" className="btn-secondary btn-small" onClick={() => onSpeak(task.prompt)}>
            <Play size={14} /> Nghe đề
          </button>
          {section.type === "speaking" && !readOnly && (
            <button
              type="button"
              className="btn-secondary btn-small"
              disabled={flow.busy || !answer.trim() || followUps.length > 0}
              onClick={() => flow.generateFollowUps(section, task)}
            >
              <Sparkles size={14} /> {followUps.length ? "Đã có câu hỏi phụ" : "Tiếp tục hội thoại"}
            </button>
          )}
        </div>
      </div>

      {followUps.length > 0 && (
        <div className="exam-followups">
          <div className="exam-followups-title">AI hỏi thêm {followUps.length} câu · trả lời bằng tiếng Đức</div>
          {followUps.map((followUp, index) => (
            <div className="exam-followup" key={followUp.id}>
              <div className="exam-followup-head">
                <span className="exam-question-number">Câu phụ {index + 1}</span>
                <German>{followUp.question}</German>
              </div>
              {followUp.translation && <p className="exam-muted">Nghĩa: {followUp.translation}</p>}
              {followUp.hint && <p className="exam-muted">Gợi ý: {followUp.hint}</p>}
              <textarea
                className="exam-textarea compact"
                value={followAnswers[followUp.id] || ""}
                readOnly={readOnly}
                placeholder="Trả lời bằng tiếng Đức…"
                onChange={(event) => flow.setFollowUpAnswer(task.id, followUp.id, event.target.value)}
              />
              {state.grades[`${task.id}::${followUp.id}`] && (
                <GradeCard task={{ label: `Câu phụ ${index + 1}` }} grade={state.grades[`${task.id}::${followUp.id}`]} />
              )}
            </div>
          ))}
        </div>
      )}

      {grade && <GradeCard task={task} grade={grade} />}
    </div>
  );
}

function WrittenView({ section, state, flow, onSpeak }) {
  return (
    <div className="exam-task-list">
      {section.tasks.map((task) => (
        <TaskView key={task.id} task={task} section={section} state={state} flow={flow} onSpeak={onSpeak} />
      ))}
    </div>
  );
}

function ExamRunner({ flow, onSpeak }) {
  const { exam, sectionIndex, state } = flow;
  const section = exam.sections[sectionIndex];
  const Icon = SECTION_ICONS[section.type] || ClipboardCheck;
  const isMcq = ["grammar", "listening", "reading"].includes(section.type);
  const graded = isMcq
    ? section.questions.every((question) => Boolean(state.answers[question.id]))
    : Array.isArray(section.tasks) && section.tasks.every((task) => Boolean(state.grades[task.id]));

  function canSubmit() {
    if (isMcq) {
      const missing = section.questions.find((question) => !state.answers[question.id]);
      if (missing) {
        flow.setError("Hãy trả lời tất cả câu hỏi trong phần này trước khi tiếp tục.");
        return false;
      }
      return true;
    }
    const missing = section.tasks.find((task) => !String(state.taskAnswers[task.id] || "").trim());
    if (missing) {
      flow.setError("Hãy trả lời đủ các nhiệm vụ trong phần này trước khi nộp.");
      return false;
    }
    return true;
  }

  async function handlePrimary() {
    if (graded) {
      flow.nextSection();
      return;
    }
    if (!canSubmit()) return;
    if (isMcq) {
      flow.nextSection();
      return;
    }
    await flow.gradeSection(section);
  }

  return (
    <div className="exam-page">
      <div className="exam-runner-head">
        <button type="button" className="btn-secondary btn-small" onClick={flow.exitExam}>
          <ArrowLeft size={14} /> Đổi trình độ
        </button>
        <div className="exam-runner-title">
          <span className="exam-level-badge">{exam.levelId}</span>
          <h1 className="section-title">{section.title}</h1>
        </div>
        <span className="exam-progress-label">
          Phần {sectionIndex + 1} / {exam.sections.length}
        </span>
      </div>

      <div className="exam-progress-track">
        {exam.sections.map((item, index) => (
          <span key={item.id} className={index <= sectionIndex ? "active" : ""} />
        ))}
      </div>

      <div className="exam-section-card">
        <div className="exam-section-intro">
          <div className="exam-section-icon"><Icon size={20} /></div>
          <div>
            <div className="exam-section-meta">
              <h2>{section.title}</h2>
              {section.badge && <span className="exam-format-badge">{section.badge}</span>}
            </div>
            <p>{section.description}</p>
          </div>
        </div>

        {flow.error && <div className="exam-error">{flow.error}</div>}

        {section.type === "grammar" && <GrammarView section={section} state={state} onAnswer={flow.setMcqAnswer} />}
        {section.type === "listening" && <ListeningView section={section} state={state} onAnswer={flow.setMcqAnswer} onSpeak={onSpeak} />}
        {section.type === "reading" && <ReadingView section={section} state={state} onAnswer={flow.setMcqAnswer} />}
        {["writing", "speaking", "rewrite", "cards"].includes(section.type) && (
          <WrittenView section={section} state={state} flow={flow} onSpeak={onSpeak} />
        )}

        <div className="exam-runner-foot">
          {sectionIndex > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => flow.setSectionIndex(sectionIndex - 1)}
            >
              <ArrowLeft size={16} /> Phần trước
            </button>
          )}
          <button type="button" className="btn-primary" disabled={flow.busy} onClick={handlePrimary}>
            {flow.busy ? "AI đang chấm…" : graded ? (sectionIndex === exam.sections.length - 1 ? "Xem kết quả" : "Tiếp tục") : isMcq ? "Nộp phần này" : "Chấm phần này"}
            {!flow.busy && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreTile({ title, score, weak }) {
  return (
    <div className={`exam-score-tile ${weak ? "weak" : ""}`}>
      <span>{title}</span>
      <strong>{score}<small>/25</small></strong>
      {weak && <span className="exam-weak-badge">Kỹ năng yếu</span>}
    </div>
  );
}

function ExamResult({ flow, actions }) {
  const result = flow.result;
  const { evaluation } = result;
  const level = getExamLevel(result.levelId);
  const weak = new Set(evaluation.weakSkills || []);
  const sectionsById = Object.fromEntries(result.sections.map((section) => [section.type, section]));

  const suggestions = [];
  if (!evaluation.grammar.passed) suggestions.push("Ôn lại ngữ pháp theo trình độ đã chọn, làm lại phần Grammatik 25 câu.");
  if (weak.has("Hören")) suggestions.push("Nghe lại các đoạn Hören trong bài này và đọc transcript ở phần chi tiết để đối chiếu.");
  if (weak.has("Lesen")) suggestions.push("Luyện đọc đoạn ngắn: đọc to, gạch chân thông tin thời gian, địa điểm và số lượng.");
  if (weak.has("Schreiben")) suggestions.push("Luyện viết SMS/Thư trong mục Luyện viết, chú ý đủ 3 ý của đề.");
  if (weak.has("Sprechen")) suggestions.push("Luyện nói theo chủ đề thẻ từ và phần thống nhất lịch trình để tăng phản xạ.");
  if (!suggestions.length) suggestions.push("Các kỹ năng đã ổn. Hãy thử trình độ tiếp theo để tiếp tục nâng lên.");

  return (
    <div className="exam-page">
      <div className={`exam-verdict ${evaluation.passed ? "passed" : "failed"}`}>
        <div className="exam-verdict-icon">
          {evaluation.passed ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
        </div>
        <div>
          <div className="exam-eyebrow">KẾT QUẢ BÀI THI · {level?.label || result.levelId}</div>
          <h1 className="section-title">{evaluation.passed ? "Đỗ" : "Trượt"}</h1>
          <p>{evaluation.reason}</p>
        </div>
      </div>

      <div className="exam-result-grid">
        <div className="exam-result-panel">
          <h2>Grammatik · điểm riêng</h2>
          <p className="exam-muted">
            {evaluation.grammar.correct}/{GRAMMAR_TOTAL} câu đúng · cần {GRAMMAR_PASS} câu để đỗ phần này.
            Điểm này không cộng vào tổng 4 kỹ năng.
          </p>
          <div className={`exam-grammar-bar ${evaluation.grammar.passed ? "good" : "bad"}`}>
            <span style={{ width: `${(evaluation.grammar.correct / GRAMMAR_TOTAL) * 100}%` }} />
          </div>
          <strong className={evaluation.grammar.passed ? "exam-pass" : "exam-fail"}>
            {evaluation.grammar.passed ? "Đạt Grammatik" : "Chưa đạt Grammatik"}
          </strong>
        </div>

        {evaluation.type === "four-skills" ? (
          <div className="exam-result-panel">
            <h2>Tổng 4 kỹ năng</h2>
            <div className="exam-score-grid">
              <ScoreTile title="Hören" score={evaluation.skills.Hören || 0} weak={weak.has("Hören")} />
              <ScoreTile title="Lesen" score={evaluation.skills.Lesen || 0} weak={weak.has("Lesen")} />
              <ScoreTile title="Schreiben" score={evaluation.skills.Schreiben || 0} weak={weak.has("Schreiben")} />
              <ScoreTile title="Sprechen" score={evaluation.skills.Sprechen || 0} weak={weak.has("Sprechen")} />
            </div>
            <div className="exam-total-row">
              <span>Tổng cộng</span>
              <strong>{evaluation.total}/100</strong>
              <span>ngưỡng đỗ {SKILL_PASS_TOTAL}/100</span>
            </div>
            {["A2.2", "B1.1", "B1.2"].includes(result.levelId) && (
              <p className="exam-muted">Yêu cầu riêng: Sprechen tối thiểu {SPEAKING_MIN_FROM_A22}/25.</p>
            )}
          </div>
        ) : (
          <div className="exam-result-panel">
            <h2>Các bài luyện kỹ năng</h2>
            <div className="exam-score-grid">
              {Object.entries(evaluation.skills).map(([name, value]) => (
                <ScoreTile key={name} title={name} score={Number(typeof value === "object" ? value?.score || 0 : value || 0)} weak={weak.has(name)} />
              ))}
            </div>
            <p className="exam-muted">Trình độ A1 dùng điểm Grammatik làm điều kiện đỗ; các bài kỹ năng ở đây để bạn xem chi tiết lỗi và ôn tập.</p>
          </div>
        )}
      </div>

      <div className="exam-result-panel exam-suggestions">
        <h2><Lightbulb size={18} /> Gợi ý bài học cần ôn tập</h2>
        <ul>{suggestions.map((item, index) => <li key={index}>{item}</li>)}</ul>
        <div className="exam-suggestion-actions">
          <button type="button" className="btn-secondary btn-small" onClick={actions.showCards}>Đến Thẻ từ vựng</button>
          <button type="button" className="btn-secondary btn-small" onClick={actions.showWriting}>Đến Luyện viết</button>
          <button type="button" className="btn-secondary btn-small" onClick={actions.showSpeaking}>Đến Luyện nói</button>
        </div>
      </div>

      <div className="exam-result-panel">
        <h2>Chi tiết lỗi và đáp án mẫu</h2>
        <div className="exam-detail-list">
          {result.sections.map((section) => {
            if (section.type === "grammar") {
              return (
                <div className="exam-detail" key={section.id}>
                  <h3>Grammatik · {section.correct}/{section.total} câu đúng</h3>
                  <p className="exam-muted">Xem lại các câu trắc nghiệm bạn chọn sai khi làm lại bài thi.</p>
                </div>
              );
            }
            if (isMcqDetail(section.type)) {
              const wrong = (section.questions || []).filter((question) => result.answers[question.id] !== question.answer);
              return (
                <div className="exam-detail" key={section.id}>
                  <h3>{section.title} · {section.correct}/{section.total} câu đúng</h3>
                  <div className="exam-error-list">
                    {wrong.slice(0, 5).map((question) => (
                      <div key={question.id}>
                        <German>{question.text}</German>
                        <p>Đáp án đúng: <German>{question.answer}</German></p>
                        <p className="exam-muted">{question.explanation}</p>
                      </div>
                    ))}
                    {wrong.length > 5 && <p className="exam-muted">… và {wrong.length - 5} câu khác.</p>}
                  </div>
                </div>
              );
            }
            return (
              <div className="exam-detail" key={section.id}>
                <h3>{section.title} · {section.score}/25</h3>
                {(section.items || []).map((item) => {
                  const grade = result.grades[item.id];
                  if (!grade) return null;
                  return (
                    <div className="exam-detail-item" key={item.id}>
                      <German className="exam-detail-prompt">{item.prompt}</German>
                      <p className="exam-muted">Bạn viết: <German>{item.answer}</German></p>
                      <GradeCard task={{ label: "Nhận xét của AI" }} grade={grade} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="exam-result-actions">
        <button type="button" className="btn-primary" onClick={flow.startExam}>
          <RotateCcw size={16} /> Làm lại trình độ này
        </button>
        <button type="button" className="btn-secondary" onClick={flow.exitExam}>
          Chọn trình độ khác
        </button>
      </div>
    </div>
  );
}

function isMcqDetail(type) {
  return type === "listening" || type === "reading";
}

export default function ExamPage({ flow, onSpeak = () => {}, actions }) {
  useEffect(() => {
    if (!flow.exam && !flow.result) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [flow.exam, flow.result]);

  if (flow.result) return <ExamResult flow={flow} actions={actions} />;
  if (!flow.exam) return <LevelPicker flow={flow} />;
  return <ExamRunner flow={flow} onSpeak={onSpeak} />;
}
