// 5 phiếu "Findet einen Termin" / "Wann könnt ihr euch treffen?", trích từ
// các Aufgabenblatt và lịch tuần trong bộ ảnh GOETHE A2 của người dùng.
// blocks: { start, end, label } — end là giờ KẾT THÚC ( exclusive ), nên một
// hoạt động từ 08.00 đến 09.00 chiếm đúng 2 dòng 08.00 và 09.00 trên bản giấy.
export const SCHEDULE_TOPICS = [
  {
    id: "termin-1",
    label: "Aufgabe A · Sonnabend",
    question: "Ihr wollt am Sonnabend Kleidung für den Sommer kaufen gehen. Findet einen Termin.",
    hints: [
      "08.00 – 09.00: joggen?",
      "11.00 – 12.00: Anja im Café treffen?",
      "14.00 – 16.00: Einladungen zur Geburtstagsparty schreiben?",
      "16.00 – 18.00: Zimmer aufräumen?",
      "19.00 – 21.00: Rock-Konzert besuchen?",
    ],
    schedule: {
      caption: "Sonnabend, 18. Mai",
      columns: ["Uhrzeit", "Termin"],
      slots: [
        "08.00", "09.00", "10.00", "11.00", "12.00", "13.00", "14.00",
        "15.00", "16.00", "17.00", "18.00", "19.00", "20.00", "21.00",
      ],
      blocks: [
        { start: "08.00", end: "09.00", label: "joggen" },
        { start: "11.00", end: "12.00", label: "Anja im Café treffen" },
        { start: "14.00", end: "16.00", label: "Einladungen zur Geburtstagsparty schreiben" },
        { start: "16.00", end: "18.00", label: "Zimmer aufräumen" },
        { start: "19.00", end: "21.00", label: "Rock-Konzert besuchen" },
      ],
    },
  },
  {
    id: "termin-2",
    label: "Aufgabe B · Sonnabend",
    question: "Ihr wollt am Sonnabend Kleidung für den Sommer kaufen gehen. Findet einen Termin.",
    hints: [
      "08.00 – 09.00: zum Bäcker gehen?",
      "10.00 – 12.00: Radtour im Wald?",
      "13.00 – 15.00: bei Paul zu Mittag essen?",
      "15.00 – 17.00: Handy zur Reparatur bringen?",
      "20.00 – 21.00: Gitarre spielen?",
    ],
    schedule: {
      caption: "Sonnabend, 18. Mai",
      columns: ["Uhrzeit", "Termin"],
      slots: [
        "08.00", "09.00", "10.00", "11.00", "12.00", "13.00", "14.00",
        "15.00", "16.00", "17.00", "18.00", "19.00", "20.00", "21.00",
      ],
      blocks: [
        { start: "08.00", end: "09.00", label: "zum Bäcker gehen" },
        { start: "10.00", end: "12.00", label: "Radtour im Wald" },
        { start: "13.00", end: "15.00", label: "bei Paul zu Mittag essen" },
        { start: "15.00", end: "17.00", label: "Handy zur Reparatur bringen" },
        { start: "20.00", end: "21.00", label: "Gitarre spielen" },
      ],
    },
  },
  {
    id: "termin-3",
    label: "Aufgabe A · Freitag",
    question: "Wann könnt ihr euch treffen?",
    hints: [
      "08.00 – 09.00: länger schlafen?",
      "12.00 – 13.00: mit Mario skaten?",
      "16.00 – 18.00: einkaufen gehen?",
      "19.00 – 20.00: E-Mail an Luise schreiben?",
    ],
    schedule: {
      caption: "Freitag, 01.11.",
      columns: ["Uhrzeit", "Termin"],
      slots: [
        "08.00", "09.00", "10.00", "11.00", "12.00", "13.00", "14.00",
        "15.00", "16.00", "17.00", "18.00", "19.00", "20.00", "21.00",
      ],
      blocks: [
        { start: "08.00", end: "09.00", label: "länger schlafen" },
        { start: "12.00", end: "13.00", label: "mit Mario skaten" },
        { start: "16.00", end: "18.00", label: "einkaufen gehen" },
        { start: "19.00", end: "20.00", label: "E-Mail an Luise schreiben" },
      ],
    },
  },
  {
    id: "termin-4",
    label: "Aufgabe B · Freitag",
    question: "Ihr habt am Freitag keine Schule. Wann könnt ihr euch treffen?",
    hints: [
      "08.00 – 10.00: gemütlich frühstücken?",
      "14.00 – 15.00: Bücher in der Bibliothek abgeben?",
      "18.00 – 19.00: mit Mama das Abendessen kochen?",
      "20.00 – 21.00: mit Freunden ins Kino?",
    ],
    schedule: {
      caption: "Freitag, 01.11.",
      columns: ["Uhrzeit", "Termin"],
      slots: [
        "08.00", "09.00", "10.00", "11.00", "12.00", "13.00", "14.00",
        "15.00", "16.00", "17.00", "18.00", "19.00", "20.00", "21.00",
      ],
      blocks: [
        { start: "08.00", end: "10.00", label: "gemütlich frühstücken" },
        { start: "14.00", end: "15.00", label: "Bücher in der Bibliothek abgeben" },
        { start: "18.00", end: "19.00", label: "mit Mama das Abendessen kochen" },
        { start: "20.00", end: "21.00", label: "mit Freunden ins Kino" },
      ],
    },
  },
  {
    id: "termin-5",
    label: "Wochenplan",
    question: "Seht euch den Wochenplan an. Wann passt es euch, etwas zusammen zu machen?",
    hints: [
      "Montag, nachmittags – Basketballtraining?",
      "Dienstag, abends – Englischunterricht?",
      "Mittwoch, abends – Lieblingssendung im Fernsehen?",
      "Donnerstag, nachmittags – mit Klaus für den Test lernen?",
      "Freitag, nachmittags – Oma besuchen?",
      "Samstag, abends – Annas Geburtstagsparty?",
      "Sonntag, abends – nichts tun!",
    ],
    schedule: {
      caption: "Wochenplan",
      columns: ["Tag", "Termin"],
      rows: [
        ["Montag", "Basketballtraining (nachmittags)"],
        ["Dienstag", "Englischunterricht (abends)"],
        ["Mittwoch", "Lieblingssendung im Fernsehen (abends)"],
        ["Donnerstag", "mit Klaus für den Test lernen / Oma besuchen (nachmittags)"],
        ["Freitag", "frei"],
        ["Samstag", "Annas Geburtstagsparty (abends)"],
        ["Sonntag", "nichts tun! (abends)"],
      ],
    },
  },
];

export function getScheduleTopic(id) {
  return SCHEDULE_TOPICS.find((topic) => topic.id === id) || null;
}
