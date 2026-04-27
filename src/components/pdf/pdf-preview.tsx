'use client'
import { usePDF } from '@react-pdf/renderer'
import { useEffect, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ModernCleanTemplate } from './templates/modern-clean-template'
import { Loader2 } from 'lucide-react'
import type { Resume } from '@/types/resume'
import '@/lib/pdf/fonts'

const FALLBACK_RESUME: Resume = {
  id: '00000000-0000-0000-0000-000000000000',
  title: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: {
    contactInfo: { fullName: ' ', email: 'placeholder@example.com', phone: '0000000', location: ' ' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
  },
}

export function PdfPreview() {
  const resume = useAppStore((s) => s.resume)
  const debouncedResume = useDebouncedValue(resume, 800)

  const doc = useMemo(
    () => <ModernCleanTemplate resume={debouncedResume ?? FALLBACK_RESUME} />,
    [debouncedResume],
  )

  const [instance, update] = usePDF({ document: doc })

  useEffect(() => {
    update(doc)
  }, [doc, update])

  return (
    <div className="relative flex h-full flex-col bg-muted p-4">
      <div className="relative flex-1 overflow-hidden rounded border border-border bg-background shadow-sm">
        {instance.url ? (
          <iframe
            src={instance.url}
            className="h-full w-full border-0"
            title="Resume PDF preview"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading preview" />
          </div>
        )}
        {instance.loading && instance.url ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Updating preview" />
          </div>
        ) : null}
        {instance.error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-4 text-center text-[13px] text-destructive">
            Preview failed to render. Your data is safe — try editing again to retry.
          </div>
        ) : null}
      </div>
    </div>
  )
}
