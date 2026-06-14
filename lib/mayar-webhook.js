export function isAiGuildProduct(payload, productLink) {
  const p = payload?.data?.product ?? {}
  const candidates = [p.link, p.name, payload?.data?.productLink].filter(Boolean)
  return candidates.includes(productLink)
}

export function extractEmail(payload) {
  const email = payload?.data?.customer?.email
  return email ? email.toLowerCase().trim() : null
}

export function extractOrderId(payload) {
  return payload?.data?.transaction_id ?? null
}
