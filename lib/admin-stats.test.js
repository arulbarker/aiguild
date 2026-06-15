import { describe, it, expect } from 'vitest'
import { summarizeMembers } from './admin-stats'

const now = new Date('2026-06-15T00:00:00Z')

describe('summarizeMembers', () => {
  it('hitung aktif vs expired vs belum pernah', () => {
    const users = [
      { membershipExpiredAt: new Date('2026-07-01T00:00:00Z') },
      { membershipExpiredAt: new Date('2026-06-01T00:00:00Z') },
      { membershipExpiredAt: null },
    ]
    const s = summarizeMembers(users, now)
    expect(s.active).toBe(1)
    expect(s.expired).toBe(1)
    expect(s.never).toBe(1)
    expect(s.total).toBe(3)
  })

  it('list kosong → semua nol', () => {
    expect(summarizeMembers([], now)).toEqual({ active: 0, expired: 0, never: 0, total: 0 })
  })
})
