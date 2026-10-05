import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { MapPin, SlidersHorizontal, Leaf, Building2, Users, BookOpen, Landmark, Utensils, ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { getPlaces } from '../services/api.js'
import { normalizePlace } from '../utils/contentAdapters.js'

const cats=[['Tất cả',MapPin],['Điểm đến',MapPin],['Câu chuyện',BookOpen],['Con người',Users],['Kiến trúc',Building2],['Thiên nhiên',Leaf],['Ẩm thực',Utensils],['Văn hóa',Landmark]]
export default function MapPage(){
 const [mapPlaces,setMapPlaces]=useState([])
 const [active,setActive]=useState(null)
 const [filter,setFilter]=useState('Tất cả')
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 useEffect(()=>{
   setLoading(true);setError('')
   getPlaces().then(data=>{
     const normalized=(data||[]).map(normalizePlace)
     setMapPlaces(normalized)
     setActive(normalized[0]||null)
   }).catch(err=>setError(err.message)).finally(()=>setLoading(false))
 },[])
 const visible=useMemo(()=>filter==='Tất cả'?mapPlaces:mapPlaces.filter(p=>p.category===filter),[mapPlaces,filter])
 const heroImage=mapPlaces.find(p=>p.image)?.image||''
 return <main><PageHero eyebrow="BẢN ĐỒ TRẢI NGHIỆM HÒA LẠC" title="HOLA" accent="Map" desc="Khám phá địa điểm, câu chuyện và góc nhìn trên bản đồ Hòa Lạc." image={heroImage}/>
 {loading&&<div className="jw-empty">Đang tải dữ liệu HOLA Map...</div>}
 {error&&<div className="form-error">{error}</div>}
 {!loading&&!error&&mapPlaces.length===0&&<div className="jw-empty">Chưa có địa điểm được công bố trên HOLA Map.</div>}
 {mapPlaces.length>0&&<><section className="container section map-page-grid">
  <aside className="map-sidebar"><h3><SlidersHorizontal/> Khám phá bản đồ</h3>{cats.map(([c,I])=><button className={filter===c?'active':''} key={c} onClick={()=>setFilter(c)}><I size={18}/><span>{c}</span><small>{c==='Tất cả'?mapPlaces.length:''}</small></button>)}<hr/><h4>Tags</h4><div className="chip-wrap">{Array.from(new Set(mapPlaces.flatMap(p=>p.tags||[]))).slice(0,10).map(tag=><span key={tag}>{tag}</span>)}</div></aside>
  <div className="leaflet-shell"><MapContainer center={[21.02,105.51]} zoom={11} scrollWheelZoom={false} className="leaflet-map"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{visible.map(p=><CircleMarker key={p.id} center={p.position} radius={12} pathOptions={{color:'#fff',weight:3,fillColor:'#c45b32',fillOpacity:1}} eventHandlers={{click:()=>setActive(p)}}><Popup><b>{p.name}</b><br/>{p.category}</Popup></CircleMarker>)}</MapContainer></div>
  {active&&<aside className="map-detail">{active.image?<img src={active.image} alt={active.name}/>:<div className="theme-card-placeholder"/>}<span className="eyebrow">{active.category} · ĐIỂM ĐẾN</span><h2>{active.name}</h2><div className="chip-wrap">{(active.tags||[]).map(tag=><span key={tag}>{tag}</span>)}</div><p>{active.desc}</p><button className="btn btn-green">Xem chi tiết <ArrowRight size={16}/></button></aside>}
 </section>
 <section className="container section"><h2>Những địa điểm nổi bật trên bản đồ</h2><div className="place-grid">{mapPlaces.map(p=><button className="place-card" onClick={()=>setActive(p)} key={p.id}>{p.image?<img src={p.image} alt={p.name}/>:<div className="theme-card-placeholder"/>}<div><h3>{p.name}</h3><span>{p.category}</span><p>{p.desc}</p></div></button>)}</div></section></>}
 </main>
}
