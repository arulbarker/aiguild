'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { buildSegments, displayNumber } from '@/lib/module-tree'

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
        style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em' }}
        animate={auto ? { x: [0, -delta, -delta, 0] } : { x: hovered && delta > 0 ? -delta : 0 }}
        transition={
          auto
            ? { duration: Math.max(9, delta / 12), times: [0, 0.42, 0.58, 1], repeat: Infinity, repeatDelay: 2, ease: 'linear' }
            : hovered && delta > 0
            ? { duration: delta / 40, ease: 'linear', delay: 0.4 }
            : { duration: 0.35, ease: 'easeOut' }
        }
      >
        {children}
      </motion.span>
    </div>
  )
}

function NodeBox({ mod, label, isActive, isCompleted, onSelect }) {
  const hasVideo  = !!mod.youtubeUrl
  const hasMateri = !!mod.gammaUrl
  const canPlay   = hasVideo || hasMateri
  const num       = label ?? displayNumber(mod)
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      onClick={() => canPlay && onSelect?.(mod, hasVideo ? 'video' : 'materi')}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={canPlay ? { scale: 0.97 } : {}}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2.5"
      style={{
        background: isActive
          ? 'rgba(232,160,32,0.1)'
          : isCompleted
          ? 'rgba(232,160,32,0.05)'
          : 'var(--surface)',
        border: isActive
          ? '1px solid rgba(232,160,32,0.5)'
          : isCompleted
          ? '1px solid rgba(232,160,32,0.2)'
          : '1px solid var(--border)',
        cursor: canPlay ? 'pointer' : 'default',
        transition: 'border-color 0.2s, background 0.2s',
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: isCompleted ? '#E8A020' : 'rgba(255,255,255,0.35)',
          minWidth: 20,
          flexShrink: 0,
        }}
      >
        {isCompleted ? '✓' : num}
      </span>

      <ScrollTitle hovered={hovered}>
        <span style={{ color: isActive ? '#E8A020' : isCompleted ? 'rgba(240,232,212,0.85)' : 'rgba(240,232,212,0.7)' }}>
          {mod.title}
        </span>
      </ScrollTitle>

      <div className="flex items-center gap-1 flex-shrink-0">
        {hasVideo && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#E8A020', background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: 4, padding: '1px 5px' }}>
            ▶
          </span>
        )}
        {hasMateri && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(240,232,212,0.5)', background: 'rgba(240,232,212,0.05)', border: '1px solid rgba(240,232,212,0.12)', borderRadius: 4, padding: '1px 5px' }}>
            ◈
          </span>
        )}
        {!canPlay && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 5px' }}>
            soon
          </span>
        )}
      </div>
    </motion.button>
  )
}

// Panah lurus vertikal (antar node linear)
function Arrow() {
  return (
    <div className="flex justify-center" style={{ height: 22 }}>
      <svg width="12" height="22" viewBox="0 0 12 22" fill="none">
        <line x1="6" y1="0" x2="6" y2="16" stroke="#E8A020" strokeWidth="1.5" strokeOpacity={0.3} strokeLinecap="round" />
        <path d="M2 13 L6 19 L10 13" stroke="#E8A020" strokeWidth="1.5" strokeOpacity={0.3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

// Garis lurus tanpa panah (di dalam track, menyambung ke node berikutnya)
function Connector() {
  return (
    <div className="flex justify-center" style={{ height: 16 }}>
      <svg width="2" height="16" viewBox="0 0 2 16" fill="none">
        <line x1="1" y1="0" x2="1" y2="16" stroke="#E8A020" strokeWidth="1.5" strokeOpacity={0.3} strokeLinecap="round" />
      </svg>
    </div>
  )
}

// Konektor split: 1 batang dari atas, pecah ke N kolom sejajar
function SplitConnector({ count }) {
  const W = 200, H = 26, midY = 11
  const centers = Array.from({ length: count }, (_, i) => ((i + 0.5) / count) * W)
  const first = centers[0]
  const last = centers[count - 1]
  const stroke = { stroke: '#E8A020', strokeWidth: 1.5, strokeOpacity: 0.3, strokeLinecap: 'round' }

  return (
    <div style={{ width: '100%', height: H }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" fill="none">
        <line x1={W / 2} y1={0} x2={W / 2} y2={midY} {...stroke} />
        <line x1={first} y1={midY} x2={last} y2={midY} {...stroke} />
        {centers.map((cx, i) => (
          <line key={i} x1={cx} y1={midY} x2={cx} y2={H} {...stroke} />
        ))}
      </svg>
    </div>
  )
}

export default function ModuleFlowchartCompact({ modules, completedIds = [], onSelect, activeId }) {
  const segments = buildSegments(modules)
  const isDone = (m) => completedIds.includes(m.id)

  // Trunk dibatasi lebar nyaman, ditengah. Track boleh melebar keluar.
  const TRUNK = 'w-full max-w-2xl mx-auto px-4'

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {segments.map((seg, si) => {
        const isLast = si === segments.length - 1
        const next = segments[si + 1]

        if (seg.type === 'single') {
          const mod = seg.modules[0]
          return (
            <div key={mod.id} className={TRUNK}>
              <NodeBox mod={mod} isActive={activeId === mod.id} isCompleted={isDone(mod)} onSelect={onSelect} />
              {!isLast && (
                next?.type === 'diamond'
                  ? <SplitConnector count={next.modules.length} />
                  : next?.type === 'tracks'
                  ? null
                  : <Arrow />
              )}
            </div>
          )
        }

        if (seg.type === 'diamond') {
          return (
            <div key={seg.modules.map((m) => m.id).join('-')} className={TRUNK}>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${seg.modules.length}, 1fr)` }}>
                {seg.modules.map((mod) => (
                  <NodeBox key={mod.id} mod={mod} isActive={activeId === mod.id} isCompleted={isDone(mod)} onSelect={onSelect} />
                ))}
              </div>
              {!isLast && <Arrow />}
            </div>
          )
        }

        // tracks — N kolom sejajar yang melebar, fan-out dari trunk
        const count = seg.columns.length
        return (
          <div key={seg.columns.map((c) => c[0].id).join('-')} className="overflow-x-auto">
            <div className="mx-auto" style={{ minWidth: count * 190, maxWidth: '100%' }}>
              <SplitConnector count={count} />
              <div className="grid gap-3 items-start" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
                {seg.columns.map((chain) => {
                  const head = Number(displayNumber(chain[0]))
                  return (
                    <div key={chain[0].id} className="flex flex-col">
                      {chain.map((mod, ci) => (
                        <div key={mod.id}>
                          <NodeBox
                            mod={mod}
                            label={ci === 0 ? displayNumber(mod) : `${head}.${ci}`}
                            isActive={activeId === mod.id}
                            isCompleted={isDone(mod)}
                            onSelect={onSelect}
                          />
                          {ci < chain.length - 1 && <Connector />}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
