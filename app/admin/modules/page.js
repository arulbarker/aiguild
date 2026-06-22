'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

const EMPTY = { title: '', slug: '', description: '', youtubeUrl: '', gammaUrl: '', orderIndex: 0, courseId: '' }

export default function AdminModulesPage() {
  const [modules, setModules] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [creating, setCreating] = useState(false)
  const [newForm, setNewForm] = useState(EMPTY)
  const [msg, setMsg] = useState('')

  async function load() {
    const [rm, rc] = await Promise.all([fetch('/api/admin/modules'), fetch('/api/admin/courses')])
    const dm = await rm.json()
    const dc = await rc.json()
    setModules(dm.modules ?? [])
    setCourses(dc.courses ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function startEdit(mod) {
    setEditing(mod.id)
    setForm({ title: mod.title, description: mod.description ?? '', youtubeUrl: mod.youtubeUrl ?? '', gammaUrl: mod.gammaUrl ?? '', orderIndex: mod.orderIndex, promptText: mod.promptText ?? '' })
  }

  async function saveEdit(id) {
    await fetch('/api/admin/modules', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...form }) })
    setEditing(null); load()
  }

  async function createModule(e) {
    e.preventDefault(); setMsg('')
    const res = await fetch('/api/admin/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) })
    const data = await res.json()
    if (!res.ok) { setMsg(data.error || 'Gagal'); return }
    setNewForm(EMPTY); setCreating(false); load()
  }

  async function removeModule(id) {
    if (!window.confirm('Hapus modul ini? Tidak bisa dibatalkan.')) return
    await fetch('/api/admin/modules', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load()
  }

  const inp = { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: 8, padding: '8px 12px', fontSize: 13, width: '100%' }
  const btnSm = { fontFamily: 'var(--font-mono)', fontSize: 11, padding: '5px 10px', borderRadius: 7 }

  return (
    <AdminLayout active="/admin/modules">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Modul {!loading && `(${modules.length})`}</h1>
        <button onClick={() => setCreating(!creating)} style={{ ...btnSm, color: '#07070A', background: 'var(--amber)', fontWeight: 700 }}>{creating ? 'Tutup' : '+ Modul baru'}</button>
      </div>

      {creating && (
        <form onSubmit={createModule} className="rounded-2xl p-5 mb-5 space-y-3" style={{ background: 'var(--surface)', border: '1px solid rgba(232,160,32,0.25)' }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <select style={inp} value={newForm.courseId} onChange={(e) => setNewForm({ ...newForm, courseId: e.target.value })} required>
              <option value="">— Pilih kursus * —</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input style={inp} type="number" placeholder="Urutan" value={newForm.orderIndex} onChange={(e) => setNewForm({ ...newForm, orderIndex: Number(e.target.value) })} />
            <input style={inp} placeholder="Judul *" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} required />
            <input style={inp} placeholder="slug-unik *" value={newForm.slug} onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })} required />
            <input style={inp} placeholder="YouTube URL" value={newForm.youtubeUrl} onChange={(e) => setNewForm({ ...newForm, youtubeUrl: e.target.value })} />
            <input style={inp} placeholder="Gamma/Drive URL" value={newForm.gammaUrl} onChange={(e) => setNewForm({ ...newForm, gammaUrl: e.target.value })} />
          </div>
          <input style={inp} placeholder="Deskripsi" value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} />
          <button type="submit" style={{ ...btnSm, color: '#07070A', background: 'var(--amber)', fontWeight: 700 }}>Simpan modul</button>
          {msg && <span style={{ marginLeft: 12, color: '#f87171', fontSize: 13 }}>{msg}</span>}
        </form>
      )}

      {loading ? <p style={{ color: 'var(--muted)' }}>Memuat...</p> : (
        <div className="space-y-3">
          {modules.map((mod) => (
            <div key={mod.id} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {editing === mod.id ? (
                <div className="space-y-2">
                  {[{ key: 'title', label: 'Judul' }, { key: 'description', label: 'Deskripsi' }, { key: 'youtubeUrl', label: 'YouTube URL' }, { key: 'gammaUrl', label: 'Gamma URL' }, { key: 'orderIndex', label: 'Urutan', type: 'number' }].map(({ key, label, type }) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{label}</label>
                      <input style={inp} type={type ?? 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                      Prompt (teks siap salin) — tab ⌘ Prompt
                    </label>
                    <textarea
                      style={{ ...inp, minHeight: 220, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6, resize: 'vertical', whiteSpace: 'pre' }}
                      value={form.promptText ?? ''}
                      onChange={(e) => setForm({ ...form, promptText: e.target.value })}
                      placeholder="Kosongkan kalau kartu ini tidak punya prompt. Edit di sini langsung tersimpan ke database — tidak akan ketimpa saat seed."
                      spellCheck={false}
                    />
                    <p style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                      Materi HTML (tab Penjelasan) dikelola lewat kode/IDE, bukan di sini.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => saveEdit(mod.id)} style={{ ...btnSm, color: '#07070A', background: 'var(--amber)', fontWeight: 700 }}>Simpan</button>
                    <button onClick={() => setEditing(null)} style={{ ...btnSm, color: 'var(--muted)', border: '1px solid var(--border)' }}>Batal</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--cream)' }}>{mod.title}</p>
                    <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2, fontFamily: 'var(--font-mono)' }}>/{mod.slug} · urutan {mod.orderIndex}{mod.course && ` · ${mod.course.title}`}</p>
                    {mod.description && <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{mod.description}</p>}
                    <div className="flex gap-3 mt-2" style={{ fontSize: 11 }}>
                      {mod.youtubeUrl && <span style={{ color: 'var(--amber)' }}>YouTube ✓</span>}
                      {mod.gammaUrl && <span style={{ color: 'var(--amber)' }}>Materi ✓</span>}
                      {mod.promptText && <span style={{ color: 'var(--amber)' }}>Prompt ✓</span>}
                      {mod.htmlContent && <span style={{ color: 'var(--amber)' }}>Penjelasan ✓</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(mod)} style={{ ...btnSm, color: 'var(--muted)', border: '1px solid var(--border)' }}>Edit</button>
                    <button onClick={() => removeModule(mod.id)} style={{ ...btnSm, color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>Hapus</button>
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
