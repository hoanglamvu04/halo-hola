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
      ? 'Không kết nối được máy chủ HALO HOLA API. Hãy kiểm tra backend đang chạy.'
      : (error.response?.data?.error || error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.');
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    wrapped.details = error.response?.data?.details;
    throw wrapped;
  });
}

export function getAdminToken() {
  try { return localStorage.getItem('halo_hola_admin_token'); }
  catch { return null; }
}

export function setAdminToken(token) {
  try {
    if (token) localStorage.setItem('halo_hola_admin_token', token);
    else localStorage.removeItem('halo_hola_admin_token');
  } catch {}
}

export function healthCheck() { return unwrap(client.get('/health')); }

export function submitArtwork(payload) {
  const form = new FormData();
  Object.entries(payload.fields || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  });
  (payload.files || []).forEach((file) => form.append('files', file));
  return unwrap(client.post('/submissions', form, { timeout: 0 }));
}

export function lookupSubmission(params) { return unwrap(client.get('/submissions/lookup', { params })); }
export function getCampaignStats() { return unwrap(client.get('/submissions/stats')); }
export function registerTour(payload) { return unwrap(client.post('/tour-registrations', payload)); }
export function getPlaces() { return unwrap(client.get('/places')); }
export function getThemes() { return unwrap(client.get('/themes')); }
export function getTheme(slug) { return unwrap(client.get('/themes/' + encodeURIComponent(slug))); }
export function getPublicArtworks(params = {}) { return unwrap(client.get('/artworks', { params })); }
export function getPublicArtwork(slug) { return unwrap(client.get('/artworks/' + encodeURIComponent(slug))); }
export function getTours() { return unwrap(client.get('/tours')); }
export function getStories() { return unwrap(client.get('/stories')); }
export function getHomepageContent() { return unwrap(client.get('/site/homepage')); }

export function adminLogin(payload) { return unwrap(client.post('/auth/login', payload)); }
export function getCurrentUser() { return unwrap(client.get('/auth/me')); }

export function getAdminHomepageSections() { return unwrap(client.get('/admin/site/homepage')); }
export function updateAdminHomepageSection(sectionKey, payload) { return unwrap(client.put('/admin/site/homepage/' + encodeURIComponent(sectionKey), payload)); }
export function getAdminSiteAssets(params = {}) { return unwrap(client.get('/admin/site-assets', { params })); }
export function uploadAdminSiteAsset(sectionKey, file) {
  const form = new FormData(); form.append('sectionKey', sectionKey); form.append('file', file);
  return unwrap(client.post('/admin/site-assets', form, { timeout: 0 }));
}

export function getAdminTourRegistrations(params = {}) { return unwrap(client.get('/admin/tour-registrations', { params })); }
export function getAdminSubmissions(params = {}) { return unwrap(client.get('/admin/submissions', { params })); }
export function updateSubmissionStatus(id, status) { return unwrap(client.patch('/admin/submissions/' + encodeURIComponent(id) + '/status', { status })); }
export function updateJuryNote(id, note) { return unwrap(client.patch('/admin/submissions/' + encodeURIComponent(id) + '/jury-note', { note })); }
export function getOriginalDownload(mediaId) { return unwrap(client.get('/admin/media/' + encodeURIComponent(mediaId) + '/download')); }

// Dedicated Jury Workspace API: available to JUROR / MODERATOR / ADMIN.
export function getJurySubmissions(params = {}) { return unwrap(client.get('/jury/submissions', { params })); }
export function getJuryScorecard(submissionId) { return unwrap(client.get('/jury/submissions/' + encodeURIComponent(submissionId) + '/score')); }
export function saveJuryScore(submissionId, payload) { return unwrap(client.put('/jury/submissions/' + encodeURIComponent(submissionId) + '/score', payload)); }
export function getJuryStats() { return unwrap(client.get('/jury/stats')); }
export function getJuryMediaDownload(mediaId) { return unwrap(client.get('/jury/media/' + encodeURIComponent(mediaId) + '/download')); }

// Jury Board administration: ADMIN only.
export function getAdminJuryBoard() { return unwrap(client.get('/admin/jury-board')); }
export function getAdminJuryBoardSummary() { return unwrap(client.get('/admin/jury-board/summary')); }
export function createAdminJuror(payload) { return unwrap(client.post('/admin/jury-board', payload)); }
export function updateAdminJuror(id,payload) { return unwrap(client.put('/admin/jury-board/' + encodeURIComponent(id), payload)); }
export function resetAdminJurorPassword(id,password) { return unwrap(client.post('/admin/jury-board/' + encodeURIComponent(id) + '/reset-password', {password})); }
export function deleteAdminJuror(id) { return unwrap(client.delete('/admin/jury-board/' + encodeURIComponent(id))); }

export function getAdminCmsStories() { return unwrap(client.get('/admin/cms/stories')); }
export function createAdminCmsStory(payload) { return unwrap(client.post('/admin/cms/stories', payload)); }
export function updateAdminCmsStory(id, payload) { return unwrap(client.put('/admin/cms/stories/' + encodeURIComponent(id), payload)); }
export function deleteAdminCmsStory(id) { return unwrap(client.delete('/admin/cms/stories/' + encodeURIComponent(id))); }

export function getAdminCmsTours() { return unwrap(client.get('/admin/cms/tours')); }
export function createAdminCmsTour(payload) { return unwrap(client.post('/admin/cms/tours', payload)); }
export function updateAdminCmsTour(id, payload) { return unwrap(client.put('/admin/cms/tours/' + encodeURIComponent(id), payload)); }
export function deleteAdminCmsTour(id) { return unwrap(client.delete('/admin/cms/tours/' + encodeURIComponent(id))); }

export function getAdminCmsPlaces() { return unwrap(client.get('/admin/cms/places')); }
export function createAdminCmsPlace(payload) { return unwrap(client.post('/admin/cms/places', payload)); }
export function updateAdminCmsPlace(id, payload) { return unwrap(client.put('/admin/cms/places/' + encodeURIComponent(id), payload)); }
export function deleteAdminCmsPlace(id) { return unwrap(client.delete('/admin/cms/places/' + encodeURIComponent(id))); }

export function getAdminCmsPartners() { return unwrap(client.get('/admin/cms/partners')); }
export function createAdminCmsPartner(payload) { return unwrap(client.post('/admin/cms/partners', payload)); }
export function updateAdminCmsPartner(id, payload) { return unwrap(client.put('/admin/cms/partners/' + encodeURIComponent(id), payload)); }
export function deleteAdminCmsPartner(id) { return unwrap(client.delete('/admin/cms/partners/' + encodeURIComponent(id))); }

export function getAdminCmsSettings() { return unwrap(client.get('/admin/cms/settings')); }
export function updateAdminCmsSetting(key, payload) { return unwrap(client.put('/admin/cms/settings/' + encodeURIComponent(key), payload)); }

export function getAdminMediaLibrary(params = {}) { return unwrap(client.get('/admin/media-library', { params })); }
export function updateAdminMediaAsset(id, payload) { return unwrap(client.patch('/admin/media-library/' + encodeURIComponent(id), payload)); }
export function deleteAdminMediaAsset(id) { return unwrap(client.delete('/admin/media-library/' + encodeURIComponent(id))); }

export function getStoryBySlug(slug) { return unwrap(client.get('/stories/' + encodeURIComponent(slug))); }
export function getPartners() { return unwrap(client.get('/partners')); }
export function getSiteSettings() { return unwrap(client.get('/site-settings')); }

export { API_URL };
