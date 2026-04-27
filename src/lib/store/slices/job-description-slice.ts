import type { StateCreator } from 'zustand'
import type { AppState } from '../index'
import type { JobDescription } from '@/types/job-description'

export interface JobDescriptionSlice {
  jobDescription: JobDescription | null
  setJobDescription: (jd: JobDescription) => void
  clearJobDescription: () => void
}

export const createJobDescriptionSlice: StateCreator<
  AppState,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  JobDescriptionSlice
> = (set) => ({
  jobDescription: null,
  setJobDescription: (jd) =>
    set((state) => {
      state.jobDescription = jd
    }),
  clearJobDescription: () =>
    set((state) => {
      state.jobDescription = null
    }),
})
