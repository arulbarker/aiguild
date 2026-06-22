'use client'
import { useState, useEffect } from 'react'

export default function UsersTable() {
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [pick, setPick] = useState({}) // userId -> courseId terpilih di dropdown

  async function load() {
    const [ru, rc] = await Promise.all([fetch('/api/admin/users'), fetch('/api/admin/courses')])
    const du = await ru.json()
    const dc = await rc.json()
    setUsers(du.users ?? [])
    setCourses(dc.courses ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function patch(userId, body) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ...body }) })
    await load()
  }

  function grant(userId) {
    const courseId = pick[userId] || courses[0]?.id
    if (!courseId) return
    patch(userId, { action: 'grant', courseId })
  }

  const filtered = users.filter((u) => u.email.toLowerCase().includes(q.toLowerCase()))
  if (loading) return <p style={{ color: 'var(--muted)' }}>Memuat...</p>

  const inp = { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: 7, padding: '5px 8px', fontSize: 12 }
  const btn = { fontFamily: 'var(--font-mono)', fontSize: 11, padding: '5px 10px', borderRadius: 7 }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari email..."
          className="w-full sm:w-80 rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cream)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{filtered.length} user</span>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {filtered.map((u) => (
          <div key={u.id} className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex-1" style={{ fontSize: 14, minWidth: 180 }}>
                {u.email}{u.isAdmin && <span style={{ color: 'var(--amber)', fontSize: 11 }}> · admin</span>}
                <span style={{ color: 'var(--muted)', fontSize: 11 }}> · {u._count?.progress ?? 0} modul dibuka</span>
              </span>
              <select style={inp} value={pick[u.id] ?? ''} onChange={(e) => setPick({ ...pick, [u.id]: e.target.value })}>
                <option value="">— pilih kursus —</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <button onClick={() => grant(u.id)} style={{ ...btn, color: '#07070A', background: 'var(--amber)', fontWeight: 700 }}>Beri akses</button>
              <button onClick={() => patch(u.id, { isAdmin: !u.isAdmin })} style={{ ...btn, color: 'var(--muted)', border: '1px solid var(--border)' }}>{u.isAdmin ? 'Cabut admin' : 'Jadikan admin'}</button>
            </div>
            {u.purchases.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {u.purchases.map((p) => (
                  <span key={p.courseId} className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cream)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 8px' }}>
                    {p.course?.title ?? p.courseId} <span style={{ color: 'var(--muted)' }}>({p.source})</span>
                    <button onClick={() => patch(u.id, { action: 'revoke', courseId: p.courseId })} style={{ color: '#f87171', fontSize: 13, lineHeight: 1 }} title="Cabut akses">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="px-4 py-6" style={{ color: 'var(--muted)', background: 'var(--surface)' }}>Tidak ada user.</p>}
      </div>
    </div>
  )
}
