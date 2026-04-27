'use client'
import { useAppStore } from '@/lib/store'
import { AddEntryButton } from './add-entry-button'
import { SkillGroup } from './skill-group'

export function SkillsSection() {
  const skills = useAppStore((s) => s.resume?.sections.skills ?? [])
  const addSkillGroup = useAppStore((s) => s.addSkillGroup)
  return (
    <section aria-labelledby="skills-heading" className="mt-6 px-4">
      <h3 id="skills-heading" className="text-[13px] font-semibold text-foreground">Skills</h3>
      <div className="mt-2 flex flex-col gap-2">
        {skills.map((group, i) => (
          <SkillGroup key={i} group={group} index={i} />
        ))}
      </div>
      <AddEntryButton label="Add Skill Group" onClick={addSkillGroup} />
    </section>
  )
}
