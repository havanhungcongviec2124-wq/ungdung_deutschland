// Các đề Goethe A2 Sprechen Teil 3 dạng hai phiếu A/B, trích trực tiếp từ
// Aufgabenblatt A và Aufgabenblatt B trong ảnh của người dùng. Với lịch theo giờ,
// end là dòng GIỜ CUỐI CÙNG bị chiếm (inclusive).
const HOUR_SLOTS = Array.from({ length: 14 }, (_, index) =>
  `${String(index + 8).padStart(2, "0")}.00`
);

const STANDARD_HINTS = [
  "Jeder Kandidat bekommt eine eigene Aufgabe.",
  "Ihr sprecht auf Deutsch und findet einen gemeinsamen Termin.",
  "Am Ende sagt eine Person den Prüfern die Vereinbarung.",
];

const ACTIVITY_HINTS = [
  "Jeder Kandidat bekommt eine eigene Aufgabe.",
  "Ihr sprecht auf Deutsch und findet eine gemeinsame Lösung.",
  "Am Ende sagt eine Person den Prüfern die Vereinbarung.",
];

const EXTENDED_HOUR_SLOTS = Array.from({ length: 15 }, (_, index) =>
  `${String(index + 7).padStart(2, "0")}.00`
);

function hourSheet(caption, activities) {
  return {
    caption,
    columns: ["Uhrzeit", "Termin"],
    slots: HOUR_SLOTS,
    blocks: activities.map(([start, end, label]) => ({ start, end, label })),
  };
}

function extendedHourSheet(caption, activities) {
  return {
    caption,
    columns: ["Uhrzeit", "Termin"],
    slots: EXTENDED_HOUR_SLOTS,
    blocks: activities.map(([start, end, label]) => ({ start, end, label })),
  };
}

function rowsSheet(caption, columns, rows) {
  return { caption, columns, rows };
}

// Đề thảo luận: mỗi phiếu là một danh sách gợi ý, hai bên chốt chung một hoạt động.
function activitySheet(caption, items) {
  return { caption, columns: ["Vorschläge"], items: items.map((item) => String(item)) };
}

export const SCHEDULE_TOPICS = [
  {
    id: "termin-tierarzt-freitag",
    label: "Freitag, 01.11. · Katze zum Tierarzt",
    question:
      "Ihr habt am Freitag keine Schule und wollt eure Katze zum Tierarzt bringen. Wann könnt ihr euch treffen?",
    // Không liệt kê lịch ở thẻ đề: cả hai phiếu chỉ hiện khi bắt đầu luyện.
    hints: STANDARD_HINTS,
    sheets: {
      A: hourSheet("Freitag, 01.11. · Aufgabenblatt A", [
        ["08.00", "09.00", "länger schlafen"],
        ["12.00", "13.00", "mit Marto skaten"],
        ["16.00", "18.00", "einkaufen gehen"],
        ["19.00", "20.00", "E-Mail an Luise schreiben"],
      ]),
      B: hourSheet("Freitag, 01.11. · Aufgabenblatt B", [
        ["08.00", "10.00", "gemütlich frühstücken"],
        ["14.00", "15.00", "Bücher in der Bibliothek abgeben"],
        ["18.00", "19.00", "mit Mama das Abendessen kochen"],
        ["21.00", "21.00", "mit Freunden ins Kino"],
      ]),
    },
  },
  {
    id: "termin-kino-woche",
    label: "Kino · Montag bis Sonntag",
    question: "Ihr wollt zusammen ins Kino gehen. Findet einen Termin.",
    hints: STANDARD_HINTS,
    sheets: {
      A: rowsSheet("Aufgabenblatt A · Kino", ["Tag", "Nachmittag", "Abend"], [
        ["MONTAG", "Basketballtraining", "frei"],
        ["DIENSTAG", "frei", "Englischunterricht"],
        ["MITTWOCH", "frei", "Lieblingssendung im Fernsehen"],
        ["DONNERSTAG", "mit Klaus für den Test lernen", "frei"],
        ["FREITAG", "Oma besuchen", "frei"],
        ["SAMSTAG", "frei", "Annas Geburtstagsparty"],
        ["SONNTAG", "frei", "nichts tun!"],
      ]),
      B: rowsSheet("Aufgabenblatt B · Kino", ["Tag", "Nachmittag", "Abend"], [
        ["MONTAG", "frei", "für den Mathe-Test lernen"],
        ["DIENSTAG", "neue Sportschuhe kaufen", "frei"],
        ["MITTWOCH", "Volleyballtraining", "frei"],
        ["DONNERSTAG", "frei", "Tante Gabi kommt."],
        ["FREITAG", "frei", "Marias Party"],
        ["SAMSTAG", "Fahrrad reparieren", "frei"],
        ["SONNTAG", "frei", "früh ins Bett!"],
      ]),
    },
  },
  {
    id: "termin-kleidung-sonnabend",
    label: "Sonnabend, 18. Mai · Kleidung für den Sommer",
    question:
      "Ihr wollt am Sonnabend Kleidung für den Sommer kaufen gehen. Findet einen Termin.",
    hints: STANDARD_HINTS,
    sheets: {
      A: hourSheet("Sonnabend, 18. Mai · Aufgabenblatt A", [
        ["09.00", "09.00", "joggen"],
        ["12.00", "12.00", "Anja im Cafe treffen"],
        ["15.00", "16.00", "Einladungen zur Geburtstagsparty schreiben"],
        ["17.00", "17.00", "Zimmer aufräumen"],
        ["20.00", "21.00", "Rock-Konzert besuchen"],
      ]),
      B: hourSheet("Sonnabend, 18. Mai · Aufgabenblatt B", [
        ["08.00", "08.00", "zum Bäcker gehen"],
        ["10.00", "11.00", "Radtour im Wald"],
        ["13.00", "14.00", "bei Paul zu Mittag essen"],
        ["16.00", "17.00", "Handy zur Reparatur bringen"],
        ["21.00", "21.00", "Gitarre spielen"],
      ]),
    },
  },
  {
    id: "termin-englischtest-samstag",
    label: "Samstag, 08.12. · Englischtest lernen",
    question:
      "Ihr wollt am Samstag zusammen für den Englischtest am Montag lernen. Wann könnt ihr euch treffen?",
    hints: STANDARD_HINTS,
    sheets: {
      A: hourSheet("Samstag, 08.12. · Aufgabenblatt A", [
        ["09.00", "10.00", "Einkaufen"],
        ["11.00", "11.00", "Zimmer aufräumen"],
        ["13.00", "13.00", "Mittagessen"],
        ["16.00", "17.00", "im Garten arbeiten"],
        ["18.00", "19.00", "am Computer spielen"],
      ]),
      B: hourSheet("Samstag, 08.12. · Aufgabenblatt B", [
        ["09.00", "10.00", "Fußball-Training"],
        ["12.00", "12.00", "Zahnarzt"],
        ["14.00", "15.00", "in die Stadt gehen"],
        ["17.00", "17.00", "Hausaufgaben"],
        ["18.00", "19.00", "Paul treffen"],
        ["21.00", "21.00", "ins Kino gehen"],
      ]),
    },
  },
  {
    id: "termin-berlin-sommer",
    label: "Im Sommer zehn Tage nach Berlin",
    question:
      "Ihr wollt im Sommer für zehn Tage nach Berlin fahren. Findet einen passenden Zeitraum. Wann könnt ihr fahren?",
    hints: STANDARD_HINTS,
    sheets: {
      A: rowsSheet("Im Sommer nach Berlin · Aufgabenblatt A", ["Zeitraum", "Termin"], [
        ["Anfang Juni", "frei"],
        ["Mitte Juni", "Abschlussprüfungen an der Schule"],
        ["Ende Juni", "zu Oma und Opa aufs Land"],
        ["Anfang Juli", "frei"],
        ["Mitte Juli", "frei"],
        ["Ende Juli", "Urlaub mit der Familie"],
        ["Anfang August", "frei"],
        ["Mitte August", "Brieffreundin aus England kommt zu Besuch"],
        ["Ende August", "frei"],
        ["Anfang September", "Computerkurs"],
        ["Mitte September", "Beginn des neuen Schuljahres"],
        ["Ende September", "frei"],
      ]),
      B: rowsSheet("Im Sommer nach Berlin · Aufgabenblatt B", ["Zeitraum", "Termin"], [
        ["Anfang Juni", "noch Schule"],
        ["Mitte Juni", "Abschlussprüfungen"],
        ["Ende Juni", "frei"],
        ["Anfang Juli", "FCE-Prüfung in Englisch"],
        ["Mitte Juli", "frei"],
        ["Ende Juli", "mit Freunden im Gebirge zelten"],
        ["Anfang August", "frei"],
        ["Mitte August", "frei"],
        ["Ende August", "Urlaub mit der Familie"],
        ["Anfang September", "frei"],
        ["Mitte September", "Vorbereitung auf das neue Schuljahr"],
        ["Ende September", "Die Schule beginnt!"],
      ]),
    },
  },
  {
    id: "termin-muttertag-samstag",
    label: "Samstag, 10.05. · Geschenk zum Muttertag",
    question:
      "Ihr wollt eurer Mutter am Samstag ein Geschenk zum Muttertag kaufen. Wann könnt ihr euch treffen?",
    hints: STANDARD_HINTS,
    sheets: {
      A: hourSheet("Samstag, 10.05. · Aufgabenblatt A", [
        ["08.00", "09.00", "ausschlafen"],
        ["11.00", "11.00", "frühstücken"],
        ["14.00", "15.00", "Flaschen zum Recycling-Container bringen"],
        ["18.00", "18.00", "Abendessen"],
        ["20.00", "21.00", "mit Freunden chatten"],
      ]),
      B: hourSheet("Samstag, 10.05. · Aufgabenblatt B", [
        ["08.00", "09.00", "gemütlich frühstücken"],
        ["12.00", "13.00", "Hund ausführen"],
        ["15.00", "16.00", "Treffen mit Olaf"],
        ["18.00", "18.00", "Oma besuchen"],
        ["19.00", "19.00", "Abendessen"],
        ["20.00", "21.00", "fernsehen"],
      ]),
    },
  },
  {
    id: "termin-bibliothek-dienstag",
    label: "Dienstag, 27.03. · Stadtbibliothek",
    question:
      "Ihr wollt am Dienstag in die Stadtbibliothek gehen und Bücher ausleihen. Wann könnt ihr euch treffen?",
    hints: STANDARD_HINTS,
    sheets: {
      A: hourSheet("Dienstag, 27.03. · Aufgabenblatt A", [
        ["10.00", "12.00", "Schulausflug"],
        ["14.00", "14.00", "ausruhen"],
        ["15.00", "15.00", "Fahrrad reparieren"],
        ["18.00", "18.00", "Friseur"],
        ["19.00", "20.00", "im Supermarkt einkaufen"],
        ["21.00", "21.00", "das neue Computerspiel ausprobieren"],
      ]),
      B: hourSheet("Dienstag, 27.03. · Aufgabenblatt B", [
        ["08.00", "08.00", "Frühstück und zur Schule gehen"],
        ["10.00", "12.00", "Schule"],
        ["17.00", "18.00", "Hausaufgaben machen"],
        ["19.00", "20.00", "Fitness-Studio"],
        ["21.00", "21.00", "mit Monika chatten"],
      ]),
    },
  },
  {
    id: "termin-wien-weihnachten",
    label: "Weihnachtsferien · Klassenfahrt nach Wien",
    question:
      "Du willst dich während der Weihnachtsferien an einem Vormittag mit deinem Partner treffen und über die für Juni geplante Klassenfahrt nach Wien sprechen. Wann könnt ihr euch treffen?",
    hints: STANDARD_HINTS,
    sheets: {
      A: rowsSheet("Aufgabenblatt A · Weihnachtsferien", ["Datum", "Termin"], [
        ["23. Dezember", "letzte Geschenke kaufen"],
        ["24. Dezember", "Mama in der Küche helfen"],
        ["25. Dezember", "Oma besuchen"],
        ["26. Dezember", "Radtour mit Fritz"],
        ["27. Dezember", "Informationen für eine Schularbeit im Internet suchen"],
        ["28. Dezember", "Papas Auto waschen"],
        ["29. Dezember", "Bücherschrank ordnen"],
        ["30. Dezember", "frei"],
        ["31. Dezember", "Michael bei der Partyvorbereitung helfen"],
        ["1. Januar", "ausschlafen!"],
        ["2. Januar", "Bergwanderung im Schwarzwald"],
        ["3. Januar", "frei"],
        ["4. Januar", "Bergwanderung im Schwarzwald"],
        ["5. Januar", "frei"],
        ["6. Januar", "Vorbereitung für die Schule"],
      ]),
      B: rowsSheet("Aufgabenblatt B · Weihnachtsferien", ["Datum", "Termin"], [
        ["23. Dezember", "Christbaum besorgen"],
        ["24. Dezember", "Christbaum aufstellen und schmücken"],
        ["25. Dezember", "Mittagessen bei Oma und Opa"],
        ["26. Dezember", "frei"],
        ["27. Dezember", "Fußballtraining"],
        ["28. Dezember", "mit Papa Garage renovieren"],
        ["29. Dezember", "mit Papa Garage renovieren"],
        ["30. Dezember", "frei"],
        ["31. Dezember", "Musik-Programm für Michaels Party!"],
        ["1. Januar", "lange schlafen"],
        ["2. Januar", "Hanna beim Einkaufen begleiten"],
        ["3. Januar", "frei"],
        ["4. Januar", "Fußballtraining"],
        ["5. Januar", "Bücher in die Stadtbibliothek zurück!"],
        ["6. Januar", "für die Schule lernen"],
      ]),
    },
  },
  {
    id: "termin-freund-montag",
    label: "Montag, 12.07. · Freund besuchen",
    question:
      "Ihr wollt am Montag euren Freund besuchen, der umgezogen ist. Wann könnt ihr euch treffen?",
    hints: STANDARD_HINTS,
    sheets: {
      A: hourSheet("Montag, 12.07. · Aufgabenblatt A", [
        ["09.00", "11.00", "SCHULE"],
        ["14.00", "15.00", "Hausaufgaben machen"],
        ["17.00", "18.00", "mit Susanne Eis essen"],
        ["19.00", "20.00", "Nachhilfe in Französisch"],
        ["21.00", "21.00", "Lieblingssendung im Fernsehen"],
      ]),
      B: hourSheet("Montag, 12.07. · Aufgabenblatt B", [
        ["10.00", "11.00", "Schule"],
        ["16.00", "17.00", "im Supermarkt einkaufen"],
        ["20.00", "21.00", "Musikhören"],
      ]),
    },
  },
  {
    id: "termin-sportplatz-mittwoch",
    label: "Mittwoch, 29.08. · Sportplatz",
    question:
      "Ihr habt Ferien und wollt euch am Mittwoch auf dem Sportplatz treffen. Wann könnt ihr euch treffen?",
    hints: STANDARD_HINTS,
    sheets: {
      A: hourSheet("Mittwoch, 29.08. · Aufgabenblatt A", [
        ["08.00", "09.00", "kleine Schwester zum Kindergarten bringen"],
        ["10.00", "11.00", "Geburtstagsgeschenk für Maria kaufen"],
        ["12.00", "13.00", "im Supermarkt einkaufen"],
        ["15.00", "16.00", "Fahrrad reparieren"],
        ["17.00", "18.00", "am Computer spielen"],
        ["19.00", "19.00", "Abendessen"],
      ]),
      B: hourSheet("Mittwoch, 29.08. · Aufgabenblatt B", [
        ["08.00", "09.00", "lange schlafen"],
        ["10.00", "12.00", "Basketball spielen"],
        ["15.00", "17.00", "auf den kleinen Bruder aufpassen"],
        ["18.00", "19.00", "mit Freunden chatten"],
        ["20.00", "21.00", "Pizza essen gehen"],
      ]),
    },
  },
  {
    id: "termin-einkaufen-mittwoch",
    label: "Mittwoch · Zusammen einkaufen",
    question:
      "Sie möchten am Mittwoch zusammen einkaufen gehen. Wann haben Sie beide Zeit? Finden Sie einen Termin.",
    hints: STANDARD_HINTS,
    sheets: {
      A: extendedHourSheet("Mittwoch · Aufgabenblatt A", [
        ["07.00", "11.00", "Arbeit"],
        ["14.00", "17.00", "Deutschkurs"],
        ["20.00", "21.00", "Besuch von Nadia"],
      ]),
      B: extendedHourSheet("Mittwoch · Aufgabenblatt B", [
        ["09.00", "12.00", "Deutschkurs"],
        ["13.00", "13.00", "Zahnarzt"],
        ["16.00", "18.00", "Besuch von Jonas"],
      ]),
    },
  },
  {
    id: "termin-geburtstagsgeschenk-juli",
    label: "19. Juli · Geburtstagsgeschenk kaufen",
    question:
      "Sie wollen zusammen ein Geburtstagsgeschenk für einen Freund kaufen. Wann haben Sie beide Zeit? Finden Sie einen gemeinsamen Termin. Machen Sie Vorschläge.",
    hints: STANDARD_HINTS,
    sheets: {
      A: extendedHourSheet("19. Juli · Aufgabenblatt A", [
        ["09.00", "12.00", "Deutschkurs (bis 12 Uhr)"],
        ["13.00", "13.00", "Mittagessen mit Freunden"],
        ["14.00", "14.00", "Sport"],
        ["15.00", "15.00", "Sport"],
        ["18.00", "19.00", "Kochen und Abendessen mit Torsten"],
        ["20.00", "21.00", "Max und Leo kommen zu Besuch"],
      ]),
      B: extendedHourSheet("19. Juli · Aufgabenblatt B", [
        ["08.00", "11.00", "Arbeit (bis 11 Uhr)"],
        ["13.00", "13.00", "Kochen und Mittagessen"],
        ["14.00", "16.00", "Deutschkurs (bis 16 Uhr)"],
        ["20.00", "21.00", "Kino mit Sarah"],
      ]),
    },
  },
  {
    id: "termin-zoo-samstag",
    label: "Samstag · Zoo oder Museum",
    question:
      "Sie wollen am Samstag zusammen etwas unternehmen. Was wollen Sie machen? Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Samstag", [
        "einen Zoo besuchen",
        "Rad fahren",
        "Essen mitnehmen?",
        "am Abend zu Hause fernsehen?",
        "früh schlafen?",
      ]),
      B: activitySheet("Teilnehmer B · Samstag", [
        "ein Museum besuchen",
        "Bus fahren",
        "im Restaurant essen?",
        "am Abend einen Film im Kino sehen?",
        "später vielleicht in die Disko?",
      ]),
    },
  },
  {
    id: "termin-ausflug-sonntag",
    label: "Sonntag · Ausflug machen",
    question:
      "Sie wollen am Sonntag zusammen einen Ausflug machen. Was wollen Sie machen? Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Sonntag", [
        "mit dem Fahrrad fahren",
        "an den See",
        "schwimmen",
        "im Restaurant essen",
      ]),
      B: activitySheet("Teilnehmer B · Sonntag", [
        "mit dem Zug fahren",
        "in die Berge",
        "wandern",
        "etwas zu essen mitnehmen",
      ]),
    },
  },
  {
    id: "termin-party-samstagabend",
    label: "Samstagabend · Party planen",
    question:
      "Sie wollen am Samstagabend zusammen eine Party machen. Wer macht was? Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Party", [
        "einkaufen",
        "sich um Musik kümmern",
        "ein Zimmer leer machen",
        "Nachbarn Bescheid sagen",
      ]),
      B: activitySheet("Teilnehmer B · Party", [
        "Wohnung sauber machen",
        "Getränke kaufen",
        "Einladungen schreiben",
        "Spielen",
      ]),
    },
  },
  {
    id: "termin-deutschkurs-ausflug",
    label: "Samstag · Ausflug mit dem Deutschkurs",
    question:
      "Sie wollen am Samstag mit Ihrem Deutschkurs einen Ausflug machen. Machen Sie Vorschläge. Finden Sie gemeinsam eine Lösung.",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Deutschkurs", [
        "im Wald wandern",
        "andere Stadt besuchen",
        "Schloss besichtigen",
        "Fußballspiel ansehen",
      ]),
      B: activitySheet("Teilnehmer B · Deutschkurs", [
        "im Park grillen",
        "Museum besuchen",
        "ins Schwimmbad gehen",
        "Tierpark besuchen",
      ]),
    },
  },
  {
    id: "termin-lernplan-startdeutsch",
    label: "Lernplan für die Start Deutsch Prüfung",
    question:
      "Sie wollen zusammen für die Start Deutsch Prüfung lernen und einen Lernplan erstellen. Was wollen Sie machen? Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Lernplan", [
        "Wetterbericht im Radio hören",
        "Kurze Texte schreiben",
        "Dialog spielen",
        "Einen deutschen Film sehen",
      ]),
      B: activitySheet("Teilnehmer B · Lernplan", [
        "Nachrichten im Fernsehen ansehen",
        "Vokabeln lernen",
        "den Modelltest ausprobieren",
        "Wörter im Wörterbuch nachschlagen",
      ]),
    },
  },
  {
    id: "termin-samstag-lösung",
    label: "Samstag · Gemeinsame Lösung finden",
    question:
      "Sie wollen am Samstag zusammen etwas unternehmen. Was wollen Sie machen? Warum? Warum nicht? Finden Sie gemeinsam eine Lösung.",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Samstag", [
        "kochen",
        "Musik machen",
        "grillen",
        "spazieren gehen",
      ]),
      B: activitySheet("Teilnehmer B · Samstag", [
        "Musik hören",
        "Rad fahren",
        "Fotos machen",
        "Freunde treffen",
      ]),
    },
  },
  {
    id: "termin-sonntag-unternehmen",
    label: "Sonntag · Etwas unternehmen",
    question:
      "Sie wollen am Sonntag zusammen etwas unternehmen. Was wollen Sie machen? Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Sonntag", [
        "zu Hause fernsehen",
        "Ausflug machen",
        "Fahrrad fahren",
        "kochen",
        "Sport machen",
      ]),
      B: activitySheet("Teilnehmer B · Sonntag", [
        "ins Kino gehen",
        "ein Museum besuchen",
        "spazieren gehen",
        "im Restaurant essen",
        "schwimmen?",
      ]),
    },
  },
  {
    id: "termin-aufs-land-samstag",
    label: "Samstag · Aufs Land fahren",
    question:
      "Sie wollen am Samstag zusammen aufs Land fahren. Am Abend wieder zu Hause sein. Was können Sie unternehmen? Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Aufs Land", [
        "mit dem Zug aufs Land fahren",
        "Fahrrad fahren?",
        "schwimmen",
        "eine Grillparty machen",
      ]),
      B: activitySheet("Teilnehmer B · Aufs Land", [
        "mit dem Auto aufs Land fahren",
        "spazieren gehen",
        "Schifffahrt machen",
        "einen Ausflug machen",
      ]),
    },
  },
  {
    id: "termin-aufgabenplan-wohnung",
    label: "Aufgabenplan mit dem Wohnungspartner",
    question:
      "Sie sollen mit Ihrem Wohnungspartner einen Aufgabenplan machen. Verschiedene Aufgaben müssen in den nächsten Tagen gemacht werden. Was und wann wollen Sie machen? Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Aufgabenplan", [
        "einkaufen",
        "Geschirr abwaschen",
        "Kostenplan für die Woche?",
        "mit dem Hund spazieren gehen?",
      ]),
      B: activitySheet("Teilnehmer B · Aufgabenplan", [
        "Kleidung waschen",
        "Abendessen vorbereiten",
        "Fenster putzen",
        "Freizeitprogramm planen",
      ]),
    },
  },
  {
    id: "termin-alex-feier",
    label: "Feier für Alex · A2 bestanden",
    question:
      "Ihr gemeinsamer Freund, Alex hat die deutsche Prüfung A2 bestanden. Sie möchten ihm eine Feier machen. Schlagen Sie vor, wie Sie feiern möchten. Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Feier für Alex", [
        "Essen bei Alex (große Wohnung, aber wenige Stühle)",
        "eine Party bei Helen im Garten (großer Garten)",
        "Musik machen",
        "ins Kino gehen?",
      ]),
      B: activitySheet("Teilnehmer B · Feier für Alex", [
        "Party in Ihrer Wohnung (aber die Wohnung hat kleine Küche)",
        "ins Restaurant gehen",
        "Spielen",
        "in die Disko gehen",
      ]),
    },
  },
  {
    id: "termin-thomas-geburtstag",
    label: "Sonntag · Geburtstagsparty für Thomas",
    question:
      "Ihr gemeinsamer Freund, Thomas hat am Sonntag Geburtstag. Sie möchten ihm eine Party machen. Schlagen Sie vor, wie Sie feiern möchten. Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Party für Thomas", [
        "bei Thomas feiern",
        "Essen und Getränke",
        "Musik machen",
        "zur Karaoke gehen?",
      ]),
      B: activitySheet("Teilnehmer B · Party für Thomas", [
        "im Restaurant",
        "andere Freunde einladen",
        "Spielen",
        "in die Disko gehen",
      ]),
    },
  },
  {
    id: "termin-peter-geschenk",
    label: "Wochenende · Geschenk für Peter",
    question:
      "Ihr Freund, Peter hat am Wochenende Geburtstag. Sie wollen ihm ein Geschenk zusammen kaufen. Was wollen Sie Peter kaufen? Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Geschenk für Peter", [
        "Musik-CD",
        "Buch",
        "Eintrittskarte",
        "Blumenstrauß",
      ]),
      B: activitySheet("Teilnehmer B · Geschenk für Peter", [
        "Reiseführer",
        "Koffer",
        "Fotoapparat",
        "Computerspiel",
      ]),
    },
  },
  {
    id: "termin-freundin-geschenk",
    label: "Diese Woche · Geschenk für eine Freundin",
    question:
      "Eine Freundin hat in dieser Woche Geburtstag. Sie sind beide eingeladen und suchen jetzt ein passendes Geschenk. Was wollen Sie ihr kaufen? Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Geschenk", [
        "Parfüm (19,80 €)",
        "Pullover (29,50 €)",
        "Armband (49,50 €)",
        "ein Buch über Brasilien (9,80 €)",
      ]),
      B: activitySheet("Teilnehmer B · Geschenk", [
        "Fotoalbum (19,80 €)",
        "Bluse (20,50 €)",
        "Musikbuch (49,50 €)",
        "ein Deutsch-Wörterbuch (9,80 €)",
      ]),
    },
  },
  {
    id: "termin-paula-geschenk",
    label: "Wochenende · Geschenk für Paula",
    question:
      "Ihre Freundin, Paula hat am Wochenende Geburtstag. Sie wollen ihr ein Geschenk zusammen kaufen. Was wollen Sie Paula kaufen? Warum? Warum nicht?",
    hints: ACTIVITY_HINTS,
    sheets: {
      A: activitySheet("Teilnehmer A · Geschenk für Paula", [
        "Sportschuhe",
        "Kleid",
        "Fotos",
        "Buch",
      ]),
      B: activitySheet("Teilnehmer B · Geschenk für Paula", [
        "Tasche",
        "Pullover",
        "Bild",
        "Blumen",
      ]),
    },
  },
];

export function getScheduleTopic(id) {
  return SCHEDULE_TOPICS.find((topic) => topic.id === id) || null;
}
