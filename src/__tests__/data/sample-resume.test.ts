import { describe, it, expect } from 'vitest'
import { SAMPLE_RESUME } from '@/data/sample-resume'
import { ResumeSchema } from '@/types/resume'

describe('SAMPLE_RESUME fixture', () => {
  it('validates against ResumeSchema', () => {
    const result = ResumeSchema.safeParse(SAMPLE_RESUME)
    expect(result.success).toBe(true)
  })

  it('has 2 experience entries with at least 3 bullets each', () => {
    expect(SAMPLE_RESUME.sections.experience).toHaveLength(2)
    for (const exp of SAMPLE_RESUME.sections.experience) {
      expect(exp.bullets.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('has exactly 1 education entry', () => {
    expect(SAMPLE_RESUME.sections.education).toHaveLength(1)
  })

  it('has 3 skill groups', () => {
    expect(SAMPLE_RESUME.sections.skills).toHaveLength(3)
  })

  it('fullName is Alex Johnson', () => {
    expect(SAMPLE_RESUME.sections.contactInfo.fullName).toBe('Alex Johnson')
  })

  it('current experience has endDate null and current true', () => {
    const current = SAMPLE_RESUME.sections.experience.find((e) => e.current)
    expect(current).toBeDefined()
    expect(current!.endDate).toBeNull()
  })
})
