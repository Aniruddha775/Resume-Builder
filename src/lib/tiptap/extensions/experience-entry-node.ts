import { Node } from '@tiptap/core'

export const ExperienceEntryNode = Node.create({
  name: 'experienceEntry',
  group: 'experienceBlock',
  content: 'bulletList',
  defining: true,
  isolating: true,
  addAttributes() {
    return { entryId: { default: null } }
  },
  parseHTML() {
    return [{ tag: 'div[data-type="experience-entry"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'experience-entry', ...HTMLAttributes }, 0]
  },
})
