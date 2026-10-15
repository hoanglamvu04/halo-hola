import { useEffect, useMemo, useState } from 'react'
import { Camera, Compass, Eye, Heart, Map, MapPin, Search, SlidersHorizontal, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getColors, getPublicArtworks, getThemes } from '../services/api.js'
import './CommunityGalleryPage.css'

const PAGE_SIZE=18
const types=['Photo','Video','Story & Creative','Art & Design']

function badgeForItem(item){
  if(item.status==='AWARDED') return 'ĐẠT GIẢI'
  if(item.status==='TOP52') return 'TOP52'
  if(item.status==='SHORTLIST') return 'SHORTLIST'
  return 'GÓC NHÌN CỘNG ĐỒNG'
}

export default function CommunityGalleryPage(){
  const [themes,setThemes]=useState([])
  const [colors,setColors]=useState([])
  const [items,setItems]=useState([])
  const [total,setTotal]=useState(0)
  const [filters,setFilters]=useState({q:'',theme:'',type:'',color:'',location:'',sort:'latest'})
  const [loading,setLoading]=useState(true)
  const [loadingMore,setLoadingMore]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{
    getThemes().then(rows=>setThemes(Array.isArray(rows)?rows:[])).catch(()=>{})
    getColors().then(rows=>setColors(Array.isArray(rows)?rows:[])).catch(()=>{})
  },[])

  const load=async({append=false}={})=>{
    const offset=append?items.length:0
    append?setLoadingMore(true):setLoading(true)
    setError('')
    try{
      const rows=await getPublicArtworks({
        q:filters.q||undefined,
        theme:filters.theme||undefined,
        type:filters.type||undefined,
        color:filters.color||undefined,
        location:filters.location||undefined,
        sort:filters.sort||'latest',
        limit:PAGE_SIZE,
        offset
      })
      const next=(Array.isArray(rows)?rows:[]).map(item=>({...item,badgeLabel:badgeForItem(item)}))
      setItems(current=>append?[...current,...next]:next)
      setTotal(Number(next[0]?.totalCount ?? (append?items.length+next.length:next.length)))
    }catch(err){
      setError(err.message||'Không tải được gallery cộng đồng.')
    }finally{
      append?setLoadingMore(false):setLoading(false)
    }
  }

  useEffect(()=>{
    setItems([]);setTotal(0)
    const timer=setTimeout(()=>load({append:false}),220)
    return()=>clearTimeout(timer)
  },[filters.q,filters.theme,filters.type,filters.color,filters.location,filters.sort])

  const clearFilters=()=>setFilters({q:'',theme:'',type:'',color:'',location:'',sort:'latest'})
  const hasFilters=Object.entries(filters).some(([key,value])=>key==='sort'?value!=='latest':Boolean(value))
  const hasMore=items.length<total
  const themeTitle=useMemo(()=>themes.find(x=>x.title===filters.theme)?.title||'Tất cả chủ đề',[themes,filters.theme])

  return <main className="community-gallery-page">
    <section className="community-gallery-hero">
      <div className="container community-gallery-hero-inner">
        <div className="community-gallery-copy">
          <span className="community-gallery-kicker"><Compass/> GÓC NHÌN CỘNG ĐỒNG · HALO HOLA 2026</span>
          <h1>Mỗi góc nhìn,<br/><em>một Hòa Lạc khác.</em></h1>
          <p>Những góc nhìn, câu chuyện và khoảnh khắc được cộng đồng gửi về trong hành trình HALO HOLA 2026.</p>
          <div className="community-gallery-hero-actions">
            <a href="#gallery" className="btn btn-green"><Camera/> Xem gallery</a>
            <Link to="/hola-map" className="btn btn-outline"><Map/> Xem trên HOLA Map</Link>
          </div>
        </div>
        <div className="community-gallery-hero-stats">
          <div><Sparkles/><strong>{total}</strong><span>góc nhìn công khai</span></div>
          <div><Users/><strong>{new Set(items.map(x=>x.author)).size || '—'}</strong><span>người kể trong trang này</span></div>
          <div><MapPin/><strong>{new Set(items.map(x=>x.location).filter(Boolean)).size || '—'}</strong><span>địa điểm trong trang này</span></div>
        </div>
      </div>
    </section>

    <section className="container community-gallery-shell" id="gallery">
      <div className="community-gallery-heading">
        <div><span>TÁC PHẨM CỘNG ĐỒNG</span><h2>Những góc nhìn đang được kể</h2><p>Khám phá Hòa Lạc qua hình ảnh, video, câu chuyện và thiết kế đã được Ban Tổ chức công bố.</p></div>
        <div className="community-gallery-count"><b>{total}</b> tác phẩm <span>·</span> {themeTitle}</div>
      </div>

      <div className="community-gallery-filters">
        <label className="community-gallery-search"><Search/><input value={filters.q} onChange={e=>setFilters(v=>({...v,q:e.target.value}))} placeholder="Tìm tác phẩm, tác giả, mã dự thi, địa điểm..."/></label>
        <div className="community-gallery-theme-row">
          <span><SlidersHorizontal/> Chủ đề</span>
          <button className={!filters.theme?'active':''} onClick={()=>setFilters(v=>({...v,theme:''}))}>Tất cả</button>
          {themes.map(theme=><button key={theme.slug||theme.id} className={filters.theme===theme.title?'active':''} onClick={()=>setFilters(v=>({...v,theme:theme.title}))}>{theme.title}</button>)}
        </div>
        <div className="community-gallery-controls">
          <select value={filters.type} onChange={e=>setFilters(v=>({...v,type:e.target.value}))}><option value="">Tất cả loại hình</option>{types.map(type=><option key={type} value={type}>{type}</option>)}</select>
          <select value={filters.color} onChange={e=>setFilters(v=>({...v,color:e.target.value}))}><option value="">Mọi sắc màu</option>{colors.map(color=><option key={color.id||color.slug} value={color.name}>{color.name}</option>)}</select>
          <label><MapPin/><input value={filters.location} onChange={e=>setFilters(v=>({...v,location:e.target.value}))} placeholder="Địa điểm"/></label>
          <select value={filters.sort} onChange={e=>setFilters(v=>({...v,sort:e.target.value}))}><option value="latest">Mới nhất</option><option value="score">Nổi bật</option><option value="oldest">Cũ nhất</option></select>
          {hasFilters&&<button className="community-gallery-clear" onClick={clearFilters}>Xóa bộ lọc</button>}
        </div>
      </div>

      {loading&&<div className="community-gallery-state"><span/>Đang tải những góc nhìn mới...</div>}
      {error&&<div className="form-error">{error}</div>}
      {!loading&&!error&&!items.length&&<div className="community-gallery-empty"><Compass/><h3>Chưa có góc nhìn phù hợp</h3><p>Thử bỏ bớt bộ lọc hoặc quay lại sau khi Ban Tổ chức công bố thêm tác phẩm.</p></div>}

      {!loading&&items.length>0&&<>
        <div className="community-art-grid">{items.map(item=><Link to={'/tac-pham/'+item.slug} className="community-art-card" key={item.id||item.slug}>
          <div className="community-art-media">
            {item.image?<img src={item.image} alt={item.title||item.code} loading="lazy" decoding="async"/>:<div className="theme-card-placeholder"/>}
            <span className="community-art-badge">{item.badgeLabel}</span>
            <span className="community-art-heart" aria-hidden="true"><Heart/></span>
          </div>
          <div className="community-art-body">
            <span className="community-art-category">{item.theme}{item.location?` · ${item.location}`:''}</span>
            <h3>{item.title||item.code}</h3>
            <div className="community-art-author"><span>{String(item.author||'H').charAt(0).toUpperCase()}</span><b>{item.author||'Tác giả HALO HOLA'}</b></div>
            <div className="community-art-meta"><span><Eye/> {Number(item.juryScore||0).toFixed(1)} điểm BGK</span><i/><span><MapPin/> {item.location||'Hòa Lạc'}</span></div>
          </div>
        </Link>)}</div>
        <div className="community-gallery-footer"><span>Đang hiển thị <b>{items.length}</b> / {total} góc nhìn</span>{hasMore&&<button className="btn btn-outline" disabled={loadingMore} onClick={()=>load({append:true})}>{loadingMore?'Đang tải...':'Xem thêm góc nhìn'}</button>}</div>
      </>}
    </section>
  </main>
}
