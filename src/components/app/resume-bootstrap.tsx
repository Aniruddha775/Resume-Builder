'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { createStorageAdapter } from '@/lib/storage/adapter'
import { SAMPLE_RESUME } from '@/data/sample-resume'
import { useAutosave } from '@/hooks/use-autosave'
import { useHydration } from '@/hooks/use-hydration'

export function ResumeBootstrap({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration()
  const resume = useAppStore((s) => s.resume)
  const setResume = useAppStore((s) => s.setResume)
  const bumpLastSaved = useAppStore((s) => s.bumpLastSaved)

  useEffect(() => {
    if (!hydrated) return
    if (resume !== null) return
    const adapter = createStorageAdapter()
    let cancelled = false
    adapter.listResumes().then((resumes) => {
      if (cancelled) return
      if (resumes.length > 0) {
        setResume(resumes[0]!)
      } else {
        setResume(SAMPLE_RESUME)
      }
    })
    return () => {
      cancelled = true
    }
  }, [hydrated, resume, setResume])

  useAutosave(() => {
    bumpLastSaved()
  })

  return <>{children}</>
}
