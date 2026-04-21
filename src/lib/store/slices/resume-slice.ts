import type { StateCreator } from 'zustand'
import type { AppState } from '../index'
import type { Resume } from '@/types/resume'

export interface ResumeSlice {
  resume: Resume | null
  setResume: (resume: Resume) => void
  updateBullet: (expIndex: number, bulletIndex: number, text: string) => void
  clearResume: () => void
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
})
