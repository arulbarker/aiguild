'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar({ modules = [], completedIds = [] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 bg-gray-800 hover:bg-gray-700 border border-gray-700
                   text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2
                   transition-colors shadow-lg"
        aria-label="Toggle menu"
      >
        <span className="text-base">{open ? '✕' : '☰'}</span>
        <span className="hidden sm:inline">Modul</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 border-r border-gray-800
                    z-40 transform transition-transform duration-200 ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 pt-16">
          <h2 className="text-white font-bold text-lg mb-4">AI Guild</h2>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors
                ${pathname === '/dashboard'
                  ? 'bg-purple-900/50 text-purple-300'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              Dashboard
            </Link>

            <div className="pt-2">
              <p className="text-xs text-gray-600 uppercase tracking-wider px-3 mb-2">Modul</p>
              {modules.map((mod) => {
                const isActive = pathname === `/modul/${mod.slug}`
                const isDone = completedIds.includes(mod.id)
                return (
                  <Link
                    key={mod.id}
                    href={`/modul/${mod.slug}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                      ${isActive
                        ? 'bg-purple-900/50 text-purple-300'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                  >
                    {isDone ? (
                      <span className="text-green-400 text-xs">✓</span>
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-gray-600 flex-shrink-0" />
                    )}
                    <span className="truncate">{mod.title}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}
