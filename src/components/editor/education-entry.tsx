'use client'
import { useAppStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DeleteButton } from './delete-button'
import type { Education } from '@/types/resume'

interface EducationEntryProps { entry: Education }

export function EducationEntry({ entry }: EducationEntryProps) {
  const updateEducation = useAppStore((s) => s.updateEducation)
  const removeEducation = useAppStore((s) => s.removeEducation)
  return (
    <div className="group relative rounded border border-transparent px-4 py-3 hover:border-border">
      <div className="absolute right-2 top-2">
        <DeleteButton
          onClick={() => removeEducation(entry.id)}
          ariaLabel={`Delete education entry ${entry.institution || 'untitled'}`}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label className="text-[13px] font-semibold">Institution</Label>
          <Input value={entry.institution} onChange={(e) => updateEducation(entry.id, { institution: e.target.value })} />
        </div>
        <div>
          <Label className="text-[13px] font-semibold">Degree</Label>
          <Input value={entry.degree} onChange={(e) => updateEducation(entry.id, { degree: e.target.value })} />
        </div>
        <div>
          <Label className="text-[13px] font-semibold">Field</Label>
          <Input value={entry.field} onChange={(e) => updateEducation(entry.id, { field: e.target.value })} />
        </div>
        <div>
          <Label className="text-[13px] font-semibold">Graduation</Label>
          <Input
            placeholder="YYYY-MM"
            value={entry.graduationDate}
            onChange={(e) => updateEducation(entry.id, { graduationDate: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-[13px] font-semibold">GPA</Label>
          <Input
            placeholder="GPA (optional)"
            value={entry.gpa ?? ''}
            onChange={(e) => updateEducation(entry.id, { gpa: e.target.value || undefined })}
          />
        </div>
      </div>
    </div>
  )
}
