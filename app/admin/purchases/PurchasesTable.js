'use client'
import { useState, useEffect } from 'react'

export default function PurchasesTable() {
  const [purchases, setPurchases] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/purchases').then(async (r) => {
      const d = await r.json()
      setPurchases(d.purchases ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = purchases.filter((p) => (p.user?.email ?? '').toLowerCase().includes(q.toLowerCase()))
  if (loading) return <p style={{ color: 'var(--muted)' }}>Memuat...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari email..."
          className="w-full sm:w-80 rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cream)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{filtered.length} pembelian</span>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {filtered.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <span className="flex-1" style={{ fontSize: 14, minWidth: 180 }}>{p.user?.email ?? '—'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)' }}>{p.source}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', minWidth: 120 }}>{p.orderId ?? '—'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{new Date(p.purchasedAt).toLocaleString('id-ID')}</span>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-4 py-6" style={{ color: 'var(--muted)', background: 'var(--surface)' }}>Tidak ada pembelian.</p>}
      </div>
    </div>
  )
}
