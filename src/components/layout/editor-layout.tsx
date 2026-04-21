'use client'
import { useMediaQuery } from '@/hooks/use-media-query'
import { DesktopLayout } from './desktop-layout'
import { MobileLayout } from './mobile-layout'

export function EditorLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  if (isDesktop === undefined) return null
  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}
