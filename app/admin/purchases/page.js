import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export const metadata = { title: 'Pembelian — Admin AI Guild' }

export default async function AdminPurchasesPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/')

  const purchases = await prisma.purchase.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { purchasedAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-white text-sm">← Admin</Link>
          <h1 className="text-xl font-bold">Pembelian ({purchases.length})</h1>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Sumber</th>
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white">{p.user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      p.source === 'lynkid' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {p.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.orderId ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(p.purchasedAt).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
