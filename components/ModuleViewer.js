'use client'

import { useState } from 'react'

export default function ModuleViewer({ module: mod, onClose }) {
  const [tab, setTab] = useState(mod?.youtubeUrl ? 'video' : 'materi')

  if (!mod) return null

  const youtubeEmbed = mod.youtubeUrl
    ? mod.youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
    : null

  return (
    <div className="fixed inset-0 bg-gray-950 z-30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          {/* Spacer for sidebar toggle button */}
          <div className="w-10 sm:w-20 flex-shrink-0" />
          <h1 className="text-white font-semibold text-sm sm:text-base truncate">
            {mod.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Tabs */}
          {mod.youtubeUrl && (
            <button
              onClick={() => setTab('video')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${tab === 'video'
                  ? 'bg-purple-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              Video
            </button>
          )}
          {mod.gammaUrl && (
            <button
              onClick={() => setTab('materi')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${tab === 'materi'
                  ? 'bg-purple-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              Materi
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 text-gray-500 hover:text-white px-2 py-1.5 rounded-lg
                         hover:bg-gray-800 transition-colors text-lg"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
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
          <iframe
            src={mod.gammaUrl}
            className="w-full h-full bg-white"
            allow="fullscreen"
          />
        )}

        {tab === 'materi' && !mod.gammaUrl && (
          <div className="flex items-center justify-center h-full text-gray-500">
            Materi belum tersedia untuk modul ini.
          </div>
        )}

        {tab === 'video' && !youtubeEmbed && (
          <div className="flex items-center justify-center h-full text-gray-500">
            Video belum tersedia untuk modul ini.
          </div>
        )}
      </div>
    </div>
  )
}
