'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { SavedIndicator, useSavedFlash } from '@/components/editor/saved-indicator'

export function AppHeader() {
  const lastSavedToken = useAppStore((s) => s.ui.lastSavedToken)
  const { visible, trigger } = useSavedFlash(2000)

  useEffect(() => {
    if (lastSavedToken > 0) trigger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSavedToken])

  return (
    <header className="flex h-12 items-center border-b border-border bg-muted px-4">
      <h1 className="text-xl font-semibold text-foreground">Rese</h1>
      <SavedIndicator visible={visible} />
    </header>
  )
}
