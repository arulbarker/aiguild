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
      } else {
        if (data.devUrl) {
          window.location.href = data.devUrl
          return
        }
        setStatus('sent')
      }
    } catch {
      setErrorMsg('Tidak bisa terhubung ke server.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / judul */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            AI Guild
          </motion.h1>
          <motion.p
            className="text-gray-400 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            Platform Vibe Coding
          </motion.p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-gray-900 rounded-2xl p-8 border border-gray-800"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
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
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                >
                  ✉️
                </motion.div>
                <h2 className="text-xl font-semibold text-white mb-2">Cek email kamu</h2>
                <p className="text-gray-400 text-sm">
                  Link masuk sudah dikirim ke{' '}
                  <span className="text-purple-400">{email}</span>.
                  Link berlaku 15 menit.
                </p>
                <motion.button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Kirim ulang
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-semibold text-white mb-1">Masuk</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Masukkan email yang kamu gunakan saat membeli akses.
                </p>

                <AnimatePresence>
                  {(authError === 'expired' || authError === 'invalid') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-4 overflow-hidden"
                    >
                      {authError === 'expired'
                        ? 'Link sudah kadaluarsa atau sudah digunakan. Minta link baru.'
                        : 'Link tidak valid.'}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                    <motion.input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kamu@email.com"
                      required
                      whileFocus={{ scale: 1.01, borderColor: '#a855f7' }}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3
                                 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <AnimatePresence>
                    {status === 'error' && (
                      <motion.p
                        key="err"
                        className="text-red-400 text-sm"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                      >
                        {errorMsg}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900
                               text-white font-semibold py-3 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {status === 'loading' ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Mengirim...
                      </motion.span>
                    ) : (
                      'Kirim Link Masuk'
                    )}
                  </motion.button>
                </form>

                <p className="text-center text-gray-600 text-xs mt-6">
                  Belum punya akses?{' '}
                  <a href="https://lynk.id" className="text-purple-400 hover:underline">
                    Beli di sini
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
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
