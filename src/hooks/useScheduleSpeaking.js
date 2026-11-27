import { useSpeaking } from "./useSpeaking";
import { SCHEDULE_TOPICS } from "../lib/scheduleTopics";

// Kho riêng để đề "Thống nhất lịch trình" không lẫn với 49 đề Goethe A2.
// Bản v2 chuyển sang đề A/B nên xóa sạch dữ liệu của danh mục 19 đề cũ.
const LEGACY_STORAGE_KEY = "wortkarte.speaking.schedule.v1";

try {
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
} catch {
  // localStorage có thể bị chặn; bỏ qua.
}

const SCHEDULE_CONFIG = {
  storageKey: "wortkarte.speaking.schedule.v2",
  catalog: SCHEDULE_TOPICS,
  idPrefix: "schedule-speaking",
};

export function useScheduleSpeaking() {
  return useSpeaking(SCHEDULE_CONFIG);
}
