'use client'
import { useAppStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { DeleteButton } from './delete-button'
import type { Experience } from '@/types/resume'

interface ExperienceEntryProps { entry: Experience }

export function ExperienceEntry({ entry }: ExperienceEntryProps) {
  const updateExperience = useAppStore((s) => s.updateExperience)
  const removeExperience = useAppStore((s) => s.removeExperience)
  const setExperienceBullets = useAppStore((s) => s.setExperienceBullets)

  const handleCurrentChange = (checked: boolean) => {
    if (checked) {
      updateExperience(entry.id, { current: true, endDate: null })
    } else {
      updateExperience(entry.id, { current: false, endDate: '' })
    }
  }

  const updateBullet = (index: number, text: string) => {
    const next = [...entry.bullets]
    next[index] = text
    setExperienceBullets(entry.id, next)
  }
  const addBullet = () => setExperienceBullets(entry.id, [...entry.bullets, ''])
  const removeBullet = (index: number) => {
    const next = entry.bullets.filter((_, i) => i !== index)
    setExperienceBullets(entry.id, next)
  }

  return (
    <div className="group relative rounded border border-transparent px-4 py-3 hover:border-border">
      <div className="absolute right-2 top-2">
        <DeleteButton
          onClick={() => removeExperience(entry.id)}
          ariaLabel={`Delete experience entry ${entry.company || 'untitled'}`}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label className="text-[13px] font-semibold">Company</Label>
          <Input value={entry.company} onChange={(e) => updateExperience(entry.id, { company: e.target.value })} />
        </div>
        <div>
          <Label className="text-[13px] font-semibold">Title</Label>
          <Input value={entry.title} onChange={(e) => updateExperience(entry.id, { title: e.target.value })} />
        </div>
        <div>
          <Label className="text-[13px] font-semibold">Start Date</Label>
          <Input
            placeholder="YYYY-MM"
            value={entry.startDate}
            onChange={(e) => updateExperience(entry.id, { startDate: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-[13px] font-semibold">End Date</Label>
          <Input
            placeholder="YYYY-MM"
            value={entry.endDate ?? ''}
            disabled={entry.current}
            className={entry.current ? 'cursor-not-allowed bg-muted opacity-50' : ''}
            onChange={(e) => updateExperience(entry.id, { endDate: e.target.value, current: false })}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Checkbox
          id={`current-${entry.id}`}
          checked={entry.current}
          onCheckedChange={(checked) => handleCurrentChange(checked === true)}
        />
        <Label htmlFor={`current-${entry.id}`} className="text-[13px]">Current</Label>
      </div>
      <div className="mt-3">
        <Label className="text-[13px] font-semibold">Bullets</Label>
        <ul className="mt-1 space-y-1">
          {entry.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden className="mt-2 text-muted-foreground">•</span>
              <Input
                value={b}
                placeholder="Describe your impact — use action verbs and metrics"
                onChange={(e) => updateBullet(i, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Delete bullet ${i + 1}`}
                onClick={() => removeBullet(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        <Button type="button" variant="ghost" size="sm" className="mt-1 text-[13px]" onClick={addBullet}>
          <Plus className="mr-1 h-4 w-4" /> Add bullet
        </Button>
      </div>
    </div>
  )
}
