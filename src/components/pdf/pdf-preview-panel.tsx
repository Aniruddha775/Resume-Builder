'use client'
import { PdfPreview } from './pdf-preview'
import { ExportPdfButton } from './export-pdf-button'

export function PdfPreviewPanel() {
  return (
    <section aria-labelledby="preview-panel-heading" className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-3">
        <h2 id="preview-panel-heading" className="text-[13px] font-semibold text-foreground">
          Preview
        </h2>
        <ExportPdfButton />
      </div>
      <div className="flex-1 overflow-hidden">
        <PdfPreview />
      </div>
    </section>
  )
}
