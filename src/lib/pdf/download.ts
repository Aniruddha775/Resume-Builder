export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function buildResumeFilename(fullName: string | undefined): string {
  const base = (fullName ?? '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const safe = base.replace(/-+/g, '-').replace(/^-|-$/g, '')
  return `${safe || 'resume'}.pdf`
}
