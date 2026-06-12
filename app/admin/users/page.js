import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export const metadata = { title: 'Users — Admin AI Guild' }

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/')

  const users = await prisma.user.findMany({
    include: {
      purchases: { orderBy: { purchasedAt: 'desc' }, take: 1 },
      _count: { select: { progress: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-white text-sm">← Admin</Link>
          <h1 className="text-xl font-bold">Users ({users.length})</h1>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Sumber Pembelian</th>
                <th className="text-left px-4 py-3">Progress</th>
                <th className="text-left px-4 py-3">Bergabung</th>
                <th className="text-left px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white">{user.email}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {user.purchases[0]?.source ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{user._count.progress} modul</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    {user.isAdmin ? (
                      <span className="text-purple-400 font-medium">Admin</span>
                    ) : (
                      <span className="text-gray-500">User</span>
                    )}
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
