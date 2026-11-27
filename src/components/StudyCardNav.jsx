import { ArrowLeft, ArrowRight } from "lucide-react";

export default function StudyCardNav({
  onPrev,
  onNext,
  prevLabel = "Câu trước",
  nextLabel = "Câu khác",
  prevDisabled = false,
  nextDisabled = false,
}) {
  return (
    <div className="study-card-nav">
      <button
        type="button"
        className="btn-secondary nav-prev"
        onClick={onPrev}
        disabled={prevDisabled}
        title={prevLabel}
      >
        <ArrowLeft size={17} /> {prevLabel}
      </button>
      <button
        type="button"
        className="btn-secondary nav-next"
        onClick={onNext}
        disabled={nextDisabled}
        title={nextLabel}
      >
        {nextLabel} <ArrowRight size={17} />
      </button>
    </div>
  );
}
