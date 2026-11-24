// 19 phiếu "Findet einen Termin" / "Wann könnt ihr euch treffen?", trích từ
// 16 ảnh Aufgabenblatt, lịch tuần và lịch kỳ nghỉ GOETHE A2 của người dùng.
// blocks: { start, end, label } — end là dòng GIỜ CUỐI CÙNG được hoạt động chiếm
// (inclusive), nên 08.00 – 09.00 chiếm đúng 2 dòng 08.00 và 09.00 trên bản giấy.
const HOUR_SLOTS = Array.from({ length: 14 }, (_, index) =>
  `${String(index + 8).padStart(2, "0")}.00`
);

function hourlyTopic({ id, label, question, caption, activities }) {
  const blocks = activities.map(([start, end, activity]) => ({ start, end, label: activity }));
  return {
    id,
    label,
    question,
    hints: blocks.map((block) => `${block.start} – ${block.end}: ${block.label}?`),
    schedule: { caption, columns: ["Uhrzeit", "Termin"], slots: HOUR_SLOTS, blocks },
  };
}

function dayTopic({ id, label, question, caption, days }) {
  const rows = days.map(([day, activity]) => [day, activity]);
  return {
    id,
    label,
    question,
    hints: rows.map(([day, activity]) => `${day}: ${activity}?`),
    schedule: { caption, columns: ["Tag / Datum", "Termin"], rows },
  };
}

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

  hourlyTopic({
    id: "termin-6",
    label: "Aufgabe A · Samstag, 08.12.",
    question: "Ihr wollt am Samstag zusammen für den Englischtest am Montag lernen. Findet einen Termin.",
    caption: "Samstag, 08.12.",
    activities: [
      ["08.00", "10.00", "Einkaufen"],
      ["10.00", "12.00", "Zimmer aufräumen"],
      ["12.00", "14.00", "Mittagessen"],
      ["16.00", "17.00", "im Garten arbeiten"],
      ["18.00", "19.00", "am Computer spielen"],
    ],
  }),
  hourlyTopic({
    id: "termin-7",
    label: "Aufgabe B · Samstag, 08.12.",
    question: "Ihr wollt am Samstag zusammen für den Englischtest am Montag lernen. Findet einen Termin.",
    caption: "Samstag, 08.12.",
    activities: [
      ["09.00", "10.00", "Fußball-Training"],
      ["11.00", "12.00", "Zahnarzt"],
      ["13.00", "15.00", "in die Stadt gehen"],
      ["16.00", "17.00", "Hausaufgaben"],
      ["18.00", "19.00", "Paul treffen"],
      ["20.00", "21.00", "ins Kino gehen"],
    ],
  }),
  dayTopic({
    id: "termin-8",
    label: "Wochenplan · Termine",
    question: "Seht euch den Wochenplan an. Wann passt es euch, etwas zusammen zu machen?",
    caption: "Wochenplan",
    days: [
      ["Montag, abends", "für den Mathe-Test lernen"],
      ["Dienstag, nachmittags", "neue Sportschuhe kaufen"],
      ["Mittwoch, nachmittags", "Volleyballtraining"],
      ["Donnerstag, abends", "Tante Gabi kommt."],
      ["Freitag, abends", "Marias Party"],
      ["Samstag, nachmittags", "Fahrrad reparieren"],
      ["Sonntag, abends", "früh ins Bett!"],
    ],
  }),
  hourlyTopic({
    id: "termin-9",
    label: "Aufgabe A · Samstag, 10.05.",
    question: "Wann könnt ihr euch treffen?",
    caption: "Samstag, 10.05.",
    activities: [
      ["08.00", "09.00", "ausschlafen"],
      ["10.00", "12.00", "frühstücken"],
      ["14.00", "15.00", "Flaschen zum Recycling-Container bringen"],
      ["17.00", "19.00", "Abendessen"],
      ["20.00", "21.00", "mit Freunden chatten"],
    ],
  }),
  hourlyTopic({
    id: "termin-10",
    label: "Aufgabe B · Samstag, 10.05.",
    question: "Wann könnt ihr euch treffen?",
    caption: "Samstag, 10.05.",
    activities: [
      ["08.00", "09.00", "gemütlich frühstücken"],
      ["12.00", "13.00", "Hund ausführen"],
      ["15.00", "16.00", "Treffen mit Olaf"],
      ["17.00", "18.00", "Oma besuchen"],
      ["18.00", "19.00", "Abendessen"],
      ["20.00", "21.00", "fernsehen"],
    ],
  }),
  hourlyTopic({
    id: "termin-11",
    label: "Aufgabe B · Dienstag, 27.03.",
    question: "Wann könnt ihr euch treffen?",
    caption: "Dienstag, 27.03.",
    activities: [
      ["10.00", "12.00", "Schulausflug"],
      ["13.00", "14.00", "ausruhen"],
      ["15.00", "16.00", "Fahrrad reparieren"],
      ["17.00", "18.00", "Friseur"],
      ["19.00", "20.00", "im Supermarkt einkaufen"],
      ["21.00", "21.00", "das neue Computerspiel ausprobieren"],
    ],
  }),
  hourlyTopic({
    id: "termin-12",
    label: "Aufgabe A · Dienstag, 27.03.",
    question: "Wann könnt ihr euch treffen?",
    caption: "Dienstag, 27.03.",
    activities: [
      ["08.00", "08.00", "frühstücken und zur Schule gehen"],
      ["09.00", "14.00", "Schule"],
      ["15.00", "17.00", "Hausaufgaben machen"],
      ["18.00", "19.00", "mit Monika chatten"],
      ["20.00", "21.00", "Fitness-Studio"],
    ],
  }),
  dayTopic({
    id: "termin-13",
    label: "Sommer · Berlin A",
    question: "Ihr wollt im Sommer nach Berlin fahren. Wann könnt ihr fahren?",
    caption: "Im Sommer nach Berlin",
    days: [
      ["Anfang Juni", "Abschlussprüfungen an der Schule"],
      ["Ende Juni", "zu Oma und Opa aufs Land"],
      ["Ende Juli", "Urlaub mit der Familie"],
      ["Mitte August", "Brieffreundin aus England kommt zu Besuch"],
      ["Ende August", "Computerkurs"],
      ["Mitte September", "Beginn des neuen Schuljahres"],
    ],
  }),
  dayTopic({
    id: "termin-14",
    label: "Sommer · zehn Tage",
    question: "Ihr wollt im Sommer für zehn Tage verreisen. Wählt einen Zeitraum. Wann könnt ihr fahren?",
    caption: "Sommerferien",
    days: [
      ["Anfang Juni", "noch Schule"],
      ["Mitte Juni", "Abschlussprüfungen"],
      ["Anfang Juli", "FOE-Prüfung in Englisch"],
      ["Ende Juli", "mit Freunden im Gebirge zelten"],
      ["Mitte August", "Urlaub mit der Familie"],
      ["Anfang September", "Vorbereitung auf das neue Schuljahr"],
      ["Ende September", "Die Schule beginnt!"],
    ],
  }),
  dayTopic({
    id: "termin-15",
    label: "Ferien · Termine A",
    question: "Ihr wollt euch in den Ferien treffen. Wann könnt ihr euch treffen?",
    caption: "Ferien",
    days: [
      ["24. Dezember", "letzte Geschenke kaufen"],
      ["25. Dezember", "Mama in der Küche helfen"],
      ["26. Dezember", "Oma besuchen"],
      ["28. Dezember", "Papas Auto waschen"],
      ["29. Dezember", "Bücherschrank ordnen"],
      ["30. Dezember", "Radtour mit Fritz"],
      ["31. Dezember", "Michael bei der Partyvorbereitung helfen"],
      ["4. Januar", "ausschlafen!"],
      ["5. Januar", "Bergwanderung im Schwarzwald"],
      ["6. Januar", "Für die Schule vorbereiten"],
    ],
  }),
  dayTopic({
    id: "termin-16",
    label: "Ferien · Wien",
    question: "Du willst dich in den Ferien mit deinem Partner treffen und über die geplante Reise nach Wien sprechen. Wann könnt ihr euch treffen?",
    caption: "Ferien · Wien",
    days: [
      ["25. Dezember", "mit Papa Garage renovieren"],
      ["26. Dezember", "Christbaum besorgen"],
      ["27. Dezember", "Christbaum aufstellen und schmücken"],
      ["28. Dezember", "Mittagessen bei Oma und Opa"],
      ["29. Dezember", "mit Papa Garage renovieren"],
      ["30. Dezember", "Fußballtraining"],
      ["31. Dezember", "Musik-Programm für Michaels Party!"],
      ["1. Januar", "lange schlafen"],
      ["2. Januar", "Hanna beim Einkaufen begleiten"],
      ["5. Januar", "Bücher in die Stadtbibliothek zurückbringen"],
    ],
  }),
  hourlyTopic({
    id: "termin-17",
    label: "Montag, 12.07.",
    question: "Wann könnt ihr euch treffen?",
    caption: "Montag, 12.07.",
    activities: [
      ["09.00", "12.00", "Schule"],
      ["13.00", "15.00", "AG „Sport“"],
      ["16.00", "18.00", "im Supermarkt einkaufen"],
      ["20.00", "21.00", "Musik hören"],
    ],
  }),
  hourlyTopic({
    id: "termin-18",
    label: "Aufgabe A · Mittwoch, 29.08.",
    question: "Wann könnt ihr euch treffen?",
    caption: "Mittwoch, 29.08.",
    activities: [
      ["08.00", "10.00", "kleine Schwester zum Kindergarten bringen"],
      ["10.00", "12.00", "Geburtstagsgeschenk für Moria kaufen"],
      ["12.00", "13.00", "im Supermarkt einkaufen"],
      ["15.00", "16.00", "Fahrrad reparieren"],
      ["17.00", "18.00", "am Computer spielen"],
      ["19.00", "19.00", "Abendessen"],
    ],
  }),
  hourlyTopic({
    id: "termin-19",
    label: "Aufgabe B · Mittwoch, 29.08.",
    question: "Wann könnt ihr euch treffen?",
    caption: "Mittwoch, 29.08.",
    activities: [
      ["08.00", "10.00", "länger schlafen"],
      ["11.00", "13.00", "Basketball spielen"],
      ["16.00", "17.00", "auf den kleinen Bruder aufpassen"],
      ["18.00", "20.00", "mit Freunden chatten"],
      ["21.00", "21.00", "Pizza essen gehen"],
    ],
  }),
];

export function getScheduleTopic(id) {
  return SCHEDULE_TOPICS.find((topic) => topic.id === id) || null;
}
