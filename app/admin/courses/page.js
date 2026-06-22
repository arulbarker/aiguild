'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

const EMPTY = { title: '', slug: '', description: '', price: 0, mayarProductId: '', orderIndex: 0, isPublished: true }

function rupiah(n) {
  return 'Rp' + Number(n || 0).toLocaleString('id-ID')
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [creating, setCreating] = useState(false)
  const [newForm, setNewForm] = useState(EMPTY)
  const [msg, setMsg] = useState('')

  async function load() {
    const r = await fetch('/api/admin/courses')
    const d = await r.json()
    setCourses(d.courses ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function startEdit(c) {
    setEditing(c.id)
    setForm({ title: c.title, slug: c.slug, description: c.description ?? '', price: c.price, mayarProductId: c.mayarProductId ?? '', orderIndex: c.orderIndex, isPublished: c.isPublished })
  }

  async function saveEdit(id) {
    await fetch('/api/admin/courses', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...form }) })
    setEditing(null); load()
  }

  async function createCourse(e) {
    e.preventDefault(); setMsg('')
    const res = await fetch('/api/admin/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) })
    const data = await res.json()
    if (!res.ok) { setMsg(data.error || 'Gagal'); return }
    setNewForm(EMPTY); setCreating(false); load()
  }

  async function removeCourse(id) {
    if (!window.confirm('Hapus kursus ini?')) return
    const res = await fetch('/api/admin/courses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Gagal'); return }
    load()
  }

  const inp = { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: 8, padding: '8px 12px', fontSize: 13, width: '100%' }
  const btnSm = { fontFamily: 'var(--font-mono)', fontSize: 11, padding: '5px 10px', borderRadius: 7 }

  return (
    <AdminLayout active="/admin/courses">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Kursus {!loading && `(${courses.length})`}</h1>
        <button onClick={() => setCreating(!creating)} style={{ ...btnSm, color: '#07070A', background: 'var(--amber)', fontWeight: 700 }}>{creating ? 'Tutup' : '+ Kursus baru'}</button>
      </div>

      {creating && (
        <form onSubmit={createCourse} className="rounded-2xl p-5 mb-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid rgba(232,160,32,0.25)' }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <input style={inp} placeholder="Judul *" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} required />
            <input style={inp} placeholder="slug-unik *" value={newForm.slug} onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })} required />
            <input style={inp} type="number" placeholder="Harga (Rp)" value={newForm.price} onChange={(e) => setNewForm({ ...newForm, price: Number(e.target.value) })} />
            <input style={inp} placeholder="Mayar Product ID (untuk webhook)" value={newForm.mayarProductId} onChange={(e) => setNewForm({ ...newForm, mayarProductId: e.target.value })} />
            <input style={inp} type="number" placeholder="Urutan" value={newForm.orderIndex} onChange={(e) => setNewForm({ ...newForm, orderIndex: Number(e.target.value) })} />
            <label className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--muted)' }}>
              <input type="checkbox" checked={newForm.isPublished} onChange={(e) => setNewForm({ ...newForm, isPublished: e.target.checked })} /> Tampilkan (published)
            </label>
          </div>
          <input style={inp} placeholder="Deskripsi" value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} />
          <button type="submit" style={{ ...btnSm, color: '#07070A', background: 'var(--amber)', fontWeight: 700 }}>Simpan kursus</button>
          {msg && <span style={{ marginLeft: 12, color: '#f87171', fontSize: 13 }}>{msg}</span>}
        </form>
      )}

      {loading ? <p style={{ color: 'var(--muted)' }}>Memuat...</p> : (
        <div className="space-y-3">
          {courses.map((c) => (
            <div key={c.id} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {editing === c.id ? (
                <div className="space-y-2">
                  {[{ key: 'title', label: 'Judul' }, { key: 'slug', label: 'Slug' }, { key: 'description', label: 'Deskripsi' }, { key: 'price', label: 'Harga (Rp)', type: 'number' }, { key: 'mayarProductId', label: 'Mayar Product ID' }, { key: 'orderIndex', label: 'Urutan', type: 'number' }].map(({ key, label, type }) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{label}</label>
                      <input style={inp} type={type ?? 'text'} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} />
                    </div>
                  ))}
                  <label className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--muted)' }}>
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Tampilkan (published)
                  </label>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => saveEdit(c.id)} style={{ ...btnSm, color: '#07070A', background: 'var(--amber)', fontWeight: 700 }}>Simpan</button>
                    <button onClick={() => setEditing(null)} style={{ ...btnSm, color: 'var(--muted)', border: '1px solid var(--border)' }}>Batal</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--cream)' }}>{c.title} {!c.isPublished && <span style={{ color: '#f87171', fontSize: 11 }}>(draft)</span>}</p>
                    <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2, fontFamily: 'var(--font-mono)' }}>/{c.slug} · {rupiah(c.price)} · {c._count?.modules ?? 0} modul · urutan {c.orderIndex}</p>
                    <p style={{ color: c.mayarProductId ? 'var(--amber)' : '#f87171', fontSize: 11, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                      {c.mayarProductId ? `Mayar: ${c.mayarProductId}` : 'Mayar Product ID belum diisi (webhook tidak akan grant)'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(c)} style={{ ...btnSm, color: 'var(--muted)', border: '1px solid var(--border)' }}>Edit</button>
                    <button onClick={() => removeCourse(c.id)} style={{ ...btnSm, color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>Hapus</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
