import { useEffect, useMemo, useState } from "react";
import {
  makeWritingBoards,
  readWritingBoards,
  readWritingHidden,
  readWritingOverrides,
  saveWritingData,
  topicKey,
} from "../lib/writingData";
import { WRITING_TOPICS } from "../lib/writingTopics";

function cleanHints(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim().replace(/^[-–]\s*/, ""))
    .filter(Boolean)
    .slice(0, 6);
}

export function useWriting() {
  const [boards, setBoards] = useState(readWritingBoards);
  const [overrides, setOverrides] = useState(readWritingOverrides);
  const [hidden, setHidden] = useState(readWritingHidden);

  useEffect(() => {
    saveWritingData(boards, overrides, hidden);
  }, [boards, overrides, hidden]);

  const allBoards = useMemo(() => {
    const list = WRITING_TOPICS.filter((topic) => !hidden.includes(topic.id)).map((topic) => ({
      ...topic,
      ...(overrides[topic.id] || {}),
      library: true,
      edited: Boolean(overrides[topic.id]),
    }));
    const catalogKeys = new Set([...WRITING_TOPICS.map(topicKey), ...list.map(topicKey)]);
    for (const board of boards) {
      if (!board.aiGenerated && catalogKeys.has(topicKey(board))) continue;
      list.push({ ...board, library: false });
    }
    return list;
  }, [boards, overrides, hidden]);

  function addBoards(topics) {
    const added = makeWritingBoards(topics, boards);
    if (added.length) setBoards((current) => [...added, ...current]);
    return added.length;
  }

  function addAiTopic(topic) {
    const [added] = makeWritingBoards(
      [{ ...topic, aiGenerated: true, custom: true, topicId: "ai" }],
      boards
    );
    if (added) setBoards((current) => [added, ...current]);
    return added || null;
  }

  function removeBoard(id) {
    if (WRITING_TOPICS.some((topic) => topic.id === id)) {
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
    const extra = {};
    for (const key of ["format", "minWords", "maxWords", "test", "part"]) {
      if (values?.[key] !== undefined) extra[key] = values[key];
    }
    if (topic.library) {
      setOverrides((current) => ({
        ...current,
        [topic.id]: { ...(current[topic.id] || {}), question, hints, ...extra },
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
