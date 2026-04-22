import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Resume } from '@/types/resume'
import '@/lib/pdf/fonts'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.5,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 40,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  name: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  contactLine: { fontSize: 9, marginBottom: 16, color: '#000000' },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  body: { fontSize: 10, lineHeight: 1.5 },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  companyTitle: { fontSize: 10, fontWeight: 600 },
  dates: { fontSize: 9 },
  bullet: { fontSize: 10, marginLeft: 8, marginVertical: 1 },
  eduLine: { fontSize: 10, marginTop: 4 },
  skillsLine: { fontSize: 10, marginTop: 4 },
})

export function ModernCleanTemplate({ resume }: { resume: Resume }) {
  const c = resume.sections.contactInfo
  const contactParts = [c.email, c.phone, c.location, c.linkedIn, c.website]
    .filter((p): p is string => typeof p === 'string' && p.length > 0)
    .join(' • ')

  return (
    <Document title={resume.title} author={c.fullName}>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{c.fullName || ' '}</Text>
        {contactParts ? (
          <Text style={styles.contactLine}>{contactParts}</Text>
        ) : (
          <Text style={styles.contactLine}> </Text>
        )}

        {resume.sections.summary ? (
          <>
            <Text style={styles.sectionHeading}>Summary</Text>
            <Text style={styles.body}>{resume.sections.summary}</Text>
          </>
        ) : null}

        {resume.sections.experience.length > 0 ? (
          <>
            <Text style={styles.sectionHeading}>Experience</Text>
            {resume.sections.experience.map((exp) => {
              const endLabel = exp.current ? 'Present' : (exp.endDate || '')
              return (
                <View key={exp.id} wrap={false}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.companyTitle}>
                      {exp.company}{exp.company && exp.title ? ' — ' : ''}{exp.title}
                    </Text>
                    <Text style={styles.dates}>
                      {exp.startDate}{(exp.startDate || endLabel) ? ' – ' : ''}{endLabel}
                    </Text>
                  </View>
                  {exp.bullets.map((b, i) => (
                    <Text key={i} style={styles.bullet}>• {b}</Text>
                  ))}
                </View>
              )
            })}
          </>
        ) : null}

        {resume.sections.education.length > 0 ? (
          <>
            <Text style={styles.sectionHeading}>Education</Text>
            {resume.sections.education.map((edu) => {
              const degreeField = [edu.degree, edu.field].filter(Boolean).join(', ')
              const gpaPart = edu.gpa ? ` — GPA ${edu.gpa}` : ''
              const date = edu.graduationDate ? ` (${edu.graduationDate})` : ''
              return (
                <Text key={edu.id} style={styles.eduLine}>
                  {edu.institution}{edu.institution && degreeField ? ' | ' : ''}{degreeField}{date}{gpaPart}
                </Text>
              )
            })}
          </>
        ) : null}

        {resume.sections.skills.length > 0 ? (
          <>
            <Text style={styles.sectionHeading}>Skills</Text>
            {resume.sections.skills.map((group, i) => (
              <Text key={i} style={styles.skillsLine}>
                {group.category}{group.category && group.items.length > 0 ? ': ' : ''}{group.items.join(', ')}
              </Text>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  )
}
