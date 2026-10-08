import { useEffect, useMemo, useState } from 'react'
import { Award, BookOpen, CheckCircle2, Grid2X2, Map, Search, SlidersHorizontal, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import ArtworkCard from '../components/ArtworkCard.jsx'
import { getPublicTop52, getThemes } from '../services/api.js'
import './Top52Page.css'

const PAGE_SIZE=16
const types=['Photo','Video','Story & Creative','Art & Design']

function badgeFor(item){
  const tags=Array.isArray(item.selectionTypes)?item.selectionTypes:[]
  let label='TOP52'
  if(tags.includes('TITLE_FINALIST')) label='CHUNG KẾT DANH HIỆU'
  else if(tags.includes('THEME_WINNER')) label='GIẢI CHỦ ĐỀ'
  else if(tags.includes('COLOR_WINNER')) label='GIẢI SẮC MÀU'
  else if(tags.includes('TOP3_THEME')) label='TOP 3 CHỦ ĐỀ'
  else if(item.status==='AWARDED') label='ĐẠT GIẢI'
  return label
}

export default function Top52Page(){
  const [themes,setThemes]=useState([])
  const [items,setItems]=useState([])
  const [total,setTotal]=useState(0)
  const [meta,setMeta]=useState({})
  const [filters,setFilters]=useState({q:'',theme:'',type:'',award:false})
  const [loading,setLoading]=useState(true)
  const [loadingMore,setLoadingMore]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{getThemes().then(rows=>setThemes(Array.isArray(rows)?rows:[])).catch(()=>{})},[])

  const load=async({append=false}={})=>{
    const offset=append?items.length:0
    append?setLoadingMore(true):setLoading(true)
    setError('')
    try{
      const params={
        q:filters.q||undefined,
        theme:filters.theme||undefined,
        type:filters.type||undefined,
        award:filters.award?'true':undefined,
        limit:PAGE_SIZE,
        offset
      }
      const data=await getPublicTop52(params)
      const next=(data?.items||[]).map(item=>({...item,badgeLabel:badgeFor(item)}))
      setItems(current=>append?[...current,...next]:next)
      setTotal(Number(data?.total||0))
      setMeta(data?.meta||{})
    }catch(err){
      setError(err.message)
    }finally{
      append?setLoadingMore(false):setLoading(false)
    }
  }

  useEffect(()=>{
    const timer=setTimeout(()=>load({append:false}),260)
    return()=>clearTimeout(timer)
  },[filters.q,filters.theme,filters.type,filters.award])

  const heroImage=items.find(x=>x.image)?.image||themes.find(x=>x.image)?.image||''
  const selectedCount=Number(meta?.selectedCount||0)
  const publishedCount=Number(meta?.publishedCount||0)
  const hasMore=items.length<total
  const statusText=selectedCount
    ? `${publishedCount||total}/${selectedCount} tác phẩm trong bộ sưu tập`
    : `${total} tác phẩm trong bộ sưu tập`
  const statusDetail=meta?.round?.status==='LOCKED'
    ? 'Danh sách TOP52 đã được chốt'
    : '52 góc nhìn · 1 Hòa Lạc'

  const themeTitle=useMemo(()=>themes.find(x=>x.title===filters.theme)?.title||'Tất cả chủ đề',[themes,filters.theme])

  return <main className="top52-live-page">
    <section className="top52-live-hero">
      <div className="container top52-live-hero-grid">
        <div className="top52-live-copy">
          <span className="top52-live-eyebrow"><Trophy/> TRIỂN LÃM CỘNG ĐỒNG · HALO HOLA 2026</span>
          <h1>TOP<span>52</span></h1>
          <h2>52 góc nhìn · 1 Hòa Lạc</h2>
          <p>52 tác phẩm đại diện cho những góc nhìn đa dạng về thiên nhiên, con người, văn hóa, tri thức và một Hòa Lạc đang chuyển mình.</p>
          <div className="top52-live-status">
            <span><CheckCircle2/></span>
            <div><b>{statusText}</b><small>{statusDetail}</small></div>
          </div>
          <div className="top52-live-actions">
            <a href="#gallery" className="btn btn-green"><Grid2X2/> Xem gallery</a>
            <Link className="btn btn-outline" to="/stories"><BookOpen/> Stories</Link>
            <Link className="btn btn-outline" to="/hola-map"><Map/> HOLA Map</Link>
          </div>
        </div>
        <div className="top52-live-visual">
          {heroImage?<img src={heroImage} alt="TOP52 HALO HOLA 2026"/>:<div className="top52-live-placeholder"/>}
          <div className="top52-live-number"><b>{total||publishedCount||0}</b><span>TÁC PHẨM<br/>TOP52</span></div>
          <div className="top52-live-seal"><Award/><span>HALO HOLA<br/><b>2026</b></span></div>
        </div>
      </div>
    </section>

    <section className="container top52-live-gallery" id="gallery">
      <div className="top52-live-heading">
        <div><span className="eyebrow">TOP52 GALLERY</span><h2>Những góc nhìn được chọn</h2></div>
        <p>{total} kết quả phù hợp · {themeTitle}</p>
      </div>

      <div className="top52-live-filters">
        <label className="top52-search"><Search/><input value={filters.q} onChange={e=>setFilters(v=>({...v,q:e.target.value}))} placeholder="Tìm mã bài, tên tác phẩm, tác giả, địa điểm..."/></label>
        <div className="top52-filter-row"><SlidersHorizontal/><b>Chủ đề</b><button className={!filters.theme?'active':''} onClick={()=>setFilters(v=>({...v,theme:''}))}>Tất cả</button>{themes.map(t=><button key={t.slug} className={filters.theme===t.title?'active':''} onClick={()=>setFilters(v=>({...v,theme:t.title}))}>{t.title}</button>)}</div>
        <div className="top52-filter-controls">
          <select value={filters.type} onChange={e=>setFilters(v=>({...v,type:e.target.value}))}><option value="">Tất cả loại hình</option>{types.map(type=><option key={type} value={type}>{type}</option>)}</select>
          <label><input type="checkbox" checked={filters.award} onChange={e=>setFilters(v=>({...v,award:e.target.checked}))}/> Chỉ tác phẩm đạt giải</label>
          {(filters.q||filters.theme||filters.type||filters.award)&&<button onClick={()=>setFilters({q:'',theme:'',type:'',award:false})}>Xóa bộ lọc</button>}
        </div>
      </div>

      {loading&&<div className="top52-live-state"><span className="top52-spinner"/>Đang tải TOP52...</div>}
      {error&&<div className="form-error">{error}</div>}
      {!loading&&!error&&items.length===0&&<div className="top52-live-empty"><Trophy/><h3>Chưa có tác phẩm phù hợp</h3><p>Thử thay đổi bộ lọc để xem thêm các góc nhìn khác.</p></div>}

      {!loading&&items.length>0&&<>
        <div className="art-grid top52-live-grid">{items.map(item=><ArtworkCard key={item.id} item={item}/>)}</div>
        <div className="top52-live-footer">
          <span>Đang hiển thị <b>{items.length}</b> / {total} tác phẩm</span>
          {hasMore&&<button className="btn btn-outline" disabled={loadingMore} onClick={()=>load({append:true})}>{loadingMore?'Đang tải...':'Xem thêm tác phẩm'}</button>}
        </div>
      </>}
    </section>
  </main>
}
