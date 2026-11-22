import { useEffect, useState } from "react";
import { colors } from "../lib/appData";
import {
  createFolderShareUrl,
  readFolderShareCode,
  readFolderShareLink,
  readFolderShareToken,
} from "../lib/folderSharing";

export function useSharing({ library, toast, setNotice, setModal, setView }) {
  const [shareUrl, setShareUrl] = useState("");
  const [sharedFolder, setSharedFolder] = useState(null);
  const [sharedLinkDraft, setSharedLinkDraft] = useState("");
  const [openingSharedLink, setOpeningSharedLink] = useState(false);
  const [sharingFolder, setSharingFolder] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const shortCode = params.get("s");
    const longToken = params.get("share");
    if (!shortCode && !longToken) return;

    const sharedFolderPromise = shortCode
      ? readFolderShareCode(shortCode)
      : readFolderShareToken(longToken);

    sharedFolderPromise
      .then((share) => {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`
        );
        setSharedFolder(share);
        setModal("shared-folder");
      })
      .catch((error) => {
        console.error("Không thể mở link chia sẻ thư mục:", error);
        setNotice(error.message);
      });
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

  async function openSharedFolderLink() {
    setOpeningSharedLink(true);
    try {
      const share = await readFolderShareLink(sharedLinkDraft);
      setSharedFolder(share);
      setSharedLinkDraft("");
      setModal("shared-folder");
    } catch (error) {
      console.error("Không thể mở link chia sẻ thư mục:", error);
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

  function closeSharedFolder() {
    setSharedFolder(null);
    setModal("");
  }

  return {
    shareUrl,
    sharedFolder,
    sharedLinkDraft,
    setSharedLinkDraft,
    openingSharedLink,
    sharingFolder,
    shareCurrentFolder,
    openSharedFolderLink,
    copyShareLink,
    sendShareLink,
    importSharedFolder,
    closeSharedFolder,
  };
}
