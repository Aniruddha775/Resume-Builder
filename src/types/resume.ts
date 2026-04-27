import { z } from 'zod'

export const ContactInfoSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().min(7),
  location: z.string(),
  linkedIn: z.string().url().optional(),
  website: z.string().url().optional(),
})

export const ExperienceSchema = z.object({
  id: z.string().uuid(),
  company: z.string(),
  title: z.string(),
  startDate: z.string(), // YYYY-MM format
  endDate: z.string().nullable(), // null if current
  current: z.boolean(),
  bullets: z.array(z.string()),
}).refine(
  (v) => v.current === (v.endDate === null),
  { message: 'current must be true if and only if endDate is null' }
)

export const EducationSchema = z.object({
  id: z.string().uuid(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  graduationDate: z.string(), // YYYY-MM format
  gpa: z.string().optional(),
})

export const SkillsSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
})

export const ResumeSectionsSchema = z.object({
  contactInfo: ContactInfoSchema,
  summary: z.string(),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillsSchema),
})

export const ResumeSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  sections: ResumeSectionsSchema,
})

// Inferred TypeScript types
export type ContactInfo = z.infer<typeof ContactInfoSchema>
export type Experience = z.infer<typeof ExperienceSchema>
export type Education = z.infer<typeof EducationSchema>
export type Skills = z.infer<typeof SkillsSchema>
export type ResumeSections = z.infer<typeof ResumeSectionsSchema>
export type Resume = z.infer<typeof ResumeSchema>
