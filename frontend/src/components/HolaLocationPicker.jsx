import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Crosshair, ExternalLink, Loader2, MapPin, Search, X } from 'lucide-react'
import {
  getHolaNearbyPlaces,
  normalizeHolaPlace,
  searchHolaPlaces
} from '../services/holaMapsApi.js'

const HOLA_MAPS_ORIGIN = 'https://maps.dothihoalac.vn'
const HOLA_MAPS_URL = `${HOLA_MAPS_ORIGIN}/`

const clean = value => String(value ?? '').trim()
const finite = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value))

function normalizeRows(response) {
  return (Array.isArray(response?.items) ? response.items : [])
    .map(normalizeHolaPlace)
    .filter(item => item && finite(item.lat) && finite(item.lng))
}

function normalizePickerSource(source) {
  if (source === 'hola_place') return 'HOLA_MAPS'
  if (source === 'current_location') return 'GPS'
  if (source === 'manual') return 'TEXT'
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
    if (!finite(value.locationLat) || !finite(value.locationLng)) return null
    return [Number(value.locationLat), Number(value.locationLng)]
  }, [value.locationLat, value.locationLng])

  const pickerUrl = useMemo(() => {
    if (typeof window === 'undefined') return `${HOLA_MAPS_ORIGIN}/picker`
    const params = new URLSearchParams({ origin: window.location.origin })
    if (position) {
      params.set('lat', String(position[0]))
      params.set('lng', String(position[1]))
    }
    if (clean(value.location)) params.set('label', clean(value.location))
    return `${HOLA_MAPS_ORIGIN}/picker?${params.toString()}`
  }, [position, value.location])

  useEffect(() => {
    if (value.location && value.location !== query) setQuery(value.location)
    // Only synchronize after a structured location selection changes the stored value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.locationPlaceId, value.locationLat, value.locationLng])

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
      if (!finite(payload.lat) || !finite(payload.lng)) return

      const label = clean(payload.label) || clean(payload.address) || 'Điểm ghim trên HOLA Maps'
      setQuery(label)
      setResults([])
      setSearchError('')
      setMapMessage('Đã nhận vị trí trực tiếp từ HOLA Maps.')
      onChange({
        location: label,
        locationPlaceId: clean(payload.placeId),
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
    const label = place.address ? `${place.name} — ${place.address}` : place.name
    setQuery(label)
    setResults([])
    setSearchError('')
    setMapMessage('Đã liên kết địa điểm từ HOLA Maps.')
    update({
      location: label,
      locationPlaceId: place.id || '',
      locationPlaceSlug: place.slug || '',
      locationLat: finite(place.lat) ? Number(place.lat) : '',
      locationLng: finite(place.lng) ? Number(place.lng) : '',
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
        setMapMessage('Đã lấy vị trí hiện tại; bạn có thể mở HOLA Maps để chỉnh pin chính xác hơn.')
        update({
          location: label,
          locationPlaceId: nearest?.id || '',
          locationPlaceSlug: nearest?.slug || '',
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

  const clearStructuredLocation = () => {
    setMapMessage('')
    update({
      locationPlaceId: '',
      locationPlaceSlug: '',
      locationLat: '',
      locationLng: '',
      locationAddress: '',
      locationSource: 'TEXT'
    })
  }

  return <div className="hola-location-picker">
    <div className="hola-location-heading">
      <div>
        <b>Chọn địa điểm trên HOLA Maps *</b>
        <span>Tìm địa điểm có sẵn, dùng vị trí hiện tại hoặc mở HOLA Maps để ghim đúng chỗ bạn chụp.</span>
      </div>
      <a href={HOLA_MAPS_URL} target="_blank" rel="noreferrer">Mở HOLA Maps <ExternalLink size={15}/></a>
    </div>

    <div className="hola-location-search">
      <Search size={18}/>
      <input
        value={query}
        onChange={event => handleText(event.target.value)}
        placeholder="Tìm hồ, làng, trường, công trình, địa điểm trên HOLA Maps..."
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
        <MapPin size={17}/> Chọn / ghim trên HOLA Maps
      </button>
      {value.locationSource && value.locationSource !== 'TEXT' && <button type="button" className="ghost" onClick={clearStructuredLocation}>Chuyển về nhập địa điểm</button>}
    </div>

    <button type="button" className="hola-location-map-launch" onClick={() => setPickerOpen(true)}>
      <div className="hola-location-map-launch-icon"><MapPin size={24}/></div>
      <div>
        <small>BẢN ĐỒ CHÍNH THỨC HOLA MAPS</small>
        <b>{position ? 'Kiểm tra hoặc chỉnh lại điểm ghim' : 'Mở bản đồ để chọn vị trí chính xác'}</b>
        <span>{position ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)}` : 'Kéo bản đồ đến đúng cổng, công trình hoặc vị trí chụp'}</span>
      </div>
      <ExternalLink size={18}/>
    </button>

    {(value.location || position) && <div className="hola-location-selected">
      <CheckCircle2 size={18}/>
      <div>
        <b>{value.location || 'Đã chọn vị trí'}</b>
        <span>
          {position ? `${Number(value.locationLat).toFixed(6)}, ${Number(value.locationLng).toFixed(6)}` : 'Địa điểm nhập bằng văn bản'}
          {value.locationPlaceId ? ' · Đã liên kết địa điểm HOLA Maps' : ''}
        </span>
        {value.locationAddress && <small>{value.locationAddress}</small>}
      </div>
    </div>}

    {mapMessage && <div className="hola-location-note success">{mapMessage}</div>}
    {searchError && <div className="hola-location-note error">{searchError}</div>}
    <div className="hola-location-note">Tọa độ và mã địa điểm HOLA Maps được lưu cùng tác phẩm để BTC đối chiếu địa bàn và gắn tác phẩm lên HOLA Map khi được tuyển chọn.</div>

    {pickerOpen && <div className="hola-map-picker-modal" role="dialog" aria-modal="true" aria-label="Chọn vị trí trên HOLA Maps">
      <div className="hola-map-picker-panel">
        <header>
          <div><span>HOLA MAPS</span><b>Ghim vị trí thực hiện tác phẩm</b></div>
          <button type="button" onClick={() => setPickerOpen(false)} aria-label="Đóng HOLA Maps"><X size={20}/></button>
        </header>
        <iframe
          src={pickerUrl}
          title="HOLA Maps — chọn vị trí tác phẩm"
          allow="geolocation; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <footer>Di chuyển bản đồ đến đúng điểm rồi bấm <b>“Dùng vị trí này”</b>. Vị trí sẽ tự động trả về form HALO HOLA.</footer>
      </div>
    </div>}
  </div>
}
