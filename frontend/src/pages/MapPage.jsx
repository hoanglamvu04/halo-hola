import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet'
import {
  MapPin, Search, RefreshCw, ExternalLink, Clock3, Phone, Star,
  X, ChevronRight, LoaderCircle, Image as ImageIcon
} from 'lucide-react'
import {
  getHolaCategories,
  getHolaPlacesInBounds,
  searchHolaPlaces,
  getHolaPlaceById,
  normalizeHolaPlace
} from '../services/holaMapsApi.js'
import '../styles/hola-map-page.css'

const DEFAULT_CENTER = [21.02, 105.51]
const DEFAULT_BOUNDS = { north: 21.145, south: 20.885, east: 105.665, west: 105.325 }

function toBounds(bounds) {
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest()
  }
}

function ViewportWatcher({ onChange }) {
  useMapEvents({
    moveend(event) {
      onChange(toBounds(event.target.getBounds()))
    }
  })
  return null
}

function MapFocus({ place }) {
  const map = useMap()
  useEffect(() => {
    if (!place?.position) return
    const targetZoom = Math.max(map.getZoom(), 14)
    map.flyTo(place.position, targetZoom, { duration: 0.55 })
  }, [map, place?.id])
  return null
}

export default function MapPage(){
  const [categories,setCategories]=useState([])
  const [mapPlaces,setMapPlaces]=useState([])
  const [active,setActive]=useState(null)
  const [filter,setFilter]=useState('all')
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(true)
  const [detailLoading,setDetailLoading]=useState(false)
  const [error,setError]=useState('')
  const currentBounds=useRef(DEFAULT_BOUNDS)
  const requestController=useRef(null)
  const detailController=useRef(null)

  const applyPlaces=useCallback((items)=>{
    const normalized=(items||[]).map(normalizeHolaPlace).filter(place=>place?.position)
    setMapPlaces(normalized)
    setActive(current=>{
      if(!current) return null
      const refreshed=normalized.find(place=>place.id===current.id)
      return refreshed?{...current,...refreshed}:null
    })
  },[])

  const loadBounds=useCallback(async(bounds)=>{
    currentBounds.current=bounds
    requestController.current?.abort()
    const controller=new AbortController()
    requestController.current=controller
    setLoading(true)
    setError('')
    try{
      const result=await getHolaPlacesInBounds(bounds,{}, {signal:controller.signal})
      applyPlaces(result.items)
    }catch(err){
      if(err?.name!=='AbortError') setError(err.message||'Không tải được dữ liệu Hola Maps.')
    }finally{
      if(requestController.current===controller) setLoading(false)
    }
  },[applyPlaces])

  useEffect(()=>{
    const controller=new AbortController()
    getHolaCategories({signal:controller.signal})
      .then(result=>setCategories(result.items||[]))
      .catch(err=>{ if(err?.name!=='AbortError') setError(err.message||'Không tải được danh mục Hola Maps.') })
    loadBounds(DEFAULT_BOUNDS)
    return ()=>{
      controller.abort()
      requestController.current?.abort()
      detailController.current?.abort()
    }
  },[loadBounds])

  const loadDetail=useCallback(async(place)=>{
    if(!place) return
    setActive(place)
    detailController.current?.abort()
    const controller=new AbortController()
    detailController.current=controller
    setDetailLoading(true)
    try{
      const item=await getHolaPlaceById(place.id,{signal:controller.signal})
      const normalized=normalizeHolaPlace(item)
      if(normalized) setActive(normalized)
    }catch(err){
      if(err?.name!=='AbortError') setError(err.message||'Không tải được chi tiết địa điểm.')
    }finally{
      if(detailController.current===controller) setDetailLoading(false)
    }
  },[])

  const submitSearch=async(event)=>{
    event.preventDefault()
    const q=query.trim()
    if(!q){
      setFilter('all')
      setActive(null)
      await loadBounds(currentBounds.current)
      return
    }
    requestController.current?.abort()
    const controller=new AbortController()
    requestController.current=controller
    setLoading(true)
    setError('')
    setFilter('all')
    setActive(null)
    try{
      const result=await searchHolaPlaces(q,{limit:50},{signal:controller.signal})
      applyPlaces(result.items)
    }catch(err){
      if(err?.name!=='AbortError') setError(err.message||'Không tìm kiếm được địa điểm trên Hola Maps.')
    }finally{
      if(requestController.current===controller) setLoading(false)
    }
  }

  const resetSearch=async()=>{
    setQuery('')
    setFilter('all')
    setActive(null)
    await loadBounds(currentBounds.current)
  }

  const onViewportChange=useCallback((bounds)=>{
    currentBounds.current=bounds
    if(query.trim()) return
    loadBounds(bounds)
  },[loadBounds,query])

  const visible=useMemo(
    ()=>filter==='all'?mapPlaces:mapPlaces.filter(place=>place.categorySlug===filter),
    [mapPlaces,filter]
  )

  const categoryCounts=useMemo(()=>{
    const counts={}
    mapPlaces.forEach(place=>{ if(place.categorySlug) counts[place.categorySlug]=(counts[place.categorySlug]||0)+1 })
    return counts
  },[mapPlaces])

  const showingSearch=Boolean(query.trim())
  const selectedImage=active?.detailImage||active?.image||active?.thumbnail||''

  const chooseFilter=(slug)=>{
    setFilter(slug)
    if(active && slug!=='all' && active.categorySlug!==slug) setActive(null)
  }

  return <main className="hm-page">
    <section className="hm-shell" aria-label="HOLA Map">
      <aside className="hm-results-panel">
        <div className="hm-panel-head">
          <div className="hm-panel-brand">
            <div>
              <div className="hm-panel-kicker"><MapPin/> HOLA MAP</div>
              <h1 className="hm-panel-title">Khám phá Hòa Lạc</h1>
            </div>
            <span className="hm-panel-count">{visible.length}</span>
          </div>

          <form className="hm-search" onSubmit={submitSearch}>
            <Search aria-hidden="true"/>
            <input
              value={query}
              onChange={event=>setQuery(event.target.value)}
              placeholder="Tìm địa điểm, cafe, homestay..."
              aria-label="Tìm địa điểm trên Hola Maps"
            />
            <button type="submit" aria-label="Tìm kiếm"><Search size={16}/></button>
          </form>

          {showingSearch&&<button className="hm-search-reset" onClick={resetSearch} type="button">
            <RefreshCw size={14}/> Trở lại khu vực bản đồ
          </button>}
        </div>

        <div className="hm-results-meta">
          <b>{showingSearch?'Kết quả tìm kiếm':'Địa điểm trong khu vực'}</b>
          <small>{loading?'Đang cập nhật…':`${visible.length} địa điểm`}</small>
        </div>

        <div className="hm-result-list">
          {!loading&&visible.length===0&&<div className="hm-empty-panel">
            Không có địa điểm phù hợp trong khu vực hoặc bộ lọc hiện tại.
          </div>}

          {visible.map(place=><button
            type="button"
            className={`hm-result-row ${active?.id===place.id?'active':''}`}
            onClick={()=>loadDetail(place)}
            key={place.id}
          >
            <span className="hm-result-thumb">
              {place.thumbnail?<img src={place.thumbnail} alt="" loading="lazy"/>:<ImageIcon size={20}/>} 
            </span>
            <span className="hm-result-copy">
              <strong>{place.name}</strong>
              <span>{place.category||'Địa điểm'}</span>
              <small>{place.address||'Hòa Lạc'}</small>
            </span>
            <ChevronRight/>
          </button>)}
        </div>
      </aside>

      <div className="hm-map-stage">
        <div className="hm-category-strip" aria-label="Lọc theo danh mục">
          <button type="button" className={`hm-category-chip ${filter==='all'?'active':''}`} onClick={()=>chooseFilter('all')}>
            <MapPin/><span>Tất cả</span><small>{mapPlaces.length}</small>
          </button>
          {categories.map(category=><button
            type="button"
            className={`hm-category-chip ${filter===category.slug?'active':''}`}
            key={category.id||category.slug}
            onClick={()=>chooseFilter(category.slug)}
          >
            <MapPin/><span>{category.name}</span><small>{categoryCounts[category.slug]||0}</small>
          </button>)}
        </div>

        <MapContainer center={DEFAULT_CENTER} zoom={11} scrollWheelZoom className="hm-map">
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          <ViewportWatcher onChange={onViewportChange}/>
          <MapFocus place={active}/>
          {visible.map(place=>{
            const selected=active?.id===place.id
            return <CircleMarker
              key={place.id}
              center={place.position}
              radius={selected?10:7.5}
              pathOptions={{
                color:'#fff',
                weight:selected?3.5:2.5,
                fillColor:selected?'#173d2d':'#c45b32',
                fillOpacity:1
              }}
              eventHandlers={{click:()=>loadDetail(place)}}
            >
              <Popup className="hm-marker-popup">
                <b>{place.name}</b>
                {place.category}<br/>
                <small>{place.address}</small>
              </Popup>
            </CircleMarker>
          })}
        </MapContainer>

        {loading&&<div className="hm-loading-pill"><LoaderCircle/> Đang tải địa điểm trong khu vực này…</div>}
        {error&&<div className="hm-error-pill">{error}</div>}

        <div className="hm-map-source">Dữ liệu trực tiếp từ <b>Hola Maps API v1</b></div>

        {active&&<aside className="hm-detail-card" aria-label={`Chi tiết ${active.name}`}>
          <button type="button" className="hm-detail-close" onClick={()=>setActive(null)} aria-label="Đóng chi tiết">
            <X size={17}/>
          </button>

          <div className="hm-detail-image">
            {selectedImage?<img src={selectedImage} alt={active.name}/>:<ImageIcon size={26}/>} 
          </div>

          <div className="hm-detail-body">
            <div className="hm-detail-eyebrow">{active.category||'Địa điểm'} · HOLA MAPS</div>
            <h2>{active.name}</h2>

            {active.address&&<div className="hm-detail-address"><MapPin/> <span>{active.address}</span></div>}
            {active.description&&<p className="hm-detail-desc">{active.description}</p>}

            <div className="hm-detail-facts">
              {active.openingHours&&<span><Clock3/> {active.openingHours}</span>}
              {active.contact?.phone&&<span><Phone/> {active.contact.phone}</span>}
              {Number(active.rating?.count||0)>0&&<span><Star/> {active.rating.average} ({active.rating.count} đánh giá)</span>}
            </div>

            <div className="hm-detail-actions">
              {active.links?.holaMaps&&<a className="btn btn-green" href={active.links.holaMaps} target="_blank" rel="noreferrer">
                {detailLoading?'Đang tải chi tiết...':'Mở trên Hola Maps'} <ExternalLink size={16}/>
              </a>}
            </div>
          </div>
        </aside>}
      </div>
    </section>
  </main>
}
