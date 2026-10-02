import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { MapPin, SlidersHorizontal, Leaf, Building2, Users, BookOpen, Landmark, Utensils, ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { mapPlaces, img } from '../data/siteData.js'

const cats=[['Tất cả',MapPin],['Điểm đến',MapPin],['Câu chuyện',BookOpen],['Con người',Users],['Kiến trúc',Building2],['Thiên nhiên',Leaf],['Ẩm thực',Utensils],['Văn hóa',Landmark]]
export default function MapPage(){
 const [active,setActive]=useState(mapPlaces[0]); const [filter,setFilter]=useState('Tất cả')
 const visible=filter==='Tất cả'?mapPlaces:mapPlaces.filter(p=>p.category===filter)
 return <main><PageHero eyebrow="BẢN ĐỒ TRẢI NGHIỆM HÒA LẠC" title="HOLA" accent="Map" desc="Khám phá địa điểm, câu chuyện và góc nhìn trên bản đồ Hòa Lạc." image={img.lake}/>
 <section className="container section map-page-grid">
  <aside className="map-sidebar"><h3><SlidersHorizontal/> Khám phá bản đồ</h3>{cats.map(([c,I])=><button className={filter===c?'active':''} key={c} onClick={()=>setFilter(c)}><I size={18}/><span>{c}</span><small>{c==='Tất cả'?mapPlaces.length:''}</small></button>)}<hr/><h4>Chủ đề</h4><div className="chip-wrap"><span>Lịch sử</span><span>Đời sống</span><span>Trải nghiệm</span><span>Học tập</span><span>Sáng tạo</span><span>Cộng đồng</span></div><h4>Sắc màu Hòa Lạc</h4><div className="color-mini"><i className="c1"/><i className="c2"/><i className="c3"/><i className="c4"/><i className="c5"/></div></aside>
  <div className="leaflet-shell"><MapContainer center={[21.02,105.51]} zoom={11} scrollWheelZoom={false} className="leaflet-map"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{visible.map(p=><CircleMarker key={p.id} center={p.position} radius={12} pathOptions={{color:'#fff',weight:3,fillColor:'#c45b32',fillOpacity:1}} eventHandlers={{click:()=>setActive(p)}}><Popup><b>{p.name}</b><br/>{p.category}</Popup></CircleMarker>)}</MapContainer></div>
  <aside className="map-detail"><img src={active.image}/><span className="eyebrow">{active.category} · ĐIỂM ĐẾN</span><h2>{active.name}</h2><div className="chip-wrap"><span>Thiên nhiên</span><span>Hoàng hôn</span><span>Trải nghiệm</span></div><p>{active.desc} Nơi đây là điểm hẹn lý tưởng để đi, nhìn, gặp và kể câu chuyện Hòa Lạc theo cách của riêng bạn.</p><div className="detail-info"><div><b>Thời điểm đẹp</b><small>Tháng 10 – Tháng 3</small></div><div><b>Chủ đề liên quan</b><small>Thiên nhiên · Câu chuyện</small></div></div><button className="btn btn-green">Xem chi tiết <ArrowRight size={16}/></button><button className="btn btn-outline">Xem góc nhìn TOP52</button></aside>
 </section>
 <section className="container section"><h2>Những địa điểm nổi bật trên bản đồ</h2><div className="place-grid">{mapPlaces.map(p=><button className="place-card" onClick={()=>setActive(p)} key={p.id}><img src={p.image}/><div><h3>{p.name}</h3><span>{p.category}</span><p>{p.desc}</p></div></button>)}</div></section>
 </main>
}
