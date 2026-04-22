import type { StateCreator } from 'zustand'
import type { AppState } from '../index'
import type { Resume, Experience, Education, Skills } from '@/types/resume'
import { tiptapJsonToSections } from '@/lib/tiptap/schema'

export interface ResumeSlice {
  resume: Resume | null
  setResume: (resume: Resume) => void
  updateBullet: (expIndex: number, bulletIndex: number, text: string) => void
  clearResume: () => void
  updateContactInfo: (patch: Partial<Resume['sections']['contactInfo']>) => void
  updateSummary: (summary: string) => void
  addExperience: () => string
  updateExperience: (id: string, patch: Partial<Omit<Experience, 'id'>>) => void
  removeExperience: (id: string) => void
  setExperienceBullets: (id: string, bullets: string[]) => void
  addEducation: () => string
  updateEducation: (id: string, patch: Partial<Omit<Education, 'id'>>) => void
  removeEducation: (id: string) => void
  addSkillGroup: () => number
  updateSkillGroup: (index: number, patch: Partial<Skills>) => void
  removeSkillGroup: (index: number) => void
  setResumeFromTiptap: (tiptapJson: unknown) => void
}

export const createResumeSlice: StateCreator<
  AppState,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  ResumeSlice
> = (set) => ({
  resume: null,
  setResume: (resume) =>
    set((state) => {
      state.resume = resume
    }),
  updateBullet: (expIndex, bulletIndex, text) =>
    set((state) => {
      if (state.resume?.sections.experience[expIndex]) {
        state.resume.sections.experience[expIndex].bullets[bulletIndex] = text
      }
    }),
  clearResume: () =>
    set((state) => {
      state.resume = null
    }),
  updateContactInfo: (patch) =>
    set((state) => {
      if (!state.resume) return
      Object.assign(state.resume.sections.contactInfo, patch)
      state.resume.updatedAt = new Date().toISOString()
    }),
  updateSummary: (summary) =>
    set((state) => {
      if (!state.resume) return
      state.resume.sections.summary = summary
      state.resume.updatedAt = new Date().toISOString()
    }),
  addExperience: () => {
    const newId = crypto.randomUUID()
    set((state) => {
      if (!state.resume) return
      state.resume.sections.experience.push({
        id: newId, company: '', title: '', startDate: '', endDate: null, current: true, bullets: [],
      })
      state.resume.updatedAt = new Date().toISOString()
    })
    return newId
  },
  updateExperience: (id, patch) =>
    set((state) => {
      if (!state.resume) return
      const entry = state.resume.sections.experience.find((e) => e.id === id)
      if (!entry) return
      Object.assign(entry, patch)
      state.resume.updatedAt = new Date().toISOString()
    }),
  removeExperience: (id) =>
    set((state) => {
      if (!state.resume) return
      state.resume.sections.experience = state.resume.sections.experience.filter((e) => e.id !== id)
      state.resume.updatedAt = new Date().toISOString()
    }),
  setExperienceBullets: (id, bullets) =>
    set((state) => {
      if (!state.resume) return
      const entry = state.resume.sections.experience.find((e) => e.id === id)
      if (!entry) return
      entry.bullets = bullets
      state.resume.updatedAt = new Date().toISOString()
    }),
  addEducation: () => {
    const newId = crypto.randomUUID()
    set((state) => {
      if (!state.resume) return
      state.resume.sections.education.push({
        id: newId, institution: '', degree: '', field: '', graduationDate: '',
      })
      state.resume.updatedAt = new Date().toISOString()
    })
    return newId
  },
  updateEducation: (id, patch) =>
    set((state) => {
      if (!state.resume) return
      const entry = state.resume.sections.education.find((e) => e.id === id)
      if (!entry) return
      Object.assign(entry, patch)
      state.resume.updatedAt = new Date().toISOString()
    }),
  removeEducation: (id) =>
    set((state) => {
      if (!state.resume) return
      state.resume.sections.education = state.resume.sections.education.filter((e) => e.id !== id)
      state.resume.updatedAt = new Date().toISOString()
    }),
  addSkillGroup: () => {
    let newIndex = 0
    set((state) => {
      if (!state.resume) return
      state.resume.sections.skills.push({ category: '', items: [] })
      newIndex = state.resume.sections.skills.length - 1
      state.resume.updatedAt = new Date().toISOString()
    })
    return newIndex
  },
  updateSkillGroup: (index, patch) =>
    set((state) => {
      if (!state.resume) return
      const group = state.resume.sections.skills[index]
      if (!group) return
      Object.assign(group, patch)
      state.resume.updatedAt = new Date().toISOString()
    }),
  removeSkillGroup: (index) =>
    set((state) => {
      if (!state.resume) return
      state.resume.sections.skills.splice(index, 1)
      state.resume.updatedAt = new Date().toISOString()
    }),
  setResumeFromTiptap: (tiptapJson) =>
    set((state) => {
      if (!state.resume) return
      const patch = tiptapJsonToSections(tiptapJson, state.resume.sections)
      if (patch.summary !== undefined) state.resume.sections.summary = patch.summary
      if (patch.experience !== undefined) state.resume.sections.experience = patch.experience
      if (patch.education !== undefined) state.resume.sections.education = patch.education
      state.resume.updatedAt = new Date().toISOString()
    }),
})
