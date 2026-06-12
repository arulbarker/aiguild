'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const searchParams = useSearchParams()
  const authError = searchParams.get('error')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Terjadi kesalahan.')
        setStatus('error')
        return
      }

      if (data.devUrl) {
        window.location.href = data.devUrl
        return
      }

      setStatus('sent')
    } catch {
      setErrorMsg('Tidak bisa terhubung ke server.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg)' }}>

      {/* Logo */}
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 8 }}>
          Platform Vibe Coding
        </p>
        <h1 className="font-extrabold uppercase leading-none" style={{ fontSize: 'clamp(2.2rem, 8vw, 4rem)', letterSpacing: '-0.04em', color: 'var(--cream)' }}>
          AI Guild
        </h1>
      </motion.div>

      {/* Card */}
      <motion.div
        className="w-full"
        style={{ maxWidth: 420 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 48px rgba(0,0,0,0.5)' }}
        >
          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <motion.div
                key="sent"
                className="text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-4xl mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                >
                  ✉️
                </motion.div>
                <h2 className="font-bold mb-2" style={{ fontSize: 18, color: 'var(--cream)' }}>
                  Cek email kamu
                </h2>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
                  Link masuk sudah dikirim ke{' '}
                  <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{email}</span>.
                  <br />Berlaku 15 menit.
                </p>
                <motion.button
                  className="mt-6 text-sm"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                  whileHover={{ color: 'var(--amber)' }}
                  onClick={() => setStatus('idle')}
                >
                  ← Kirim ulang
                </motion.button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-bold mb-1" style={{ fontSize: 20, color: 'var(--cream)' }}>
                  Masuk
                </h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
                  Masukkan email yang kamu gunakan saat membeli akses.
                </p>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                  >
                    {authError === 'expired' ? 'Link sudah kedaluwarsa. Minta link baru.' : 'Link tidak valid.'}
                  </motion.div>
                )}

                <AnimatePresence>
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-4 px-4 py-2.5 rounded-xl text-sm"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mb-4">
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kamu@email.com"
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      background: 'var(--surface-2, #141319)',
                      border: '1px solid var(--border)',
                      color: 'var(--cream)',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(232,160,32,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl font-bold"
                  style={{
                    background: status === 'loading' ? 'rgba(232,160,32,0.4)' : '#E8A020',
                    color: '#07070A',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontSize: 12,
                  }}
                >
                  {status === 'loading' ? 'Mengirim...' : 'Kirim Link Masuk'}
                </motion.button>

                <p className="mt-5 text-center" style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Belum punya akses?{' '}
                  <a href="https://lynk.id" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)' }} className="hover:underline">
                    Beli di sini
                  </a>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
