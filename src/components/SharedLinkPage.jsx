import { Link2 } from "lucide-react";

export default function SharedLinkPage({
  link,
  setLink,
  onOpenLink,
  loading,
}) {
  return (
    <section className="shared-link-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">CHIA SẺ TỪ VỰNG</div>
          <h1>Thêm bằng link chia sẻ</h1>
          <p>
            Dán link thư mục từ vựng người khác gửi để xem trước và thêm vào ứng
            dụng.
          </p>
        </div>
      </div>

      <div className="import-card shared-link-card">
        <div className="import-card-icon green-bg">
          <Link2 size={22} />
        </div>
        <h3>Link thư mục</h3>
        <p>
          Thư mục sẽ được thêm vào thiết bị sau khi bạn kiểm tra và xác nhận.
        </p>
        <textarea
          value={link}
          onChange={(event) => setLink(event.target.value)}
          rows="5"
          aria-label="Link thư mục được chia sẻ"
          placeholder="Dán link chia sẻ vào đây"
          disabled={loading}
        />
        <div className="format-hint">
          Chỉ mở link chia sẻ thư mục WortKarte mà bạn tin tưởng.
        </div>
        <button
          className="btn-primary full"
          type="button"
          onClick={onOpenLink}
          disabled={loading || !link.trim()}
        >
          <Link2 size={17} /> {loading ? "Đang mở link..." : "Xem thư mục"}
        </button>
      </div>
    </section>
  );
}
