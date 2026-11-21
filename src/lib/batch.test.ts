import { describe, expect, it } from 'vitest'
import { SAMPLE, categoryOf, checksum, daysBetween, decodeBatch, encodeBatch, fmt1, isCold, litres, longDate, sameDayPress, validateBatch, yieldPct, type Batch } from './batch'

describe('category', () => {
  it('classifies by acidity and peroxides at the legal limits', () => {
    expect(categoryOf(0.3, 7.2)).toBe('extra')
    expect(categoryOf(0.8, 20)).toBe('extra')
    expect(categoryOf(0.81, 10)).toBe('virgin')
    expect(categoryOf(2.0, 20)).toBe('virgin')
    expect(categoryOf(2.01, 10)).toBe('below')
    expect(categoryOf(0.3, 21)).toBe('below')
  })
  it('treats under 27 °C as cold extraction', () => {
    expect(isCold({ pressTemp: 26.9 })).toBe(true)
    expect(isCold({ pressTemp: 27 })).toBe(false)
  })
})

describe('validation', () => {
  it('accepts the sample batch', () => {
    expect(validateBatch(SAMPLE)).toEqual({})
  })
  it('checks the code format', () => {
    expect(validateBatch({ ...SAMPLE, code: 'kp-2611-a' }).code).toBeTruthy()
    expect(validateBatch({ ...SAMPLE, code: 'KP-261-A' }).code).toBeTruthy()
  })
  it('keeps the dates in order', () => {
    expect(validateBatch({ ...SAMPLE, pressDate: '2026-11-13' }).pressDate).toMatch(/πριν/)
    expect(validateBatch({ ...SAMPLE, analysisDate: '2026-11-10' }).analysisDate).toBeTruthy()
    expect(validateBatch({ ...SAMPLE, bottlingDate: '2026-11-20' }).bottlingDate).toBeTruthy()
    expect(validateBatch({ ...SAMPLE, harvestDate: '2026-02-30' }).harvestDate).toBeTruthy()
  })
  it('rejects impossible numbers', () => {
    const e = validateBatch({ ...SAMPLE, harvestKg: 0, acidity: -1, peroxides: 99, bottles: 1.5, bottleMl: 333, pressTime: '25:00', pressTemp: 200 })
    expect(Object.keys(e).sort()).toEqual(['acidity', 'bottleMl', 'bottles', 'harvestKg', 'peroxides', 'pressTemp', 'pressTime'])
  })
  it('gives sensible derived figures for the sample', () => {
    expect(litres(SAMPLE)).toBe(420)
    expect(yieldPct(SAMPLE)).toBeCloseTo(31, 0)
    expect(sameDayPress(SAMPLE)).toBe(true)
    expect(daysBetween('2026-11-14', '2026-11-25')).toBe(11)
  })
})

describe('shareable code', () => {
  it('round-trips Greek text exactly', () => {
    const r = decodeBatch(encodeBatch(SAMPLE))
    expect(r).toEqual({ ok: true, batch: SAMPLE })
  })
  it('is short enough for a QR code', () => {
    expect(encodeBatch(SAMPLE).length).toBeLessThan(500)
  })
  it('detects a changed character, a truncated link and garbage', () => {
    const code = encodeBatch(SAMPLE)
    const i = 20
    const tampered = code.slice(0, i) + (code[i] === 'A' ? 'B' : 'A') + code.slice(i + 1)
    expect(decodeBatch(tampered).ok).toBe(false)
    expect(decodeBatch(code.slice(0, -5)).ok).toBe(false)
    expect(decodeBatch('hello world').ok).toBe(false)
    expect(decodeBatch('').ok).toBe(false)
  })
  it('rejects a well-formed code whose content is invalid', () => {
    const bad: Batch = { ...SAMPLE, acidity: 9 }
    expect(decodeBatch(encodeBatch(bad))).toMatchObject({ ok: false })
  })
  it('uses a stable checksum', () => {
    expect(checksum(new TextEncoder().encode('abcde'))).toBe('c8f0') // Fletcher-16 of "abcde" is 0xC8F0 (b<<8|a)
  })
})

describe('formatting', () => {
  it('formats dates and decimals in Greek style', () => {
    expect(longDate('2026-11-14')).toBe('14 ΝΟΕΜΒΡΙΟΥ 2026')
    expect(longDate('nope')).toBe('')
    expect(fmt1(0.3)).toBe('0,3')
    expect(fmt1(7.25)).toBe('7,3')
  })
})
