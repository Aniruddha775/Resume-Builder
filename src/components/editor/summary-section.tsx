'use client'
import type { Editor } from '@tiptap/react'
import { EditorContent } from '@tiptap/react'

interface SummarySectionProps {
  editor: Editor | null
}

export function SummarySection({ editor }: SummarySectionProps) {
  if (!editor) return null
  return (
    <div className="px-4 pt-6">
      <h3 className="mb-2 text-[13px] font-semibold text-foreground">Summary</h3>
      <div className="min-h-[120px] rounded border border-border px-3 py-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
