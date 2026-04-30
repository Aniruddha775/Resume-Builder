import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { extractKeywords } from '@/lib/ai/extract-keywords'

describe('extractKeywords', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a KeywordSet on successful 200 response', async () => {
    const mockBody = {
      hardRequirements: ['TypeScript', 'React'],
      preferredSkills: ['GraphQL'],
      toolsAndTech: ['Docker'],
      softSkills: ['Leadership'],
    }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockBody), { status: 200 })
    )

    const result = await extractKeywords('A long job description that exceeds fifty characters of text for minimum length', 'sk-test', 'openai')

    expect(result).toHaveProperty('keywords')
    if (!('keywords' in result)) throw new Error('expected keywords')
    expect(result.keywords.hardRequirements).toHaveLength(2)
    expect(result.keywords.hardRequirements[0]).toEqual({
      term: 'TypeScript', category: 'hard', matched: false,
    })
    expect(result.keywords.preferredSkills[0]).toEqual({
      term: 'GraphQL', category: 'preferred', matched: false,
    })
    expect(result.keywords.toolsAndTech[0]).toEqual({
      term: 'Docker', category: 'tools', matched: false,
    })
    expect(result.keywords.softSkills[0]).toEqual({
      term: 'Leadership', category: 'soft', matched: false,
    })
  })

  it('returns INVALID_KEY error on 401', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'INVALID_KEY' }), { status: 401 })
    )
    const result = await extractKeywords('A long job description for testing minimum length requirement', 'bad-key', 'openai')
    expect(result).toEqual({ error: 'INVALID_KEY' })
  })

  it('returns RATE_LIMITED error on 429', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'RATE_LIMITED' }), { status: 429 })
    )
    const result = await extractKeywords('A long job description for testing minimum length requirement', 'sk-test', 'openai')
    expect(result).toEqual({ error: 'RATE_LIMITED' })
  })

  it('returns JD_TOO_SHORT error on 422', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'JD_TOO_SHORT' }), { status: 422 })
    )
    const result = await extractKeywords('short', 'sk-test', 'openai')
    expect(result).toEqual({ error: 'JD_TOO_SHORT' })
  })

  it('returns NETWORK_ERROR when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const result = await extractKeywords('A long job description for testing minimum length requirement', 'sk-test', 'openai')
    expect(result).toEqual({ error: 'NETWORK_ERROR' })
  })

  it('sets x-api-key header correctly', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ hardRequirements: [], preferredSkills: [], toolsAndTech: [], softSkills: [] }), { status: 200 })
    )
    await extractKeywords('A long job description for testing minimum length requirement', 'sk-secret-key', 'anthropic')
    const callArgs = vi.mocked(fetch).mock.calls[0]
    expect(callArgs).toBeDefined()
    const [_url, options] = callArgs as [string, RequestInit]
    const headers = options.headers as Record<string, string>
    expect(headers['x-api-key']).toBe('sk-secret-key')
    expect(headers['x-ai-provider']).toBe('anthropic')
  })

  it('handles missing arrays in response with empty arrays', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    )
    const result = await extractKeywords('A long job description for testing minimum length requirement', 'sk-test', 'openai')
    if (!('keywords' in result)) throw new Error('expected keywords')
    expect(result.keywords.hardRequirements).toEqual([])
    expect(result.keywords.preferredSkills).toEqual([])
  })
})
