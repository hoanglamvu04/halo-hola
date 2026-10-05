import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet'
import {
  MapPin, SlidersHorizontal, ArrowRight, Search, RefreshCw,
  ExternalLink, Clock3, Phone, Star
} from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import {
  getHolaCategories,
  getHolaPlacesInBounds,
  searchHolaPlaces,
  getHolaPlaceById,
  normalizeHolaPlace
} from '../services/holaMapsApi.js'

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
      if(current){
        const refreshed=normalized.find(place=>place.id===current.id)
        if(refreshed) return {...current,...refreshed}
      }
      return normalized[0]||null
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
      await loadBounds(currentBounds.current)
      return
    }
    requestController.current?.abort()
    const controller=new AbortController()
    requestController.current=controller
    setLoading(true)
    setError('')
    try{
      const result=await searchHolaPlaces(q,{limit:50},{signal:controller.signal})
      applyPlaces(result.items)
    }catch(err){
      if(err?.name!=='AbortError') setError(err.message||'Không tìm kiếm được địa điểm trên Hola Maps.')
    }finally{
      if(requestController.current===controller) setLoading(false)
    }
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

  const heroImage=mapPlaces.find(place=>place.image)?.image||''
  const showingSearch=Boolean(query.trim())

  return <main>
    <PageHero
      eyebrow="BẢN ĐỒ TRẢI NGHIỆM HÒA LẠC"
      title="HOLA"
      accent="Map"
      desc="Khám phá địa điểm Hòa Lạc bằng dữ liệu trực tiếp từ Hola Maps Developer API v1."
      image={heroImage}
    />

    <section className="container section map-page-grid">
      <aside className="map-sidebar">
        <h3><SlidersHorizontal/> Khám phá bản đồ</h3>

        <form className="map-search" onSubmit={submitSearch}>
          <Search size={17}/>
          <input
            value={query}
            onChange={event=>setQuery(event.target.value)}
            placeholder="Tìm địa điểm Hòa Lạc..."
            aria-label="Tìm địa điểm trên Hola Maps"
          />
          <button type="submit" aria-label="Tìm kiếm"><ArrowRight size={16}/></button>
        </form>

        {showingSearch&&<button className="map-reset" onClick={()=>{setQuery('');setFilter('all');loadBounds(currentBounds.current)}}>
          <RefreshCw size={16}/> Trở lại khu vực bản đồ
        </button>}

        <button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>
          <MapPin size={18}/><span>Tất cả</span><small>{mapPlaces.length}</small>
        </button>
        {categories.map(category=><button
          className={filter===category.slug?'active':''}
          key={category.id||category.slug}
          onClick={()=>setFilter(category.slug)}
        >
          <MapPin size={18}/><span>{category.name}</span><small>{categoryCounts[category.slug]||0}</small>
        </button>)}

        <hr/>
        <h4>Nguồn dữ liệu</h4>
        <div className="chip-wrap">
          <span>Hola Maps API v1</span>
          <span>OPEN</span>
          <span>{mapPlaces.length} địa điểm</span>
        </div>
        {loading&&<small className="map-api-status">Đang cập nhật dữ liệu theo khu vực bản đồ...</small>}
      </aside>

      <div className="leaflet-shell">
        <MapContainer center={DEFAULT_CENTER} zoom={11} scrollWheelZoom={false} className="leaflet-map">
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          <ViewportWatcher onChange={onViewportChange}/>
          {visible.map(place=><CircleMarker
            key={place.id}
            center={place.position}
            radius={12}
            pathOptions={{color:'#fff',weight:3,fillColor:'#c45b32',fillOpacity:1}}
            eventHandlers={{click:()=>loadDetail(place)}}
          >
            <Popup><b>{place.name}</b><br/>{place.category}<br/><small>{place.address}</small></Popup>
          </CircleMarker>)}
        </MapContainer>
      </div>

      <aside className="map-detail">
        {active?<>
          {active.detailImage?<img src={active.detailImage} alt={active.name}/>:<div className="theme-card-placeholder"/>}
          <span className="eyebrow">{active.category||'ĐỊA ĐIỂM'} · HOLA MAPS</span>
          <h2>{active.name}</h2>
          {active.address&&<div className="chip-wrap"><span><MapPin size={13}/> {active.address}</span></div>}
          <p>{active.description||active.address||'Địa điểm được cung cấp bởi Hola Maps.'}</p>
          <div className="map-place-facts">
            {active.openingHours&&<span><Clock3 size={15}/> {active.openingHours}</span>}
            {active.contact?.phone&&<span><Phone size={15}/> {active.contact.phone}</span>}
            {Number(active.rating?.count||0)>0&&<span><Star size={15}/> {active.rating.average} ({active.rating.count})</span>}
          </div>
          {active.links?.holaMaps&&<a className="btn btn-green" href={active.links.holaMaps} target="_blank" rel="noreferrer">
            {detailLoading?'Đang tải chi tiết...':'Xem trên Hola Maps'} <ExternalLink size={16}/>
          </a>}
        </>:<div className="jw-empty">Chọn một địa điểm trên bản đồ để xem thông tin.</div>}
      </aside>
    </section>

    {error&&<div className="container"><div className="form-error">{error}</div></div>}
    {!loading&&!error&&visible.length===0&&<div className="container"><div className="jw-empty">Không có địa điểm phù hợp trong khu vực hoặc bộ lọc hiện tại.</div></div>}

    <section className="container section">
      <h2>{showingSearch?'Kết quả tìm kiếm':'Những địa điểm trong khu vực đang xem'}</h2>
      <div className="place-grid">
        {visible.map(place=><button className="place-card" onClick={()=>loadDetail(place)} key={place.id}>
          {place.thumbnail?<img src={place.thumbnail} alt={place.name}/>:<div className="theme-card-placeholder"/>}
          <div>
            <h3>{place.name}</h3>
            <span>{place.category}{place.address?' · '+place.address:''}</span>
            <p>{place.description||place.address||'Dữ liệu địa điểm từ Hola Maps.'}</p>
          </div>
        </button>)}
      </div>
    </section>
  </main>
}
