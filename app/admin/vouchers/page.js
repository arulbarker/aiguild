import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminLayout from '@/components/AdminLayout'
import VoucherManager from './VoucherManager'

export const metadata = { title: 'Voucher — Admin AI Guild' }

export default async function VouchersPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/')
  return (
    <AdminLayout active="/admin/vouchers">
      <h1 className="font-extrabold mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Voucher Diskon</h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
        Voucher dibuat di sini langsung terdaftar di Mayar. Bagikan kodenya — buyer mengetiknya saat checkout di Mayar.
      </p>
      <VoucherManager />
    </AdminLayout>
  )
}
