import axios from 'axios'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const isPdfBuffer = (buffer) => {
  const bytes = new Uint8Array(buffer)
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  )
}

const isDocxBuffer = (buffer) => {
  const bytes = new Uint8Array(buffer)
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  )
}

const getExtension = (resumeFileName = '', resumeUrl = '') => {
  const fromName = resumeFileName?.includes('.')
    ? resumeFileName.slice(resumeFileName.lastIndexOf('.')).toLowerCase()
    : ''
  if (fromName) return fromName

  const urlPath = resumeUrl.split('?')[0].toLowerCase()
  const dot = urlPath.lastIndexOf('.')
  return dot > -1 ? urlPath.slice(dot) : ''
}

const getClerkToken = async (getToken) => {
  if (!getToken) return null
  try {
    return await getToken({ skipCache: true })
  } catch {
    return await getToken()
  }
}

export const fetchResumeArrayBuffer = async ({
  resumeUrl,
  backendUrl,
  getToken,
}) => {
  if (!resumeUrl) {
    throw new Error('No resume URL')
  }

  const apiBase = backendUrl?.replace(/\/$/, '')

  if (!apiBase) {
    throw new Error('Backend URL is not configured')
  }

  if (!getToken) {
    throw new Error('Please login to run ATS check')
  }

  const token = await getClerkToken(getToken)
  if (!token) {
    throw new Error('Please login to run ATS check')
  }

  const { data } = await axios.get(`${apiBase}/api/users/download-resume`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'arraybuffer',
    validateStatus: (status) => status >= 200 && status < 300,
  })

  return data
}

const extractTextFromPdfBuffer = async (buffer) => {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(' ') + ' '
  }

  return text.trim()
}

const extractTextFromDocxBuffer = async (buffer) => {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return (result.value || '').trim()
}

export const extractTextFromResume = async ({
  resumeUrl,
  resumeFileName = '',
  backendUrl,
  getToken,
}) => {
  const buffer = await fetchResumeArrayBuffer({ resumeUrl, backendUrl, getToken })
  const ext = getExtension(resumeFileName, resumeUrl)

  if (isPdfBuffer(buffer) || ext === '.pdf') {
    return extractTextFromPdfBuffer(buffer)
  }

  if (isDocxBuffer(buffer) || ext === '.docx' || ext === '.docs') {
    return extractTextFromDocxBuffer(buffer)
  }

  if (ext === '.doc') {
    throw new Error('ATS check supports PDF and DOCX. Please upload PDF or DOCX.')
  }

  throw new Error('Unsupported resume format for ATS check')
}
