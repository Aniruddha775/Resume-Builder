import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useAppStore } from '@/lib/store'
import { SAMPLE_RESUME } from '@/data/sample-resume'
import { PdfPreviewPanel } from '@/components/pdf/pdf-preview-panel'

// Mock usePDF to avoid jsdom hanging on actual PDF rendering
vi.mock('@react-pdf/renderer', async () => {
  const actual = await vi.importActual<typeof import('@react-pdf/renderer')>('@react-pdf/renderer')
  return {
    ...actual,
    usePDF: () => [{ url: null, blob: null, loading: false, error: undefined }, vi.fn()],
  }
})

vi.mock('@/lib/pdf/fonts', () => ({}))

beforeEach(() => {
  useAppStore.setState({
    resume: null,
    jobDescription: null,
    keywords: null,
    score: null,
    ui: { activePanel: 'editor', isMobile: false },
  })
})

describe('PdfPreviewPanel', () => {
  it('renders a Preview heading and Export PDF button', () => {
    useAppStore.getState().setResume(SAMPLE_RESUME)
    render(<PdfPreviewPanel />)
    expect(screen.getByRole('heading', { name: /preview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export resume as pdf/i })).toBeInTheDocument()
  })
})
