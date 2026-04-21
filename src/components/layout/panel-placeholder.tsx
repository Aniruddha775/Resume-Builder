'use client'
import type { LucideIcon } from 'lucide-react'

interface PanelPlaceholderProps {
  icon: LucideIcon
  heading: string
  body: string
}

export function PanelPlaceholder({ icon: Icon, heading, body }: PanelPlaceholderProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <Icon className="mb-4 h-12 w-12 text-muted-foreground/40" />
      <h3 className="mb-1 text-sm font-semibold text-foreground">{heading}</h3>
      <p className="max-w-[280px] text-center text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
