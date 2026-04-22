'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { createStorageAdapter } from '@/lib/storage/adapter'

export const AUTOSAVE_INTERVAL_MS = 10_000

export function useAutosave(onSaved?: () => void) {
  useEffect(() => {
    const adapter = createStorageAdapter()
    const intervalId = setInterval(() => {
      const resume = useAppStore.getState().resume
      if (!resume) return
      void adapter.saveResume(resume).then(() => {
        onSaved?.()
      })
    }, AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [onSaved])
}
