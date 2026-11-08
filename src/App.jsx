import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Download,
  FolderPlus,
  Layers3,
  Languages,
  Plus,
  RefreshCw,
  Share2,
  Upload,
  X,
} from "lucide-react";
import { parseOcrTable, parseOcrText, parseVocabularyText } from "./lib/parser";
import {
  colors,
  createQuizOptions,
  defaultDailyGoal,
  getDailyFolderStats,
  getStudyStreak,
  normalizeQuizAnswer,
  normalizeVocabulary,
  quizAnswer,
  readLocalData,
  shuffle,
  STORAGE_KEY,
  todayKey,
} from "./lib/appData";
import { createWorker } from "tesseract.js";
import { createFolderShareUrl, readFolderShareToken } from "./lib/folderSharing";

import HomePage from "./components/HomePage";
import ImportPage from "./components/ImportPage";
import StudyPage from "./components/StudyPage";
import { CardsPage, FolderOverviewPage } from "./components/CardsPage";
import ImportPreviewPage from "./components/ImportPreviewPage";
import ResultPage from "./components/ResultPage";
import Modal from "./components/Modal";
import AppShell from "./components/AppShell";

function App() {
  /* ============================================================
     STATE
     ============================================================ */
  const [initialData] = useState(readLocalData);
  const [folders, setFolders] = useState(initialData.folders);
  const [cards, setCards] = useState(initialData.cards);
  const [reviewHistory, setReviewHistory] = useState(initialData.reviewHistory);
  const [dailyGoals, setDailyGoals] = useState(initialData.dailyGoals);
  const [activeFolder, setActiveFolder] = useState(initialData.activeFolder);

  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState(initialData.error || "");
  const [loading, setLoading] = useState(false);
  const [updatingApp, setUpdatingApp] = useState(false);
  const [canPersist, setCanPersist] = useState(!initialData.error);
  const [modal, setModal] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharedFolder, setSharedFolder] = useState(null);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renamedFolderDraft, setRenamedFolderDraft] = useState("");

  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCardDraft, setEditingCardDraft] = useState(null);
  const [folderName, setFolderName] = useState("");

  const [draft, setDraft] = useState({ front: "", plural: "", back: "", note: "" });
  const [bulkText, setBulkText] = useState("");
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkFolder, setBulkFolder] = useState("");
  const [pendingImages, setPendingImages] = useState([]);

  const [flipped, setFlipped] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyCards, setStudyCards] = useState([]);
  const [studySourceCards, setStudySourceCards] = useState([]);
  const [studyMode, setStudyMode] = useState("flashcard");
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [knownIds, setKnownIds] = useState([]);
  const [unknownIds, setUnknownIds] = useState([]);
  const [sharingFolder, setSharingFolder] = useState(false);

  const fileRef = useRef(null);
  const imageRef = useRef(null);

  /* ============================================================
     DERIVED DATA
     ============================================================ */
  const currentFolder = folders.find((f) => f.id === activeFolder);

  const folderCards = useMemo(
    () => cards.filter((c) => c.folder_id === activeFolder),
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
      folderCards.filter((c) =>
        `${c.front} ${c.back} ${c.plural}`.toLowerCase().includes(query.toLowerCase())
      ),
    [folderCards, query]
  );

  const existingFolderWords = useMemo(
    () =>
      new Set(
        cards
          .filter((card) => card.folder_id === bulkFolder)
          .map((card) => normalizeVocabulary(card.front))
      ),
    [cards, bulkFolder]
  );

  const validBulkCount = bulkRows.filter((row) => row.front?.trim() && row.back?.trim()).length;
  const duplicateBulkCount = bulkRows.filter(
    (row) =>
      row.front?.trim() &&
      row.back?.trim() &&
      existingFolderWords.has(normalizeVocabulary(row.front))
  ).length;
  const newBulkCount = validBulkCount - duplicateBulkCount;
  const totalKnown = cards.filter((c) => c.known).length;

  /* ============================================================
     EFFECTS
     ============================================================ */
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
  }, [folders, cards, activeFolder, reviewHistory, dailyGoals, canPersist]);

  useEffect(() => {
    const match = window.location.hash.match(/^#share=(.+)$/);
    if (!match) return;

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`
    );
    readFolderShareToken(match[1])
      .then((share) => {
        setSharedFolder(share);
        setModal("shared-folder");
      })
      .catch((error) => {
        console.error("Không thể mở link chia sẻ thư mục:", error);
        setNotice(error.message);
      });
  }, []);

  useEffect(() => {
    const nativeMacApp = window.location.protocol === "app:";
    const standalone =
      nativeMacApp ||
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setModal("");
      toast("WortKarte đã được cài đặt.");
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  /* ============================================================
     HELPERS
     ============================================================ */
  function toast(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  async function shareCurrentFolder() {
    if (!currentFolder || !folderCards.length) {
      return toast("Thư mục cần có ít nhất một thẻ từ để chia sẻ.");
    }
    setSharingFolder(true);
    try {
      setShareUrl(await createFolderShareUrl(currentFolder, folderCards));
      setModal("share-folder");
    } catch (error) {
      console.error("Không thể tạo link chia sẻ thư mục:", error);
      toast(`Không thể tạo link chia sẻ: ${error.message}`);
    } finally {
      setSharingFolder(false);
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("Đã sao chép link chia sẻ.");
    } catch (error) {
      console.error("Không thể sao chép link chia sẻ:", error);
      toast("Không thể tự sao chép. Hãy chọn và sao chép link trong ô bên trên.");
    }
  }

  async function sendShareLink() {
    if (!navigator.share) {
      return toast("Thiết bị này không hỗ trợ chia sẻ trực tiếp. Hãy sao chép link.");
    }
    try {
      await navigator.share({ title: currentFolder?.name || "WortKarte", url: shareUrl });
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Không thể chia sẻ link thư mục:", error);
      toast(`Không thể chia sẻ link: ${error.message}`);
    }
  }

  function importSharedFolder() {
    if (!sharedFolder) return;
    const baseName = sharedFolder.folder.name;
    const existingNames = new Set(folders.map((folder) => folder.name.toLocaleLowerCase()));
    let name = baseName;
    let suffix = 2;
    while (existingNames.has(name.toLocaleLowerCase())) {
      name = `${baseName} (${suffix})`;
      suffix += 1;
    }

    const folderId = crypto.randomUUID();
    const newFolder = {
      id: folderId,
      name,
      color: sharedFolder.folder.color || colors[folders.length % colors.length],
    };
    const newCards = sharedFolder.cards.map((card) => ({
      ...card,
      id: crypto.randomUUID(),
      folder_id: folderId,
      known: false,
      created_at: new Date().toISOString(),
    }));

    setCanPersist(true);
    setFolders((previous) => [...previous, newFolder]);
    setCards((previous) => [...newCards, ...previous]);
    setActiveFolder(folderId);
    setView("cards");
    setSharedFolder(null);
    setModal("");
    toast(`Đã thêm thư mục "${name}" với ${newCards.length} thẻ vào thiết bị này.`);
  }

  async function updateApp() {
    if (!navigator.onLine) return toast("Hãy kết nối internet để kiểm tra bản cập nhật.");
    setUpdatingApp(true);
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) await registration.update();
      window.location.reload();
    } catch (error) {
      console.error("Không thể cập nhật ứng dụng:", error);
      setUpdatingApp(false);
      toast(`Không thể cập nhật ứng dụng: ${error.message}`);
    }
  }

  async function installApp() {
    if (!installPrompt) {
      setModal("install");
      return;
    }
    const prompt = installPrompt;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }

  function speakGerman(text) {
    if (
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
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

  /* ============================================================
     FOLDER / CARD CRUD
     ============================================================ */
  function addFolder(e) {
    e.preventDefault();
    if (!folderName.trim()) return;
    const row = { name: folderName.trim(), color: colors[folders.length % colors.length] };
    const data = { ...row, id: crypto.randomUUID() };
    setCanPersist(true);
    setFolders((prev) => [...prev, data]);
    setActiveFolder(data.id);
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
    setCards((prev) => [card, ...prev]);
    return true;
  }

  function submitCard(e) {
    e.preventDefault();
    if (!saveCard(draft)) return;
    setDraft({ front: "", plural: "", back: "", note: "" });
    setModal("");
    toast("Đã thêm thẻ từ.");
  }

  function deleteCard(card) {
    if (!confirm(`Xóa thẻ "${card.front}"?`)) return;
    setCanPersist(true);
    setCards((prev) => prev.filter((c) => c.id !== card.id));
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

  /* ============================================================
     DUPLICATE / EDIT FLOW
     ============================================================ */
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
    setCards((prev) => prev.filter((card) => !duplicateIds.has(card.id)));
    setView("cards");
    toast(`Đã xóa ${duplicateIds.size} thẻ trùng, mỗi từ chỉ còn 1 thẻ.`);
  }

  function startEditingFolderCard(card) {
    setEditingCardId(card.id);
    setEditingCardDraft({
      front: card.front,
      plural: card.plural || "",
      back: card.back,
    });
  }

  function updateEditingCardDraft(field, value) {
    setEditingCardDraft((prev) => ({ ...prev, [field]: value }));
  }

  function saveFolderCardEdit(card) {
    const front = editingCardDraft?.front.trim();
    const back = editingCardDraft?.back.trim();
    if (!front || !back) return toast("Từ vựng và nghĩa không được để trống.");
    setCanPersist(true);
    setCards((prev) =>
      prev.map((item) =>
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

  /* ============================================================
     KNOWN / DAILY GOAL
     ============================================================ */
  function markKnown(card, known) {
    setCanPersist(true);
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, known } : c)));
  }

  function setFolderDailyGoal(value) {
    const goal = Math.max(1, Math.min(500, Number.parseInt(value, 10) || 1));
    setCanPersist(true);
    setDailyGoals((prev) => ({ ...prev, [activeFolder]: goal }));
  }

  /* ============================================================
     STUDY FLOW
     ============================================================ */
  function openDailyReview() {
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

  function openStudySetup(list = folderCards) {
    if (!list.length) return toast("Thư mục này chưa có thẻ từ.");
    setStudySourceCards(list);
    setModal("study");
  }

  function startStudy(mode, list = studySourceCards) {
    if (!list.length) return toast("Thư mục này chưa có thẻ từ.");
    if (
      mode !== "flashcard" &&
      new Set(
        list
          .map((card) => normalizeQuizAnswer(quizAnswer(card, mode)))
          .filter(Boolean)
      ).size < 2
    ) {
      return toast("Cần ít nhất 2 đáp án khác nhau để tạo bài trắc nghiệm.");
    }
    const shuffledCards = shuffle(list);
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
    if (known) setKnownIds((prev) => [...prev, card.id]);
    else setUnknownIds((prev) => [...prev, card.id]);
    markKnown(card, known);
    const day = todayKey();
    setReviewHistory((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [card.folder_id]: {
          ...prev[day]?.[card.folder_id],
          results: {
            ...prev[day]?.[card.folder_id]?.results,
            [card.id]: known,
          },
        },
      },
    }));
  }

  function nextStudyCard() {
    if (studyIndex < studyCards.length - 1) {
      setStudyIndex((i) => i + 1);
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

  /* ============================================================
     IMPORT FLOW
     ============================================================ */
  function importText() {
    if (!folders.length) {
      setModal("folder");
      return toast("Tạo thư mục trước khi nhập thẻ từ.");
    }
    const rows = parseVocabularyText(bulkText);
    if (!rows.length) {
      return toast("Không nhận diện được dữ liệu. Hãy dùng dấu | hoặc tab để ngăn cột.");
    }
    setBulkRows(rows);
    setBulkFolder(activeFolder);
    setView("import-preview");
  }

  async function importFile(file) {
    if (!file) return;
    if (!folders.length) {
      setModal("folder");
      return toast("Tạo thư mục trước khi nhập thẻ từ.");
    }
    const text = await file.text();
    setBulkText(text);
    const rows = parseVocabularyText(text);
    setBulkRows(rows);
    setBulkFolder(activeFolder);
    if (rows.length) setView("import-preview");
    else toast("Không đọc được file. Hỗ trợ TXT và CSV.");
  }

  function queueImages(files) {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    if (!folders.length) {
      setModal("folder");
      return toast("Tạo thư mục trước khi nhập thẻ từ.");
    }
    setPendingImages((prev) => [...prev, ...selectedFiles]);
    toast(`Đã chọn thêm ${selectedFiles.length} ảnh.`);
  }

  async function importImages(files) {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    if (!folders.length) {
      setModal("folder");
      return toast("Tạo thư mục trước khi nhập thẻ từ.");
    }
    setLoading(true);
    toast(`Đang nhận diện ${selectedFiles.length} ảnh...`);
    let worker;
    try {
      worker = await createWorker("deu+eng+vie", undefined, {
        workerBlobURL: false,
        workerPath: "/ocr/worker.min.js",
        corePath: "/ocr",
        langPath: "/ocr",
        gzip: false,
      });
      const allRows = [];
      const recognizedTexts = [];
      for (let index = 0; index < selectedFiles.length; index += 1) {
        setNotice(`Đang nhận diện ảnh ${index + 1}/${selectedFiles.length}...`);
        const { data } = await worker.recognize(selectedFiles[index], {}, { blocks: true });
        recognizedTexts.push(data.text);
        const rows = parseOcrTable(data.blocks);
        allRows.push(...(rows.length ? rows : parseOcrText(data.text)));
      }
      const recognizedText = recognizedTexts.join("\n\n");
      setBulkText(recognizedText);
      setBulkRows(allRows);
      setBulkFolder(activeFolder);
      if (allRows.length) setView("import-preview");
      else {
        setView("import");
        toast(
          "Chưa tách được hàng/cột từ ảnh. Hãy dùng ảnh rõ, chụp thẳng bảng và thử lại."
        );
      }
      if (!allRows.length) return;
      setPendingImages([]);
      toast(`Đã nhận diện ${allRows.length} dòng từ ${selectedFiles.length} ảnh.`);
    } catch (err) {
      toast("Không thể nhận diện ảnh: " + err.message);
    } finally {
      if (worker) await worker.terminate();
      setLoading(false);
    }
  }

  async function confirmImport() {
    const valid = bulkRows.filter((r) => r.front?.trim() && r.back?.trim());
    if (!valid.length) return toast("Không có thẻ hợp lệ.");
    const folderId = bulkFolder || activeFolder;
    const existingWords = new Set(
      cards
        .filter((card) => card.folder_id === folderId)
        .map((card) => normalizeVocabulary(card.front))
    );
    const newRows = valid.filter(
      (row) => !existingWords.has(normalizeVocabulary(row.front))
    );
    if (!newRows.length) return toast("Tất cả từ hợp lệ đã có trong thư mục này.");
    const newCards = newRows.map((row) => ({
      front: row.front.trim(),
      plural: row.plural?.trim() || "",
      back: row.back.trim(),
      note: row.note?.trim() || "",
      folder_id: folderId,
      id: crypto.randomUUID(),
      known: false,
      created_at: new Date().toISOString(),
    }));
    setCanPersist(true);
    setCards((prev) => [...newCards, ...prev]);
    setActiveFolder(folderId);
    setView("cards");
    const skipped = valid.length - newRows.length;
    toast(
      `Đã lưu ${newCards.length} thẻ mới${
        skipped ? `, bỏ qua ${skipped} từ đã tồn tại` : ""
      }.`
    );
  }

  function updateBulkRow(index, key, value) {
    setBulkRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [key]: value } : r))
    );
  }

  /* ============================================================
     NAV ITEMS
     ============================================================ */
  const navItems = [
    { id: "home", label: "Tổng quan", icon: Layers3, onSelect: () => setView("home") },
    { id: "cards", label: "Thẻ từ vựng", icon: BookOpen, onSelect: () => setView("cards") },
    { id: "import", label: "Nhập hàng loạt", icon: Upload, onSelect: () => setView("import") },
  ];

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <>
      <AppShell
        navItems={navItems}
        view={view}
        mobileNav={mobileNav}
        onToggleMobileNav={() => setMobileNav(true)}
        onCloseMobileNav={() => setMobileNav(false)}
        folders={folders}
        cards={cards}
        activeFolder={activeFolder}
        onDeleteFolder={requestDeleteFolder}
        onRenameFolder={requestRenameFolder}
        onSelectFolder={(id) => {
          setActiveFolder(id);
          setView("cards");
          setMobileNav(false);
        }}
        onCreateFolder={() => setModal("folder")}
        onUpdateApp={updateApp}
        updatingApp={updatingApp}
        onInstall={installApp}
        isInstalled={isInstalled}
      >
        {view === "home" && (
          <HomePage
            folders={folders}
            cards={cards}
            known={totalKnown}
            onStudy={() => openStudySetup()}
            onCreate={openCardForm}
            onImport={openImportView}
            onFolder={(id) => {
              setActiveFolder(id);
              setView("cards");
            }}
          />
        )}

        {view === "cards" && (
          <CardsPage
            currentFolder={currentFolder}
            dailyStats={dailyStats}
            dailyGoal={dailyGoal}
            setFolderDailyGoal={setFolderDailyGoal}
            studyStreak={studyStreak}
            openDailyReview={openDailyReview}
            folderCards={folderCards}
            query={query}
            setQuery={setQuery}
            filteredCards={filteredCards}
            openStudySetup={openStudySetup}
            openFolderOverview={() => setView("folder-overview")}
            deleteCard={deleteCard}
            speakGerman={speakGerman}
            openImportView={openImportView}
            openCardForm={openCardForm}
          />
        )}

        {view === "folder-overview" && (
          <FolderOverviewPage
            currentFolder={currentFolder}
            folderCards={folderCards}
            duplicateWordGroups={duplicateWordGroups}
            duplicateCardIds={duplicateCardIds}
            duplicateExtraCount={duplicateExtraCount}
            onShare={shareCurrentFolder}
            sharingFolder={sharingFolder}
            onBack={() => setView("cards")}
            onRemoveDuplicates={removeFolderDuplicates}
            editingCardId={editingCardId}
            editingCardDraft={editingCardDraft}
            onEditDraft={updateEditingCardDraft}
            onSaveEdit={saveFolderCardEdit}
            onCancelEdit={cancelFolderCardEdit}
            onStartEdit={startEditingFolderCard}
            onCreateCard={openCardForm}
          />
        )}

        {view === "import" && (
          <ImportPage
            bulkText={bulkText}
            setBulkText={setBulkText}
            onParse={importText}
            onFile={importFile}
            onImages={queueImages}
            onRecognizeImages={() => importImages(pendingImages)}
            selectedImages={pendingImages}
            onRemoveImage={(index) =>
              setPendingImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
            }
            onClearImages={() => setPendingImages([])}
            fileRef={fileRef}
            imageRef={imageRef}
            loading={loading}
          />
        )}

        {view === "import-preview" && (
          <ImportPreviewPage
            validCount={validBulkCount}
            newCount={newBulkCount}
            duplicateCount={duplicateBulkCount}
            folders={folders}
            folderId={bulkFolder}
            setFolderId={setBulkFolder}
            onBack={() => setView("import")}
            onConfirm={confirmImport}
            rows={bulkRows}
            existingWords={existingFolderWords}
            normalizeVocabulary={normalizeVocabulary}
            onUpdateRow={updateBulkRow}
            onRemoveRow={(index) =>
              setBulkRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))
            }
          />
        )}

        {view === "study" && studyCards[studyIndex] && (
          <StudyPage
            card={studyCards[studyIndex]}
            index={studyIndex}
            total={studyCards.length}
            mode={studyMode}
            options={quizOptions[studyIndex] || []}
            selectedAnswer={selectedAnswer}
            flipped={flipped}
            setFlipped={setFlipped}
            onAnswer={answerStudy}
            onChooseAnswer={chooseQuizAnswer}
            onContinue={nextStudyCard}
            onSpeak={speakGerman}
            onExit={() => setView("cards")}
          />
        )}

        {view === "result" && (
          <ResultPage
            knownCount={knownIds.length}
            unknownCount={unknownIds.length}
            totalCount={studyCards.length}
            onRetry={() =>
              startStudy(
                studyMode,
                studyCards.filter((card) => unknownIds.includes(card.id))
              )
            }
            onExit={() => setView("cards")}
          />
        )}
      </AppShell>

      {/* ============================================================
          MODALS
          ============================================================ */}
      {modal === "card" && (
        <Modal title="Tạo thẻ từ mới" onClose={() => setModal("")}>
          <form className="modal-form" onSubmit={submitCard}>
            <label>
              Từ vựng tiếng Đức
              <input
                autoFocus
                value={draft.front}
                onChange={(e) => setDraft({ ...draft, front: e.target.value })}
                placeholder="Ví dụ: der Fehler"
                required
              />
            </label>
            <label>
              Số nhiều
              <input
                value={draft.plural}
                onChange={(e) => setDraft({ ...draft, plural: e.target.value })}
                placeholder="Ví dụ: die Fehler (không bắt buộc)"
              />
            </label>
            <label>
              Nghĩa tiếng Việt
              <textarea
                value={draft.back}
                onChange={(e) => setDraft({ ...draft, back: e.target.value })}
                placeholder="Ví dụ: Lỗi, sai sót"
                required
                rows="3"
              />
            </label>
            <label>
              Ghi chú / ví dụ
              <textarea
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                placeholder="Không bắt buộc"
                rows="2"
              />
            </label>
            <button className="btn-primary full" type="submit">
              <Plus size={17} /> Lưu thẻ từ
            </button>
          </form>
        </Modal>
      )}

      {modal === "folder" && (
        <Modal title="Tạo thư mục mới" onClose={() => setModal("")}>
          <form className="modal-form" onSubmit={addFolder}>
            <label>
              Tên thư mục
              <input
                autoFocus
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Ví dụ: Lektion 5 — A2"
                required
              />
            </label>
            <button className="btn-primary full" type="submit">
              <FolderPlus size={17} /> Tạo thư mục
            </button>
          </form>
        </Modal>
      )}

      {modal === "rename-folder" && folderToRename && (
        <Modal
          title="Đổi tên thư mục"
          onClose={() => {
            setModal("");
            setFolderToRename(null);
            setRenamedFolderDraft("");
          }}
        >
          <form className="modal-form" onSubmit={renameFolder}>
            <label>
              Tên thư mục
              <input
                autoFocus
                maxLength={100}
                value={renamedFolderDraft}
                onChange={(event) => setRenamedFolderDraft(event.target.value)}
                required
              />
            </label>
            <div className="delete-folder-actions">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => {
                  setModal("");
                  setFolderToRename(null);
                  setRenamedFolderDraft("");
                }}
              >
                Hủy
              </button>
              <button
                className="btn-primary"
                type="submit"
                disabled={!renamedFolderDraft.trim()}
              >
                Lưu tên
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "delete-folder-confirm" && folderToDelete && (
        <Modal title="Xác nhận xóa thư mục" onClose={() => {
          setModal("");
          setFolderToDelete(null);
        }}>
          <div className="delete-folder-confirm">
            <p>
              Bạn có muốn xóa thư mục <strong>“{folderToDelete.name}”</strong> không?
              Thao tác này cũng xóa {cards.filter((card) => card.folder_id === folderToDelete.id).length} thẻ
              và tiến độ ôn tập của thư mục.
            </p>
            <div className="delete-folder-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setModal("");
                  setFolderToDelete(null);
                }}
              >
                Không
              </button>
              <button className="btn-primary delete-folder-confirm-button" onClick={deleteFolder}>
                Có, xóa thư mục
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "study" && (
        <Modal title="Chọn kiểu kiểm tra" onClose={() => setModal("")}>
          <div className="study-mode-list">
            <p className="muted">Chọn cách ôn tập cho {studySourceCards.length} thẻ từ.</p>
            <button className="study-mode-option" onClick={() => startStudy("flashcard")}>
              <strong>Lật thẻ từ vựng</strong>
              <span>Xem từ tiếng Đức rồi tự nhớ nghĩa tiếng Việt.</span>
            </button>
            <button className="study-mode-option" onClick={() => startStudy("de-to-vi")}>
              <strong>Trắc nghiệm: Đức → Việt</strong>
              <span>Hiện từ tiếng Đức, chọn đáp án nghĩa tiếng Việt.</span>
            </button>
            <button className="study-mode-option" onClick={() => startStudy("vi-to-de")}>
              <strong>Trắc nghiệm: Việt → Đức</strong>
              <span>Hiện nghĩa tiếng Việt, chọn đáp án từ tiếng Đức.</span>
            </button>
          </div>
        </Modal>
      )}

      {modal === "share-folder" && (
        <Modal title="Chia sẻ thư mục từ vựng" onClose={() => setModal("")}>
          <div className="share-folder-content">
            <p>
              Link này chứa bản sao của {currentFolder?.name} ({folderCards.length} thẻ).
              Ai có link đều có thể xem và thêm bộ từ này vào ứng dụng của họ.
            </p>
            <p className="small">
              Dữ liệu trong link chỉ được nén và mã hóa để tạo URL, không được mã hóa bảo mật.
              Đừng chia sẻ thẻ có thông tin riêng tư.
            </p>
            <textarea
              className="share-link-input"
              aria-label="Link chia sẻ"
              readOnly
              value={shareUrl}
              onFocus={(event) => event.target.select()}
              rows="4"
            />
            <div className="heading-actions">
              <button className="btn-secondary" onClick={copyShareLink}>
                <Share2 size={16} /> Sao chép link
              </button>
              {typeof navigator.share === "function" && (
                <button className="btn-primary" onClick={sendShareLink}>
                  <Share2 size={16} /> Chia sẻ...
                </button>
              )}
            </div>
            <p className="small">
              Đây là bản sao tại thời điểm tạo link; các thay đổi sau này không tự cập nhật.
            </p>
          </div>
        </Modal>
      )}

      {modal === "shared-folder" && sharedFolder && (
        <Modal title="Thêm bộ từ được chia sẻ" onClose={() => setModal("")}>
          <div className="share-folder-content">
            <p>
              <strong>{sharedFolder.folder.name}</strong> có {sharedFolder.cards.length} thẻ.
              Thêm sẽ tạo một thư mục riêng trong dữ liệu trên thiết bị của bạn.
            </p>
            <ul className="shared-card-preview">
              {sharedFolder.cards.slice(0, 5).map((card, index) => (
                <li key={`${card.front}-${index}`}>
                  <strong>{card.front}</strong> — {card.back}
                </li>
              ))}
              {sharedFolder.cards.length > 5 && (
                <li>và {sharedFolder.cards.length - 5} thẻ khác...</li>
              )}
            </ul>
            <p className="small">
              Link chia sẻ là bản sao. Các thẻ sẽ được lưu trên thiết bị này và có thể ôn tập
              ngay cả khi không có mạng.
            </p>
            <button className="btn-primary full" onClick={importSharedFolder}>
              <Plus size={17} /> Thêm {sharedFolder.cards.length} thẻ vào ứng dụng
            </button>
          </div>
        </Modal>
      )}

      {modal === "install" && (
        <Modal title="Cài WortKarte lên thiết bị" onClose={() => setModal("")}>
          <div className="install-help">
            <p>
              WortKarte là ứng dụng web. Trên máy tính, ứng dụng được cài từ trình duyệt,
              không tải thành file .dmg.
            </p>
            <div>
              <strong>MacBook — Safari</strong>
              <span>
                Mở ứng dụng bằng Safari → trên thanh menu chọn <b>File</b> →{" "}
                <b>Add to Dock…</b> → chọn <b>Add</b>. Biểu tượng WortKarte sẽ xuất hiện
                trong Dock và thư mục Applications.
              </span>
            </div>
            <div>
              <strong>MacBook — Chrome</strong>
              <span>
                Nhấn biểu tượng cài đặt ở cuối thanh địa chỉ, hoặc mở menu <b>⋮</b> →{" "}
                <b>Cast, save, and share</b> → <b>Install page as app</b>.
              </span>
            </div>
            <div>
              <strong>MacBook — Microsoft Edge</strong>
              <span>
                Mở menu <b>…</b> → <b>Apps</b> → <b>Install this site as an app</b>.
              </span>
            </div>
            <div>
              <strong>iPhone / iPad</strong>
              <span>
                Mở bằng Safari → nhấn nút Chia sẻ → chọn <b>Thêm vào Màn hình chính</b>{" "}
                → nhấn Thêm.
              </span>
            </div>
            <div>
              <strong>Android</strong>
              <span>
                Mở bằng Chrome → nhấn menu ⋮ → <b>Cài đặt ứng dụng</b> hoặc{" "}
                <b>Thêm vào màn hình chính</b>.
              </span>
            </div>
            <div>
              <strong>Windows / máy tính bảng</strong>
              <span>
                Mở bằng Chrome hoặc Edge → nhấn biểu tượng cài đặt trên thanh địa chỉ,
                hoặc menu → <b>Cài đặt WortKarte</b>.
              </span>
            </div>
            <small>
              Nếu không thấy tùy chọn cài đặt, hãy mở website bằng đường dẫn HTTPS và
              chờ tải trang hoàn tất. Nút cài tự động chỉ hoạt động khi trình duyệt hỗ trợ.
              Dữ liệu thẻ vẫn lưu riêng trên từng thiết bị.
            </small>
          </div>
        </Modal>
      )}

      {/* ============================================================
          TOAST / LOADING
          ============================================================ */}
      {notice && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>Đang xử lý...</span>
        </div>
      )}
    </>
  );
}

export default App;