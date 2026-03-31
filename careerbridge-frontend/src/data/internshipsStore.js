import { INTERNS } from './quizData'

const STORAGE_KEY = 'careerbridge_internships'

export function loadInternships() {
  if (typeof window === 'undefined') return INTERNS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return INTERNS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INTERNS
  } catch {
    return INTERNS
  }
}

export function saveInternships(internships) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(internships))
}
