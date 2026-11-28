// Cấu trúc bài thi thử theo từng trình độ. Mỗi level có đề riêng, không dùng chung
// một cấu trúc cho mọi cấp độ. Điểm Grammatik luôn tách riêng, không cộng vào 100.
export const GRAMMAR_TOTAL = 25;
export const GRAMMAR_PASS = 18;
export const SKILL_TOTAL = 25;
export const SKILL_PASS_TOTAL = 60;
export const SPEAKING_MIN_FROM_A22 = 15;

export const EXAM_LEVELS = [
  {
    id: "A1.1",
    label: "A1.1",
    name: "Mới bắt đầu",
    summary: "Ngữ pháp + 3 bài luyện kỹ năng cơ bản",
    structure: [
      "Grammatik · 25 câu trắc nghiệm",
      "Viết lại câu theo chủ ngữ",
      "Đặt câu với 4 thẻ từ ngẫu nhiên",
      "Giới thiệu bản thân + 3–4 câu hỏi AI",
    ],
  },
  {
    id: "A1.2",
    label: "A1.2",
    name: "Cuối A1",
    summary: "Ngữ pháp + SMS/Email + nói, kèm bài luyện bổ trợ",
    structure: [
      "Grammatik · 25 câu trắc nghiệm",
      "Schreiben · 1 SMS hoặc E-Mail ngẫu nhiên",
      "Sprechen · giới thiệu + 3–4 câu hỏi AI",
      "Luyện bổ trợ · viết lại câu và 4 thẻ từ",
    ],
  },
  {
    id: "A2.1",
    label: "A2.1",
    name: "Đầu A2",
    summary: "4 kỹ năng + ngữ pháp riêng",
    structure: [
      "Grammatik · 25 câu (điểm riêng)",
      "Hören · 15 câu",
      "Lesen · 15 câu",
      "Schreiben · 1 SMS + 1 E-Mail",
      "Sprechen · 1 chủ đề thẻ từ",
    ],
  },
  {
    id: "A2.2",
    label: "A2.2",
    name: "Cuối A2",
    summary: "4 kỹ năng, Sprechen 3 Teil",
    structure: [
      "Grammatik · 25 câu (điểm riêng)",
      "Hören · 20 câu / Lesen · 20 câu (mỗi kỹ năng /25)",
      "Schreiben · 1 SMS + 1 E-Mail",
      "Sprechen · Teil 1 + Teil 2 + Teil 3",
    ],
  },
  {
    id: "B1.1",
    label: "B1.1",
    name: "Đầu B1",
    summary: "Cấu trúc Goethe B1 rút gọn",
    structure: [
      "Grammatik · 25 câu (điểm riêng)",
      "Hören · 3 Teil / 20 câu",
      "Lesen · 20 câu (mỗi kỹ năng /25)",
      "Schreiben · 2 nhiệm vụ",
      "Sprechen · 3 Teil",
    ],
  },
  {
    id: "B1.2",
    label: "B1.2",
    name: "Cuối B1",
    summary: "Cấu trúc Goethe B1, yêu cầu cao hơn",
    structure: [
      "Grammatik · 25 câu (điểm riêng)",
      "Hören · 3 Teil / 20 câu",
      "Lesen · 20 câu (mỗi kỹ năng /25)",
      "Schreiben · 2 nhiệm vụ nâng cao",
      "Sprechen · 3 Teil nâng cao",
    ],
  },
];

const LEVEL_MAP = Object.fromEntries(EXAM_LEVELS.map((level) => [level.id, level]));

export function getExamLevel(id) {
  return LEVEL_MAP[id] || null;
}

export function isA1Level(id) {
  return id === "A1.1" || id === "A1.2";
}

export function hasFourSkills(id) {
  return !isA1Level(id);
}

export function needsSpeakingMinimum(id) {
  return id === "A2.2" || id === "B1.1" || id === "B1.2";
}

export function isB1Level(id) {
  return id === "B1.1" || id === "B1.2";
}

// Từ A2.2 trở đi Hören và Lesen có 20 câu; A2.1 giữ 15 câu. Cả hai vẫn quy về /25.
export function skillQuestionCount(levelId) {
  return needsSpeakingMinimum(levelId) ? 20 : 15;
}

export function countToScore(correct, count, total = SKILL_TOTAL) {
  if (!count) return 0;
  return Math.max(0, Math.min(total, Math.round((Number(correct) || 0) * total / count)));
}

export function evaluateExam(levelId, scores) {
  const grammar = {
    correct: scores.grammarCorrect || 0,
    total: GRAMMAR_TOTAL,
    passed: (scores.grammarCorrect || 0) >= GRAMMAR_PASS,
  };

  if (isA1Level(levelId)) {
    return {
      type: "a1",
      grammar,
      skills: scores.a1Scores || {},
      passed: grammar.passed,
      reason: grammar.passed
        ? "Bạn đã đỗ phần Grammatik và hoàn thành các bài luyện kỹ năng."
        : `Bạn cần ít nhất ${GRAMMAR_PASS}/${GRAMMAR_TOTAL} câu Grammatik đúng để đỗ phần này.`,
      weakSkills: Object.entries(scores.a1Scores || {})
        .filter(([, value]) => Number(typeof value === "object" ? value?.score : value) < 15)
        .map(([key]) => key),
    };
  }

  const skillEntries = [
    ["Hören", Number(scores.horen) || 0],
    ["Lesen", Number(scores.lesen) || 0],
    ["Schreiben", Number(scores.schreiben) || 0],
    ["Sprechen", Number(scores.sprechen) || 0],
  ];
  const total = skillEntries.reduce((sum, [, value]) => sum + value, 0);
  const weakSkills = skillEntries
    .filter(([, value]) => value < 15)
    .map(([name]) => name);
  const speakingFailed = needsSpeakingMinimum(levelId) && (Number(scores.sprechen) || 0) < SPEAKING_MIN_FROM_A22;
  const grammarFailed = !grammar.passed;
  const passed = total >= SKILL_PASS_TOTAL && !speakingFailed && !grammarFailed;

  let reason = `Tổng 4 kỹ năng ${total}/100 đạt ngưỡng ${SKILL_PASS_TOTAL}/100 và Grammatik đạt ${grammar.correct}/25.`;
  if (speakingFailed && grammarFailed) {
    reason = `Tổng ${total}/100 nhưng Grammatik chỉ ${grammar.correct}/25 (cần ${GRAMMAR_PASS}/25) và Sprechen chỉ ${
      Number(scores.sprechen) || 0
    }/25 (cần tối thiểu ${SPEAKING_MIN_FROM_A22}/25) nên bạn vẫn trượt.`;
  } else if (speakingFailed) {
    reason = `Tổng ${total}/100 nhưng Sprechen chỉ ${
      Number(scores.sprechen) || 0
    }/25 (cần tối thiểu ${SPEAKING_MIN_FROM_A22}/25) nên bạn vẫn trượt.`;
  } else if (grammarFailed) {
    const totalText = total >= SKILL_PASS_TOTAL
      ? `Tổng ${total}/100 đạt ngưỡng ${SKILL_PASS_TOTAL}/100 nhưng`
      : `Tổng ${total}/100 chưa đạt ngưỡng ${SKILL_PASS_TOTAL}/100 và`;
    reason = `${totalText} Grammatik chỉ ${grammar.correct}/25 (cần ${GRAMMAR_PASS}/25) nên bạn vẫn trượt.`;
  } else if (total < SKILL_PASS_TOTAL) {
    reason = `Tổng ${total}/100 chưa đạt ngưỡng ${SKILL_PASS_TOTAL}/100.`;
  }

  return {
    type: "four-skills",
    grammar,
    skills: Object.fromEntries(skillEntries),
    total,
    passed,
    reason,
    weakSkills,
  };
}
