import { Node } from '@tiptap/core'

export const EducationEntryNode = Node.create({
  name: 'educationEntry',
  group: 'educationBlock',
  content: 'paragraph*',
  defining: true,
  isolating: true,
  addAttributes() {
    return { entryId: { default: null } }
  },
  parseHTML() {
    return [{ tag: 'div[data-type="education-entry"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'education-entry', ...HTMLAttributes }, 0]
  },
})
