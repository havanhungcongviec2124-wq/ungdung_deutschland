import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Folder,
  ImagePlus,
  Plus,
  Sparkles,
} from "lucide-react";

function Stat({ icon: Icon, label, value, tint }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tint}`}>
        <Icon size={19} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function HomePage({
  folders,
  cards,
  known,
  onStudy,
  onCreate,
  onImport,
  onFolder,
}) {
  const percent = cards.length ? Math.round((known / cards.length) * 100) : 0;

  return (
    <section>
      {/* ---------- Welcome banner ---------- */}
      <div className="welcome-banner">
        <div className="welcome-copy">
          <div className="eyebrow light">CHÀO MỪNG BẠN TRỞ LẠI</div>
          <h1>
            Học một chút mỗi ngày,
            <br />
            tiến bộ từng ngày.
          </h1>
          <p>Biến những từ vựng khó nhớ thành kiến thức của riêng bạn.</p>

          <div className="welcome-actions">
            <button className="btn-white" onClick={onStudy}>
              <Brain size={17} /> Bắt đầu ôn tập
            </button>
            <button className="btn-glass" onClick={onCreate}>
              <Plus size={17} /> Tạo thẻ mới
            </button>
          </div>
        </div>

        <div className="banner-art">
          <div className="art-card art-back">WortKarte</div>
          <div className="art-card art-front">
            <span>DEUTSCH</span>
            <strong>Từ vựng</strong>
            <small>Thẻ của bạn</small>
          </div>
          <div className="sparkle sparkle-one">✦</div>
          <div className="sparkle sparkle-two">✧</div>
        </div>
      </div>

      {/* ---------- Learning overview ---------- */}
      <div className="section-title">
        <div>
          <h2>Tổng quan học tập</h2>
          <p>Theo dõi tiến độ ghi nhớ từ vựng của bạn.</p>
        </div>
      </div>

      <div className="stats-grid">
        <Stat icon={BookOpen} label="Tổng số thẻ" value={cards.length} tint="purple" />
        <Stat icon={Folder} label="Thư mục" value={folders.length} tint="green" />
        <Stat icon={CheckCircle2} label="Đã ghi nhớ" value={known} tint="orange" />
        <Stat icon={Brain} label="Tiến độ ghi nhớ" value={`${percent}%`} tint="pink" />
      </div>

      {/* ---------- Columns ---------- */}
      <div className="home-columns">
        {/* Recent folders */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Thư mục gần đây</h3>
              <p>Chọn một bộ từ để bắt đầu học.</p>
            </div>
            <button
              className="link-button"
              onClick={() => folders[0] && onFolder(folders[0].id)}
            >
              Xem thư mục
            </button>
          </div>

          {folders.length ? (
            folders.slice(0, 4).map((folder) => (
              <button
                className="folder-row"
                key={folder.id}
                onClick={() => onFolder(folder.id)}
              >
                <span
                  className="folder-icon"
                  style={{ background: `${folder.color}18`, color: folder.color }}
                >
                  <Folder size={19} />
                </span>
                <span className="folder-row-name">
                  <strong>{folder.name}</strong>
                  <small>
                    {cards.filter((card) => card.folder_id === folder.id).length} thẻ từ
                  </small>
                </span>
                <ChevronRight size={18} />
              </button>
            ))
          ) : (
            <p className="muted">Bạn chưa có thư mục nào.</p>
          )}
        </div>

        {/* Quick start */}
        <div className="panel quick-panel">
          <div className="quick-icon">
            <Sparkles size={21} />
          </div>
          <h3>Bắt đầu thật dễ dàng</h3>
          <p>
            Thêm từng từ hoặc nhập cả danh sách từ sách, tài liệu và ảnh chụp.
          </p>
          <button className="quick-action" onClick={onImport}>
            <ImagePlus size={17} /> Nhập từ văn bản / ảnh <ChevronRight size={16} />
          </button>
          <div className="quick-tip">
            <CircleHelp size={15} /> Mẹo: dùng dấu | để phân tách 3 cột từ, số nhiều và nghĩa.
          </div>
        </div>
      </div>
    </section>
  );
}