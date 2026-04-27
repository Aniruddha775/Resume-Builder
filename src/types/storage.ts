import type { Resume } from './resume'
import type { JobDescription } from './job-description'

export interface StorageAdapter {
  getResume(id: string): Promise<Resume | null>
  saveResume(resume: Resume): Promise<void>
  deleteResume(id: string): Promise<void>
  listResumes(): Promise<Resume[]>
  getJobDescription(id: string): Promise<JobDescription | null>
  saveJobDescription(jd: JobDescription): Promise<void>
  deleteJobDescription(id: string): Promise<void>
  exportAll(): Promise<string>
  importAll(data: string): Promise<void>
  getSchemaVersion(): Promise<number>
  setSchemaVersion(version: number): Promise<void>
}
