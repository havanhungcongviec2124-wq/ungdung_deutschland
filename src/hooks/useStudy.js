import { useState } from "react";
import {
  createQuizOptions,
  normalizeQuizAnswer,
  quizAnswer,
  shuffle,
  todayKey,
} from "../lib/appData";

export function useStudy({ library, toast, setModal, setView }) {
  const [flipped, setFlipped] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyCards, setStudyCards] = useState([]);
  const [studySourceCards, setStudySourceCards] = useState([]);
  const [studyLimit, setStudyLimit] = useState("");
  const [studyMode, setStudyMode] = useState("flashcard");
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

  function startStudy(mode, list = studySourceCards, limit = studyLimit) {
    if (!list.length) return toast("Thư mục này chưa có thẻ từ.");
    if (
      mode !== "flashcard" &&
      mode !== "sentence" &&
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
    setQuizOptions(
      mode === "flashcard"
        ? []
        : shuffledCards.map((card) => createQuizOptions(card, list, mode))
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
    if (known) setKnownIds((previous) => [...previous, card.id]);
    else setUnknownIds((previous) => [...previous, card.id]);
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
    startStudy(studyMode, retryCards, retryCards.length);
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
    quizOptions,
    selectedAnswer,
    knownIds,
    unknownIds,
    openDailyReview,
    openStudySetup,
    startStudy,
    recordStudyAnswer,
    nextStudyCard,
    answerStudy,
    chooseQuizAnswer,
    retryStudy,
  };
}
