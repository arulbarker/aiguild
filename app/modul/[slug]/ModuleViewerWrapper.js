'use client'

import ModuleViewer from '@/components/ModuleViewer'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

export default function ModuleViewerWrapper({ module: mod, modules, completedIds }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar modules={modules} completedIds={completedIds} />
      <ModuleViewer
        module={mod}
        onClose={() => router.push('/dashboard')}
      />
    </div>
  )
}
