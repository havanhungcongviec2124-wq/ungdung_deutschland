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

export function useSpeaking() {
  const [boards, setBoards] = useState(readSpeakingBoards);
  const [overrides, setOverrides] = useState(readSpeakingOverrides);
  const [hidden, setHidden] = useState(readSpeakingHidden);

  useEffect(() => {
    saveSpeakingData(boards, overrides, hidden);
  }, [boards, overrides, hidden]);

  const allBoards = useMemo(() => {
    const list = SPEAKING_TOPICS.filter((topic) => !hidden.includes(topic.id)).map((topic) => ({
      ...topic,
      ...(overrides[topic.id] || {}),
      library: true,
      edited: Boolean(overrides[topic.id]),
    }));
    const catalogKeys = new Set([...SPEAKING_TOPICS.map(topicKey), ...list.map(topicKey)]);
    for (const board of boards) {
      // Bỏ các đề tài thư viện đã từng được thêm vào bộ nhớ ở phiên bản cũ.
      if (catalogKeys.has(topicKey(board))) continue;
      list.push({ ...board, library: false });
    }
    return list;
  }, [boards, overrides, hidden]);

  function addBoards(topics) {
    const added = makeSpeakingBoards(topics, boards);
    if (added.length) setBoards((current) => [...added, ...current]);
    return added.length;
  }

  function removeBoard(id) {
    if (SPEAKING_TOPICS.some((topic) => topic.id === id)) {
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
    if (topic.library) {
      setOverrides((current) => ({ ...current, [topic.id]: { question, hints } }));
    } else {
      setBoards((current) =>
        current.map((board) =>
          board.id === topic.id ? { ...board, question, hints } : board
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
    removeBoard,
    restoreHiddenTopics,
    updateTopic,
    resetTopic,
  };
}
