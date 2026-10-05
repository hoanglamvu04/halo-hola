import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Eye, MapPin, Share2, ArrowRight, ArrowLeft } from 'lucide-react'
import { getPublicArtwork, getPublicArtworks } from '../services/api.js'
import ArtworkCard from '../components/ArtworkCard.jsx'

export default function ArtworkPage(){
 const {slug}=useParams()
 const [item,setItem]=useState(null)
 const [related,setRelated]=useState([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [shareLabel,setShareLabel]=useState('Chia sẻ góc nhìn')

 useEffect(()=>{
   let alive=true
   setLoading(true);setError('')
   getPublicArtwork(slug).then(async data=>{
     if(!alive)return
     setItem(data)
     const rows=await getPublicArtworks({theme:data.theme,limit:5})
     if(alive)setRelated((rows||[]).filter(x=>x.slug!==data.slug).slice(0,4))
   }).catch(err=>{if(alive)setError(err.message)}).finally(()=>{if(alive)setLoading(false)})
   return()=>{alive=false}
 },[slug])

 const share=async()=>{
   try{
     if(navigator.share) await navigator.share({title:item?.title||'HALO HOLA',url:window.location.href})
     else{await navigator.clipboard.writeText(window.location.href);setShareLabel('Đã sao chép');setTimeout(()=>setShareLabel('Chia sẻ góc nhìn'),1600)}
   }catch{}
 }

 if(loading)return <main className="artwork-page paper-bg"><div className="jw-empty">Đang tải tác phẩm từ hệ thống...</div></main>
 if(error||!item)return <main className="artwork-page paper-bg"><div className="container section"><div className="form-error">{error||'Không tìm thấy tác phẩm.'}</div><Link className="btn btn-outline" to="/top52"><ArrowLeft/> Quay lại TOP52</Link></div></main>
 const media=Array.isArray(item.media)?item.media:[]
 const lead=item.story||'Tác phẩm được công bố trong hành trình HALO HOLA 2026.'
 return <main className="artwork-page paper-bg"><section className="container section artwork-hero"><div className="artwork-media">{item.image?<img src={item.image} alt={item.title||item.code}/>:<div className="theme-card-placeholder"/>}<span className="top52-badge big">{item.status==='AWARDED'?'ĐẠT GIẢI':'TOP52'} · {item.theme}</span>{media.length>1&&<div className="thumb-strip">{media.slice(0,5).map(m=><img key={m.id} src={m.url} alt=""/>)}</div>}</div><div className="artwork-info"><span className="eyebrow">{item.code} · {item.type}</span><h1>{item.title||item.code}</h1><p className="lead">{lead}</p><div className="author-row"><div className="avatar">{item.author?.charAt(0)||'H'}</div><div><b>{item.author}</b><small>Tác giả HALO HOLA 2026</small></div></div><div className="chip-wrap"><span>{item.theme}</span><span>{item.location}</span>{item.color&&<span>{item.color}</span>}</div><dl><div><dt>Chủ đề</dt><dd>{item.theme}</dd></div><div><dt>Địa điểm</dt><dd>{item.location}</dd></div><div><dt>Thời gian thực hiện</dt><dd>{item.capturedAt?new Date(item.capturedAt).toLocaleDateString('vi-VN'):'Theo hồ sơ tác phẩm'}</dd></div></dl><div className="stat-row"><div><Eye/><b>{Number(item.juryScore||0).toFixed(1)}</b><small>Điểm TB Hội đồng</small></div></div><div className="stack-actions"><Link className="btn btn-green" to="/hola-map"><MapPin size={17}/> Xem HOLA Map</Link><button className="btn btn-outline" onClick={share}><Share2 size={17}/> {shareLabel}</button></div></div></section>
 <section className="container section story-detail"><div><span className="eyebrow">CÂU CHUYỆN PHÍA SAU TÁC PHẨM</span><h2>{item.title||item.code}</h2><p>{item.story}</p></div><blockquote>“Mỗi góc nhìn góp phần kể câu chuyện chung về Hòa Lạc.”<cite>— {item.author}</cite></blockquote></section>
 {related.length>0&&<section className="container section"><h2>Các tác phẩm cùng chủ đề</h2><div className="art-grid compact">{related.map(a=><ArtworkCard key={a.id||a.slug} item={a}/>)}</div></section>}
 <section className="container section"><Link to="/top52" className="btn btn-outline">Xem toàn bộ TOP52 <ArrowRight size={16}/></Link></section></main>
}
