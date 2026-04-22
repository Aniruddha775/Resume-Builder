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

  it('renders contact section when SAMPLE_RESUME is loaded', () => {
    useAppStore.getState().setResume(SAMPLE_RESUME)
    const { container } = render(<ResumeEditor />)
    // ContactForm renders a sr-only "Contact Information" heading
    const headings = container.querySelectorAll('h3')
    expect(headings.length).toBeGreaterThan(0)
    // At least one input should be visible (from ContactForm)
    const inputs = container.querySelectorAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })
})
