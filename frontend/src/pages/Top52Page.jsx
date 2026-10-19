import { useEffect, useMemo, useState } from 'react'
import { BookOpen, CheckCircle2, Grid2X2, Map, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import ArtworkCard from '../components/ArtworkCard.jsx'
import { getPublicTop52, getThemes } from '../services/api.js'
import './Top52Page.css'
import './Top52PageMobilePolish.css'

const PAGE_SIZE=16
const types=['Photo','Video','Story & Creative','Art & Design']

function badgeForTop52(item){
  if(item.status==='AWARDED') return 'GÓC NHÌN ĐƯỢC GHI NHẬN'
  return '52 GÓC NHÌN · 2026'
}

export default function Top52Page(){
  const [themes,setThemes]=useState([])
  const [items,setItems]=useState([])
  const [total,setTotal]=useState(0)
  const [meta,setMeta]=useState({})
  const [filters,setFilters]=useState({q:'',theme:'',type:''})
  const [loading,setLoading]=useState(true)
  const [loadingMore,setLoadingMore]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{getThemes().then(rows=>setThemes(Array.isArray(rows)?rows:[])).catch(()=>{})},[])

  const load=async({append=false}={})=>{
    const offset=append?items.length:0
    append?setLoadingMore(true):setLoading(true)
    setError('')
    try{
      const data=await getPublicTop52({
        q:filters.q||undefined,
        theme:filters.theme||undefined,
        type:filters.type||undefined,
        limit:PAGE_SIZE,
        offset
      })
      const next=(data?.items||[]).map(item=>({...item,badgeLabel:badgeForTop52(item)}))
      setItems(current=>append?[...current,...next]:next)
      setTotal(Number(data?.total||0))
      setMeta(data?.meta||{})
    }catch(err){setError(err.message||'Không tải được bộ 52 góc nhìn.')}
    finally{append?setLoadingMore(false):setLoading(false)}
  }

  useEffect(()=>{
    setItems([]);setTotal(0);setMeta({})
    const timer=setTimeout(()=>load({append:false}),220)
    return()=>clearTimeout(timer)
  },[filters.q,filters.theme,filters.type])

  const heroImage=items.find(x=>x.image)?.image||themes.find(x=>x.image)?.image||''
  const selectedCount=Number(meta?.selectedCount||0)
  const publishedCount=Number(meta?.publishedCount||0)
  const hasMore=items.length<total
  const statusText=selectedCount?`${publishedCount||total}/${selectedCount} góc nhìn đã công bố`:`${total} góc nhìn đã công bố`
  const statusDetail=meta?.round?.status==='LOCKED'?'Bộ 52 góc nhìn đã được Ban Biên tập chốt':'52 góc nhìn · 1 Hòa Lạc'
  const themeTitle=useMemo(()=>themes.find(x=>x.title===filters.theme)?.title||'Tất cả mạch',[themes,filters.theme])
  const clearFilters=()=>setFilters({q:'',theme:'',type:''})
  const hasFilters=filters.q||filters.theme||filters.type

  return <main className="top52-live-page">
    <section className="top52-live-hero">
      <div className="container top52-live-hero-grid">
        <div className="top52-live-copy">
          <span className="top52-live-eyebrow"><Sparkles/> HALO HOLA 2026 · BỘ SƯU TẬP BIÊN TẬP</span>
          <h1><span>52</span></h1>
          <h2>52 góc nhìn · 1 Hòa Lạc</h2>
          <p>52 câu chuyện đại diện cho một Hòa Lạc năm 2026 — được tìm thấy từ cộng đồng, chuyên gia, đối tác và hành trình Ban Biên tập chủ động đi, gặp, nghe và ghi lại.</p>
          <div className="top52-live-status"><span><CheckCircle2/></span><div><b>{statusText}</b><small>{statusDetail}</small></div></div>
          <div className="top52-live-actions">
            <a href="#gallery" className="btn btn-green"><Grid2X2/> Xem 52 góc nhìn</a>
            <Link className="btn btn-outline" to="/kham-pha">Kho góc nhìn</Link>
            <Link className="btn btn-outline" to="/stories"><BookOpen/> Stories</Link>
            <Link className="btn btn-outline" to="/hola-map"><Map/> HOLA Map</Link>
          </div>
          <blockquote>“Không tìm người thắng. Tìm những câu chuyện đáng được giữ lại.”</blockquote>
        </div>
        <div className="top52-live-visual">
          {heroImage?<img src={heroImage} alt="52 góc nhìn HALO HOLA 2026"/>:<div className="top52-live-placeholder"/>}
          <div className="top52-live-number"><b>{total||publishedCount||0}</b><span>GÓC NHÌN<br/>2026</span></div>
          <div className="top52-live-seal"><BookOpen/><span>HALO HOLA<br/><b>2026</b></span></div>
        </div>
      </div>
    </section>

    <section className="container top52-live-gallery" id="gallery">
      <div className="top52-live-heading">
        <div><span className="eyebrow">52 GÓC NHÌN · 1 HÒA LẠC</span><h2>Những câu chuyện được Ban Biên tập lựa chọn</h2></div>
        <p>{total} kết quả phù hợp · {themeTitle}</p>
      </div>

      <div className="top52-live-filters">
        <label className="top52-search"><Search/><input value={filters.q} onChange={e=>setFilters(v=>({...v,q:e.target.value}))} placeholder="Tìm mã góc nhìn, câu chuyện, người kể..."/></label>
        <div className="top52-filter-row"><SlidersHorizontal/><b>Mạch nội dung</b><button className={!filters.theme?'active':''} onClick={()=>setFilters(v=>({...v,theme:''}))}>Tất cả</button>{themes.map(t=><button key={t.slug} className={filters.theme===t.title?'active':''} onClick={()=>setFilters(v=>({...v,theme:t.title}))}>{t.title}</button>)}</div>
        <div className="top52-filter-controls">
          <select value={filters.type} onChange={e=>setFilters(v=>({...v,type:e.target.value}))}><option value="">Tất cả loại hình</option>{types.map(type=><option key={type} value={type}>{type}</option>)}</select>
          {hasFilters&&<button onClick={clearFilters}>Xóa bộ lọc</button>}
        </div>
      </div>

      {loading&&<div className="top52-live-state"><span className="top52-spinner"/>Đang tải 52 góc nhìn...</div>}
      {error&&<div className="form-error">{error}</div>}
      {!loading&&!error&&items.length===0&&<div className="top52-live-empty"><BookOpen/><h3>Chưa có góc nhìn phù hợp</h3><p>Thử thay đổi bộ lọc hoặc quay lại khi Ban Biên tập công bố thêm câu chuyện.</p></div>}

      {!loading&&items.length>0&&<>
        <div className="art-grid top52-live-grid">{items.map(item=><ArtworkCard key={item.id} item={item}/>)}</div>
        <div className="top52-live-footer"><span>Đang hiển thị <b>{items.length}</b> / {total} góc nhìn</span>{hasMore&&<button className="btn btn-outline" disabled={loadingMore} onClick={()=>load({append:true})}>{loadingMore?'Đang tải...':'Xem thêm góc nhìn'}</button>}</div>
      </>}
    </section>
  </main>
}
