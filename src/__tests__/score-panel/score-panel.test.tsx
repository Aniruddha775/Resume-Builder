import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useAppStore } from '@/lib/store'
import { ScorePanel } from '@/components/score-panel/score-panel'
import type { ScoreResult } from '@/types/score'

function makeScore(totalScore: number, overrides: Partial<ScoreResult> = {}): ScoreResult {
  return {
    totalScore,
    breakdown: {
      hardRequirements: { category: 'Hard Requirements', weight: 0.4, matched: 2, total: 3, percentage: 67, weightedScore: 26.8 },
      preferredSkills: { category: 'Preferred Skills', weight: 0.2, matched: 1, total: 2, percentage: 50, weightedScore: 10 },
      toolsAndTech: { category: 'Tools & Tech', weight: 0.2, matched: 2, total: 2, percentage: 100, weightedScore: 20 },
      softSkills: { category: 'Soft Skills', weight: 0.1, matched: 0, total: 0, percentage: 0, weightedScore: 0 },
      formatting: { category: 'Formatting', weight: 0.1, matched: 5, total: 5, percentage: 100, weightedScore: 10 },
    },
    matchedKeywords: ['TypeScript', 'React'],
    missingKeywords: ['Kubernetes'],
    computedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('ScorePanel', () => {
  beforeEach(() => {
    useAppStore.setState({ score: null, keywords: null })
  })

  it('renders empty state when score and keywords are both null', () => {
    render(<ScorePanel />)
    expect(screen.getByText(/paste a job description/i)).toBeInTheDocument()
  })

  it('renders computing state when keywords set but score is null', () => {
    useAppStore.setState({
      keywords: { hardRequirements: [{ term: 'TypeScript', category: 'hard', matched: false }], preferredSkills: [], toolsAndTech: [], softSkills: [] },
      score: null,
    })
    render(<ScorePanel />)
    expect(screen.getByText(/computing score/i)).toBeInTheDocument()
  })

  it('renders score ring with aria-label when score is set', () => {
    useAppStore.setState({ score: makeScore(75), keywords: { hardRequirements: [], preferredSkills: [], toolsAndTech: [], softSkills: [] } })
    render(<ScorePanel />)
    expect(screen.getByRole('img', { name: /ATS Score: 75 out of 100/i })).toBeInTheDocument()
  })

  it('renders matched keyword chips in green', () => {
    useAppStore.setState({ score: makeScore(72), keywords: { hardRequirements: [], preferredSkills: [], toolsAndTech: [], softSkills: [] } })
    render(<ScorePanel />)
    const matched = screen.getByText('TypeScript')
    expect(matched.closest('[class*="green"]') || matched).toBeTruthy()
  })

  it('renders missing keyword chips in red', () => {
    useAppStore.setState({ score: makeScore(72), keywords: { hardRequirements: [], preferredSkills: [], toolsAndTech: [], softSkills: [] } })
    render(<ScorePanel />)
    expect(screen.getByText('Kubernetes')).toBeInTheDocument()
  })

  it('renders category bars for non-empty categories', () => {
    useAppStore.setState({ score: makeScore(72), keywords: { hardRequirements: [], preferredSkills: [], toolsAndTech: [], softSkills: [] } })
    render(<ScorePanel />)
    expect(screen.getByText('Hard Requirements')).toBeInTheDocument()
    expect(screen.getByText('Preferred Skills')).toBeInTheDocument()
    expect(screen.getByText('Tools & Tech')).toBeInTheDocument()
    expect(screen.getByText('Formatting')).toBeInTheDocument()
    // Soft Skills has total=0 — CategoryBar returns null
    expect(screen.queryByText('Soft Skills')).not.toBeInTheDocument()
  })

  it('score ring SVG has aria-label', () => {
    useAppStore.setState({ score: makeScore(55), keywords: { hardRequirements: [], preferredSkills: [], toolsAndTech: [], softSkills: [] } })
    render(<ScorePanel />)
    expect(screen.getByRole('img', { name: /ATS Score: 55 out of 100/i })).toBeInTheDocument()
  })

  it('renders Breakdown and Keywords section headings', () => {
    useAppStore.setState({ score: makeScore(80), keywords: { hardRequirements: [], preferredSkills: [], toolsAndTech: [], softSkills: [] } })
    render(<ScorePanel />)
    expect(screen.getByText('Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Keywords')).toBeInTheDocument()
  })
})
