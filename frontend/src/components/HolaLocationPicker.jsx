import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Crosshair, ExternalLink, Loader2, MapPin, Search, X } from 'lucide-react'
import {
  getHolaNearbyPlaces,
  normalizeHolaPlace,
  searchHolaPlaces
} from '../services/holaMapsApi.js'

const configuredOrigin = String(import.meta.env.VITE_HOLA_MAPS_ORIGIN || 'https://maps.dothihoalac.vn').trim()
const HOLA_MAPS_ORIGIN = (() => {
  try { return new URL(configuredOrigin).origin } catch { return 'https://maps.dothihoalac.vn' }
})()
const HOLA_MAPS_URL = `${HOLA_MAPS_ORIGIN}/`

const clean = value => String(value ?? '').trim()
const validCoordinates = (lat, lng) => {
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
  const [mapMessage, setMapMessage] = useState('')
  const [searchError, setSearchError] = useState('')

  const position = useMemo(() => {
    if (!validCoordinates(value.locationLat, value.locationLng)) return null
    return [Number(value.locationLat), Number(value.locationLng)]
  }, [value.locationLat, value.locationLng])

  const pickerUrl = useMemo(() => {
    if (typeof window === 'undefined') return `${HOLA_MAPS_ORIGIN}/embed/picker`
    const params = new URLSearchParams({ origin: window.location.origin })
    if (position) {
      params.set('lat', String(position[0]))
      params.set('lng', String(position[1]))
    }
    if (clean(value.location)) params.set('label', clean(value.location))
    return `${HOLA_MAPS_ORIGIN}/embed/picker?${params.toString()}`
  }, [position, value.location])

  useEffect(() => {
    if (value.location && value.location !== query) setQuery(value.location)
    // Only synchronize after a structured location selection changes the stored value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.locationPlaceId, value.locationLat, value.locationLng])

  useEffect(() => {
    if (!pickerOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
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
      if (event.origin !== HOLA_MAPS_ORIGIN) return
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
  }, [onChange])

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

  return <div className="hola-location-picker">
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

    {pickerOpen && <div className="hola-map-picker-modal" role="dialog" aria-modal="true" aria-label="Chọn vị trí trên HOLA Maps">
      <div className="hola-map-picker-panel">
        <header>
          <div><span>HOLA MAPS</span><b>Chọn vị trí thực hiện tác phẩm</b></div>
          <button type="button" onClick={() => setPickerOpen(false)} aria-label="Đóng HOLA Maps"><X size={20}/></button>
        </header>
        <iframe
          src={pickerUrl}
          title="HOLA Maps — chọn vị trí tác phẩm"
          allow="geolocation; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>}
  </div>
}
