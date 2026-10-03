import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const client = axios.create({
  baseURL: API_URL,
  timeout: 120000
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
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error');
    const message = isNetworkError
      ? 'Không kết nối được máy chủ HALO HOLA API. Hãy kiểm tra backend đang chạy ở cổng 5000.'
      : (error.response?.data?.error || error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.');
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    wrapped.details = error.response?.data?.details;
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
  return unwrap(client.post('/submissions', form, { timeout: 0 }));
}

export function lookupSubmission(params) {
  return unwrap(client.get('/submissions/lookup', { params }));
}

export function getCampaignStats() {
  return unwrap(client.get('/submissions/stats'));
}

export function registerTour(payload) {
  return unwrap(client.post('/tour-registrations', payload));
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

export function getAdminTourRegistrations(params = {}) {
  return unwrap(client.get('/admin/tour-registrations', { params }));
}

export function getAdminSubmissions(params = {}) {
  return unwrap(client.get('/admin/submissions', { params }));
}

export function updateSubmissionStatus(id, status) {
  return unwrap(client.patch('/admin/submissions/' + encodeURIComponent(id) + '/status', { status }));
}

export function updateJuryNote(id, note) {
  return unwrap(client.patch('/admin/submissions/' + encodeURIComponent(id) + '/jury-note', { note }));
}

export function getOriginalDownload(mediaId) {
  return unwrap(client.get('/admin/media/' + encodeURIComponent(mediaId) + '/download'));
}

export { API_URL };
