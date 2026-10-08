import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight,
  Eye, Image as ImageIcon, MapPin, Maximize2, Play, Share2, Sparkles, X
} from 'lucide-react'
import {
  getPublicArtwork,
  getPublicArtworks,
  getAdminPublicPreviewArtwork,
  getAdminPublicPreviewArtworks
} from '../services/api.js'
import ArtworkCard from '../components/ArtworkCard.jsx'
import './ArtworkPage.css'
import './ArtworkViewer.css'

function isVideoMedia(media,item){
  return String(media?.mimeType||'').startsWith('video/') || (!media?.mimeType && item?.type==='Video')
}

function formatDate(value){
  if(!value)return 'Theo hồ sơ tác phẩm'
  const date=new Date(value)
  return Number.isNaN(date.getTime())?'Theo hồ sơ tác phẩm':date.toLocaleDateString('vi-VN')
}

export default function ArtworkPage({preview=false}){
 const {slug,submissionId}=useParams()
 const [item,setItem]=useState(null)
 const [related,setRelated]=useState([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [shareLabel,setShareLabel]=useState('Chia sẻ')
 const [activeMediaIndex,setActiveMediaIndex]=useState(0)
 const [viewerOpen,setViewerOpen]=useState(false)

 useEffect(()=>{
   let alive=true
   const key=preview?submissionId:slug
   if(!key)return()=>{alive=false}
   setLoading(true);setError('');setActiveMediaIndex(0);setViewerOpen(false)
   const detailRequest=preview?getAdminPublicPreviewArtwork(key):getPublicArtwork(key)
   detailRequest.then(async data=>{
     if(!alive)return
     setItem(data)
     const rows=preview
       ? await getAdminPublicPreviewArtworks({theme:data.theme,limit:5})
       : await getPublicArtworks({theme:data.theme,limit:5})
     if(alive)setRelated((rows||[]).filter(x=>x.id!==data.id&&x.slug!==data.slug).slice(0,4))
   }).catch(err=>{if(alive)setError(err.message)}).finally(()=>{if(alive)setLoading(false)})
   return()=>{alive=false}
 },[slug,submissionId,preview])

 const mediaItems=useMemo(()=>{
   const rows=Array.isArray(item?.media)?item.media.filter(x=>x?.url):[]
   if(rows.length)return rows
   return item?.image?[{id:'cover',url:item.image,mimeType:item.type==='Video'?'video/unknown':'image/unknown',originalName:item.title||item.code}]:[]
 },[item])
 const activeMedia=mediaItems[activeMediaIndex]||mediaItems[0]||null
 const activeIsVideo=isVideoMedia(activeMedia,item)

 const moveMedia=(delta)=>{
   if(mediaItems.length<2)return
   setActiveMediaIndex(current=>(current+delta+mediaItems.length)%mediaItems.length)
 }

 useEffect(()=>{
   if(!viewerOpen)return undefined
   const previousOverflow=document.body.style.overflow
   document.body.style.overflow='hidden'
   const onKeyDown=(event)=>{
     if(event.key==='Escape')setViewerOpen(false)
     if(event.key==='ArrowLeft')moveMedia(-1)
     if(event.key==='ArrowRight')moveMedia(1)
   }
   window.addEventListener('keydown',onKeyDown)
   return()=>{
     window.removeEventListener('keydown',onKeyDown)
     document.body.style.overflow=previousOverflow
   }
 },[viewerOpen,mediaItems.length])

 const share=async()=>{
   try{
     const payload={title:item?.title||'HALO HOLA',text:item?.story||undefined,url:window.location.href}
     if(navigator.share) await navigator.share(payload)
     else{
       await navigator.clipboard.writeText(window.location.href)
       setShareLabel('Đã sao chép')
       setTimeout(()=>setShareLabel('Chia sẻ'),1600)
     }
   }catch{}
 }

 const openMedia=()=>{
   if(activeMedia?.url)window.open(activeMedia.url,'_blank','noopener,noreferrer')
 }

 if(loading)return <main className="artwork-showcase"><div className="artwork-showcase-state">Đang tải tác phẩm từ hệ thống...</div></main>
 if(error||!item)return <main className="artwork-showcase"><div className="container artwork-showcase-error"><div className="form-error">{error||'Không tìm thấy tác phẩm.'}</div><Link className="btn btn-outline" to="/top52"><ArrowLeft/> Quay lại TOP52</Link></div></main>

 const badge=item.status==='AWARDED'?'ĐẠT GIẢI':'TOP52'
 const story=String(item.story||'').trim()||'Tác phẩm được công bố trong hành trình HALO HOLA 2026.'
 const lead=story.split(/\n+/)[0]
 const score=Number(item.juryScore||0)

 return <main className="artwork-showcase">
   <div className="artwork-showcase-top container">
     <Link to="/top52"><ArrowLeft/> TOP52</Link>
     <span>{item.code} · {item.type}</span>
   </div>

   <section className="container artwork-showcase-hero">
     <div className="artwork-gallery-shell">
       <div className={`artwork-main-media ${activeMedia&&!activeIsVideo?'is-image-viewable':''}`}>
         {activeMedia
           ? activeIsVideo
             ? <video key={activeMedia.url} src={activeMedia.url} controls playsInline preload="metadata" />
             : <img key={activeMedia.url} src={activeMedia.url} alt={item.title||item.code} loading="eager" onClick={()=>setViewerOpen(true)} title="Nhấn để xem ảnh" />
           : <div className="artwork-media-empty"><ImageIcon/><span>Chưa có media hiển thị</span></div>}

         <div className="artwork-media-badges">
           <span className="artwork-status-badge">{badge}</span>
           <span className="artwork-theme-badge">{item.theme}</span>
         </div>

         {mediaItems.length>1&&<>
           <button className="artwork-gallery-nav prev" type="button" onClick={()=>moveMedia(-1)} aria-label="Media trước"><ChevronLeft/></button>
           <button className="artwork-gallery-nav next" type="button" onClick={()=>moveMedia(1)} aria-label="Media tiếp theo"><ChevronRight/></button>
         </>}

         {activeMedia&&<button className="artwork-open-media" type="button" onClick={openMedia}><Maximize2/> Mở media</button>}
         {mediaItems.length>0&&<span className="artwork-media-counter">{activeMediaIndex+1}/{mediaItems.length}</span>}
       </div>

       {mediaItems.length>1&&<div className="artwork-thumb-rail" aria-label="Thư viện media">
         {mediaItems.map((media,index)=>{
           const video=isVideoMedia(media,item)
           return <button key={media.id||media.url} type="button" className={index===activeMediaIndex?'active':''} onClick={()=>setActiveMediaIndex(index)} aria-label={`Mở media ${index+1}`}>
             {video?<span className="artwork-video-thumb"><Play/></span>:<img loading="lazy" decoding="async" src={media.url} alt=""/>}
             <i>{index+1}</i>
           </button>
         })}
       </div>}
     </div>

     <aside className="artwork-showcase-info">
       <span className="artwork-showcase-kicker">{item.code}</span>
       <h1>{item.title||item.code}</h1>
       <p className="artwork-showcase-lead">{lead}</p>

       <div className="artwork-author-card">
         <span>{item.author?.charAt(0)?.toUpperCase()||'H'}</span>
         <div><b>{item.author||'Tác giả HALO HOLA'}</b><small>Tác giả · HALO HOLA 2026</small></div>
       </div>

       <div className="artwork-showcase-chips">
         <span>{item.theme}</span>
         <span>{item.type}</span>
         {item.color&&<span>{item.color}</span>}
       </div>

       <div className="artwork-facts">
         <div><MapPin/><span><small>Địa điểm</small><b>{item.location||'Hòa Lạc'}</b></span></div>
         <div><CalendarDays/><span><small>Thời gian thực hiện</small><b>{formatDate(item.capturedAt)}</b></span></div>
         <div><ImageIcon/><span><small>Media</small><b>{mediaItems.length||0} file</b></span></div>
         <div><Eye/><span><small>Điểm TB Hội đồng</small><b>{score.toFixed(1)}/100</b></span></div>
       </div>

       <div className="artwork-showcase-actions">
         <Link className="btn btn-green" to="/hola-map"><MapPin size={17}/> Mở HOLA Map</Link>
         <button className="btn btn-outline" type="button" onClick={share}><Share2 size={17}/> {shareLabel}</button>
       </div>
     </aside>
   </section>

   <section className="artwork-story-band">
     <div className="container artwork-story-layout">
       <article>
         <span className="artwork-showcase-kicker"><Sparkles/> CÂU CHUYỆN PHÍA SAU TÁC PHẨM</span>
         <h2>{item.title||item.code}</h2>
         <p>{story}</p>
       </article>
       <aside>
         <span>{item.code}</span>
         <blockquote>“Mỗi góc nhìn góp phần kể câu chuyện chung về Hòa Lạc.”</blockquote>
         <small>— {item.author||'HALO HOLA 2026'}</small>
       </aside>
     </div>
   </section>

   {related.length>0&&<section className="container artwork-related-section">
     <header><div><span className="artwork-showcase-kicker">KHÁM PHÁ TIẾP</span><h2>Cùng chủ đề {item.theme}</h2></div><Link to="/top52">Xem TOP52 <ArrowRight/></Link></header>
     <div className="art-grid compact artwork-related-grid">{related.map(a=><ArtworkCard key={a.id||a.slug} item={a}/>)}</div>
   </section>}

   <section className="container artwork-showcase-bottom">
     <Link to="/top52" className="btn btn-outline"><ArrowLeft size={16}/> Xem toàn bộ TOP52</Link>
     <Link to="/gui-goc-nhin" className="btn btn-terra">Gửi góc nhìn của bạn <ArrowRight size={16}/></Link>
   </section>

   {viewerOpen&&activeMedia&&<div className="artwork-media-viewer" role="dialog" aria-modal="true" aria-label={`Xem media ${item.title||item.code}`}>
     <div className="artwork-viewer-topbar">
       <div className="artwork-viewer-heading"><span>BỘ ẢNH / Ý TƯỞNG</span><strong>{item.title||item.code}</strong></div>
       <button className="artwork-viewer-close" type="button" onClick={()=>setViewerOpen(false)} aria-label="Đóng trình xem"><X/></button>
     </div>

     <div className="artwork-viewer-stage">
       {mediaItems.length>1&&<>
         <button className="artwork-viewer-nav prev" type="button" onClick={()=>moveMedia(-1)} aria-label="Ảnh trước"><ChevronLeft/></button>
         <button className="artwork-viewer-nav next" type="button" onClick={()=>moveMedia(1)} aria-label="Ảnh tiếp theo"><ChevronRight/></button>
       </>}
       <div className="artwork-viewer-media">
         {activeIsVideo
           ? <video key={activeMedia.url} src={activeMedia.url} controls playsInline autoPlay preload="metadata" />
           : <img key={activeMedia.url} src={activeMedia.url} alt={item.title||item.code} />}
         <button className="artwork-viewer-open" type="button" onClick={openMedia}><Maximize2/> Mở toàn màn hình</button>
       </div>
     </div>

     <div className="artwork-viewer-bottom">
       <div className="artwork-viewer-thumbs" aria-label="Danh sách media">
         {mediaItems.map((media,index)=>{
           const video=isVideoMedia(media,item)
           return <button key={media.id||media.url} type="button" className={`artwork-viewer-thumb ${index===activeMediaIndex?'active':''}`} onClick={()=>setActiveMediaIndex(index)} aria-label={`Xem media ${index+1}`}>
             {video?<span className="artwork-viewer-video-thumb"><Play/></span>:<img loading="lazy" decoding="async" src={media.url} alt=""/>}
           </button>
         })}
       </div>
       <span className="artwork-viewer-count">{activeMediaIndex+1}/{mediaItems.length}</span>
     </div>
   </div>}
 </main>
}
