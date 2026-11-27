import { CardsPage, FolderOverviewPage } from "./CardsPage";
import ExamPage from "./ExamPage";
import HomePage from "./HomePage";
import ImportPage from "./ImportPage";
import ImportPreviewPage from "./ImportPreviewPage";
import QuestionPage from "./QuestionPage";
import ResultPage from "./ResultPage";
import SentencePage from "./SentencePage";
import SharedLinkPage from "./SharedLinkPage";
import SpeakingPage from "./SpeakingPage";
import StudyPage from "./StudyPage";
import WritingPage from "./WritingPage";

export default function AppContent({
  view,
  library,
  study,
  importFlow,
  sharing,
  speaking,
  scheduleSpeaking,
  writing,
  examFlow,
  practice = { progress: {}, recordPractice: () => {} },
  actions,
}) {
  const currentCard = study.studyCards[study.studyIndex];

  return (
    <>
      {view === "home" && (
        <HomePage
          folders={library.folders}
          cards={library.cards}
          known={library.totalKnown}
          onStudy={actions.openStudySetup}
          onCreate={actions.openCardForm}
          onImport={actions.openImportView}
          onFolder={actions.selectFolder}
        />
      )}

      {view === "cards" && (
        <CardsPage
          currentFolder={library.currentFolder}
          dailyStats={library.dailyStats}
          dailyGoal={library.dailyGoal}
          setFolderDailyGoal={library.setFolderDailyGoal}
          studyStreak={library.studyStreak}
          openDailyReview={actions.openDailyReview}
          folderCards={library.folderCards}
          query={library.query}
          setQuery={library.setQuery}
          filteredCards={library.filteredCards}
          openStudySetup={actions.openStudySetup}
          openFolderOverview={actions.showFolderOverview}
          deleteCard={library.deleteCard}
          speakGerman={library.speakGerman}
          openImportView={actions.openImportView}
          openCardForm={actions.openCardForm}
        />
      )}

      {view === "folder-overview" && (
        <FolderOverviewPage
          currentFolder={library.currentFolder}
          folderCards={library.folderCards}
          duplicateWordGroups={library.duplicateWordGroups}
          duplicateCardIds={library.duplicateCardIds}
          duplicateExtraCount={library.duplicateExtraCount}
          onShare={sharing.shareCurrentFolder}
          sharingFolder={sharing.sharingFolder}
          onBack={actions.showCards}
          onRemoveDuplicates={library.removeFolderDuplicates}
          editingCardId={library.editingCardId}
          editingCardDraft={library.editingCardDraft}
          onEditDraft={library.updateEditingCardDraft}
          onSaveEdit={library.saveFolderCardEdit}
          onCancelEdit={library.cancelFolderCardEdit}
          onStartEdit={library.startEditingFolderCard}
          onCreateCard={actions.openCardForm}
        />
      )}

      {view === "speaking" && (
        <SpeakingPage
          boards={speaking.allBoards}
          onAdd={actions.openSpeakingAdd}
          onSaveAiTopic={speaking.addAiTopic}
          onRemove={speaking.removeBoard}
          onSpeak={library.speakGerman}
          onSaveTopic={speaking.updateTopic}
          onResetTopic={speaking.resetTopic}
          hiddenCount={speaking.hidden.length}
          onRestoreHidden={speaking.restoreHiddenTopics}
          practice={practice.progress.speaking || {}}
          onPractice={(id) => practice.recordPractice("speaking", id)}
        />
      )}

      {view === "schedule-speaking" && (
        <SpeakingPage
          boards={scheduleSpeaking.allBoards}
          onAdd={actions.openScheduleAdd}
          onSaveAiTopic={scheduleSpeaking.addAiTopic}
          onRemove={scheduleSpeaking.removeBoard}
          onSpeak={library.speakGerman}
          onSaveTopic={scheduleSpeaking.updateTopic}
          onResetTopic={scheduleSpeaking.resetTopic}
          hiddenCount={scheduleSpeaking.hidden.length}
          onRestoreHidden={scheduleSpeaking.restoreHiddenTopics}
          title="Thống nhất lịch trình"
          pageSize={12}
          description="Bài Goethe A2 Teil 3 với hai phiếu A/B: bạn và AI mỗi người một lịch, ngẫu nhiên vai và lượt mở lời. Cả hai phiếu đều hiện để bạn đối chiếu; thảo luận bằng tiếng Đức rồi chốt chung một thời gian."
          levelBadge="A2 · TERMIN VEREINBAREN"
          conversation
          topicContext="Chủ đề bắt buộc: Termine vereinbaren / einen gemeinsamen Termin finden (Wann hast du Zeit? Uhrzeiten, Tagesplan, Wochenplan, Verabredungen). Câu hỏi phải là một cuộc hẹn hoặc thời gian biểu, không phải chủ đề tự do."
          footnote="26 đề trích từ các cặp Aufgabenblatt A và B trong ảnh bạn cung cấp: đề lịch chốt khung giờ, đề thảo luận chốt chung một hoạt động. Cả hai phiếu được hiển thị, có nhãn rõ phiếu của bạn và của AI; AI vẫn đóng vai theo phiếu của mình và hội thoại được gửi tới dịch vụ AI để phản hồi bằng tiếng Đức."
          practice={practice.progress.schedule || {}}
          onPractice={(id) => practice.recordPractice("schedule", id)}
        />
      )}

      {view === "writing" && (
        <WritingPage
          boards={writing.allBoards}
          onAdd={actions.openWritingAdd}
          onSaveAiTopic={writing.addAiTopic}
          onRemove={writing.removeBoard}
          onSaveTopic={writing.updateTopic}
          onResetTopic={writing.resetTopic}
          hiddenCount={writing.hidden.length}
          onRestoreHidden={writing.restoreHiddenTopics}
          pageSize={20}
          practice={practice.progress.writing || {}}
          onPractice={(id) => practice.recordPractice("writing", id)}
        />
      )}

      {view === "test" && examFlow && (
        <ExamPage flow={examFlow} onSpeak={library.speakGerman} actions={actions} />
      )}

      {view === "import" && (
        <ImportPage
          bulkText={importFlow.bulkText}
          setBulkText={importFlow.setBulkText}
          onParse={importFlow.importText}
          onFile={importFlow.importFile}
          onImages={importFlow.queueImages}
          onRecognizeImages={() => importFlow.importImages(importFlow.pendingImages)}
          selectedImages={importFlow.pendingImages}
          onRemoveImage={importFlow.removeImage}
          onClearImages={importFlow.clearImages}
          fileRef={importFlow.fileRef}
          imageRef={importFlow.imageRef}
          loading={importFlow.loading}
        />
      )}

      {view === "shared-link" && (
        <SharedLinkPage
          link={sharing.sharedLinkDraft}
          setLink={sharing.setSharedLinkDraft}
          onOpenLink={sharing.openSharedLink}
          loading={sharing.openingSharedLink}
        />
      )}

      {view === "import-preview" && (
        <ImportPreviewPage
          validCount={importFlow.validBulkCount}
          newCount={importFlow.newBulkCount}
          duplicateCount={importFlow.duplicateBulkCount}
          folders={library.folders}
          folderId={importFlow.bulkFolder}
          setFolderId={importFlow.setBulkFolder}
          onBack={actions.showImport}
          onConfirm={importFlow.confirmImport}
          rows={importFlow.bulkRows}
          existingWords={importFlow.existingFolderWords}
          normalizeVocabulary={importFlow.normalizeVocabulary}
          onUpdateRow={importFlow.updateBulkRow}
          onRemoveRow={importFlow.removeBulkRow}
        />
      )}

      {view === "study" && currentCard && (
        <>
          {study.studyMode === "sentence" ? (
            <SentencePage
              card={currentCard}
              index={study.studyIndex}
              total={study.studyCards.length}
              level={study.sentenceLevel}
              onResult={study.recordStudyAnswer}
              onNext={study.nextStudyCard}
              onPrev={study.prevStudyCard}
              onOther={study.otherStudyCard}
              onSpeak={library.speakGerman}
              onExit={actions.closeStudy}
            />
          ) : study.studyMode === "question" ? (
            <QuestionPage
              card={currentCard}
              index={study.studyIndex}
              total={study.studyCards.length}
              level={study.sentenceLevel}
              onResult={study.recordStudyAnswer}
              onNext={study.nextStudyCard}
              onPrev={study.prevStudyCard}
              onOther={study.otherStudyCard}
              onSpeak={library.speakGerman}
              onExit={actions.closeStudy}
            />
          ) : (
            <StudyPage
              card={currentCard}
              index={study.studyIndex}
              total={study.studyCards.length}
              mode={study.studyMode}
              options={study.quizOptions[study.studyIndex] || []}
              selectedAnswer={study.selectedAnswer}
              flipped={study.flipped}
              setFlipped={study.setFlipped}
              onAnswer={study.answerStudy}
              onChooseAnswer={study.chooseQuizAnswer}
              onContinue={study.nextStudyCard}
              onPrev={study.prevStudyCard}
              onOther={study.otherStudyCard}
              onSpeak={library.speakGerman}
              onExit={actions.closeStudy}
            />
          )}
        </>
      )}

      {view === "result" && (
        <ResultPage
          knownCount={study.knownIds.length}
          unknownCount={study.unknownIds.length}
          totalCount={study.studyCards.length}
          onRetry={actions.retryStudy}
          onExit={actions.closeStudy}
        />
      )}
    </>
  );
}
