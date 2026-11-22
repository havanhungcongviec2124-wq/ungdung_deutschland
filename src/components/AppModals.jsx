import CardModal from "./modals/CardModal";
import DeleteFolderModal from "./modals/DeleteFolderModal";
import FolderModal from "./modals/FolderModal";
import InstallModal from "./modals/InstallModal";
import RenameFolderModal from "./modals/RenameFolderModal";
import ShareFolderModal from "./modals/ShareFolderModal";
import SharedFolderModal from "./modals/SharedFolderModal";
import StudySetupModal from "./modals/StudySetupModal";

export default function AppModals({ modal, setModal, library, study, sharing }) {
  const close = () => setModal("");

  return (
    <>
      {modal === "card" && (
        <CardModal
          draft={library.draft}
          setDraft={library.setDraft}
          onSubmit={library.submitCard}
          onClose={close}
        />
      )}

      {modal === "folder" && (
        <FolderModal
          folderName={library.folderName}
          setFolderName={library.setFolderName}
          onSubmit={library.addFolder}
          onClose={close}
        />
      )}

      {modal === "rename-folder" && library.folderToRename && (
        <RenameFolderModal
          value={library.renamedFolderDraft}
          onChange={library.setRenamedFolderDraft}
          onSubmit={library.renameFolder}
          onClose={() => {
            close();
            library.setFolderToRename(null);
            library.setRenamedFolderDraft("");
          }}
        />
      )}

      {modal === "delete-folder-confirm" && library.folderToDelete && (
        <DeleteFolderModal
          folder={library.folderToDelete}
          cardCount={library.cards.filter(
            (card) => card.folder_id === library.folderToDelete.id
          ).length}
          onConfirm={library.deleteFolder}
          onClose={() => {
            close();
            library.setFolderToDelete(null);
          }}
        />
      )}

      {modal === "study" && (
        <StudySetupModal
          sourceCount={study.studySourceCards.length}
          limit={study.studyLimit}
          limitValue={study.studyLimitValue}
          limitInvalid={study.studyLimitInvalid}
          onLimitChange={study.setStudyLimit}
          onSelectAll={() => study.setStudyLimit(String(study.studySourceCards.length))}
          onStart={study.startStudy}
          onClose={close}
        />
      )}

      {modal === "share-folder" && (
        <ShareFolderModal
          folderName={library.currentFolder?.name}
          cardCount={library.folderCards.length}
          url={sharing.shareUrl}
          canShare={typeof navigator.share === "function"}
          onCopy={sharing.copyShareLink}
          onSend={sharing.sendShareLink}
          onClose={close}
        />
      )}

      {modal === "shared-folder" && sharing.sharedFolder && (
        <SharedFolderModal
          sharedFolder={sharing.sharedFolder}
          onImport={sharing.importSharedFolder}
          onClose={sharing.closeSharedFolder}
        />
      )}

      {modal === "install" && <InstallModal onClose={close} />}
    </>
  );
}
