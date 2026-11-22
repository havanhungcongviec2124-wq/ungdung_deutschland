import { Share2 } from "lucide-react";
import Modal from "../Modal";

export default function ShareFolderModal({
  folderName,
  cardCount,
  url,
  canShare,
  onCopy,
  onSend,
  onClose,
}) {
  return (
    <Modal title="Chia sẻ thư mục từ vựng" onClose={onClose}>
      <div className="share-folder-content">
        <p>
          Link này chứa bản sao của {folderName} ({cardCount} thẻ). Ai có link đều có thể xem và
          thêm bộ từ này vào ứng dụng của họ.
        </p>
        <p className="small">
          Dữ liệu trong link chỉ được nén và mã hóa để tạo URL, không được mã hóa bảo mật.
          Đừng chia sẻ thẻ có thông tin riêng tư.
        </p>
        <textarea
          className="share-link-input"
          aria-label="Link chia sẻ"
          readOnly
          value={url}
          onFocus={(event) => event.target.select()}
          rows="4"
        />
        <div className="heading-actions">
          <button className="btn-secondary" onClick={onCopy}>
            <Share2 size={16} /> Sao chép link
          </button>
          {canShare && (
            <button className="btn-primary" onClick={onSend}>
              <Share2 size={16} /> Chia sẻ...
            </button>
          )}
        </div>
        <p className="small">
          Đây là bản sao tại thời điểm tạo link; các thay đổi sau này không tự cập nhật.
        </p>
      </div>
    </Modal>
  );
}
