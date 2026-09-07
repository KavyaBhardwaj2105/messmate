import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => { accessToken = token || null; };
export const getAccessToken = () => accessToken;
export const AUTH_EVENTS = { SESSION_EXPIRED: 'messmate:session-expired' };

const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000, withCredentials: true, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

const doRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => { accessToken = res.data.token; return accessToken; })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config || {};
  if (error.response?.status === 401 && !original._retry && !String(original.url || '').includes('/auth/refresh')) {
    original._retry = true;
    try {
      await doRefresh();
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch {
      accessToken = null;
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SESSION_EXPIRED));
    }
  }
  const customMessage = error.code === 'ECONNABORTED' ? 'The request took too long. Please try again.' : (!error.response ? 'Could not reach the server. Please check your connection.' : error.response?.data?.message || error.message || 'Something went wrong.');
  return Promise.reject(new Error(customMessage));
});

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  refresh: () => doRefresh(),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getMe: () => api.get('/auth/me'),
};
export const uploadService = { uploadImages: (images) => api.post('/uploads/images', { images }) };
export const hostelService = { getAll: (params) => api.get('/hostels', { params }), getById: (id) => api.get(`/hostels/${id}`), create: (data) => api.post('/hostels', data), update: (id, data) => api.put(`/hostels/${id}`, data), delete: (id) => api.delete(`/hostels/${id}`), getCities: () => api.get('/hostels/meta/cities'), getMyHostels: () => api.get('/hostels/user/me') };
export const reviewService = { getForHostel: (hostelId, params) => api.get(`/hostels/${hostelId}/reviews`, { params }), postForHostel: (hostelId, data) => api.post(`/hostels/${hostelId}/reviews`, data), update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data), delete: (reviewId) => api.delete(`/reviews/${reviewId}`), getMyReviews: () => api.get('/reviews/user/me') };
export default api;
