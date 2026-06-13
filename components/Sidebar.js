'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

function ScrollTitle({ children, hovered }) {
  const wrapRef = useRef(null)
  const txtRef  = useRef(null)
  const [delta, setDelta] = useState(0)
  const [canHover, setCanHover] = useState(true)

  useEffect(() => {
    if (!wrapRef.current || !txtRef.current) return
    setDelta(Math.max(0, txtRef.current.scrollWidth - wrapRef.current.offsetWidth))
  }, [children])

  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover)').matches)
  }, [])

  // Device touch (tanpa hover): teks terpotong geser otomatis bolak-balik
  const auto = !canHover && delta > 0

  return (
    <div ref={wrapRef} style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
      <motion.span
        ref={txtRef}
        style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: 13 }}
        animate={auto ? { x: [0, -delta, -delta, 0] } : { x: hovered && delta > 0 ? -delta : 0 }}
        transition={
          auto
            ? { duration: Math.max(9, delta / 12), times: [0, 0.42, 0.58, 1], repeat: Infinity, repeatDelay: 2, ease: 'linear' }
            : hovered && delta > 0
            ? { duration: delta / 40, ease: 'linear', delay: 0.5 }
            : { duration: 0.4, ease: 'easeOut' }
        }
      >
        {children}
      </motion.span>
    </div>
  )
}

function ModuleItem({ mod, i, isDone, isActive, onSelect, setOpen }) {
  const [hovered, setHovered] = useState(false)
  const hasVideo  = !!mod.youtubeUrl
  const hasMateri = !!mod.gammaUrl
  const hasBoth   = hasVideo && hasMateri

  function handleSubClick(tab) {
    onSelect?.(mod, tab)
    setOpen(false)
  }

  return (
    <div className="mb-0.5">
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
        style={{
          background: isActive ? 'var(--amber-glow)' : 'transparent',
          color: isActive ? 'var(--amber)' : 'rgba(255,255,255,0.75)',
          border: isActive ? '1px solid rgba(232,160,32,0.2)' : '1px solid transparent',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (hasVideo || hasMateri) {
            onSelect?.(mod, hasVideo ? 'video' : 'materi')
            setOpen(false)
          }
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isDone ? 'var(--amber)' : 'rgba(255,255,255,0.45)', minWidth: 18, flexShrink: 0 }}>
          {isDone ? '✓' : String(i + 1).padStart(2, '0')}
        </span>
        <ScrollTitle hovered={hovered}>{mod.title}</ScrollTitle>
      </div>

      {hasBoth && (
        <div className="flex gap-1.5 pl-9 pb-1">
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.92 }}
            onClick={() => handleSubClick('video')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(232,160,32,0.08)', color: '#E8A020', border: '1px solid rgba(232,160,32,0.2)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
          >
            ▶ Video
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.92 }}
            onClick={() => handleSubClick('materi')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(240,232,212,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
          >
            ◈ Materi
          </motion.button>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ modules = [], completedIds = [], onSelect }) {
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
            {modules.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: open ? 1 : 0, x: open ? 0 : -12 }}
                transition={{ delay: open ? 0.04 + i * 0.035 : 0, duration: 0.22 }}
              >
                <ModuleItem
                  mod={mod}
                  i={i}
                  isDone={completedIds.includes(mod.id)}
                  isActive={pathname === `/modul/${mod.slug}`}
                  onSelect={onSelect}
                  setOpen={setOpen}
                />
              </motion.div>
            ))}
          </div>
        </nav>
      </motion.aside>
    </>
  )
}
