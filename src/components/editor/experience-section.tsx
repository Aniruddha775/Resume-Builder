'use client'
import type { Editor } from '@tiptap/react'
import { useAppStore } from '@/lib/store'
import { AddEntryButton } from './add-entry-button'
import { ExperienceEntry } from './experience-entry'

interface ExperienceSectionProps { editor: Editor | null }

export function ExperienceSection({ editor: _editor }: ExperienceSectionProps) {
  const experience = useAppStore((s) => s.resume?.sections.experience ?? [])
  const addExperience = useAppStore((s) => s.addExperience)
  return (
    <section aria-labelledby="exp-heading" className="mt-6 px-4">
      <h3 id="exp-heading" className="text-[13px] font-semibold text-foreground">Experience</h3>
      <div className="mt-2 flex flex-col gap-2">
        {experience.map((entry) => (
          <ExperienceEntry key={entry.id} entry={entry} />
        ))}
      </div>
      <AddEntryButton label="Add Position" onClick={addExperience} />
    </section>
  )
}
