export function isAiGuildProduct(payload, { productId, productName } = {}) {
  const d = payload?.data ?? {}
  if (productId && d.productId === productId) return true
  if (productName && d.productName === productName) return true
  return false
}

export function extractEmail(payload) {
  const email = payload?.data?.customerEmail
  return email ? email.toLowerCase().trim() : null
}

export function extractOrderId(payload) {
  return payload?.data?.id ?? null
}

export function extractAmount(payload) {
  const d = payload?.data ?? {}
  const candidates = [d.amount, d.total, d.grossAmount]
  for (const c of candidates) {
    if (c == null) continue
    const n = Number(c)
    if (Number.isFinite(n)) return n
  }
  return null
}
