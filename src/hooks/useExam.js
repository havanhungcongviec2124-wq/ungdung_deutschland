import { useCallback, useState } from "react";
import { gradeExamItems, startExamSpeaking } from "../lib/aiExam";
import { buildExam } from "../lib/examBuilder";
import { evaluateExam, countToScore } from "../lib/examLevels";

function itemId(task, suffix) {
  return suffix ? `${task.id}::${suffix}` : task.id;
}

function collectItems(section, state) {
  if (!section || !Array.isArray(section.tasks)) return [];
  const items = [];
  for (const task of section.tasks) {
    const answer = String(state.taskAnswers[task.id] || "").trim();
    if (answer) {
      items.push({
        id: itemId(task),
        taskType: task.taskType || section.type,
        prompt: task.prompt,
        hints: task.hints || [],
        reference: task.reference || "",
        answer,
        maxScore: 25,
        taskId: task.id,
      });
    }
    const answers = state.followUpAnswers[task.id] || {};
    for (const followUp of state.followUps[task.id] || []) {
      const followAnswer = String(answers[followUp.id] || "").trim();
      if (!followAnswer) continue;
      items.push({
        id: itemId(task, followUp.id),
        taskType: "speaking",
        prompt: followUp.question,
        hints: followUp.hint ? [followUp.hint] : [],
        reference: "",
        answer: followAnswer,
        maxScore: 25,
        taskId: task.id,
      });
    }
  }
  return items;
}

function averageScore(items, grades) {
  if (!items.length) return 0;
  const sum = items.reduce((total, item) => total + (Number(grades[item.id]?.score) || 0), 0);
  return Math.min(25, Math.round(sum / items.length));
}

const EMPTY_STATE = {
  taskAnswers: {},
  followUps: {},
  followUpAnswers: {},
  grades: {},
  answers: {},
};

export default function useExam(cards = []) {
  const [levelId, setLevelId] = useState("");
  const [exam, setExam] = useState(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [state, setState] = useState(EMPTY_STATE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const selectLevel = useCallback((id) => {
    setLevelId(id);
    setExam(null);
    setSectionIndex(0);
    setState(EMPTY_STATE);
    setError("");
    setResult(null);
  }, []);

  const startExam = useCallback(() => {
    if (!levelId) return;
    setExam(buildExam(levelId, cards));
    setSectionIndex(0);
    setState(EMPTY_STATE);
    setError("");
    setResult(null);
  }, [levelId, cards]);

  const exitExam = useCallback(() => {
    setExam(null);
    setSectionIndex(0);
    setState(EMPTY_STATE);
    setError("");
    setResult(null);
  }, []);

  const setMcqAnswer = useCallback((questionId, option) => {
    setState((previous) => ({
      ...previous,
      answers: { ...previous.answers, [questionId]: option },
    }));
  }, []);

  const setTaskAnswer = useCallback((taskId, value) => {
    setState((previous) => ({
      ...previous,
      taskAnswers: { ...previous.taskAnswers, [taskId]: value },
    }));
  }, []);

  const setFollowUpAnswer = useCallback((taskId, followUpId, value) => {
    setState((previous) => ({
      ...previous,
      followUpAnswers: {
        ...previous.followUpAnswers,
        [taskId]: { ...(previous.followUpAnswers[taskId] || {}), [followUpId]: value },
      },
    }));
  }, []);

  // Sinh câu hỏi phụ cho phần nói: một yêu cầu AI cho mỗi Teil.
  const generateFollowUps = useCallback(
    async (section, task) => {
      const answer = String(state.taskAnswers[task.id] || "").trim();
      if (!answer) {
        setError("Hãy viết câu trả lời tiếng Đức trước khi tiếp tục hội thoại.");
        return false;
      }
      setBusy(true);
      setError("");
      try {
        const followUps = await startExamSpeaking(levelId, task.prompt, task.hints || [], answer);
        setState((previous) => ({
          ...previous,
          followUps: { ...previous.followUps, [task.id]: followUps },
        }));
        return true;
      } catch (caught) {
        setError(caught?.message || "Không tạo được câu hỏi phụ. Hãy thử lại.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [levelId, state.taskAnswers]
  );

  // Chấm tất cả bài tự luận của một phần, chia thành từng nhóm nhỏ để AI phản hồi nhanh.
  const gradeSection = useCallback(
    async (section) => {
      const items = collectItems(section, state);
      if (!items.length) {
        setError("Hãy trả lời ít nhất một câu trong phần này trước khi nộp.");
        return false;
      }
      setBusy(true);
      setError("");
      try {
        const nextGrades = { ...state.grades };
        for (let offset = 0; offset < items.length; offset += 4) {
          const grades = await gradeExamItems(levelId, items.slice(offset, offset + 4));
          grades.forEach((grade, index) => {
            nextGrades[items[offset + index].id] = grade;
          });
        }
        setState((previous) => ({ ...previous, grades: nextGrades }));
        return true;
      } catch (caught) {
        setError(caught?.message || "AI chấm điểm tạm thời không khả dụng. Hãy thử lại.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [levelId, state]
  );

  const finishExam = useCallback(() => {
    if (!exam) return;
    const scores = {};
    const details = [];
    for (const section of exam.sections) {
      if (section.type === "grammar" || section.type === "listening" || section.type === "reading") {
        const correct = section.questions.filter((question) => state.answers[question.id] === question.answer).length;
        const score = section.type === "grammar"
          ? correct
          : countToScore(correct, section.questions.length);
        scores[section.type === "grammar" ? "grammarCorrect" : section.type === "listening" ? "horen" : "lesen"] = score;
        details.push({
          id: section.id,
          title: section.title,
          type: section.type,
          correct,
          total: section.questions.length,
          score,
          questions: section.questions,
        });
      } else {
        const items = collectItems(section, state);
        const score = averageScore(items, state.grades);
        const key = section.type === "writing" ? "schreiben" : section.type === "speaking" ? "sprechen" : `a1-${section.type}`;
        scores[key] = score;
        details.push({ id: section.id, title: section.title, type: section.type, score, items });
      }
    }

    const a1Scores = exam.levelId === "A1.1" || exam.levelId === "A1.2"
      ? {
          "Viết lại câu": scores["a1-rewrite"] || 0,
          "4 thẻ từ": scores["a1-cards"] || 0,
          Sprechen: scores.sprechen || 0,
          ...(exam.levelId === "A1.2" ? { Schreiben: scores.schreiben || 0 } : {}),
        }
      : undefined;

    const evaluation = evaluateExam(exam.levelId, {
      grammarCorrect: scores.grammarCorrect || 0,
      horen: scores.horen || 0,
      lesen: scores.lesen || 0,
      schreiben: scores.schreiben || 0,
      sprechen: scores.sprechen || 0,
      a1Scores,
    });

    setResult({
      levelId: exam.levelId,
      sections: details,
      evaluation,
      answers: state.answers,
      grades: state.grades,
      taskAnswers: state.taskAnswers,
      followUps: state.followUps,
      followUpAnswers: state.followUpAnswers,
      finishedAt: Date.now(),
    });
    setExam(null);
    setSectionIndex(0);
  }, [exam, state]);

  const nextSection = useCallback(() => {
    if (!exam) return;
    if (sectionIndex < exam.sections.length - 1) {
      setSectionIndex((index) => index + 1);
      setError("");
      return;
    }
    finishExam();
  }, [exam, sectionIndex, finishExam]);

  return {
    levelId,
    exam,
    sectionIndex,
    state,
    busy,
    error,
    result,
    setError,
    setSectionIndex,
    selectLevel,
    startExam,
    exitExam,
    setMcqAnswer,
    setTaskAnswer,
    setFollowUpAnswer,
    generateFollowUps,
    gradeSection,
    nextSection,
    finishExam,
  };
}
