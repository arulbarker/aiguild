import { describe, it, expect } from 'vitest'
import { hasCourseAccess } from './ownership.js'

describe('hasCourseAccess', () => {
  it('admin selalu boleh', () => {
    expect(hasCourseAccess({ isAdmin: true, ownedCourseIds: [] }, 'c1')).toBe(true)
  })
  it('punya kursus → boleh', () => {
    expect(hasCourseAccess({ isAdmin: false, ownedCourseIds: ['c1', 'c2'] }, 'c1')).toBe(true)
  })
  it('tidak punya kursus → tolak', () => {
    expect(hasCourseAccess({ isAdmin: false, ownedCourseIds: ['c2'] }, 'c1')).toBe(false)
  })
  it('list kosong → tolak', () => {
    expect(hasCourseAccess({ isAdmin: false, ownedCourseIds: [] }, 'c1')).toBe(false)
  })
})
