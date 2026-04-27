import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useAppStore } from '@/lib/store'
import { SAMPLE_RESUME } from '@/data/sample-resume'
import { ContactForm } from '@/components/editor/contact-form'

beforeEach(() => {
  useAppStore.setState({ resume: null, jobDescription: null, keywords: null, score: null,
    ui: { activePanel: 'editor', isMobile: false } })
})

describe('ContactForm', () => {
  it('renders null when resume is null', () => {
    const { container } = render(<ContactForm />)
    expect(container.firstChild).toBeNull()
  })

  it('renders 6 inputs when resume is loaded', () => {
    useAppStore.getState().setResume(SAMPLE_RESUME)
    const { container } = render(<ContactForm />)
    const inputs = container.querySelectorAll('input')
    expect(inputs.length).toBe(6)
  })

  it('calls updateContactInfo when Full Name input changes', () => {
    useAppStore.getState().setResume(SAMPLE_RESUME)
    const { container } = render(<ContactForm />)
    const inputs = container.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: 'Jane Doe' } })
    const updatedName = useAppStore.getState().resume?.sections.contactInfo.fullName
    expect(updatedName).toBe('Jane Doe')
  })
})
