import { AppHeader } from '@/components/layout/app-header'
import { EditorLayout } from '@/components/layout/editor-layout'

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <AppHeader />
      <main className="flex-1 overflow-hidden">
        <EditorLayout />
      </main>
    </div>
  )
}
