import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { needsReminder } from '@/lib/membership'
import { sendRenewalReminder } from '@/lib/email'

export async function POST(request) {
  const secret = request.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const dalam3Hari = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const kandidat = await prisma.user.findMany({
    where: {
      membershipExpiredAt: { gt: now, lte: dalam3Hari },
      reminderSentAt: null,
    },
  })

  let terkirim = 0
  for (const user of kandidat) {
    if (!needsReminder(user.membershipExpiredAt, user.reminderSentAt, now)) continue
    try {
      await sendRenewalReminder(user.email)
      await prisma.user.update({ where: { id: user.id }, data: { reminderSentAt: now } })
      terkirim++
    } catch (e) {
      console.error('Gagal kirim reminder ke', user.email, e?.message)
    }
  }

  return NextResponse.json({ ok: true, dicek: kandidat.length, terkirim })
}
