import { describe, it, expect, beforeEach } from 'vitest'
import { createStorageAdapter } from '@/lib/storage/adapter'
import type { Resume } from '@/types/resume'
import type { JobDescription } from '@/types/job-description'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidResume(overrides: Partial<Resume> = {}): Resume {
  return {
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Test Resume',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T12:00:00.000Z',
    sections: {
      contactInfo: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1-555-000-0000',
        location: 'San Francisco, CA',
      },
      summary: 'Experienced software engineer.',
      experience: [
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          company: 'Acme Corp',
          title: 'Senior Engineer',
          startDate: '2021-01',
          endDate: null,
          current: true,
          bullets: ['Led platform migration'],
        },
      ],
      education: [
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          institution: 'State University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          graduationDate: '2018-05',
        },
      ],
      skills: [{ category: 'Languages', items: ['TypeScript', 'Python'] }],
    },
    ...overrides,
  }
}

function makeValidJobDescription(overrides: Partial<JobDescription> = {}): JobDescription {
  return {
    id: '423e4567-e89b-12d3-a456-426614174001',
    rawText: 'We are looking for a TypeScript developer.',
    pastedAt: '2024-01-15T09:00:00.000Z',
    extractedKeywords: null,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LocalStorageAdapter', () => {
  let adapter: ReturnType<typeof createStorageAdapter>

  beforeEach(() => {
    localStorage.clear()
    adapter = createStorageAdapter()
  })

  // Test 1: saveResume → getResume returns the same resume
  it('saveResume then getResume returns the saved resume', async () => {
    const resume = makeValidResume()
    await adapter.saveResume(resume)
    const result = await adapter.getResume(resume.id)
    expect(result).toEqual(resume)
  })

  // Test 2: getResume with nonexistent id returns null
  it('getResume with nonexistent id returns null', async () => {
    const result = await adapter.getResume('00000000-0000-0000-0000-000000000000')
    expect(result).toBeNull()
  })

  // Test 3: deleteResume → getResume returns null
  it('deleteResume removes the resume so getResume returns null', async () => {
    const resume = makeValidResume()
    await adapter.saveResume(resume)
    await adapter.deleteResume(resume.id)
    const result = await adapter.getResume(resume.id)
    expect(result).toBeNull()
  })

  // Test 4: listResumes returns all saved resumes
  it('listResumes returns all saved resumes', async () => {
    const resume1 = makeValidResume({ id: '123e4567-e89b-12d3-a456-426614174001' })
    const resume2 = makeValidResume({ id: '523e4567-e89b-12d3-a456-426614174001' })
    await adapter.saveResume(resume1)
    await adapter.saveResume(resume2)
    const results = await adapter.listResumes()
    expect(results).toHaveLength(2)
    const ids = results.map((r) => r.id)
    expect(ids).toContain(resume1.id)
    expect(ids).toContain(resume2.id)
  })

  // Test 5: corrupt data in localStorage returns null (Zod rejects it)
  it('getResume returns null for corrupt (Zod-invalid) data', async () => {
    localStorage.setItem('rese:resume:bad-id', '{"not": "valid"}')
    const result = await adapter.getResume('bad-id')
    expect(result).toBeNull()
  })

  // Test 6: saveJobDescription → getJobDescription returns same JD
  it('saveJobDescription then getJobDescription returns the saved JD', async () => {
    const jd = makeValidJobDescription()
    await adapter.saveJobDescription(jd)
    const result = await adapter.getJobDescription(jd.id)
    expect(result).toEqual(jd)
  })

  // Test 7: exportAll returns JSON string containing all stored data
  it('exportAll returns a JSON string with all rese: prefixed data', async () => {
    const resume = makeValidResume()
    await adapter.saveResume(resume)
    const exported = await adapter.exportAll()
    expect(typeof exported).toBe('string')
    const parsed = JSON.parse(exported)
    expect(parsed[`rese:resume:${resume.id}`]).toBeDefined()
  })

  // Test 8: importAll → getResume returns imported resume
  it('importAll then getResume returns the imported resume', async () => {
    const resume = makeValidResume()
    // Build the export JSON manually to simulate a prior export
    const exportData = {
      [`rese:resume:${resume.id}`]: resume,
    }
    await adapter.importAll(JSON.stringify(exportData))
    const result = await adapter.getResume(resume.id)
    expect(result).toEqual(resume)
  })

  // Test 9: getSchemaVersion returns 0 when not set
  it('getSchemaVersion returns 0 when not set', async () => {
    const version = await adapter.getSchemaVersion()
    expect(version).toBe(0)
  })

  // Test 10: setSchemaVersion then getSchemaVersion returns the version
  it('setSchemaVersion(2) then getSchemaVersion returns 2', async () => {
    await adapter.setSchemaVersion(2)
    const version = await adapter.getSchemaVersion()
    expect(version).toBe(2)
  })

  // Test 11: getJobDescription with nonexistent id returns null
  it('getJobDescription with nonexistent id returns null', async () => {
    const result = await adapter.getJobDescription('00000000-0000-0000-0000-000000000000')
    expect(result).toBeNull()
  })

  // Test 12: deleteJobDescription removes the JD
  it('deleteJobDescription removes the JD so getJobDescription returns null', async () => {
    const jd = makeValidJobDescription()
    await adapter.saveJobDescription(jd)
    await adapter.deleteJobDescription(jd.id)
    const result = await adapter.getJobDescription(jd.id)
    expect(result).toBeNull()
  })

  // Test 13: importAll ignores keys without the rese: prefix
  it('importAll ignores keys that do not start with rese: prefix', async () => {
    const maliciousData = {
      'other:key': { some: 'data' },
      'rese:schema-version': '99',
    }
    await adapter.importAll(JSON.stringify(maliciousData))
    // The non-rese: key should not be in storage
    expect(localStorage.getItem('other:key')).toBeNull()
    // The rese: key should be written
    const version = await adapter.getSchemaVersion()
    expect(version).toBe(99)
  })

  // Test 14: getResume handles malformed JSON without throwing
  it('getResume handles malformed JSON without throwing', async () => {
    localStorage.setItem('rese:resume:malformed-id', 'not valid json {{{')
    const result = await adapter.getResume('malformed-id')
    expect(result).toBeNull()
  })

  // Test 15: listResumes returns empty array when no resumes saved
  it('listResumes returns empty array when nothing is saved', async () => {
    const results = await adapter.listResumes()
    expect(results).toEqual([])
  })
})
