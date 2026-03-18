import axios from 'axios';

// Axios instance with base URL — all API calls go through this
const API = axios.create({ baseURL: 'http://localhost:5000/api' });
// Attach JWT token from localStorage to every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    // Auto-logout on 401 — clears storage and redirects to login
    const status = err.response?.status;

    // Avoid redirect loop if no token exists (e.g. already on login page)
    if (status === 401) {
      // Only logout if token exists (expired session)
      const token = localStorage.getItem("token");

      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // React way navigation safer than reload
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data: { email: string; password: string }) => API.post('/auth/login', data),
  register: (data: any) => API.post('/auth/register', data),
  forgotPassword: (email: string) => API.post('/auth/forgot-password', { email }),
  verifyCode: (data: { email: string; code: string }) => API.post('/auth/verify-code', data),
  resetPassword: (data: { resetToken: string; newPassword: string }) => API.post('/auth/reset-password', data),
  getMe: () => API.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) => API.put('/auth/change-password', data),
};

// Users
export const userAPI = {
  getAll: (params?: any) => API.get('/users', { params }),
  getById: (id: string) => API.get(`/users/${id}`),
  create: (data: any) => API.post('/users', data),
  update: (id: string, data: any) => API.put(`/users/${id}`, data),
  delete: (id: string) => API.delete(`/users/${id}`),
  updateProfile: (data: FormData) => API.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDepartments: () => API.get('/users/departments'),
};

// Leaves
export const leaveAPI = {
  create: (data: FormData) => API.post('/leaves', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMy: (params?: any) => API.get('/leaves/my', { params }),
  getAll: (params?: any) => API.get('/leaves/all', { params }),
  getPending: () => API.get('/leaves/pending'),
  getById: (id: string) => API.get(`/leaves/${id}`),
  cancel: (id: string) => API.put(`/leaves/${id}/cancel`),
  review: (id: string, data: { action: string; comment?: string }) => API.put(`/leaves/${id}/review`, data),
};

// Leave Types
export const leaveTypeAPI = {
  getAll: () => API.get('/leave-types'),
  getAllAdmin: () => API.get('/leave-types/all'),
  create: (data: any) => API.post('/leave-types', data),
  update: (id: string, data: any) => API.put(`/leave-types/${id}`, data),
  delete: (id: string) => API.delete(`/leave-types/${id}`),
};

// Notifications
export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  markRead: (id: string) => API.put(`/notifications/${id}/read`),
};

// Reports
export const reportAPI = {
  getDashboard: () => API.get('/reports/dashboard'),
  getLeaveReport: (params?: any) => API.get('/reports/leaves', { params }),
  getCalendar: (year: number, month: number) => API.get('/reports/calendar', { params: { year, month } }),
};

// Settings
export const settingsAPI = {
  get: () => API.get('/settings'),
  update: (data: any) => API.put('/settings', data),
};

// Audit
export const auditAPI = {
  getLogs: (params?: any) => API.get('/audit', { params }),
};

export default API;
