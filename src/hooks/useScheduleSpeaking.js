import { useSpeaking } from "./useSpeaking";
import { SCHEDULE_TOPICS } from "../lib/scheduleTopics";

// Kho riêng để đề "Thống nhất lịch trình" không lẫn với 49 đề Goethe A2.
const SCHEDULE_CONFIG = {
  storageKey: "wortkarte.speaking.schedule.v1",
  catalog: SCHEDULE_TOPICS,
  idPrefix: "schedule-speaking",
};

export function useScheduleSpeaking() {
  return useSpeaking(SCHEDULE_CONFIG);
}
