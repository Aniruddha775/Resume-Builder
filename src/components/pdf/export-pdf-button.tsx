'use client'
import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { ModernCleanTemplate } from './templates/modern-clean-template'
import { downloadBlob, buildResumeFilename } from '@/lib/pdf/download'
import '@/lib/pdf/fonts'

export function ExportPdfButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    const resume = useAppStore.getState().resume
    if (!resume) return
    setIsExporting(true)
    try {
      const blob = await pdf(<ModernCleanTemplate resume={resume} />).toBlob()
      const filename = buildResumeFilename(resume.sections.contactInfo.fullName)
      downloadBlob(blob, filename)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      aria-label="Export resume as PDF"
      type="button"
    >
      <Download className="mr-1 h-4 w-4" />
      {isExporting ? 'Downloading...' : 'Export PDF'}
    </Button>
  )
}
