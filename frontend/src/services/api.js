import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const client = axios.create({
  baseURL: API_URL,
  timeout: 20000
});

client.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

function unwrap(promise) {
  return promise.then((res) => res.data).catch((error) => {
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    throw wrapped;
  });
}

export function getAdminToken() {
  try {
    return localStorage.getItem('halo_hola_admin_token');
  } catch {
    return null;
  }
}

export function setAdminToken(token) {
  try {
    if (token) localStorage.setItem('halo_hola_admin_token', token);
    else localStorage.removeItem('halo_hola_admin_token');
  } catch {
    // Ignore storage errors.
  }
}

export function healthCheck() {
  return unwrap(client.get('/health'));
}

export function submitArtwork(payload) {
  const form = new FormData();
  Object.entries(payload.fields || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  });
  (payload.files || []).forEach((file) => form.append('files', file));
  return unwrap(client.post('/submissions', form));
}

export function getPlaces() {
  return unwrap(client.get('/places'));
}

export function getTours() {
  return unwrap(client.get('/tours'));
}

export function getStories() {
  return unwrap(client.get('/stories'));
}

export function adminLogin(payload) {
  return unwrap(client.post('/auth/login', payload));
}

export function getAdminSubmissions(params = {}) {
  return unwrap(client.get('/admin/submissions', { params }));
}

export function updateSubmissionStatus(id, status) {
  return unwrap(client.patch('/admin/submissions/' + encodeURIComponent(id) + '/status', { status }));
}

export { API_URL };
