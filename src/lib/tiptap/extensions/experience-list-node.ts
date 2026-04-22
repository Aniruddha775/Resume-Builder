import { Node } from '@tiptap/core'

export const ExperienceListNode = Node.create({
  name: 'experienceList',
  group: 'block',
  content: 'experienceBlock*',
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-type="experience-list"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'experience-list', ...HTMLAttributes }, 0]
  },
})
