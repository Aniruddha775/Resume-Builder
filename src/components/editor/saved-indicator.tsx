'use client'
import { useEffect, useState, useRef } from 'react'
import { Check } from 'lucide-react'

export function useSavedFlash(durationMs = 2000) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trigger = () => {
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), durationMs)
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  return { visible, trigger }
}

export function SavedIndicator({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <span
      role="status"
      aria-live="polite"
      className="ml-auto inline-flex items-center gap-1 text-[12px] text-muted-foreground"
    >
      <Check className="h-[14px] w-[14px] text-[--color-success]" aria-hidden />
      Saved
    </span>
  )
}
