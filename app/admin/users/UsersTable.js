'use client'
import { useState, useEffect } from 'react'

function statusBadge(expiredAt) {
  if (!expiredAt) return { t: 'Belum', c: 'var(--muted)' }
  return new Date(expiredAt) > new Date() ? { t: 'Aktif', c: 'var(--amber)' } : { t: 'Expired', c: '#f87171' }
}

export default function UsersTable() {
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function patch(userId, body) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ...body }) })
    await load()
  }

  function extendOneYear(u) {
    const base = u.membershipExpiredAt && new Date(u.membershipExpiredAt) > new Date() ? new Date(u.membershipExpiredAt) : new Date()
    const next = new Date(base.getTime() + 365 * 24 * 60 * 60 * 1000)
    patch(u.id, { membershipExpiredAt: next.toISOString() })
  }

  const filtered = users.filter((u) => u.email.toLowerCase().includes(q.toLowerCase()))
  if (loading) return <p style={{ color: 'var(--muted)' }}>Memuat...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari email..."
          className="w-full sm:w-80 rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cream)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{filtered.length} user</span>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {filtered.map((u) => {
          const b = statusBadge(u.membershipExpiredAt)
          return (
            <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <span className="flex-1" style={{ fontSize: 14, minWidth: 180 }}>
                {u.email}{u.isAdmin && <span style={{ color: 'var(--amber)', fontSize: 11 }}> · admin</span>}
                <span style={{ color: 'var(--muted)', fontSize: 11 }}> · {u._count?.progress ?? 0} modul</span>
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: b.c, minWidth: 60 }}>{b.t}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', minWidth: 84 }}>
                {u.membershipExpiredAt ? new Date(u.membershipExpiredAt).toLocaleDateString('id-ID') : '—'}
              </span>
              <button onClick={() => extendOneYear(u)} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#07070A', background: 'var(--amber)', padding: '5px 10px', borderRadius: 7 }}>+1 thn</button>
              <button onClick={() => patch(u.id, { membershipExpiredAt: null })} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: 7 }}>Cabut</button>
              <button onClick={() => patch(u.id, { isAdmin: !u.isAdmin })} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: 7 }}>{u.isAdmin ? 'Cabut admin' : 'Jadikan admin'}</button>
            </div>
          )
        })}
        {filtered.length === 0 && <p className="px-4 py-6" style={{ color: 'var(--muted)', background: 'var(--surface)' }}>Tidak ada user.</p>}
      </div>
    </div>
  )
}
