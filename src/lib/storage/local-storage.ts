import type { StorageAdapter } from '@/types/storage'
import type { Resume } from '@/types/resume'
import type { JobDescription } from '@/types/job-description'
import { ResumeSchema } from '@/types/resume'
import { JobDescriptionSchema } from '@/types/job-description'

const STORAGE_PREFIX = 'rese:'
const SCHEMA_VERSION_KEY = `${STORAGE_PREFIX}schema-version`

export class LocalStorageAdapter implements StorageAdapter {
  // ---------------------------------------------------------------------------
  // Resume operations
  // ---------------------------------------------------------------------------

  async getResume(id: string): Promise<Resume | null> {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}resume:${id}`)
    if (!raw) return null
    try {
      const parsed = ResumeSchema.safeParse(JSON.parse(raw))
      if (!parsed.success) {
        console.warn('Invalid resume data in localStorage:', parsed.error)
        return null
      }
      return parsed.data
    } catch {
      return null
    }
  }

  async saveResume(resume: Resume): Promise<void> {
    localStorage.setItem(
      `${STORAGE_PREFIX}resume:${resume.id}`,
      JSON.stringify(resume),
    )
  }

  async deleteResume(id: string): Promise<void> {
    localStorage.removeItem(`${STORAGE_PREFIX}resume:${id}`)
  }

  async listResumes(): Promise<Resume[]> {
    const resumes: Resume[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(`${STORAGE_PREFIX}resume:`)) {
        const raw = localStorage.getItem(key)
        if (raw) {
          try {
            const parsed = ResumeSchema.safeParse(JSON.parse(raw))
            if (!parsed.success) {
              console.warn(`Invalid resume data in localStorage for key ${key}:`, parsed.error)
              continue
            }
            resumes.push(parsed.data)
          } catch {
            // skip corrupt entries silently
          }
        }
      }
    }
    return resumes
  }

  // ---------------------------------------------------------------------------
  // JobDescription operations
  // ---------------------------------------------------------------------------

  async getJobDescription(id: string): Promise<JobDescription | null> {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}jd:${id}`)
    if (!raw) return null
    try {
      const parsed = JobDescriptionSchema.safeParse(JSON.parse(raw))
      if (!parsed.success) {
        console.warn('Invalid job description data in localStorage:', parsed.error)
        return null
      }
      return parsed.data
    } catch {
      return null
    }
  }

  async saveJobDescription(jd: JobDescription): Promise<void> {
    localStorage.setItem(
      `${STORAGE_PREFIX}jd:${jd.id}`,
      JSON.stringify(jd),
    )
  }

  async deleteJobDescription(id: string): Promise<void> {
    localStorage.removeItem(`${STORAGE_PREFIX}jd:${id}`)
  }

  // ---------------------------------------------------------------------------
  // Schema version
  // ---------------------------------------------------------------------------

  async getSchemaVersion(): Promise<number> {
    const raw = localStorage.getItem(SCHEMA_VERSION_KEY)
    if (!raw) return 0
    const parsed = parseInt(raw, 10)
    return isNaN(parsed) ? 0 : parsed
  }

  async setSchemaVersion(version: number): Promise<void> {
    if (!Number.isInteger(version) || version < 0) {
      throw new Error(`setSchemaVersion: expected non-negative integer, got ${version}`)
    }
    localStorage.setItem(SCHEMA_VERSION_KEY, String(version))
  }

  // ---------------------------------------------------------------------------
  // Export / import
  // ---------------------------------------------------------------------------

  async exportAll(): Promise<string> {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key)
        if (raw) {
          try {
            data[key] = JSON.parse(raw)
          } catch {
            // include raw string for non-JSON values (e.g. schema-version)
            data[key] = raw
          }
        }
      }
    }
    return JSON.stringify(data, null, 2)
  }

  async importAll(jsonString: string): Promise<void> {
    let data: Record<string, unknown>
    try {
      data = JSON.parse(jsonString) as Record<string, unknown>
    } catch {
      throw new Error('importAll: invalid JSON string')
    }
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith(STORAGE_PREFIX)) {
        // Primitives (strings, numbers) are stored as-is; objects/arrays are JSON-encoded
        if (typeof value === 'string') {
          localStorage.setItem(key, value)
        } else {
          localStorage.setItem(key, JSON.stringify(value))
        }
      }
    }
  }
}
