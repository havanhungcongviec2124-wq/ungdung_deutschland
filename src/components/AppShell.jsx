import {
  ChevronRight,
  Download,
  HardDrive,
  Languages,
  Menu,
  Plus,
  RefreshCw,
} from "lucide-react";

const pageTitles = {
  home: "Tổng quan",
  import: "Nhập hàng loạt",
  "import-preview": "Nhập hàng loạt",
  study: "Kiểm tra",
  result: "Kiểm tra",
  "folder-overview": "Tổng các từ vựng",
};

export default function AppShell({
  children,
  navItems,
  view,
  mobileNav,
  onToggleMobileNav,
  onCloseMobileNav,
  folders,
  cards,
  activeFolder,
  onSelectFolder,
  onCreateFolder,
  onUpdateApp,
  updatingApp,
  onInstall,
  isInstalled,
}) {
  return (
    <div className="app-shell">
      {/* ---------- Sidebar ---------- */}
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        {/* Brand */}
        <div className="brand">
          <div className="brand-mark">
            <Languages size={21} />
          </div>
          <span>
            wort<span className="brand-accent">karte</span>
          </span>
        </div>

        <div className="workspace-label">KHÔNG GIAN HỌC TẬP</div>

        {/* Main nav */}
        <nav className="main-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                view === item.id ||
                (item.id === "cards" &&
                  ["study", "result", "import-preview"].includes(view))
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                onCloseMobileNav();
                item.onSelect();
              }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.id === "cards" && (
                <span className="nav-count">{cards.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Folder heading */}
        <div className="folder-heading">
          <span>THƯ MỤC CỦA TÔI</span>
          <button title="Tạo thư mục" onClick={onCreateFolder}>
            <Plus size={16} />
          </button>
        </div>

        {/* Folder list */}
        <div className="folder-list">
          {folders.map((folder) => (
            <button
              key={folder.id}
              className={`folder-item ${
                activeFolder === folder.id ? "selected" : ""
              }`}
              onClick={() => onSelectFolder(folder.id)}
            >
              <span
                className="folder-dot"
                style={{ background: folder.color || "#6d5dfc" }}
              />
              <span className="folder-name">{folder.name}</span>
              <span className="folder-total">
                {cards.filter((card) => card.folder_id === folder.id).length}
              </span>
            </button>
          ))}
          {!folders.length && <p className="empty-small">Chưa có thư mục</p>}
        </div>

        {/* Sidebar bottom */}
        <div className="sidebar-bottom">
          <button
            className="nav-item update-app-button"
            onClick={onUpdateApp}
            disabled={updatingApp}
          >
            <RefreshCw size={18} className={updatingApp ? "spin" : ""} />
            <span>{updatingApp ? "Đang cập nhật..." : "Cập nhật ứng dụng"}</span>
          </button>

          <div className="cloud-status">
            <span className="status-dot online" />
            <span>Lưu trên thiết bị</span>
          </div>

          <div className="profile-row">
            <div className="avatar">H</div>
            <span className="profile-email">Dữ liệu riêng trên máy này</span>
          </div>
        </div>
      </aside>

      {/* ---------- Mobile scrim ---------- */}
      {mobileNav && <div className="mobile-scrim" onClick={onCloseMobileNav} />}

      {/* ---------- Main area ---------- */}
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={onToggleMobileNav}
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumb">
            Không gian học tập <ChevronRight size={14} />{" "}
            <strong>{pageTitles[view] || "Thẻ từ vựng"}</strong>
          </div>

          <div className="top-actions">
            <span className="cloud-pill">
              <HardDrive size={15} />
              Lưu trên thiết bị
            </span>
            <button
              className="btn-primary install-button"
              onClick={onInstall}
              disabled={isInstalled}
            >
              <Download size={15} />
              {isInstalled ? "Đã cài đặt" : "Cài ứng dụng"}
            </button>
          </div>
        </header>

        <div className="content-wrap">{children}</div>
      </main>
    </div>
  );
}