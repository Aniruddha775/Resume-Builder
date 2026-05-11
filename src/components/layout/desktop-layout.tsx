'use client'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { ResumeEditor } from '@/components/editor/resume-editor'
import { JdInputPanel } from '@/components/jd-panel/jd-input-panel'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScorePanel } from '@/components/score-panel/score-panel'
import { ExportPdfButton } from '@/components/pdf/export-pdf-button'
import { PdfPreview } from '@/components/pdf/pdf-preview'

export function DesktopLayout() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize={27} minSize={15}>
        <section aria-labelledby="jd-panel-heading" className="flex h-full flex-col overflow-y-auto">
          <div className="px-4 py-3 bg-muted border-b border-border">
            <h2 id="jd-panel-heading" className="text-[13px] font-semibold text-foreground">Job Description</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <JdInputPanel />
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
        <Tabs defaultValue="score" className="flex h-full flex-col">
          {/* Panel header: tab triggers + always-visible export button */}
          <div className="flex items-center border-b border-border bg-muted px-4 h-[44px] shrink-0">
            <TabsList className="h-full rounded-none bg-transparent border-0 p-0 gap-4 flex-1">
              <TabsTrigger
                value="score"
                className="rounded-none border-b-2 border-transparent text-[13px] font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent px-0 h-full"
              >
                Score
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="rounded-none border-b-2 border-transparent text-[13px] font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent px-0 h-full"
              >
                Preview
              </TabsTrigger>
            </TabsList>
            <ExportPdfButton />
          </div>
          <TabsContent value="score" className="flex-1 overflow-y-auto mt-0">
            <ScorePanel />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-0">
            <PdfPreview />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
