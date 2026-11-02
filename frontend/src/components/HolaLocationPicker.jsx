import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Crosshair, ExternalLink, Loader2, MapPin, Search, X } from 'lucide-react'
import {
  getHolaNearbyPlaces,
  normalizeHolaPlace,
  searchHolaPlaces
} from '../services/holaMapsApi.js'
import { getPublicHolaEmbedConfig } from '../services/api.js'
import { buildHolaPickerUrl, getHolaEmbedViewState } from '../../../shared/holaEmbedUrl.js'

const configuredOrigin = String(import.meta.env.VITE_HOLA_MAPS_ORIGIN || 'https://maps.dothihoalac.vn').trim()
const HOLA_MAPS_ORIGIN = (() => {
  try { return new URL(configuredOrigin).origin } catch { return 'https://maps.dothihoalac.vn' }
})()
const HOLA_MAPS_URL = `${HOLA_MAPS_ORIGIN}/`

const clean = value => String(value ?? '').trim()
const validCoordinates = (lat, lng) => {
  if (lat === '' || lat === null || lat === undefined || lng === '' || lng === null || lng === undefined) return false
  const y = Number(lat)
  const x = Number(lng)
  return Number.isFinite(y) && Number.isFinite(x) && y >= -90 && y <= 90 && x >= -180 && x <= 180
}

function normalizeRows(response) {
  return (Array.isArray(response?.items) ? response.items : [])
    .map(normalizeHolaPlace)
    .filter(item => item && validCoordinates(item.lat, item.lng))
}

function normalizePickerSource(source) {
  if (source === 'hola_place') return 'HOLA_MAPS'
  if (source === 'current_location') return 'GPS'
  if (source === 'manual') return 'PIN'
  return 'PIN'
}

export default function HolaLocationPicker({ value, onChange }) {
  const [query, setQuery] = useState(value.location || '')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')
  const [pickerConfigStatus, setPickerConfigStatus] = useState('idle')
  const [pickerFrameStatus, setPickerFrameStatus] = useState('idle')
  const [pickerRetry, setPickerRetry] = useState(0)
  const pickerIframeRef = useRef(null)
  const [mapMessage, setMapMessage] = useState('')
  const [searchError, setSearchError] = useState('')

  const position = useMemo(() => {
    if (!validCoordinates(value.locationLat, value.locationLng)) return null
    return [Number(value.locationLat), Number(value.locationLng)]
  }, [value.locationLat, value.locationLng])

  // The picker must use the same officially approved public embed identifier
  // that the /hola-map page uses. Keyless /embed/picker now returns 403.
  const pickerUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return buildHolaPickerUrl(embedUrl, {
      origin: window.location.origin,
      lat: position?.[0],
      lng: position?.[1],
      label: value.location
    })
  }, [embedUrl, position, value.location])

  useEffect(() => {
    if (!pickerOpen) return undefined

    let active = true
    const controller = new AbortController()
    setPickerConfigStatus('loading')
    setPickerFrameStatus('idle')
    setEmbedUrl('')

    getPublicHolaEmbedConfig({ signal: controller.signal })
      .then(result => {
        if (!active) return
        const state = getHolaEmbedViewState(result?.embedUrl)
        setEmbedUrl(state.embedUrl)
        setPickerConfigStatus(state.mode === 'embed' ? 'ready' : 'unavailable')
      })
      .catch(() => {
        if (active) setPickerConfigStatus('error')
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [pickerOpen, pickerRetry])

  useEffect(() => {
    if (!pickerOpen || pickerConfigStatus !== 'ready' || !pickerUrl) return undefined
    setPickerFrameStatus('loading')

    // Do not trust iframe onLoad: it can fire for HTTP 403 or CSP-blocked frames.
    // HOLA Maps explicitly sends HOLA_MAP_PICKER_READY after its React app loads.
    const timer = window.setTimeout(() => {
      setPickerFrameStatus(previous => previous === 'ready' ? previous : 'timeout')
    }, 10000)
    return () => window.clearTimeout(timer)
  }, [pickerOpen, pickerConfigStatus, pickerUrl])

  useEffect(() => {
    if (value.location && value.location !== query) setQuery(value.location)
    // Only synchronize after a structured location selection changes the stored value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.locationPlaceId, value.locationLat, value.locationLng])

  useEffect(() => {
    if (!pickerOpen) return undefined
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [pickerOpen])

  useEffect(() => {
    const q = clean(query)
    if (q.length < 2 || q === clean(value.location)) {
      setResults([])
      setSearchError('')
      return undefined
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)
      setSearchError('')
      try {
        const response = await searchHolaPlaces(q, { limit: 8 }, { signal: controller.signal })
        setResults(normalizeRows(response))
      } catch (error) {
        if (error?.name !== 'AbortError') {
          setResults([])
          setSearchError(error?.message || 'Không tải được địa điểm từ HOLA Maps.')
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 320)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, value.location])

  useEffect(() => {
    const receiveLocation = event => {
      if (!pickerOpen || !pickerUrl || event.origin !== new URL(pickerUrl).origin ||
          event.source !== pickerIframeRef.current?.contentWindow) return

      if (event.data?.type === 'HOLA_MAP_PICKER_READY') {
        setPickerFrameStatus('ready')
        return
      }
      if (event.data?.type !== 'HOLA_MAP_LOCATION_SELECTED') return

      const payload = event.data?.payload || {}
      if (!validCoordinates(payload.lat, payload.lng)) {
        setSearchError('HOLA Maps trả về tọa độ không hợp lệ. Vui lòng chọn lại vị trí.')
        return
      }

      const label = clean(payload.label) || clean(payload.address) || 'Vị trí đã ghim'
      const placeId = clean(payload.placeId)
      setQuery(label)
      setResults([])
      setSearchError('')
      setMapMessage(placeId ? 'Đã liên kết địa điểm có sẵn trên HOLA Maps.' : 'Đã ghim vị trí trên HOLA Maps.')
      onChange({
        location: label,
        locationPlaceId: placeId,
        locationPlaceSlug: clean(payload.placeSlug),
        locationLat: Number(payload.lat),
        locationLng: Number(payload.lng),
        locationAddress: clean(payload.address),
        locationSource: normalizePickerSource(payload.source)
      })
      setPickerOpen(false)
    }

    window.addEventListener('message', receiveLocation)
    return () => window.removeEventListener('message', receiveLocation)
  }, [onChange, pickerOpen, pickerUrl])

  useEffect(() => {
    if (!pickerOpen) return undefined
    const closeOnEscape = event => {
      if (event.key === 'Escape') setPickerOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [pickerOpen])

  const update = patch => {
    onChange({
      location: value.location || '',
      locationPlaceId: value.locationPlaceId || '',
      locationPlaceSlug: value.locationPlaceSlug || '',
      locationLat: value.locationLat ?? '',
      locationLng: value.locationLng ?? '',
      locationAddress: value.locationAddress || '',
      locationSource: value.locationSource || 'TEXT',
      ...patch
    })
  }

  const handleText = next => {
    setQuery(next)
    setMapMessage('')
    update({
      location: next,
      locationPlaceId: '',
      locationPlaceSlug: '',
      locationLat: '',
      locationLng: '',
      locationAddress: '',
      locationSource: 'TEXT'
    })
  }

  const selectPlace = place => {
    if (!place) return
    const label = place.name || place.address || 'Địa điểm HOLA Maps'
    setQuery(label)
    setResults([])
    setSearchError('')
    setMapMessage('Đã liên kết địa điểm có sẵn trên HOLA Maps.')
    update({
      location: label,
      locationPlaceId: place.id || '',
      locationPlaceSlug: place.slug || '',
      locationLat: validCoordinates(place.lat, place.lng) ? Number(place.lat) : '',
      locationLng: validCoordinates(place.lat, place.lng) ? Number(place.lng) : '',
      locationAddress: place.address || '',
      locationSource: 'HOLA_MAPS'
    })
  }

  const useCurrentLocation = () => {
    setSearchError('')
    setMapMessage('')
    if (!navigator.geolocation) {
      setSearchError('Thiết bị/trình duyệt này không hỗ trợ lấy vị trí hiện tại.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async positionResult => {
        const lat = Number(positionResult.coords.latitude)
        const lng = Number(positionResult.coords.longitude)
        if (!validCoordinates(lat, lng)) {
          setLocating(false)
          setSearchError('Thiết bị trả về tọa độ không hợp lệ.')
          return
        }

        let nearest = null
        try {
          const nearby = await getHolaNearbyPlaces(lat, lng, 1200, { limit: 5 })
          nearest = normalizeRows(nearby)[0] || null
        } catch {
          // GPS coordinates remain usable even if nearby enrichment is unavailable.
        }

        const label = nearest?.name ? `Vị trí hiện tại · gần ${nearest.name}` : 'Vị trí hiện tại'
        setQuery(label)
        setResults([])
        setMapMessage('Đã lấy vị trí hiện tại. Đây là điểm ghim riêng, không tự gắn vào địa điểm lân cận.')
        update({
          location: label,
          locationPlaceId: '',
          locationPlaceSlug: '',
          locationLat: lat,
          locationLng: lng,
          locationAddress: nearest?.address || '',
          locationSource: 'GPS'
        })
        setLocating(false)
      },
      error => {
        setLocating(false)
        const denied = error?.code === 1
        setSearchError(denied
          ? 'Bạn chưa cho phép truy cập vị trí. Hãy cấp quyền Location cho trình duyệt rồi thử lại.'
          : 'Không lấy được vị trí hiện tại. Hãy thử lại hoặc chọn trên HOLA Maps.')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  const clearLocation = () => {
    setQuery('')
    setResults([])
    setMapMessage('')
    setSearchError('')
    update({
      location: '',
      locationPlaceId: '',
      locationPlaceSlug: '',
      locationLat: '',
      locationLng: '',
      locationAddress: '',
      locationSource: 'TEXT'
    })
  }

  const hasStructuredLocation = Boolean(clean(value.locationPlaceId) || position)
  const primaryLabel = clean(value.location) || (position ? 'Vị trí đã ghim' : '')
  const secondaryLabel = clean(value.locationAddress) || (position ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)}` : '')

  const pickerModal = pickerOpen && typeof document !== 'undefined'
    ? createPortal(
      <div className="hola-map-picker-modal" role="dialog" aria-modal="true" aria-label="Chọn vị trí trên HOLA Maps">
        <div className="hola-map-picker-panel">
          <header>
            <div><span>HOLA MAPS</span><b>Chọn vị trí thực hiện tác phẩm</b></div>
            <div className="hola-map-picker-header-actions">
              <a href={HOLA_MAPS_URL} target="_blank" rel="noopener noreferrer" title="Mở HOLA Maps trực tiếp">
                Mở HOLA Maps <ExternalLink size={15}/>
              </a>
              <button type="button" onClick={() => setPickerOpen(false)} aria-label="Đóng HOLA Maps"><X size={20}/></button>
            </div>
          </header>
          <div className="hola-map-picker-frame-shell">
            {pickerConfigStatus === 'ready' && pickerUrl ? <>
              <iframe
                ref={pickerIframeRef}
                src={pickerUrl}
                title="HOLA Maps — chọn vị trí tác phẩm"
                allow="geolocation; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              {pickerFrameStatus === 'loading' && <div className="hola-map-picker-status-chip" role="status">
                <Loader2 size={17} className="spin"/> Đang tải bản đồ chọn địa điểm…
              </div>}
              {pickerFrameStatus === 'timeout' && <div className="hola-map-picker-frame-warning" role="alert">
                <AlertTriangle size={19}/>
                <p>Chưa nhận được tín hiệu từ HOLA Maps. Khung có thể bị chặn (403/CSP) hoặc tải chậm. Bạn có thể thử lại hoặc đóng để dùng tìm kiếm/GPS.</p>
                <button type="button" onClick={() => setPickerRetry(v => v + 1)}>Thử lại</button>
              </div>}
            </> : <div className="hola-map-picker-unavailable" role="status">
              {pickerConfigStatus === 'loading'
                ? <><Loader2 className="spin" size={26}/><p>Đang kiểm tra quyền nhúng HOLA Maps…</p></>
                : <>
                  <MapPin size={32}/>
                  <h2>Chưa mở được bản đồ chọn địa điểm</h2>
                  <p>{pickerConfigStatus === 'error'
                    ? 'Không tải được cấu hình kết nối. Vui lòng kiểm tra mạng và thử lại.'
                    : 'Chưa có URL nhúng được cấp hợp lệ trong Cài đặt HOLA Maps. Không thể sử dụng khung nhúng không có mã.'}</p>
                  <div className="hola-map-picker-fallback-actions">
                    <button type="button" onClick={() => setPickerRetry(v => v + 1)}>Thử kết nối lại</button>
                    <a href={HOLA_MAPS_URL} target="_blank" rel="noopener noreferrer">Mở HOLA Maps <ExternalLink size={15}/></a>
                    <button type="button" className="secondary" onClick={() => setPickerOpen(false)}>Trở lại tìm kiếm / GPS</button>
                  </div>
                </>}
            </div>}
          </div>
        </div>
      </div>,
      document.body
    )
    : null

  return <>
    <div className="hola-location-picker">
      <div className="hola-location-heading">
        <div>
          <b>Gắn vị trí trên HOLA Maps *</b>
          <span>Tìm địa điểm, tên đường hoặc ghim đúng nơi bạn chụp. Nếu chọn địa điểm có sẵn, mã place sẽ được giữ nguyên.</span>
        </div>
        <a href={HOLA_MAPS_URL} target="_blank" rel="noreferrer">Mở HOLA Maps <ExternalLink size={15}/></a>
      </div>

      {!hasStructuredLocation && <>
        <div className="hola-location-search">
          <Search size={18}/>
          <input
            value={query}
            onChange={event => handleText(event.target.value)}
            placeholder="Tìm địa điểm, tên đường, quán cafe..."
            autoComplete="off"
          />
          {searching && <Loader2 className="spin" size={18}/>} 
        </div>

        {results.length > 0 && <div className="hola-location-results">
          {results.map(place => <button type="button" key={place.id || place.slug || place.name} onClick={() => selectPlace(place)}>
            <MapPin size={17}/>
            <span><b>{place.name}</b><small>{place.address || place.category || 'Hòa Lạc'}</small></span>
          </button>)}
        </div>}

        <div className="hola-location-actions">
          <button type="button" onClick={useCurrentLocation} disabled={locating}>
            {locating ? <Loader2 className="spin" size={17}/> : <Crosshair size={17}/>} 
            {locating ? 'Đang lấy vị trí...' : 'Dùng vị trí hiện tại'}
          </button>
          <button type="button" className="map-primary" onClick={() => setPickerOpen(true)}>
            <MapPin size={17}/> Mở bản đồ để chọn vị trí
          </button>
        </div>
      </>}

      {hasStructuredLocation && <div className="hola-location-selected hola-location-selected-compact">
        <CheckCircle2 size={19}/>
        <div className="hola-location-selected-copy">
          <b><MapPin size={15}/>{primaryLabel || 'Vị trí đã ghim'}</b>
          {secondaryLabel && <span>{secondaryLabel}</span>}
          {value.locationPlaceId && <small>Địa điểm HOLA Maps · ID {value.locationPlaceId}</small>}
        </div>
        <div className="hola-location-selected-actions">
          <button type="button" onClick={() => setPickerOpen(true)}>Đổi vị trí</button>
          <button type="button" className="danger" onClick={clearLocation}>Xóa</button>
        </div>
      </div>}

      {mapMessage && <div className="hola-location-note success">{mapMessage}</div>}
      {searchError && <div className="hola-location-note error">{searchError}</div>}
      <div className="hola-location-note">Bài có ảnh + vị trí sẽ được backend HALO HOLA đồng bộ server-to-server sang gallery HOLA Maps. Shared secret không bao giờ được đưa xuống trình duyệt.</div>
    </div>
    {pickerModal}
  </>
}
