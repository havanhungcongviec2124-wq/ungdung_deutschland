import Modal from "../Modal";

export default function InstallModal({ onClose }) {
  return (
    <Modal title="Cài WortKarte lên thiết bị" onClose={onClose}>
      <div className="install-help">
        <p>
          WortKarte là ứng dụng web. Trên máy tính, ứng dụng được cài từ trình duyệt, không tải
          thành file .dmg.
        </p>
        <div>
          <strong>MacBook — Safari</strong>
          <span>
            Mở ứng dụng bằng Safari → trên thanh menu chọn <b>File</b> → <b>Add to Dock…</b> →
            chọn <b>Add</b>. Biểu tượng WortKarte sẽ xuất hiện trong Dock và thư mục Applications.
          </span>
        </div>
        <div>
          <strong>MacBook — Chrome</strong>
          <span>
            Nhấn biểu tượng cài đặt ở cuối thanh địa chỉ, hoặc mở menu <b>⋮</b> →{" "}
            <b>Cast, save, and share</b> → <b>Install page as app</b>.
          </span>
        </div>
        <div>
          <strong>MacBook — Microsoft Edge</strong>
          <span>
            Mở menu <b>…</b> → <b>Apps</b> → <b>Install this site as an app</b>.
          </span>
        </div>
        <div>
          <strong>iPhone / iPad</strong>
          <span>
            Mở bằng Safari → nhấn nút Chia sẻ → chọn <b>Thêm vào Màn hình chính</b> → nhấn Thêm.
          </span>
        </div>
        <div>
          <strong>Android</strong>
          <span>
            Mở bằng Chrome → nhấn menu ⋮ → <b>Cài đặt ứng dụng</b> hoặc{" "}
            <b>Thêm vào màn hình chính</b>.
          </span>
        </div>
        <div>
          <strong>Windows / máy tính bảng</strong>
          <span>
            Mở bằng Chrome hoặc Edge → nhấn biểu tượng cài đặt trên thanh địa chỉ, hoặc menu →{" "}
            <b>Cài đặt WortKarte</b>.
          </span>
        </div>
        <small>
          Nếu không thấy tùy chọn cài đặt, hãy mở website bằng đường dẫn HTTPS và chờ tải trang
          hoàn tất. Nút cài tự động chỉ hoạt động khi trình duyệt hỗ trợ. Dữ liệu thẻ vẫn lưu
          riêng trên từng thiết bị.
        </small>
      </div>
    </Modal>
  );
}
