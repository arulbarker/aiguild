'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function Sidebar({ modules = [], completedIds = [] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-sm font-medium"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--cream)',
          borderRadius: 10,
          padding: '8px 14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
        whileHover={{ scale: 1.04, borderColor: 'rgba(232,160,32,0.35)' }}
        whileTap={{ scale: 0.94 }}
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'x' : 'm'}
            style={{ fontSize: 15, lineHeight: 1 }}
            initial={{ rotate: -60, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 60, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {open ? '✕' : '☰'}
          </motion.span>
        </AnimatePresence>
        <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Modul
        </span>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(7,7,10,0.75)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.aside
        className="fixed top-0 left-0 h-full z-50"
        style={{
          width: 280,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
        initial={{ x: '-100%' }}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 38 }}
      >
        {/* Panel header */}
        <div
          className="px-6 pt-6 pb-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 4 }}>
            AI GUILD
          </p>
          <h2 className="font-bold uppercase" style={{ fontSize: 18, letterSpacing: '-0.02em', color: 'var(--cream)' }}>
            Kurikulum
          </h2>
        </div>

        <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm mb-1"
            style={{
              background: pathname === '/dashboard' ? 'var(--amber-glow)' : 'transparent',
              color: pathname === '/dashboard' ? 'var(--amber)' : 'var(--muted)',
              border: pathname === '/dashboard' ? '1px solid rgba(232,160,32,0.2)' : '1px solid transparent',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            ← Dashboard
          </Link>

          <div className="mt-3">
            {modules.map((mod, i) => {
              const isActive = pathname === `/modul/${mod.slug}`
              const isDone = completedIds.includes(mod.id)
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{
                    opacity: open ? 1 : 0,
                    x: open ? 0 : -12,
                  }}
                  transition={{ delay: open ? 0.04 + i * 0.035 : 0, duration: 0.22 }}
                >
                  <Link
                    href={`/modul/${mod.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-colors"
                    style={{
                      background: isActive ? 'var(--amber-glow)' : 'transparent',
                      color: isActive ? 'var(--cream)' : 'var(--muted)',
                      border: isActive ? '1px solid rgba(232,160,32,0.2)' : '1px solid transparent',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: isDone ? 'var(--amber)' : 'rgba(255,255,255,0.2)',
                        minWidth: 18,
                      }}
                    >
                      {isDone ? '✓' : String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate" style={{ fontSize: 13 }}>{mod.title}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </nav>
      </motion.aside>
    </>
  )
}
