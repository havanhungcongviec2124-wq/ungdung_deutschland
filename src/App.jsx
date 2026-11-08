import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen, Brain, Check, ChevronLeft, ChevronRight, CircleHelp, HardDrive,
  Folder, FolderPlus, GraduationCap, ImagePlus, Layers3, Menu,
  Plus, Search, Sparkles, Trash2, Upload, Volume2, Download, Pencil, Save,
  X, RotateCcw, CheckCircle2, XCircle, Languages, FileText
} from "lucide-react";
import { parseOcrTable, parseOcrText, parseVocabularyText } from "./lib/parser";
import { createWorker } from "tesseract.js";

const colors = ["#6d5dfc", "#13a88a", "#f59e0b", "#ec6b8b", "#3987dc"];
const STORAGE_KEY = "wortkarte.local.v1";
const sampleFolderId = "sample-german";
const sampleCardIds = new Set(["s1", "s2", "s3", "s4", "s5"]);

const shuffle = items => [...items].sort(() => Math.random() - 0.5);
const quizAnswer = (card, mode) => mode === "vi-to-de" ? card.front?.trim() : card.back?.trim();
const normalizeQuizAnswer = answer => answer?.trim().toLowerCase();
const normalizeVocabulary = word => word?.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const defaultDailyGoal = 10;

function getDailyFolderStats(history, folderId, cards, goal) {
  const results = history?.[todayKey()]?.[folderId]?.results || {};
  const cardIds = new Set(cards.map(card => card.id));
  const reviewedResults = Object.entries(results).filter(([id]) => cardIds.has(id));
  const reviewed = reviewedResults.length;
  const required = Math.min(goal, cards.length);
  const correct = reviewedResults.filter(([, wasCorrect]) => wasCorrect).length;
  return { reviewed, required, correct, incorrect: reviewed - correct, complete: required > 0 && reviewed >= required };
}

function getStudyStreak(history, folderId, cards, goal) {
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

function createQuizOptions(card, cards, mode) {
  const correct = quizAnswer(card, mode);
  const answers = [...new Map(cards
    .map(item => quizAnswer(item, mode))
    .filter(Boolean)
    .map(answer => [normalizeQuizAnswer(answer), answer])).values()];
  const distractors = shuffle(answers.filter(answer => normalizeQuizAnswer(answer) !== normalizeQuizAnswer(correct))).slice(0, 3);
  return shuffle([...distractors, correct]);
}

function readLocalData() {
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

function App() {
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
  const [canPersist, setCanPersist] = useState(!initialData.error);
  const [modal, setModal] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCardDraft, setEditingCardDraft] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [draft, setDraft] = useState({ front: "", plural: "", back: "", note: "" });
  const [bulkText, setBulkText] = useState("");
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkFolder, setBulkFolder] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyCards, setStudyCards] = useState([]);
  const [studySourceCards, setStudySourceCards] = useState([]);
  const [studyMode, setStudyMode] = useState("flashcard");
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [knownIds, setKnownIds] = useState([]);
  const [unknownIds, setUnknownIds] = useState([]);
  const fileRef = useRef(null);
  const imageRef = useRef(null);

  const currentFolder = folders.find(f => f.id === activeFolder);
  const folderCards = useMemo(() => cards.filter(c => c.folder_id === activeFolder), [cards, activeFolder]);
  const duplicateWordGroups = useMemo(() => {
    const groups = new Map();
    for (const card of folderCards) {
      const word = normalizeVocabulary(card.front);
      if (!word) continue;
      groups.set(word, [...(groups.get(word) || []), card]);
    }
    return [...groups.values()].filter(group => group.length > 1);
  }, [folderCards]);
  const duplicateCardIds = useMemo(
    () => new Set(duplicateWordGroups.flatMap(group => group.map(card => card.id))),
    [duplicateWordGroups]
  );
  const duplicateExtraCount = duplicateWordGroups.reduce((total, group) => total + group.length - 1, 0);
  const dailyGoal = Math.max(1, Number(dailyGoals[activeFolder]) || defaultDailyGoal);
  const dailyStats = getDailyFolderStats(reviewHistory, activeFolder, folderCards, dailyGoal);
  const studyStreak = getStudyStreak(reviewHistory, activeFolder, folderCards, dailyGoal);
  const filteredCards = useMemo(() => folderCards.filter(c =>
    `${c.front} ${c.back} ${c.plural}`.toLowerCase().includes(query.toLowerCase())
  ), [folderCards, query]);
  const existingFolderWords = useMemo(() => new Set(
    cards.filter(card => card.folder_id === bulkFolder).map(card => normalizeVocabulary(card.front))
  ), [cards, bulkFolder]);
  const validBulkCount = bulkRows.filter(row => row.front?.trim() && row.back?.trim()).length;
  const duplicateBulkCount = bulkRows.filter(row =>
    row.front?.trim() && row.back?.trim() && existingFolderWords.has(normalizeVocabulary(row.front))
  ).length;
  const newBulkCount = validBulkCount - duplicateBulkCount;
  const totalKnown = cards.filter(c => c.known).length;

  useEffect(() => {
    if (!canPersist) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ folders, cards, activeFolder, reviewHistory, dailyGoals }));
    } catch (error) {
      console.error("Không thể lưu dữ liệu WortKarte trên thiết bị:", error);
      setNotice(`Không thể lưu dữ liệu trên thiết bị: ${error.message}`);
    }
  }, [folders, cards, activeFolder, reviewHistory, dailyGoals, canPersist]);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    setIsInstalled(standalone);
    const handleInstallPrompt = event => {
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

  function toast(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
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
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      return toast("Trình duyệt này không hỗ trợ đọc văn bản.");
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    const germanVoice = window.speechSynthesis.getVoices().find(voice => voice.lang.toLowerCase().startsWith("de"));
    if (germanVoice) utterance.voice = germanVoice;
    utterance.onerror = event => {
      if (event.error !== "canceled" && event.error !== "interrupted") {
        toast("Không thể phát âm thanh. Hãy kiểm tra cài đặt âm thanh của thiết bị.");
      }
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function addFolder(e) {
    e.preventDefault();
    if (!folderName.trim()) return;
    const row = { name: folderName.trim(), color: colors[folders.length % colors.length] };
    const data = { ...row, id: crypto.randomUUID() };
    setCanPersist(true);
    setFolders(prev => [...prev, data]); setActiveFolder(data.id);
    setFolderName(""); setModal(""); toast("Đã tạo thư mục.");
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
      created_at: new Date().toISOString()
    };
    setCanPersist(true);
    setCards(prev => [card, ...prev]);
    return true;
  }

  function submitCard(e) {
    e.preventDefault();
    if (!saveCard(draft)) return;
    setDraft({ front: "", plural: "", back: "", note: "" }); setModal("");
    toast("Đã thêm thẻ từ.");
  }

  function deleteCard(card) {
    if (!confirm(`Xóa thẻ "${card.front}"?`)) return;
    setCanPersist(true);
    setCards(prev => prev.filter(c => c.id !== card.id)); toast("Đã xóa thẻ.");
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
    setCards(prev => prev.filter(card => !duplicateIds.has(card.id)));
    setView("cards");
    toast(`Đã xóa ${duplicateIds.size} thẻ trùng, mỗi từ chỉ còn 1 thẻ.`);
  }

  function startEditingFolderCard(card) {
    setEditingCardId(card.id);
    setEditingCardDraft({ front: card.front, plural: card.plural || "", back: card.back });
  }

  function updateEditingCardDraft(field, value) {
    setEditingCardDraft(prev => ({ ...prev, [field]: value }));
  }

  function saveFolderCardEdit(card) {
    const front = editingCardDraft?.front.trim();
    const back = editingCardDraft?.back.trim();
    if (!front || !back) return toast("Từ vựng và nghĩa không được để trống.");
    setCanPersist(true);
    setCards(prev => prev.map(item => item.id === card.id
      ? { ...item, front, plural: editingCardDraft.plural.trim(), back }
      : item));
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
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, known } : c));
  }

  function setFolderDailyGoal(value) {
    const goal = Math.max(1, Math.min(500, Number.parseInt(value, 10) || 1));
    setCanPersist(true);
    setDailyGoals(prev => ({ ...prev, [activeFolder]: goal }));
  }

  function openDailyReview() {
    if (!folderCards.length) return toast("Thư mục này chưa có thẻ từ.");
    const remaining = Math.max(0, dailyStats.required - dailyStats.reviewed);
    if (!remaining) return toast("Bạn đã hoàn thành mục tiêu ôn tập hôm nay!");
    const reviewedIds = new Set(Object.keys(reviewHistory[todayKey()]?.[activeFolder]?.results || {}));
    const dueCards = shuffle(folderCards.filter(card => !reviewedIds.has(card.id))).slice(0, remaining);
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
    if (mode !== "flashcard" && new Set(list.map(card => normalizeQuizAnswer(quizAnswer(card, mode))).filter(Boolean)).size < 2) {
      return toast("Cần ít nhất 2 đáp án khác nhau để tạo bài trắc nghiệm.");
    }
    const shuffledCards = shuffle(list);
    setStudyCards(shuffledCards);
    setStudyMode(mode);
    setQuizOptions(mode === "flashcard" ? [] : shuffledCards.map(card => createQuizOptions(card, list, mode)));
    setStudyIndex(0); setFlipped(false); setKnownIds([]); setUnknownIds([]);
    setSelectedAnswer(null);
    setModal("");
    setView("study");
  }

  function recordStudyAnswer(known) {
    const card = studyCards[studyIndex];
    if (known) setKnownIds(prev => [...prev, card.id]);
    else setUnknownIds(prev => [...prev, card.id]);
    markKnown(card, known);
    const day = todayKey();
    setReviewHistory(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [card.folder_id]: {
          ...prev[day]?.[card.folder_id],
          results: {
            ...prev[day]?.[card.folder_id]?.results,
            [card.id]: known
          }
        }
      }
    }));
  }

  function nextStudyCard() {
    if (studyIndex < studyCards.length - 1) { setStudyIndex(i => i + 1); setFlipped(false); }
    else setView("result");
    setSelectedAnswer(null);
  }

  function answerStudy(known) {
    recordStudyAnswer(known);
    nextStudyCard();
  }

  function chooseQuizAnswer(answer) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    recordStudyAnswer(normalizeQuizAnswer(answer) === normalizeQuizAnswer(quizAnswer(studyCards[studyIndex], studyMode)));
  }

  function importText() {
    if (!folders.length) {
      setModal("folder");
      return toast("Tạo thư mục trước khi nhập thẻ từ.");
    }
    const rows = parseVocabularyText(bulkText);
    if (!rows.length) return toast("Không nhận diện được dữ liệu. Hãy dùng dấu | hoặc tab để ngăn cột.");
    setBulkRows(rows); setBulkFolder(activeFolder); setView("import-preview");
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
    setBulkRows(rows); setBulkFolder(activeFolder);
    if (rows.length) setView("import-preview");
    else toast("Không đọc được file. Hỗ trợ TXT và CSV.");
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
      worker = await createWorker("deu+eng+vie");
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
      setBulkText(recognizedText); setBulkRows(allRows); setBulkFolder(activeFolder);
      if (allRows.length) setView("import-preview");
      else {
        setView("import");
        toast("Chưa tách được hàng/cột từ ảnh. Hãy dùng ảnh rõ, chụp thẳng bảng và thử lại.");
      }
      if (!allRows.length) return;
      toast(`Đã nhận diện ${allRows.length} dòng từ ${selectedFiles.length} ảnh.`);
    } catch (err) { toast("Không thể nhận diện ảnh: " + err.message); }
    finally {
      if (worker) await worker.terminate();
      setLoading(false);
    }
  }

  async function confirmImport() {
    const valid = bulkRows.filter(r => r.front?.trim() && r.back?.trim());
    if (!valid.length) return toast("Không có thẻ hợp lệ.");
    const folderId = bulkFolder || activeFolder;
    const existingWords = new Set(cards
      .filter(card => card.folder_id === folderId)
      .map(card => normalizeVocabulary(card.front)));
    const newRows = valid.filter(row => !existingWords.has(normalizeVocabulary(row.front)));
    if (!newRows.length) return toast("Tất cả từ hợp lệ đã có trong thư mục này.");
    const newCards = newRows.map(row => ({
      front: row.front.trim(),
      plural: row.plural?.trim() || "",
      back: row.back.trim(),
      note: row.note?.trim() || "",
      folder_id: folderId,
      id: crypto.randomUUID(),
      known: false,
      created_at: new Date().toISOString()
    }));
    setCanPersist(true);
    setCards(prev => [...newCards, ...prev]);
    setActiveFolder(folderId); setView("cards");
    const skipped = valid.length - newRows.length;
    toast(`Đã lưu ${newCards.length} thẻ mới${skipped ? `, bỏ qua ${skipped} từ đã tồn tại` : ""}.`);
  }

  function updateBulkRow(index, key, value) {
    setBulkRows(prev => prev.map((r, i) => i === index ? { ...r, [key]: value } : r));
  }

  const navItems = [
    { id: "home", label: "Tổng quan", icon: Layers3 },
    { id: "cards", label: "Thẻ từ vựng", icon: BookOpen },
    { id: "import", label: "Nhập hàng loạt", icon: Upload }
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Languages size={21}/></div><span>wort<span className="brand-accent">karte</span></span></div>
        <div className="workspace-label">KHÔNG GIAN HỌC TẬP</div>
        <nav className="main-nav">
          {navItems.map(item => <button key={item.id} className={`nav-item ${view === item.id || (item.id === "cards" && ["study","result","import-preview"].includes(view)) ? "active" : ""}`} onClick={() => {setView(item.id); setMobileNav(false);}}>
            <item.icon size={18}/><span>{item.label}</span>{item.id === "cards" && <span className="nav-count">{cards.length}</span>}
          </button>)}
        </nav>
        <div className="folder-heading"><span>THƯ MỤC CỦA TÔI</span><button title="Tạo thư mục" onClick={() => setModal("folder")}><Plus size={16}/></button></div>
        <div className="folder-list">
          {folders.map(folder => <button key={folder.id} className={`folder-item ${activeFolder === folder.id ? "selected" : ""}`} onClick={() => {setActiveFolder(folder.id); setView("cards"); setMobileNav(false);}}>
            <span className="folder-dot" style={{background: folder.color || colors[0]}}/><span className="folder-name">{folder.name}</span><span className="folder-total">{cards.filter(c => c.folder_id === folder.id).length}</span>
          </button>)}
          {!folders.length && <p className="empty-small">Chưa có thư mục</p>}
        </div>
        <div className="sidebar-bottom">
          <div className="cloud-status"><span className="status-dot online"/><span>Lưu trên thiết bị</span></div>
          <div className="profile-row"><div className="avatar">H</div><span className="profile-email">Dữ liệu riêng trên máy này</span></div>
        </div>
      </aside>

      {mobileNav && <div className="mobile-scrim" onClick={() => setMobileNav(false)}/>}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20}/></button>
          <div className="breadcrumb">Không gian học tập <ChevronRight size={14}/> <strong>{view === "home" ? "Tổng quan" : view === "import" || view === "import-preview" ? "Nhập hàng loạt" : view === "study" || view === "result" ? "Kiểm tra" : view === "folder-overview" ? "Tổng các từ vựng" : "Thẻ từ vựng"}</strong></div>
          <div className="top-actions"><span className="cloud-pill"><HardDrive size={15}/>Lưu trên thiết bị</span><button className="btn-primary install-button" onClick={installApp} disabled={isInstalled}><Download size={15}/>{isInstalled?"Đã cài đặt":"Cài ứng dụng"}</button></div>
        </header>

        <div className="content-wrap">
          {view === "home" && <Home folders={folders} cards={cards} known={totalKnown} onStudy={() => openStudySetup()} onCreate={openCardForm} onImport={openImportView} onFolder={id => {setActiveFolder(id);setView("cards");}}/>}
          {view === "cards" && <section>
            <div className="page-heading"><div><div className="eyebrow">THƯ VIỆN TỪ VỰNG</div><h1>{currentFolder?.name || "Tất cả thẻ từ"}</h1><p>Quản lý và ôn tập những từ vựng của bạn.</p></div><div className="heading-actions"><button className="btn-secondary" onClick={() => setView("folder-overview")}><Layers3 size={17}/> Tổng các từ vựng</button><button className="btn-secondary" onClick={openImportView}><Upload size={17}/> Nhập hàng loạt</button><button className="btn-primary" onClick={openCardForm}><Plus size={18}/> Tạo thẻ mới</button></div></div>
            <div className="daily-review-panel">
              <div className="daily-review-heading"><div><div className="eyebrow">THỐNG KÊ HÔM NAY</div><h2>Ôn tập mỗi ngày</h2><p>{dailyStats.complete ? "Bạn đã hoàn thành mục tiêu hôm nay." : "Ôn thẻ mới trong thư mục để hoàn thành mục tiêu."}</p></div><label className="daily-goal-control">Mục tiêu / ngày<input type="number" min="1" max="500" value={dailyGoal} onChange={e=>setFolderDailyGoal(e.target.value)}/><span>thẻ</span></label></div>
              <div className="daily-stats-grid"><div><span>Đã ôn hôm nay</span><strong>{dailyStats.reviewed} / {dailyStats.required}</strong></div><div><span>Đúng / cần ôn lại</span><strong><span className="daily-correct">{dailyStats.correct}</span> / <span className="daily-incorrect">{dailyStats.incorrect}</span></strong></div><div><span>Chuỗi hoàn thành</span><strong>{studyStreak} ngày</strong></div></div>
              <div className="daily-progress-track"><div style={{width:`${dailyStats.required ? Math.min(100, dailyStats.reviewed/dailyStats.required*100) : 0}%`}}/></div>
              <button className="btn-primary daily-review-button" onClick={openDailyReview} disabled={!folderCards.length || dailyStats.complete}><Brain size={17}/>{dailyStats.complete ? "Đã hoàn thành hôm nay" : `Ôn ${Math.max(0,dailyStats.required-dailyStats.reviewed)} thẻ hôm nay`}</button>
            </div>
            <div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm từ vựng hoặc nghĩa..."/></div><span className="muted">{filteredCards.length} thẻ từ</span><button className="btn-study" onClick={() => openStudySetup(filteredCards)}><Brain size={17}/> Kiểm tra</button></div>
            {filteredCards.length ? <div className="vocab-grid">{filteredCards.map(card => <article className="vocab-card" key={card.id}><div className="vocab-top"><span className="vocab-language">DEUTSCH</span><button className="more-button" onClick={() => deleteCard(card)} title="Xóa thẻ"><Trash2 size={16}/></button></div><div className="vocab-front-row"><div className="vocab-front">{card.front}</div><button className="voice-button" onClick={()=>speakGerman(card.front)} title={`Phát âm ${card.front}`} aria-label={`Phát âm ${card.front}`}><Volume2 size={18}/></button></div><div className="vocab-bottom"><span className="vocab-hint">Nhấn khi ôn tập để lật thẻ</span>{card.plural && <span className="plural-tag">{card.plural}</span>}</div><div className="vocab-translation">{card.back}</div></article>)}</div> : <EmptyState title="Chưa có thẻ từ nào" text="Tạo thẻ đầu tiên hoặc nhập danh sách từ vựng có sẵn." action={openCardForm}/>}
          </section>}

          {view === "folder-overview" && <section>
            <div className="page-heading"><div><div className="eyebrow">TỔNG CÁC TỪ VỰNG</div><h1>{currentFolder?.name || "Thư mục"}</h1><p>Xem toàn bộ thẻ và kiểm tra từ bị trùng trong thư mục này.</p></div><button className="btn-secondary" onClick={() => setView("cards")}><ChevronLeft size={17}/> Quay lại thẻ từ</button></div>
            <div className="preview-toolbar folder-overview-toolbar"><span>{folderCards.length} thẻ · {duplicateWordGroups.length} từ bị lặp · {duplicateExtraCount} thẻ dư</span><button className="btn-primary" onClick={removeFolderDuplicates} disabled={!duplicateExtraCount}><Check size={17}/> Lưu lại, giữ 1 thẻ mỗi từ</button></div>
            {folderCards.length ? <div className="table-wrap"><table><thead><tr><th>TỪ VỰNG (MẶT TRƯỚC)</th><th>SỐ NHIỀU</th><th>NGHĨA (MẶT SAU)</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>{folderCards.map(card=>{const duplicate=duplicateCardIds.has(card.id);const editing=editingCardId===card.id;return <tr key={card.id} className={duplicate?"duplicate-row":""}><td>{editing?<input className="folder-edit-input" aria-label="Từ vựng" value={editingCardDraft.front} onChange={e=>updateEditingCardDraft("front",e.target.value)}/>:card.front}</td><td>{editing?<input className="folder-edit-input" aria-label="Số nhiều" value={editingCardDraft.plural} onChange={e=>updateEditingCardDraft("plural",e.target.value)}/>:card.plural||"—"}</td><td>{editing?<input className="folder-edit-input" aria-label="Nghĩa" value={editingCardDraft.back} onChange={e=>updateEditingCardDraft("back",e.target.value)}/>:card.back}</td><td><span className={`duplicate-status ${duplicate?"is-duplicate":"is-new"}`}><span className="duplicate-checkbox">{duplicate&&<Check size={12}/>}</span>{duplicate?"Trùng lặp":"Không trùng"}</span></td><td><div className="folder-edit-actions">{editing?<><button className="icon-button folder-save-button" title="Lưu thay đổi" aria-label="Lưu thay đổi" onClick={()=>saveFolderCardEdit(card)}><Save size={16}/></button><button className="icon-button" title="Hủy sửa" aria-label="Hủy sửa" onClick={cancelFolderCardEdit}><X size={16}/></button></>:<button className="icon-button" title={`Sửa ${card.front}`} aria-label={`Sửa ${card.front}`} onClick={()=>startEditingFolderCard(card)}><Pencil size={16}/></button>}</div></td></tr>;})}</tbody></table></div> : <EmptyState title="Thư mục chưa có thẻ" text="Thêm thẻ từ hoặc nhập danh sách để bắt đầu." action={openCardForm}/>}
          </section>}

          {view === "import" && <ImportView bulkText={bulkText} setBulkText={setBulkText} onParse={importText} onFile={importFile} onImages={importImages} fileRef={fileRef} imageRef={imageRef} loading={loading}/>}
          {view === "import-preview" && <section><div className="page-heading"><div><div className="eyebrow">KIỂM TRA DỮ LIỆU</div><h1>Xem trước thẻ từ</h1><p>Kiểm tra dữ liệu và các từ đã có trong thư mục trước khi lưu.</p></div><button className="btn-secondary" onClick={() => setView("import")}><ChevronLeft size={17}/> Quay lại</button></div><div className="preview-toolbar"><span>{validBulkCount} thẻ hợp lệ · {newBulkCount} thẻ mới · {duplicateBulkCount} từ đã tồn tại</span><select value={bulkFolder} onChange={e => setBulkFolder(e.target.value)}>{folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select><button className="btn-primary" onClick={confirmImport} disabled={!newBulkCount}><Check size={17}/> Lưu {newBulkCount} thẻ mới</button></div><div className="table-wrap"><table><thead><tr><th>TỪ VỰNG (MẶT TRƯỚC)</th><th>SỐ NHIỀU</th><th>NGHĨA (MẶT SAU)</th><th>TRẠNG THÁI</th><th></th></tr></thead><tbody>{bulkRows.map((row,i)=>{const isDuplicate=Boolean(row.front?.trim()&&row.back?.trim()&&existingFolderWords.has(normalizeVocabulary(row.front)));return <tr key={i} className={isDuplicate?"duplicate-row":""}><td><input value={row.front} onChange={e=>updateBulkRow(i,"front",e.target.value)}/></td><td><input value={row.plural || ""} onChange={e=>updateBulkRow(i,"plural",e.target.value)} placeholder="—"/></td><td><input value={row.back} onChange={e=>updateBulkRow(i,"back",e.target.value)}/></td><td><span className={`duplicate-status ${isDuplicate?"is-duplicate":"is-new"}`}><span className="duplicate-checkbox">{isDuplicate&&<Check size={12}/>}</span>{isDuplicate?"Đã có":"Mới"}</span></td><td><button className="icon-button danger" onClick={()=>setBulkRows(p=>p.filter((_,n)=>n!==i))}><Trash2 size={16}/></button></td></tr>;})}</tbody></table></div></section>}

          {view === "study" && studyCards[studyIndex] && <StudyView card={studyCards[studyIndex]} index={studyIndex} total={studyCards.length} mode={studyMode} options={quizOptions[studyIndex] || []} selectedAnswer={selectedAnswer} flipped={flipped} setFlipped={setFlipped} onAnswer={answerStudy} onChooseAnswer={chooseQuizAnswer} onContinue={nextStudyCard} onSpeak={speakGerman} onExit={()=>setView("cards")}/>}
          {view === "result" && <div className="result-wrap"><div className="result-icon"><GraduationCap size={34}/></div><div className="eyebrow">HOÀN THÀNH BUỔI HỌC</div><h1>Bạn đã hoàn thành!</h1><p className="muted">Tiếp tục luyện tập để ghi nhớ từ vựng lâu hơn nhé.</p><div className="result-stats"><div><CheckCircle2 color="#159b78"/><strong>{knownIds.length}</strong><span>Đã thuộc</span></div><div><XCircle color="#e16b78"/><strong>{unknownIds.length}</strong><span>Cần ôn lại</span></div><div><Layers3 color="#6d5dfc"/><strong>{studyCards.length}</strong><span>Tổng số từ</span></div></div><div className="result-actions"><button className="btn-primary" onClick={()=>startStudy(studyMode, studyCards.filter(c=>unknownIds.includes(c.id)))}>Ôn lại từ chưa thuộc</button><button className="btn-secondary" onClick={()=>setView("cards")}>Về thư viện</button></div></div>}
        </div>
      </main>

      {modal === "card" && <Modal title="Tạo thẻ từ mới" onClose={()=>setModal("")}><form className="modal-form" onSubmit={submitCard}><label>Từ vựng tiếng Đức <input autoFocus value={draft.front} onChange={e=>setDraft({...draft,front:e.target.value})} placeholder="Ví dụ: der Fehler" required/></label><label>Số nhiều <input value={draft.plural} onChange={e=>setDraft({...draft,plural:e.target.value})} placeholder="Ví dụ: die Fehler (không bắt buộc)"/></label><label>Nghĩa tiếng Việt <textarea value={draft.back} onChange={e=>setDraft({...draft,back:e.target.value})} placeholder="Ví dụ: Lỗi, sai sót" required rows="3"/></label><label>Ghi chú / ví dụ <textarea value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})} placeholder="Không bắt buộc" rows="2"/></label><button className="btn-primary full" type="submit"><Plus size={17}/> Lưu thẻ từ</button></form></Modal>}
      {modal === "folder" && <Modal title="Tạo thư mục mới" onClose={()=>setModal("")}><form className="modal-form" onSubmit={addFolder}><label>Tên thư mục<input autoFocus value={folderName} onChange={e=>setFolderName(e.target.value)} placeholder="Ví dụ: Lektion 5 — A2" required/></label><button className="btn-primary full" type="submit"><FolderPlus size={17}/> Tạo thư mục</button></form></Modal>}
      {modal === "study" && <Modal title="Chọn kiểu kiểm tra" onClose={()=>setModal("")}><div className="study-mode-list"><p className="muted">Chọn cách ôn tập cho {studySourceCards.length} thẻ từ.</p><button className="study-mode-option" onClick={()=>startStudy("flashcard")}><strong>Lật thẻ từ vựng</strong><span>Xem từ tiếng Đức rồi tự nhớ nghĩa tiếng Việt.</span></button><button className="study-mode-option" onClick={()=>startStudy("de-to-vi")}><strong>Trắc nghiệm: Đức → Việt</strong><span>Hiện từ tiếng Đức, chọn đáp án nghĩa tiếng Việt.</span></button><button className="study-mode-option" onClick={()=>startStudy("vi-to-de")}><strong>Trắc nghiệm: Việt → Đức</strong><span>Hiện nghĩa tiếng Việt, chọn đáp án từ tiếng Đức.</span></button></div></Modal>}
      {modal === "install" && <Modal title="Cài WortKarte lên thiết bị" onClose={()=>setModal("")}><div className="install-help"><p>Ứng dụng được cài miễn phí từ trình duyệt. Hãy mở đường dẫn HTTPS của ứng dụng bằng:</p><div><strong>iPhone / iPad</strong><span>Mở bằng Safari → nhấn nút Chia sẻ → chọn <b>Thêm vào Màn hình chính</b> → nhấn Thêm.</span></div><div><strong>Android</strong><span>Mở bằng Chrome → nhấn menu ⋮ → <b>Cài đặt ứng dụng</b> hoặc <b>Thêm vào màn hình chính</b>.</span></div><div><strong>Windows / máy tính bảng</strong><span>Mở bằng Chrome hoặc Edge → nhấn biểu tượng cài đặt trên thanh địa chỉ, hoặc menu → <b>Cài đặt WortKarte</b>.</span></div><small>Cần triển khai ứng dụng lên hosting HTTPS trước khi chia sẻ. Dữ liệu thẻ hiện lưu riêng trên từng thiết bị.</small></div></Modal>}
      {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}
      {loading && <div className="loading-overlay"><div className="spinner"/><span>Đang xử lý...</span></div>}
    </div>
  );
}

function Home({folders,cards,known,onStudy,onCreate,onImport,onFolder}) {
  const percent = cards.length ? Math.round(known/cards.length*100) : 0;
  return <section><div className="welcome-banner"><div className="welcome-copy"><div className="eyebrow light">CHÀO MỪNG BẠN TRỞ LẠI</div><h1>Học một chút mỗi ngày,<br/>tiến bộ từng ngày.</h1><p>Biến những từ vựng khó nhớ thành kiến thức của riêng bạn.</p><div className="welcome-actions"><button className="btn-white" onClick={onStudy}><Brain size={17}/> Bắt đầu ôn tập</button><button className="btn-glass" onClick={onCreate}><Plus size={17}/> Tạo thẻ mới</button></div></div><div className="banner-art"><div className="art-card art-back">WortKarte</div><div className="art-card art-front"><span>DEUTSCH</span><strong>Từ vựng</strong><small>Thẻ của bạn</small></div><div className="sparkle sparkle-one">✦</div><div className="sparkle sparkle-two">✧</div></div></div>
    <div className="section-title"><div><h2>Tổng quan học tập</h2><p>Theo dõi tiến độ ghi nhớ từ vựng của bạn.</p></div></div>
    <div className="stats-grid"><Stat icon={BookOpen} label="Tổng số thẻ" value={cards.length} tint="purple"/><Stat icon={Folder} label="Thư mục" value={folders.length} tint="green"/><Stat icon={CheckCircle2} label="Đã ghi nhớ" value={known} tint="orange"/><Stat icon={Brain} label="Tiến độ ghi nhớ" value={`${percent}%`} tint="pink"/></div>
    <div className="home-columns"><div className="panel"><div className="panel-heading"><div><h3>Thư mục gần đây</h3><p>Chọn một bộ từ để bắt đầu học.</p></div><button className="link-button" onClick={()=>folders[0]&&onFolder(folders[0].id)}>Xem thư mục</button></div>{folders.length?folders.slice(0,4).map(f=><button className="folder-row" key={f.id} onClick={()=>onFolder(f.id)}><span className="folder-icon" style={{background:`${f.color}18`,color:f.color}}><Folder size={19}/></span><span className="folder-row-name"><strong>{f.name}</strong><small>{cards.filter(c=>c.folder_id===f.id).length} thẻ từ</small></span><ChevronRight size={18}/></button>):<p className="muted">Bạn chưa có thư mục nào.</p>}</div><div className="panel quick-panel"><div className="quick-icon"><Sparkles size={21}/></div><h3>Bắt đầu thật dễ dàng</h3><p>Thêm từng từ hoặc nhập cả danh sách từ sách, tài liệu và ảnh chụp.</p><button className="quick-action" onClick={onImport}><ImagePlus size={17}/> Nhập từ văn bản / ảnh <ChevronRight size={16}/></button><div className="quick-tip"><CircleHelp size={15}/> Mẹo: dùng dấu | để phân tách 3 cột từ, số nhiều và nghĩa.</div></div></div>
  </section>;
}
function Stat({icon:Icon,label,value,tint}) {return <div className="stat-card"><div className={`stat-icon ${tint}`}><Icon size={19}/></div><span>{label}</span><strong>{value}</strong></div>;}
function EmptyState({title,text,action}) {return <div className="empty-state"><div className="empty-icon"><BookOpen size={27}/></div><h3>{title}</h3><p>{text}</p><button className="btn-primary" onClick={action}><Plus size={17}/> Tạo thẻ đầu tiên</button></div>;}
function ImportView({bulkText,setBulkText,onParse,onFile,onImages,fileRef,imageRef,loading}) {
  return <section><div className="page-heading"><div><div className="eyebrow">THÊM NHIỀU TỪ CÙNG LÚC</div><h1>Nhập hàng loạt</h1><p>Tiết kiệm thời gian bằng cách nhập văn bản, file hoặc ảnh chụp.</p></div></div>
    <div className="import-methods"><div className="import-card"><div className="import-card-icon purple-bg"><FileText size={22}/></div><h3>Dán văn bản</h3><p>Nhập danh sách từ vựng theo từng dòng.</p><textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} rows="9" placeholder={"der Fehler | die Fehler | Lỗi, sai sót\ndie Prüfung | die Prüfungen | Kỳ thi\ndas Geschenk | die Geschenke | Món quà\nstattfinden | | diễn ra"}/><div className="format-hint">Định dạng: <b>Từ vựng | Số nhiều | Nghĩa</b></div><button className="btn-primary full" onClick={onParse}><Sparkles size={17}/> Phân tích văn bản</button></div>
    <div className="import-card"><div className="import-card-icon green-bg"><Upload size={22}/></div><h3>Tải file lên</h3><p>Hỗ trợ file TXT và CSV có 2 hoặc 3 cột.</p><div className="upload-zone" onClick={()=>fileRef.current?.click()}><Upload size={25}/><strong>Chọn file từ thiết bị</strong><span>TXT, CSV</span></div><input ref={fileRef} type="file" accept=".txt,.csv,text/plain,text/csv" hidden onChange={e=>onFile(e.target.files?.[0])}/><div className="format-hint">CSV có thể dùng tiêu đề: front, plural, back.</div></div>
    <div className="import-card"><div className="import-card-icon orange-bg"><ImagePlus size={22}/></div><h3>Nhận diện từ ảnh</h3><p>Chọn một hoặc nhiều ảnh. OCR chạy ngay trong trình duyệt, không gửi ảnh lên dịch vụ AI bên ngoài.</p><div className="upload-zone image-zone" onClick={()=>imageRef.current?.click()}><ImagePlus size={25}/><strong>Chọn ảnh để nhận diện</strong><span>PNG, JPG, WEBP · chọn được nhiều ảnh</span></div><input ref={imageRef} type="file" accept="image/*" multiple hidden onChange={e=>{onImages(e.target.files);e.target.value="";}}/><div className="format-hint">Tự tách bảng theo hàng và cột, gộp kết quả các ảnh vào một bảng xem trước. Ảnh chụp thẳng, rõ chữ cho kết quả tốt hơn.</div></div></div>
    <div className="import-example"><div className="example-icon"><CircleHelp size={18}/></div><div><strong>Ví dụ định dạng văn bản</strong><p>Mỗi dòng một thẻ. Dùng dấu <code>|</code> hoặc phím Tab để tách các cột. Nếu chỉ có 2 cột, nhập từ và nghĩa.</p></div></div>
  </section>;
}
function StudyView({card,index,total,mode,options,selectedAnswer,flipped,setFlipped,onAnswer,onChooseAnswer,onContinue,onSpeak,onExit}) {
  const isQuiz = mode !== "flashcard";
  const correctAnswer = quizAnswer(card, mode);
  const question = mode === "vi-to-de" ? card.back : card.front;
  const label = mode === "vi-to-de" ? "TIẾNG VIỆT" : "DEUTSCH";
  const title = mode === "vi-to-de" ? "TRẮC NGHIỆM · VIỆT → ĐỨC" : mode === "de-to-vi" ? "TRẮC NGHIỆM · ĐỨC → VIỆT" : "ÔN TẬP TỪ VỰNG";
  return <div className="study-screen">
    <div className="study-header"><button className="btn-secondary" onClick={onExit}><X size={17}/> Kết thúc</button><span>{title}</span><strong>{index+1} / {total}</strong></div>
    <div className="progress-track"><div style={{width:`${(index/total)*100}%`}}/></div>
    <div className="study-content">
      {isQuiz ? <>
        <div className="eyebrow">CHỌN ĐÁP ÁN ĐÚNG</div>
        <div className="quiz-prompt"><span className="vocab-language">{label}</span><div className="quiz-question-row"><strong>{question}</strong>{mode === "de-to-vi"&&<button className="voice-button" onClick={()=>onSpeak(card.front)} title={`Phát âm ${card.front}`} aria-label={`Phát âm ${card.front}`}><Volume2 size={18}/></button>}</div>{mode === "de-to-vi" && card.plural && <small>{card.plural}</small>}</div>
        <div className="quiz-options">{options.map(option => {
          const isCorrect = normalizeQuizAnswer(option) === normalizeQuizAnswer(correctAnswer);
          const isSelected = option === selectedAnswer;
          const stateClass = selectedAnswer === null ? "" : isCorrect ? " correct" : isSelected ? " incorrect" : "";
          return <div key={option} className="quiz-option-row"><button className={`quiz-option${stateClass}`} disabled={selectedAnswer !== null} onClick={()=>onChooseAnswer(option)}>{option}</button>{mode === "vi-to-de"&&<button className="voice-button" onClick={()=>onSpeak(option)} title={`Phát âm ${option}`} aria-label={`Phát âm ${option}`}><Volume2 size={17}/></button>}</div>;
        })}</div>
        {selectedAnswer !== null && <div className={`quiz-feedback ${normalizeQuizAnswer(selectedAnswer) === normalizeQuizAnswer(correctAnswer) ? "correct" : "incorrect"}`}>{normalizeQuizAnswer(selectedAnswer) === normalizeQuizAnswer(correctAnswer) ? "Chính xác!" : <>Chưa chính xác. Đáp án đúng: <strong>{correctAnswer}</strong></>}</div>}
        <button className="btn-primary quiz-continue" disabled={selectedAnswer === null} onClick={onContinue}>{index === total - 1 ? "Xem kết quả" : "Câu tiếp theo"} <ChevronRight size={17}/></button>
      </> : <>
        <div className="eyebrow">HÃY NHỚ LẠI TỪ NÀY</div>
        <div className={`flip-card ${flipped?"is-flipped":""}`} onClick={()=>setFlipped(v=>!v)} role="button" tabIndex="0" onKeyDown={e=>e.key==="Enter"&&setFlipped(v=>!v)}>
          <div className="flip-inner"><div className="flip-face flip-front"><span className="vocab-language">DEUTSCH</span><div className="flip-word-row"><strong>{card.front}</strong><button className="voice-button" onClick={event=>{event.stopPropagation();onSpeak(card.front);}} title={`Phát âm ${card.front}`} aria-label={`Phát âm ${card.front}`}><Volume2 size={18}/></button></div>{card.plural&&<small>{card.plural}</small>}<span className="flip-hint"><RotateCcw size={15}/> Nhấn để xem nghĩa</span></div><div className="flip-face flip-back"><span className="vocab-language">TIẾNG VIỆT</span><strong>{card.back}</strong>{card.note&&<small>{card.note}</small>}<span className="flip-hint"><RotateCcw size={15}/> Nhấn để quay lại</span></div></div>
        </div>
        <p className="study-instruction">{flipped?"Bạn có nhớ từ này không?":"Hãy thử nhớ nghĩa trước khi lật thẻ."}</p>
        <div className="answer-actions"><button className="answer-no" onClick={()=>onAnswer(false)}><XCircle size={19}/> Chưa thuộc</button><button className="answer-yes" onClick={()=>onAnswer(true)}><CheckCircle2 size={19}/> Đã thuộc</button></div>
        <div className="study-keyboard">Bạn có thể nhấn vào thẻ để lật mặt sau.</div>
      </>}
    </div>
  </div>;
}
function Modal({title,children,onClose}) {return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={19}/></button></div>{children}</div></div>;}
export default App;