import { useEffect, useState } from "react";
import {
  createQuizOptions,
  normalizeQuizAnswer,
  quizAnswer,
  shuffle,
  todayKey,
} from "../lib/appData";
import { normalizeAiLevel, readSavedAiLevel, saveAiLevel } from "../lib/aiSentence";

export function useStudy({ library, toast, setModal, setView }) {
  const [flipped, setFlipped] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyCards, setStudyCards] = useState([]);
  const [studySourceCards, setStudySourceCards] = useState([]);
  const [studyLimit, setStudyLimit] = useState("");
  const [studyMode, setStudyMode] = useState("flashcard");
  const [sentenceLevel, setSentenceLevel] = useState(readSavedAiLevel);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [knownIds, setKnownIds] = useState([]);
  const [unknownIds, setUnknownIds] = useState([]);

  const parsedStudyLimit = Number.parseInt(studyLimit, 10);
  const studyLimitValue = Math.min(
    studySourceCards.length,
    Math.max(
      1,
      Number.isFinite(parsedStudyLimit) ? parsedStudyLimit : studySourceCards.length
    )
  );
  const studyLimitInvalid =
    Number.isFinite(parsedStudyLimit) &&
    (parsedStudyLimit < 1 || parsedStudyLimit > studySourceCards.length);

  useEffect(() => {
    saveAiLevel(sentenceLevel);
  }, [sentenceLevel]);

  function openDailyReview() {
    const { folderCards, dailyStats, reviewHistory, activeFolder } = library;
    if (!folderCards.length) return toast("Thư mục này chưa có thẻ từ.");
    const remaining = Math.max(0, dailyStats.required - dailyStats.reviewed);
    if (!remaining) return toast("Bạn đã hoàn thành mục tiêu ôn tập hôm nay!");
    const reviewedIds = new Set(
      Object.keys(reviewHistory[todayKey()]?.[activeFolder]?.results || {})
    );
    const dueCards = shuffle(folderCards.filter((card) => !reviewedIds.has(card.id))).slice(
      0,
      remaining
    );
    if (!dueCards.length) return toast("Không còn thẻ mới để ôn hôm nay.");
    openStudySetup(dueCards);
  }

  function openStudySetup(list = library.folderCards) {
    if (!list.length) return toast("Thư mục này chưa có thẻ từ.");
    setStudySourceCards(list);
    setStudyLimit(String(list.length));
    setModal("study");
  }

  function openSentenceLevelSetup() {
    if (!studySourceCards.length) return openStudySetup();
    setModal("sentence-level");
  }

  function openQuestionLevelSetup() {
    if (!studySourceCards.length) return openStudySetup();
    setModal("question-level");
  }

  function startSentenceStudy(level = sentenceLevel) {
    const nextLevel = normalizeAiLevel(level);
    setSentenceLevel(nextLevel);
    startStudy("sentence", studySourceCards, studyLimit, nextLevel);
  }

  function startQuestionStudy(level = sentenceLevel) {
    const nextLevel = normalizeAiLevel(level);
    setSentenceLevel(nextLevel);
    startStudy("question", studySourceCards, studyLimit, nextLevel);
  }

  function startStudy(mode, list = studySourceCards, limit = studyLimit, level = sentenceLevel) {
    if (!list.length) return toast("Thư mục này chưa có thẻ từ.");
    const isQuizMode = mode === "vi-to-de" || mode === "de-to-vi";
    if (
      isQuizMode &&
      new Set(
        list
          .map((card) => normalizeQuizAnswer(quizAnswer(card, mode)))
          .filter(Boolean)
      ).size < 2
    ) {
      return toast("Cần ít nhất 2 đáp án khác nhau để tạo bài trắc nghiệm.");
    }
    const parsedLimit = Number.parseInt(limit, 10);
    const cardCount = Math.min(
      list.length,
      Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : list.length)
    );
    // Xáo trộn danh sách nguồn rồi lấy đúng số lượng: các thẻ không bao giờ trùng nhau.
    const shuffledCards = shuffle(list).slice(0, cardCount);
    setStudyCards(shuffledCards);
    setStudyMode(mode);
    if (mode === "sentence" || mode === "question") setSentenceLevel(normalizeAiLevel(level));
    setQuizOptions(
      isQuizMode ? shuffledCards.map((card) => createQuizOptions(card, list, mode)) : []
    );
    setStudyIndex(0);
    setFlipped(false);
    setKnownIds([]);
    setUnknownIds([]);
    setSelectedAnswer(null);
    setModal("");
    setView("study");
  }

  function recordStudyAnswer(known) {
    const card = studyCards[studyIndex];
    if (!card) return;
    // Cùng một thẻ có thể được làm lại ở tab khác: chỉ giữ kết quả mới nhất.
    setKnownIds((previous) =>
      known
        ? [...previous.filter((id) => id !== card.id), card.id]
        : previous.filter((id) => id !== card.id)
    );
    setUnknownIds((previous) =>
      known
        ? previous.filter((id) => id !== card.id)
        : [...previous.filter((id) => id !== card.id), card.id]
    );
    library.markKnown(card, known);
    const day = todayKey();
    library.setReviewHistory((previous) => ({
      ...previous,
      [day]: {
        ...previous[day],
        [card.folder_id]: {
          ...previous[day]?.[card.folder_id],
          results: {
            ...previous[day]?.[card.folder_id]?.results,
            [card.id]: known,
          },
        },
      },
    }));
  }

  function nextStudyCard() {
    if (studyIndex < studyCards.length - 1) {
      setStudyIndex((index) => index + 1);
      setFlipped(false);
    } else {
      setView("result");
    }
    setSelectedAnswer(null);
  }

  // Điều hướng tự do giữa các câu đang ôn, không phụ thuộc vào việc đã trả lời.
  // Ở câu cuối, "sang câu khác" quay lại câu đầu thay vì kết thúc bài.
  function goToStudyCard(targetIndex) {
    if (!studyCards.length) return;
    const next = ((targetIndex % studyCards.length) + studyCards.length) % studyCards.length;
    if (next === studyIndex) return;
    setStudyIndex(next);
    setFlipped(false);
    setSelectedAnswer(null);
  }

  function prevStudyCard() {
    goToStudyCard(studyIndex - 1);
  }

  function otherStudyCard() {
    goToStudyCard(studyIndex + 1);
  }

  function answerStudy(known) {
    recordStudyAnswer(known);
    nextStudyCard();
  }

  function chooseQuizAnswer(answer) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    recordStudyAnswer(
      normalizeQuizAnswer(answer) ===
        normalizeQuizAnswer(quizAnswer(studyCards[studyIndex], studyMode))
    );
  }

  function retryStudy() {
    const retryCards = studyCards.filter((card) => unknownIds.includes(card.id));
    // Khi ôn lại từ chưa thuộc, luôn dùng tất cả thẻ đó bất kể số lượng đã nhập.
    startStudy(studyMode, retryCards, retryCards.length, sentenceLevel);
  }

  return {
    flipped,
    setFlipped,
    studyIndex,
    studyCards,
    studySourceCards,
    studyLimit,
    setStudyLimit,
    studyLimitValue,
    studyLimitInvalid,
    studyMode,
    sentenceLevel,
    setSentenceLevel,
    quizOptions,
    selectedAnswer,
    knownIds,
    unknownIds,
    openDailyReview,
    openStudySetup,
    openSentenceLevelSetup,
    openQuestionLevelSetup,
    startStudy,
    startSentenceStudy,
    startQuestionStudy,
    recordStudyAnswer,
    nextStudyCard,
    prevStudyCard,
    otherStudyCard,
    answerStudy,
    chooseQuizAnswer,
    retryStudy,
  };
}
