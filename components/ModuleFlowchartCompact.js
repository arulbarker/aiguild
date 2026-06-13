'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

function ScrollTitle({ children, hovered }) {
  const wrapRef = useRef(null)
  const txtRef  = useRef(null)
  const [delta, setDelta] = useState(0)

  useEffect(() => {
    if (!wrapRef.current || !txtRef.current) return
    setDelta(Math.max(0, txtRef.current.scrollWidth - wrapRef.current.offsetWidth))
  }, [children])

  return (
    <div ref={wrapRef} style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
      <motion.span
        ref={txtRef}
        style={{ display: 'inline-block', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em' }}
        animate={{ x: hovered && delta > 0 ? -delta : 0 }}
        transition={
          hovered && delta > 0
            ? { duration: delta / 40, ease: 'linear', delay: 0.4 }
            : { duration: 0.35, ease: 'easeOut' }
        }
      >
        {children}
      </motion.span>
    </div>
  )
}

function buildDisplayGroups(modules) {
  const groups = []
  const placed = new Set()

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i]
    if (placed.has(mod.id)) continue

    const currParentKey = JSON.stringify([...(mod.parentIds ?? [])].sort())
    const siblings = modules.filter(
      (m) =>
        m.id !== mod.id &&
        !placed.has(m.id) &&
        currParentKey !== '[]' &&
        JSON.stringify([...(m.parentIds ?? [])].sort()) === currParentKey
    )

    if (siblings.length > 0) {
      const branch = [mod, ...siblings]
      branch.forEach((m) => placed.add(m.id))
      groups.push({ type: 'branch', modules: branch })
    } else {
      placed.add(mod.id)
      groups.push({ type: 'single', modules: [mod] })
    }
  }
  return groups
}

function NodeBox({ mod, globalIndex, isActive, isCompleted, onSelect }) {
  const hasVideo  = !!mod.youtubeUrl
  const hasMateri = !!mod.gammaUrl
  const canPlay   = hasVideo || hasMateri
  const num       = String(globalIndex + 1).padStart(2, '0')
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      onClick={() => canPlay && onSelect?.(mod, hasVideo ? 'video' : 'materi')}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={canPlay ? { scale: 0.97 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: globalIndex * 0.04, duration: 0.3 }}
      className="flex items-center gap-3 w-full text-left rounded-xl px-3.5 py-2.5"
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
      {/* Nomor / status */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: isCompleted ? '#E8A020' : 'rgba(255,255,255,0.35)',
          minWidth: 22,
          flexShrink: 0,
        }}
      >
        {isCompleted ? '✓' : num}
      </span>

      {/* Judul — scroll saat hover kalau terpotong */}
      <ScrollTitle
        hovered={hovered}
        style={{ color: isActive ? '#E8A020' : isCompleted ? 'rgba(240,232,212,0.85)' : 'rgba(240,232,212,0.7)' }}
      >
        <span style={{ color: isActive ? '#E8A020' : isCompleted ? 'rgba(240,232,212,0.85)' : 'rgba(240,232,212,0.7)' }}>
          {mod.title}
        </span>
      </ScrollTitle>

      {/* Badge konten */}
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

function Arrow() {
  return (
    <div className="flex justify-center" style={{ height: 24, marginBlock: 2 }}>
      <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
        <line x1="6" y1="0" x2="6" y2="18" stroke="#E8A020" strokeWidth="1.5" strokeOpacity={0.3} strokeLinecap="round" />
        <path d="M2 15 L6 21 L10 15" stroke="#E8A020" strokeWidth="1.5" strokeOpacity={0.3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

function BranchArrows({ count }) {
  const op = 0.3
  const sw = 1.5
  const lc = 'round'
  const cols = Math.min(count, 2)
  return (
    <div className="flex justify-center" style={{ height: 28, marginBlock: 2 }}>
      <svg width="100%" height="28" viewBox="0 0 200 28" preserveAspectRatio="none" fill="none">
        <line x1="100" y1="0" x2="100" y2="10" stroke="#E8A020" strokeWidth={sw} strokeOpacity={op} strokeLinecap={lc} />
        {cols === 1 && (
          <line x1="100" y1="10" x2="100" y2="28" stroke="#E8A020" strokeWidth={sw} strokeOpacity={op} strokeLinecap={lc} />
        )}
        {cols === 2 && <>
          <line x1="50"  y1="10" x2="150" y2="10" stroke="#E8A020" strokeWidth={sw} strokeOpacity={op} strokeLinecap={lc} />
          <line x1="50"  y1="10" x2="50"  y2="28" stroke="#E8A020" strokeWidth={sw} strokeOpacity={op} strokeLinecap={lc} />
          <line x1="150" y1="10" x2="150" y2="28" stroke="#E8A020" strokeWidth={sw} strokeOpacity={op} strokeLinecap={lc} />
        </>}
        {cols === 3 && <>
          <line x1="20"  y1="10" x2="180" y2="10" stroke="#E8A020" strokeWidth={sw} strokeOpacity={op} strokeLinecap={lc} />
          <line x1="20"  y1="10" x2="20"  y2="28" stroke="#E8A020" strokeWidth={sw} strokeOpacity={op} strokeLinecap={lc} />
          <line x1="100" y1="10" x2="100" y2="28" stroke="#E8A020" strokeWidth={sw} strokeOpacity={op} strokeLinecap={lc} />
          <line x1="180" y1="10" x2="180" y2="28" stroke="#E8A020" strokeWidth={sw} strokeOpacity={op} strokeLinecap={lc} />
        </>}
      </svg>
    </div>
  )
}

export default function ModuleFlowchartCompact({ modules, completedIds = [], onSelect, activeId }) {
  const groups = buildDisplayGroups(modules)
  let globalIndex = 0

  return (
    <div className="w-full max-w-lg mx-auto">
      {groups.map((group, gi) => {
        const isLast = gi === groups.length - 1

        if (group.type === 'single') {
          const mod = group.modules[0]
          const idx = globalIndex++
          return (
            <div key={mod.id}>
              <NodeBox
                mod={mod}
                globalIndex={idx}
                isActive={activeId === mod.id}
                isCompleted={completedIds.includes(mod.id)}
                onSelect={onSelect}
              />
              {!isLast && (
                groups[gi + 1]?.type === 'branch'
                  ? <BranchArrows count={groups[gi + 1].modules.length} />
                  : <Arrow />
              )}
            </div>
          )
        }

        const branchStart = globalIndex
        globalIndex += group.modules.length
        const cols = group.modules.length === 2 ? 2 : Math.min(group.modules.length, 2)

        return (
          <div key={group.modules.map((m) => m.id).join('-')}>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {group.modules.map((mod, bi) => (
                <NodeBox
                  key={mod.id}
                  mod={mod}
                  globalIndex={branchStart + bi}
                  isActive={activeId === mod.id}
                  isCompleted={completedIds.includes(mod.id)}
                  onSelect={onSelect}
                />
              ))}
            </div>
            {!isLast && <Arrow />}
          </div>
        )
      })}
    </div>
  )
}
