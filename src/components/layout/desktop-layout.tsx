'use client'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { PanelPlaceholder } from './panel-placeholder'
import { FileText } from 'lucide-react'
import { ResumeEditor } from '@/components/editor/resume-editor'
import { PdfPreviewPanel } from '@/components/pdf/pdf-preview-panel'

export function DesktopLayout() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize={27} minSize={15}>
        <section aria-labelledby="jd-panel-heading" className="flex h-full flex-col overflow-y-auto">
          <div className="px-4 py-3">
            <h2 id="jd-panel-heading" className="text-[13px] font-semibold text-foreground">Job Description</h2>
          </div>
          <div className="flex-1">
            <PanelPlaceholder
              icon={FileText}
              heading="Paste a job description"
              body="Paste the full job posting here. Keywords will be extracted automatically to score your resume."
            />
          </div>
        </section>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={46} minSize={20}>
        <section aria-labelledby="editor-panel-heading" className="flex h-full flex-col overflow-y-auto">
          <div className="px-4 py-3 bg-muted">
            <h2 id="editor-panel-heading" className="text-[13px] font-semibold text-foreground">Resume Editor</h2>
          </div>
          <div className="flex-1">
            <ResumeEditor />
          </div>
        </section>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={27} minSize={15}>
        <PdfPreviewPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
