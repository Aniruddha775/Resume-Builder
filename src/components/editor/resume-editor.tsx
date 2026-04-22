'use client'
import { useEditor, type Content } from '@tiptap/react'
import { useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { resumeExtensions } from '@/lib/tiptap/extensions'
import { sectionsToTiptapJson } from '@/lib/tiptap/schema'
import { ContactForm } from './contact-form'
import { SummarySection } from './summary-section'
import { ExperienceSection } from './experience-section'
import { EducationSection } from './education-section'
import { SkillsSection } from './skills-section'

export function ResumeEditor() {
  const resume = useAppStore((s) => s.resume)
  const setResumeFromTiptap = useAppStore((s) => s.setResumeFromTiptap)

  const initialContent = useMemo(
    () => (resume ? sectionsToTiptapJson(resume.sections) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const editor = useEditor({
    extensions: resumeExtensions,
    content: initialContent as Content | undefined,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none outline-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      setResumeFromTiptap(editor.getJSON())
    },
  })

  if (!resume) return null

  return (
    <div className="flex flex-col pb-8">
      <ContactForm />
      <SummarySection editor={editor} />
      <ExperienceSection editor={editor} />
      <EducationSection />
      <SkillsSection />
    </div>
  )
}
