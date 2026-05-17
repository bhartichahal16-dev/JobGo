import fs from 'fs'
import path from 'path'
import { uploadsDir } from './uploadFile.js'

export const fetchResumeBuffer = async (resumeUrl) => {
  if (!resumeUrl) {
    throw new Error('No resume URL')
  }

  const uploadsMarker = '/uploads/'
  if (resumeUrl.includes(uploadsMarker)) {
    const filename = decodeURIComponent(
      resumeUrl.split(uploadsMarker)[1].split('?')[0]
    )
    const filePath = path.join(uploadsDir, filename)

    if (!fs.existsSync(filePath)) {
      throw new Error('Resume file not found')
    }

    return fs.readFileSync(filePath)
  }

  const response = await fetch(resumeUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch resume from storage')
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
