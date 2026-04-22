import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { useAppStore } from '@/lib/store'
import { SAMPLE_RESUME } from '@/data/sample-resume'
import { ResumeEditor } from '@/components/editor/resume-editor'

beforeEach(() => {
  useAppStore.setState({ resume: null, jobDescription: null, keywords: null, score: null,
    ui: { activePanel: 'editor', isMobile: false } })
})

describe('ResumeEditor', () => {
  it('renders null when resume is null', () => {
    const { container } = render(<ResumeEditor />)
    expect(container.firstChild).toBeNull()
  })

  it('renders without throwing when SAMPLE_RESUME is loaded', () => {
    useAppStore.getState().setResume(SAMPLE_RESUME)
    expect(() => render(<ResumeEditor />)).not.toThrow()
  })
})
