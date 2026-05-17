import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export const extractTextFromResumeUrl = async (resumeUrl) => {
  if (!resumeUrl) {
    throw new Error('No resume URL')
  }

  const response = await fetch(resumeUrl)
  if (!response.ok) {
    throw new Error('Could not load resume file')
  }

  const buffer = await response.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + ' '
  }

  return text.trim()
}
