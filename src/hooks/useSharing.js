import { useEffect, useState } from "react";
import { colors } from "../lib/appData";
import {
  createFolderShareUrl,
  readFolderShareCode,
  readFolderShareToken,
  readShareHashParams,
  readShareLink,
  readSpeakingShareCode,
  readSpeakingShareToken,
} from "../lib/folderSharing";

export function useSharing({
  library,
  speaking,
  scheduleSpeaking,
  toast,
  setNotice,
  setModal,
  setView,
}) {
  const [shareUrl, setShareUrl] = useState("");
  const [sharedFolder, setSharedFolder] = useState(null);
  const [sharedSpeaking, setSharedSpeaking] = useState(null);
  const [sharedLinkDraft, setSharedLinkDraft] = useState("");
  const [openingSharedLink, setOpeningSharedLink] = useState(false);
  const [sharingFolder, setSharingFolder] = useState(false);

  useEffect(() => {
    const { shortCode, longToken, speakingCode, speakingToken } = readShareHashParams();
    if (!shortCode && !longToken && !speakingCode && !speakingToken) return;

    let cancelled = false;
    const sharePromise = speakingCode
      ? readSpeakingShareCode(speakingCode)
      : speakingToken
        ? readSpeakingShareToken(speakingToken)
        : shortCode
          ? readFolderShareCode(shortCode)
          : readFolderShareToken(longToken);

    sharePromise
      .then((share) => {
        if (cancelled) return;
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`
        );
        if (share.type === "speaking") {
          setSharedSpeaking(share);
          setModal("shared-speaking");
        } else {
          setSharedFolder(share);
          setModal("shared-folder");
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Không thể mở link chia sẻ:", error);
        setNotice(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function shareCurrentFolder() {
    if (!library.currentFolder || !library.folderCards.length) {
      return toast("Thư mục cần có ít nhất một thẻ từ để chia sẻ.");
    }
    setSharingFolder(true);
    try {
      setShareUrl(await createFolderShareUrl(library.currentFolder, library.folderCards));
      setModal("share-folder");
    } catch (error) {
      console.error("Không thể tạo link chia sẻ thư mục:", error);
      toast(`Không thể tạo link chia sẻ: ${error.message}`);
    } finally {
      setSharingFolder(false);
    }
  }

  // Nhận cả link thư mục từ vựng lẫn link đề tài luyện nói trong cùng một ô.
  async function openSharedLink() {
    setOpeningSharedLink(true);
    try {
      const share = await readShareLink(sharedLinkDraft);
      setSharedLinkDraft("");
      if (share.type === "speaking") {
        setSharedSpeaking(share);
        setModal("shared-speaking");
      } else {
        setSharedFolder(share);
        setModal("shared-folder");
      }
    } catch (error) {
      console.error("Không thể mở link chia sẻ:", error);
      toast(error.message);
    } finally {
      setOpeningSharedLink(false);
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
      await navigator.share({
        title: library.currentFolder?.name || "WortKarte",
        url: shareUrl,
      });
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Không thể chia sẻ link thư mục:", error);
      toast(`Không thể chia sẻ link: ${error.message}`);
    }
  }

  function importSharedFolder() {
    if (!sharedFolder) return;
    const baseName = sharedFolder.folder.name;
    const existingNames = new Set(library.folders.map((folder) => folder.name.toLocaleLowerCase()));
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
      color: sharedFolder.folder.color || colors[library.folders.length % colors.length],
    };
    const newCards = sharedFolder.cards.map((card) => ({
      ...card,
      id: crypto.randomUUID(),
      folder_id: folderId,
      known: false,
      created_at: new Date().toISOString(),
    }));

    library.setCanPersist(true);
    library.setFolders((previous) => [...previous, newFolder]);
    library.setCards((previous) => [...newCards, ...previous]);
    library.setActiveFolder(folderId);
    setView("cards");
    setSharedFolder(null);
    setModal("");
    toast(`Đã thêm thư mục "${name}" với ${newCards.length} thẻ vào thiết bị này.`);
  }

  function importSharedSpeaking() {
    if (!sharedSpeaking) return;
    // Đề có hai phiếu A/B thuộc "Thống nhất lịch trình", đề thường thuộc "Luyện nói".
    const scheduleTopics = sharedSpeaking.topics.filter(
      (topic) => topic.sheets?.A && topic.sheets?.B
    );
    const plainTopics = sharedSpeaking.topics.filter(
      (topic) => !(topic.sheets?.A && topic.sheets?.B)
    );
    const addedSchedule = scheduleTopics.length
      ? scheduleSpeaking?.addBoards(scheduleTopics) || 0
      : 0;
    const addedPlain = plainTopics.length ? speaking.addBoards(plainTopics) : 0;
    const added = addedSchedule + addedPlain;

    setView(addedSchedule ? "schedule-speaking" : "speaking");
    setSharedSpeaking(null);
    setModal("");
    if (!added) {
      toast("Các đề tài này đã có trong danh sách luyện nói.");
      return;
    }
    if (addedSchedule && addedPlain) {
      toast(
        `Đã thêm ${addedSchedule} đề lịch trình và ${addedPlain} đề nói vào thiết bị này.`
      );
    } else if (addedSchedule) {
      toast(`Đã thêm ${addedSchedule} đề Thống nhất lịch trình vào thiết bị này.`);
    } else {
      toast(`Đã thêm ${addedPlain} đề tài luyện nói vào thiết bị này.`);
    }
  }

  function closeSharedFolder() {
    setSharedFolder(null);
    setModal("");
  }

  function closeSharedSpeaking() {
    setSharedSpeaking(null);
    setModal("");
  }

  return {
    shareUrl,
    sharedFolder,
    sharedSpeaking,
    sharedLinkDraft,
    setSharedLinkDraft,
    openingSharedLink,
    sharingFolder,
    shareCurrentFolder,
    openSharedLink,
    // Giữ tên cũ để các component cũ không bị lỗi nếu còn gọi tới.
    openSharedFolderLink: openSharedLink,
    copyShareLink,
    sendShareLink,
    importSharedFolder,
    closeSharedFolder,
    importSharedSpeaking,
    closeSharedSpeaking,
  };
}
