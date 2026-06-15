import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminLayout from '@/components/AdminLayout'
import UsersTable from './UsersTable'

export const metadata = { title: 'User — Admin AI Guild' }

export default async function UsersPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/')
  return (
    <AdminLayout active="/admin/users">
      <h1 className="font-extrabold mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>User</h1>
      <UsersTable />
    </AdminLayout>
  )
}
