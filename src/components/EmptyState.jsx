import { BookOpen, Plus } from "lucide-react";

export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <BookOpen size={27} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <button className="btn-primary" onClick={action}>
        <Plus size={17} /> Tạo thẻ đầu tiên
      </button>
    </div>
  );
}