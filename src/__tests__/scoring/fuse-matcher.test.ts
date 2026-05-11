import { describe, it, expect } from 'vitest'
import { matchKeywords } from '@/lib/scoring/fuse-matcher'

describe('matchKeywords', () => {
  it('returns empty array for empty keywords', () => {
    expect(matchKeywords([], 'TypeScript React developer')).toEqual([])
  })
  it('returns all false for empty resume text', () => {
    expect(matchKeywords(['TypeScript', 'React'], '')).toEqual([false, false])
  })
  it('matches exact term in resume text', () => {
    const result = matchKeywords(['TypeScript', 'React'], 'I work with TypeScript and React daily')
    expect(result[0]).toBe(true)
    expect(result[1]).toBe(true)
  })
  it('matches alias "JS" to canonical "JavaScript"', () => {
    expect(matchKeywords(['JavaScript'], 'Proficient in JS and modern JS frameworks')[0]).toBe(true)
  })
  it('matches alias "React.js" to canonical "React"', () => {
    expect(matchKeywords(['React'], 'Built applications using React.js')[0]).toBe(true)
  })
  it('matches alias "k8s" to canonical "Kubernetes"', () => {
    expect(matchKeywords(['Kubernetes'], 'Deployed services using k8s clusters')[0]).toBe(true)
  })
  it('matches alias "AWS" to canonical "Amazon Web Services"', () => {
    expect(matchKeywords(['Amazon Web Services'], 'Experience with AWS cloud services')[0]).toBe(true)
  })
  it('matches alias "postgres" to canonical "PostgreSQL"', () => {
    expect(matchKeywords(['PostgreSQL'], 'Used postgres for data storage')[0]).toBe(true)
  })
  it('returns false for keyword not in resume', () => {
    expect(matchKeywords(['Kubernetes'], 'I work with Docker containers')[0]).toBe(false)
  })
  it('handles multiple keywords, matching only some', () => {
    const result = matchKeywords(['TypeScript', 'Kubernetes', 'React'], 'TypeScript developer with React experience')
    expect(result[0]).toBe(true)
    expect(result[1]).toBe(false)
    expect(result[2]).toBe(true)
  })
  it('returns correct parallel boolean array length', () => {
    const keywords = ['TypeScript', 'React', 'Node.js', 'Python', 'Java']
    expect(matchKeywords(keywords, 'TypeScript developer')).toHaveLength(keywords.length)
  })
})
