import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, Volume2 } from "lucide-react";
import { chatSchedule } from "../lib/aiSchedule";

export default function ScheduleDialogue({ board, onSpeak }) {
  // Ai mở lời là ngẫu nhiên cho mỗi lần mở đề.
  const [opener, setOpener] = useState(() => (Math.random() < 0.5 ? "ai" : "user"));
  const [session, setSession] = useState(0);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [agreement, setAgreement] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setDraft("");
    setError("");
    setDone(false);
    setAgreement("");
    if (opener !== "ai") {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    chatSchedule({
      question: board.question,
      schedule: board.schedule,
      history: [],
      opener,
    })
      .then((reply) => {
        if (cancelled) return;
        setMessages([{ role: "ai", text: reply.message, ...reply }]);
        if (reply.done) {
          setDone(true);
          setAgreement(reply.agreement);
        }
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
  }, [board, opener, session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, loading]);

  async function sendUserMessage() {
    const text = draft.trim();
    if (!text || loading || done) return;
    const previous = messages;
    const next = [...previous, { role: "user", text }];
    setMessages(next);
    setDraft("");
    setLoading(true);
    setError("");
    try {
      const reply = await chatSchedule({
        question: board.question,
        schedule: board.schedule,
        history: next.map(({ role, text: value }) => ({ role, text: value })),
        opener,
      });
      const withFeedback = next.map((item, index) =>
        index === next.length - 1 ? { ...item, explanation: reply.explanation } : item
      );
      setMessages([...withFeedback, { role: "ai", text: reply.message, ...reply }]);
      if (reply.done) {
        setDone(true);
        setAgreement(reply.agreement);
      }
    } catch (err) {
      setMessages(previous);
      setDraft(text);
      setError(err?.message || "AI chưa phản hồi được. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setOpener(Math.random() < 0.5 ? "ai" : "user");
    setSession((value) => value + 1);
  }

  return (
    <div className="schedule-dialogue">
      <div className="schedule-dialogue-head">
        <div>
          <h2>Hội thoại chốt lịch</h2>
          <p>
            {opener === "ai"
              ? "AI sẽ mở lời trước. Bạn trả lời bằng tiếng Đức, hai bên thay phiên cho đến khi chốt được thời gian."
              : "Bạn mở lời trước nhé. Sau đó AI sẽ đáp lại bằng tiếng Đức cho đến khi chốt được thời gian."}
          </p>
        </div>
        <button type="button" className="btn-ghost" onClick={restart}>
          <RotateCcw size={14} /> Đổi lượt mở lời
        </button>
      </div>

      <div className="schedule-chat">
        {messages.map((item, index) => {
          const canTranslate = Boolean(
            item.translation || item.userTranslation || item.explanation
          );
          return (
            <div className={`chat-bubble ${item.role}`} key={`${item.role}-${index}`}>
              <span className="chat-who">{item.role === "ai" ? "Bạn cùng lớp · AI" : "Bạn"}</span>
              <strong>{item.text}</strong>
              <div className="chat-bubble-actions">
                {canTranslate && (
                  <button
                    type="button"
                    className="chat-translate-button"
                    aria-expanded={Boolean(item.showVi)}
                    onClick={() =>
                      setMessages((current) =>
                        current.map((message, messageIndex) =>
                          messageIndex === index
                            ? { ...message, showVi: !message.showVi }
                            : message
                        )
                      )
                    }
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
            <strong>Đã chốt lịch!</strong>
            <p>{agreement}</p>
          </div>
          <button type="button" className="btn-secondary" onClick={restart}>
            Luyện lại
          </button>
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
              opener === "user" && !messages.length
                ? "Mở lời bằng tiếng Đức, ví dụ: Hallo! Wann hast du am Samstag Zeit?"
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
