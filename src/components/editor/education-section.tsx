'use client'
import { useAppStore } from '@/lib/store'
import { AddEntryButton } from './add-entry-button'
import { EducationEntry } from './education-entry'

export function EducationSection() {
  const education = useAppStore((s) => s.resume?.sections.education ?? [])
  const addEducation = useAppStore((s) => s.addEducation)
  return (
    <section aria-labelledby="edu-heading" className="mt-6 px-4">
      <h3 id="edu-heading" className="text-[13px] font-semibold text-foreground">Education</h3>
      <div className="mt-2 flex flex-col gap-2">
        {education.map((entry) => (
          <EducationEntry key={entry.id} entry={entry} />
        ))}
      </div>
      <AddEntryButton label="Add Education" onClick={addEducation} />
    </section>
  )
}
