const BASE_URL = 'http://localhost:8000/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { ...options.headers }

  // Only set Content-Type to JSON if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Something went wrong')
  }

  return response.json()
}

export const api = {
  auth: {
    login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    me: () => request('/auth/me'),
  },
  users: {
    me: () => request('/users/me'),
    update: (payload) => request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) }),
    uploadResume: (formData) => request('/users/me/resume', { method: 'POST', body: formData }),
    readiness: () => request('/users/me/readiness'),
  },
  assessments: {
    list: () => request('/assessments/tests'),
    questions: (id) => request(`/assessments/tests/${id}/questions`),
    submit: (payload) => request('/assessments/submit', { method: 'POST', body: JSON.stringify(payload) }),
    attempts: () => request('/assessments/attempts/me'),
    stats: () => request('/assessments/stats/me'),
  },
  internships: {
    list: (domain) => request(`/internships/${domain ? `?domain=${domain}` : ''}`),
    apply: (id) => request('/internships/apply', { method: 'POST', body: JSON.stringify({ internship_id: id }) }),
    applications: () => request('/internships/applications/me'),
  },
  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/mark-all-read', { method: 'POST' }),
    delete: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
  },
  interviews: {
    start: (payload) => request('/interviews/start', { method: 'POST', body: JSON.stringify(payload) }),
    submitResponse: (payload) => request('/interviews/response', { method: 'POST', body: JSON.stringify(payload) }),
    complete: (payload) => request('/interviews/complete', { method: 'POST', body: JSON.stringify(payload) }),
    sessions: () => request('/interviews/sessions/me'),
    stats: () => request('/interviews/stats/me'),
  },
  admin: {
    tests: {
      list: () => request('/admin/tests'),
      create: (payload) => request('/admin/tests', { method: 'POST', body: JSON.stringify(payload) }),
      update: (id, payload) => request(`/admin/tests/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
      delete: (id) => request(`/admin/tests/${id}`, { method: 'DELETE' }),
    },
    questions: {
      list: (testId) => request(`/admin/tests/${testId}/questions`),
      add: (testId, payload) => request(`/admin/tests/${testId}/questions`, { method: 'POST', body: JSON.stringify(payload) }),
      update: (testId, qId, payload) => request(`/admin/tests/${testId}/questions/${qId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
      delete: (testId, qId) => request(`/admin/tests/${testId}/questions/${qId}`, { method: 'DELETE' }),
    },
    users: {
      list: () => request('/admin/users'),
      action: (id, action) => request(`/admin/users/${id}/action`, { method: 'POST', body: JSON.stringify({ action }) }),
    },
    analytics: () => request('/admin/analytics'),
    internships: {
      list: () => request('/admin/internships'),
      create: (payload) => request('/admin/internships', { method: 'POST', body: JSON.stringify(payload) }),
      update: (id, payload) => request(`/admin/internships/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
      delete: (id) => request(`/admin/internships/${id}`, { method: 'DELETE' }),
    },
  },
  analytics: {
    dashboard: () => request('/analytics/dashboard'),
    downloadReport: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(`${BASE_URL}/analytics/report`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to download report')
      return response.blob()
    }
  }
}
