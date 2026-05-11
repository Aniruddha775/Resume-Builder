'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResumeEditor } from '@/components/editor/resume-editor'
import { PdfPreviewPanel } from '@/components/pdf/pdf-preview-panel'
import { JdInputPanel } from '@/components/jd-panel/jd-input-panel'
import { ScorePanel } from '@/components/score-panel/score-panel'

export function MobileLayout() {
  const triggerCls =
    'text-[13px] font-semibold text-muted-foreground data-active:text-foreground data-active:shadow-none data-active:bg-transparent data-active:border-b-2 data-active:border-primary rounded-none'
  return (
    <Tabs defaultValue="editor" className="flex h-full flex-col">
      <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted px-4">
        <TabsTrigger value="jd" className={triggerCls}>
          Job Description
        </TabsTrigger>
        <TabsTrigger value="editor" className={triggerCls}>
          Editor
        </TabsTrigger>
        <TabsTrigger value="preview" className={triggerCls}>
          Preview
        </TabsTrigger>
        <TabsTrigger value="score" className={triggerCls}>Score</TabsTrigger>
      </TabsList>

      <TabsContent value="jd" className="flex-1 overflow-y-auto mt-0">
        <section aria-labelledby="mobile-jd-heading" className="h-full">
          <h2 id="mobile-jd-heading" className="sr-only">Job Description</h2>
          <JdInputPanel />
        </section>
      </TabsContent>

      <TabsContent value="editor" className="flex-1 overflow-y-auto mt-0">
        <section aria-labelledby="mobile-editor-heading" className="h-full">
          <h2 id="mobile-editor-heading" className="sr-only">Resume Editor</h2>
          <ResumeEditor />
        </section>
      </TabsContent>

      <TabsContent value="preview" className="flex-1 overflow-y-auto mt-0">
        <section aria-labelledby="mobile-preview-heading" className="h-full">
          <h2 id="mobile-preview-heading" className="sr-only">Preview</h2>
          <PdfPreviewPanel />
        </section>
      </TabsContent>

      <TabsContent value="score" className="flex-1 overflow-y-auto mt-0">
        <section aria-labelledby="mobile-score-heading" className="h-full">
          <h2 id="mobile-score-heading" className="sr-only">ATS Score</h2>
          <ScorePanel />
        </section>
      </TabsContent>
    </Tabs>
  )
}
