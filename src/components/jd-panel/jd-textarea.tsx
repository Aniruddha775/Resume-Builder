'use client'

import { useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const MAX_CHARS = 10_000

interface JdTextareaProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function JdTextarea({ value, onChange, onClear }: JdTextareaProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value.slice(0, MAX_CHARS))
    },
    [onChange]
  )

  return (
    <div className="flex flex-col gap-1">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste the full job description here…"
        className="min-h-[180px] resize-none text-sm"
        aria-label="Job description"
        aria-describedby="jd-char-count"
        maxLength={MAX_CHARS}
      />
      <div className="flex items-center justify-between px-1">
        <span
          id="jd-char-count"
          className="text-[11px] text-muted-foreground"
          aria-live="polite"
        >
          {value.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
        {value.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            aria-label="Clear job description"
            className="h-6 px-2 text-[11px]"
          >
            <X className="h-3 w-3 mr-1" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
