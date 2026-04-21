import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/lib/store'
import type { Resume } from '@/types/resume'
import type { JobDescription, KeywordSet } from '@/types/job-description'
import type { ScoreResult } from '@/types/score'

// Minimal valid Resume fixture
const makeResume = (): Resume => ({
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Test Resume',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  sections: {
    contactInfo: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-1234',
      location: 'New York, NY',
    },
    summary: 'Experienced engineer.',
    experience: [
      {
        id: '00000000-0000-0000-0000-000000000002',
        company: 'Acme Corp',
        title: 'Engineer',
        startDate: '2022-01',
        endDate: null,
        current: true,
        bullets: ['Led team', 'Shipped features'],
      },
    ],
    education: [],
    skills: [],
  },
})

const makeJobDescription = (): JobDescription => ({
  id: '00000000-0000-0000-0000-000000000010',
  rawText: 'Looking for a senior engineer with React experience.',
  pastedAt: '2026-01-01T00:00:00Z',
  extractedKeywords: null,
})

const makeKeywordSet = (): KeywordSet => ({
  hardRequirements: [{ term: 'React', category: 'hard', matched: false }],
  preferredSkills: [],
  toolsAndTech: [],
  softSkills: [],
})

const makeScoreResult = (): ScoreResult => ({
  totalScore: 72,
  breakdown: {
    hardRequirements: {
      category: 'hardRequirements',
      weight: 0.4,
      matched: 3,
      total: 5,
      percentage: 60,
      weightedScore: 24,
    },
    preferredSkills: {
      category: 'preferredSkills',
      weight: 0.2,
      matched: 2,
      total: 3,
      percentage: 66,
      weightedScore: 13.2,
    },
    toolsAndTech: {
      category: 'toolsAndTech',
      weight: 0.2,
      matched: 4,
      total: 4,
      percentage: 100,
      weightedScore: 20,
    },
    softSkills: {
      category: 'softSkills',
      weight: 0.1,
      matched: 1,
      total: 2,
      percentage: 50,
      weightedScore: 5,
    },
    formatting: {
      category: 'formatting',
      weight: 0.1,
      matched: 1,
      total: 1,
      percentage: 100,
      weightedScore: 10,
    },
  },
  matchedKeywords: ['React', 'TypeScript'],
  missingKeywords: ['Docker', 'Kubernetes'],
  computedAt: '2026-01-01T00:00:00Z',
})

// Reset store to initial state before each test
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

describe('ResumeSlice', () => {
  it('initializes with resume as null', () => {
    const state = useAppStore.getState()
    expect(state.resume).toBeNull()
  })

  it('setResume updates store.resume', () => {
    const resume = makeResume()
    useAppStore.getState().setResume(resume)
    expect(useAppStore.getState().resume).toEqual(resume)
  })

  it('clearResume sets resume back to null', () => {
    useAppStore.getState().setResume(makeResume())
    useAppStore.getState().clearResume()
    expect(useAppStore.getState().resume).toBeNull()
  })

  it('updateBullet modifies resume.sections.experience[0].bullets[0] via immer', () => {
    useAppStore.getState().setResume(makeResume())
    useAppStore.getState().updateBullet(0, 0, 'New bullet text')
    const updated = useAppStore.getState().resume
    expect(updated?.sections.experience[0].bullets[0]).toBe('New bullet text')
  })

  it('updateBullet is a no-op when resume is null', () => {
    // Should not throw
    expect(() => useAppStore.getState().updateBullet(0, 0, 'text')).not.toThrow()
    expect(useAppStore.getState().resume).toBeNull()
  })
})

describe('JobDescriptionSlice', () => {
  it('initializes with jobDescription as null', () => {
    const state = useAppStore.getState()
    expect(state.jobDescription).toBeNull()
  })

  it('setJobDescription updates store.jobDescription', () => {
    const jd = makeJobDescription()
    useAppStore.getState().setJobDescription(jd)
    expect(useAppStore.getState().jobDescription).toEqual(jd)
  })

  it('clearJobDescription sets jobDescription back to null', () => {
    useAppStore.getState().setJobDescription(makeJobDescription())
    useAppStore.getState().clearJobDescription()
    expect(useAppStore.getState().jobDescription).toBeNull()
  })
})

describe('KeywordsSlice', () => {
  it('initializes with keywords as null', () => {
    const state = useAppStore.getState()
    expect(state.keywords).toBeNull()
  })

  it('setKeywords updates store.keywords', () => {
    const kw = makeKeywordSet()
    useAppStore.getState().setKeywords(kw)
    expect(useAppStore.getState().keywords).toEqual(kw)
  })

  it('clearKeywords sets keywords back to null', () => {
    useAppStore.getState().setKeywords(makeKeywordSet())
    useAppStore.getState().clearKeywords()
    expect(useAppStore.getState().keywords).toBeNull()
  })
})

describe('ScoreSlice', () => {
  it('initializes with score as null', () => {
    const state = useAppStore.getState()
    expect(state.score).toBeNull()
  })

  it('setScore updates store.score', () => {
    const scoreResult = makeScoreResult()
    useAppStore.getState().setScore(scoreResult)
    expect(useAppStore.getState().score).toEqual(scoreResult)
  })

  it('clearScore sets score back to null', () => {
    useAppStore.getState().setScore(makeScoreResult())
    useAppStore.getState().clearScore()
    expect(useAppStore.getState().score).toBeNull()
  })
})

describe('UISlice', () => {
  it('initializes with ui.activePanel as "editor"', () => {
    const state = useAppStore.getState()
    expect(state.ui.activePanel).toBe('editor')
  })

  it('initializes with ui.isMobile as false', () => {
    const state = useAppStore.getState()
    expect(state.ui.isMobile).toBe(false)
  })

  it('setActivePanel updates ui.activePanel to "jd"', () => {
    useAppStore.getState().setActivePanel('jd')
    expect(useAppStore.getState().ui.activePanel).toBe('jd')
  })

  it('setActivePanel updates ui.activePanel to "score"', () => {
    useAppStore.getState().setActivePanel('score')
    expect(useAppStore.getState().ui.activePanel).toBe('score')
  })

  it('setIsMobile updates ui.isMobile', () => {
    useAppStore.getState().setIsMobile(true)
    expect(useAppStore.getState().ui.isMobile).toBe(true)
  })
})
