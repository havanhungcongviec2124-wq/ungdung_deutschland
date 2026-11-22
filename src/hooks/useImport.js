import { useMemo, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import { normalizeVocabulary } from "../lib/appData";
import { parseOcrTable, parseOcrText, parseVocabularyText } from "../lib/parser";

export function useImport({ library, toast, setNotice, setModal, setView }) {
  const [bulkText, setBulkText] = useState("");
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkFolder, setBulkFolder] = useState("");
  const [pendingImages, setPendingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const imageRef = useRef(null);

  const existingFolderWords = useMemo(
    () =>
      new Set(
        library.cards
          .filter((card) => card.folder_id === bulkFolder)
          .map((card) => normalizeVocabulary(card.front))
      ),
    [library.cards, bulkFolder]
  );

  const validBulkCount = bulkRows.filter((row) => row.front?.trim() && row.back?.trim()).length;
  const duplicateBulkCount = bulkRows.filter(
    (row) =>
      row.front?.trim() &&
      row.back?.trim() &&
      existingFolderWords.has(normalizeVocabulary(row.front))
  ).length;
  const newBulkCount = validBulkCount - duplicateBulkCount;

  function importText() {
    if (!library.folders.length) {
      setModal("folder");
      return toast("Tạo thư mục trước khi nhập thẻ từ.");
    }
    const rows = parseVocabularyText(bulkText);
    if (!rows.length) {
      return toast("Không nhận diện được dữ liệu. Hãy dùng dấu | hoặc tab để ngăn cột.");
    }
    setBulkRows(rows);
    setBulkFolder(library.activeFolder);
    setView("import-preview");
  }

  async function importFile(file) {
    if (!file) return;
    if (!library.folders.length) {
      setModal("folder");
      return toast("Tạo thư mục trước khi nhập thẻ từ.");
    }
    const text = await file.text();
    setBulkText(text);
    const rows = parseVocabularyText(text);
    setBulkRows(rows);
    setBulkFolder(library.activeFolder);
    if (rows.length) setView("import-preview");
    else toast("Không đọc được file. Hỗ trợ TXT và CSV.");
  }

  function queueImages(files) {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    if (!library.folders.length) {
      setModal("folder");
      return toast("Tạo thư mục trước khi nhập thẻ từ.");
    }
    setPendingImages((previous) => [...previous, ...selectedFiles]);
    toast(`Đã chọn thêm ${selectedFiles.length} ảnh.`);
  }

  async function importImages(files) {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    if (!library.folders.length) {
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
      setBulkFolder(library.activeFolder);
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
    } catch (error) {
      toast("Không thể nhận diện ảnh: " + error.message);
    } finally {
      if (worker) await worker.terminate();
      setLoading(false);
    }
  }

  function confirmImport() {
    const valid = bulkRows.filter((row) => row.front?.trim() && row.back?.trim());
    if (!valid.length) return toast("Không có thẻ hợp lệ.");
    const folderId = bulkFolder || library.activeFolder;
    const existingWords = new Set(
      library.cards
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
    library.setCanPersist(true);
    library.setCards((previous) => [...newCards, ...previous]);
    library.setActiveFolder(folderId);
    setView("cards");
    const skipped = valid.length - newRows.length;
    toast(
      `Đã lưu ${newCards.length} thẻ mới${
        skipped ? `, bỏ qua ${skipped} từ đã tồn tại` : ""
      }.`
    );
  }

  function updateBulkRow(index, key, value) {
    setBulkRows((previous) =>
      previous.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row))
    );
  }

  function removeBulkRow(index) {
    setBulkRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index));
  }

  function removeImage(index) {
    setPendingImages((previous) => previous.filter((_, imageIndex) => imageIndex !== index));
  }

  function clearImages() {
    setPendingImages([]);
  }

  return {
    bulkText,
    setBulkText,
    bulkRows,
    setBulkRows,
    bulkFolder,
    setBulkFolder,
    pendingImages,
    setPendingImages,
    loading,
    fileRef,
    imageRef,
    existingFolderWords,
    validBulkCount,
    duplicateBulkCount,
    newBulkCount,
    importText,
    importFile,
    queueImages,
    importImages,
    confirmImport,
    updateBulkRow,
    removeBulkRow,
    removeImage,
    clearImages,
    normalizeVocabulary,
  };
}
