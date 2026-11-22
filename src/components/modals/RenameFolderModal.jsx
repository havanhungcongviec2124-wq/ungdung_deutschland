import Modal from "../Modal";

export default function RenameFolderModal({ value, onChange, onSubmit, onClose }) {
  return (
    <Modal title="Đổi tên thư mục" onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>
          Tên thư mục
          <input
            autoFocus
            maxLength={100}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required
          />
        </label>
        <div className="delete-folder-actions">
          <button className="btn-secondary" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-primary" type="submit" disabled={!value.trim()}>
            Lưu tên
          </button>
        </div>
      </form>
    </Modal>
  );
}
