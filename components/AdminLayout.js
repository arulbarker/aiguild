import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

const NAV = [
  { href: '/admin', label: 'Ringkasan' },
  { href: '/admin/users', label: 'User' },
  { href: '/admin/courses', label: 'Kursus' },
  { href: '/admin/modules', label: 'Modul' },
  { href: '/admin/purchases', label: 'Pembelian' },
  { href: '/admin/vouchers', label: 'Voucher' },
]

export default function AdminLayout({ active, children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--cream)' }}>
      <header className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>
            AI<span style={{ color: 'var(--amber)' }}>·</span>GUILD <span style={{ color: 'var(--muted)', fontSize: 12 }}>admin</span>
          </span>
          <nav className="flex flex-wrap gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}
                style={{ padding: '6px 12px', borderRadius: 8, color: active === n.href ? '#07070A' : 'var(--muted)', background: active === n.href ? 'var(--amber)' : 'transparent' }}>
                {n.label}
              </Link>
            ))}
            <Link href="/dashboard" style={{ padding: '6px 12px', borderRadius: 8, color: 'var(--muted)' }}>↗ App</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-5 py-8">{children}</main>
    </div>
  )
}
