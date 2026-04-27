'use client'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AddEntryButtonProps {
  label: string
  onClick: () => void
}

export function AddEntryButton({ label, onClick }: AddEntryButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="mt-8 mb-4 w-full justify-center text-[13px] font-semibold"
      type="button"
    >
      <Plus className="mr-1 h-4 w-4" />
      {label}
    </Button>
  )
}
