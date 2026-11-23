import CardModal from "./modals/CardModal";
import DeleteFolderModal from "./modals/DeleteFolderModal";
import FolderModal from "./modals/FolderModal";
import InstallModal from "./modals/InstallModal";
import RenameFolderModal from "./modals/RenameFolderModal";
import ShareFolderModal from "./modals/ShareFolderModal";
import SentenceLevelModal from "./modals/SentenceLevelModal";
import SharedFolderModal from "./modals/SharedFolderModal";
import SharedSpeakingModal from "./modals/SharedSpeakingModal";
import SpeakingAddModal from "./modals/SpeakingAddModal";
import SpeakingOverviewModal from "./modals/SpeakingOverviewModal";
import StudySetupModal from "./modals/StudySetupModal";

export default function AppModals({ modal, setModal, library, study, sharing, speaking }) {
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
          onOpenSentenceLevel={study.openSentenceLevelSetup}
          onOpenQuestionLevel={study.openQuestionLevelSetup}
          onClose={close}
        />
      )}

      {modal === "sentence-level" && (
        <SentenceLevelModal
          sourceCount={study.studySourceCards.length}
          limitValue={study.studyLimitValue}
          level={study.sentenceLevel}
          onLevelChange={study.setSentenceLevel}
          onStart={() => study.startSentenceStudy()}
          onBack={() => setModal("study")}
          onClose={close}
        />
      )}

      {modal === "question-level" && (
        <SentenceLevelModal
          variant="question"
          sourceCount={study.studySourceCards.length}
          limitValue={study.studyLimitValue}
          level={study.sentenceLevel}
          onLevelChange={study.setSentenceLevel}
          onStart={() => study.startQuestionStudy()}
          onBack={() => setModal("study")}
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

      {modal === "speaking-add" && (
        <SpeakingAddModal
          boards={speaking.allBoards}
          onAddTopics={speaking.addBoards}
          onClose={close}
        />
      )}

      {modal === "speaking-overview" && (
        <SpeakingOverviewModal
          boards={speaking.allBoards}
          onSaveTopic={speaking.updateTopic}
          onResetTopic={speaking.resetTopic}
          onClose={close}
        />
      )}

      {modal === "shared-speaking" && sharing.sharedSpeaking && (
        <SharedSpeakingModal
          share={sharing.sharedSpeaking}
          onImport={sharing.importSharedSpeaking}
          onClose={sharing.closeSharedSpeaking}
        />
      )}

      {modal === "install" && <InstallModal onClose={close} />}
    </>
  );
}
