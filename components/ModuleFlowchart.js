'use client'

import { motion } from 'framer-motion'
import { buildSegments, displayNumber } from '@/lib/module-tree'

function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function getDriveThumb(url) {
  if (!url) return null
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1280` : null
}

function PlayIcon() {
  return (
    <motion.div
      className="flex items-center justify-center rounded-full"
      style={{ width: 60, height: 60, background: '#E8A020' }}
      whileHover={{ scale: 1.12, boxShadow: '0 0 0 12px rgba(232,160,32,0.12), 0 0 40px rgba(232,160,32,0.35)' }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
    >
      <svg viewBox="0 0 24 24" fill="#07070A" style={{ width: 26, height: 26, marginLeft: 4 }}>
        <path d="M8 5v14l11-7z" />
      </svg>
    </motion.div>
  )
}

function MateriIcon() {
  return (
    <motion.div
      className="flex items-center justify-center rounded-full"
      style={{ width: 60, height: 60, background: 'rgba(240,232,212,0.1)', border: '1.5px solid rgba(240,232,212,0.22)' }}
      whileHover={{ scale: 1.1, background: 'rgba(240,232,212,0.18)' }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--cream)" strokeWidth="1.5" style={{ width: 26, height: 26 }}>
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  )
}

function FlowConnector({ index }) {
  return (
    <div className="flex flex-col items-center" style={{ height: 64 }}>
      <svg width="24" height="64" viewBox="0 0 24 64" fill="none">
        <motion.path
          d="M12 0 L12 50"
          stroke="#E8A020" strokeWidth="1.5" strokeDasharray="5 6" strokeLinecap="round" strokeOpacity={0.35}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
        />
        <motion.path
          d="M6 46 L12 56 L18 46"
          stroke="#E8A020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity={0.35}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.25, delay: 1.0 + index * 0.1 }}
        />
      </svg>
    </div>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.975 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

function ModuleCard({ mod, isActive, isCompleted, onSelect }) {
  const hasVideo  = !!mod.youtubeUrl
  const hasMateri = !!mod.gammaUrl
  const canPlay   = hasVideo || hasMateri
  const ytId      = getYouTubeId(mod.youtubeUrl)
  const thumbUrl  = ytId
    ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
    : getDriveThumb(mod.gammaUrl)
  const num = displayNumber(mod)

  return (
    <motion.article
      custom={mod.orderIndex}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={canPlay ? { scale: 1.008, transition: { duration: 0.2 } } : {}}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: isActive
          ? '1px solid rgba(232,160,32,0.45)'
          : '1px solid var(--border)',
        boxShadow: isActive
          ? '0 0 40px rgba(232,160,32,0.1), 0 4px 32px rgba(0,0,0,0.6)'
          : '0 4px 24px rgba(0,0,0,0.4)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      <motion.div
        className="relative overflow-hidden"
        style={{ aspectRatio: '16/9', cursor: canPlay ? 'pointer' : 'default' }}
        whileTap={canPlay ? { scale: 0.992 } : {}}
        onClick={() => canPlay && onSelect?.(mod, hasVideo ? 'video' : 'materi')}
      >
        <div
          className="absolute inset-0"
          style={{
            background: hasMateri
              ? 'linear-gradient(135deg, #12101E 0%, #0A0810 60%, #0E0C14 100%)'
              : 'linear-gradient(135deg, #0E0E12 0%, #09090C 100%)',
          }}
        />
        {thumbUrl && (
          <img
            src={thumbUrl} alt={mod.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.9) saturate(0.9)' }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,7,10,0.35) 0%, transparent 50%)' }} />

        {isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: mod.orderIndex * 0.08 + 0.2 }}
            className="absolute top-3 right-3 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{ fontFamily: 'var(--font-mono)', background: 'rgba(7,7,10,0.7)', border: '1px solid rgba(232,160,32,0.5)', color: '#E8A020', backdropFilter: 'blur(8px)' }}
          >
            ✓ selesai
          </motion.div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          {hasVideo && <PlayIcon />}
          {!hasVideo && hasMateri && <MateriIcon />}
          {!hasVideo && !hasMateri && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em' }}>
              SEGERA
            </span>
          )}
        </div>
      </motion.div>

      <div className="px-4 pt-3.5 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start gap-3">
          <span className="shrink-0 mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#E8A020', letterSpacing: '0.08em' }}>
            {num}
          </span>
          <h3 className="leading-snug" style={{ fontSize: 15, fontWeight: 600, color: 'var(--cream)', letterSpacing: '-0.01em' }}>
            {mod.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3">
        {hasVideo && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
            onClick={(e) => { e.stopPropagation(); onSelect?.(mod, 'video') }}
            className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{ background: 'rgba(232,160,32,0.1)', color: '#E8A020', border: '1px solid rgba(232,160,32,0.3)' }}
          >
            ▶&nbsp; Video
          </motion.button>
        )}
        {hasMateri && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
            onClick={(e) => { e.stopPropagation(); onSelect?.(mod, 'materi') }}
            className="text-xs px-3 py-1.5 rounded-full font-medium"
            style={{ background: 'rgba(240,232,212,0.06)', color: 'var(--cream)', border: '1px solid rgba(240,232,212,0.14)' }}
          >
            ◈&nbsp; Materi
          </motion.button>
        )}
        {!hasVideo && !hasMateri && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            Konten segera hadir
          </span>
        )}
      </div>
    </motion.article>
  )
}

export default function ModuleFlowchart({ modules, completedIds = [], onSelect, activeId }) {
  const segments = buildSegments(modules)
  const isDone = (m) => completedIds.includes(m.id)

  // Trunk kartu dibatasi lebar nyaman di tengah; track melebar keluar (fan-out)
  const TRUNK = 'w-full max-w-2xl mx-auto px-4'

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4">
      {segments.map((seg, si) => {
        const isLast = si === segments.length - 1

        if (seg.type === 'single') {
          const mod = seg.modules[0]
          return (
            <div key={mod.id} className={TRUNK}>
              <ModuleCard mod={mod} isActive={activeId === mod.id} isCompleted={isDone(mod)} onSelect={onSelect} />
              {!isLast && <FlowConnector index={si} />}
            </div>
          )
        }

        if (seg.type === 'diamond') {
          return (
            <div key={seg.modules.map((m) => m.id).join('-')} className={TRUNK}>
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  PARALEL
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {seg.modules.map((mod) => (
                  <ModuleCard key={mod.id} mod={mod} isActive={activeId === mod.id} isCompleted={isDone(mod)} onSelect={onSelect} />
                ))}
              </div>
              {!isLast && <FlowConnector index={si} />}
            </div>
          )
        }

        // tracks — N kolom kartu sejajar yang melebar (fan-out dari trunk)
        const count = seg.columns.length
        return (
          <div key={seg.columns.map((c) => c[0].id).join('-')}>
            <div className={`${TRUNK} flex items-center gap-3 my-3`}>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                PILIH JALUR
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <div className="overflow-x-auto">
              <div
                className="grid gap-4 items-start mx-auto"
                style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`, minWidth: count * 240, maxWidth: '100%' }}
              >
                {seg.columns.map((chain) => (
                  <div key={chain[0].id} className="flex flex-col gap-4">
                    {chain.map((mod) => (
                      <ModuleCard key={mod.id} mod={mod} isActive={activeId === mod.id} isCompleted={isDone(mod)} onSelect={onSelect} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
