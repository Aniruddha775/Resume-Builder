import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { useAppStore } from '@/lib/store'
import { SAMPLE_RESUME } from '@/data/sample-resume'

vi.mock('@/lib/storage/adapter', () => {
  const saveResume = vi.fn().mockResolvedValue(undefined)
  const listResumes = vi.fn()
  return {
    createStorageAdapter: () => ({ saveResume, listResumes }),
    __listSpy: listResumes,
    __saveSpy: saveResume,
  }
})

import * as adapterModule from '@/lib/storage/adapter'
const listSpy = (adapterModule as unknown as { __listSpy: ReturnType<typeof vi.fn> }).__listSpy

import { ResumeBootstrap } from '@/components/app/resume-bootstrap'

beforeEach(() => {
  useAppStore.setState({
    resume: null,
    jobDescription: null,
    keywords: null,
    score: null,
    ui: { activePanel: 'editor', isMobile: false, lastSavedToken: 0 },
  })
  listSpy.mockReset()
})

describe('ResumeBootstrap', () => {
  it('seeds SAMPLE_RESUME when listResumes returns empty', async () => {
    listSpy.mockResolvedValue([])
    render(<ResumeBootstrap><div>children</div></ResumeBootstrap>)
    await waitFor(() => {
      expect(useAppStore.getState().resume?.id).toBe(SAMPLE_RESUME.id)
    })
  })

  it('seeds first saved resume when listResumes returns a list', async () => {
    const saved = { ...SAMPLE_RESUME, id: '99999999-9999-9999-9999-999999999999', title: 'Saved' }
    listSpy.mockResolvedValue([saved])
    render(<ResumeBootstrap><div>children</div></ResumeBootstrap>)
    await waitFor(() => {
      expect(useAppStore.getState().resume?.id).toBe(saved.id)
    })
  })

  it('does NOT overwrite an existing resume in the store', async () => {
    const pre = { ...SAMPLE_RESUME, id: '11111111-1111-1111-1111-111111111111' }
    useAppStore.getState().setResume(pre)
    listSpy.mockResolvedValue([SAMPLE_RESUME])
    render(<ResumeBootstrap><div>children</div></ResumeBootstrap>)
    await new Promise((r) => setTimeout(r, 10))
    expect(useAppStore.getState().resume?.id).toBe(pre.id)
    expect(listSpy).not.toHaveBeenCalled()
  })
})
