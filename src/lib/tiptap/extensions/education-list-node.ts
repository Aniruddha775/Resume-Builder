import { Node } from '@tiptap/core'

export const EducationListNode = Node.create({
  name: 'educationList',
  group: 'block',
  content: 'educationBlock*',
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-type="education-list"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'education-list', ...HTMLAttributes }, 0]
  },
})
