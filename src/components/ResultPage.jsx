import {
  CheckCircle2,
  GraduationCap,
  Layers3,
  XCircle,
} from "lucide-react";

export default function ResultPage({
  knownCount,
  unknownCount,
  totalCount,
  onRetry,
  onExit,
}) {
  return (
    <div className="result-wrap">
      {/* ---------- Result icon + heading ---------- */}
      <div className="result-icon">
        <GraduationCap size={34} />
      </div>
      <div className="eyebrow">HOÀN THÀNH BUỔI HỌC</div>
      <h1>Bạn đã hoàn thành!</h1>
      <p className="muted">Tiếp tục luyện tập để ghi nhớ từ vựng lâu hơn nhé.</p>

      {/* ---------- Result stats ---------- */}
      <div className="result-stats">
        <div>
          <CheckCircle2 color="#159b78" />
          <strong>{knownCount}</strong>
          <span>Đã thuộc</span>
        </div>
        <div>
          <XCircle color="#e16b78" />
          <strong>{unknownCount}</strong>
          <span>Cần ôn lại</span>
        </div>
        <div>
          <Layers3 color="#6d5dfc" />
          <strong>{totalCount}</strong>
          <span>Tổng số từ</span>
        </div>
      </div>

      {/* ---------- Result actions ---------- */}
      <div className="result-actions">
        <button className="btn-primary" onClick={onRetry}>
          Ôn lại từ chưa thuộc
        </button>
        <button className="btn-secondary" onClick={onExit}>
          Về thư viện
        </button>
      </div>
    </div>
  );
}