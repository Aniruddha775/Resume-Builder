import { describe, it, expect } from 'vitest'
import { tiptapJsonToSections, sectionsToTiptapJson } from '@/lib/tiptap/schema'
import type { ResumeSections } from '@/types/resume'

const EMPTY_SECTIONS: ResumeSections = {
  contactInfo: { fullName: 'A', email: 'a@x.com', phone: '5551234', location: 'NY' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
}

describe('tiptapJsonToSections', () => {
  it('extracts summary text from summarySection', () => {
    const doc = { type: 'doc', content: [
      { type: 'summarySection', content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] },
      ] },
    ] }
    const result = tiptapJsonToSections(doc, EMPTY_SECTIONS)
    expect(result.summary).toBe('Hello world')
  })

  it('extracts bullets and preserves non-bullet fields from existing', () => {
    const existing = {
      ...EMPTY_SECTIONS,
      experience: [{ id: 'abc', company: 'Acme', title: 'SE', startDate: '2020-01', endDate: null, current: true, bullets: [] }],
    }
    const doc = { type: 'doc', content: [
      { type: 'experienceList', content: [
        { type: 'experienceEntry', attrs: { entryId: 'abc' }, content: [
          { type: 'bulletList', content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Led migration' }] }] },
          ] },
        ] },
      ] },
    ] }
    const result = tiptapJsonToSections(doc, existing)
    expect(result.experience?.[0].bullets).toEqual(['Led migration'])
    expect(result.experience?.[0].company).toBe('Acme')
  })

  it('ignores inline marks — bold/italic text extracts as plain string', () => {
    const existing = {
      ...EMPTY_SECTIONS,
      experience: [{ id: 'abc', company: 'X', title: 'Y', startDate: '2020-01', endDate: null, current: true, bullets: [] }],
    }
    const doc = { type: 'doc', content: [
      { type: 'experienceList', content: [
        { type: 'experienceEntry', attrs: { entryId: 'abc' }, content: [
          { type: 'bulletList', content: [
            { type: 'listItem', content: [
              { type: 'paragraph', content: [
                { type: 'text', text: 'Led ', marks: [{ type: 'bold' }] },
                { type: 'text', text: 'migration' },
              ] },
            ] },
          ] },
        ] },
      ] },
    ] }
    const result = tiptapJsonToSections(doc, existing)
    expect(result.experience?.[0].bullets).toEqual(['Led migration'])
  })

  it('returns existing summary when doc has no summarySection', () => {
    const existing = { ...EMPTY_SECTIONS, summary: 'Previous summary' }
    const result = tiptapJsonToSections({ type: 'doc', content: [] }, existing)
    expect(result.summary).toBe('Previous summary')  // fallback to existing
    expect(result.experience).toEqual([])
  })

  it('does not modify contact info or skills (form-owned)', () => {
    const existing = {
      ...EMPTY_SECTIONS,
      skills: [{ category: 'Languages', items: ['TypeScript'] }],
    }
    const doc = { type: 'doc', content: [] }
    const result = tiptapJsonToSections(doc, existing)
    expect(result.skills).toBeUndefined()
    expect(result).not.toHaveProperty('contactInfo')
  })
})

describe('sectionsToTiptapJson', () => {
  it('builds a doc with summarySection containing the summary text', () => {
    const sections: ResumeSections = { ...EMPTY_SECTIONS, summary: 'My summary' }
    const doc = sectionsToTiptapJson(sections) as { content: Array<{ type: string; content: Array<{ content: Array<{ text: string }> }> }> }
    const summaryNode = doc.content.find((n) => n.type === 'summarySection')
    expect(summaryNode).toBeDefined()
    expect(summaryNode.content[0].content[0].text).toBe('My summary')
  })

  it('round-trips summary and experience bullets', () => {
    const sections: ResumeSections = {
      ...EMPTY_SECTIONS,
      summary: 'Sample summary.',
      experience: [
        { id: 'x', company: 'Acme', title: 'SE', startDate: '2020-01', endDate: null, current: true, bullets: ['A', 'B'] },
      ],
    }
    const tiptap = sectionsToTiptapJson(sections)
    const back = tiptapJsonToSections(tiptap, sections)
    expect(back.summary).toBe('Sample summary.')
    expect(back.experience?.[0].bullets).toEqual(['A', 'B'])
    expect(back.experience?.[0].company).toBe('Acme')
  })
})
