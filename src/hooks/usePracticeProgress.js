import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wortkarte.practice.v1";
const SECTIONS = ["speaking", "schedule", "writing"];

function readStore() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result = {};
    for (const section of SECTIONS) {
      const raw = parsed[section];
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
      const counts = {};
      for (const [id, value] of Object.entries(raw)) {
        const count = Number(value);
        if (id && Number.isFinite(count) && count > 0) counts[id] = Math.min(Math.floor(count), 9999);
      }
      result[section] = counts;
    }
    return result;
  } catch {
    return {};
  }
}

// Đếm số lần người dùng nộp bài/chốt lịch cho mỗi đề, lưu riêng theo từng khu vực.
export function usePracticeProgress() {
  const [progress, setProgress] = useState(readStore);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // localStorage có thể bị chặn; bỏ qua thay vì làm hỏng giao diện.
    }
  }, [progress]);

  const recordPractice = useCallback((section, id) => {
    const key = String(id || "").trim();
    if (!SECTIONS.includes(section) || !key) return;
    setProgress((current) => {
      const sectionCounts = current[section] || {};
      return {
        ...current,
        [section]: {
          ...sectionCounts,
          [key]: Math.min((Number(sectionCounts[key]) || 0) + 1, 9999),
        },
      };
    });
  }, []);

  return { progress, recordPractice };
}
