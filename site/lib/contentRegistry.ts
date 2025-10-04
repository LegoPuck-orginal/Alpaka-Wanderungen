export type ContentEntry = {
  key: string;
  label: string;
  fallback: string;
  rows?: number;
  hint?: string;
};

export type ContentSection = {
  id: string;
  title: string;
  description?: string;
  entries: ContentEntry[];
};

export const contentSections: ContentSection[] = [
  {
    id: "layout.navigation",
    title: "Layout – Navigation",
    entries: [
      {
        key: "layout.nav.tagline",
        label: "Header: Claim neben Logo",
        fallback: "Entspannt im Grünen",
      },
      {
        key: "layout.nav.tours",
        label: "Navigationseintrag Touren",
        fallback: "Touren",
      },
      {
        key: "layout.nav.calendar",
        label: "Navigationseintrag Kalender",
        fallback: "Kalender",
      },
      {
        key: "layout.nav.admin",
        label: "Navigationseintrag Admin (nur sichtbar für Admins)",
        fallback: "Admin",
      },
      {
        key: "layout.nav.cta",
        label: "Header CTA-Button",
        fallback: "Jetzt buchen",
      },
      {
        key: "layout.nav.logout",
        label: "Logout-Button",
        fallback: "Logout",
      },
    ],
  },
  {
    id: "layout.footer",
    title: "Layout – Footer",
    entries: [
      {
        key: "layout.footer.ctaTitle",
        label: "Footer-CTA Überschrift",
        fallback: "Bereit für den Alpaka-Ausflug?",
      },
      {
        key: "layout.footer.ctaText",
        label: "Footer-CTA Beschreibung",
        fallback: "Finde den passenden Termin, bring deine Liebsten mit und genieße entschleunigende Momente mit unseren flauschigen Begleitern.",
        rows: 3,
      },
      {
        key: "layout.footer.primaryCta",
        label: "Footer-CTA Primärer Button",
        fallback: "Touren entdecken",
      },
      {
        key: "layout.footer.secondaryCta",
        label: "Footer-CTA Sekundärer Button",
        fallback: "Kalender ansehen",
      },
      {
        key: "layout.footer.privacy",
        label: "Footer-Link Datenschutz",
        fallback: "Datenschutz",
      },
      {
        key: "layout.footer.admin",
        label: "Footer-Link Admin",
        fallback: "Admin",
      },
      {
        key: "layout.footer.signature",
        label: "Footer Signatur",
        fallback: "Made with Liebe & Alpaka-Lächeln",
      },
    ],
  },
  {
    id: "home.hero",
    title: "Startseite – Hero",
    entries: [
      {
        key: "hero.badge",
        label: "Hero-Badge",
        fallback: "Zeit für Flausch & frische Luft",
      },
      {
        key: "hero.title",
        label: "Hero-Titel",
        fallback: "Alpaka Wanderungen",
      },
      {
        key: "hero.subtitle",
        label: "Hero-Text",
        fallback: "Erlebe unvergessliche Touren mit unseren Alpakas in der Natur. Jetzt Termin reservieren und entspannen!",
        rows: 3,
      },
      {
        key: "hero.cta",
        label: "Hero Button (primär)",
        fallback: "Jetzt Termin buchen",
      },
      {
        key: "hero.secondaryCta",
        label: "Hero Button (Kalender)",
        fallback: "Termine im Kalender",
      },
      {
        key: "hero.directLink",
        label: "Hero Link (Direkt zur Buchung)",
        fallback: "Direkt zur Buchung",
      },
    ],
  },
  {
    id: "home.stats",
    title: "Startseite – Kennzahlen",
    entries: [
      {
        key: "hero.stats.first.value",
        label: "Kennzahl 1 – Wert",
        fallback: "60+",
      },
      {
        key: "hero.stats.first.label",
        label: "Kennzahl 1 – Beschriftung",
        fallback: "Glückliche Touren im Monat",
      },
      {
        key: "hero.stats.second.value",
        label: "Kennzahl 2 – Wert",
        fallback: "100%",
      },
      {
        key: "hero.stats.second.label",
        label: "Kennzahl 2 – Beschriftung",
        fallback: "Flausche-Garantie",
      },
      {
        key: "hero.stats.third.value",
        label: "Kennzahl 3 – Wert",
        fallback: "4.9★",
      },
      {
        key: "hero.stats.third.label",
        label: "Kennzahl 3 – Beschriftung",
        fallback: "Bewertet von Gästen",
      },
    ],
  },
  {
    id: "home.features",
    title: "Startseite – Highlights",
    description: "Die Icons können als Emoji gepflegt werden.",
    entries: [
      {
        key: "home.features.1.icon",
        label: "Highlight 1 – Icon",
        fallback: "🧸",
      },
      {
        key: "home.features.1.title",
        label: "Highlight 1 – Titel",
        fallback: "Sanfte Begleitungen",
      },
      {
        key: "home.features.1.text",
        label: "Highlight 1 – Text",
        fallback: "Unsere Alpakas sind trainiert auf Ruhe und Nähe – ideal für Familien, Teams und besondere Momente.",
        rows: 3,
      },
      {
        key: "home.features.2.icon",
        label: "Highlight 2 – Icon",
        fallback: "🌿",
      },
      {
        key: "home.features.2.title",
        label: "Highlight 2 – Titel",
        fallback: "Natur zum Durchatmen",
      },
      {
        key: "home.features.2.text",
        label: "Highlight 2 – Text",
        fallback: "Geführte Pfade entlang von Wiesen, Hügeln und Waldlichtungen. Du bestimmst Tempo und Pause.",
        rows: 3,
      },
      {
        key: "home.features.3.icon",
        label: "Highlight 3 – Icon",
        fallback: "⏱️",
      },
      {
        key: "home.features.3.title",
        label: "Highlight 3 – Titel",
        fallback: "Buchung in Minuten",
      },
      {
        key: "home.features.3.text",
        label: "Highlight 3 – Text",
        fallback: "Wunschtermin wählen, Teilnehmer angeben, Bestätigung erhalten – mehr Zeit für Vorfreude.",
        rows: 3,
      },
    ],
  },
  {
    id: "home.steps",
    title: "Startseite – Ablauf",
    entries: [
      {
        key: "home.steps.tag",
        label: "Ablauf-Badge",
        fallback: "So funktioniert's",
      },
      {
        key: "home.steps.title",
        label: "Ablauf-Überschrift",
        fallback: "In drei entspannten Schritten zum Alpaka-Glück",
      },
      {
        key: "home.steps.description",
        label: "Ablauf-Intro",
        fallback: "Wir halten die Organisation schlank, damit du dich auf das Erlebnis konzentrieren kannst.",
        rows: 3,
      },
      {
        key: "home.steps.1.title",
        label: "Schritt 1 – Titel",
        fallback: "Tour auswählen",
      },
      {
        key: "home.steps.1.text",
        label: "Schritt 1 – Text (HTML erlaubt)",
        fallback: "Stöbere in der <a href=\"/tours\">Tour-Übersicht</a> und finde die passende Route für deine Crew.",
        rows: 3,
        hint: "Links können per HTML eingefügt werden.",
      },
      {
        key: "home.steps.2.title",
        label: "Schritt 2 – Titel",
        fallback: "Datum reservieren",
      },
      {
        key: "home.steps.2.text",
        label: "Schritt 2 – Text",
        fallback: "Wähle deinen Termin, gib die Personenanzahl ein und sichere dir freie Plätze.",
        rows: 3,
      },
      {
        key: "home.steps.3.title",
        label: "Schritt 3 – Titel",
        fallback: "Ankommen & genießen",
      },
      {
        key: "home.steps.3.text",
        label: "Schritt 3 – Text",
        fallback: "Wir begrüßen dich mit einem Lächeln, stellen dir ein Alpaka vor und der Spaziergang kann starten.",
        rows: 3,
      },
    ],
  },
  {
    id: "home.tours",
    title: "Startseite – Tour-Preview",
    entries: [
      {
        key: "home.tours.tag",
        label: "Tour-Preview Badge",
        fallback: "Beliebt bei Gruppen & Familien",
      },
      {
        key: "home.tours.title",
        label: "Tour-Preview Überschrift",
        fallback: "Unsere gefragtesten Touren",
      },
      {
        key: "home.tours.subtitle",
        label: "Tour-Preview Beschreibung",
        fallback: "Frisch aktualisiert – sichere dir einen Platz, solange Kapazitäten frei sind.",
        rows: 3,
      },
      {
        key: "home.tours.seeAll",
        label: "Tour-Preview Button",
        fallback: "Alle Touren",
      },
      {
        key: "home.tours.cardFallback",
        label: "Tourkarte Platzhalter",
        fallback: "Alpaka Tour",
      },
      {
        key: "home.tours.priceSuffix",
        label: "Tourkarte Preissuffix",
        fallback: "€ pro Person",
      },
      {
        key: "home.tours.detailsLink",
        label: "Tourkarte Link",
        fallback: "Details ansehen",
      },
    ],
  },
  {
    id: "home.reviews",
    title: "Startseite – Bewertungen",
    entries: [
      {
        key: "home.reviews.tag",
        label: "Bewertungen Badge",
        fallback: "Stimmen aus der Community",
      },
      {
        key: "home.reviews.title",
        label: "Bewertungen Überschrift",
        fallback: "Was Gäste nach der Tour erzählen",
      },
      {
        key: "home.reviews.description",
        label: "Bewertungen Beschreibung",
        fallback: "Echte Rückmeldungen, die zeigen, wie wohltuend Zeit mit einem Alpaka sein kann.",
        rows: 3,
      },
    ],
  },
  {
    id: "home.quickBooking",
    title: "Startseite – Schnellbuchung",
    entries: [
      {
        key: "home.quick.tag",
        label: "Schnellbuchung Badge",
        fallback: "Bereit, loszulegen?",
      },
      {
        key: "home.quick.title",
        label: "Schnellbuchung Überschrift",
        fallback: "Deine entspannte Schnellbuchung",
      },
      {
        key: "home.quick.description",
        label: "Schnellbuchung Text (HTML erlaubt)",
        fallback: "Besuche die <a href=\"/tours\">Tour-Übersicht</a>, wähle deine Wunschstrecke und sichere dir in wenigen Klicks deinen Termin. Oder checke den <a href=\"/calendar\">Kalender</a> für eine direkte Verfügbarkeitsanzeige.",
        rows: 3,
        hint: "Links können per HTML eingefügt werden.",
      },
      {
        key: "home.quick.primaryCta",
        label: "Schnellbuchung Primärer Button",
        fallback: "Touren ansehen",
      },
      {
        key: "home.quick.secondaryCta",
        label: "Schnellbuchung Sekundärer Button",
        fallback: "Kalender ansehen",
      },
    ],
  },
  {
    id: "tours.list",
    title: "Tourübersicht",
    entries: [
      {
        key: "tours.list.tag",
        label: "Seiten-Badge",
        fallback: "Tour-Übersicht",
      },
      {
        key: "tours.list.subtitle",
        label: "Seitenüberschrift",
        fallback: "Finde deine Alpaka-Experience",
      },
      {
        key: "tours.list.description",
        label: "Seitenbeschreibung",
        fallback: "Wähle aus liebevoll kuratierten Routen. Jeder Spaziergang ist geführt, sanft und voller Wohlfühlmomente.",
        rows: 3,
      },
      {
        key: "tours.list.cta",
        label: "Button Verfügbarkeiten",
        fallback: "Verfügbarkeiten im Kalender",
      },
      {
        key: "tours.list.cardFallback",
        label: "Bildplatzhalter",
        fallback: "Bild folgt",
      },
      {
        key: "tours.list.cardPrice",
        label: "Preissuffix auf Karten",
        fallback: "€ p.P.",
      },
      {
        key: "tours.list.cardLink",
        label: "Link in Tourkarte",
        fallback: "Details & Termine",
      },
    ],
  },
  {
    id: "tour.detail",
    title: "Tourdetail",
    entries: [
      {
        key: "tour.detail.tag",
        label: "Detail-Badge",
        fallback: "Geführte Alpaka-Tour",
      },
      {
        key: "tour.detail.priceLabel",
        label: "Preisbox Label",
        fallback: "ab Preis pro Person",
      },
      {
        key: "tour.detail.priceNote",
        label: "Preisbox Fußnote",
        fallback: "inkl. Einführung & Begleitung",
      },
      {
        key: "tour.detail.stats.durationLabel",
        label: "Statistikbox Dauer Label",
        fallback: "Dauer",
      },
      {
        key: "tour.detail.stats.durationSuffix",
        label: "Statistikbox Dauer Suffix",
        fallback: "Minuten",
      },
      {
        key: "tour.detail.stats.capacityLabel",
        label: "Statistikbox Kapazität Label",
        fallback: "Kapazität",
      },
      {
        key: "tour.detail.stats.capacitySuffix",
        label: "Statistikbox Kapazität Suffix",
        fallback: "Personen",
      },
      {
        key: "tour.detail.stats.equipmentLabel",
        label: "Statistikbox Ausstattung Label",
        fallback: "Ausstattung",
      },
      {
        key: "tour.detail.stats.equipmentText",
        label: "Statistikbox Ausstattung Text",
        fallback: "Geführte Gruppe, ruhige Alpakas & gemütliche Pausenstation.",
        rows: 3,
      },
      {
        key: "tour.detail.sectionTitle",
        label: "Termin-Section Titel",
        fallback: "Termine & Reservierung",
      },
      {
        key: "tour.detail.sectionSubtitle",
        label: "Termin-Section Beschreibung",
        fallback: "Freie Plätze sind schnell vergeben – sichere dir deinen Slot frühzeitig.",
        rows: 3,
      },
      {
        key: "tour.detail.noSlots",
        label: "Hinweis Keine Termine",
        fallback: "Derzeit keine Termine verfügbar. Schau später wieder vorbei oder kontaktiere uns für individuelle Anfragen.",
        rows: 3,
      },
      {
        key: "tour.detail.slot.emailLabel",
        label: "Formular Label E-Mail",
        fallback: "E-Mail",
      },
      {
        key: "tour.detail.slot.button",
        label: "Formular Button",
        fallback: "Reservieren",
      },
      {
        key: "tour.detail.slot.availableBadgeLabel",
        label: "Termin-Karte Badge bei Verfügbarkeit",
        fallback: "frei",
      },
    ],
  },
  {
    id: "tour.detail.dynamic",
    title: "Tourdetail – Dynamische Texte",
    description: "Platzhalter bitte als {{name}} schreiben.",
    entries: [
      {
        key: "tour.detail.slot.badgeAvailable",
        label: "Badge-Text freie Plätze",
        fallback: "Noch {{free}} von {{capacity}} frei",
      },
      {
        key: "tour.detail.slot.badgeFull",
        label: "Badge-Text ausgebucht",
        fallback: "Ausgebucht",
      },
    ],
  },
  {
    id: "forms.persons",
    title: "Formulare – Personenfeld",
    description: "Platzhalter verwenden: {{alpacas}}, {{available}}",
    entries: [
      {
        key: "forms.persons.label",
        label: "Label Formularfeld",
        fallback: "Personen",
      },
      {
        key: "forms.persons.alpacaWarning",
        label: "Hinweis zu Alpaka-Anzahl",
        fallback: "⚠️ Wir haben nur {{alpacas}} Alpakas. Nicht alle können ein eigenes Alpaka führen.",
        rows: 3,
      },
      {
        key: "forms.persons.tooMany",
        label: "Hinweis zu wenigen Plätzen",
        fallback: "❌ Nur noch {{available}} Plätze verfügbar!",
        rows: 3,
      },
    ],
  },
  {
    id: "calendar.page",
    title: "Kalender-Seite",
    entries: [
      {
        key: "calendar.page.tag",
        label: "Kalender Badge",
        fallback: "Live-Kapazitäten",
      },
      {
        key: "calendar.page.title",
        label: "Kalender Überschrift",
        fallback: "Verfügbare Termine im Überblick",
      },
      {
        key: "calendar.page.description",
        label: "Kalender Beschreibung",
        fallback: "Plane deinen Ausflug im Voraus: Wähle direkt im Kalender deinen Wunschtermin und buche im Anschluss die passende Tour.",
        rows: 3,
      },
    ],
  },
  {
    id: "calendar.component",
    title: "Kalender-Komponente",
    description: "Platzhalter {{count}} für Anzahl nutzen.",
    entries: [
      {
        key: "calendar.component.prev",
        label: "Button vorheriger Monat",
        fallback: "← Vorheriger Monat",
      },
      {
        key: "calendar.component.next",
        label: "Button nächster Monat",
        fallback: "Nächster Monat →",
      },
      {
        key: "calendar.component.legendAvailable",
        label: "Legende – Verfügbar",
        fallback: "Verfügbare Termine",
      },
      {
        key: "calendar.component.legendPartial",
        label: "Legende – Teilweise belegt",
        fallback: "Teilweise belegt",
      },
      {
        key: "calendar.component.legendFull",
        label: "Legende – Ausgebucht",
        fallback: "Ausgebucht",
      },
      {
        key: "calendar.component.legendToday",
        label: "Legende – Heute",
        fallback: "Heute",
      },
      {
        key: "calendar.component.loading",
        label: "Ladezustand",
        fallback: "Lädt Verfügbarkeiten…",
      },
      {
        key: "calendar.component.dayBadge",
        label: "Label im Kalendertag bei freien Slots",
        fallback: "frei",
      },
      {
        key: "calendar.component.more",
        label: "Hinweis weitere Slots",
        fallback: "+{{count}} mehr",
      },
      {
        key: "calendar.component.slotAvailability",
        label: "Slot-Anzeige",
        fallback: "{{count}} frei",
      },
      {
        key: "calendar.component.halfMorning",
        label: "Beschriftung Vormittag",
        fallback: "Vormittag",
      },
      {
        key: "calendar.component.halfAfternoon",
        label: "Beschriftung Nachmittag",
        fallback: "Nachmittag",
      },
      {
        key: "calendar.component.statusFull",
        label: "Status – voll",
        fallback: "Ausgebucht",
      },
      {
        key: "calendar.component.statusFree",
        label: "Status – frei",
        fallback: "Freie Plätze",
      },
      {
        key: "calendar.component.statusPartial",
        label: "Status – teilweise frei",
        fallback: "{{count}} Plätze frei",
      },
    ],
  },
];

export const allContentEntries = contentSections.flatMap((section) =>
  section.entries.map((entry) => ({ ...entry, sectionId: section.id }))
);

const contentEntryMap = new Map(allContentEntries.map((entry) => [entry.key, entry]));

export function getContentEntry(key: string) {
  return contentEntryMap.get(key);
}

export function getContentDefaultsForSections(sectionIds: string[]) {
  const keys = new Map<string, { key: string; fallback: string }>();
  for (const section of contentSections) {
    if (sectionIds.includes(section.id)) {
      for (const entry of section.entries) {
        keys.set(entry.key, { key: entry.key, fallback: entry.fallback });
      }
    }
  }
  return Array.from(keys.values());
}

export function getAllContentDefaults() {
  return Array.from(new Map(allContentEntries.map((entry) => [entry.key, { key: entry.key, fallback: entry.fallback }])).values());
}
