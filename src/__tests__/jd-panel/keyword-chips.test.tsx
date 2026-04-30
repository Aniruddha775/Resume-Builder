import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeywordChips } from '@/components/jd-panel/keyword-chips'
import type { KeywordSet } from '@/types/job-description'

const makeKeywords = (): KeywordSet => ({
  hardRequirements: [
    { term: 'TypeScript', category: 'hard', matched: false },
    { term: 'React', category: 'hard', matched: false },
    { term: 'Node.js', category: 'hard', matched: false },
  ],
  preferredSkills: [
    { term: 'GraphQL', category: 'preferred', matched: false },
  ],
  toolsAndTech: [],
  softSkills: [
    { term: 'Leadership', category: 'soft', matched: false },
  ],
})

describe('KeywordChips', () => {
  it('renders chips for each keyword term', () => {
    render(<KeywordChips keywords={makeKeywords()} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('GraphQL')).toBeInTheDocument()
    expect(screen.getByText('Leadership')).toBeInTheDocument()
  })

  it('renders correct category labels', () => {
    render(<KeywordChips keywords={makeKeywords()} />)
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByText('Preferred')).toBeInTheDocument()
    expect(screen.getByText('Soft Skills')).toBeInTheDocument()
  })

  it('does not render the Tools & Tech section when that category is empty', () => {
    render(<KeywordChips keywords={makeKeywords()} />)
    expect(screen.queryByText('Tools & Tech')).not.toBeInTheDocument()
  })

  it('applies blue color classes to hard requirement chips', () => {
    render(<KeywordChips keywords={makeKeywords()} />)
    const tsChip = screen.getByText('TypeScript')
    expect(tsChip.className).toMatch(/text-blue-700/)
    expect(tsChip.className).toMatch(/bg-blue-50/)
  })

  it('applies teal color classes to soft skills chips', () => {
    render(<KeywordChips keywords={makeKeywords()} />)
    const chip = screen.getByText('Leadership')
    expect(chip.className).toMatch(/text-teal-700/)
  })

  it('renders nothing when all categories are empty', () => {
    const empty: KeywordSet = {
      hardRequirements: [],
      preferredSkills: [],
      toolsAndTech: [],
      softSkills: [],
    }
    const { container } = render(<KeywordChips keywords={empty} />)
    expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(0)
  })
})
