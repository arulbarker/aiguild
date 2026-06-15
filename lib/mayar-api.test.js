import { describe, it, expect } from 'vitest'
import { buildCouponPayload } from './mayar-api'

describe('buildCouponPayload', () => {
  it('bentuk body sesuai skema Mayar', () => {
    const body = buildCouponPayload({
      name: 'Diskon Launch', code: 'LAUNCH50', discountType: 'percentage',
      value: 50, minimumPurchase: 0, totalCoupons: 100, couponType: 'reusable',
      expiredAt: '2030-01-01T00:00:00.000Z',
    })
    expect(body).toEqual({
      name: 'Diskon Launch',
      expiredAt: '2030-01-01T00:00:00.000Z',
      discount: { discountType: 'percentage', value: 50, minimumPurchase: 0, eligibleCustomerType: 'all', totalCoupons: 100 },
      coupon: { code: 'LAUNCH50', type: 'reusable' },
      products: [],
    })
  })

  it('default minimumPurchase 0 & products kosong', () => {
    const body = buildCouponPayload({
      name: 'X', code: 'X1', discountType: 'monetary', value: 100000,
      totalCoupons: 10, couponType: 'onetime', expiredAt: '2030-01-01T00:00:00.000Z',
    })
    expect(body.discount.minimumPurchase).toBe(0)
    expect(body.products).toEqual([])
  })
})
