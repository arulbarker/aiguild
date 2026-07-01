import { describe, it, expect } from 'vitest'
import { normalizeTitle, isValidSharedSecret, extractLynkidEmail, extractLynkidProductTitle, matchCourseByTitle } from './lynkid-webhook'

describe('normalizeTitle', () => {
  it('lowercase, trim, rapatkan spasi', () =>
    expect(normalizeTitle('  Ecourse   Vibe  Coding ')).toBe('ecourse vibe coding'))
  it('null → string kosong', () =>
    expect(normalizeTitle(null)).toBe(''))
})

describe('isValidSharedSecret', () => {
  it('cocok → true', () =>
    expect(isValidSharedSecret('rahasia', 'rahasia')).toBe(true))
  it('salah → false', () =>
    expect(isValidSharedSecret('salah', 'rahasia')).toBe(false))
  it('expected kosong → false (fail-closed)', () =>
    expect(isValidSharedSecret('rahasia', '')).toBe(false))
  it('provided kosong → false', () =>
    expect(isValidSharedSecret('', 'rahasia')).toBe(false))
})

describe('extractLynkidEmail', () => {
  it('lowercase + trim', () =>
    expect(extractLynkidEmail({ email: '  Aku@Mail.com ' })).toBe('aku@mail.com'))
  it('tidak ada → null', () =>
    expect(extractLynkidEmail({})).toBe(null))
})

describe('extractLynkidProductTitle', () => {
  it('ambil product_title', () =>
    expect(extractLynkidProductTitle({ product_title: 'Ecourse X' })).toBe('Ecourse X'))
  it('fallback ke raw items[0].title', () =>
    expect(extractLynkidProductTitle({ raw: { data: { message_data: { items: [{ title: 'Judul Raw' }] } } } })).toBe('Judul Raw'))
  it('tidak ada → null', () =>
    expect(extractLynkidProductTitle({})).toBe(null))
})

describe('matchCourseByTitle', () => {
  const courses = [
    { id: 'c1', slug: 'vibe-coding-gas', lynkidProductTitle: 'Ecourse vibe coding google appscript' },
    { id: 'c2', slug: 'lain', lynkidProductTitle: 'Kelas Lain' },
  ]
  it('cocok walau beda kapital/spasi', () =>
    expect(matchCourseByTitle(courses, 'ECOURSE   Vibe Coding Google Appscript')?.slug).toBe('vibe-coding-gas'))
  it('produk tak dikenal → null (fail-closed)', () =>
    expect(matchCourseByTitle(courses, 'Produk Asing')).toBe(null))
  it('judul kosong → null', () =>
    expect(matchCourseByTitle(courses, '')).toBe(null))
  it('course tanpa lynkidProductTitle diabaikan', () =>
    expect(matchCourseByTitle([{ id: 'c3', lynkidProductTitle: null }], 'apa saja')).toBe(null))
})
