import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { SummarySectionNode } from './extensions/summary-section-node'
import { ExperienceListNode } from './extensions/experience-list-node'
import { ExperienceEntryNode } from './extensions/experience-entry-node'
import { EducationListNode } from './extensions/education-list-node'
import { EducationEntryNode } from './extensions/education-entry-node'
import { SkillsSectionNode } from './extensions/skills-section-node'
import { SkillGroupNode } from './extensions/skill-group-node'

export const resumeExtensions = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    codeBlock: false,
    code: false,
    horizontalRule: false,
    strike: false,
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'summarySection') return 'Write a 2-3 sentence professional summary...'
      if (node.type.name === 'paragraph') return 'Write a 2-3 sentence professional summary...'
      if (node.type.name === 'listItem') return 'Describe your impact — use action verbs and metrics'
      return ''
    },
  }),
  SummarySectionNode,
  ExperienceListNode,
  ExperienceEntryNode,
  EducationListNode,
  EducationEntryNode,
  SkillsSectionNode,
  SkillGroupNode,
]
