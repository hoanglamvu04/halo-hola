const DEFAULT_HOLA_API = 'https://maps.dothihoalac.vn/api/public/v1'

export const HOLA_MAPS_API_URL = (import.meta.env.VITE_HOLA_MAPS_API_URL || DEFAULT_HOLA_API).replace(/\/$/, '')
export const HOLA_MAPS_API_KEY = String(import.meta.env.VITE_HOLA_MAPS_API_KEY || '').trim()

export class HolaMapsApiError extends Error {
  constructor(message, { status = 0, payload = null, retryAfter = null, cause = null } = {}) {
    super(message)
    this.name = 'HolaMapsApiError'
    this.status = status
    this.payload = payload
    this.retryAfter = retryAfter
    this.cause = cause
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function currentOrigin() {
  return typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'origin của website'
}

function buildQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      value.forEach(item => search.append(key, String(item)))
      return
    }
    search.set(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

function parseRetryAfter(value) {
  if (!value) return null
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(value)
  if (Number.isFinite(date)) return Math.max(0, date - Date.now())
  return null
}

function getErrorMessage(status, payload) {
  const serverMessage = payload?.error || payload?.message
  if (status === 401) return serverMessage || 'Hola Maps từ chối xác thực (401). Hãy kiểm tra Browser API Key hoặc chuyển về chế độ OPEN.'
  if (status === 403) return serverMessage || `Hola Maps từ chối website này (403). Hãy cấp origin ${currentOrigin()} trong Hola Maps Admin → API & Tích hợp → Website kết nối.`
  if (status === 429) return serverMessage || 'Hola Maps đang giới hạn tần suất truy cập (429). Vui lòng chờ một lúc rồi thử lại.'
  if (status >= 500) return serverMessage || `Hola Maps đang gặp lỗi máy chủ (${status}). Vui lòng thử lại sau.`
  return serverMessage || `Hola Maps API error: ${status}`
}

async function readPayload(response) {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) }
  catch { return { error: text } }
}

export async function holaFetch(path, { signal, accept = 'application/json', retry429 = true } = {}) {
  const headers = { Accept: accept }
  if (HOLA_MAPS_API_KEY) headers['X-Hola-API-Key'] = HOLA_MAPS_API_KEY

  let attempt = 0
  while (attempt < 2) {
    let response
    try {
      response = await fetch(`${HOLA_MAPS_API_URL}${path}`, { headers, signal })
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      throw new HolaMapsApiError(
        `Không kết nối được Hola Maps. Có thể do mạng hoặc CORS. Hãy kiểm tra origin ${currentOrigin()} trong Hola Maps Admin → API & Tích hợp → Website kết nối.`,
        { cause: error }
      )
    }

    const payload = await readPayload(response)
    if (response.ok) return payload

    const retryAfter = parseRetryAfter(response.headers.get('Retry-After'))
    if (response.status === 429 && retry429 && attempt === 0) {
      await sleep(Math.min(retryAfter ?? 1200, 10000))
      attempt += 1
      continue
    }

    throw new HolaMapsApiError(getErrorMessage(response.status, payload), {
      status: response.status,
      payload,
      retryAfter
    })
  }

  throw new HolaMapsApiError('Hola Maps đang giới hạn tần suất truy cập. Vui lòng thử lại sau.', { status: 429 })
}

function unwrapCollection(payload) {
  return {
    items: Array.isArray(payload?.data?.items) ? payload.data.items : [],
    meta: payload?.meta || {}
  }
}

function unwrapItem(payload) {
  return payload?.data ?? null
}

function boundsParams(bounds = {}) {
  const result = {
    north: Number(bounds.north),
    south: Number(bounds.south),
    east: Number(bounds.east),
    west: Number(bounds.west)
  }
  if (!Object.values(result).every(Number.isFinite)) {
    throw new Error('Bounds không hợp lệ. Cần north, south, east, west dạng số.')
  }
  return result
}

export async function getHolaMeta(options = {}) {
  return unwrapItem(await holaFetch('/meta', options))
}

export async function getHolaCategories(options = {}) {
  return unwrapCollection(await holaFetch('/categories', options))
}

export async function getHolaPlaces(params = {}, options = {}) {
  return unwrapCollection(await holaFetch(`/places${buildQuery(params)}`, options))
}

export async function searchHolaPlaces(query, params = {}, options = {}) {
  return getHolaPlaces({ ...params, q: query }, options)
}

export async function getHolaPlacesInBounds(bounds, params = {}, options = {}) {
  return unwrapCollection(await holaFetch(`/places/bounds${buildQuery({ ...boundsParams(bounds), ...params })}`, options))
}

export async function getHolaPlacesGeoJson(bounds, params = {}, options = {}) {
  return holaFetch(`/places/geojson${buildQuery({ ...boundsParams(bounds), ...params })}`, {
    ...options,
    accept: 'application/geo+json, application/json'
  })
}

export async function getHolaNearbyPlaces(lat, lng, radius = 5000, params = {}, options = {}) {
  const latitude = Number(lat)
  const longitude = Number(lng)
  const distance = Number(radius)
  if (![latitude, longitude, distance].every(Number.isFinite)) {
    throw new Error('Tọa độ hoặc bán kính nearby không hợp lệ.')
  }
  return unwrapCollection(await holaFetch(`/places/nearby${buildQuery({ lat: latitude, lng: longitude, radius: distance, ...params })}`, options))
}

export async function getHolaPlaceById(id, options = {}) {
  return unwrapItem(await holaFetch(`/places/${encodeURIComponent(id)}`, options))
}

export async function getHolaPlaceBySlug(slug, options = {}) {
  return unwrapItem(await holaFetch(`/places/slug/${encodeURIComponent(slug)}`, options))
}

export function normalizeHolaPlace(item) {
  if (!item) return null
  const lat = Number(item.location?.lat)
  const lng = Number(item.location?.lng)
  const images = item.images || {}
  const category = item.category || {}
  const description = item.description || ''
  const address = item.location?.address || ''

  return {
    id: String(item.id ?? ''),
    slug: item.slug || '',
    name: item.name || '',
    description,
    desc: description || address,
    category: category.name || '',
    categorySlug: category.slug || '',
    position: Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null,
    lat,
    lng,
    address,
    contact: item.contact || {},
    openingHours: item.openingHours || '',
    priceLevel: item.priceLevel ?? null,
    rating: item.rating || { average: 0, count: 0 },
    partner: item.partner || { isPartner: false, name: null },
    thumbnail: images.thumbnail || images.card || images.original || '',
    image: images.card || images.thumbnail || images.original || '',
    detailImage: images.original || images.card || images.thumbnail || '',
    images,
    updatedAt: item.updatedAt || '',
    links: item.links || {},
    raw: item
  }
}

export function normalizeHolaGeoFeature(feature) {
  if (!feature || feature.geometry?.type !== 'Point') return null
  const [lng, lat] = feature.geometry.coordinates || []
  const props = feature.properties || {}
  return {
    id: String(feature.id ?? props.id ?? ''),
    slug: props.slug || '',
    name: props.name || '',
    description: '',
    desc: props.address || '',
    category: props.category || '',
    categorySlug: props.categorySlug || '',
    position: Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) ? [Number(lat), Number(lng)] : null,
    lat: Number(lat),
    lng: Number(lng),
    address: props.address || '',
    rating: { average: Number(props.rating || 0), count: Number(props.reviews || 0) },
    partner: { isPartner: Boolean(props.isPartner), name: null },
    thumbnail: props.thumbnail || props.cardImage || '',
    image: props.cardImage || props.thumbnail || '',
    detailImage: props.cardImage || props.thumbnail || '',
    links: { api: props.apiUrl || '', holaMaps: props.holaMapsUrl || '' },
    raw: feature
  }
}
