import { Plus } from "lucide-react";
import Modal from "../Modal";

export default function SharedSpeakingModal({ share, onImport, onClose }) {
  const scheduleCount = share.topics.filter(
    (topic) => topic.sheets?.A && topic.sheets?.B
  ).length;
  const destination = scheduleCount === share.topics.length
    ? "Thống nhất lịch trình"
    : scheduleCount
      ? "Luyện nói và Thống nhất lịch trình"
      : "Luyện nói";

  return (
    <Modal title="Thêm đề tài luyện nói được chia sẻ" onClose={onClose}>
      <div className="share-folder-content">
        <p>
          Link này chứa <strong>{share.topics.length} đề tài luyện nói</strong>. Thêm sẽ lưu các đề
          tài vào mục {destination} trên thiết bị này.
        </p>
        <ul className="shared-card-preview speaking-shared-preview">
          {share.topics.slice(0, 8).map((topic, index) => (
            <li key={`${topic.question}-${index}`}>
              <strong>{topic.question}</strong>
              {topic.hints?.length ? ` — ${topic.hints.join(" · ")}` : ""}
            </li>
          ))}
          {share.topics.length > 8 && (
            <li>và {share.topics.length - 8} đề tài khác...</li>
          )}
        </ul>
        <p className="small">
          Đề tài trùng với danh sách hiện có sẽ tự động được bỏ qua. Bạn có thể xóa từng đề tài sau
          khi thêm.
        </p>
        <button className="btn-primary full" onClick={onImport}>
          <Plus size={17} /> Thêm {share.topics.length} đề tài vào {destination}
        </button>
      </div>
    </Modal>
  );
}
