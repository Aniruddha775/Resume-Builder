import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '@/lib/store'
import { useAtsScore } from '@/hooks/use-ats-score'
import type { Resume } from '@/types/resume'
import type { KeywordSet } from '@/types/job-description'

vi.mock('@/lib/scoring/ats-scorer', () => ({
  computeAtsScore: vi.fn().mockReturnValue({
    totalScore: 82,
    breakdown: {
      hardRequirements: { category: 'Hard Requirements', weight: 0.4, matched: 2, total: 2, percentage: 100, weightedScore: 40 },
      preferredSkills: { category: 'Preferred Skills', weight: 0.2, matched: 0, total: 0, percentage: 0, weightedScore: 0 },
      toolsAndTech: { category: 'Tools & Tech', weight: 0.2, matched: 1, total: 1, percentage: 100, weightedScore: 20 },
      softSkills: { category: 'Soft Skills', weight: 0.1, matched: 0, total: 0, percentage: 0, weightedScore: 0 },
      formatting: { category: 'Formatting', weight: 0.1, matched: 5, total: 5, percentage: 100, weightedScore: 10 },
    },
    matchedKeywords: ['TypeScript', 'React'],
    missingKeywords: [],
    computedAt: new Date().toISOString(),
  }),
  WEIGHTS: { hardRequirements: 0.4, preferredSkills: 0.2, toolsAndTech: 0.2, softSkills: 0.1, formatting: 0.1 },
}))

import { computeAtsScore } from '@/lib/scoring/ats-scorer'

const MOCK_RESUME: Resume = {
  id: 'test-r-1',
  title: 'Test Resume',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: {
    contactInfo: { fullName: 'Alex Johnson', email: 'alex@example.com', phone: '', location: '' },
    summary: 'TypeScript and React engineer with 5 years experience.',
    experience: [{ id: 'e-1', company: 'Acme', title: 'Engineer', startDate: '2020-01', endDate: null, current: true, bullets: ['Built React apps'] }],
    education: [{ id: 'edu-1', institution: 'MIT', degree: 'BS', field: 'CS', graduationDate: '2018-05' }],
    skills: [{ category: 'Languages', items: ['TypeScript'] }],
  },
}

const MOCK_KEYWORDS: KeywordSet = {
  hardRequirements: [{ term: 'TypeScript', category: 'hard', matched: false }],
  preferredSkills: [],
  toolsAndTech: [{ term: 'React', category: 'tools', matched: false }],
  softSkills: [],
}

describe('Phase 3 Integration: useAtsScore wiring', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useAppStore.setState({ resume: null, keywords: null, score: null })
    vi.mocked(computeAtsScore).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('score is null before any JD is pasted', () => {
    renderHook(() => useAtsScore())
    expect(useAppStore.getState().score).toBeNull()
  })

  it('score becomes non-null after resume + keywords set and 300ms elapsed', () => {
    renderHook(() => useAtsScore())

    act(() => {
      useAppStore.getState().setResume(MOCK_RESUME)
      useAppStore.setState({ keywords: MOCK_KEYWORDS })
    })

    expect(useAppStore.getState().score).toBeNull()

    act(() => { vi.advanceTimersByTime(350) })

    expect(useAppStore.getState().score).not.toBeNull()
    expect(useAppStore.getState().score?.totalScore).toBe(82)
  })

  it('score becomes null when keywords are cleared', () => {
    renderHook(() => useAtsScore())

    act(() => {
      useAppStore.getState().setResume(MOCK_RESUME)
      useAppStore.setState({ keywords: MOCK_KEYWORDS })
    })
    act(() => { vi.advanceTimersByTime(350) })

    expect(useAppStore.getState().score).not.toBeNull()

    act(() => {
      useAppStore.getState().clearKeywords()
    })

    expect(useAppStore.getState().score).toBeNull()
  })

  it('score recomputes when resume changes after initial computation', () => {
    renderHook(() => useAtsScore())

    act(() => {
      useAppStore.getState().setResume(MOCK_RESUME)
      useAppStore.setState({ keywords: MOCK_KEYWORDS })
    })
    act(() => { vi.advanceTimersByTime(350) })

    expect(computeAtsScore).toHaveBeenCalledTimes(1)

    act(() => {
      useAppStore.getState().updateSummary('Updated summary with new keywords and more experience.')
    })
    act(() => { vi.advanceTimersByTime(350) })

    expect(computeAtsScore).toHaveBeenCalledTimes(2)
  })

  it('rapid edits only trigger one computation (debounce)', () => {
    renderHook(() => useAtsScore())

    act(() => {
      useAppStore.getState().setResume(MOCK_RESUME)
      useAppStore.setState({ keywords: MOCK_KEYWORDS })
    })
    act(() => { vi.advanceTimersByTime(350) })
    expect(computeAtsScore).toHaveBeenCalledTimes(1)

    act(() => { useAppStore.getState().updateSummary('Edit 1') })
    act(() => { vi.advanceTimersByTime(100) })
    act(() => { useAppStore.getState().updateSummary('Edit 2') })
    act(() => { vi.advanceTimersByTime(100) })
    act(() => { useAppStore.getState().updateSummary('Edit 3') })
    act(() => { vi.advanceTimersByTime(100) })

    expect(computeAtsScore).toHaveBeenCalledTimes(1)

    act(() => { vi.advanceTimersByTime(300) })
    expect(computeAtsScore).toHaveBeenCalledTimes(2)
  })
})
