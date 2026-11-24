import { useEffect, useMemo, useState } from "react";
import {
  makeSpeakingBoards,
  readSpeakingBoards,
  readSpeakingHidden,
  readSpeakingOverrides,
  saveSpeakingData,
  topicKey,
} from "../lib/speakingData";
import { SPEAKING_TOPICS } from "../lib/speakingTopics";

function cleanHints(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim().replace(/^[-–]\s*/, ""))
    .filter(Boolean)
    .slice(0, 8);
}

export function useSpeaking(options = {}) {
  const catalog = options.catalog || SPEAKING_TOPICS;
  const [boards, setBoards] = useState(() => readSpeakingBoards(options));
  const [overrides, setOverrides] = useState(() => readSpeakingOverrides(options));
  const [hidden, setHidden] = useState(() => readSpeakingHidden(options));

  useEffect(() => {
    saveSpeakingData(boards, overrides, hidden, options);
  }, [boards, overrides, hidden]);

  const allBoards = useMemo(() => {
    const list = catalog.filter((topic) => !hidden.includes(topic.id)).map((topic) => ({
      ...topic,
      ...(overrides[topic.id] || {}),
      library: true,
      edited: Boolean(overrides[topic.id]),
    }));
    const catalogKeys = new Set([...catalog.map(topicKey), ...list.map(topicKey)]);
    for (const board of boards) {
      // Bỏ các đề tài thư viện đã từng được thêm vào bộ nhớ ở phiên bản cũ.
      // Đề do AI tạo thì giữ lại ngay cả khi trùng câu hỏi với thư viện.
      if (!board.aiGenerated && catalogKeys.has(topicKey(board))) continue;
      list.push({ ...board, library: false });
    }
    return list;
  }, [boards, overrides, hidden, catalog]);

  function addBoards(topics) {
    const added = makeSpeakingBoards(topics, boards, options);
    if (added.length) setBoards((current) => [...added, ...current]);
    return added.length;
  }

  function addAiTopic(topic) {
    const [added] = makeSpeakingBoards(
      [{ ...topic, aiGenerated: true, custom: true, topicId: "ai" }],
      boards,
      options
    );
    if (added) setBoards((current) => [added, ...current]);
    return added || null;
  }

  function removeBoard(id) {
    if (catalog.some((topic) => topic.id === id)) {
      setHidden((current) => (current.includes(id) ? current : [...current, id]));
      return;
    }
    setBoards((current) => current.filter((board) => board.id !== id));
  }

  function restoreHiddenTopics() {
    setHidden([]);
  }

  function updateTopic(topic, values) {
    const question = String(values?.question || "").trim();
    if (!question) return false;
    const hints = cleanHints(values?.hints);
    const schedule = values?.schedule;
    const extra = schedule ? { schedule } : {};
    if (topic.library) {
      setOverrides((current) => ({
        ...current,
        [topic.id]: { question, hints, ...extra },
      }));
    } else {
      setBoards((current) =>
        current.map((board) =>
          board.id === topic.id ? { ...board, question, hints, ...extra } : board
        )
      );
    }
    return true;
  }

  function resetTopic(topic) {
    if (!topic.library) return;
    setOverrides((current) => {
      const next = { ...current };
      delete next[topic.id];
      return next;
    });
  }

  return {
    boards,
    allBoards,
    overrides,
    hidden,
    addBoards,
    addAiTopic,
    removeBoard,
    restoreHiddenTopics,
    updateTopic,
    resetTopic,
  };
}
