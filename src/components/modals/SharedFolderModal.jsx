import { Plus } from "lucide-react";
import Modal from "../Modal";

export default function SharedFolderModal({ sharedFolder, onImport, onClose }) {
  return (
    <Modal title="Thêm bộ từ được chia sẻ" onClose={onClose}>
      <div className="share-folder-content">
        <p>
          <strong>{sharedFolder.folder.name}</strong> có {sharedFolder.cards.length} thẻ. Thêm sẽ
          tạo một thư mục riêng trong dữ liệu trên thiết bị của bạn.
        </p>
        <ul className="shared-card-preview">
          {sharedFolder.cards.slice(0, 5).map((card, index) => (
            <li key={`${card.front}-${index}`}>
              <strong>{card.front}</strong> — {card.back}
            </li>
          ))}
          {sharedFolder.cards.length > 5 && (
            <li>và {sharedFolder.cards.length - 5} thẻ khác...</li>
          )}
        </ul>
        <p className="small">
          Link chia sẻ là bản sao. Các thẻ sẽ được lưu trên thiết bị này và có thể ôn tập ngay
          cả khi không có mạng.
        </p>
        <button className="btn-primary full" onClick={onImport}>
          <Plus size={17} /> Thêm {sharedFolder.cards.length} thẻ vào ứng dụng
        </button>
      </div>
    </Modal>
  );
}
