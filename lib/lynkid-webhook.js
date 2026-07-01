import { timingSafeEqual } from 'crypto'

export function normalizeTitle(s) {
  return String(s ?? '').toLowerCase().trim().replace(/\s+/g, ' ')
}

export function isValidSharedSecret(provided, expected) {
  if (!expected) return false
  const a = Buffer.from(String(provided))
  const b = Buffer.from(String(expected))
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function extractLynkidEmail(payload) {
  const email = payload?.email
  return email ? String(email).toLowerCase().trim() : null
}

export function extractLynkidProductTitle(payload) {
  return payload?.product_title ?? payload?.raw?.data?.message_data?.items?.[0]?.title ?? null
}

export function matchCourseByTitle(courses, productTitle) {
  const target = normalizeTitle(productTitle)
  if (!target) return null
  return courses.find((c) => c.lynkidProductTitle && normalizeTitle(c.lynkidProductTitle) === target) ?? null
}
