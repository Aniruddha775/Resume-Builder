import { describe, it, expect, vi, beforeEach } from 'vitest'
import { downloadBlob, buildResumeFilename } from '@/lib/pdf/download'

describe('buildResumeFilename', () => {
  it('slugifies a typical full name', () => {
    expect(buildResumeFilename('Alex Johnson')).toBe('alex-johnson.pdf')
  })
  it('strips non-alphanumeric characters', () => {
    expect(buildResumeFilename("O'Reilly")).toBe('oreilly.pdf')
  })
  it('collapses multiple spaces into a single dash', () => {
    expect(buildResumeFilename('  Alex   Johnson  ')).toBe('alex-johnson.pdf')
  })
  it('defaults to resume.pdf on empty input', () => {
    expect(buildResumeFilename('')).toBe('resume.pdf')
    expect(buildResumeFilename(undefined)).toBe('resume.pdf')
  })
})

describe('downloadBlob', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis.URL as any).createObjectURL = vi.fn(() => 'blob:mock-url')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis.URL as any).revokeObjectURL = vi.fn()
  })

  it('appends an anchor, clicks it, and cleans up', () => {
    const blob = new Blob(['hello'], { type: 'application/pdf' })
    const appendSpy = vi.spyOn(document.body, 'appendChild')
    const removeSpy = vi.spyOn(document.body, 'removeChild')
    downloadBlob(blob, 'test.pdf')
    expect(appendSpy).toHaveBeenCalledOnce()
    expect(removeSpy).toHaveBeenCalledOnce()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})
