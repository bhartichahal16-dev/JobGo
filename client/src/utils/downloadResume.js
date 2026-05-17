export const downloadResumeBlob = (blob, fileName = 'resume.pdf') => {
  const pdfBlob =
    blob instanceof Blob ? blob : new Blob([blob], { type: 'application/pdf' })

  const url = URL.createObjectURL(pdfBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const downloadResumePdfWithFallback = async (resumeUrl, fileName = 'resume.pdf') => {
  const response = await fetch(resumeUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch resume')
  }

  const blob = await response.blob()
  downloadResumeBlob(blob, fileName)
}
