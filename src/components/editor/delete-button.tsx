'use client'
import { Trash2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface DeleteButtonProps {
  onClick: () => void
  ariaLabel: string
}

export function DeleteButton({ onClick, ariaLabel }: DeleteButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="invisible flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:text-destructive focus-visible:visible focus-visible:outline-2 focus-visible:outline-ring/50 group-hover:visible"
      >
        <Trash2 className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent>Delete</TooltipContent>
    </Tooltip>
  )
}
