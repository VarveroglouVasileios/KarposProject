/** Olive-oil batch passport: validation, quality category and a self-contained shareable code. Pure functions. */

export interface Batch {
  /** e.g. KP-2611-A */
  code: string
  producer: string
  grove: string
  variety: string
  harvestDate: string
  harvestKg: number
  millName: string
  pressDate: string
  pressTime: string
  /** Highest paste temperature in °C. */
  pressTemp: number
  analysisDate: string
  acidity: number
  peroxides: number
  bottlingDate: string
  bottles: number
  bottleMl: number
}

export type Errors = Record<string, string>
export type Category = 'extra' | 'virgin' | 'below'

export const CODE_RE = /^[A-Z]{2}-\d{4}-[A-Z]$/
export const COLD_MAX_C = 27

export const isISO = (s: string): boolean => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return false
  const t = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return t.getUTCFullYear() === +m[1] && t.getUTCMonth() === +m[2] - 1 && t.getUTCDate() === +m[3]
}
export const daysBetween = (a: string, b: string): number => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86_400_000)

/** EU categories by chemistry: extra virgin needs acidity <= 0.8 % and peroxides <= 20; virgin acidity <= 2.0 %. */
export function categoryOf(acidity: number, peroxides: number): Category {
  if (acidity <= 0.8 && peroxides <= 20) return 'extra'
  if (acidity <= 2.0 && peroxides <= 20) return 'virgin'
  return 'below'
}
export const CATEGORY_LABEL: Record<Category, string> = { extra: 'Εξαιρετικό παρθένο', virgin: 'Παρθένο', below: 'Εκτός κατηγορίας' }
export const isCold = (b: Pick<Batch, 'pressTemp'>): boolean => b.pressTemp < COLD_MAX_C

export function validateBatch(b: Batch): Errors {
  const e: Errors = {}
  if (!CODE_RE.test(b.code)) e.code = 'Ο κωδικός έχει τη μορφή KP-2611-A (2 γράμματα, 4 ψηφία, 1 γράμμα).'
  if (b.producer.trim().length < 2 || b.producer.length > 60) e.producer = 'Γράψτε τον παραγωγό.'
  if (b.grove.trim().length < 2 || b.grove.length > 60) e.grove = 'Γράψτε τον ελαιώνα.'
  if (b.variety.trim().length < 2 || b.variety.length > 40) e.variety = 'Γράψτε την ποικιλία.'
  if (b.millName.trim().length < 2 || b.millName.length > 60) e.millName = 'Γράψτε το ελαιοτριβείο.'
  for (const k of ['harvestDate', 'pressDate', 'analysisDate', 'bottlingDate'] as const) if (!isISO(b[k])) e[k] = 'Επιλέξτε έγκυρη ημερομηνία.'
  if (!e.harvestDate && !e.pressDate && b.pressDate < b.harvestDate) e.pressDate = 'Η πίεση δεν μπορεί να γίνει πριν τη συγκομιδή.'
  if (!e.pressDate && !e.analysisDate && b.analysisDate < b.pressDate) e.analysisDate = 'Η ανάλυση γίνεται μετά την πίεση.'
  if (!e.analysisDate && !e.bottlingDate && b.bottlingDate < b.analysisDate) e.bottlingDate = 'Η εμφιάλωση γίνεται μετά την ανάλυση.'
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(b.pressTime)) e.pressTime = 'Γράψτε ώρα όπως 18:30.'
  if (!Number.isFinite(b.harvestKg) || b.harvestKg < 1 || b.harvestKg > 200_000) e.harvestKg = 'Κιλά ελιές από 1 έως 200.000.'
  if (!Number.isFinite(b.pressTemp) || b.pressTemp < 5 || b.pressTemp > 60) e.pressTemp = 'Θερμοκρασία από 5 έως 60 °C.'
  if (!Number.isFinite(b.acidity) || b.acidity < 0 || b.acidity > 5) e.acidity = 'Οξύτητα από 0 έως 5 %.'
  if (!Number.isFinite(b.peroxides) || b.peroxides < 0 || b.peroxides > 60) e.peroxides = 'Υπεροξείδια από 0 έως 60.'
  if (!Number.isInteger(b.bottles) || b.bottles < 1 || b.bottles > 100_000) e.bottles = 'Φιάλες από 1 έως 100.000.'
  if (![100, 250, 500, 750, 1000, 3000, 5000].includes(b.bottleMl)) e.bottleMl = 'Επιλέξτε μέγεθος φιάλης.'
  return e
}

/** Liters of oil bottled and the oil yield from the olives, as a rough sanity figure. */
export const litres = (b: Batch): number => (b.bottles * b.bottleMl) / 1000
export const yieldPct = (b: Batch): number => (litres(b) * 0.916) / b.harvestKg * 100 // 0.916 kg per litre
export const sameDayPress = (b: Batch): boolean => b.pressDate === b.harvestDate

// --- shareable code -----------------------------------------------------------

/** 16-bit checksum (Fletcher-16 over UTF-8 bytes), so a mistyped or truncated link is detected. */
export function checksum(bytes: Uint8Array): string {
  let a = 0, b = 0
  for (const x of bytes) {
    a = (a + x) % 255
    b = (b + a) % 255
  }
  return ((b << 8) | a).toString(16).padStart(4, '0')
}

const toB64Url = (bytes: Uint8Array): string => {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const fromB64Url = (s: string): Uint8Array => {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(pad)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

/** Compact array form keeps the code (and the QR) small. */
const pack = (b: Batch): unknown[] => [b.code, b.producer, b.grove, b.variety, b.harvestDate, b.harvestKg, b.millName, b.pressDate, b.pressTime, b.pressTemp, b.analysisDate, b.acidity, b.peroxides, b.bottlingDate, b.bottles, b.bottleMl]

export function encodeBatch(b: Batch): string {
  const bytes = new TextEncoder().encode(JSON.stringify(pack(b)))
  return `${checksum(bytes)}${toB64Url(bytes)}`
}

export type Decoded = { ok: true; batch: Batch } | { ok: false; error: string }
export function decodeBatch(code: string): Decoded {
  try {
    if (code.length < 8) return { ok: false, error: 'Ο σύνδεσμος είναι ελλιπής.' }
    const sum = code.slice(0, 4)
    const bytes = fromB64Url(code.slice(4))
    if (checksum(bytes) !== sum) return { ok: false, error: 'Ο σύνδεσμος φαίνεται κατεστραμμένος ή ελλιπής.' }
    const a = JSON.parse(new TextDecoder().decode(bytes)) as unknown[]
    if (!Array.isArray(a) || a.length !== 16) return { ok: false, error: 'Ο σύνδεσμος δεν περιέχει παρτίδα.' }
    const batch: Batch = { code: String(a[0]), producer: String(a[1]), grove: String(a[2]), variety: String(a[3]), harvestDate: String(a[4]), harvestKg: Number(a[5]), millName: String(a[6]), pressDate: String(a[7]), pressTime: String(a[8]), pressTemp: Number(a[9]), analysisDate: String(a[10]), acidity: Number(a[11]), peroxides: Number(a[12]), bottlingDate: String(a[13]), bottles: Number(a[14]), bottleMl: Number(a[15]) }
    if (Object.keys(validateBatch(batch)).length) return { ok: false, error: 'Τα στοιχεία της παρτίδας δεν είναι έγκυρα.' }
    return { ok: true, batch }
  } catch {
    return { ok: false, error: 'Ο σύνδεσμος δεν μπορεί να διαβαστεί.' }
  }
}

// --- display ------------------------------------------------------------------

const MONTHS = ['ΙΑΝΟΥΑΡΙΟΥ', 'ΦΕΒΡΟΥΑΡΙΟΥ', 'ΜΑΡΤΙΟΥ', 'ΑΠΡΙΛΙΟΥ', 'ΜΑΪΟΥ', 'ΙΟΥΝΙΟΥ', 'ΙΟΥΛΙΟΥ', 'ΑΥΓΟΥΣΤΟΥ', 'ΣΕΠΤΕΜΒΡΙΟΥ', 'ΟΚΤΩΒΡΙΟΥ', 'ΝΟΕΜΒΡΙΟΥ', 'ΔΕΚΕΜΒΡΙΟΥ']
export const longDate = (iso: string): string => (isISO(iso) ? `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}` : '')
export const fmt1 = (n: number): string => String(Math.round(n * 10) / 10).replace('.', ',')
export const formatNum = (n: number): string => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export const SAMPLE: Batch = {
  code: 'KP-2611-A', producer: 'Οικογένεια Δάφνη', grove: 'Ελαιώνας «Λιθαρί»', variety: 'Κορωνέικη', harvestDate: '2026-11-14', harvestKg: 1240,
  millName: 'Ελαιοτριβείο του χωριού', pressDate: '2026-11-14', pressTime: '18:30', pressTemp: 26, analysisDate: '2026-11-25', acidity: 0.3, peroxides: 7.2,
  bottlingDate: '2026-12-02', bottles: 840, bottleMl: 500,
}
