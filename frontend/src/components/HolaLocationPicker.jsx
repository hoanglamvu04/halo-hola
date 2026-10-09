import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { CheckCircle2, Crosshair, ExternalLink, Loader2, MapPin, Search } from 'lucide-react'
import {
  getHolaNearbyPlaces,
  normalizeHolaPlace,
  searchHolaPlaces
} from '../services/holaMapsApi.js'

const HOLA_CENTER = [21.0105, 105.5226]
const HOLA_MAPS_URL = 'https://maps.dothihoalac.vn/'

const clean = value => String(value ?? '').trim()
const finite = value => Number.isFinite(Number(value))

function PinController({ position, onPick }) {
  const map = useMap()

  useEffect(() => {
    if (!position) return
    map.setView(position, Math.max(map.getZoom(), 15), { animate: true })
  }, [map, position])

  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    }
  })

  return position
    ? <CircleMarker center={position} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#c75a32', fillOpacity: 1 }} />
    : null
}

export default function HolaLocationPicker({ value, onChange }) {
  const [query, setQuery] = useState(value.location || '')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [mapMessage, setMapMessage] = useState('')
  const [searchError, setSearchError] = useState('')

  const position = useMemo(() => {
    if (!finite(value.locationLat) || !finite(value.locationLng)) return null
    return [Number(value.locationLat), Number(value.locationLng)]
  }, [value.locationLat, value.locationLng])

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
        const rows = (response.items || []).map(normalizeHolaPlace).filter(Boolean)
        setResults(rows)
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

  const enrichPin = async (lat, lng, source) => {
    const coordinateLabel = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    const baseLabel = source === 'GPS' ? `Vị trí hiện tại · ${coordinateLabel}` : `Điểm ghim · ${coordinateLabel}`

    setQuery(baseLabel)
    setResults([])
    setSearchError('')
    setMapMessage(source === 'GPS' ? 'Đã lấy vị trí hiện tại.' : 'Đã ghim vị trí trên bản đồ.')
    update({
      location: baseLabel,
      locationPlaceId: '',
      locationPlaceSlug: '',
      locationLat: lat,
      locationLng: lng,
      locationAddress: '',
      locationSource: source
    })

    try {
      const nearby = await getHolaNearbyPlaces(lat, lng, 800, { limit: 4 })
      const nearest = (nearby.items || []).map(normalizeHolaPlace).filter(Boolean)[0]
      if (!nearest) return
      const enrichedLabel = source === 'GPS'
        ? `Vị trí hiện tại · gần ${nearest.name}`
        : `Điểm ghim · gần ${nearest.name}`
      setQuery(enrichedLabel)
      update({
        location: enrichedLabel,
        locationPlaceId: nearest.id || '',
        locationPlaceSlug: nearest.slug || '',
        locationLat: lat,
        locationLng: lng,
        locationAddress: nearest.address || '',
        locationSource: source
      })
    } catch {
      // Exact coordinates are already saved; nearby enrichment is optional.
    }
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
      positionResult => {
        setLocating(false)
        enrichPin(positionResult.coords.latitude, positionResult.coords.longitude, 'GPS')
      },
      error => {
        setLocating(false)
        const denied = error?.code === 1
        setSearchError(denied
          ? 'Bạn chưa cho phép truy cập vị trí. Hãy cấp quyền Location cho trình duyệt rồi thử lại.'
          : 'Không lấy được vị trí hiện tại. Hãy thử lại hoặc ghim thủ công trên bản đồ.')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
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
        <span>Tìm địa điểm có sẵn, dùng GPS hoặc chạm bản đồ để ghim đúng chỗ bạn chụp.</span>
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
      {value.locationSource && value.locationSource !== 'TEXT' && <button type="button" className="ghost" onClick={clearStructuredLocation}>Chuyển về nhập địa điểm</button>}
    </div>

    <div className="hola-location-map-wrap">
      <MapContainer center={position || HOLA_CENTER} zoom={position ? 15 : 12} scrollWheelZoom className="hola-location-map">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PinController position={position} onPick={(lat, lng) => enrichPin(lat, lng, 'PIN')} />
      </MapContainer>
      <div className="hola-location-map-hint"><MapPin size={15}/> Chạm vào bản đồ để đặt lại điểm ghim</div>
    </div>

    {(value.location || position) && <div className="hola-location-selected">
      <CheckCircle2 size={18}/>
      <div>
        <b>{value.location || 'Đã chọn vị trí'}</b>
        <span>
          {position ? `${Number(value.locationLat).toFixed(6)}, ${Number(value.locationLng).toFixed(6)}` : 'Chưa có tọa độ'}
          {value.locationPlaceId ? ' · Đã liên kết HOLA Maps' : ''}
        </span>
      </div>
    </div>}

    {mapMessage && <div className="hola-location-note success">{mapMessage}</div>}
    {searchError && <div className="hola-location-note error">{searchError}</div>}
    <div className="hola-location-note">Tọa độ được lưu cùng tác phẩm để BTC đối chiếu địa bàn và gắn tác phẩm lên HOLA Map khi được tuyển chọn.</div>
  </div>
}
