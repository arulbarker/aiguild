import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminLayout from '@/components/AdminLayout'
import PurchasesTable from './PurchasesTable'

export const metadata = { title: 'Pembelian — Admin AI Guild' }

export default async function PurchasesPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/')
  return (
    <AdminLayout active="/admin/purchases">
      <h1 className="font-extrabold mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Pembelian</h1>
      <PurchasesTable />
    </AdminLayout>
  )
}
