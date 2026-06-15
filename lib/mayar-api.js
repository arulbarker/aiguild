const BASE = process.env.MAYAR_API_BASE || 'https://api.mayar.id/hl/v1'

export function buildCouponPayload({ name, code, discountType, value, minimumPurchase = 0, totalCoupons, couponType, expiredAt, productIds = [] }) {
  return {
    name,
    expiredAt,
    discount: { discountType, value, minimumPurchase, eligibleCustomerType: 'all', totalCoupons },
    coupon: { code, type: couponType },
    products: productIds,
  }
}

export async function createMayarCoupon(input) {
  if (!process.env.MAYAR_API_KEY) throw new Error('MAYAR_API_KEY belum diset')
  const res = await fetch(`${BASE}/coupon/create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.MAYAR_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(buildCouponPayload(input)),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || (json.statusCode && json.statusCode >= 400)) {
    throw new Error(json.messages || `Mayar error ${res.status}`)
  }
  return json.data
}
