export function summarizeMembers(users, now = new Date()) {
  let active = 0, expired = 0, never = 0
  for (const u of users) {
    if (!u.membershipExpiredAt) never++
    else if (new Date(u.membershipExpiredAt) > now) active++
    else expired++
  }
  return { active, expired, never, total: users.length }
}
