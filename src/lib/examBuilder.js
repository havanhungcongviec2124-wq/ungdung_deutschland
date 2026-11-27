import { shuffle } from "./appData";
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

export const GRAMMAR_COUNT = 25;
export const SKILL_QUESTION_COUNT = 15;

function pick(list, count) {
  return shuffle(list.filter(Boolean)).slice(0, count);
}

function mcq(question) {
  return {
    id: question.id,
    text: question.text,
    options: shuffle(question.options.slice()),
    answer: question.answer,
    explanation: question.explanation || "",
  };
}

function grammarSection(levelId) {
  const questions = pick(GRAMMAR_BANK[levelId] || [], GRAMMAR_COUNT).map(mcq);
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
  const clips = pick(LISTENING_BANK[levelId] || [], 5).map((clip) => ({
    id: clip.id,
    script: clip.script,
    questions: clip.questions.map(mcq),
  }));
  return {
    id: `listen-${levelId}`,
    type: "listening",
    title: "Hören",
    badge: "15 CÂU",
    description:
      "Nghe bản ghi tiếng Đức bằng giọng đọc của trình duyệt, trả lời 3 câu cho mỗi đoạn. Có thể nghe lại nhiều lần; transcript chỉ hiện ở trang kết quả.",
    clips,
    questions: clips.flatMap((clip) => clip.questions),
    passMark: 15,
  };
}

function readingSection(levelId) {
  const texts = pick(READING_BANK[levelId] || [], 3).map((text) => ({
    id: text.id,
    text: text.text,
    questions: text.questions.map(mcq),
  }));
  return {
    id: `read-${levelId}`,
    type: "reading",
    title: "Lesen",
    badge: "15 CÂU",
    description:
      "Đọc 3 đoạn văn ngắn và trả lời 5 câu cho mỗi đoạn. Các đoạn và thứ tự câu hỏi được chọn ngẫu nhiên.",
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

function writingSection(levelId) {
  let bank;
  if (levelId === "A1.2") {
    bank = pick(A12_WRITING_BANK, 1);
  } else if (levelId === "B1.1" || levelId === "B1.2") {
    const sms = pick(B1_WRITING_BANK[levelId].filter((item) => item.format === "SMS"), 1);
    const mail = pick(B1_WRITING_BANK[levelId].filter((item) => item.format === "E-Mail"), 1);
    bank = [...sms, ...mail];
  } else {
    const sms = pick(WRITING_TOPICS.filter((item) => item.format === "SMS"), 1);
    const mail = pick(WRITING_TOPICS.filter((item) => item.format === "E-Mail"), 1);
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

function planningTask(levelId, index) {
  const plan = pick(PLANNING_BANK, 1)[0] || PLANNING_BANK[index % PLANNING_BANK.length];
  return {
    id: `${levelId}-plan-${index}`,
    taskType: "planning",
    prompt: plan.situation,
    hints: plan.hints,
    boardA: plan.boardA,
    boardB: plan.boardB,
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

function speakingSection(levelId) {
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
      planningTask(levelId, 2),
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
      planningTask(levelId, 2),
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
    })),
  };
}

export function buildExam(levelId, cards = []) {
  const sections = [grammarSection(levelId)];
  if (levelId === "A1.1") {
    sections.push(rewriteSection(levelId), cardSection(levelId, cards), speakingSection(levelId));
  } else if (levelId === "A1.2") {
    sections.push(
      writingSection(levelId),
      speakingSection(levelId),
      rewriteSection(levelId),
      cardSection(levelId, cards)
    );
  } else {
    sections.push(
      listeningSection(levelId),
      readingSection(levelId),
      writingSection(levelId),
      speakingSection(levelId)
    );
  }
  return { levelId, sections, startedAt: Date.now() };
}

export function sectionAnswerCount(section) {
  if (section.type === "grammar" || section.type === "listening" || section.type === "reading") {
    return section.questions.length;
  }
  return section.tasks.length;
}
