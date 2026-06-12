import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export const metadata = { title: 'Admin — AI Guild' }

export default async function AdminPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/')

  const [userCount, moduleCount, purchaseCount] = await Promise.all([
    prisma.user.count(),
    prisma.module.count(),
    prisma.purchase.count(),
  ])

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total User', value: userCount, href: '/admin/users' },
            { label: 'Total Modul', value: moduleCount, href: '/admin/modules' },
            { label: 'Total Pembelian', value: purchaseCount, href: '/admin/purchases' },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-700 transition-colors"
            >
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <Link href="/admin/users" className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Kelola User
          </Link>
          <Link href="/admin/modules" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Kelola Modul
          </Link>
          <Link href="/admin/purchases" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Lihat Pembelian
          </Link>
          <Link href="/dashboard" className="text-gray-500 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">
            Kembali ke App
          </Link>
        </div>
      </div>
    </div>
  )
}
