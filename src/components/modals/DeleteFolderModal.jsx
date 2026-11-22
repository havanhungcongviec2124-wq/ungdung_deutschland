import Modal from "../Modal";

export default function DeleteFolderModal({ folder, cardCount, onConfirm, onClose }) {
  return (
    <Modal title="Xác nhận xóa thư mục" onClose={onClose}>
      <div className="delete-folder-confirm">
        <p>
          Bạn có muốn xóa thư mục <strong>“{folder.name}”</strong> không? Thao tác này cũng xóa{" "}
          {cardCount} thẻ và tiến độ ôn tập của thư mục.
        </p>
        <div className="delete-folder-actions">
          <button className="btn-secondary" onClick={onClose}>
            Không
          </button>
          <button className="btn-primary delete-folder-confirm-button" onClick={onConfirm}>
            Có, xóa thư mục
          </button>
        </div>
      </div>
    </Modal>
  );
}
