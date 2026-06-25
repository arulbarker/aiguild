import { describe, it, expect } from 'vitest'
import { numberMap, displayNumber } from './module-tree.js'

describe('numberMap', () => {
  it('memberi nomor rapat 1..N berdasarkan posisi, walau orderIndex berlubang', () => {
    const modules = [
      { id: 'a', orderIndex: 0 },
      { id: 'b', orderIndex: 5 },   // lubang (1-4 hilang)
      { id: 'c', orderIndex: 12 },  // lubang lagi
    ]
    const numbers = numberMap(modules)
    expect(numbers.get('a')).toBe('01')
    expect(numbers.get('b')).toBe('02')
    expect(numbers.get('c')).toBe('03')
  })

  it('mengurutkan berdasarkan orderIndex, bukan urutan array', () => {
    const modules = [
      { id: 'c', orderIndex: 12 },
      { id: 'a', orderIndex: 0 },
      { id: 'b', orderIndex: 5 },
    ]
    const numbers = numberMap(modules)
    expect(numbers.get('a')).toBe('01')
    expect(numbers.get('b')).toBe('02')
    expect(numbers.get('c')).toBe('03')
  })
})

describe('displayNumber', () => {
  it('pakai map saat tersedia', () => {
    const mod = { id: 'b', orderIndex: 5 }
    const numbers = numberMap([{ id: 'a', orderIndex: 0 }, mod])
    expect(displayNumber(mod, numbers)).toBe('02')
  })

  it('fallback ke orderIndex+1 saat map tidak diberikan', () => {
    expect(displayNumber({ id: 'x', orderIndex: 8 })).toBe('09')
  })
})
