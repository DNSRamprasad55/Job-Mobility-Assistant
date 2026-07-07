import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const jobAPI = {
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

export const applicationAPI = {
  apply: (jobId) => api.post('/applications/apply', { job_id: jobId }),
  getMy: () => api.get('/applications/my'),
  getAll: () => api.get('/applications/all'),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

export const aiAPI = {
  jobMatch: (jobId) => api.post('/ai/job-match', { job_id: jobId }),
  careerPlan: () => api.post('/ai/career-plan'),
  getCareerPlan: () => api.get('/ai/career-plan/latest'),
  resumeAnalysis: (resumeText) => api.post('/ai/resume-analysis', { resume_text: resumeText }),
  getResumeAnalyses: () => api.get('/ai/resume-analysis/latest'),
  getAnalytics: () => api.get('/ai/analytics'),
  getEmployeeDashboard: () => api.get('/ai/dashboard/employee'),
};

export default api;
