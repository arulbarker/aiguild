import { describe, it, expect } from 'vitest'
import { isAiGuildProduct, extractEmail, extractOrderId, extractAmount } from './mayar-webhook'

describe('isAiGuildProduct', () => {
  it('cocok via productId', () =>
    expect(isAiGuildProduct({ data: { productId: 'prod_123' } }, { productId: 'prod_123' })).toBe(true))
  it('cocok via productName', () =>
    expect(isAiGuildProduct({ data: { productName: 'AI Guild' } }, { productName: 'AI Guild' })).toBe(true))
  it('produk lain → false', () =>
    expect(isAiGuildProduct({ data: { productId: 'prod_lain', productName: 'Ruang Saku' } }, { productId: 'prod_123', productName: 'AI Guild' })).toBe(false))
  it('payload tanpa produk → false', () =>
    expect(isAiGuildProduct({ data: {} }, { productId: 'prod_123' })).toBe(false))
  it('config kosong → false (fail-closed)', () =>
    expect(isAiGuildProduct({ data: { productId: 'prod_123' } }, {})).toBe(false))
})

describe('extractEmail', () => {
  it('lowercase + trim dari customerEmail', () =>
    expect(extractEmail({ data: { customerEmail: '  Aku@Mail.com ' } })).toBe('aku@mail.com'))
  it('tidak ada → null', () =>
    expect(extractEmail({ data: {} })).toBe(null))
})

describe('extractOrderId', () => {
  it('ambil data.id', () =>
    expect(extractOrderId({ data: { id: 'tx_123' } })).toBe('tx_123'))
  it('tidak ada → null', () =>
    expect(extractOrderId({ data: {} })).toBe(null))
})

describe('extractAmount', () => {
  it('ambil data.amount (number)', () =>
    expect(extractAmount({ data: { amount: 1497000 } })).toBe(1497000))
  it('ambil dari string angka', () =>
    expect(extractAmount({ data: { amount: '1497000' } })).toBe(1497000))
  it('nominal diskon lebih kecil tetap terbaca', () =>
    expect(extractAmount({ data: { amount: 997000 } })).toBe(997000))
  it('tidak ada → null', () =>
    expect(extractAmount({ data: {} })).toBe(null))
  it('bukan angka valid → null', () =>
    expect(extractAmount({ data: { amount: 'gratis' } })).toBe(null))
})
