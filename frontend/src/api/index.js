import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Auto-inject JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ct_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ct_token');
      localStorage.removeItem('ct_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: () => api.get('/projects/stats'),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getByProject: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  getById: (id) => api.get(`/projects/0/tasks/${id}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, id, data) => api.put(`/projects/${projectId}/tasks/${id}`, data),
  delete: (projectId, id) => api.delete(`/projects/${projectId}/tasks/${id}`),
  getMyTasks: () => api.get('/tasks/my'),
};

// ─── Materials ───────────────────────────────────────────────────────────────
export const materialsAPI = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/materials`),
  getSummary: (projectId) => api.get(`/projects/${projectId}/materials/summary`),
  create: (projectId, data) => api.post(`/projects/${projectId}/materials`, data),
  update: (projectId, id, data) => api.put(`/projects/${projectId}/materials/${id}`, data),
  delete: (projectId, id) => api.delete(`/projects/${projectId}/materials/${id}`),
};

// ─── Budget ───────────────────────────────────────────────────────────────────
export const budgetAPI = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/budget`),
  getSummary: (projectId) => api.get(`/projects/${projectId}/budget/summary`),
  create: (projectId, data) => api.post(`/projects/${projectId}/budget`, data),
  update: (projectId, id, data) => api.put(`/projects/${projectId}/budget/${id}`, data),
  delete: (projectId, id) => api.delete(`/projects/${projectId}/budget/${id}`),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: () => api.get('/users'),
  getWorkers: () => api.get('/users/workers'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;