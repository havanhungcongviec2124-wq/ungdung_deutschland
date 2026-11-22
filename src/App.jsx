import { useState } from "react";
import { BookOpen, CheckCircle2, Layers3, Link2, Upload } from "lucide-react";
import AppContent from "./components/AppContent";
import AppModals from "./components/AppModals";
import AppShell from "./components/AppShell";
import { useAppInstall } from "./hooks/useAppInstall";
import { useImport } from "./hooks/useImport";
import { useLibrary } from "./hooks/useLibrary";
import { useNotice } from "./hooks/useNotice";
import { useSharing } from "./hooks/useSharing";
import { useStudy } from "./hooks/useStudy";
import { readLocalData } from "./lib/appData";

const NAV_ITEMS = [
  { id: "home", label: "Tổng quan", icon: Layers3 },
  { id: "cards", label: "Thẻ từ vựng", icon: BookOpen },
  { id: "import", label: "Nhập hàng loạt", icon: Upload },
  { id: "shared-link", label: "Thêm bằng link chia sẻ", icon: Link2 },
];

export default function App() {
  const [initialData] = useState(readLocalData);
  const [view, setView] = useState("home");
  const [mobileNav, setMobileNav] = useState(false);
  const [modal, setModal] = useState("");

  const { notice, setNotice, toast } = useNotice(initialData.error || "");
  const library = useLibrary({ initialData, toast, setNotice, setModal, setView });
  const study = useStudy({ library, toast, setModal, setView });
  const importFlow = useImport({ library, toast, setNotice, setModal, setView });
  const sharing = useSharing({ library, toast, setNotice, setModal, setView });
  const install = useAppInstall({ toast, setModal });

  // Các hành động dùng chung giữa thanh điều hướng, nội dung và modal.
  const actions = {
    showCards: () => setView("cards"),
    showImport: () => setView("import"),
    showFolderOverview: () => setView("folder-overview"),
    closeStudy: () => setView("cards"),
    selectFolder: (id) => {
      library.setActiveFolder(id);
      setView("cards");
      setMobileNav(false);
    },
    openCardForm: library.openCardForm,
    openImportView: library.openImportView,
    openStudySetup: study.openStudySetup,
    openDailyReview: study.openDailyReview,
    retryStudy: study.retryStudy,
  };

  return (
    <>
      <AppShell
        navItems={NAV_ITEMS.map((item) => ({
          ...item,
          onSelect: () => {
            setView(item.id);
            setMobileNav(false);
          },
        }))}
        view={view}
        mobileNav={mobileNav}
        onToggleMobileNav={() => setMobileNav(true)}
        onCloseMobileNav={() => setMobileNav(false)}
        folders={library.folders}
        cards={library.cards}
        activeFolder={library.activeFolder}
        onDeleteFolder={library.requestDeleteFolder}
        onRenameFolder={library.requestRenameFolder}
        onSelectFolder={actions.selectFolder}
        onCreateFolder={() => setModal("folder")}
        onUpdateApp={install.updateApp}
        updatingApp={install.updatingApp}
        onInstall={install.installApp}
        isInstalled={install.isInstalled}
      >
        <AppContent
          view={view}
          library={library}
          study={study}
          importFlow={importFlow}
          sharing={sharing}
          actions={actions}
        />
      </AppShell>

      <AppModals
        modal={modal}
        setModal={setModal}
        library={library}
        study={study}
        sharing={sharing}
      />

      {notice && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      {importFlow.loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>Đang xử lý...</span>
        </div>
      )}
    </>
  );
}
