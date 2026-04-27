import { AppHeader } from '@/components/layout/app-header'
import { EditorLayout } from '@/components/layout/editor-layout'
import { ResumeBootstrap } from '@/components/app/resume-bootstrap'

export default function Home() {
  return (
    <ResumeBootstrap>
      <div className="flex h-dvh flex-col">
        <AppHeader />
        <main className="flex-1 overflow-hidden">
          <EditorLayout />
        </main>
      </div>
    </ResumeBootstrap>
  )
}
