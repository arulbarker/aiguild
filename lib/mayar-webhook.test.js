import { describe, it, expect } from 'vitest'
import { isAiGuildProduct, extractEmail, extractOrderId, extractAmount } from './mayar-webhook'

describe('isAiGuildProduct', () => {
  it('cocok via product.link', () =>
    expect(isAiGuildProduct({ data: { product: { link: 'ai-guild' } } }, 'ai-guild')).toBe(true))
  it('produk lain (ruangsaku) → false', () =>
    expect(isAiGuildProduct({ data: { product: { link: 'ruangsaku' } } }, 'ai-guild')).toBe(false))
  it('payload tanpa produk → false', () =>
    expect(isAiGuildProduct({ data: {} }, 'ai-guild')).toBe(false))
})

describe('extractEmail', () => {
  it('lowercase + trim', () =>
    expect(extractEmail({ data: { customer: { email: '  Aku@Mail.com ' } } })).toBe('aku@mail.com'))
  it('tidak ada → null', () =>
    expect(extractEmail({ data: {} })).toBe(null))
})

describe('extractOrderId', () => {
  it('ambil transaction_id', () =>
    expect(extractOrderId({ data: { transaction_id: 'tx_123' } })).toBe('tx_123'))
  it('tidak ada → null', () =>
    expect(extractOrderId({ data: {} })).toBe(null))
})

describe('extractAmount', () => {
  it('ambil data.amount (number)', () =>
    expect(extractAmount({ data: { amount: 1497000 } })).toBe(1497000))
  it('ambil dari string angka', () =>
    expect(extractAmount({ data: { amount: '1497000' } })).toBe(1497000))
  it('path alternatif data.total', () =>
    expect(extractAmount({ data: { total: 1497000 } })).toBe(1497000))
  it('tidak ada → null', () =>
    expect(extractAmount({ data: {} })).toBe(null))
  it('bukan angka valid → null', () =>
    expect(extractAmount({ data: { amount: 'gratis' } })).toBe(null))
})
