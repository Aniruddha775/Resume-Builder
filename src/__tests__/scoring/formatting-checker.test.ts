import { describe, it, expect } from 'vitest'
import { checkFormatting } from '@/lib/scoring/formatting-checker'
import type { Resume } from '@/types/resume'

function makeResume(overrides: Partial<Resume['sections']> = {}): Resume {
  return {
    id: 'test-id',
    title: 'Test Resume',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: {
      contactInfo: { fullName: 'Jane Doe', email: 'jane@example.com', phone: '', location: '' },
      summary: 'A motivated software engineer with 5+ years of experience building products.',
      experience: [{ id: 'exp-1', company: 'Acme', title: 'Engineer', startDate: '2020-01', endDate: null, current: true, bullets: ['Built things'] }],
      education: [{ id: 'edu-1', institution: 'MIT', degree: 'BS', field: 'Computer Science', graduationDate: '2018-05' }],
      skills: [{ category: 'Languages', items: ['TypeScript', 'Python'] }],
      ...overrides,
    },
  }
}

describe('checkFormatting', () => {
  it('returns 100% when all 5 sections present', () => {
    const result = checkFormatting(makeResume())
    expect(result.matched).toBe(5)
    expect(result.total).toBe(5)
    expect(result.percentage).toBe(100)
    expect(result.weightedScore).toBe(10)
    expect(result.weight).toBe(0.10)
    expect(result.category).toBe('Formatting')
  })
  it('fails when summary is empty', () => {
    expect(checkFormatting(makeResume({ summary: '' })).matched).toBe(4)
  })
  it('fails when summary is under 20 chars', () => {
    expect(checkFormatting(makeResume({ summary: 'Short summary' })).matched).toBe(4)
  })
  it('fails when experience is empty', () => {
    expect(checkFormatting(makeResume({ experience: [] })).matched).toBe(4)
  })
  it('fails when education is empty', () => {
    expect(checkFormatting(makeResume({ education: [] })).matched).toBe(4)
  })
  it('fails when skills is empty', () => {
    expect(checkFormatting(makeResume({ skills: [] })).matched).toBe(4)
  })
  it('fails when email is missing', () => {
    expect(checkFormatting(makeResume({ contactInfo: { fullName: 'Jane', email: '', phone: '', location: '' } })).matched).toBe(4)
  })
  it('fails when fullName is missing', () => {
    expect(checkFormatting(makeResume({ contactInfo: { fullName: '', email: 'jane@test.com', phone: '', location: '' } })).matched).toBe(4)
  })
  it('returns 0% when all checks fail', () => {
    const result = checkFormatting(makeResume({ contactInfo: { fullName: '', email: '', phone: '', location: '' }, summary: '', experience: [], education: [], skills: [] }))
    expect(result.matched).toBe(0)
    expect(result.percentage).toBe(0)
    expect(result.weightedScore).toBe(0)
  })
})
