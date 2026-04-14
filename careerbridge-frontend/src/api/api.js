// ✅ Refactored with Env Variables and Cold Start Handling
const BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'https://careerbridge-backend-vw5s.onrender.com/api';

async function request(endpoint, options = {}, retries = 3) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server might be waking up, please try again.');
    }
    if (retries > 0 && (err.name === 'TypeError' || err.message.includes('fetch'))) {
      console.warn(`Retrying API call (${retries} left) for ${endpoint}...`, err);
      // Wait a bit before retrying (exponential backoff)
      await new Promise(res => setTimeout(res, 2000 * (4 - retries)));
      return request(endpoint, options, retries - 1);
    }
    console.error(`API Call Failed [${endpoint}]:`, err);
    throw new Error(err.message === 'Failed to fetch' 
      ? 'Backend is waking up (Render cold start) or Offline. Please try again in 10 seconds.' 
      : err.message
    );
  }
}

export const api = {
  auth: {
    login: (payload) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    register: (payload) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    me: () => request('/auth/me'),
  },

  users: {
    me: () => request('/users/me'),
    update: (payload) =>
      request('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    uploadResume: (formData) =>
      request('/users/me/resume', {
        method: 'POST',
        body: formData,
      }),
    readiness: () => request('/users/me/readiness'),
  },

  assessments: {
    list: () => request('/assessments/tests'),
    questions: (id) => request(`/assessments/tests/${id}/questions`),
    submit: (payload) =>
      request('/assessments/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    attempts: () => request('/assessments/attempts/me'),
    stats: () => request('/assessments/stats/me'),
  },

  internships: {
    list: (domain) =>
      request(`/internships${domain ? `?domain=${domain}` : ''}`),
    apply: (id) =>
      request('/internships/apply', {
        method: 'POST',
        body: JSON.stringify({ internship_id: id }),
      }),
    applications: () => request('/internships/applications/me'),
  },

  notifications: {
    list: () => request('/notifications'),
    markRead: (id) =>
      request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      request('/notifications/mark-all-read', { method: 'POST' }),
    delete: (id) =>
      request(`/notifications/${id}`, { method: 'DELETE' }),
  },

  interviews: {
    start: (payload) =>
      request('/interviews/start', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    submitResponse: (payload) =>
      request('/interviews/response', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    complete: (payload) =>
      request('/interviews/complete', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    sessions: () => request('/interviews/sessions/me'),
    stats: () => request('/interviews/stats/me'),
  },

  admin: {
    tests: {
      list: () => request('/admin/tests'),
      create: (payload) =>
        request('/admin/tests', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      update: (id, payload) =>
        request(`/admin/tests/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }),
      delete: (id) =>
        request(`/admin/tests/${id}`, { method: 'DELETE' }),
    },

    questions: {
      list: (testId) =>
        request(`/admin/tests/${testId}/questions`),
      add: (testId, payload) =>
        request(`/admin/tests/${testId}/questions`, {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      update: (testId, qId, payload) =>
        request(`/admin/tests/${testId}/questions/${qId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }),
      delete: (testId, qId) =>
        request(`/admin/tests/${testId}/questions/${qId}`, {
          method: 'DELETE',
        }),
    },

    users: {
      list: () => request('/admin/users'),
      action: (id, action) =>
        request(`/admin/users/${id}/action`, {
          method: 'POST',
          body: JSON.stringify({ action }),
        }),
    },

    analytics: () => request('/admin/analytics'),

    internships: {
      list: () => request('/admin/internships'),
      create: (payload) =>
        request('/admin/internships', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      update: (id, payload) =>
        request(`/admin/internships/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }),
      delete: (id) =>
        request(`/admin/internships/${id}`, {
          method: 'DELETE',
        }),
    },

    downloadStudentReport: async (userId) => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(
          `${BASE_URL}/admin/report/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to generate report');
        return await response.blob();
      } catch (err) {
        console.error('Report download failed:', err);
        throw err;
      }
    },
  },

  analytics: {
    dashboard: () => request('/analytics/dashboard'),
    downloadReport: async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(
          `${BASE_URL}/analytics/report`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok)
          throw new Error('Failed to download report');
        return await response.blob();
      } catch (err) {
        console.error('Analytics report download failed:', err);
        throw err;
      }
    },
  },
};