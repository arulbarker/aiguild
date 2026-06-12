'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | sent | error
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">AI Guild</h1>
          <p className="text-gray-400 mt-2">Platform Vibe Coding</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {status === 'sent' ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="text-xl font-semibold text-white mb-2">Cek email kamu</h2>
              <p className="text-gray-400 text-sm">
                Link masuk sudah dikirim ke <span className="text-purple-400">{email}</span>.
                Link berlaku 15 menit.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Kirim ulang
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-1">Masuk</h2>
              <p className="text-gray-400 text-sm mb-6">
                Masukkan email yang kamu gunakan saat membeli akses.
              </p>

              {(authError === 'expired' || authError === 'invalid') && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                  {authError === 'expired'
                    ? 'Link sudah kadaluarsa atau sudah digunakan. Minta link baru.'
                    : 'Link tidak valid.'}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kamu@email.com"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3
                               placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-sm">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900
                             text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {status === 'loading' ? 'Mengirim...' : 'Kirim Link Masuk'}
                </button>
              </form>

              <p className="text-center text-gray-600 text-xs mt-6">
                Belum punya akses?{' '}
                <a href="https://lynk.id" className="text-purple-400 hover:underline">
                  Beli di sini
                </a>
              </p>
            </>
          )}
        </div>
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
