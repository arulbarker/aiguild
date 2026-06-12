'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminModulesPage() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => {
    fetch('/api/admin/modules')
      .then((r) => r.json())
      .then((d) => { setModules(d.modules ?? []); setLoading(false) })
  }, [])

  function startEdit(mod) {
    setEditing(mod.id)
    setForm({
      title: mod.title,
      description: mod.description ?? '',
      youtubeUrl: mod.youtubeUrl ?? '',
      gammaUrl: mod.gammaUrl ?? '',
      orderIndex: mod.orderIndex,
    })
  }

  async function saveEdit(id) {
    const res = await fetch('/api/admin/modules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...form }),
    })
    const data = await res.json()
    setModules((prev) => prev.map((m) => (m.id === id ? data.module : m)))
    setEditing(null)
  }

  if (loading) return <div className="min-h-screen bg-gray-950 text-gray-400 p-8">Memuat...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-white text-sm">← Admin</Link>
          <h1 className="text-xl font-bold">Modul ({modules.length})</h1>
        </div>

        <div className="space-y-3">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              {editing === mod.id ? (
                <div className="space-y-3">
                  {[
                    { key: 'title', label: 'Judul' },
                    { key: 'description', label: 'Deskripsi' },
                    { key: 'youtubeUrl', label: 'YouTube URL' },
                    { key: 'gammaUrl', label: 'Gamma URL' },
                    { key: 'orderIndex', label: 'Urutan', type: 'number' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-400 block mb-1">{label}</label>
                      <input
                        type={type ?? 'text'}
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(mod.id)} className="bg-purple-700 hover:bg-purple-600 px-4 py-1.5 rounded-lg text-sm font-medium">Simpan</button>
                    <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white px-4 py-1.5 rounded-lg text-sm">Batal</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{mod.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">/{mod.slug} · urutan {mod.orderIndex}</p>
                    {mod.description && <p className="text-gray-400 text-sm mt-1">{mod.description}</p>}
                    <div className="flex gap-3 mt-2 text-xs">
                      {mod.youtubeUrl && <span className="text-blue-400">YouTube ✓</span>}
                      {mod.gammaUrl && <span className="text-green-400">Gamma ✓</span>}
                    </div>
                  </div>
                  <button onClick={() => startEdit(mod)} className="text-gray-500 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors">Edit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
