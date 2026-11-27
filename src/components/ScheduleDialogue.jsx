import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, Volume2 } from "lucide-react";
import { chatSchedule } from "../lib/aiSchedule";
import ScheduleTable from "./ScheduleTable";

function otherSide(side) {
  return side === "A" ? "B" : "A";
}

function isActivitySheet(sheet) {
  return Array.isArray(sheet?.items) && sheet.items.length > 0;
}

function createSession() {
  const userSide = Math.random() < 0.5 ? "A" : "B";
  const aiSide = otherSide(userSide);
  return {
    userSide,
    aiSide,
    opener: Math.random() < 0.5 ? userSide : aiSide,
    reporter: Math.random() < 0.5 ? userSide : aiSide,
  };
}

export default function ScheduleDialogue({ board, onSpeak, onPractice }) {
  const [session, setSession] = useState(createSession);
  const [round, setRound] = useState(0);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [reportDraft, setReportDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [awaitingReport, setAwaitingReport] = useState(false);
  const [agreement, setAgreement] = useState("");
  const [agreementTranslation, setAgreementTranslation] = useState("");
  const bottomRef = useRef(null);
  const onPracticeRef = useRef(onPractice);

  useEffect(() => {
    onPracticeRef.current = onPractice;
  }, [onPractice]);

  const userSheet = board.sheets?.[session.userSide] || board.schedule || null;
  const aiSheet = board.sheets?.[session.aiSide] || board.schedule || null;
  const activityMode = isActivitySheet(userSheet) || isActivitySheet(aiSheet);

  function applyReply(reply, previous, lastWasUser) {
    const withFeedback = lastWasUser
      ? previous.map((item, index) =>
          index === previous.length - 1 ? { ...item, explanation: reply.explanation } : item
        )
      : previous;
    setMessages([
      ...withFeedback,
      {
        side: session.aiSide,
        role: "ai",
        text: reply.message,
        translation: reply.translation,
        userTranslation: reply.userTranslation,
        explanation: reply.explanation,
      },
    ]);
    setAwaitingReport(Boolean(reply.awaitingReport));
    if (reply.done) {
      setDone(true);
      setAgreement(reply.agreement);
      setAgreementTranslation(
        reply.reporter === session.userSide ? reply.userTranslation : reply.translation
      );
      onPracticeRef.current?.(board.id);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setDraft("");
    setReportDraft("");
    setError("");
    setDone(false);
    setAwaitingReport(false);
    setAgreement("");
    setAgreementTranslation("");
    if (session.opener !== session.aiSide) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    chatSchedule({
      question: board.question,
      sheets: board.sheets,
      history: [],
      userSide: session.userSide,
      opener: session.opener,
      reporter: session.reporter,
    })
      .then((reply) => {
        if (!cancelled) applyReply(reply, [], false);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "AI chưa mở lời được. Hãy thử lại.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // applyReply chỉ dùng state Phiên hiện tại; session/board/round đã đủ làm dependency.
  }, [board, session, round]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, loading]);

  function restart() {
    setSession(createSession());
    setRound((value) => value + 1);
  }

  async function sendUserMessage() {
    const text = draft.trim();
    if (!text || loading || done || awaitingReport) return;
    const next = [...messages, { side: session.userSide, role: "user", text }];
    const previous = messages;
    setMessages(next);
    setDraft("");
    setLoading(true);
    setError("");
    try {
      const reply = await chatSchedule({
        question: board.question,
        sheets: board.sheets,
        history: next.map(({ side, role, text: value }) => ({ side, role, text: value })),
        userSide: session.userSide,
        opener: session.opener,
        reporter: session.reporter,
      });
      applyReply(reply, next, true);
    } catch (err) {
      setMessages(previous);
      setDraft(text);
      setError(err?.message || "AI chưa phản hồi được. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function submitFinalReport() {
    const text = reportDraft.trim();
    if (!text || loading) return;
    const next = [...messages, { side: session.userSide, role: "user", text }];
    const previous = messages;
    setMessages(next);
    setLoading(true);
    setError("");
    try {
      const reply = await chatSchedule({
        question: board.question,
        sheets: board.sheets,
        history: next.map(({ side, role, text: value }) => ({ side, role, text: value })),
        userSide: session.userSide,
        opener: session.opener,
        reporter: session.reporter,
        finalReport: true,
      });
      const withFeedback = next.map((item, index) =>
        index === next.length - 1 ? { ...item, explanation: reply.explanation } : item
      );
      setMessages([
        ...withFeedback,
        {
          side: session.aiSide,
          role: "ai",
          text: reply.message,
          translation: reply.translation,
          explanation: reply.explanation,
        },
      ]);
      setAwaitingReport(false);
      setDone(true);
      setAgreement(reply.agreement || text);
      setAgreementTranslation(reply.userTranslation || reply.translation);
      onPracticeRef.current?.(board.id);
    } catch (err) {
      setMessages(previous);
      setReportDraft(text);
      setError(err?.message || "AI chưa chấm được câu báo cáo. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  }

  function toggleTranslation(index) {
    setMessages((current) =>
      current.map((message, messageIndex) =>
        messageIndex === index ? { ...message, showVi: !message.showVi } : message
      )
    );
  }

  const turnHint = done
    ? "Đã xong hội thoại."
    : loading
      ? "AI đang nói..."
      : awaitingReport
        ? `Đến lượt bạn báo cáo cho giám khảo với tư cách Kandidat ${session.userSide}.`
        : !messages.length
          ? session.opener === session.userSide
            ? `Bạn mở lời trước với tư cách Kandidat ${session.userSide}.`
            : `Kandidat ${session.aiSide} (AI) mở lời trước.`
          : messages[messages.length - 1].side === session.aiSide
            ? `Đến lượt bạn nói, Kandidat ${session.userSide}.`
            : `Đang chờ Kandidat ${session.aiSide} (AI) trả lời.`;

  return (
    <div className="schedule-dialogue">
      <div className="schedule-sheets">
        <div className="schedule-sheet">
          <div className="schedule-sheet-head">
            <span>PHIẾU CỦA BẠN · Kandidat {session.userSide}</span>
            <p>
              Đọc khoảng <strong>20 giây</strong>. Đây là {activityMode ? "các gợi ý bạn nên dùng" : "lịch bạn phải giữ"} trong hội thoại.
            </p>
          </div>
          <ScheduleTable schedule={userSheet} />
        </div>
        <div className="schedule-sheet schedule-sheet-ai">
          <div className="schedule-sheet-head">
            <span>PHIẾU CỦA AI · Kandidat {session.aiSide}</span>
            <p>
              Cả hai phiếu đều được hiện để bạn tiện đối chiếu; AI vẫn đóng vai theo đúng phiếu của
              mình.
            </p>
          </div>
          <ScheduleTable schedule={aiSheet} />
        </div>
      </div>

      <div className="schedule-dialogue-head">
        <div>
          <h2>Hội thoại chốt {activityMode ? "hoạt động" : "lịch"}</h2>
          <p>
            {session.opener === session.userSide
              ? `Bạn mở lời trước. Sau đó hai bên thay phiên bằng tiếng Đức cho đến khi chốt được ${activityMode ? "một hoạt động chung" : "thời gian"}.`
              : `Kandidat ${session.aiSide} (AI) mở lời trước. Bạn trả lời bằng tiếng Đức, hai bên thay phiên cho đến khi chốt được ${activityMode ? "một hoạt động chung" : "thời gian"}.`}{" "}
            {session.reporter === session.userSide
              ? "Cuối cùng bạn sẽ báo cáo thỏa thuận cho giám khảo."
              : `Cuối cùng Kandidat ${session.reporter} sẽ báo cáo thỏa thuận cho giám khảo.`}
          </p>
        </div>
        <button type="button" className="btn-ghost" onClick={restart}>
          <RotateCcw size={14} /> Đổi vai &amp; lượt mở lời
        </button>
      </div>

      <div className="schedule-turn-hint">{turnHint}</div>

      <div className="schedule-chat">
        {messages.map((item, index) => {
          const canTranslate = Boolean(
            item.translation || item.userTranslation || item.explanation
          );
          return (
            <div className={`chat-bubble ${item.role}`} key={`${item.side}-${index}`}>
              <span className="chat-who">
                Kandidat {item.side} · {item.side === session.userSide ? "Bạn" : "AI"}
              </span>
              <strong>{item.text}</strong>
              <div className="chat-bubble-actions">
                {canTranslate && (
                  <button
                    type="button"
                    className="chat-translate-button"
                    aria-expanded={Boolean(item.showVi)}
                    onClick={() => toggleTranslation(index)}
                  >
                    {item.showVi ? "Ẩn bản dịch" : "Dịch"}
                  </button>
                )}
                {item.role === "ai" && onSpeak && (
                  <button
                    type="button"
                    className="voice-button chat-voice"
                    onClick={() => onSpeak(item.text)}
                  >
                    <Volume2 size={13} />
                  </button>
                )}
              </div>
              {item.showVi && (
                <div className="chat-vi-panel">
                  {item.translation && (
                    <small className="chat-translation">🇻🇳 {item.translation}</small>
                  )}
                  {item.userTranslation && (
                    <small className="chat-translation">🇻🇳 Câu của bạn: {item.userTranslation}</small>
                  )}
                  {item.explanation && (
                    <small className="chat-explanation">💡 {item.explanation}</small>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {loading && <div className="chat-typing">AI đang suy nghĩ...</div>}
        <div ref={bottomRef} />
      </div>

      {error && <p className="form-error">{error}</p>}

      {done ? (
        <div className="schedule-agreement">
          <CheckCircle2 size={18} />
          <div>
            <strong>
              Đã chốt {activityMode ? "thỏa thuận" : "lịch"} · Kandidat {session.reporter} báo cáo
            </strong>
            <p>{agreement}</p>
            {agreementTranslation && <small>🇻🇳 {agreementTranslation}</small>}
          </div>
          <button type="button" className="btn-secondary" onClick={restart}>
            Luyện lại
          </button>
        </div>
      ) : awaitingReport ? (
        <div className="speaking-form schedule-report-form">
          <label htmlFor="schedule-report-input">
            Báo cáo thỏa thuận cho giám khảo (tiếng Đức)
          </label>
          <textarea
            id="schedule-report-input"
            rows={3}
            value={reportDraft}
            disabled={loading}
            placeholder="Wir haben uns darauf geeinigt, dass wir uns am Freitag um 11.00 Uhr treffen."
            onChange={(event) => setReportDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                submitFinalReport();
              }
            }}
          />
          <div className="speaking-form-actions">
            <span>{reportDraft.trim().length} ký tự · Ctrl/⌘ + Enter để gửi</span>
            <button
              type="button"
              className="btn-primary"
              disabled={!reportDraft.trim() || loading}
              onClick={submitFinalReport}
            >
              {loading ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
              {loading ? "Đang chấm..." : "Gửi báo cáo"}
            </button>
          </div>
        </div>
      ) : (
        <div className="speaking-form">
          <label htmlFor="schedule-dialogue-input">Câu trả lời của bạn (tiếng Đức)</label>
          <textarea
            id="schedule-dialogue-input"
            rows={3}
            value={draft}
            disabled={loading}
            placeholder={
              !messages.length && session.opener === session.userSide
                ? "Mở lời bằng tiếng Đức, ví dụ: Hallo! Wann hast du am Freitag Zeit?"
                : "Viết câu trả lời tiếng Đức để tiếp tục..."
            }
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                sendUserMessage();
              }
            }}
          />
          <div className="speaking-form-actions">
            <span>{draft.trim().length} ký tự · Ctrl/⌘ + Enter để gửi</span>
            <button
              type="button"
              className="btn-primary"
              disabled={!draft.trim() || loading}
              onClick={sendUserMessage}
            >
              {loading ? <Loader2 size={15} className="spin" /> : <Volume2 size={15} />}
              {loading ? "Đang chờ AI..." : "Gửi lượt này"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
