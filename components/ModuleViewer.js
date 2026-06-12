'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

function isSafeUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export default function ModuleViewer({ module: mod, initialTab, isCompleted, onComplete, onClose }) {
  const hasVideo  = !!(mod?.youtubeUrl)
  const hasMateri = !!(mod?.gammaUrl)
  const [tab, setTab] = useState(initialTab ?? (hasVideo ? 'video' : 'materi'))
  const [marking, setMarking] = useState(false)

  async function handleMarkDone() {
    if (isCompleted || marking) return
    setMarking(true)
    await onComplete?.()
    setMarking(false)
  }

  if (!mod) return null

  const youtubeEmbed = mod.youtubeUrl
    ? mod.youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1&rel=0'
    : null

  return (
    <motion.div
      className="fixed inset-0 flex flex-col z-30"
      style={{ background: 'var(--bg)' }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ type: 'spring', stiffness: 320, damping: 36 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {/* Kiri: spacer + judul */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 sm:w-24 flex-shrink-0" />
          <div className="min-w-0">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 2 }}>
              AI GUILD · MODUL
            </p>
            <h1 className="font-bold leading-tight truncate" style={{ fontSize: 14, color: 'var(--cream)' }}>
              {mod.title}
            </h1>
          </div>
        </div>

        {/* Kanan: tab + tombol tutup */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasVideo && (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.92 }}
              onClick={() => setTab('video')}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                fontFamily: 'var(--font-mono)',
                background: tab === 'video' ? '#E8A020' : 'rgba(255,255,255,0.04)',
                color: tab === 'video' ? '#07070A' : 'var(--muted)',
                border: tab === 'video' ? 'none' : '1px solid var(--border)',
                transition: 'background 0.18s, color 0.18s',
              }}
            >
              ▶ Video
            </motion.button>
          )}
          {hasMateri && (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.92 }}
              onClick={() => setTab('materi')}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                fontFamily: 'var(--font-mono)',
                background: tab === 'materi' ? 'rgba(240,232,212,0.12)' : 'rgba(255,255,255,0.04)',
                color: tab === 'materi' ? 'var(--cream)' : 'var(--muted)',
                border: tab === 'materi' ? '1px solid rgba(240,232,212,0.2)' : '1px solid var(--border)',
                transition: 'background 0.18s, color 0.18s',
              }}
            >
              ◈ Materi
            </motion.button>
          )}

          {/* Tombol selesai */}
          <motion.button
            whileHover={!isCompleted ? { scale: 1.04 } : {}}
            whileTap={!isCompleted ? { scale: 0.92 } : {}}
            onClick={handleMarkDone}
            disabled={isCompleted || marking}
            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
            style={{
              fontFamily: 'var(--font-mono)',
              background: isCompleted ? 'rgba(232,160,32,0.12)' : 'rgba(255,255,255,0.05)',
              color: isCompleted ? '#E8A020' : 'var(--muted)',
              border: isCompleted ? '1px solid rgba(232,160,32,0.3)' : '1px solid var(--border)',
              cursor: isCompleted ? 'default' : 'pointer',
              transition: 'background 0.2s, color 0.2s, border-color 0.2s',
            }}
          >
            {isCompleted ? '✓ Selesai' : marking ? '...' : 'Tandai Selesai'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08, color: 'var(--cream)' }} whileTap={{ scale: 0.88 }}
            onClick={onClose}
            className="ml-1 flex items-center justify-center rounded-full"
            style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border)', fontSize: 14 }}
          >
            ✕
          </motion.button>
        </div>
      </div>

      {/* Konten */}
      <div className="flex-1 overflow-hidden">
        {tab === 'video' && youtubeEmbed && (
          <iframe
            src={youtubeEmbed}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {tab === 'materi' && mod.gammaUrl && (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
            <div
              className="w-full max-w-lg rounded-2xl p-8 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="mb-4" style={{ fontSize: 40 }}>◈</div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 8 }}>
                MATERI · {mod.title}
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
                Materi dibuka di tab baru agar tampil optimal.
              </p>
              <motion.a
                href={isSafeUrl(mod.gammaUrl) ? mod.gammaUrl : '#'}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
                style={{
                  background: '#E8A020',
                  color: '#07070A',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                Buka Materi →
              </motion.a>
            </div>
          </div>
        )}

        {tab === 'video' && !youtubeEmbed && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span style={{ fontSize: 32, opacity: 0.2 }}>▶</span>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.1em' }}>
              Video belum tersedia
            </p>
          </div>
        )}

        {tab === 'materi' && !mod.gammaUrl && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span style={{ fontSize: 32, opacity: 0.2 }}>◈</span>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.1em' }}>
              Materi belum tersedia
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
