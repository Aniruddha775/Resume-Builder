import { describe, it, expect } from 'vitest'
import { computeAtsScore, WEIGHTS } from '@/lib/scoring/ats-scorer'
import type { Resume } from '@/types/resume'
import type { KeywordSet } from '@/types/job-description'

function makeResume(overrides: Partial<Resume['sections']> = {}): Resume {
  return {
    id: 'test-id',
    title: 'Test Resume',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: {
      contactInfo: { fullName: 'Alex Johnson', email: 'alex@example.com', phone: '', location: '' },
      summary: 'A motivated software engineer with 5+ years of experience building TypeScript applications.',
      experience: [{ id: 'exp-1', company: 'Acme Corp', title: 'Senior Engineer', startDate: '2020-01', endDate: null, current: true, bullets: ['Built React applications with TypeScript', 'Used AWS for deployments'] }],
      education: [{ id: 'edu-1', institution: 'MIT', degree: 'BS', field: 'Computer Science', graduationDate: '2018-05' }],
      skills: [{ category: 'Languages', items: ['TypeScript', 'JavaScript', 'Python'] }],
      ...overrides,
    },
  }
}

function makeKeywords(overrides: Partial<KeywordSet> = {}): KeywordSet {
  return {
    hardRequirements: [{ term: 'TypeScript', category: 'hard', matched: false }],
    preferredSkills: [{ term: 'GraphQL', category: 'preferred', matched: false }],
    toolsAndTech: [{ term: 'React', category: 'tools', matched: false }],
    softSkills: [],
    ...overrides,
  }
}

describe('computeAtsScore', () => {
  it('weights sum to 1.00', () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1.00, 5)
  })
  it('hard=0.40, preferred=0.20, tools=0.20, soft=0.10, formatting=0.10', () => {
    expect(WEIGHTS.hardRequirements).toBe(0.40)
    expect(WEIGHTS.preferredSkills).toBe(0.20)
    expect(WEIGHTS.toolsAndTech).toBe(0.20)
    expect(WEIGHTS.softSkills).toBe(0.10)
    expect(WEIGHTS.formatting).toBe(0.10)
  })
  it('returns all required ScoreResult fields', () => {
    const result = computeAtsScore(makeResume(), makeKeywords())
    expect(result).toHaveProperty('totalScore')
    expect(result).toHaveProperty('breakdown')
    expect(result).toHaveProperty('matchedKeywords')
    expect(result).toHaveProperty('missingKeywords')
    expect(result).toHaveProperty('computedAt')
    expect(result.breakdown).toHaveProperty('hardRequirements')
    expect(result.breakdown).toHaveProperty('preferredSkills')
    expect(result.breakdown).toHaveProperty('toolsAndTech')
    expect(result.breakdown).toHaveProperty('softSkills')
    expect(result.breakdown).toHaveProperty('formatting')
  })
  it('totalScore is clamped 0-100', () => {
    const result = computeAtsScore(makeResume(), makeKeywords())
    expect(result.totalScore).toBeGreaterThanOrEqual(0)
    expect(result.totalScore).toBeLessThanOrEqual(100)
  })
  it('TypeScript and React matched, GraphQL missing', () => {
    const result = computeAtsScore(makeResume(), makeKeywords())
    expect(result.matchedKeywords).toContain('TypeScript')
    expect(result.matchedKeywords).toContain('React')
    expect(result.missingKeywords).toContain('GraphQL')
    expect(result.matchedKeywords).not.toContain('GraphQL')
  })
  it('empty soft skills contributes 0 points', () => {
    const result = computeAtsScore(makeResume(), makeKeywords({ softSkills: [] }))
    expect(result.breakdown.softSkills.total).toBe(0)
    expect(result.breakdown.softSkills.weightedScore).toBe(0)
    expect(result.breakdown.softSkills.percentage).toBe(0)
  })
  it('empty KeywordSet scores only formatting component (max 10)', () => {
    const result = computeAtsScore(makeResume(), { hardRequirements: [], preferredSkills: [], toolsAndTech: [], softSkills: [] })
    expect(result.totalScore).toBeLessThanOrEqual(10)
    expect(result.breakdown.hardRequirements.weightedScore).toBe(0)
  })
  it('score higher when more keywords match', () => {
    const with_kw = computeAtsScore(makeResume(), makeKeywords({ hardRequirements: [{ term: 'TypeScript', category: 'hard', matched: false }] }))
    const without_kw = computeAtsScore(makeResume(), makeKeywords({ hardRequirements: [{ term: 'Kubernetes', category: 'hard', matched: false }] }))
    expect(with_kw.totalScore).toBeGreaterThan(without_kw.totalScore)
  })
  it('10 runs completes in under 200ms', () => {
    // warm-up: prime the Fuse cache before measuring
    computeAtsScore(makeResume(), makeKeywords())
    const start = performance.now()
    for (let i = 0; i < 10; i++) computeAtsScore(makeResume(), makeKeywords())
    expect(performance.now() - start).toBeLessThan(200)
  })
  it('matched + missing = total keyword count', () => {
    const keywords = makeKeywords()
    const total = [...keywords.hardRequirements, ...keywords.preferredSkills, ...keywords.toolsAndTech, ...keywords.softSkills].length
    const result = computeAtsScore(makeResume(), keywords)
    expect(result.matchedKeywords.length + result.missingKeywords.length).toBe(total)
  })
})
