'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton({ style }) {
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        color: loggingOut ? 'var(--muted)' : 'rgba(255,255,255,0.7)',
        border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        cursor: loggingOut ? 'default' : 'pointer',
        ...style,
      }}
    >
      {loggingOut ? 'Keluar…' : '⏻ Keluar'}
    </button>
  )
}
