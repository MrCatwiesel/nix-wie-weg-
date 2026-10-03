import type { PackingCategory } from './types'

/**
 * Mengenregel einer Vorlage:
 *  - Zahl: feste Menge
 *  - { perDay, max }: pro Reisetag, gedeckelt (z. B. Socken)
 *  - { perPerson }: pro reisender Person
 */
export type QuantityRule = number | { perDay: number; max: number } | { perPerson: number }

export interface TemplateItem {
  name: string
  category: PackingCategory
  qty?: QuantityRule
  essential?: boolean
  /**
   * Persönlich: jeder Teilnehmer bekommt einen eigenen Eintrag.
   * Mengen "pro Tag" und "pro Person" gelten automatisch als persönlich.
   */
  personal?: boolean
}

export interface PackingTemplate {
  id: string
  title: string
  icon: string
  description: string
  items: TemplateItem[]
}

/**
 * Eingebaute Vorlagen. Neue Vorlage = neues Objekt in dieser Liste.
 * Namen gleicher Dinge in allen Vorlagen identisch schreiben – sie werden beim Zusammenführen zusammengefasst.
 */
export const TEMPLATES: PackingTemplate[] = [
  {
    id: 'basis',
    title: 'Grundausstattung',
    icon: 'check2-square',
    description: 'Was auf fast jede Reise gehört',
    items: [
      { name: 'Personalausweis / Reisepass', category: 'dokumente', qty: { perPerson: 1 }, essential: true },
      { name: 'Führerschein', category: 'dokumente', essential: true },
      { name: 'Krankenversicherungskarte', category: 'dokumente', qty: { perPerson: 1 }, essential: true },
      { name: 'EC-/Kreditkarte', category: 'dokumente', essential: true },
      { name: 'Bargeld', category: 'dokumente' },
      { name: 'Buchungsbestätigungen', category: 'dokumente' },
      { name: 'Unterwäsche', category: 'kleidung', qty: { perDay: 1, max: 8 } },
      { name: 'Socken', category: 'kleidung', qty: { perDay: 1, max: 8 } },
      { name: 'T-Shirts', category: 'kleidung', qty: { perDay: 0.7, max: 6 } },
      { name: 'Hosen', category: 'kleidung', qty: { perDay: 0.3, max: 3 } },
      { name: 'Pullover / Jacke', category: 'kleidung', qty: 1, personal: true },
      { name: 'Schlafsachen', category: 'kleidung', qty: 1, personal: true },
      { name: 'Bequeme Schuhe', category: 'kleidung', qty: 1, personal: true },
      { name: 'Zahnbürste & Zahnpasta', category: 'hygiene', personal: true },
      { name: 'Duschgel & Shampoo', category: 'hygiene' },
      { name: 'Deo', category: 'hygiene', personal: true },
      { name: 'Kamm / Bürste', category: 'hygiene', personal: true },
      { name: 'Persönliche Medikamente', category: 'gesundheit', essential: true, personal: true },
      { name: 'Pflaster & Schmerzmittel', category: 'gesundheit' },
      { name: 'Handy & Ladekabel', category: 'technik', essential: true, personal: true },
      { name: 'Powerbank', category: 'technik' },
      { name: 'Kopfhörer', category: 'technik', personal: true },
      { name: 'Schlüssel (Haus)', category: 'sonstiges', essential: true }
    ]
  },
  {
    id: 'strand',
    title: 'Strand & Sonne',
    icon: 'sun',
    description: 'Badeurlaub, Pool, Meer',
    items: [
      { name: 'Badesachen', category: 'kleidung', qty: 2, personal: true },
      { name: 'Strandtuch', category: 'freizeit', qty: { perPerson: 1 } },
      { name: 'Sonnencreme (LSF 30+)', category: 'hygiene', essential: true },
      { name: 'After-Sun', category: 'hygiene' },
      { name: 'Sonnenbrille', category: 'freizeit', qty: { perPerson: 1 } },
      { name: 'Sonnenhut / Kappe', category: 'kleidung', qty: { perPerson: 1 } },
      { name: 'Flip-Flops / Badeschuhe', category: 'kleidung', qty: { perPerson: 1 } },
      { name: 'Shorts', category: 'kleidung', qty: { perDay: 0.4, max: 4 } },
      { name: 'Strandtasche', category: 'freizeit' },
      { name: 'Wasserdichte Handyhülle', category: 'technik' },
      { name: 'Insektenschutz', category: 'gesundheit' }
    ]
  },
  {
    id: 'wandern',
    title: 'Wandern & Berge',
    icon: 'tree',
    description: 'Tageswanderungen, Bergtouren',
    items: [
      { name: 'Wanderschuhe', category: 'kleidung', qty: { perPerson: 1 }, essential: true },
      { name: 'Wandersocken', category: 'kleidung', qty: { perDay: 0.5, max: 4 } },
      { name: 'Regenjacke', category: 'kleidung', qty: { perPerson: 1 }, essential: true },
      { name: 'Funktionsshirts', category: 'kleidung', qty: 3, personal: true },
      { name: 'Fleecejacke', category: 'kleidung', qty: 1, personal: true },
      { name: 'Tagesrucksack', category: 'freizeit', qty: { perPerson: 1 } },
      { name: 'Trinkflasche', category: 'unterwegs', qty: { perPerson: 1 } },
      { name: 'Wanderkarte / Offline-Karten', category: 'freizeit' },
      { name: 'Blasenpflaster', category: 'gesundheit' },
      { name: 'Erste-Hilfe-Set', category: 'gesundheit', essential: true },
      { name: 'Stirnlampe', category: 'technik' },
      { name: 'Sonnencreme (LSF 30+)', category: 'hygiene' },
      { name: 'Sonnenbrille', category: 'freizeit', qty: { perPerson: 1 } }
    ]
  },
  {
    id: 'stadt',
    title: 'Städtereise',
    icon: 'buildings',
    description: 'Museen, Restaurants, viel zu Fuß',
    items: [
      { name: 'Bequeme Schuhe', category: 'kleidung', qty: 1, personal: true },
      { name: 'Schickes Outfit für abends', category: 'kleidung', qty: 1, personal: true },
      { name: 'Kleiner Rucksack / Umhängetasche', category: 'freizeit' },
      { name: 'Regenschirm', category: 'unterwegs' },
      { name: 'Stadtplan / Offline-Karten', category: 'technik' },
      { name: 'Museumspass / Tickets', category: 'dokumente' },
      { name: 'Reiseadapter', category: 'technik' }
    ]
  },
  {
    id: 'winter',
    title: 'Winter & Ski',
    icon: 'snow',
    description: 'Schnee, Kälte, Wintersport',
    items: [
      { name: 'Winterjacke', category: 'kleidung', qty: { perPerson: 1 }, essential: true },
      { name: 'Skihose', category: 'kleidung', qty: { perPerson: 1 } },
      { name: 'Thermounterwäsche', category: 'kleidung', qty: 2, personal: true },
      { name: 'Mütze, Schal, Handschuhe', category: 'kleidung', qty: { perPerson: 1 } },
      { name: 'Skisocken', category: 'kleidung', qty: { perDay: 0.5, max: 5 } },
      { name: 'Winterstiefel', category: 'kleidung', qty: { perPerson: 1 } },
      { name: 'Skibrille / Helm', category: 'freizeit', qty: { perPerson: 1 } },
      { name: 'Lippenpflege', category: 'hygiene' },
      { name: 'Sonnencreme (LSF 30+)', category: 'hygiene' },
      { name: 'Skipass / Liftkarte', category: 'dokumente' }
    ]
  },
  {
    id: 'camping',
    title: 'Camping',
    icon: 'house',
    description: 'Zelt, Wohnmobil, draußen schlafen',
    items: [
      { name: 'Zelt', category: 'freizeit', essential: true },
      { name: 'Schlafsack', category: 'freizeit', qty: { perPerson: 1 }, essential: true },
      { name: 'Isomatte', category: 'freizeit', qty: { perPerson: 1 } },
      { name: 'Campingkocher & Gas', category: 'freizeit' },
      { name: 'Geschirr & Besteck', category: 'freizeit' },
      { name: 'Taschenlampe / Stirnlampe', category: 'technik' },
      { name: 'Campingstühle', category: 'freizeit', qty: { perPerson: 1 } },
      { name: 'Müllbeutel', category: 'sonstiges' },
      { name: 'Wäscheleine & Klammern', category: 'sonstiges' },
      { name: 'Insektenschutz', category: 'gesundheit' },
      { name: 'Campingplatz-Ausweis (ACSI o. Ä.)', category: 'dokumente' }
    ]
  },
  {
    id: 'kinder',
    title: 'Mit Kindern',
    icon: 'balloon',
    description: 'Familienurlaub mit kleinen Kindern',
    items: [
      { name: 'Kinderreisepass / Kinderausweis', category: 'dokumente', essential: true },
      { name: 'Kuscheltier', category: 'kinder', essential: true },
      { name: 'Wechselkleidung', category: 'kinder', qty: 2 },
      { name: 'Spiele & Bücher für unterwegs', category: 'kinder' },
      { name: 'Snacks', category: 'unterwegs' },
      { name: 'Kinder-Sonnencreme', category: 'kinder' },
      { name: 'Fieberthermometer', category: 'gesundheit' },
      { name: 'Fiebersaft / Zäpfchen', category: 'gesundheit' },
      { name: 'Feuchttücher', category: 'kinder' },
      { name: 'Kopfhörer für Kinder', category: 'technik' }
    ]
  },
  {
    id: 'auto',
    title: 'Mit dem Auto',
    icon: 'car-front',
    description: 'Lange Autofahrten',
    items: [
      { name: 'Fahrzeugschein', category: 'dokumente', essential: true },
      { name: 'Warnwesten', category: 'unterwegs', qty: { perPerson: 1 } },
      { name: 'Vignette / Mautbox', category: 'dokumente' },
      { name: 'Handyhalterung & Autoladekabel', category: 'technik' },
      { name: 'Getränke & Snacks', category: 'unterwegs' },
      { name: 'Kühltasche', category: 'unterwegs' },
      { name: 'Sonnenschutz für Autofenster', category: 'unterwegs' }
    ]
  },
  {
    id: 'flug',
    title: 'Flugreise',
    icon: 'airplane',
    description: 'Handgepäck und Flughafen',
    items: [
      { name: 'Bordkarten', category: 'dokumente', essential: true },
      { name: 'Flüssigkeitenbeutel (max. 100 ml)', category: 'hygiene' },
      { name: 'Nackenkissen', category: 'unterwegs' },
      { name: 'Kofferwaage', category: 'sonstiges' },
      { name: 'Gepäckanhänger', category: 'sonstiges' },
      { name: 'Reiseadapter', category: 'technik' },
      { name: 'Kopfhörer', category: 'technik', personal: true }
    ]
  }
]
