import { describe, it, expect } from 'vitest'
import { computeNewExpiry, isMembershipActive, needsReminder } from './membership'

const DAY = 24 * 60 * 60 * 1000

describe('computeNewExpiry', () => {
  const now = new Date('2026-06-15T00:00:00Z')

  it('baru/expired → now + 30 hari', () => {
    expect(computeNewExpiry(null, now).getTime()).toBe(now.getTime() + 30 * DAY)
    const past = new Date('2026-05-01T00:00:00Z')
    expect(computeNewExpiry(past, now).getTime()).toBe(now.getTime() + 30 * DAY)
  })

  it('masih aktif → numpuk dari tanggal habis lama', () => {
    const future = new Date('2026-07-01T00:00:00Z')
    expect(computeNewExpiry(future, now).getTime()).toBe(future.getTime() + 30 * DAY)
  })
})

describe('isMembershipActive', () => {
  const now = new Date('2026-06-15T00:00:00Z')
  it('null → false', () => expect(isMembershipActive(null, now)).toBe(false))
  it('masa depan → true', () => expect(isMembershipActive(new Date('2026-06-20T00:00:00Z'), now)).toBe(true))
  it('masa lalu → false', () => expect(isMembershipActive(new Date('2026-06-10T00:00:00Z'), now)).toBe(false))
})

describe('needsReminder', () => {
  const now = new Date('2026-06-15T00:00:00Z')
  it('habis 2 hari lagi, belum direminder → true', () =>
    expect(needsReminder(new Date('2026-06-17T00:00:00Z'), null, now)).toBe(true))
  it('sudah direminder → false', () =>
    expect(needsReminder(new Date('2026-06-17T00:00:00Z'), new Date('2026-06-14T00:00:00Z'), now)).toBe(false))
  it('masih 10 hari lagi → false', () =>
    expect(needsReminder(new Date('2026-06-25T00:00:00Z'), null, now)).toBe(false))
  it('sudah expired → false', () =>
    expect(needsReminder(new Date('2026-06-10T00:00:00Z'), null, now)).toBe(false))
})
