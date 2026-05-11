'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { computeAtsScore } from '@/lib/scoring/ats-scorer'

const DEBOUNCE_MS = 300

export function useAtsScore(): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsubscribe = useAppStore.subscribe((state, prevState) => {
      const resumeChanged = state.resume !== prevState.resume
      const keywordsChanged = state.keywords !== prevState.keywords

      if (!resumeChanged && !keywordsChanged) return

      if (!state.keywords || !state.resume) {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
        useAppStore.getState().clearScore()
        return
      }

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const { resume, keywords } = useAppStore.getState()
        if (!resume || !keywords) return
        const score = computeAtsScore(resume, keywords)
        useAppStore.getState().setScore(score)
        timerRef.current = null
      }, DEBOUNCE_MS)
    })

    return () => {
      unsubscribe()
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])
}
