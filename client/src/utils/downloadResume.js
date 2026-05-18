import axios from 'axios'
import { toPdfDownloadName } from './resumeFileName'

const parseFilenameFromHeaders = (headers, fallback) => {
  const disposition = headers?.['content-disposition'] || headers?.['Content-Disposition']
  if (!disposition) return fallback

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;\n]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/"/g, ''))
  }

  const plainMatch = disposition.match(/filename="?([^";\n]+)"?/i)
  if (plainMatch?.[1]) {
    return plainMatch[1].replace(/"/g, '')
  }

  return fallback
}

const isValidResumeBlob = async (blob) => {
  if (!(blob instanceof Blob) || blob.size < 4) return false
  if (blob.type?.includes('application/json')) return false

  const bytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
  if (bytes[0] === 0x7b) return false

  return true
}

export const downloadResumeBlob = (blob, fileName) => {
  const safeName = toPdfDownloadName(fileName)

  const file =
    blob instanceof File
      ? new File([blob], safeName, { type: blob.type || 'application/octet-stream' })
      : new File([blob], safeName, { type: 'application/octet-stream' })

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', safeName)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()

  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 500)
}

const getClerkToken = async (getToken) => {
  if (!getToken) return null
  try {
    return await getToken({ skipCache: true })
  } catch {
    return await getToken()
  }
}

const downloadBlobFromApi = async ({
  url,
  headers,
  fileName,
}) => {
  const response = await axios.get(url, {
    headers,
    responseType: 'blob',
    validateStatus: (status) => status >= 200 && status < 300,
  })

  const contentType = response.headers['content-type'] || ''
  if (contentType.includes('application/json')) {
    const message = await response.data.text()
    try {
      const parsed = JSON.parse(message)
      throw new Error(parsed.message || 'Download failed')
    } catch (parseError) {
      if (parseError.message && parseError.message !== 'Download failed') {
        throw parseError
      }
      throw new Error(message || 'Download failed')
    }
  }

  if (!(await isValidResumeBlob(response.data))) {
    throw new Error('Invalid resume file received')
  }

  const resolvedName = parseFilenameFromHeaders(response.headers, fileName)
  downloadResumeBlob(response.data, resolvedName)
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

  const apiBase = backendUrl?.replace(/\/$/, '')
  if (!apiBase) {
    throw new Error('Backend URL is not configured')
  }

  const fileName = toPdfDownloadName(originalFileName, fallbackName)
  const token = await getClerkToken(getToken)

  if (!token) {
    throw new Error('Please login to download your resume')
  }

  await downloadBlobFromApi({
    url: `${apiBase}/api/users/download-resume`,
    headers: { Authorization: `Bearer ${token}` },
    fileName,
  })
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

  const apiBase = backendUrl?.replace(/\/$/, '')
  if (!apiBase) {
    throw new Error('Backend URL is not configured')
  }

  if (!companyToken) {
    throw new Error('Please login as recruiter to download resume')
  }

  const fileName = toPdfDownloadName(originalFileName, fallbackName)

  await downloadBlobFromApi({
    url: `${apiBase}/api/company/download-resume/${applicationId}`,
    headers: { token: companyToken },
    fileName,
  })
}
