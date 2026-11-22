import { Plus } from "lucide-react";
import Modal from "../Modal";

export default function CardModal({ draft, setDraft, onSubmit, onClose }) {
  return (
    <Modal title="Tạo thẻ từ mới" onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>
          Từ vựng tiếng Đức
          <input
            autoFocus
            value={draft.front}
            onChange={(event) => setDraft({ ...draft, front: event.target.value })}
            placeholder="Ví dụ: der Fehler"
            required
          />
        </label>
        <label>
          Số nhiều
          <input
            value={draft.plural}
            onChange={(event) => setDraft({ ...draft, plural: event.target.value })}
            placeholder="Ví dụ: die Fehler (không bắt buộc)"
          />
        </label>
        <label>
          Nghĩa tiếng Việt
          <textarea
            value={draft.back}
            onChange={(event) => setDraft({ ...draft, back: event.target.value })}
            placeholder="Ví dụ: Lỗi, sai sót"
            required
            rows="3"
          />
        </label>
        <label>
          Ghi chú / ví dụ
          <textarea
            value={draft.note}
            onChange={(event) => setDraft({ ...draft, note: event.target.value })}
            placeholder="Không bắt buộc"
            rows="2"
          />
        </label>
        <button className="btn-primary full" type="submit">
          <Plus size={17} /> Lưu thẻ từ
        </button>
      </form>
    </Modal>
  );
}
