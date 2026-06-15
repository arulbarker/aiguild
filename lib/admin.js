import { getSession } from '@/lib/auth'

export async function requireAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}
