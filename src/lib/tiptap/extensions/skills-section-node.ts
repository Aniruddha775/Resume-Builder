import { Node } from '@tiptap/core'

export const SkillsSectionNode = Node.create({
  name: 'skillsSection',
  group: 'block',
  content: 'skillsBlock*',
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-type="skills-section"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'skills-section', ...HTMLAttributes }, 0]
  },
})
