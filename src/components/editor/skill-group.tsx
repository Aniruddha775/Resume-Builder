'use client'
import { useState, type KeyboardEvent } from 'react'
import { useAppStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { DeleteButton } from './delete-button'
import type { Skills } from '@/types/resume'

interface SkillGroupProps { group: Skills; index: number }

export function SkillGroup({ group, index }: SkillGroupProps) {
  const [draft, setDraft] = useState('')
  const updateSkillGroup = useAppStore((s) => s.updateSkillGroup)
  const removeSkillGroup = useAppStore((s) => s.removeSkillGroup)

  const commitDraft = () => {
    const token = draft.trim()
    if (!token) { setDraft(''); return }
    if (group.items.includes(token)) { setDraft(''); return }
    updateSkillGroup(index, { items: [...group.items, token] })
    setDraft('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitDraft()
    }
  }

  const removeItem = (item: string) => {
    updateSkillGroup(index, { items: group.items.filter((i) => i !== item) })
  }

  return (
    <div className="group relative rounded border border-transparent px-4 py-3 hover:border-border">
      <div className="absolute right-2 top-2">
        <DeleteButton
          onClick={() => removeSkillGroup(index)}
          ariaLabel={`Delete skill group ${group.category || 'untitled'}`}
        />
      </div>
      <Label className="text-[13px] font-semibold">Category</Label>
      <Input
        placeholder="Category (e.g. Languages)"
        value={group.category}
        onChange={(e) => updateSkillGroup(index, { category: e.target.value })}
      />
      <Label className="mt-3 text-[13px] font-semibold">Skills</Label>
      <Input
        value={draft}
        placeholder="Type a skill and press Enter or comma"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
      />
      <div className="mt-2 flex flex-wrap gap-1">
        {group.items.map((item) => (
          <Badge key={item} variant="secondary" className="pl-2 pr-1 text-[12px]">
            {item}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove skill ${item}`}
              className="ml-1 h-4 w-4 p-0"
              onClick={() => removeItem(item)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
