'use client'

import { motion } from 'framer-motion'

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

export default function ModuleFlowchart({ modules, completedIds = [], onSelect, activeId }) {
  const hasVideo  = (mod) => !!mod.youtubeUrl
  const hasMateri = (mod) => !!mod.gammaUrl

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full">
      {modules.map((mod, i) => {
        const isActive    = activeId === mod.id
        const isCompleted = completedIds.includes(mod.id)
        const ytId        = getYouTubeId(mod.youtubeUrl)
        const thumbUrl    = ytId
          ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
          : getDriveThumb(mod.gammaUrl)
        const num         = String(i + 1).padStart(2, '0')
        const canPlay     = hasVideo(mod) || hasMateri(mod)

        return (
          <div key={mod.id}>
            <motion.article
              custom={i}
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
              {/* Thumbnail / Cover */}
              <motion.div
                className="relative overflow-hidden"
                style={{ aspectRatio: '16/9', cursor: canPlay ? 'pointer' : 'default' }}
                whileTap={canPlay ? { scale: 0.992 } : {}}
                onClick={() => canPlay && onSelect?.(mod, hasVideo(mod) ? 'video' : 'materi')}
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl} alt={mod.title}
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.85) saturate(0.9)' }}
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background: hasMateri(mod)
                        ? 'linear-gradient(135deg, #12101E 0%, #0A0810 60%, #0E0C14 100%)'
                        : 'linear-gradient(135deg, #0E0E12 0%, #09090C 100%)',
                    }}
                  />
                )}

                {/* Gradient bawah */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(7,7,10,0.92) 0%, rgba(7,7,10,0.3) 45%, rgba(7,7,10,0.05) 100%)' }}
                />

                {/* Watermark nomor */}
                <div
                  className="absolute top-2 left-3 select-none pointer-events-none"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 72, fontWeight: 100, color: 'rgba(232,160,32,0.18)', lineHeight: 1, letterSpacing: '-0.04em' }}
                >
                  {num}
                </div>

                {/* Badge selesai */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', delay: i * 0.08 + 0.2 }}
                    className="absolute top-3 right-3 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                    style={{ fontFamily: 'var(--font-mono)', background: 'rgba(232,160,32,0.12)', border: '1px solid rgba(232,160,32,0.3)', color: '#E8A020' }}
                  >
                    ✓ selesai
                  </motion.div>
                )}

                {/* Ikon tengah */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {hasVideo(mod)            && <PlayIcon />}
                  {!hasVideo(mod) && hasMateri(mod) && <MateriIcon />}
                  {!hasVideo(mod) && !hasMateri(mod) && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em' }}>
                      SEGERA
                    </span>
                  )}
                </div>

                {/* Judul overlay bawah */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-8">
                  <h3 className="text-white font-bold leading-tight" style={{ fontSize: 17, textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
                    {mod.title}
                  </h3>
                </div>
              </motion.div>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  {hasVideo(mod) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
                      onClick={(e) => { e.stopPropagation(); onSelect?.(mod, 'video') }}
                      className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: 'rgba(232,160,32,0.1)', color: '#E8A020', border: '1px solid rgba(232,160,32,0.3)' }}
                    >
                      ▶&nbsp; Video
                    </motion.button>
                  )}
                  {hasMateri(mod) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
                      onClick={(e) => { e.stopPropagation(); onSelect?.(mod, 'materi') }}
                      className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: 'rgba(240,232,212,0.06)', color: 'var(--cream)', border: '1px solid rgba(240,232,212,0.14)' }}
                    >
                      ◈&nbsp; Materi
                    </motion.button>
                  )}
                  {!hasVideo(mod) && !hasMateri(mod) && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                      Konten segera hadir
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em' }}>
                  {num}
                </span>
              </div>
            </motion.article>

            {i < modules.length - 1 && <FlowConnector index={i} />}
          </div>
        )
      })}
    </div>
  )
}
