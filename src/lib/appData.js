export const colors = ["#6d5dfc", "#13a88a", "#f59e0b", "#ec6b8b", "#3987dc"];
export const STORAGE_KEY = "wortkarte.local.v1";
export const sampleFolderId = "sample-german";
const sampleCardIds = new Set(["s1", "s2", "s3", "s4", "s5"]);

export const shuffle = items => [...items].sort(() => Math.random() - 0.5);
export const quizAnswer = (card, mode) => mode === "vi-to-de" ? card.front?.trim() : card.back?.trim();
export const normalizeQuizAnswer = answer => answer?.trim().toLowerCase();
export const normalizeVocabulary = word => word?.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
export const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export const defaultDailyGoal = 10;

export function getDailyFolderStats(history, folderId, cards, goal) {
  const results = history?.[todayKey()]?.[folderId]?.results || {};
  const cardIds = new Set(cards.map(card => card.id));
  const reviewedResults = Object.entries(results).filter(([id]) => cardIds.has(id));
  const reviewed = reviewedResults.length;
  const required = Math.min(goal, cards.length);
  const correct = reviewedResults.filter(([, wasCorrect]) => wasCorrect).length;
  return { reviewed, required, correct, incorrect: reviewed - correct, complete: required > 0 && reviewed >= required };
}

export function getStudyStreak(history, folderId, cards, goal) {
  let date = new Date();
  if (!getDailyFolderStats(history, folderId, cards, goal).complete) date.setDate(date.getDate() - 1);
  let streak = 0;
  while (true) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const results = history?.[key]?.[folderId]?.results || {};
    const cardIds = new Set(cards.map(card => card.id));
    const reviewed = Object.keys(results).filter(id => cardIds.has(id)).length;
    if (Math.min(goal, cards.length) === 0 || reviewed < Math.min(goal, cards.length)) break;
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

export function createQuizOptions(card, cards, mode) {
  const correct = quizAnswer(card, mode);
  const answers = [...new Map(cards
    .map(item => quizAnswer(item, mode))
    .filter(Boolean)
    .map(answer => [normalizeQuizAnswer(answer), answer])).values()];
  const distractors = shuffle(answers.filter(answer => normalizeQuizAnswer(answer) !== normalizeQuizAnswer(correct))).slice(0, 3);
  return shuffle([...distractors, correct]);
}

export function readLocalData() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { folders: [], cards: [], activeFolder: "", reviewHistory: {}, dailyGoals: {} };
    const data = JSON.parse(saved);
    if (!Array.isArray(data.folders) || !Array.isArray(data.cards)) {
      throw new Error("Dữ liệu thư mục hoặc thẻ không đúng định dạng.");
    }
    const cards = data.cards.filter(card => !sampleCardIds.has(card.id));
    const retainedSampleFolderCards = cards.some(card => card.folder_id === sampleFolderId);
    const previousSampleFolder = data.folders.find(folder => folder.id === sampleFolderId);
    const folders = data.folders.filter(folder => folder.id !== sampleFolderId);
    if (retainedSampleFolderCards) {
      folders.push(previousSampleFolder
        ? { ...previousSampleFolder, name: "Từ vựng của tôi" }
        : { id: sampleFolderId, name: "Từ vựng của tôi", color: colors[0] });
    }
    const reviewHistory = data.reviewHistory && typeof data.reviewHistory === "object" ? { ...data.reviewHistory } : {};
    for (const [day, foldersForDay] of Object.entries(reviewHistory)) {
      if (!foldersForDay || typeof foldersForDay !== "object") continue;
      const sampleFolderHistory = foldersForDay[sampleFolderId];
      if (sampleFolderHistory?.results) {
        const results = Object.fromEntries(
          Object.entries(sampleFolderHistory.results).filter(([id]) => !sampleCardIds.has(id))
        );
        reviewHistory[day] = {
          ...foldersForDay,
          [sampleFolderId]: { ...sampleFolderHistory, results }
        };
      }
    }
    const activeFolder = folders.some(folder => folder.id === data.activeFolder)
      ? data.activeFolder
      : folders[0]?.id || "";
    return {
      folders,
      cards,
      reviewHistory,
      dailyGoals: data.dailyGoals && typeof data.dailyGoals === "object"
        ? Object.fromEntries(Object.entries(data.dailyGoals).filter(([id]) => id !== sampleFolderId || retainedSampleFolderCards))
        : {},
      activeFolder
    };
  } catch (error) {
    console.error("Không thể đọc dữ liệu WortKarte trên thiết bị:", error);
    return {
      folders: [],
      cards: [],
      reviewHistory: {},
      dailyGoals: {},
      activeFolder: "",
      error: "Không thể đọc dữ liệu đã lưu trên thiết bị. Dữ liệu cũ được giữ nguyên."
    };
  }
}
