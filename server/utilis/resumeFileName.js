/** Download name: same base as upload, extension always .pdf (e.g. shubham.docs → shubham.pdf) */
export const toPdfDownloadName = (originalFileName, fallbackName = 'resume') => {
  let base = 'resume'

  if (originalFileName?.trim()) {
    const name = originalFileName.trim()
    const dot = name.lastIndexOf('.')
    base = dot > 0 ? name.slice(0, dot) : name
  } else if (fallbackName?.trim()) {
    base = fallbackName.trim()
  }

  base =
    base
      .replace(/[^\w\s.-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'resume'

  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`
}
