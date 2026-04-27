import { Node } from '@tiptap/core'

export const SkillGroupNode = Node.create({
  name: 'skillGroup',
  group: 'skillsBlock',
  content: 'paragraph*',
  defining: true,
  isolating: true,
  addAttributes() {
    return { groupIndex: { default: null } }
  },
  parseHTML() {
    return [{ tag: 'div[data-type="skill-group"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'skill-group', ...HTMLAttributes }, 0]
  },
})
