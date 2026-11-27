// Ngân hàng Hören/Lesen riêng theo trình độ. Mỗi clip/text có 3 hoặc 5 câu hỏi;
// khi làm bài sẽ lấy ngẫu nhiên đủ 15 câu cho mỗi kỹ năng.
function q(id, text, answer, distractors, explanation) {
  return { id, text, answer, options: [answer, ...distractors], explanation };
}

export const LISTENING_BANK = {
  "A2.1": [
    {
      id: "a21-l1",
      script:
        "Achtung, der Zug nach Hamburg fährt um zehn Uhr von Gleis vier ab. Bitte haben Sie Ihre Fahrkarte bereit.",
      questions: [
        q("a21-l1-q1", "Wohin fährt der Zug?", "Nach Hamburg", ["Nach Berlin", "Nach Wien", "Nach Paris"], "Thông báo nói rõ Zug nach Hamburg."),
        q("a21-l1-q2", "Um wie viel Uhr fährt der Zug ab?", "Um 10 Uhr", ["Um 8 Uhr", ["Um 12 Uhr"], "Um 14 Uhr"].flat(), "Có cụm um zehn Uhr."),
        q("a21-l1-q3", "Von welchem Gleis fährt er ab?", "Von Gleis 4", ["Von Gleis 2", "Von Gleis 3", "Von Gleis 5"], "Cụm von Gleis vier."),
      ],
    },
    {
      id: "a21-l2",
      script:
        "Ich möchte einen Kaffee, bitte. – Möchten Sie ihn mit Milch? – Ja, mit Milch bitte. – Das macht drei Euro zwanzig.",
      questions: [
        q("a21-l2-q1", "Was bestellt die Person?", "Einen Kaffee mit Milch", ["Einen Tee", "Ein Wasser", "Einen Kuchen"], "Cà phê và có thêm Milch."),
        q("a21-l2-q2", "Wie viel kostet die Bestellung?", "3,20 €", ["2,20 €", "3,30 €", "4,20 €"], "drei Euro zwanzig = 3,20 €."),
        q("a21-l2-q3", "Wo findet das Gespräch statt?", "Im Café", ["Im Zug", "In der Bibliothek", "Im Supermarkt"], "Gọi đồ uống nên là im Café."),
      ],
    },
    {
      id: "a21-l3",
      script:
        "Hallo, hier ist Anna. Ich bin heute krank und kann nicht zur Arbeit kommen. Ich rufe morgen wieder an.",
      questions: [
        q("a21-l3-q1", "Wer ruft an?", "Anna", ["Maria", "Tim", "Paul"], "Cụm hier ist Anna."),
        q("a21-l3-q2", "Warum kann Anna nicht zur Arbeit kommen?", "Sie ist krank", ["Sie ist im Urlaub", "Der Zug ist verspätet", "Sie hat keine Zeit"], "Câu Ich bin heute krank."),
        q("a21-l3-q3", "Wann ruft sie wieder an?", "Morgen", ["Heute Abend", "Übermorgen", "Nächste Woche"], "Cụm morgen wieder an."),
      ],
    },
    {
      id: "a21-l4",
      script:
        "Morgen ist es bewölkt und teilweise regnerisch. Am Nachmittag scheint die Sonne wieder, aber es bleibt kühl.",
      questions: [
        q("a21-l4-q1", "Wie ist das Wetter morgen zuerst?", "Bewölkt und regnerisch", ["Sonnig", "Schneig", "Stürmisch"], "Cụm bewölkt und teilweise regnerisch."),
        q("a21-l4-q2", "Wann scheint die Sonne?", "Am Nachmittag", ["Am Morgen", "Am Abend", "Um Mitternacht"], "Cụm am Nachmittag scheint die Sonne."),
        q("a21-l4-q3", "Wie bleibt das Wetter trotzdem?", "Kühl", ["Heiß", "Warm", "Trocken"], "Cụm es bleibt kühl."),
      ],
    },
    {
      id: "a21-l5",
      script:
        "Hallo Tim, wir treffen uns am Samstag um fünfzehn Uhr im Park. Bring bitte etwas zu essen mit.",
      questions: [
        q("a21-l5-q1", "Wann treffen sie sich?", "Am Samstag um 15 Uhr", ["Am Freitag um 15 Uhr", "Am Samstag um 12 Uhr", "Am Sonntag um 15 Uhr"], "Có am Samstag um fünfzehn Uhr."),
        q("a21-l5-q2", "Wo treffen sie sich?", "Im Park", ["Zu Hause", "Im Kino", "Am Bahnhof"], "Cụm im Park."),
        q("a21-l5-q3", "Was soll Tim mitbringen?", "Etwas zu essen", ["Einen Hund", "Ein Buch", "Eine Karte"], "Bring bitte etwas zu essen mit."),
      ],
    },
  ],
  "A2.2": [
    {
      id: "a22-l1",
      script:
        "Die Reise nach Wien kostet zweihundertneunundvierzig Euro. Sie beginnt am zwölften Juni und dauert fünf Tage.",
      questions: [
        q("a22-l1-q1", "Wohin geht die Reise?", "Nach Wien", ["Nach Berlin", "Nach Rom", "Nach Zürich"], "Cụm Die Reise nach Wien."),
        q("a22-l1-q2", "Wie viel kostet sie?", "249 €", ["2490 €", "239 €", "259 €"], "zweihundertneunundvierzig Euro."),
        q("a22-l1-q3", "Wie lange dauert die Reise?", "Fünf Tage", ["Drei Tage", "Zwölf Tage", "Zwei Wochen"], "Cụm dauert fünf Tage."),
      ],
    },
    {
      id: "a22-l2",
      script:
        "Der Deutschkurs fällt heute aus. Er findet nächste Woche Dienstag um achtzehn Uhr im Raum zwei null vier statt.",
      questions: [
        q("a22-l2-q1", "Was fällt heute aus?", "Der Deutschkurs", ["Der Zug", "Das Konzert", "Das Treffen"], "Câu đầu thông báo rõ."),
        q("a22-l2-q2", "Wann findet der Kurs statt?", "Nächste Woche Dienstag um 18 Uhr", ["Heute um 18 Uhr", "Morgen um 16 Uhr", "Nächste Woche Montag"], "Có nächste Woche Dienstag um achtzehn Uhr."),
        q("a22-l2-q3", "Wo ist der Kurs?", "Im Raum 204", ["Im Raum 104", "Im Raum 402", "In der Bibliothek"], "Cụm im Raum zwei null vier."),
      ],
    },
    {
      id: "a22-l3",
      script:
        "Sie sollten dreimal täglich eine Tablette nach dem Essen nehmen und viel Wasser trinken.",
      questions: [
        q("a22-l3-q1", "Wie oft soll man die Tablette nehmen?", "Dreimal täglich", ["Einmal täglich", "Zweimal täglich", "Viermal täglich"], "Cụm dreimal täglich."),
        q("a22-l3-q2", "Wann soll man sie nehmen?", "Nach dem Essen", ["Vor dem Essen", "Am Morgen", "Before schlafen"].slice(0, 2).concat("Vor dem Schlafen"), "Cụm nach dem Essen."),
        q("a22-l3-q3", "Was sollte man außerdem tun?", "Viel Wasser trinken", ["Kalt werden", "Nichts essen", "Zu Hause bleiben"], "Cụm viel Wasser trinken."),
      ],
    },
    {
      id: "a22-l4",
      script:
        "Die Hose kostet neununddreißig Euro, aber heute gibt es zwanzig Prozent Rabatt. Sie können mit Karte zahlen.",
      questions: [
        q("a22-l4-q1", "Was kostet die Hose normalerweise?", "39 €", ["29 €", "49 €", "59 €"], "neununddreißig Euro."),
        q("a22-l4-q2", "Wie hoch ist der Rabatt?", "20 Prozent", ["10 Prozent", "30 Prozent", "39 Prozent"], "Cụm zwanzig Prozent Rabatt."),
        q("a22-l4-q3", "Wie kann man zahlen?", "Mit Karte", ["Nur mit Bargeld", "Mit Scheck", "Online"], "Cụm mit Karte zahlen."),
      ],
    },
    {
      id: "a22-l5",
      script:
        "Wir wollen zuerst ins Museum gehen und danach im Restaurant essen. Um neunzehn Uhr treffen wir uns am Eingang.",
      questions: [
        q("a22-l5-q1", "Wohin gehen sie zuerst?", "Ins Museum", ["Ins Kino", "Ins Restaurant", "Nach Hause"], "Cụm zuerst ins Museum."),
        q("a22-l5-q2", "Was machen sie danach?", "Sie essen im Restaurant", ["Sie kaufen ein", "Sie schlafen", "Sie fahren weg"], "Cụm danach im Restaurant essen."),
        q("a22-l5-q3", "Wo treffen sie sich um 19 Uhr?", "Am Eingang", ["Am Bahnhof", "Zu Hause", "Im Park"], "Cụm um neunzehn Uhr ... am Eingang."),
      ],
    },
  ],
  "B1.1": [
    {
      id: "b11-l1",
      script:
        "Das Festival findet jedes Jahr im Juli statt. Dieses Jahr kommen mehr als zweitausend Besucher. Das Programm ist auf der Website verfügbar.",
      questions: [
        q("b11-l1-q1", "Wann findet das Festival statt?", "Im Juli", ["Im Juni", "Im August", "Im Mai"], "Cụm jedes Jahr im Juli."),
        q("b11-l1-q2", "Wie viele Besucher kommen?", "Mehr als 2000", ["Etwa 200", "Genau 1000", "Weniger als 500"], "Cụm mehr als zweitausend Besucher."),
        q("b11-l1-q3", "Wo gibt es das Programm?", "Auf der Website", ["Im Hotel", "Am Bahnhof", "Im Museum"], "Cụm auf der Website verfügbar."),
      ],
    },
    {
      id: "b11-l2",
      script:
        "Ich habe vor drei Jahren angefangen, Gitarre zu spielen. Am Anfang war es schwer, aber jetzt übe ich jeden Tag eine Stunde.",
      questions: [
        q("b11-l2-q1", "Wann hat er angefangen?", "Vor drei Jahren", ["Vor einem Jahr", "Vor fünf Jahren", "Letzte Woche"], "Cụm vor drei Jahren angefangen."),
        q("b11-l2-q2", "Was hat er gelernt?", "Gitarre spielen", ["Klavier spielen", "Schwimmen", "Kochen"], "Cụm Gitarre zu spielen."),
        q("b11-l2-q3", "Wie oft übt er jetzt?", "Jeden Tag eine Stunde", ["Zweimal pro Woche", "Nur am Wochenende", "Einmal im Monat"], "Cụm jeden Tag eine Stunde."),
      ],
    },
    {
      id: "b11-l3",
      script:
        "Ich finde, die Stadt sollte mehr Radwege bauen. Viele Menschen fahren mit dem Auto, obwohl die Wege kurz sind.",
      questions: [
        q("b11-l3-q1", "Welche Meinung hat die Person?", "Die Stadt sollte mehr Radwege bauen", ["Es gibt schon genug Radwege", "Alle sollen Auto fahren", "Die Wege sind zu lang"], "Cụm sollte mehr Radwege bauen."),
        q("b11-l3-q2", "Was machen viele Menschen?", "Sie fahren mit dem Auto", ["Sie gehen zu Fuß", "Sie nehmen den Bus", "Sie fahren Rad"], "Cụm fahren mit dem Auto."),
        q("b11-l3-q3", "Was ist trotzdem der Fall?", "Die Wege sind kurz", ["Die Wege sind gefährlich", "Das Wetter ist schlecht", "Die Autos sind neu"], "Cụm obwohl die Wege kurz sind."),
      ],
    },
    {
      id: "b11-l4",
      script:
        "Bitte füllen Sie das Formular aus, unterschreiben Sie es und geben Sie es bis Freitag im Büro ab.",
      questions: [
        q("b11-l4-q1", "Was soll man zuerst tun?", "Das Formular ausfüllen", ["Es unterschreiben", "Es abgeben", "Es photocopieren"], "Cụm zuerst füllen ... aus."),
        q("b11-l4-q2", "Was kommt danach?", "Unterschreiben", ["Bezahlen", "Wegwerfen", "Lesen"], "Cụm unterschreiben Sie es."),
        q("b11-l4-q3", "Wann und wo abgeben?", "Bis Freitag im Büro", ["Bis Montag online", "Heute per E-Mail", "Nächste Woche im Park"], "Cụm bis Freitag im Büro ab."),
      ],
    },
    {
      id: "b11-l5",
      script:
        "Der Zug hatte zwanzig Minuten Verspätung. Die Reisenden wurden informiert und bekamen einen Gutschein.",
      questions: [
        q("b11-l5-q1", "Wie lange war die Verspätung?", "20 Minuten", ["10 Minuten", "30 Minuten", "Eine Stunde"], "Cụm zwanzig Minuten Verspätung."),
        q("b11-l5-q2", "Wer wurde informiert?", "Die Reisenden", ["Nur der Zugführer", "Die Nachbarn", "Niemand"], "Câu Die Reisenden wurden informiert."),
        q("b11-l5-q3", "Was bekamen sie?", "Einen Gutschein", ["Ein Ticket", "Geld zurück", "Ein Geschenk"], "Cụm bekamen einen Gutschein."),
      ],
    },
  ],
  "B1.2": [
    {
      id: "b12-l1",
      script:
        "Obwohl das Projekt gut geplant war, gab es unerwartete Probleme. Die Teamleiterin schlug vor, den Zeitplan zu ändern.",
      questions: [
        q("b12-l1-q1", "Wie war das Projekt geplant?", "Gut", ["Schlecht", "Gar nicht", "Nur teilweise"], "Cụm obwohl das Projekt gut geplant war."),
        q("b12-l1-q2", "Welche Probleme gab es?", "Unerwartete", ["Kleine", "Keine", "Alte"], "Cụm unerwartete Probleme."),
        q("b12-l1-q3", "Was schlug die Teamleiterin vor?", "Den Zeitplan zu ändern", ["Das Projekt zu beenden", "Neue Mitarbeiter einzustellen", "Weniger zu arbeiten"], "Cụm den Zeitplan zu ändern."),
      ],
    },
    {
      id: "b12-l2",
      script:
        "Die Bibliothek ist wegen einer Reparatur bis Montag geschlossen. Bücher können trotzdem online bestellt werden.",
      questions: [
        q("b12-l2-q1", "Warum ist die Bibliothek geschlossen?", "Wegen einer Reparatur", ["Wegen eines Festes", "Wegen Ferien", "Wegen eines Umzugs"], "Cụm wegen einer Reparatur."),
        q("b12-l2-q2", "Bis wann bleibt sie geschlossen?", "Bis Montag", ["Bis Freitag", "Bis Sonntag", "Bis nächsten Monat"], "Cụm bis Montag geschlossen."),
        q("b12-l2-q3", "Was ist trotzdem möglich?", "Bücher online bestellen", ["Bücher abholen", "Im Lesesaal arbeiten", "Nichts"], "Câu Bücher können trotzdem online bestellt werden."),
      ],
    },
    {
      id: "b12-l3",
      script:
        "Ich bin der Meinung, dass Homeoffice die Produktivität erhöht. Allerdings fehlt manchen Kollegen der Austausch im Büro.",
      questions: [
        q("b12-l3-q1", "Was ist die Meinung der Person?", "Homeoffice erhöht die Produktivität", ["Homeoffice senkt die Produktivität", "Alle sollen ins Büro", "Arbeit zu Hause ist unmöglich"], "Câu đầu nêu rõ."),
        q("b12-l3-q2", "Was wird als Nachteil genannt?", "Der Austausch fehlt", ["Die Kosten sind höher", "Der Weg ist zu weit", "Die Technik ist schlecht"], "Cụm Allerdings fehlt ... der Austausch."),
        q("b12-l3-q3", "Wem fehlt der Austausch?", "Manchen Kollegen", ["Nur der Leiterin", "Den Kunden", "Niemandem"], "Cụm manchen Kollegen."),
      ],
    },
    {
      id: "b12-l4",
      script:
        "Wenn ich mehr Zeit hätte, würde ich einen Sprachkurs besuchen. Leider arbeite ich nächsten Monat Vollzeit.",
      questions: [
        q("b12-l4-q1", "Was würde die Person tun?", "Einen Sprachkurs besuchen", ["Eine Reise machen", "Kündigen", "Zu Hause bleiben"], "Cụm würde ich einen Sprachkurs besuchen."),
        q("b12-l4-q2", "Warum tut sie es nicht?", "Sie hat keine Zeit", ["Sie hat kein Geld", "Der Kurs ist geschlossen", "Sie wohnt zu weit"], "Câu Wenn ich mehr Zeit hätte ... + leider."),
        q("b12-l4-q3", "Was macht sie nächsten Monat?", "Vollzeit arbeiten", ["Urlaub machen", "Studieren", "Nichts"], "Cụm nächsten Monat Vollzeit."),
      ],
    },
    {
      id: "b12-l5",
      script:
        "Die Umfrage ergab, dass sechzig Prozent der Teilnehmer zufrieden waren. Nur zehn Prozent waren unzufrieden, der Rest war neutral.",
      questions: [
        q("b12-l5-q1", "Wie viele waren zufrieden?", "60 Prozent", ["16 Prozent", "70 Prozent", "50 Prozent"], "Cụm sechzig Prozent ... zufrieden."),
        q("b12-l5-q2", "Wie viele waren unzufrieden?", "10 Prozent", ["60 Prozent", "30 Prozent", "20 Prozent"], "Cụm Nur zehn Prozent unzufrieden."),
        q("b12-l5-q3", "Wie war der Rest?", "Neutral", ["Zufrieden", "Unzufrieden", "Unbekannt"], "Cụm der Rest war neutral."),
      ],
    },
  ],
};

export const READING_BANK = {
  "A2.1": [
    {
      id: "a21-r1",
      text:
        "Heute ist Samstag. Anna und Tim treffen sich um zehn Uhr im Park. Sie wollen zusammen Rad fahren. Anna bringt etwas zu trinken mit, Tim bringt Kuchen. Um zwölf Uhr essen sie im Café neben dem Park.",
      questions: [
        q("a21-r1-q1", "Wann treffen sie sich?", "Um 10 Uhr", ["Um 12 Uhr", "Um 9 Uhr", "Um 11 Uhr"], "Cụm um zehn Uhr."),
        q("a21-r1-q2", "Wo treffen sie sich?", "Im Park", ["Im Café", "Zu Hause", "Am Bahnhof"], "Cụm im Park."),
        q("a21-r1-q3", "Was machen sie zusammen?", "Sie fahren Rad", ["Sie schwimmen", "Sie kochen", "Sie lernen"], "Cụm wollen zusammen Rad fahren."),
        q("a21-r1-q4", "Was bringt Anna mit?", "Etwas zu trinken", ["Kuchen", "Einen Hund", "Ein Buch"], "Cụm Anna bringt etwas zu trinken mit."),
        q("a21-r1-q5", "Wo essen sie um 12 Uhr?", "Im Café neben dem Park", ["Zu Hause", "Im Kino", "In der Schule"], "Cụm im Café neben dem Park."),
      ],
    },
    {
      id: "a21-r2",
      text:
        "Liebe Maria, ich bin heute nicht zu Hause. Bitte gib meine Bücher in der Bibliothek ab. Der Deutschkurs beginnt morgen um 18 Uhr. Danke! Dein Paul",
      questions: [
        q("a21-r2-q1", "An wen ist die Nachricht?", "Maria", ["Paul", "Anna", "Tim"], "Cụm Liebe Maria."),
        q("a21-r2-q2", "Was soll Maria machen?", "Bücher abgeben", ["Bücher kaufen", "Paul anrufen", "Zum Kurs gehen"], "Cụm gib meine Bücher ... ab."),
        q("a21-r2-q3", "Wo soll sie das machen?", "In der Bibliothek", ["Im Café", "Zu Hause", "Im Park"], "Cụm in der Bibliothek."),
        q("a21-r2-q4", "Wann beginnt der Kurs?", "Morgen um 18 Uhr", ["Heute um 18 Uhr", "Morgen um 8 Uhr", "Übermorgen"], "Cụm morgen um 18 Uhr."),
        q("a21-r2-q5", "Wer schreibt die Nachricht?", "Paul", ["Maria", "Die Lehrerin", "Anna"], "Cụm Dein Paul."),
      ],
    },
    {
      id: "a21-r3",
      text:
        "Die Stadtbibliothek ist von Montag bis Freitag von 9 bis 19 Uhr geöffnet. Am Samstag ist sie von 10 bis 14 Uhr offen. Am Sonntag bleibt sie geschlossen. Ein Buch kann man drei Wochen behalten.",
      questions: [
        q("a21-r3-q1", "Wann ist die Bibliothek montags geöffnet?", "Von 9 bis 19 Uhr", ["Von 10 bis 14 Uhr", "Von 8 bis 18 Uhr", "Geschlossen"], "Cụm Montag bis Freitag von 9 bis 19 Uhr."),
        q("a21-r3-q2", "Wie lange ist sie samstags offen?", "Von 10 bis 14 Uhr", ["Von 9 bis 19 Uhr", "Von 10 bis 18 Uhr", "Geschlossen"], "Cụm am Samstag ... 10 bis 14 Uhr."),
        q("a21-r3-q3", "Wann ist sie geschlossen?", "Am Sonntag", ["Am Samstag", "Am Freitag", "Am Montag"], "Cụm Am Sonntag bleibt sie geschlossen."),
        q("a21-r3-q4", "Wie lange darf man ein Buch behalten?", "Drei Wochen", ["Eine Woche", "Zwei Wochen", "Einen Monat"], "Cụm drei Wochen behalten."),
        q("a21-r3-q5", "Wo befindet sich die Bibliothek?", "In der Stadt", ["Im Park", "Im Zug", "Zu Hause"], "Tên Stadtbibliothek gợi rõ."),
      ],
    },
  ],
  "A2.2": [
    {
      id: "a22-r1",
      text:
        "Der Deutschkurs beginnt am Montag, 5. März, um 18 Uhr im Raum 204. Wer krank ist, soll die Lehrerin vorher anrufen. Die Teilnehmer brauchen ein Buch und einen Stift. Die Prüfung ist am letzten Freitag des Kurses.",
      questions: [
        q("a22-r1-q1", "Wann beginnt der Kurs?", "Am Montag, 5. März", ["Am Freitag, 5. März", "Am Montag, 15. März", "Am Dienstag"], "Cụm am Montag, 5. März."),
        q("a22-r1-q2", "Um wie viel Uhr beginnt er?", "Um 18 Uhr", ["Um 8 Uhr", "Um 16 Uhr", "Um 20 Uhr"], "Cụm um 18 Uhr."),
        q("a22-r1-q3", "Wo findet er statt?", "Im Raum 204", ["Im Raum 402", "In der Bibliothek", "Im Café"], "Cụm im Raum 204."),
        q("a22-r1-q4", "Was soll man bei Krankheit tun?", "Die Lehrerin anrufen", ["Zum Kurs kommen", "Eine E-Mail schreiben", "Nichts tun"], "Cụm soll die Lehrerin vorher anrufen."),
        q("a22-r1-q5", "Was brauchen die Teilnehmer?", "Ein Buch und einen Stift", ["Nur ein Buch", "Einen Computer", "Eine Fahrkarte"], "Cụm ein Buch und einen Stift."),
      ],
    },
    {
      id: "a22-r2",
      text:
        "Unser neues Café ist seit letzter Woche geöffnet. Wir bieten Kaffee, Tee und kleine Gerichte an. Mittwochs gibt es ab 17 Uhr Musik. Reservierungen sind per Telefon oder E-Mail möglich. Wir freuen uns auf Ihren Besuch!",
      questions: [
        q("a22-r2-q1", "Seit wann ist das Café geöffnet?", "Seit letzter Woche", ["Seit gestern", "Seit einem Monat", "Seit heute"], "Cụm seit letzter Woche geöffnet."),
        q("a22-r2-q2", "Was bieten sie an?", "Kaffee, Tee und kleine Gerichte", ["Nur Kaffee", "Nur Tee", "Große Feste"], "Cụm Kaffee, Tee und kleine Gerichte."),
        q("a22-r2-q3", "Wann gibt es Musik?", "Mittwochs ab 17 Uhr", ["Freitags ab 17 Uhr", "Mittwochs ab 7 Uhr", "Jeden Tag"], "Cụm mittwochs ab 17 Uhr."),
        q("a22-r2-q4", "Wie kann man reservieren?", "Per Telefon oder E-Mail", ["Nur online", "Nur persönlich", "Per Post"], "Cụm per Telefon oder E-Mail möglich."),
        q("a22-r2-q5", "Was möchten sie?", "Besucher kommen", ["Geschlossen bleiben", "Nur Musik verkaufen", "den Kurs beginnen"], "Cụm Wir freuen uns auf Ihren Besuch."),
      ],
    },
    {
      id: "a22-r3",
      text:
        "Tim hat gestern den Zug nach Berlin genommen. Die Fahrt dauerte vier Stunden. In Berlin hat er zuerst seine Schwester besucht, danach ist er ins Museum gegangen. Am Abend hat er ein Restaurant besucht. Morgen fährt er wieder zurück.",
      questions: [
        q("a22-r3-q1", "Wohin ist Tim gefahren?", "Nach Berlin", ["Nach Wien", "Nach Hamburg", "Nach München"], "Cụm Zug nach Berlin."),
        q("a22-r3-q2", "Wie lange dauerte die Fahrt?", "Vier Stunden", ["Zwei Stunden", "Drei Stunden", "Fünf Stunden"], "Cụm dauerte vier Stunden."),
        q("a22-r3-q3", "Was hat er zuerst gemacht?", "Seine Schwester besucht", ["Ins Museum gegangen", "Ein Restaurant besucht", "Geschlafen"], "Cụm zuerst seine Schwester besucht."),
        q("a22-r3-q4", "Was hat er nach dem Museum gemacht?", "Ein Restaurant besucht", ["Zurückgefahren", "Gekocht", "Geschwommen"], "Cụm am Abend ... Restaurant."),
        q("a22-r3-q5", "Wann fährt er zurück?", "Morgen", ["Heute", "Übermorgen", "Nächste Woche"], "Cụm Morgen fährt er wieder zurück."),
      ],
    },
  ],
  "B1.1": [
    {
      id: "b11-r1",
      text:
        "Die Stadt möchte mehr Radwege bauen. Einige Bewohner sind dagegen, weil die Arbeiten lange dauern und Geld kosten. Andere finden es gut, weil dann weniger Autos fahren. Die Verwaltung sammelt bis Ende des Monats Meinungen.",
      questions: [
        q("b11-r1-q1", "Was möchte die Stadt bauen?", "Mehr Radwege", ["Mehr Autobahnen", "Neue Schulen", "Einen Parkplatz"], "Câu đầu nêu rõ."),
        q("b11-r1-q2", "Warum sind einige dagegen?", "Wegen Zeit und Kosten", ["Weil es zu wenige Radfahrer gibt", "Weil das Wetter schlecht ist", "Weil die Wege schon fertig sind"], "Cụm lange dauern und Geld kosten."),
        q("b11-r1-q3", "Warum finden andere es gut?", "Weniger Autos fahren", ["Mehr Autos fahren", "Die Preise sinken", "Der Bus fährt öfter"], "Cụm dann weniger Autos fahren."),
        q("b11-r1-q4", "Wer sammelt Meinungen?", "Die Verwaltung", ["Die Schulen", "Die Polizei", "Die Bewohner"], "Cụm Die Verwaltung sammelt ..."),
        q("b11-r1-q5", "Bis wann kann man Meinungen abgeben?", "Bis Ende des Monats", ["Bis nächsten Jahr", "Bis morgen", "Bis Ende der Woche"], "Cụm bis Ende des Monats."),
      ],
    },
    {
      id: "b11-r2",
      text:
        "Wer einen deutschen Führerschein machen möchte, braucht einen Kurs und eine Prüfung. Die theoretische Prüfung hat 30 Fragen. In der praktischen Prüfung muss man etwa 45 Minuten fahren. Wer die Prüfung nicht besteht, kann sie nach einem Monat wiederholen.",
      questions: [
        q("b11-r2-q1", "Was braucht man für den Führerschein?", "Einen Kurs und eine Prüfung", ["Nur einen Kurs", "Nur eine Prüfung", "Ein Auto"], "Câu đầu nêu rõ."),
        q("b11-r2-q2", "Wie viele Fragen hat die Theorie?", "30", ["15", "25", "45"], "Cụm 30 Fragen."),
        q("b11-r2-q3", "Wie lange dauert die Praxis?", "Etwa 45 Minuten", ["Etwa 30 Minuten", "Etwa 15 Minuten", "Etwa eine Stunde"], "Cụm etwa 45 Minuten fahren."),
        q("b11-r2-q4", "Wann kann man wiederholen?", "Nach einem Monat", ["Nach einer Woche", "Nach einem Jahr", "Sofort"], "Cụm nach einem Monat wiederholen."),
        q("b11-r2-q5", "Wovon handelt der Text?", "Vom Führerschein", ["Vom Deutschkurs", "Vom Zug", "Vom Museum"], "Chủ đề整体 là Führerschein."),
      ],
    },
    {
      id: "b11-r3",
      text:
        "Das Wetter ändert sich heute Nachmittag. Zuerst scheint die Sonne, aber ab 15 Uhr ziehen Wolken auf. Am Abend kann es leicht regnen. Die Temperaturen liegen zwischen 12 und 18 Grad. Für morgen ist wieder sonniges Wetter angekündigt.",
      questions: [
        q("b11-r3-q1", "Wie ist das Wetter zuerst?", "Sonnig", ["Bewölkt", "Regnerisch", "Schneig"], "Cụm zuerst scheint die Sonne."),
        q("b11-r3-q2", "Wann ziehen Wolken auf?", "Ab 15 Uhr", ["Ab 12 Uhr", "Ab 18 Uhr", "Am Morgen"], "Cụm ab 15 Uhr ziehen Wolken auf."),
        q("b11-r3-q3", "Was kann am Abend passieren?", "Leichter Regen", ["Starker Schnee", "Gewitter", "Nichts"], "Cụm kann es leicht regnen."),
        q("b11-r3-q4", "Wie hoch sind die Temperaturen?", "12 bis 18 Grad", ["8 bis 12 Grad", "18 bis 25 Grad", "0 bis 5 Grad"], "Cụm zwischen 12 und 18 Grad."),
        q("b11-r3-q5", "Wie wird das Wetter morgen?", "Sonnig", ["Regnerisch", "Kalt", "Wolkig"], "Cụm wieder sonniges Wetter angekündigt."),
      ],
    },
  ],
  "B1.2": [
    {
      id: "b12-r1",
      text:
        "Obwohl viele Menschen.homeoffice schätzen, zeigt eine neue Studie, dass die Produktivität nicht immer steigt. Besonders neue Mitarbeiter haben Schwierigkeiten, weil ihnen der Austausch im Büro fehlt. Die Forscher empfehlen deshalb ein Mischmodell mit zwei bis drei Tagen im Büro.",
      questions: [
        q("b12-r1-q1", "Was zeigt die Studie?", "Produktivität steigt nicht immer", ["Sie steigt immer", "Sie sinkt immer", "Es gibt keine Veränderung"], "Cụm nicht immer steigt."),
        q("b12-r1-q2", "Wer hat besondere Schwierigkeiten?", "Neue Mitarbeiter", ["Erfahrene Mitarbeiter", "Die Leiter", "Die Kunden"], "Cụm Besonders neue Mitarbeiter."),
        q("b12-r1-q3", "Warum haben sie Schwierigkeiten?", "Der Austausch fehlt", ["Die Technik ist alt", "Die Arbeit ist zu leicht", "Das Büro ist zu groß"], "Cụm Austausch im Büro fehlt."),
        q("b12-r1-q4", "Was empfehlen die Forscher?", "Ein Mischmodell", ["Nur Homeoffice", "Nur Büro", "Mehr Urlaub"], "Cụm empfehlen ... ein Mischmodell."),
        q("b12-r1-q5", "Wie viele Tage im Büro werden empfohlen?", "Zwei bis drei", ["Ein bis zwei", "Vier bis fünf", "Keine"], "Cụm zwei bis drei Tagen im Büro."),
      ],
    },
    {
      id: "b12-r2",
      text:
        "Die Bibliothek hat ihre Öffnungszeiten geändert. Seit diesem Monat ist sie auch samstags bis 18 Uhr geöffnet. Dafür bleibt sie montags geschlossen. Bücher können weiterhin online reserviert und an einem Selbstbedienungsterminal abgeholt werden.",
      questions: [
        q("b12-r2-q1", "Was wurde geändert?", "Die Öffnungszeiten", ["Die Preise", "Die Bücher", "Das Personal"], "Câu đầu nêu rõ."),
        q("b12-r2-q2", "Wie lange ist sie samstags offen?", "Bis 18 Uhr", ["Bis 14 Uhr", ["Bis 20 Uhr"], "Bis 12 Uhr"].flat(), "Cụm samstags bis 18 Uhr."),
        q("b12-r2-q3", "Wann bleibt sie geschlossen?", "Montags", ["Samstags", "Sonntags", "Freitags"], "Cụm dafür bleibt sie montags geschlossen."),
        q("b12-r2-q4", "Was kann man online machen?", "Bücher reservieren", ["Bücher kaufen", "Geld abheben", "Den Raum mieten"], "Cụm online reserviert."),
        q("b12-r2-q5", "Wo holt man die Bücher ab?", "Am Selbstbedienungsterminal", ["Am Schalter", "Im Café", "Zu Hause"], "Cụm an einem Selbstbedienungsterminal abgeholt."),
      ],
    },
    {
      id: "b12-r3",
      text:
        "Der Verein plant ein Sommerfest. Ursprünglich wollte er das Fest im Park veranstalten, aber die Genehmigung wurde erst spät erteilt. Deshalb findet es jetzt im Schulhof statt. Das Programm wurde von den Mitgliedern selbst organisiert, und die Kosten wurden durch Spenden gedeckt.",
      questions: [
        q("b12-r3-q1", "Was plant der Verein?", "Ein Sommerfest", ["Einen Deutschkurs", "Eine Reise", "Eine Umfrage"], "Câu đầu nêu rõ."),
        q("b12-r3-q2", "Wo sollte das Fest zuerst stattfinden?", "Im Park", ["Im Schulhof", "In der Schule", "Im Restaurant"], "Cụm ursprünglich ... im Park."),
        q("b12-r3-q3", "Warum wurde der Ort geändert?", "Die Genehmigung kam spät", ["Das Wetter war schlecht", "Der Park war zu klein", "Es gab keine Mitglieder"], "Cụm Genehmigung wurde erst spät erteilt."),
        q("b12-r3-q4", "Wo findet es jetzt statt?", "Im Schulhof", ["Im Park", "Im Museum", "Am Bahnhof"], "Cụm jetzt im Schulhof statt."),
        q("b12-r3-q5", "Woher kamen die Kosten?", "Aus Spenden", ["Aus Eintrittskarten", "Von der Stadt", "Aus dem Verkauf"], "Cụm durch Spenden gedeckt."),
      ],
    },
  ],
};

export const A1_REWRITE_BANK = [
  { id: "rw1", sentence: "Ich gehe jeden Tag zur Schule.", subject: "er", answer: "Er geht jeden Tag zur Schule." },
  { id: "rw2", sentence: "Wir wohnen in Berlin.", subject: "sie", answer: "Sie wohnen in Berlin." },
  { id: "rw3", sentence: "Du hast einen Hund.", subject: "er", answer: "Er hat einen Hund." },
  { id: "rw4", sentence: "Ich bin müde.", subject: "sie", answer: "Sie ist müde." },
  { id: "rw5", sentence: "Er spielt Fußball.", subject: "ich", answer: "Ich spiele Fußball." },
  { id: "rw6", sentence: "Sie kocht Abendessen.", subject: "wir", answer: "Wir kochen Abendessen." },
  { id: "rw7", sentence: "Ich möchte einen Kaffee.", subject: "du", answer: "Du möchtest einen Kaffee." },
  { id: "rw8", sentence: "Wir lernen Deutsch.", subject: "er", answer: "Er lernt Deutsch." },
  { id: "rw9", sentence: "Ich habe zwei Bücher.", subject: "er", answer: "Er hat zwei Bücher." },
  { id: "rw10", sentence: "Der Hund schläft.", subject: "die Katze", answer: "Die Katze schläft." },
  { id: "rw11", sentence: "Wir fahren mit dem Bus.", subject: "er", answer: "Er fährt mit dem Bus." },
  { id: "rw12", sentence: "Ich stehe um 7 Uhr auf.", subject: "sie", answer: "Sie steht um 7 Uhr auf." },
  { id: "rw13", sentence: "Du kommst aus Hanoi.", subject: "ich", answer: "Ich komme aus Hanoi." },
  { id: "rw14", sentence: "Sie arbeitet in einer Bank.", subject: "ich", answer: "Ich arbeite in einer Bank." },
  { id: "rw15", sentence: "Er kann schwimmen.", subject: "wir", answer: "Wir können schwimmen." },
  { id: "rw16", sentence: "Ich trinke Wasser.", subject: "du", answer: "Du trinkst Wasser." },
  { id: "rw17", sentence: "Die Kinder spielen im Garten.", subject: "das Kind", answer: "Das Kind spielt im Garten." },
  { id: "rw18", sentence: "Ich besuche meine Oma.", subject: "er", answer: "Er besucht seine Oma." },
  { id: "rw19", sentence: "Ich gehe gerne ins Kino.", subject: "ihr", answer: "Ihr geht gerne ins Kino." },
  { id: "rw20", sentence: "Du bist frechen Mädchen.", subject: "ich", answer: "Ich bin ein freches Mädchen." },
];

export const B1_WRITING_BANK = {
  "B1.1": [
    {
      id: "b11-w1",
      format: "SMS",
      question: "Dein Freund wartet schon am Bahnhof, aber dein Zug hat 20 Minuten Verspätung. Schreib ihm eine SMS.",
      hints: ["Sag, dass der Zug später ist.", "Nenne die neue Zeit.", "Entschuldige dich kurz."],
      minWords: 25,
      maxWords: 45,
    },
    {
      id: "b11-w2",
      format: "E-Mail",
      question: "Du konntest nicht zum Deutschkurs kommen. Schreib der Lehrerin eine E-Mail und erkläre warum.",
      hints: ["Entschuldige dich.", "Nenne den Grund.", "Frag nach den Hausaufgaben."],
      minWords: 40,
      maxWords: 70,
    },
    {
      id: "b11-w3",
      format: "E-Mail",
      question: "Deine Stadt sucht Ideen für ein Sommerfest. Schreib eine E-Mail mit deinem Vorschlag.",
      hints: ["Nenne eine Aktivität.", "Erkläre, warum sie gut ist.", "Sag, was du organisieren kannst."],
      minWords: 45,
      maxWords: 80,
    },
  ],
  "B1.2": [
    {
      id: "b12-w1",
      format: "SMS",
      question: "Du hast die Uhrzeit falsch verstanden und kommst zu spät zum Treffen. Schreib eine kurze SMS.",
      hints: ["Entschuldige dich höflich.", "Erkläre kurz den Grund.", "Sag, wann du ankommst."],
      minWords: 25,
      maxWords: 45,
    },
    {
      id: "b12-w2",
      format: "E-Mail",
      question: "Du möchtest dich für ein Praktikum bewerben. Schreib eine E-Mail und begründe dein Interesse.",
      hints: ["Stelle dich kurz vor.", "Nenne deine Stärken.", "Frag nach einem Gespräch."],
      minWords: 50,
      maxWords: 90,
    },
    {
      id: "b12-w3",
      format: "E-Mail",
      question: "Ein Freund hat dir eine lange E-Mail geschickt. Antworte und gehe auf seine Fragen ein.",
      hints: ["Bedanke dich für die Nachricht.", "Beantworte die Fragen.", "Stelle selbst eine Rückfrage."],
      minWords: 50,
      maxWords: 90,
    },
  ],
};

export const A12_WRITING_BANK = [
  {
    id: "a12-w1",
    format: "SMS",
    question: "Du bist krank und kannst heute nicht zur Schule kommen. Schreib eine SMS an deine Freundin.",
    hints: ["Sag, dass du krank bist.", "Sag, dass du heute nicht kommst.", "Frag nach den Hausaufgaben."],
    minWords: 15,
    maxWords: 30,
  },
  {
    id: "a12-w2",
    format: "SMS",
    question: "Du möchtest deinen Freund morgen treffen. Schreib eine SMS und schlag eine Uhrzeit vor.",
    hints: ["Sag, wann ihr euch treffen wollt.", "Sag, wo.", "Frag, ob es passt."],
    minWords: 15,
    maxWords: 30,
  },
  {
    id: "a12-w3",
    format: "E-Mail",
    question: "Du hast ein Buch verloren. Schreib eine kurze E-Mail an die Bibliothek.",
    hints: ["Sag, welches Buch es ist.", "Sag, wann du es verloren hast.", "Frag nach dem Preis."],
    minWords: 20,
    maxWords: 40,
  },
  {
    id: "a12-w4",
    format: "E-Mail",
    question: "Du möchtest einen Deutschkurs besuchen. Schreib eine E-Mail und frag nach dem Kurs.",
    hints: ["Stelle dich vor.", "Frag nach dem Termin.", "Frag nach dem Preis."],
    minWords: 20,
    maxWords: 40,
  },
];
