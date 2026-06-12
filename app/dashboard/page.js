'use client'

import { useState, useEffect } from 'react'
import ModuleFlowchart from '@/components/ModuleFlowchart'
import ModuleViewer from '@/components/ModuleViewer'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [modules, setModules] = useState([])
  const [completedIds, setCompletedIds] = useState([])
  const [activeModule, setActiveModule] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/modules')
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setModules(data.modules ?? [])
      setCompletedIds(data.completedIds ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSelectModule(mod) {
    setActiveModule(mod)
    // Tandai progress
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId: mod.id }),
    })
    if (!completedIds.includes(mod.id)) {
      setCompletedIds((prev) => [...prev, mod.id])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Memuat...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar modules={modules} completedIds={completedIds} />

      {activeModule ? (
        <ModuleViewer
          module={activeModule}
          onClose={() => setActiveModule(null)}
        />
      ) : (
        <main className="pt-16 pb-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-white">Perjalanan Vibe Coding</h1>
              <p className="text-gray-400 mt-1 text-sm">
                {completedIds.length} dari {modules.length} modul selesai
              </p>
            </div>

            {modules.length > 0 ? (
              <ModuleFlowchart
                modules={modules}
                completedIds={completedIds}
                onSelect={handleSelectModule}
                activeId={activeModule?.id}
              />
            ) : (
              <p className="text-center text-gray-500">Modul belum tersedia.</p>
            )}
          </div>
        </main>
      )}
    </div>
  )
}
