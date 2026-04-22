import { Node } from '@tiptap/core'

export const SummarySectionNode = Node.create({
  name: 'summarySection',
  group: 'block',
  content: 'paragraph+',
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-type="summary-section"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'summary-section', ...HTMLAttributes }, 0]
  },
})
