import { useEffect, useState } from "react";

export function useAppInstall({ toast, setModal }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updatingApp, setUpdatingApp] = useState(false);

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
  }, [toast, setModal]);

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

  return { installPrompt, isInstalled, updatingApp, updateApp, installApp };
}
