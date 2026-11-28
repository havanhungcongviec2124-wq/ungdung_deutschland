import { shuffle } from "./appData";
import { isB1Level, skillQuestionCount } from "./examLevels";
import { SPEAKING_TOPICS } from "./speakingTopics";
import { WRITING_TOPICS } from "./writingTopics";
import {
  A12_WRITING_BANK,
  A1_REWRITE_BANK,
  B1_WRITING_BANK,
  LISTENING_BANK,
  READING_BANK,
} from "./examSkillsBank";
import { GRAMMAR_BANK } from "./examGrammarBank";
import { READING_PART_BANK } from "./examReadingPartsBank";

export const GRAMMAR_COUNT = 25;
export const SKILL_QUESTION_COUNT = 15;
// Từ A2.2: Hören dùng 3 phương án A/B/C như đề Goethe; các phần khác giữ 4 phương án.
export const LISTENING_OPTION_COUNT_FROM_A22 = 3;

function pick(list, count) {
  return shuffle(list.filter(Boolean)).slice(0, count);
}

// Chuyển phiếu A/B của mục "Thống nhất lịch trình" sang các dòng hiển thị trong đề nói.
function sheetLines(sheet) {
  if (!sheet) return [];
  const lines = [];
  if (sheet.caption) lines.push(sheet.caption);
  if (Array.isArray(sheet.blocks) && sheet.blocks.length) {
    lines.push(...sheet.blocks.map((block) => `${block.start} – ${block.end}: ${block.label}`));
  } else if (Array.isArray(sheet.rows)) {
    lines.push(...sheet.rows.map((row) => row.join(" – ")));
  } else if (Array.isArray(sheet.items)) {
    lines.push(...sheet.items.map((item) => String(item)));
  }
  return lines.filter(Boolean).slice(0, 24);
}

function mcq(question, optionCount = 4, keepOrder = false) {
  const count = Math.min(5, Math.max(2, Number(optionCount) || 4));
  const options = (keepOrder ? question.options.slice() : shuffle(question.options.slice())).slice(0, count);
  const valid = options.includes(question.answer) ? options : [question.answer, ...options.filter((option) => option !== question.answer)].slice(0, count);
  return {
    id: question.id,
    text: question.text,
    options: valid,
    answer: question.answer,
    explanation: question.explanation || "",
  };
}

function grammarSection(levelId) {
  const questions = pick(GRAMMAR_BANK[levelId] || [], GRAMMAR_COUNT).map((question) => mcq(question));
  return {
    id: `grammar-${levelId}`,
    type: "grammar",
    title: "Grammatik",
    badge: "ĐIỂM RIÊNG",
    description:
      "25 câu trắc nghiệm, lấy ngẫu nhiên từ ngân hàng riêng của trình độ này. Điểm Grammatik không cộng vào tổng 4 kỹ năng.",
    questions,
    passMark: 18,
  };
}

function listeningSection(levelId) {
  const b1 = isB1Level(levelId);
  const count = skillQuestionCount(levelId);
  const optionCount = count === 20 ? LISTENING_OPTION_COUNT_FROM_A22 : 4;
  const clips = pick(LISTENING_BANK[levelId] || [], 5).map((clip, index) => ({
    id: clip.id,
    part: b1 ? `Teil ${Math.min(3, Math.floor(index / 2) + 1)}` : "",
    script: clip.script,
    questions: clip.questions.map((question) => mcq(question, optionCount)),
  }));
  const questions = clips.flatMap((clip) => clip.questions).slice(0, count);
  const keptIds = new Set(questions.map((question) => question.id));
  const trimmed = clips
    .map((clip) => ({ ...clip, questions: clip.questions.filter((question) => keptIds.has(question.id)) }))
    .filter((clip) => clip.questions.length);
  return {
    id: `listen-${levelId}`,
    type: "listening",
    title: "Hören",
    badge: b1 ? `3 TEIL · ${count} CÂU` : `${count} CÂU`,
    description: b1
      ? `Nghe 3 Teil với ${count} câu hỏi, mỗi câu 3 phương án A/B/C, lấy ngẫu nhiên từ ngân hàng B1. Có thể nghe lại nhiều lần; transcript chỉ hiện ở trang kết quả.`
      : `Nghe bản ghi tiếng Đức bằng giọng đọc của trình duyệt, ${count} câu hỏi${count === 20 ? ", mỗi câu 3 phương án A/B/C" : ""}. Có thể nghe lại nhiều lần; transcript chỉ hiện ở trang kết quả.`,
    clips: trimmed,
    questions,
    questionsPerClip: count === 20 ? 4 : 3,
    passMark: 15,
  };
}

function readingSection(levelId) {
  const count = skillQuestionCount(levelId);
  const fromA22 = count === 20;
  const partBank = fromA22 ? READING_PART_BANK[levelId] || [] : [];
  const source = partBank.length
    ? partBank
    : pick(READING_BANK[levelId] || [], fromA22 ? 4 : 3).map((text) => ({
        ...text,
        part: "",
        kind: "detail",
      }));
  const texts = source.map((text) => {
    const isAds = text.kind === "ads";
    const optionCount = isAds ? 5 : fromA22 ? 3 : 4;
    return {
      id: text.id,
      part: text.part || "",
      kind: text.kind || "detail",
      text: text.text,
      ...(Array.isArray(text.ads) ? { ads: text.ads.map((item) => ({ ...item })) } : {}),
      questions: text.questions.map((question) => mcq(question, optionCount, isAds)),
    };
  });
  return {
    id: `read-${levelId}`,
    type: "reading",
    title: "Lesen",
    badge: `${count} CÂU`,
    description: fromA22
      ? "4 Teil · 20 câu: bài đọc thông tin, ghép thông tin theo khu vực, e-mail và ghép 5 quảng cáo A–E. Mỗi câu 3 phương án, riêng Teil 4 chọn A–E. Kỹ năng này vẫn chấm trên thang 25 điểm."
      : `Đọc ${texts.length} đoạn văn ngắn và trả lời tổng ${count} câu. Kỹ năng này vẫn được chấm trên thang 25 điểm.`,
    texts,
    questions: texts.flatMap((text) => text.questions),
    passMark: 15,
  };
}

function writingTask(item, index, levelId) {
  return {
    id: `${levelId}-write-${index + 1}-${item.id || index}`,
    taskType: "writing",
    prompt: item.question,
    hints: item.hints || [],
    format: item.format || "SMS",
    minWords: item.minWords || 20,
    maxWords: item.maxWords || 40,
    reference: item.reference || "",
    answer: "",
  };
}

function writingSection(levelId, sources = {}) {
  const sharedBank = Array.isArray(sources.writingBoards) && sources.writingBoards.length
    ? sources.writingBoards
    : WRITING_TOPICS;
  let bank;
  if (levelId === "A1.2") {
    bank = pick(sharedBank.filter((item) => /sms|brief|mail|email/i.test(item.format || "")).length
      ? sharedBank
      : A12_WRITING_BANK, 1);
  } else if (levelId === "B1.1" || levelId === "B1.2") {
    const sms = pick(sharedBank.filter((item) => item.format === "SMS"), 1);
    const mail = pick(sharedBank.filter((item) => /mail|brief/i.test(item.format || "")), 1);
    bank = sms.length || mail.length
      ? [...sms, ...mail]
      : [
          ...pick(B1_WRITING_BANK[levelId].filter((item) => item.format === "SMS"), 1),
          ...pick(B1_WRITING_BANK[levelId].filter((item) => item.format === "E-Mail"), 1),
        ];
  } else {
    const sms = pick(sharedBank.filter((item) => item.format === "SMS"), 1);
    const mail = pick(sharedBank.filter((item) => /mail|brief/i.test(item.format || "")), 1);
    bank = [...sms, ...mail];
  }
  return {
    id: `write-${levelId}`,
    type: "writing",
    title: "Schreiben",
    badge: levelId === "A1.2" ? "1 BÀI" : "2 BÀI",
    description:
      levelId === "A1.2"
        ? "Viết 1 SMS hoặc E-Mail ngẫu nhiên. AI chấm theo nội dung, ngữ pháp, chính tả và độ hoàn thành nhiệm vụ."
        : "Viết 1 SMS và 1 E-Mail. Mỗi bài được AI chấm tối đa 25 điểm; điểm Schreiben là trung bình của 2 bài.",
    tasks: bank.map((item, index) => writingTask(item, index, levelId)),
  };
}

const INTRO_PROMPTS = {
  "A1.1": {
    prompt: "Bitte stell dich kurz vor. Wie heißt du, woher kommst du und was machst du gern?",
    hints: ["Tên và tuổi", "Nơi đến", "Sở thích đơn giản"],
  },
  "A1.2": {
    prompt: "Bitte erzähl kurz von dir: deine Familie, dein Alltag und dein Deutschlernen.",
    hints: ["Gia đình", "Ngày thường", "Học tiếng Đức"],
  },
  "A2.1": {
    prompt: "Erzähl bitte etwas über deinen Alltag und deine letzten Ferien.",
    hints: ["Công việc hoặc học tập", "Kỳ nghỉ gần đây", "Dùng Perfekt nếu có thể"],
  },
  "A2.2": {
    prompt: "Stell dich bitte vor und sag, was du an deiner Stadt besonders findest.",
    hints: ["Giới thiệu bản thân", "Thành phố của bạn", "Ý kiến cá nhân"],
  },
  "B1.1": {
    prompt: "Bitte stell dich vor und beschreibe eine Situation, in der du kürzlich etwas Neues gelernt hast.",
    hints: ["Giới thiệu ngắn gọn", "Tình huống cụ thể", "Dùng Präteritum hoặc Perfekt"],
  },
  "B1.2": {
    prompt: "Stell dich bitte vor und äußere deine Meinung zu einem Thema, das dich persönlich interessiert.",
    hints: ["Giới thiệu", "Nêu quan điểm", "Biện minh cho quan điểm"],
  },
};

const PLANNING_BANK = [
  {
    id: "plan-1",
    situation:
      "Ihr wollt am Wochenende gemeinsam etwas unternehmen. Du und dein Freund haben unterschiedliche Zeit. Findet heraus, wann ihr beide könnt, und legt eine Aktivität fest.",
    boardA: ["Freitag 17–19 Uhr: frei", "Samstag 10–12 Uhr: Zahnarzt", "Samstag 14–18 Uhr: frei", "Sonntag 9–11 Uhr: frei"],
    boardB: ["Freitag 17–19 Uhr: Arbeit", "Samstag 10–12 Uhr: frei", "Samstag 14–18 Uhr: Sport", "Sonntag 9–11 Uhr: frei"],
    hints: ["Wann hast du Zeit?", "Was schlägst du vor?", "Wir könnten ...", "Einverstanden."],
  },
  {
    id: "plan-2",
    situation:
      "Ihr bereitet zusammen ein Geburtstagsgeschenk für Anna vor. Ihr habt nur am Nachmittag Zeit. Klärt, was ihr kaufen wollt und wann ihr euch trefft.",
    boardA: ["Montag 16–18 Uhr: frei", "Dienstag 16–18 Uhr: Kurs", "Mittwoch 16–18 Uhr: frei", "Donnerstag 16–18 Uhr: frei"],
    boardB: ["Montag 16–18 Uhr: frei", "Dienstag 16–18 Uhr: frei", "Mittwoch 16–18 Uhr: Arzt", "Donnerstag 16–18 Uhr: frei"],
    hints: ["Was sollen wir kaufen?", "Wann passt es dir?", "Ich schlage vor ...", "Machen wir so."],
  },
  {
    id: "plan-3",
    situation:
      "Ihr möchtet gemeinsam einen Deutschkurs in der Stadt besuchen. Vergleicht eure Termine und entscheidet euch für einen Kurs.",
    boardA: ["Mo 18 Uhr: frei", "Di 18 Uhr: frei", "Mi 18 Uhr: Familie", "Do 18 Uhr: frei"],
    boardB: ["Mo 18 Uhr: Arbeit", "Di 18 Uhr: frei", "Mi 18 Uhr: frei", "Do 18 Uhr: Sport"],
    hints: ["Welcher Kurs ist gut?", "Wann kannst du?", "Lass uns ...", "Ich bin einverstanden."],
  },
];

function planningTask(levelId, index, sources = {}) {
  const sharedBank = Array.isArray(sources.scheduleBoards) && sources.scheduleBoards.length
    ? sources.scheduleBoards
    : [];
  const plan = sharedBank.length
    ? pick(sharedBank, 1)[0]
    : pick(PLANNING_BANK, 1)[0] || PLANNING_BANK[index % PLANNING_BANK.length];
  return {
    id: `${levelId}-plan-${index}`,
    taskType: "planning",
    prompt: plan.question || plan.situation,
    hints: plan.hints || [],
    boardA: plan.sheets ? sheetLines(plan.sheets.A) : plan.boardA,
    boardB: plan.sheets ? sheetLines(plan.sheets.B) : plan.boardB,
    format: "A/B-Plan",
    minWords: 30,
    maxWords: 70,
    reference: "",
    answer: "",
  };
}

function speakingTask(item, index, levelId) {
  return {
    id: `${levelId}-speak-${index + 1}-${item.id || index}`,
    taskType: item.taskType || "speaking",
    prompt: item.prompt || item.question,
    hints: item.hints || [],
    label: item.label || `Teil ${index + 1}`,
    ...(item.boardA ? { boardA: item.boardA, boardB: item.boardB } : {}),
    minWords: item.minWords || 20,
    maxWords: item.maxWords || 60,
    reference: "",
    answer: "",
    followUps: [],
    followUpAnswers: {},
  };
}

function speakingSection(levelId, sources = {}) {
  let tasks;
  if (levelId === "A2.1") {
    const topic = pick(SPEAKING_TOPICS, 1)[0];
    tasks = [
      {
        label: "Teil 1",
        taskType: "speaking",
        prompt: topic.question,
        hints: topic.hints,
      },
    ];
  } else if (levelId === "A2.2") {
    const topic = pick(SPEAKING_TOPICS, 1)[0];
    tasks = [
      { label: "Teil 1", taskType: "speaking", ...INTRO_PROMPTS[levelId] },
      { label: "Teil 2", taskType: "speaking", prompt: topic.question, hints: topic.hints },
      planningTask(levelId, 2, sources),
    ];
  } else {
    const topic = pick(SPEAKING_TOPICS, 1)[0];
    tasks = [
      { label: "Teil 1", taskType: "speaking", ...INTRO_PROMPTS[levelId] },
      {
        label: "Teil 2",
        taskType: "speaking",
        prompt: `${topic.question} Begründe deine Antwort und gib ein Beispiel.`,
        hints: topic.hints,
      },
      planningTask(levelId, 2, sources),
    ];
  }
  return {
    id: `speak-${levelId}`,
    type: "speaking",
    title: "Sprechen",
    badge: levelId === "A2.1" ? "1 TEIL" : "3 TEIL",
    description:
      levelId === "A2.1"
        ? "Trả lời 1 chủ đề thẻ từ, sau đó AI hỏi thêm 3–4 câu để bạn phản xạ bằng tiếng Đức."
        : "Gồm Teil 1 giới thiệu, Teil 2 thẻ chủ đề và Teil 3 lên kế hoạch chung theo phiếu A/B. AI chấm giao tiếp, từ vựng, ngữ pháp và hoàn thành nhiệm vụ.",
    tasks: tasks.map((task, index) => speakingTask(task, index, levelId)),
  };
}

const DEFAULT_CARD_WORDS = [
  { front: "der Bahnhof", back: "nhà ga" },
  { front: "die Uhrzeit", back: "giờ" },
  { front: "einkaufen", back: "mua sắm" },
  { front: "der Geburtstag", back: "sinh nhật" },
  { front: "das Wetter", back: "thời tiết" },
  { front: "die Familie", back: "gia đình" },
];

function cardSection(levelId, cards) {
  const source = Array.isArray(cards) && cards.length ? cards : DEFAULT_CARD_WORDS;
  const chosen = pick(source, 4);
  return {
    id: `cards-${levelId}`,
    type: "cards",
    title: "Đặt câu với 4 thẻ từ",
    badge: "LUYỆN TẬP",
    description:
      "4 thẻ từ được lấy ngẫu nhiên từ kho thẻ từ vựng của bạn. Đặt mỗi thẻ một câu tiếng Đức; AI sửa lỗi và giải thích bằng tiếng Việt.",
    tasks: chosen.map((card, index) => ({
      id: `${levelId}-card-${index}-${card.id || index}`,
      taskType: "cards",
      prompt: `Bilde einen Satz mit dem Wort „${card.front || card.word || "Wort"}“.`,
      hints: [card.back || card.meaning || "Nghĩa của thẻ từ"].filter(Boolean),
      format: "Satz",
      minWords: 3,
      maxWords: 20,
      reference: "",
      answer: "",
    })),
  };
}

function rewriteSection(levelId) {
  return {
    id: `rewrite-${levelId}`,
    type: "rewrite",
    title: "Viết lại câu theo chủ ngữ",
    badge: "LUYỆN TẬP",
    description:
      "Viết lại câu với chủ ngữ mới. AI chấm đúng ngữ pháp, đưa ra câu mẫu và giải thích lỗi bằng tiếng Việt.",
    tasks: pick(A1_REWRITE_BANK, 2).map((item, index) => ({
      id: `${levelId}-rewrite-${index}-${item.id}`,
      taskType: "rewrite",
      prompt: `${item.sentence} (=${item.subject})`,
      hints: [`Chủ ngữ mới: ${item.subject}`],
      format: "Satz",
      minWords: 3,
      maxWords: 20,
      reference: item.answer,
      answer: "",
      source: { sentence: item.sentence, subject: item.subject, answer: item.answer },
    })),
  };
}

export function buildExam(levelId, cards = [], sources = {}) {
  const sections = [grammarSection(levelId)];
  if (levelId === "A1.1") {
    sections.push(rewriteSection(levelId), cardSection(levelId, cards), speakingSection(levelId, sources));
  } else if (levelId === "A1.2") {
    sections.push(
      writingSection(levelId, sources),
      speakingSection(levelId, sources),
      rewriteSection(levelId),
      cardSection(levelId, cards)
    );
  } else {
    sections.push(
      listeningSection(levelId),
      readingSection(levelId),
      writingSection(levelId, sources),
      speakingSection(levelId, sources)
    );
  }
  return { levelId, sections, startedAt: Date.now() };
}

// Lấy vài đề mẫu nhỏ gửi cho AI; nội dung vẫn do ngân hàng của từng trình độ quyết định.
export function examGenerationSamples(exam) {
  const requests = [];
  const mcqSample = (question) => ({
    text: question.text,
    options: question.options,
    answer: question.answer,
  });
  for (const section of exam?.sections || []) {
    if (section.type === "grammar") {
      requests.push({
        section: "grammar",
        count: 25,
        samples: pick(section.questions, 3).map(mcqSample),
      });
    } else if (section.type === "listening") {
      requests.push({
        section: "listening",
        count: section.clips.length,
        questionsPerClip: section.questionsPerClip || 3,
        optionCount: section.questions[0]?.options?.length || 4,
        samples: pick(section.clips, 2).map((clip) => ({
          script: String(clip.script || "").slice(0, 320),
          questions: clip.questions.slice(0, 1).map(mcqSample),
        })),
      });
    } else if (section.type === "reading") {
      requests.push({
        section: "reading",
        count: section.texts.length,
        optionCount: section.texts[0]?.questions?.[0]?.options?.length || 4,
        parts: section.texts.map((text) => ({
          part: text.part,
          kind: text.kind || "detail",
          options: text.questions[0]?.options?.length || 4,
          ads: (text.ads || []).map((item) => String(item.text || "").slice(0, 120)),
        })),
        samples: pick(section.texts, 2).map((text) => ({
          part: text.part,
          kind: text.kind,
          text: String(text.text || "").slice(0, 360),
          ads: (text.ads || []).map((item) => `${item.label}. ${String(item.text || "").slice(0, 120)}`),
          questions: text.questions.slice(0, 1).map(mcqSample),
        })),
      });
    } else if (section.type === "speaking") {
      const tasks = section.tasks.filter((task) => !task.boardA && task.taskType !== "planning");
      if (tasks.length) {
        requests.push({
          section: "speaking",
          count: tasks.length,
          samples: tasks.map((task) => ({ prompt: task.prompt, hints: task.hints })),
        });
      }
    } else if (section.type === "rewrite") {
      requests.push({
        section: "rewrite",
        count: section.tasks.length,
        samples: section.tasks.map((task) => ({
          sentence: task.source?.sentence || task.prompt,
          subject: task.source?.subject || "",
          answer: task.reference,
        })),
      });
    }
  }
  return requests;
}

// Ghép đề AI vào đề có sẵn; phần nào AI không trả về thì giữ nguyên đề ngân hàng.
export function applyGeneratedSections(exam, generated = []) {
  const bySection = new Map(
    (Array.isArray(generated) ? generated : [])
      .filter((item) => item && item.section)
      .map((item) => [item.section, item])
  );
  const sections = (exam?.sections || []).map((section) => {
    const data = bySection.get(section.type);
    if (!data) return section;

    if (section.type === "grammar") {
      const fresh = (data.questions || [])
        .map((question, index) => mcq({ ...question, id: `gen-g-${index}` }))
        .filter((question) => question.text && question.options.length === 4 && question.options.includes(question.answer));
      const questions = fresh.slice(0, 25);
      const seen = new Set(questions.map((question) => question.text));
      for (const question of section.questions) {
        if (questions.length >= 25) break;
        if (seen.has(question.text)) continue;
        questions.push(question);
        seen.add(question.text);
      }
      return { ...section, questions };
    }

    if (section.type === "listening") {
      const perClip = section.questionsPerClip || 3;
      const optionCount = section.questions[0]?.options?.length || 4;
      const fresh = (data.clips || []).map((clip, index) => ({
        ...clip,
        questions: clip.questions.map((question, questionIndex) =>
          mcq({ ...question, id: `gen-l-${index}-${questionIndex}` }, optionCount)
        ),
      }));
      const clips = section.clips.map((clip, index) => {
        const replacement = fresh[index];
        if (!replacement) return clip;
        const questions = replacement.questions.slice(0, perClip);
        for (const question of clip.questions) {
          if (questions.length >= perClip) break;
          questions.push(question);
        }
        return { ...clip, script: replacement.script, questions: questions.slice(0, perClip) };
      });
      return { ...section, clips, questions: clips.flatMap((clip) => clip.questions) };
    }

    if (section.type === "reading") {
      const texts = section.texts.map((text, index) => {
        const replacement = (data.texts || [])[index];
        if (!replacement) return text;
        const isAds = text.kind === "ads";
        const optionCount = text.questions[0]?.options?.length || 4;
        const fresh = (replacement.questions || []).map((question, questionIndex) =>
          mcq({ ...question, id: `gen-r-${index}-${questionIndex}` }, optionCount, isAds)
        ).filter((question) => question.options.length === optionCount && question.options.includes(question.answer));
        const questions = fresh.slice(0, 5);
        for (const question of text.questions) {
          if (questions.length >= 5) break;
          questions.push(question);
        }
        const generatedAds = (replacement.ads || [])
          .map((item) => ({ label: String(item?.label || "").slice(0, 2).toUpperCase(), text: String(item?.text || "").slice(0, 320) }))
          .filter((item) => item.label && item.text)
          .sort((a, b) => a.label.localeCompare(b.label));
        const validAds = generatedAds.length === 5 && generatedAds.map((item) => item.label).join("") === "ABCDE";
        return {
          ...text,
          text: replacement.text || text.text,
          ads: isAds && validAds ? generatedAds : text.ads,
          questions: questions.slice(0, 5),
        };
      });
      return { ...section, texts, questions: texts.flatMap((text) => text.questions) };
    }

    if (section.type === "speaking") {
      const fresh = Array.isArray(data.tasks) ? data.tasks : [];
      let cursor = 0;
      const tasks = section.tasks.map((task) => {
        if (task.boardA || task.taskType === "planning" || cursor >= fresh.length) return task;
        const replacement = fresh[cursor++];
        if (!replacement?.prompt) return task;
        return {
          ...task,
          prompt: replacement.prompt,
          hints: replacement.hints?.length ? replacement.hints : task.hints,
        };
      });
      return { ...section, tasks };
    }

    if (section.type === "rewrite") {
      const fresh = Array.isArray(data.tasks) ? data.tasks : [];
      const tasks = section.tasks.map((task, index) => {
        const replacement = fresh[index];
        if (!replacement?.sentence || !replacement?.subject) return task;
        const source = {
          sentence: replacement.sentence,
          subject: replacement.subject,
          answer: replacement.answer || task.reference,
        };
        return {
          ...task,
          prompt: `${source.sentence} (=${source.subject})`,
          hints: [`Chủ ngữ mới: ${source.subject}`],
          reference: source.answer,
          source,
        };
      });
      return { ...section, tasks };
    }

    return section;
  });
  return { ...exam, sections };
}

export function sectionAnswerCount(section) {
  if (section.type === "grammar" || section.type === "listening" || section.type === "reading") {
    return section.questions.length;
  }
  return section.tasks.length;
}
