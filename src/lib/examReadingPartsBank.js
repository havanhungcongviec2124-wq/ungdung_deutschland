// Cấu trúc Lesen từ A2.2: 4 Teil × 5 câu = 20 câu. Dạng bài lấy cảm hứng từ đề Goethe/A2
// (bài dài, ghép thông tin theo khu vực, e-mail, ghép quảng cáo A–E) nhưng toàn bộ nội dung
// do ứng dụng tự viết, không sao chép đề có bản quyền từ nguồn bên ngoài.
function q(id, text, answer, distractors, explanation) {
  return { id, text, answer, options: [answer, ...distractors], explanation };
}
function ad(label, text) {
  return { label, text };
}
function part(id, part, kind, text, questions, ads) {
  return ads ? { id, part, kind, text, questions, ads } : { id, part, kind, text, questions };
}

export const READING_PART_BANK = {
  "A2.2": [
    part(
      "a22-rp1",
      "Teil 1",
      "detail",
      "Das Stadtfest in Lindau findet vom 28. bis 30. Juni statt. Am Freitagabend um 17 Uhr eröffnet der Bürgermeister das Fest auf dem Marktplatz. Danach spielt die Band „Die Uferlichter“ moderne Musik. Am Samstag gibt es auf dem Marktplatz ein Kinderprogramm mit Spielen und Basteln. Am Nachmittag zeigen lokale Künstler ihre Bilder am Hafen. Am Abend ist ein Konzert auf dem Schlossplatz geplant. Der Sonntag steht im Zeichen der Nachbarn: Verschiedene Vereine stellen ihre Arbeit vor und bieten traditionelle Gerichte an. Um 16 Uhr zieht ein Umzug durch die Altstadt. Das Fest endet mit einem Feuerwerk am Hafen. Weil es wenige Parkplätze gibt, empfiehlt die Stadt die Anreise mit Bus und Bahn. Alle Informationen stehen auf der Website der Stadt.",
      [
        q("a22-rp1-q1", "Wann eröffnet der Bürgermeister das Fest?", "Am Freitag um 17 Uhr", ["Am Freitagmorgen", "Am Samstag um 17 Uhr"], "Cụm am Freitagabend um 17 Uhr eröffnet ..."),
        q("a22-rp1-q2", "Welche Band spielt am Freitagabend?", "Die Uferlichter", ["Die Hafenmusikanten", "Die Studio Band"], "Cụm Danach spielt die Band „Die Uferlichter“."),
        q("a22-rp1-q3", "Wo ist das Kinderprogramm am Samstag?", "Am Marktplatz", ["Am Hafen", "Auf dem Schlossplatz"], "Cụm auf dem Marktplatz ein Kinderprogramm."),
        q("a22-rp1-q4", "Was machen die Vereine am Sonntag?", "Sie stellen ihre Arbeit vor", ["Sie spielen ein Konzert", "Sie verkaufen Autos"], "Cụm Vereine stellen ihre Arbeit vor."),
        q("a22-rp1-q5", "Wie endet das Fest?", "Mit einem Feuerwerk", ["Mit einem Konzert", "Mit einer Lesung"], "Cụm Das Fest endet mit einem Feuerwerk am Hafen."),
      ]
    ),
    part(
      "a22-rp2",
      "Teil 2",
      "matching",
      "Willkommen in der Marktgalerie! Am Samstag erwartet Sie ein Programm für die ganze Familie.\nA · Erdgeschoss: 08–20 Uhr Supermarkt; 10–18 Uhr Parfümerie mit kostenloser Hautanalyse; 11–16 Uhr Buchladen – ein Autor liest aus seinem neuen Kinderbuch.\nB · Erster Stock: 10–20 Uhr Modegeschäfte mit Rabatten bis 20 Prozent; 14–16 Uhr Vorführung neuer Fitnessgeräte im Sportladen.\nC · Zweiter Stock: 11–19 Uhr Möbelhaus mit Küchenausstellung; 13–15 Uhr Innenarchitekt berät kostenlos; 15–18 Uhr Technikmarkt – neue Smartphones ausprobieren.",
      [
        q("a22-rp2-q1", "Sie möchten kostenlose Tipps zu Haut und Make-up. Wo passt das am besten?", "Im Erdgeschoss", ["Im ersten Stock", "Im zweiten Stock"], "Hautanalyse gibt es in der Parfümerie im Erdgeschoss."),
        q("a22-rp2-q2", "Ihr Kind hört gern Geschichten. Wo passt das am besten?", "Im Erdgeschoss", ["Im ersten Stock", "Im zweiten Stock"], "Der Buchladen mit Vorlesung ist im Erdgeschoss."),
        q("a22-rp2-q3", "Sie möchten neue Kleidung günstig kaufen. Wo passt das am besten?", "Im ersten Stock", ["Im Erdgeschoss", "Im zweiten Stock"], "Modegeschäfte mit Rabatten sind im ersten Stock."),
        q("a22-rp2-q4", "Sie suchen Ideen für Ihre Wohnung. Wo passt das am besten?", "Im zweiten Stock", ["Im Erdgeschoss", "Im ersten Stock"], "Küchenausstellung und Innenarchitekt sind im zweiten Stock."),
        q("a22-rp2-q5", "Sie möchten ein neues Smartphone selbst testen. Wo passt das am besten?", "Im zweiten Stock", ["Im ersten Stock", "Im Erdgeschoss"], "Der Technikmarkt ist im zweiten Stock."),
      ]
    ),
    part(
      "a22-rp3",
      "Teil 3",
      "email",
      "Sehr geehrte Frau Neumann,\nich möchte mich nach dem A2-Deutschkurs erkundigen, den Ihre Schule anbietet. Ich habe schon ein wenig Deutsch gelernt und suche einen Kurs für den Alltag. Könnten Sie mir bitte sagen, wann der nächste Kurs beginnt und wie viele Stunden pro Woche er hat? Außerdem interessieren mich die Kosten und ob es Lehrmaterial gibt. Gibt es eine Probestunde? Ich hätte auch gern gewusst, ob Lesen, Schreiben, Hören und Sprechen im Kurs gleich wichtig sind.\nVielen Dank für Ihre Antwort. Mit freundlichen Grüßen\nLisa Brandt",
      [
        q("a22-rp3-q1", "Warum schreibt Lisa Brandt?", "Sie möchte Informationen über einen Kurs.", ["Sie möchte einen Kurs absagen.", "Sie möchte sich beschweren."], "Cụm möchte mich nach dem A2-Deutschkurs erkundigen."),
        q("a22-rp3-q2", "Warum passt A2 zu ihr?", "Sie kann schon ein bisschen Deutsch.", ["Sie unterrichtet Deutsch.", "Sie war schon einmal im Kurs."], "Cụm Ich habe schon ein wenig Deutsch gelernt."),
        q("a22-rp3-q3", "Was möchte sie über den Kurs wissen?", "Beginn, Stunden, Kosten und Material.", ["Nur den Namen der Lehrerin", "Nur die Adresse der Schule"], "Câu hỏi liệt kê Beginn, Stunden, Kosten und Lehrmaterial."),
        q("a22-rp3-q4", "Was fragt sie zur Kursstruktur?", "Ob alle vier Fertigkeiten gleich wichtig sind.", ["Ob es nur Grammatik gibt", "Ob der Kurs online stattfindet"], "Cụm ob Lesen, Schreiben, Hören und Sprechen ... gleich wichtig sind."),
        q("a22-rp3-q5", "Was zeigt, dass sie den Kurs erst kennenlernen möchte?", "Sie fragt nach einer Probestunde.", ["Sie bittet um einen Rabatt.", "Sie lehnt Hausaufgaben ab."], "Cụm Gibt es eine Probestunde?"),
      ]
    ),
    part(
      "a22-rp4",
      "Teil 4",
      "ads",
      "Wählen Sie für jede Person die passende Anzeige. Eine Anzeige kann nur einmal gewählt werden.",
      [
        q("a22-rp4-q1", "Herr Weber möchte sein Englisch verbessern und sucht jemanden zum Üben. Er spricht Deutsch als Muttersprache.", "A", ["B", "C", "D", "E"], "Anzeige A sucht einen Sprachpartner für Englisch."),
        q("a22-rp4-q2", "Frau Schmidt hat ein kaputtes Fahrrad und braucht eine schnelle, günstige Reparatur.", "B", ["A", "C", "D", "E"], "Anzeige B ist die Fahrradwerkstatt."),
        q("a22-rp4-q3", "Familie Klein fährt bald nach Italien und möchte vorher ein paar Wörter lernen.", "C", ["A", "B", "D", "E"], "Anzeige C ist der Italienischkurs für Anfänger."),
        q("a22-rp4-q4", "Frau Müller möchte morgens etwas für den Rücken und für Entspannung tun.", "D", ["A", "B", "C", "E"], "Anzeige D ist Morgenyoga im Stadtpark."),
        q("a22-rp4-q5", "Herr Berger sucht günstige Bücher für zu Hause.", "E", ["A", "B", "C", "D"], "Anzeige E ist die Bücherbörse mit kleinen Preisen."),
      ],
      [
        ad("A", "Sprachpartner gesucht – Englisch üben: Ich spreche Deutsch als Muttersprache und möchte mein Englisch verbessern. Treffen im Café oder online, zweimal pro Woche."),
        ad("B", "Fahrradwerkstatt Lindenstraße: Wir reparieren Reifen, Bremsen und Schaltungen schnell und günstig. Auch kleine Schäden werden sofort behoben."),
        ad("C", "Italienisch für Anfänger: Vierwochenkurs jeden Montag von 18 bis 19 Uhr. Sie lernen einfache Gespräche für den Urlaub."),
        ad("D", "Yoga am Morgen: Leichte Übungen für Rücken und Entspannung, dienstags und donnerstags von 7 bis 8 Uhr im Stadtpark. Für alle Levels."),
        ad("E", "Bücherbörse im Rathaus: Gebrauchte Romane und Sachbücher zu kleinen Preisen, jeden Samstag von 10 bis 14 Uhr."),
      ]
    ),
  ],
  "B1.1": [
    part(
      "b11-rp1",
      "Teil 1",
      "detail",
      "Die Stadt Lindau möchte bis 2028 eine neue Uferpromenade bauen. Geplant sind breitere Radwege, mehr Bäume und ein kleiner Platz am Hafen. Die Verwaltung hat das Projekt im Bürgerzentrum vorgestellt. Viele Bewohner begrüßen die Pläne, weil der Aufenthalt am Wasser angenehmer wird. Einige Anwohner sorgen sich jedoch um Lärm während der Bauarbeiten und um die Kosten. Die Stadt versprach, die Arbeiten in Etappen durchzuführen und die Anwohner frühzeitig zu informieren. Bis Ende des Monats können Einwendungen schriftlich eingereicht werden.",
      [
        q("b11-rp1-q1", "Was plant die Stadt?", "Eine neue Uferpromenade", ["Einen neuen Bahnhof", "Ein Einkaufszentrum"], "Câu đầu nêu rõ eine neue Uferpromenade."),
        q("b11-rp1-q2", "Was gehört zu den Plänen?", "Breitere Radwege und mehr Bäume", ["Nur ein Parkplatz", "Eine neue Schule"], "Cụm breitere Radwege, mehr Bäume und ein kleiner Platz."),
        q("b11-rp1-q3", "Warum begrüßen viele Bewohner das Projekt?", "Der Aufenthalt am Wasser wird angenehmer", ["Die Mieten werden billiger", "Es gibt weniger Verkehr"], "Cụm weil der Aufenthalt am Wasser angenehmer wird."),
        q("b11-rp1-q4", "Was befürchten einige Anwohner?", "Lärm und hohe Kosten", ["Zu wenige Bäume", "Keine Parkplätze"], "Cụm um Lärm ... und um die Kosten."),
        q("b11-rp1-q5", "Wie kann man Einwendungen abgeben?", "Schriftlich bis Ende des Monats", ["Mündlich im Bürgerzentrum", "Per Telefon bis morgen"], "Cụm Bis Ende des Monats ... schriftlich eingereicht."),
      ]
    ),
    part(
      "b11-rp2",
      "Teil 2",
      "matching",
      "Beratungsangebote im Bürgerzentrum:\nA · Raum 1 – Sozialberatung: Montag bis Freitag 9–12 Uhr, Fragen zu Miete, Leistungen und Formularen.\nB · Raum 2 – Jobberatung: Dienstag und Donnerstag 14–17 Uhr, Bewerbungen, Lebenslauf und Weiterbildung.\nC · Raum 3 – Sprachberatung: Mittwoch 10–13 Uhr, Deutschkurse, Prüfungen und Anerkennung von Abschlüssen.",
      [
        q("b11-rp2-q1", "Sie möchten Ihren Lebenslauf prüfen lassen. Wo passt das am besten?", "Raum 2", ["Raum 1", "Raum 3"], "Lebenslauf gehört zur Jobberatung in Raum 2."),
        q("b11-rp2-q2", "Sie haben Fragen zu Ihrer Miete. Wo passt das am besten?", "Raum 1", ["Raum 2", "Raum 3"], "Miete gehört zur Sozialberatung in Raum 1."),
        q("b11-rp2-q3", "Sie suchen einen Deutschkurs. Wo passt das am besten?", "Raum 3", ["Raum 1", "Raum 2"], "Deutschkurse gehören zur Sprachberatung in Raum 3."),
        q("b11-rp2-q4", "Sie möchten eine Weiterbildung planen. Wo passt das am besten?", "Raum 2", ["Raum 1", "Raum 3"], "Weiterbildung wird in der Jobberatung besprochen."),
        q("b11-rp2-q5", "Sie brauchen Hilfe bei einem Formular für Leistungen. Wo passt das am besten?", "Raum 1", ["Raum 2", "Raum 3"], "Formulare und Leistungen gehören zur Sozialberatung."),
      ]
    ),
    part(
      "b11-rp3",
      "Teil 3",
      "email",
      "Sehr geehrte Damen und Herren,\nich bin vor Kurzem nach Lindau gezogen und möchte einen Bibliotheksausweis beantragen. Im Internet habe ich gelesen, dass man dafür einen Wohnsitznachweis braucht. Ich habe aber noch keine Meldebescheinigung, sondern nur einen Mietvertrag. Wird dieser akzeptiert? Außerdem möchte ich wissen, wie viele Bücher ich gleichzeitig ausleihen darf und ob ich die Ausleihe online verlängern kann. Die Öffnungszeiten habe ich schon gesehen; ich komme gern am Samstag vorbei.\nKönnen Sie mir kurz antworten? Vielen Dank im Voraus. Mit freundlichen Grüßen\nDeniz Kaya",
      [
        q("b11-rp3-q1", "Warum schreibt Deniz Kaya?", "Er möchte einen Bibliotheksausweis beantragen.", ["Er möchte ein Buch zurückgeben.", "Er möchte die Bibliothek schließen."], "Cụm möchte einen Bibliotheksausweis beantragen."),
        q("b11-rp3-q2", "Welches Dokument hat er noch nicht?", "Die Meldebescheinigung", ["Den Mietvertrag", "Den Ausweis"], "Cụm Ich habe aber noch keine Meldebescheinigung."),
        q("b11-rp3-q3", "Welches Dokument hat er stattdessen?", "Einen Mietvertrag", ["Eine Rechnung", "Ein Führerschein"], "Cụm sondern nur einen Mietvertrag."),
        q("b11-rp3-q4", "Was möchte er über die Ausleihe wissen?", "Wie viele Bücher und ob online verlängert werden kann", ["Nur die Öffnungszeiten", "Nur den Preis"], "Câu hỏi gồm wie viele Bücher und ob online verlängern."),
        q("b11-rp3-q5", "Wann möchte er vorbeikommen?", "Am Samstag", ["Am Montag", "Am Freitagabend"], "Cụm ich komme gern am Samstag vorbei."),
      ]
    ),
    part(
      "b11-rp4",
      "Teil 4",
      "ads",
      "Wählen Sie für jede Person das passende Angebot. Jedes Angebot wird nur einmal gewählt.",
      [
        q("b11-rp4-q1", "Frau Mayer möchte abends Deutsch lernen.", "A", ["B", "C", "D", "E"], "Angebot A ist der Deutschkurs am Abend."),
        q("b11-rp4-q2", "Herr Roth sucht einen Job am Samstag.", "B", ["A", "C", "D", "E"], "Angebot B ist die Teilzeitstelle im Buchladen."),
        q("b11-rp4-q3", "Frau Klein fährt jeden Freitag nach München und sucht Mitfahrer.", "C", ["A", "B", "D", "E"], "Angebot C ist die Mitfahrgelegenheit nach München."),
        q("b11-rp4-q4", "Herr Bauer hat eine kaputte Waschmaschine.", "D", ["A", "B", "C", "E"], "Angebot D ist die Reparatur von Waschmaschinen."),
        q("b11-rp4-q5", "Frau Sato möchte in entspannter Atmosphäre Deutsch sprechen.", "E", ["A", "B", "C", "D"], "Angebot E ist das Sprachcafé."),
      ],
      [
        ad("A", "Deutsch A2–B1: Kurse abends im Bürgerzentrum, Anmeldung online bis Freitag."),
        ad("B", "Teilzeit im Buchladen: Samstag 10–16 Uhr, Erfahrung ist nicht nötig."),
        ad("C", "Mitfahrgelegenheit Lindau – München: jeden Freitag, 60 €, zwei Plätze frei."),
        ad("D", "Reparaturdienst: Waschmaschinen und Kühlschränke, günstig, Termin nach Vereinbarung."),
        ad("E", "Sprachcafé: jeden Donnerstag 17–19 Uhr, kostenlos, alle Levels willkommen."),
      ]
    ),
  ],
  "B1.2": [
    part(
      "b12-rp1",
      "Teil 1",
      "detail",
      "Eine neue Studie des Instituts für Arbeitsmarkt zeigt, dass Homeoffice vielen Beschäftigten die Arbeit erleichtert, aber nicht allen. Besonders erfahrene Mitarbeiter schätzen die Ruhe zu Hause, während neue Kolleginnen und Kollegen öfter über fehlendes Feedback klagen. Die Forscher befragten 1.200 Personen in 40 Unternehmen. Ergebnis: Wer regelmäßig Kolleginnen und Kollegen persönlich trifft, ist zufriedener. Das Institut empfiehlt deshalb ein Mischmodell mit zwei bis drei Tagen im Büro. Wichtig sei außerdem eine klare Regelung, wann Mitarbeiter erreichbar sind, damit die Arbeit nicht den ganzen Tag andauert.",
      [
        q("b12-rp1-q1", "Was untersuchte die Studie?", "Homeoffice und Zufriedenheit", ["Die Mieten in Städten", "Den Verkehr am Bahnhof"], "Câu đầu nói về Homeoffice und die Arbeit."),
        q("b12-rp1-q2", "Wer klagt häufiger über fehlendes Feedback?", "Neue Kolleginnen und Kollegen", ["Erfahrene Mitarbeiter", "Die Geschäftsführung"], "Cụm neue Kolleginnen und Kollegen öfter über fehlendes Feedback klagen."),
        q("b12-rp1-q3", "Wie viele Personen wurden befragt?", "1.200", ["120", "12.000"], "Cụm befragten 1.200 Personen."),
        q("b12-rp1-q4", "Was empfiehlt das Institut?", "Ein Mischmodell mit zwei bis drei Tagen im Büro", ["Nur Homeoffice", "Keine persönlichen Treffen"], "Cụm empfiehlt ... ein Mischmodell mit zwei bis drei Tagen im Büro."),
        q("b12-rp1-q5", "Warum ist eine klare Erreichbarkeitsregelung wichtig?", "Damit die Arbeit nicht den ganzen Tag andauert", ["Damit alle länger arbeiten", "Damit niemand Pause macht"], "Cụm damit die Arbeit nicht den ganzen Tag andauert."),
      ]
    ),
    part(
      "b12-rp2",
      "Teil 2",
      "matching",
      "Weiterbildungszentrum – Beratungsbereiche:\nA · EDV: Computerkurse, Excel, Online-Sicherheit, dienstags 13–17 Uhr.\nB · Sprachen: Deutsch, Englisch, Italienisch; Kursbeginn monatlich; Beratung mittwochs 10–15 Uhr.\nC · Karriere: Bewerbungstraining, Gehaltsverhandlungen, Existenzgründung; freitags 9–13 Uhr.",
      [
        q("b12-rp2-q1", "Sie möchten einen Excel-Kurs besuchen. Wo passt das am besten?", "Bereich A", ["Bereich B", "Bereich C"], "Excel steht beim Bereich EDV."),
        q("b12-rp2-q2", "Sie bereiten sich auf ein Vorstellungsgespräch vor. Wo passt das am besten?", "Bereich C", ["Bereich A", "Bereich B"], "Bewerbungstraining steht beim Bereich Karriere."),
        q("b12-rp2-q3", "Sie möchten Italienisch lernen. Wo passt das am besten?", "Bereich B", ["Bereich A", "Bereich C"], "Italienisch steht beim Bereich Sprachen."),
        q("b12-rp2-q4", "Sie haben Fragen zur Online-Sicherheit. Wo passt das am besten?", "Bereich A", ["Bereich B", "Bereich C"], "Online-Sicherheit steht beim Bereich EDV."),
        q("b12-rp2-q5", "Sie möchten sich selbstständig machen. Wo passt das am besten?", "Bereich C", ["Bereich A", "Bereich B"], "Existenzgründung steht beim Bereich Karriere."),
      ]
    ),
    part(
      "b12-rp3",
      "Teil 3",
      "email",
      "Sehr geehrte Frau Wagner,\nich habe am 12. Mai bei Ihnen ein Buch bestellt. Die Bestellnummer steht in der Anlage. Leider ist das Paket bis heute nicht angekommen, obwohl in der E-Mail eine Lieferung innerhalb von drei Tagen angekündigt wurde. Ich habe bereits zweimal nachgefragt, aber keine Antwort erhalten. Da ich das Buch für eine Prüfung brauche, bitte ich um eine sofortige Lieferung oder eine Rückerstattung des Betrags. Bitte bestätigen Sie mir kurz, wie Sie vorgehen werden.\nMit freundlichen Grüßen\nJonas Weber",
      [
        q("b12-rp3-q1", "Worüber beschwert sich Jonas Weber?", "Seine Bestellung ist nicht angekommen.", ["Das Buch war zu teuer.", "Die Website funktioniert nicht."], "Cụm das Paket bis heute nicht angekommen."),
        q("b12-rp3-q2", "Wann hat er bestellt?", "Am 12. Mai", ["Am 12. Juni", "Am 21. Mai"], "Cụm am 12. Mai bei Ihnen ein Buch bestellt."),
        q("b12-rp3-q3", "Was war in der E-Mail angekündigt?", "Eine Lieferung innerhalb von drei Tagen", ["Eine Lieferung innerhalb von drei Wochen", "Keine Lieferung"], "Cụm Lieferung innerhalb von drei Tagen angekündigt."),
        q("b12-rp3-q4", "Was hat er schon versucht?", "Zweimal nachgefragt", ["Das Buch zurückgeschickt", "Ein neues Konto eröffnet"], "Cụm Ich habe bereits zweimal nachgefragt."),
        q("b12-rp3-q5", "Was fordert er?", "Sofortige Lieferung oder Geld zurück", ["Einen Rabatt", "Ein anderes Buch"], "Cụm um eine sofortige Lieferung oder eine Rückerstattung."),
      ]
    ),
    part(
      "b12-rp4",
      "Teil 4",
      "ads",
      "Wählen Sie für jede Person das passende Angebot. Jedes Angebot wird nur einmal gewählt.",
      [
        q("b12-rp4-q1", "Frau Neumann möchte eine ruhige Wohnung in der Nähe des Bahnhofs.", "E", ["A", "B", "C", "D"], "Angebot E beschreibt eine ruhige Wohnung nahe dem Bahnhof."),
        q("b12-rp4-q2", "Herr Dietrich sucht eine seltene Buchausgabe.", "A", ["B", "C", "D", "E"], "Angebot A ist das Antiquariat mit seltenen Ausgaben."),
        q("b12-rp4-q3", "Frau Roth möchte zwei Wochen Englisch im Ausland lernen.", "B", ["A", "C", "D", "E"], "Angebot B ist die Sprachreise nach Irland."),
        q("b12-rp4-q4", "Herr Klein hat einen defekten Toaster.", "C", ["A", "B", "D", "E"], "Angebot C ist das Repair Café für Elektrogeräte."),
        q("b12-rp4-q5", "Frau Bauer bereitet sich auf ein Vorstellungsgespräch vor.", "D", ["A", "B", "C", "E"], "Angebot D ist der Kurs für Bewerbung und Vorstellungsgespräch."),
      ],
      [
        ad("A", "Antiquariat am Markt: Bücher kaufen, seltene Ausgaben, Gutschein für Erstkunden."),
        ad("B", "Sprachreise Irland: zwei Wochen, Unterkunft bei einer Gastfamilie, Kurs inklusive."),
        ad("C", "Repair Café: Reparatur von Elektrogeräten und Fahrrädern, samstags 11–15 Uhr."),
        ad("D", "Kurs Bewerbung und Vorstellungsgespräch: ein Abend, 25 €, Anmeldung online."),
        ad("E", "Wohnung: zwei Zimmer, ruhig, 15 Minuten zum Bahnhof, ab 1. August."),
      ]
    ),
  ],
};
