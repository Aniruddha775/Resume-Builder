import type { ResumeSections } from '@/types/resume'

type TiptapNode = {
  type: string
  content?: TiptapNode[]
  attrs?: Record<string, unknown>
  text?: string
  marks?: Array<{ type: string }>
}

function extractInlineText(inline: TiptapNode[] | undefined): string {
  if (!inline) return ''
  return inline
    .map((n) => {
      if (n?.type === 'text' && typeof n.text === 'string') return n.text
      if (n?.type === 'hardBreak') return '\n'
      return ''
    })
    .join('')
}

function extractBullets(bulletListNode: TiptapNode): string[] {
  if (!bulletListNode || bulletListNode.type !== 'bulletList' || !Array.isArray(bulletListNode.content)) return []
  return bulletListNode.content
    .filter((n) => n?.type === 'listItem')
    .map((listItem) => {
      const firstPara = listItem.content?.find((c) => c?.type === 'paragraph')
      return extractInlineText(firstPara?.content)
    })
}

function extractSummary(summarySectionNode: TiptapNode): string {
  if (!summarySectionNode || !Array.isArray(summarySectionNode.content)) return ''
  return summarySectionNode.content
    .filter((n) => n?.type === 'paragraph')
    .map((p) => extractInlineText(p.content))
    .join('\n')
}

export function tiptapJsonToSections(
  json: unknown,
  existing: ResumeSections,
): Partial<ResumeSections> {
  const doc = json as { type?: string; content?: TiptapNode[] } | null
  if (!doc || !Array.isArray(doc.content)) return {}

  const summaryNode = doc.content.find((n) => n?.type === 'summarySection')
  const summary = summaryNode ? extractSummary(summaryNode) : existing.summary

  const experienceListNode = doc.content.find((n) => n?.type === 'experienceList')
  let experience = existing.experience
  if (experienceListNode && Array.isArray(experienceListNode.content)) {
    const entryNodes = experienceListNode.content.filter((n) => n?.type === 'experienceEntry')
    experience = existing.experience.map((exp) => {
      const match = entryNodes.find((n) => n.attrs?.entryId === exp.id)
      if (!match) return exp
      const bulletListChild = match.content?.find((c) => c?.type === 'bulletList')
      const bullets = bulletListChild ? extractBullets(bulletListChild) : []
      return { ...exp, bullets }
    })
  }

  // Phase 2: education entries have no Tiptap-editable prose content (only marker nodes).
  // Education data is entirely form-controlled. If Phase 4 adds prose to education entries,
  // this line must be updated to extract from the educationList node.
  const education = existing.education

  return { summary, experience, education }
}

export function sectionsToTiptapJson(sections: ResumeSections): unknown {
  const summaryPara = sections.summary
    ? { type: 'paragraph', content: [{ type: 'text', text: sections.summary }] }
    : { type: 'paragraph' }

  return {
    type: 'doc',
    content: [
      { type: 'summarySection', content: [summaryPara] },
      {
        type: 'experienceList',
        content: sections.experience.map((exp) => ({
          type: 'experienceEntry',
          attrs: { entryId: exp.id },
          content: [
            {
              type: 'bulletList',
              content: exp.bullets.length === 0
                ? [{ type: 'listItem', content: [{ type: 'paragraph' }] }]
                : exp.bullets.map((text) => ({
                    type: 'listItem',
                    content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
                  })),
            },
          ],
        })),
      },
      {
        type: 'educationList',
        content: sections.education.map((edu) => ({
          type: 'educationEntry',
          attrs: { entryId: edu.id },
          content: [{ type: 'paragraph' }],
        })),
      },
      {
        type: 'skillsSection',
        content: sections.skills.map((_, i) => ({
          type: 'skillGroup',
          attrs: { groupIndex: i },
          content: [{ type: 'paragraph' }],
        })),
      },
    ],
  }
}
