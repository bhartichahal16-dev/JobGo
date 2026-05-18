import axios from 'axios'
import { toPdfDownloadName } from './resumeFileName'

export const getResumeFetchUrl = (url) => url

const isValidResumeBlob = async (blob) => {
  if (!(blob instanceof Blob) || blob.size < 4) return false
  if (blob.type?.includes('application/json')) return false

  const bytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
  if (bytes[0] === 0x7b) return false

  return true
}

export const downloadResumeBlob = (blob, fileName, { alreadyPdfName = false } = {}) => {
  const safeName = alreadyPdfName ? fileName : toPdfDownloadName(fileName)

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', safeName)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()

  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 200)
}

export const downloadResumePdfWithFallback = async (resumeUrl, fileName) => {
  const response = await fetch(getResumeFetchUrl(resumeUrl))

  if (!response.ok) {
    throw new Error('Failed to fetch resume')
  }

  const blob = await response.blob()

  if (!(await isValidResumeBlob(blob))) {
    throw new Error('Resume file is empty')
  }

  downloadResumeBlob(blob, fileName, { alreadyPdfName: true })
}

export const downloadResumeFromApi = async ({
  backendUrl,
  getToken,
  headers = {},
  apiPath,
  fileName,
}) => {
  const token = await getToken?.()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await axios.get(`${backendUrl}${apiPath}`, {
    headers: { Authorization: `Bearer ${token}`, ...headers },
    responseType: 'blob',
    validateStatus: (status) => status === 200,
  })

  if (!(await isValidResumeBlob(response.data))) {
    throw new Error('Invalid resume response')
  }

  downloadResumeBlob(response.data, fileName, { alreadyPdfName: true })
}

export const downloadUserResume = async ({
  resumeUrl,
  backendUrl,
  getToken,
  originalFileName,
  fallbackName,
}) => {
  if (!resumeUrl) {
    throw new Error('No resume URL')
  }

  const fileName = toPdfDownloadName(originalFileName, fallbackName)

  if (backendUrl && getToken) {
    try {
      await downloadResumeFromApi({
        backendUrl,
        getToken,
        apiPath: '/api/users/download-resume',
        fileName,
      })
      return
    } catch {
      // API failed — try direct Cloudinary fetch
    }
  }

  await downloadResumePdfWithFallback(resumeUrl, fileName)
}

export const downloadApplicantResume = async ({
  resumeUrl,
  backendUrl,
  companyToken,
  applicationId,
  originalFileName,
  fallbackName,
}) => {
  if (!resumeUrl) {
    throw new Error('No resume URL')
  }

  const fileName = toPdfDownloadName(originalFileName, fallbackName)

  if (backendUrl && companyToken && applicationId) {
    try {
      const response = await axios.get(
        `${backendUrl}/api/company/download-resume/${applicationId}`,
        {
          headers: { token: companyToken },
          responseType: 'blob',
          validateStatus: (status) => status === 200,
        }
      )

      const contentType = response.headers['content-type'] || ''
      if (
        contentType.includes('application/json') ||
        !(await isValidResumeBlob(response.data))
      ) {
        throw new Error('Invalid resume response')
      }

      downloadResumeBlob(response.data, fileName, { alreadyPdfName: true })
      return

    } catch {
      // fall through to Cloudinary
    }
  }

  await downloadResumePdfWithFallback(resumeUrl, fileName)
}
