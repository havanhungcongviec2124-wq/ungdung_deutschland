import { useEffect, useMemo, useState } from "react";
import {
  colors,
  defaultDailyGoal,
  getDailyFolderStats,
  getStudyStreak,
  normalizeVocabulary,
  STORAGE_KEY,
} from "../lib/appData";

export function useLibrary({ initialData, toast, setNotice, setModal, setView }) {
  const [folders, setFolders] = useState(initialData.folders);
  const [cards, setCards] = useState(initialData.cards);
  const [reviewHistory, setReviewHistory] = useState(initialData.reviewHistory);
  const [dailyGoals, setDailyGoals] = useState(initialData.dailyGoals);
  const [activeFolder, setActiveFolder] = useState(initialData.activeFolder);
  const [canPersist, setCanPersist] = useState(!initialData.error);

  const [query, setQuery] = useState("");
  const [folderName, setFolderName] = useState("");
  const [draft, setDraft] = useState({ front: "", plural: "", back: "", note: "" });
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renamedFolderDraft, setRenamedFolderDraft] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCardDraft, setEditingCardDraft] = useState(null);

  useEffect(() => {
    if (!canPersist) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ folders, cards, activeFolder, reviewHistory, dailyGoals })
      );
    } catch (error) {
      console.error("Không thể lưu dữ liệu WortKarte trên thiết bị:", error);
      setNotice(`Không thể lưu dữ liệu trên thiết bị: ${error.message}`);
    }
  }, [folders, cards, activeFolder, reviewHistory, dailyGoals, canPersist, setNotice]);

  const currentFolder = folders.find((folder) => folder.id === activeFolder);

  const folderCards = useMemo(
    () => cards.filter((card) => card.folder_id === activeFolder),
    [cards, activeFolder]
  );

  const duplicateWordGroups = useMemo(() => {
    const groups = new Map();
    for (const card of folderCards) {
      const word = normalizeVocabulary(card.front);
      if (!word) continue;
      groups.set(word, [...(groups.get(word) || []), card]);
    }
    return [...groups.values()].filter((group) => group.length > 1);
  }, [folderCards]);

  const duplicateCardIds = useMemo(
    () => new Set(duplicateWordGroups.flatMap((group) => group.map((card) => card.id))),
    [duplicateWordGroups]
  );

  const duplicateExtraCount = duplicateWordGroups.reduce(
    (total, group) => total + group.length - 1,
    0
  );

  const dailyGoal = Math.max(1, Number(dailyGoals[activeFolder]) || defaultDailyGoal);
  const dailyStats = getDailyFolderStats(reviewHistory, activeFolder, folderCards, dailyGoal);
  const studyStreak = getStudyStreak(reviewHistory, activeFolder, folderCards, dailyGoal);

  const filteredCards = useMemo(
    () =>
      folderCards.filter((card) =>
        `${card.front} ${card.back} ${card.plural}`.toLowerCase().includes(query.toLowerCase())
      ),
    [folderCards, query]
  );

  const totalKnown = cards.filter((card) => card.known).length;

  function addFolder(event) {
    event.preventDefault();
    if (!folderName.trim()) return;
    const row = { name: folderName.trim(), color: colors[folders.length % colors.length] };
    const folder = { ...row, id: crypto.randomUUID() };
    setCanPersist(true);
    setFolders((previous) => [...previous, folder]);
    setActiveFolder(folder.id);
    setFolderName("");
    setModal("");
    toast("Đã tạo thư mục.");
  }

  function openCardForm() {
    if (!folders.length) {
      setModal("folder");
      return toast("Tạo thư mục trước khi thêm thẻ từ.");
    }
    setModal("card");
  }

  function openImportView() {
    if (!folders.length) {
      setModal("folder");
      return toast("Tạo thư mục trước khi nhập thẻ từ.");
    }
    setView("import");
  }

  function saveCard(row, folderId = activeFolder) {
    if (!folderId) {
      toast("Tạo thư mục trước khi lưu thẻ từ.");
      return false;
    }
    if (!row.front?.trim() || !row.back?.trim()) {
      toast("Vui lòng nhập từ vựng và nghĩa.");
      return false;
    }
    const card = {
      front: row.front.trim(),
      plural: row.plural?.trim() || "",
      back: row.back.trim(),
      note: row.note?.trim() || "",
      folder_id: folderId,
      id: crypto.randomUUID(),
      known: false,
      created_at: new Date().toISOString(),
    };
    setCanPersist(true);
    setCards((previous) => [card, ...previous]);
    return true;
  }

  function submitCard(event) {
    event.preventDefault();
    if (!saveCard(draft)) return;
    setDraft({ front: "", plural: "", back: "", note: "" });
    setModal("");
    toast("Đã thêm thẻ từ.");
  }

  function deleteCard(card) {
    if (!confirm(`Xóa thẻ "${card.front}"?`)) return;
    setCanPersist(true);
    setCards((previous) => previous.filter((item) => item.id !== card.id));
    toast("Đã xóa thẻ.");
  }

  function requestDeleteFolder(folderId) {
    const folder = folders.find((item) => item.id === folderId);
    if (!folder) return;
    setFolderToDelete(folder);
    setModal("delete-folder-confirm");
  }

  function requestRenameFolder(folderId) {
    const folder = folders.find((item) => item.id === folderId);
    if (!folder) return;
    setFolderToRename(folder);
    setRenamedFolderDraft(folder.name);
    setModal("rename-folder");
  }

  function renameFolder(event) {
    event.preventDefault();
    const name = renamedFolderDraft.trim();
    if (!folderToRename || !name) return;
    if (name.length > 100) return toast("Tên thư mục không được dài quá 100 ký tự.");

    setCanPersist(true);
    setFolders((previous) =>
      previous.map((folder) =>
        folder.id === folderToRename.id ? { ...folder, name } : folder
      )
    );
    setFolderToRename(null);
    setRenamedFolderDraft("");
    setModal("");
    toast(`Đã đổi tên thư mục thành "${name}".`);
  }

  function deleteFolder() {
    if (!folderToDelete) return;
    const deletedFolder = folderToDelete;
    const remainingFolders = folders.filter((folder) => folder.id !== deletedFolder.id);
    setCanPersist(true);
    setFolders(remainingFolders);
    setCards((previous) => previous.filter((card) => card.folder_id !== deletedFolder.id));
    setReviewHistory((previous) =>
      Object.fromEntries(
        Object.entries(previous).map(([day, foldersForDay]) => {
          if (!foldersForDay || typeof foldersForDay !== "object") return [day, foldersForDay];
          const remaining = { ...foldersForDay };
          delete remaining[deletedFolder.id];
          return [day, remaining];
        })
      )
    );
    setDailyGoals((previous) => {
      const remaining = { ...previous };
      delete remaining[deletedFolder.id];
      return remaining;
    });
    if (activeFolder === deletedFolder.id) {
      setActiveFolder(remainingFolders[0]?.id || "");
      setView(remainingFolders.length ? "cards" : "home");
    }
    setEditingCardId(null);
    setEditingCardDraft(null);
    setFolderToDelete(null);
    setModal("");
    toast(`Đã xóa thư mục "${deletedFolder.name}" và dữ liệu liên quan.`);
  }

  function removeFolderDuplicates() {
    if (!duplicateExtraCount) return toast("Thư mục này không có thẻ trùng lặp.");
    const seenWords = new Set();
    const duplicateIds = new Set();
    for (const card of folderCards) {
      const word = normalizeVocabulary(card.front);
      if (!word) continue;
      if (seenWords.has(word)) duplicateIds.add(card.id);
      else seenWords.add(word);
    }
    setCanPersist(true);
    setCards((previous) => previous.filter((card) => !duplicateIds.has(card.id)));
    setView("cards");
    toast(`Đã xóa ${duplicateIds.size} thẻ trùng, mỗi từ chỉ còn 1 thẻ.`);
  }

  function startEditingFolderCard(card) {
    setEditingCardId(card.id);
    setEditingCardDraft({ front: card.front, plural: card.plural || "", back: card.back });
  }

  function updateEditingCardDraft(field, value) {
    setEditingCardDraft((previous) => ({ ...previous, [field]: value }));
  }

  function saveFolderCardEdit(card) {
    const front = editingCardDraft?.front.trim();
    const back = editingCardDraft?.back.trim();
    if (!front || !back) return toast("Từ vựng và nghĩa không được để trống.");
    setCanPersist(true);
    setCards((previous) =>
      previous.map((item) =>
        item.id === card.id
          ? { ...item, front, plural: editingCardDraft.plural.trim(), back }
          : item
      )
    );
    setEditingCardId(null);
    setEditingCardDraft(null);
    toast("Đã cập nhật thẻ từ.");
  }

  function cancelFolderCardEdit() {
    setEditingCardId(null);
    setEditingCardDraft(null);
  }

  function markKnown(card, known) {
    setCanPersist(true);
    setCards((previous) =>
      previous.map((item) => (item.id === card.id ? { ...item, known } : item))
    );
  }

  function setFolderDailyGoal(value) {
    const goal = Math.max(1, Math.min(500, Number.parseInt(value, 10) || 1));
    setCanPersist(true);
    setDailyGoals((previous) => ({ ...previous, [activeFolder]: goal }));
  }

  function speakGerman(text) {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      return toast("Trình duyệt này không hỗ trợ đọc văn bản.");
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    const germanVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith("de"));
    if (germanVoice) utterance.voice = germanVoice;
    utterance.onerror = (event) => {
      if (event.error !== "canceled" && event.error !== "interrupted") {
        toast("Không thể phát âm thanh. Hãy kiểm tra cài đặt âm thanh của thiết bị.");
      }
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return {
    folders,
    setFolders,
    cards,
    setCards,
    reviewHistory,
    setReviewHistory,
    dailyGoals,
    setDailyGoals,
    activeFolder,
    setActiveFolder,
    canPersist,
    setCanPersist,
    query,
    setQuery,
    currentFolder,
    folderCards,
    duplicateWordGroups,
    duplicateCardIds,
    duplicateExtraCount,
    dailyGoal,
    dailyStats,
    studyStreak,
    filteredCards,
    totalKnown,
    folderName,
    setFolderName,
    draft,
    setDraft,
    addFolder,
    openCardForm,
    openImportView,
    saveCard,
    submitCard,
    deleteCard,
    folderToDelete,
    setFolderToDelete,
    folderToRename,
    setFolderToRename,
    renamedFolderDraft,
    setRenamedFolderDraft,
    requestDeleteFolder,
    requestRenameFolder,
    renameFolder,
    deleteFolder,
    removeFolderDuplicates,
    editingCardId,
    editingCardDraft,
    setEditingCardDraft,
    startEditingFolderCard,
    updateEditingCardDraft,
    saveFolderCardEdit,
    cancelFolderCardEdit,
    markKnown,
    setFolderDailyGoal,
    speakGerman,
  };
}
