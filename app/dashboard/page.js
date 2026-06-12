'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModuleFlowchart from '@/components/ModuleFlowchart'
import ModuleViewer from '@/components/ModuleViewer'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [modules, setModules]        = useState([])
  const [completedIds, setCompleted] = useState([])
  const [activeModule, setActive]    = useState(null)
  const [initialTab, setInitialTab]  = useState('video')
  const [loading, setLoading]        = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/modules').then(async (res) => {
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setModules(data.modules ?? [])
      setCompleted(data.completedIds ?? [])
      setLoading(false)
    })
  }, [router])

  function handleSelectModule(mod, tab = 'video') {
    setInitialTab(tab)
    setActive(mod)
  }

  async function handleComplete(modId) {
    if (completedIds.includes(modId)) return
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId: modId }),
    })
    setCompleted((prev) => [...prev, modId])
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar modules={modules} completedIds={completedIds} />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="min-h-screen flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.span
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.15em' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              MEMUAT...
            </motion.span>
          </motion.div>
        ) : (
          <motion.main
            key="content"
            className="pb-16 px-4"
            style={{ paddingTop: 72 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
          >
            <div className="max-w-2xl mx-auto">

              <motion.header
                className="mb-12 pt-4"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 10 }}
                >
                  AI GUILD · KURIKULUM
                </motion.p>

                <h1
                  className="uppercase leading-none font-extrabold"
                  style={{ fontSize: 'clamp(1.4rem, 7.5vw, 3.6rem)', letterSpacing: '-0.03em', marginBottom: 20 }}
                >
                  <span className="block" style={{ color: 'var(--cream)' }}>Perjalanan</span>
                  <span className="block" style={{ color: 'var(--amber)' }}>Vibe Coding</span>
                </h1>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {completedIds.length} / {modules.length} selesai
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                {modules.length > 0 && (
                  <div className="mt-3 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--amber)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedIds.length / modules.length) * 100}%` }}
                      transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                )}
              </motion.header>

              {modules.length > 0 ? (
                <ModuleFlowchart
                  modules={modules}
                  completedIds={completedIds}
                  onSelect={handleSelectModule}
                  activeId={activeModule?.id}
                />
              ) : (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', textAlign: 'center', fontSize: 13 }}
                >
                  — modul belum tersedia —
                </motion.p>
              )}
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Full-screen viewer — muncul di atas dashboard */}
      <AnimatePresence>
        {activeModule && (
          <ModuleViewer
            module={activeModule}
            initialTab={initialTab}
            isCompleted={completedIds.includes(activeModule?.id)}
            onComplete={() => handleComplete(activeModule?.id)}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
