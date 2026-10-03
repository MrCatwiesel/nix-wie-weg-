import { CATEGORY, type PackingCategory, type PackingDraft, type PackingItem } from './types'
import type { PackingTemplate, QuantityRule, TemplateItem } from './templates'

export function emptyPackingDraft(over: Partial<PackingDraft> = {}): PackingDraft {
  return {
    name: '',
    category: 'sonstiges',
    quantity: 1,
    person: '',
    packed: false,
    essential: false,
    notes: '',
    ...over
  }
}

/** Menge aus einer Vorlagen-Regel, gerundet und mindestens 1. */
export function resolveQuantity(rule: QuantityRule | undefined, days: number, travelers: number): number {
  if (rule === undefined) return 1
  if (typeof rule === 'number') return Math.max(1, Math.round(rule))
  if ('perDay' in rule) return Math.max(1, Math.min(rule.max, Math.ceil(rule.perDay * days)))
  return Math.max(1, rule.perPerson * Math.max(1, travelers))
}

/** Normalisierter Name zum Vergleichen (Groß-/Kleinschreibung und Leerzeichen egal). */
export function normName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Erzeugt Entwürfe aus mehreren Vorlagen.
 * Gleiche Dinge werden zusammengefasst (größte Menge, "wichtig" wenn irgendwo wichtig),
 * und Dinge, die schon auf der Liste stehen, werden übersprungen.
 */
export function draftsFromTemplates(
  templates: PackingTemplate[],
  days: number,
  travelers: number,
  existing: Pick<PackingItem, 'name'>[] = []
): PackingDraft[] {
  const have = new Set(existing.map((e) => normName(e.name)))
  const merged = new Map<string, PackingDraft>()
  const add = (t: TemplateItem) => {
    const key = normName(t.name)
    if (have.has(key)) return
    const qty = resolveQuantity(t.qty, days, travelers)
    const prev = merged.get(key)
    if (prev) {
      prev.quantity = Math.max(prev.quantity, qty)
      prev.essential = prev.essential || !!t.essential
    } else {
      merged.set(key, emptyPackingDraft({ name: t.name, category: t.category, quantity: qty, essential: !!t.essential }))
    }
  }
  for (const tpl of templates) tpl.items.forEach(add)
  return [...merged.values()]
}

/** Übernimmt Einträge einer anderen Reise: ausgepackt, ohne Doppelte. */
export function draftsFromOtherTrip(source: PackingItem[], existing: Pick<PackingItem, 'name'>[] = []): PackingDraft[] {
  const have = new Set(existing.map((e) => normName(e.name)))
  const out: PackingDraft[] = []
  for (const s of source) {
    const key = normName(s.name)
    if (have.has(key)) continue
    have.add(key)
    const { id: _i, tripId: _t, createdAt: _c, updatedAt: _u, ...rest } = s
    out.push({ ...rest, packed: false })
  }
  return out
}

export interface PackingProgress {
  total: number
  packed: number
  percent: number
  /** Wichtige Dinge, die noch fehlen */
  essentialOpen: number
}

export function progress(list: PackingItem[]): PackingProgress {
  const total = list.length
  const packed = list.filter((i) => i.packed).length
  return {
    total,
    packed,
    percent: total ? Math.round((packed / total) * 100) : 0,
    essentialOpen: list.filter((i) => i.essential && !i.packed).length
  }
}

export interface PackingFilter {
  openOnly?: boolean
  /** '' = alle; sonst nur Einträge dieser Person plus gemeinsame */
  person?: string
  search?: string
}

export interface CategoryGroup {
  category: PackingCategory
  items: PackingItem[]
  packed: number
}

/** Gruppiert nach Kategorie (feste Reihenfolge), innerhalb: offen vor gepackt, Wichtiges zuerst, dann alphabetisch. */
export function groupByCategory(list: PackingItem[], f: PackingFilter = {}): CategoryGroup[] {
  const q = f.search ? normName(f.search) : ''
  const filtered = list
    .filter((i) => !f.openOnly || !i.packed)
    .filter((i) => !f.person || !i.person || i.person === f.person)
    .filter((i) => !q || normName(i.name).includes(q))
  const groups = new Map<PackingCategory, PackingItem[]>()
  for (const i of filtered) {
    const g = groups.get(i.category) ?? []
    g.push(i)
    groups.set(i.category, g)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => CATEGORY[a].order - CATEGORY[b].order)
    .map(([category, items]) => ({
      category,
      packed: items.filter((i) => i.packed).length,
      items: items.sort(
        (a, b) =>
          Number(a.packed) - Number(b.packed) ||
          Number(b.essential) - Number(a.essential) ||
          a.name.localeCompare(b.name, 'de')
      )
    }))
}

/** Alle vorkommenden Personen, alphabetisch. */
export function persons(list: PackingItem[]): string[] {
  return [...new Set(list.map((i) => i.person.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'))
}

/**
 * Schnelleingabe: "3x Socken" oder "Socken x3" → Menge 3.
 * Alles andere wird als Name mit Menge 1 übernommen.
 */
export function parseQuickAdd(input: string): { name: string; quantity: number } {
  const s = input.trim()
  const pre = s.match(/^(\d{1,3})\s*[x×]\s*(.+)$/i)
  if (pre) return { name: pre[2].trim(), quantity: Math.max(1, Number(pre[1])) }
  const post = s.match(/^(.+?)\s*[x×]\s*(\d{1,3})$/i)
  if (post) return { name: post[1].trim(), quantity: Math.max(1, Number(post[2])) }
  return { name: s, quantity: 1 }
}

export function validatePacking(d: PackingDraft): Partial<Record<keyof PackingDraft, string>> {
  const e: Partial<Record<keyof PackingDraft, string>> = {}
  if (!d.name.trim()) e.name = 'Bitte einen Namen angeben.'
  if (!Number.isInteger(d.quantity) || d.quantity < 1) e.quantity = 'Mindestens 1.'
  return e
}
