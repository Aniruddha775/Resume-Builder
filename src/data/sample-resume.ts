import type { Resume } from '@/types/resume'

export const SAMPLE_RESUME: Resume = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Software Engineer Resume',
  createdAt: '2026-04-22T00:00:00.000Z',
  updatedAt: '2026-04-22T00:00:00.000Z',
  sections: {
    contactInfo: {
      fullName: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 012-3456',
      location: 'San Francisco, CA',
      linkedIn: 'https://linkedin.com/in/alexjohnson',
      website: 'https://alexjohnson.dev',
    },
    summary:
      'Full-stack software engineer with 6+ years building resilient web applications. Specializes in React, TypeScript, and cloud-native backends, with a track record of shipping customer-facing products at scale.',
    experience: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        company: 'Acme Corp',
        title: 'Senior Software Engineer',
        startDate: '2022-03',
        endDate: null,
        current: true,
        bullets: [
          'Led migration of legacy Express services to a Next.js + tRPC monorepo, cutting p95 latency by 45%.',
          'Shipped billing and subscription features used by 40,000+ active customers with zero production incidents.',
          'Mentored three engineers through design reviews and pairing sessions on critical payment flows.',
        ],
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        company: 'Startup Inc',
        title: 'Software Engineer',
        startDate: '2019-06',
        endDate: '2022-02',
        current: false,
        bullets: [
          'Built the first version of the customer onboarding flow in React, increasing activation by 27%.',
          'Designed a Postgres-backed event pipeline that processed 10M daily events with sub-second p99 latency.',
          'Owned on-call rotation and authored runbooks that reduced median incident resolution time by half.',
        ],
      },
    ],
    education: [
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        institution: 'University of Illinois Urbana-Champaign',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduationDate: '2019-05',
        gpa: '3.8',
      },
    ],
    skills: [
      { category: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Go'] },
      { category: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'Express', 'tRPC'] },
      { category: 'Tools', items: ['Postgres', 'Redis', 'Docker', 'AWS', 'GitHub Actions'] },
    ],
  },
}
