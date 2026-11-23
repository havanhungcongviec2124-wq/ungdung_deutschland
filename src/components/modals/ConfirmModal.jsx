import Modal from "../Modal";

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Xóa",
  onConfirm,
  onClose,
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="confirm-modal-body">
        <p className="modal-hint">{message}</p>
        <div className="confirm-modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
