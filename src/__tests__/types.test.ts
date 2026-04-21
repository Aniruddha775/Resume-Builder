import { describe, it, expect } from 'vitest'
import {
  ResumeSchema,
  ExperienceSchema,
  ContactInfoSchema,
} from '@/types/resume'
import {
  KeywordSchema,
  JobDescriptionSchema,
} from '@/types/job-description'
import { ScoreResultSchema } from '@/types/score'

// ---------------------------------------------------------------------------
// Shared valid fixtures
// ---------------------------------------------------------------------------

const validContactInfo = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1-555-000-0000',
  location: 'San Francisco, CA',
}

const validExperience = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  company: 'Acme Corp',
  title: 'Senior Engineer',
  startDate: '2021-01',
  endDate: null,
  current: true,
  bullets: ['Led platform migration', 'Improved CI/CD pipeline'],
}

const validResume = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  title: 'My Resume',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T12:00:00.000Z',
  sections: {
    contactInfo: validContactInfo,
    summary: 'Experienced software engineer.',
    experience: [validExperience],
    education: [
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        institution: 'State University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduationDate: '2018-05',
      },
    ],
    skills: [
      { category: 'Languages', items: ['TypeScript', 'Python'] },
    ],
  },
}

const validScoreResult = {
  totalScore: 75,
  breakdown: {
    hardRequirements: {
      category: 'hardRequirements',
      weight: 0.35,
      matched: 7,
      total: 10,
      percentage: 70,
      weightedScore: 24.5,
    },
    preferredSkills: {
      category: 'preferredSkills',
      weight: 0.20,
      matched: 4,
      total: 5,
      percentage: 80,
      weightedScore: 16,
    },
    toolsAndTech: {
      category: 'toolsAndTech',
      weight: 0.15,
      matched: 3,
      total: 4,
      percentage: 75,
      weightedScore: 11.25,
    },
    softSkills: {
      category: 'softSkills',
      weight: 0.10,
      matched: 2,
      total: 3,
      percentage: 66.7,
      weightedScore: 6.67,
    },
    formatting: {
      category: 'formatting',
      weight: 0.20,
      matched: 4,
      total: 5,
      percentage: 80,
      weightedScore: 16,
    },
  },
  matchedKeywords: ['TypeScript', 'React', 'Node.js'],
  missingKeywords: ['Kubernetes', 'Terraform'],
  computedAt: '2024-01-15T12:30:00.000Z',
}

// ---------------------------------------------------------------------------
// Test 1: ResumeSchema.parse(validResume) returns a typed Resume object
// ---------------------------------------------------------------------------
describe('ResumeSchema', () => {
  it('parses a valid resume object successfully', () => {
    const result = ResumeSchema.parse(validResume)
    expect(result.id).toBe(validResume.id)
    expect(result.title).toBe('My Resume')
    expect(result.sections.contactInfo.fullName).toBe('Jane Doe')
    expect(result.sections.experience).toHaveLength(1)
  })

  // Test 2: ResumeSchema.safeParse(invalidData) returns { success: false }
  it('fails safeParse for missing required fields', () => {
    const invalidData = { id: 'not-a-uuid', title: 123 }
    const result = ResumeSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Test 3: ExperienceSchema validates id as UUID, startDate as string, endDate as nullable
// ---------------------------------------------------------------------------
describe('ExperienceSchema', () => {
  it('validates id as UUID, startDate as string, endDate as nullable', () => {
    // valid experience with null endDate
    const result = ExperienceSchema.parse(validExperience)
    expect(result.id).toBe(validExperience.id)
    expect(result.endDate).toBeNull()
    expect(typeof result.startDate).toBe('string')
  })

  it('rejects a non-UUID id', () => {
    const bad = { ...validExperience, id: 'not-a-uuid' }
    const result = ExperienceSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('accepts a non-null endDate string', () => {
    const withEnd = { ...validExperience, endDate: '2023-12', current: false }
    const result = ExperienceSchema.parse(withEnd)
    expect(result.endDate).toBe('2023-12')
  })
})

// ---------------------------------------------------------------------------
// Test 4: KeywordSchema validates category enum
// ---------------------------------------------------------------------------
describe('KeywordSchema', () => {
  it('accepts all valid keyword categories', () => {
    const categories = ['hard', 'preferred', 'tools', 'soft'] as const
    for (const category of categories) {
      const kw = { term: 'TypeScript', category, matched: false }
      const result = KeywordSchema.parse(kw)
      expect(result.category).toBe(category)
    }
  })

  it('rejects an invalid category value', () => {
    const kw = { term: 'TypeScript', category: 'invalid', matched: false }
    const result = KeywordSchema.safeParse(kw)
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Test 5: ScoreResultSchema validates totalScore range (0-100)
// ---------------------------------------------------------------------------
describe('ScoreResultSchema', () => {
  it('parses a valid score result', () => {
    const result = ScoreResultSchema.parse(validScoreResult)
    expect(result.totalScore).toBe(75)
  })

  it('rejects totalScore of -1 (below minimum)', () => {
    const bad = { ...validScoreResult, totalScore: -1 }
    const result = ScoreResultSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('rejects totalScore of 101 (above maximum)', () => {
    const bad = { ...validScoreResult, totalScore: 101 }
    const result = ScoreResultSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Test 6: JobDescriptionSchema allows extractedKeywords to be null
// ---------------------------------------------------------------------------
describe('JobDescriptionSchema', () => {
  it('allows extractedKeywords to be null', () => {
    const jd = {
      id: '123e4567-e89b-12d3-a456-426614174003',
      rawText: 'We are looking for a TypeScript developer...',
      pastedAt: '2024-01-15T09:00:00.000Z',
      extractedKeywords: null,
    }
    const result = JobDescriptionSchema.parse(jd)
    expect(result.extractedKeywords).toBeNull()
  })

  it('accepts a fully populated extractedKeywords object', () => {
    const jd = {
      id: '123e4567-e89b-12d3-a456-426614174003',
      rawText: 'We are looking for a TypeScript developer...',
      pastedAt: '2024-01-15T09:00:00.000Z',
      extractedKeywords: {
        hardRequirements: [{ term: 'TypeScript', category: 'hard', matched: true }],
        preferredSkills: [],
        toolsAndTech: [],
        softSkills: [],
      },
    }
    const result = JobDescriptionSchema.parse(jd)
    expect(result.extractedKeywords?.hardRequirements).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// Test 7: ContactInfoSchema validates email format, optional fields can be omitted
// ---------------------------------------------------------------------------
describe('ContactInfoSchema', () => {
  it('validates email format and accepts valid contact info', () => {
    const result = ContactInfoSchema.parse(validContactInfo)
    expect(result.email).toBe('jane@example.com')
  })

  it('rejects an invalid email address', () => {
    const bad = { ...validContactInfo, email: 'not-an-email' }
    const result = ContactInfoSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('accepts contact info without optional linkedIn and website fields', () => {
    // linkedIn and website are optional — should parse without them
    const result = ContactInfoSchema.parse(validContactInfo)
    expect(result.linkedIn).toBeUndefined()
    expect(result.website).toBeUndefined()
  })

  it('accepts contact info with optional fields present', () => {
    const withOptionals = {
      ...validContactInfo,
      linkedIn: 'https://linkedin.com/in/janedoe',
      website: 'https://janedoe.dev',
    }
    const result = ContactInfoSchema.parse(withOptionals)
    expect(result.linkedIn).toBe('https://linkedin.com/in/janedoe')
    expect(result.website).toBe('https://janedoe.dev')
  })
})
