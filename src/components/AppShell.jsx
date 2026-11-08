import { useRef, useState } from "react";
import {
  ChevronRight,
  Download,
  HardDrive,
  Languages,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
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
  onDeleteFolder,
  onRenameFolder,
  onCreateFolder,
  onUpdateApp,
  updatingApp,
  onInstall,
  isInstalled,
}) {
  const [openFolderId, setOpenFolderId] = useState("");

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
            <FolderListItem
              key={folder.id}
              folder={folder}
              count={cards.filter((card) => card.folder_id === folder.id).length}
              selected={activeFolder === folder.id}
              open={openFolderId === folder.id}
              onOpenChange={(open) => setOpenFolderId(open ? folder.id : "")}
              onSelect={() => onSelectFolder(folder.id)}
              onDelete={() => onDeleteFolder(folder.id)}
              onRename={() => onRenameFolder(folder.id)}
            />
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

function FolderListItem({
  folder,
  count,
  selected,
  open,
  onOpenChange,
  onSelect,
  onDelete,
  onRename,
}) {
  const touchStart = useRef(null);
  const longPressTimer = useRef(null);
  const suppressClick = useRef(false);
  const suppressClickTimer = useRef(null);

  function suppressNextClick() {
    suppressClick.current = true;
    window.clearTimeout(suppressClickTimer.current);
    suppressClickTimer.current = window.setTimeout(() => {
      suppressClick.current = false;
    }, 500);
  }

  function handleTouchStart(event) {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY, longPressed: false };
    window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      if (!touchStart.current) return;
      touchStart.current.longPressed = true;
      onOpenChange(true);
    }, 500);
  }

  function handleTouchMove(event) {
    if (!touchStart.current) return;
    const touch = event.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      window.clearTimeout(longPressTimer.current);
    }
  }

  function handleTouchEnd(event) {
    window.clearTimeout(longPressTimer.current);
    if (!touchStart.current) return;
    const start = touchStart.current;
    touchStart.current = null;
    if (start.longPressed) {
      suppressNextClick();
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    suppressNextClick();
    onOpenChange(deltaX > 0);
  }

  function handleClick() {
    if (suppressClick.current) {
      window.clearTimeout(suppressClickTimer.current);
      suppressClick.current = false;
      return;
    }
    if (open) {
      onOpenChange(false);
      return;
    }
    onSelect();
  }

  return (
    <div className={`folder-swipe-row ${open ? "folder-swipe-open" : ""}`}>
      <div className="folder-actions">
        <button
          className="folder-rename-action"
          aria-label={`Đổi tên thư mục ${folder.name}`}
          title={`Đổi tên thư mục ${folder.name}`}
          onClick={onRename}
          tabIndex={open ? 0 : -1}
        >
          <Pencil size={17} />
        </button>
        <button
          className="folder-delete-action"
          aria-label={`Xóa thư mục ${folder.name}`}
          title={`Xóa thư mục ${folder.name}`}
          onClick={onDelete}
          tabIndex={open ? 0 : -1}
        >
          <Trash2 size={17} />
        </button>
      </div>
      <button
        className={`folder-item ${selected ? "selected" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          window.clearTimeout(longPressTimer.current);
          touchStart.current = null;
        }}
        onContextMenu={(event) => event.preventDefault()}
        onClick={handleClick}
        aria-label={`${folder.name}, ${count} thẻ`}
      >
        <span
          className="folder-dot"
          style={{ background: folder.color || "#6d5dfc" }}
        />
        <span className="folder-name">{folder.name}</span>
        <span className="folder-total">{count}</span>
      </button>
    </div>
  );
}