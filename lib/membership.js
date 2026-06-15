const DAY_MS = 24 * 60 * 60 * 1000
const PERIOD_DAYS = 365
const REMINDER_DAYS_BEFORE = 3

export const EXPECTED_AMOUNT = 1_497_000

export function computeNewExpiry(currentExpiry, now, days = PERIOD_DAYS) {
  const base = currentExpiry && currentExpiry > now ? currentExpiry : now
  return new Date(base.getTime() + days * DAY_MS)
}

export function isMembershipActive(expiredAt, now) {
  return expiredAt != null && expiredAt > now
}

export function needsReminder(expiredAt, reminderSentAt, now, daysBefore = REMINDER_DAYS_BEFORE) {
  if (!expiredAt || reminderSentAt) return false
  if (expiredAt <= now) return false
  const daysLeft = (expiredAt.getTime() - now.getTime()) / DAY_MS
  return daysLeft <= daysBefore
}
