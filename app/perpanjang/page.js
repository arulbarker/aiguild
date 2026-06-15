import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isMembershipActive } from '@/lib/membership'

export const metadata = { title: 'Perpanjang Langganan — AI Guild' }

export default async function PerpanjangPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const active = isMembershipActive(user?.membershipExpiredAt, new Date())
  const payUrl = process.env.MAYAR_PAYMENT_URL
  const habis = user?.membershipExpiredAt
    ? new Date(user.membershipExpiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center" style={{ fontFamily: 'var(--font-mono)' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 16 }}>
          AI GUILD · LANGGANAN
        </p>
        <h1 className="font-extrabold" style={{ fontSize: '2rem', color: 'var(--cream)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>
          {active ? 'Langganan Masih Aktif' : 'Langganan Habis'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          {active
            ? `Aktif sampai ${habis}. Kamu bisa perpanjang kapan saja — masa aktif numpuk +1 tahun.`
            : 'Perpanjang untuk lanjut belajar di AI Guild. Rp1.497.000 / tahun.'}
        </p>
        <a
          href={payUrl}
          style={{
            display: 'inline-block', background: 'var(--amber)', color: '#07070a',
            padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 700,
          }}
        >
          Perpanjang Rp1.497.000 / tahun
        </a>
        <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 24 }}>
          Setelah bayar, masa aktif diperbarui otomatis dalam beberapa menit.
        </p>
      </div>
    </div>
  )
}
