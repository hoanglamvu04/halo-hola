import axios from 'axios';
import { getHolaPlacesInBounds, normalizeHolaPlace } from './holaMapsApi.js';
import { buildSubmissionImageVariants } from '../utils/imageVariants.js';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const HOME_HOLA_BOUNDS = { north: 21.145, south: 20.885, east: 105.665, west: 105.325 };

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

export async function submitArtwork(payload) {
  const form = new FormData();
  Object.entries(payload.fields || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  });
  const files=payload.files || [];
  files.forEach((file) => form.append('files', file));
  // Generate public delivery derivatives in-browser. The immutable originals are
  // still uploaded untouched for judging/archival; unsupported RAW/TIFF files
  // simply skip this optimization and keep the original fallback.
  const variants=await buildSubmissionImageVariants(files).catch(()=>[]);
  variants.forEach(({blob,name})=>form.append('previews',blob,name));
  return unwrap(client.post('/submissions', form, { timeout: 0 }));
}

export function lookupSubmission(params) { return unwrap(client.get('/submissions/lookup', { params })); }
export function getCampaignStats() { return unwrap(client.get('/submissions/stats')); }
export function registerTour(payload) { return unwrap(client.post('/tour-registrations', payload)); }

// Compatibility facade for the homepage teaser. Public place data comes from Hola Maps Developer API,
// never from HALO HOLA's legacy /api/places endpoint.
export async function getPlaces() {
  const result = await getHolaPlacesInBounds(HOME_HOLA_BOUNDS);
  return (result.items || []).map(normalizeHolaPlace).filter(Boolean);
}

export function getThemes() { return unwrap(client.get('/themes')); }
export function getTheme(slug) { return unwrap(client.get('/themes/' + encodeURIComponent(slug))); }
export function getColors() { return unwrap(client.get('/colors')); }
export function getPublicArtworks(params = {}) { return unwrap(client.get('/artworks', { params })); }
export function getPublicArtwork(slug) { return unwrap(client.get('/artworks/' + encodeURIComponent(slug))); }
export function getPublicTop52(params = {}) { return unwrap(client.get('/top52', { params })); }
export function getTours() { return unwrap(client.get('/tours')); }
export function getStories() { return unwrap(client.get('/stories')); }
export function getHomepageContent() { return unwrap(client.get('/site/homepage')); }

export function adminLogin(payload) { return unwrap(client.post('/auth/login', payload)); }
export function getCurrentUser() { return unwrap(client.get('/auth/me')); }

// Photographer Workspace: authenticated PHOTOGRAPHER / MODERATOR / ADMIN.
export function getPhotographerPlaces() { return unwrap(client.get('/photographer/places')); }
export function getPhotographerShoots() { return unwrap(client.get('/photographer/shoots')); }
export function createPhotographerShoot(payload) { return unwrap(client.post('/photographer/shoots', payload)); }
export function updatePhotographerShoot(id,payload) { return unwrap(client.patch('/photographer/shoots/' + encodeURIComponent(id), payload)); }
export function getPhotographerAssets(params = {}) { return unwrap(client.get('/photographer/assets', { params })); }
export async function uploadPhotographerAssets(shootId,files = []) {
  const queue=files.map((file,index)=>({
    file,
    clientId:`${Date.now()}-${index}-${Math.random().toString(36).slice(2,9)}`
  }));
  if(!queue.length) return [];

  const base='/photographer/shoots/' + encodeURIComponent(shootId) + '/uploads';
  const tickets=await unwrap(client.post(base + '/presign',{
    files:queue.map(({file,clientId})=>({
      clientId,
      name:file.name,
      size:file.size,
      type:file.type || ''
    }))
  }));

  const sourceById=new Map(queue.map(item=>[item.clientId,item.file]));
  const results=await Promise.allSettled(tickets.map(async ticket=>{
    const file=sourceById.get(ticket.clientId);
    if(!file) throw new Error('Không tìm thấy file tương ứng với vé upload R2.');

    let response;
    try{
      response=await fetch(ticket.uploadUrl,{
        method:'PUT',
        headers:{'Content-Type':ticket.contentType},
        body:file
      });
    }catch{
      throw new Error('Không kết nối được trực tiếp tới Cloudflare R2. Hãy kiểm tra CORS của bucket originals.');
    }
    if(!response.ok) throw new Error(`R2 từ chối ${file.name} (HTTP ${response.status}).`);

    return {
      key:ticket.key,
      name:file.name,
      size:file.size,
      type:ticket.contentType,
      clientId:ticket.clientId
    };
  }));

  const uploaded=results.filter(result=>result.status==='fulfilled').map(result=>result.value);
  let saved=[];
  if(uploaded.length){
    saved=await unwrap(client.post(base + '/finalize',{uploads:uploaded}));
  }

  const failed=results.find(result=>result.status==='rejected');
  if(failed) throw failed.reason instanceof Error ? failed.reason : new Error('Có file chưa tải được lên R2.');
  return saved;
}
export function deletePhotographerAsset(id) { return unwrap(client.delete('/photographer/assets/' + encodeURIComponent(id))); }

export function getAdminHomepageSections() {
  return unwrap(client.get('/admin/site/homepage')).then(rows=>(Array.isArray(rows)?rows:[]).filter(row=>!['themes','colors'].includes(row.section_key)));
}
export function updateAdminHomepageSection(sectionKey, payload) { return unwrap(client.put('/admin/site/homepage/' + encodeURIComponent(sectionKey), payload)); }
export function getAdminSiteAssets(params = {}) { return unwrap(client.get('/admin/site-assets', { params })); }
export function uploadAdminSiteAsset(sectionKey, file) {
  const form = new FormData(); form.append('sectionKey', sectionKey); form.append('file', file);
  return unwrap(client.post('/admin/site-assets', form, { timeout: 0 }));
}

export function getAdminTourRegistrations(params = {}) { return unwrap(client.get('/admin/tour-registrations', { params })); }
export function getAdminSubmissions(params = {}) { return unwrap(client.get('/admin/submissions', { params })); }
export function getAdminPublicPreviewArtworks(params = {}) { return unwrap(client.get('/admin/public-preview/artworks', { params })); }
export function getAdminPublicPreviewArtwork(id) { return unwrap(client.get('/admin/public-preview/artworks/' + encodeURIComponent(id))); }
export function updateSubmissionStatus(id, status) { return unwrap(client.patch('/admin/submissions/' + encodeURIComponent(id) + '/status', { status })); }
export function updateJuryNote(id, note) { return unwrap(client.patch('/admin/submissions/' + encodeURIComponent(id) + '/jury-note', { note })); }
export function getOriginalDownload(mediaId) { return unwrap(client.get('/admin/media/' + encodeURIComponent(mediaId) + '/download')); }

// Publication control: selection/status is separate from public visibility.
export function getAdminPublicationOverview() { return unwrap(client.get('/admin/publication/overview')); }
export function getAdminPublicationItems(params = {}) { return unwrap(client.get('/admin/publication/items', { params })); }
export function setAdminPublication(id,payload) { return unwrap(client.patch('/admin/publication/items/' + encodeURIComponent(id), payload)); }
export function bulkSetAdminPublication(payload) { return unwrap(client.post('/admin/publication/bulk', payload)); }
export function getAdminPublicationAudit(params = {}) { return unwrap(client.get('/admin/publication/audit', { params })); }

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
export function resetAdminJurorPassword(id,password) { return unwrap(client.post('/admin/jury-board/' + encodeURIComponent(id), {password})); }
export function deleteAdminJuror(id) { return unwrap(client.delete('/admin/jury-board/' + encodeURIComponent(id))); }

// Photographer team administration: ADMIN only.
export function getAdminPhotographers() { return unwrap(client.get('/admin/photographers')); }
export function createAdminPhotographer(payload) { return unwrap(client.post('/admin/photographers', payload)); }
export function updateAdminPhotographer(id,payload) { return unwrap(client.put('/admin/photographers/' + encodeURIComponent(id), payload)); }
export function resetAdminPhotographerPassword(id,password) { return unwrap(client.post('/admin/photographers/' + encodeURIComponent(id) + '/reset-password', {password})); }
export function getAdminPhotographerShoots(params = {}) { return unwrap(client.get('/admin/photographers/workspace/shoots', { params })); }
export function getAdminPhotographerAssets(params = {}) { return unwrap(client.get('/admin/photographers/workspace/assets', { params })); }

// Jury Results administration: ranking, TOP52 builder, round lock and audit.
export function getAdminJuryResultsOverview() { return unwrap(client.get('/admin/jury-results/overview')); }
export function getAdminJuryResultsRanking(params = {}) { return unwrap(client.get('/admin/jury-results/ranking', { params })); }
export function autoBuildAdminJurySelections(payload = {}) { return unwrap(client.post('/admin/jury-results/selections/auto', payload)); }
export function setAdminJurySelection(submissionId,payload) { return unwrap(client.put('/admin/jury-results/selections/' + encodeURIComponent(submissionId), payload)); }
export function lockAdminJuryRound(reason = '') { return unwrap(client.post('/admin/jury-results/round/lock', { reason })); }
export function reopenAdminJuryRound(reason = '') { return unwrap(client.post('/admin/jury-results/round/reopen', { reason })); }
export function publishAdminTop52(reason = '') { return unwrap(client.post('/admin/jury-results/publish-top52', { reason })); }
export function getAdminJuryAudit(params = {}) { return unwrap(client.get('/admin/jury-results/audit', { params })); }

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