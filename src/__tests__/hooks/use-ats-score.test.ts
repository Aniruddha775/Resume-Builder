import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '@/lib/store'
import { useAtsScore } from '@/hooks/use-ats-score'
import type { Resume } from '@/types/resume'
import type { KeywordSet } from '@/types/job-description'

vi.mock('@/lib/scoring/ats-scorer', () => ({
  computeAtsScore: vi.fn().mockReturnValue({
    totalScore: 75,
    breakdown: {
      hardRequirements: { category: 'Hard Requirements', weight: 0.4, matched: 1, total: 1, percentage: 100, weightedScore: 40 },
      preferredSkills: { category: 'Preferred Skills', weight: 0.2, matched: 0, total: 0, percentage: 0, weightedScore: 0 },
      toolsAndTech: { category: 'Tools & Tech', weight: 0.2, matched: 1, total: 1, percentage: 100, weightedScore: 20 },
      softSkills: { category: 'Soft Skills', weight: 0.1, matched: 0, total: 0, percentage: 0, weightedScore: 0 },
      formatting: { category: 'Formatting', weight: 0.1, matched: 5, total: 5, percentage: 100, weightedScore: 10 },
    },
    matchedKeywords: ['TypeScript'],
    missingKeywords: [],
    computedAt: new Date().toISOString(),
  }),
  WEIGHTS: { hardRequirements: 0.4, preferredSkills: 0.2, toolsAndTech: 0.2, softSkills: 0.1, formatting: 0.1 },
}))

import { computeAtsScore } from '@/lib/scoring/ats-scorer'

const MOCK_RESUME: Resume = {
  id: 'r-1', title: 'Test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  sections: {
    contactInfo: { fullName: 'Alex', email: 'a@b.com', phone: '', location: '' },
    summary: 'A motivated engineer',
    experience: [{ id: 'e-1', company: 'Co', title: 'Engineer', startDate: '2020-01', endDate: null, current: true, bullets: [] }],
    education: [{ id: 'edu-1', institution: 'MIT', degree: 'BS', field: 'CS', graduationDate: '2018-05' }],
    skills: [{ category: 'Languages', items: ['TypeScript'] }],
  },
}

const MOCK_KEYWORDS: KeywordSet = {
  hardRequirements: [{ term: 'TypeScript', category: 'hard', matched: false }],
  preferredSkills: [], toolsAndTech: [], softSkills: [],
}

describe('useAtsScore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useAppStore.setState({ resume: null, keywords: null, score: null })
    vi.mocked(computeAtsScore).mockClear()
  })
  afterEach(() => { vi.useRealTimers() })

  it('does not call computeAtsScore when resume/keywords are null', () => {
    renderHook(() => useAtsScore())
    act(() => { vi.advanceTimersByTime(400) })
    expect(computeAtsScore).not.toHaveBeenCalled()
  })

  it('clears score immediately when keywords set to null', () => {
    renderHook(() => useAtsScore())
    act(() => { useAppStore.getState().setResume(MOCK_RESUME); useAppStore.setState({ keywords: MOCK_KEYWORDS }) })
    act(() => { vi.advanceTimersByTime(400) })
    act(() => { useAppStore.setState({ keywords: null }) })
    expect(useAppStore.getState().score).toBeNull()
  })

  it('debounces 300ms before calling computeAtsScore', () => {
    renderHook(() => useAtsScore())
    act(() => { useAppStore.getState().setResume(MOCK_RESUME); useAppStore.setState({ keywords: MOCK_KEYWORDS }) })
    act(() => { vi.advanceTimersByTime(200) })
    expect(computeAtsScore).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(150) })
    expect(computeAtsScore).toHaveBeenCalledTimes(1)
  })

  it('resets debounce timer on rapid changes', () => {
    renderHook(() => useAtsScore())
    act(() => { useAppStore.getState().setResume(MOCK_RESUME); useAppStore.setState({ keywords: MOCK_KEYWORDS }) })
    act(() => { vi.advanceTimersByTime(200) })
    act(() => { useAppStore.setState({ keywords: { ...MOCK_KEYWORDS } }) })
    act(() => { vi.advanceTimersByTime(200) })
    expect(computeAtsScore).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(150) })
    expect(computeAtsScore).toHaveBeenCalledTimes(1)
  })

  it('dispatches setScore with computeAtsScore result', () => {
    renderHook(() => useAtsScore())
    act(() => { useAppStore.getState().setResume(MOCK_RESUME); useAppStore.setState({ keywords: MOCK_KEYWORDS }) })
    act(() => { vi.advanceTimersByTime(400) })
    expect(useAppStore.getState().score?.totalScore).toBe(75)
  })

  it('recomputes when keywords change after initial computation', () => {
    renderHook(() => useAtsScore())
    act(() => { useAppStore.getState().setResume(MOCK_RESUME); useAppStore.setState({ keywords: MOCK_KEYWORDS }) })
    act(() => { vi.advanceTimersByTime(400) })
    expect(computeAtsScore).toHaveBeenCalledTimes(1)
    act(() => { useAppStore.setState({ keywords: { ...MOCK_KEYWORDS, preferredSkills: [{ term: 'React', category: 'preferred', matched: false }] } }) })
    act(() => { vi.advanceTimersByTime(400) })
    expect(computeAtsScore).toHaveBeenCalledTimes(2)
  })
})
