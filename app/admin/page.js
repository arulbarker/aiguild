import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AdminLayout from '@/components/AdminLayout'

export const metadata = { title: 'Admin — AI Guild' }

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/')

  const [users, courses, modules, purchases, vouchers] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.module.count(),
    prisma.purchase.count({ where: { courseId: { not: null } } }),
    prisma.voucher.count(),
  ])

  const cards = [
    { label: 'Total user', value: users, accent: true },
    { label: 'Kursus', value: courses },
    { label: 'Modul', value: modules },
    { label: 'Akses kursus terjual', value: purchases },
    { label: 'Voucher', value: vouchers },
  ]

  return (
    <AdminLayout active="/admin">
      <h1 className="font-extrabold mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Ringkasan</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: `1px solid ${c.accent ? 'rgba(232,160,32,0.3)' : 'var(--border)'}` }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.label}</p>
            <p className="font-extrabold mt-2" style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: c.accent ? 'var(--amber)' : 'var(--cream)' }}>{c.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
