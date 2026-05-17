const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'can', 'this', 'that', 'these', 'those', 'it', 'its', 'we', 'you', 'your', 'our',
  'they', 'them', 'their', 'he', 'she', 'his', 'her', 'who', 'which', 'what', 'when',
  'where', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'any', 'if', 'while', 'also', 'etc', 'able', 'using',
  'use', 'used', 'work', 'working', 'looking', 'looking', 'join', 'team', 'role',
  'position', 'job', 'company', 'years', 'year', 'experience', 'required', 'preferred',
])

export const stripHtml = (html = '') => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const tokenize = (text = '') => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
}

const unique = (words) => [...new Set(words)]

export const extractJobKeywords = (job) => {
  const descriptionText = stripHtml(job.description || '')
  const extraText = [job.title, job.category, job.level, job.location]
    .filter(Boolean)
    .join(' ')

  return unique(tokenize(`${descriptionText} ${extraText}`))
}

export const calculateAtsScore = (resumeText, jobKeywords) => {
  if (!resumeText?.trim() || !jobKeywords?.length) {
    return { score: 0, matched: [], missing: jobKeywords || [] }
  }

  const resumeWords = new Set(tokenize(resumeText))

  const matched = []
  const missing = []

  for (const keyword of jobKeywords) {
    const found =
      resumeWords.has(keyword) ||
      [...resumeWords].some(
        word => word.includes(keyword) || keyword.includes(word)
      )

    if (found) matched.push(keyword)
    else missing.push(keyword)
  }

  const score = Math.round((matched.length / jobKeywords.length) * 100)

  return {
    score: Math.min(100, score),
    matched,
    missing,
  }
}

export const getScoreColor = (score) => {
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
}
