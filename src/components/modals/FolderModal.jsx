import { FolderPlus } from "lucide-react";
import Modal from "../Modal";

export default function FolderModal({ folderName, setFolderName, onSubmit, onClose }) {
  return (
    <Modal title="Tạo thư mục mới" onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>
          Tên thư mục
          <input
            autoFocus
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
            placeholder="Ví dụ: Lektion 5 — A2"
            required
          />
        </label>
        <button className="btn-primary full" type="submit">
          <FolderPlus size={17} /> Tạo thư mục
        </button>
      </form>
    </Modal>
  );
}
