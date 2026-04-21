'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PanelPlaceholder } from './panel-placeholder'
import { FileText, PenLine, BarChart3 } from 'lucide-react'

export function MobileLayout() {
  return (
    <Tabs defaultValue="editor" className="flex h-full flex-col">
      <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted px-4">
        <TabsTrigger
          value="jd"
          className="text-[13px] font-semibold text-muted-foreground data-active:text-foreground data-active:shadow-none data-active:border-b-2 data-active:border-primary rounded-none"
        >
          Job Description
        </TabsTrigger>
        <TabsTrigger
          value="editor"
          className="text-[13px] font-semibold text-muted-foreground data-active:text-foreground data-active:shadow-none data-active:border-b-2 data-active:border-primary rounded-none"
        >
          Editor
        </TabsTrigger>
        <TabsTrigger
          value="score"
          className="text-[13px] font-semibold text-muted-foreground data-active:text-foreground data-active:shadow-none data-active:border-b-2 data-active:border-primary rounded-none"
        >
          Score
        </TabsTrigger>
      </TabsList>

      <TabsContent value="jd" className="flex-1 overflow-y-auto mt-0">
        <section aria-labelledby="mobile-jd-heading" className="h-full">
          <h2 id="mobile-jd-heading" className="sr-only">Job Description</h2>
          <PanelPlaceholder
            icon={FileText}
            heading="Paste a job description"
            body="Paste the full job posting here. Keywords will be extracted automatically to score your resume."
          />
        </section>
      </TabsContent>

      <TabsContent value="editor" className="flex-1 overflow-y-auto mt-0">
        <section aria-labelledby="mobile-editor-heading" className="h-full">
          <h2 id="mobile-editor-heading" className="sr-only">Resume Editor</h2>
          <PanelPlaceholder
            icon={PenLine}
            heading="Your resume editor"
            body="The structured resume editor will appear here. Add your experience, education, skills, and more."
          />
        </section>
      </TabsContent>

      <TabsContent value="score" className="flex-1 overflow-y-auto mt-0">
        <section aria-labelledby="mobile-score-heading" className="h-full">
          <h2 id="mobile-score-heading" className="sr-only">ATS Score</h2>
          <PanelPlaceholder
            icon={BarChart3}
            heading="ATS score panel"
            body="Your live ATS compatibility score will display here, updating as you edit your resume."
          />
        </section>
      </TabsContent>
    </Tabs>
  )
}
