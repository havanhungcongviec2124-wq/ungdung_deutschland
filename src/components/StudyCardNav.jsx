import { ArrowLeft, ArrowRight } from "lucide-react";

export default function StudyCardNav({ onPrev, onNext, prevDisabled = false, nextDisabled = false }) {
  return (
    <div className="study-card-nav">
      <button
        type="button"
        className="btn-secondary"
        onClick={onPrev}
        disabled={prevDisabled}
        title="Quay lại câu trước"
      >
        <ArrowLeft size={15} /> Quay lại câu trước
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={onNext}
        disabled={nextDisabled}
        title="Sang câu khác"
      >
        Sang câu khác <ArrowRight size={15} />
      </button>
    </div>
  );
}
