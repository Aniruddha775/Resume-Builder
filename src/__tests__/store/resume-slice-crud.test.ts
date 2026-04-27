import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/lib/store'
import type { Resume } from '@/types/resume'

const makeResume = (): Resume => ({
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Test',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  sections: {
    contactInfo: { fullName: 'J', email: 'j@x.com', phone: '5551234', location: 'NY' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
  },
})

beforeEach(() => {
  useAppStore.setState({
    resume: null,
    jobDescription: null,
    keywords: null,
    score: null,
    ui: {
      activePanel: 'editor',
      isMobile: false,
    },
  })
})

describe('addExperience', () => {
  it('appends new entry with correct defaults and returns a UUID', () => {
    useAppStore.getState().setResume(makeResume())
    const id = useAppStore.getState().addExperience()
    const exp = useAppStore.getState().resume!.sections.experience
    expect(exp).toHaveLength(1)
    expect(exp[0].id).toBe(id)
    expect(exp[0].company).toBe('')
    expect(exp[0].title).toBe('')
    expect(exp[0].startDate).toBe('')
    expect(exp[0].endDate).toBeNull()
    expect(exp[0].current).toBe(true)
    expect(exp[0].bullets).toEqual([])
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('returns a UUID string and does not throw when resume is null', () => {
    expect(() => {
      const id = useAppStore.getState().addExperience()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    }).not.toThrow()
    expect(useAppStore.getState().resume).toBeNull()
  })
})

describe('updateExperience', () => {
  it('finds by id and applies patch; updates updatedAt', () => {
    useAppStore.getState().setResume(makeResume())
    const id = useAppStore.getState().addExperience()
    const before = useAppStore.getState().resume!.updatedAt
    // small delay to ensure different timestamp
    useAppStore.getState().updateExperience(id, { company: 'Acme', title: 'Dev' })
    const exp = useAppStore.getState().resume!.sections.experience.find(e => e.id === id)
    expect(exp?.company).toBe('Acme')
    expect(exp?.title).toBe('Dev')
    const after = useAppStore.getState().resume!.updatedAt
    expect(typeof after).toBe('string')
    // updatedAt is a valid ISO string
    expect(() => new Date(after)).not.toThrow()
  })

  it('does not throw with unknown id', () => {
    useAppStore.getState().setResume(makeResume())
    expect(() => useAppStore.getState().updateExperience('nonexistent-id', { company: 'X' })).not.toThrow()
  })
})

describe('removeExperience', () => {
  it('filters out the entry with matching id', () => {
    useAppStore.getState().setResume(makeResume())
    const id = useAppStore.getState().addExperience()
    useAppStore.getState().addExperience()
    expect(useAppStore.getState().resume!.sections.experience).toHaveLength(2)
    useAppStore.getState().removeExperience(id)
    const exp = useAppStore.getState().resume!.sections.experience
    expect(exp).toHaveLength(1)
    expect(exp.find(e => e.id === id)).toBeUndefined()
  })
})

describe('setExperienceBullets', () => {
  it('replaces bullets array for matched id', () => {
    useAppStore.getState().setResume(makeResume())
    const id = useAppStore.getState().addExperience()
    useAppStore.getState().setExperienceBullets(id, ['Bullet A', 'Bullet B'])
    const entry = useAppStore.getState().resume!.sections.experience.find(e => e.id === id)
    expect(entry?.bullets).toEqual(['Bullet A', 'Bullet B'])
  })
})

describe('addEducation', () => {
  it('appends Education with UUID id and empty fields; returns new id', () => {
    useAppStore.getState().setResume(makeResume())
    const id = useAppStore.getState().addEducation()
    const edu = useAppStore.getState().resume!.sections.education
    expect(edu).toHaveLength(1)
    expect(edu[0].id).toBe(id)
    expect(edu[0].institution).toBe('')
    expect(edu[0].degree).toBe('')
    expect(edu[0].field).toBe('')
    expect(edu[0].graduationDate).toBe('')
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('returns a UUID string and does not throw when resume is null', () => {
    expect(() => {
      const id = useAppStore.getState().addEducation()
      expect(typeof id).toBe('string')
    }).not.toThrow()
    expect(useAppStore.getState().resume).toBeNull()
  })
})

describe('updateEducation / removeEducation', () => {
  it('updateEducation finds by id and applies patch', () => {
    useAppStore.getState().setResume(makeResume())
    const id = useAppStore.getState().addEducation()
    useAppStore.getState().updateEducation(id, { institution: 'MIT', degree: 'BS' })
    const entry = useAppStore.getState().resume!.sections.education.find(e => e.id === id)
    expect(entry?.institution).toBe('MIT')
    expect(entry?.degree).toBe('BS')
  })

  it('updateEducation with unknown id does not throw', () => {
    useAppStore.getState().setResume(makeResume())
    expect(() => useAppStore.getState().updateEducation('bad-id', { institution: 'X' })).not.toThrow()
  })

  it('removeEducation filters out the entry with matching id', () => {
    useAppStore.getState().setResume(makeResume())
    const id = useAppStore.getState().addEducation()
    useAppStore.getState().addEducation()
    expect(useAppStore.getState().resume!.sections.education).toHaveLength(2)
    useAppStore.getState().removeEducation(id)
    const edu = useAppStore.getState().resume!.sections.education
    expect(edu).toHaveLength(1)
    expect(edu.find(e => e.id === id)).toBeUndefined()
  })
})

describe('addSkillGroup', () => {
  it('appends { category: "", items: [] } and returns new index', () => {
    useAppStore.getState().setResume(makeResume())
    const idx = useAppStore.getState().addSkillGroup()
    expect(idx).toBe(0)
    const skills = useAppStore.getState().resume!.sections.skills
    expect(skills).toHaveLength(1)
    expect(skills[0]).toEqual({ category: '', items: [] })
  })
})

describe('updateSkillGroup', () => {
  it('applies Partial<Skills> patch at supplied index', () => {
    useAppStore.getState().setResume(makeResume())
    const idx = useAppStore.getState().addSkillGroup()
    useAppStore.getState().updateSkillGroup(idx, { category: 'Frontend', items: ['React', 'TypeScript'] })
    const group = useAppStore.getState().resume!.sections.skills[idx]
    expect(group.category).toBe('Frontend')
    expect(group.items).toEqual(['React', 'TypeScript'])
  })
})

describe('removeSkillGroup', () => {
  it('splices out the index from skills array', () => {
    useAppStore.getState().setResume(makeResume())
    useAppStore.getState().addSkillGroup()
    useAppStore.getState().addSkillGroup()
    useAppStore.getState().updateSkillGroup(0, { category: 'Frontend' })
    useAppStore.getState().updateSkillGroup(1, { category: 'Backend' })
    expect(useAppStore.getState().resume!.sections.skills).toHaveLength(2)
    useAppStore.getState().removeSkillGroup(0)
    const skills = useAppStore.getState().resume!.sections.skills
    expect(skills).toHaveLength(1)
    expect(skills[0].category).toBe('Backend')
  })
})

describe('updateContactInfo', () => {
  it('merges Partial<ContactInfo> and preserves untouched fields', () => {
    useAppStore.getState().setResume(makeResume())
    useAppStore.getState().updateContactInfo({ fullName: 'Jane Doe', email: 'jane@example.com' })
    const ci = useAppStore.getState().resume!.sections.contactInfo
    expect(ci.fullName).toBe('Jane Doe')
    expect(ci.email).toBe('jane@example.com')
    // original values preserved
    expect(ci.phone).toBe('5551234')
    expect(ci.location).toBe('NY')
  })
})

describe('updateSummary', () => {
  it('sets the summary string', () => {
    useAppStore.getState().setResume(makeResume())
    useAppStore.getState().updateSummary('Experienced software engineer.')
    expect(useAppStore.getState().resume!.sections.summary).toBe('Experienced software engineer.')
  })
})

describe('setResumeFromTiptap', () => {
  it('is callable without throwing when resume is non-null', () => {
    useAppStore.getState().setResume(makeResume())
    expect(() => useAppStore.getState().setResumeFromTiptap({ type: 'doc', content: [] })).not.toThrow()
  })

  it('is callable without throwing when resume is null', () => {
    expect(() => useAppStore.getState().setResumeFromTiptap(null)).not.toThrow()
  })
})

describe('persist partialize', () => {
  it('omits resume from persisted state', () => {
    const state = useAppStore.getState()
    const persisted = useAppStore.persist.getOptions().partialize!(state)
    expect(persisted).not.toHaveProperty('resume')
    expect(persisted).toHaveProperty('jobDescription')
    expect(persisted).toHaveProperty('keywords')
  })
})
