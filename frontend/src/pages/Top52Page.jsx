import { useEffect, useMemo, useState } from 'react'
import { Award, BookOpen, CheckCircle2, Compass, Grid2X2, Map, MapPin, Palette, Search, SlidersHorizontal, Sparkles, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import ArtworkCard from '../components/ArtworkCard.jsx'
import { getColors, getPublicArtworks, getPublicTop52, getThemes } from '../services/api.js'
import './Top52Page.css'
import './ExploreUpgrade.css'

const PAGE_SIZE=16
const types=['Photo','Video','Story & Creative','Art & Design']

function badgeForTop52(item){
  const tags=Array.isArray(item.selectionTypes)?item.selectionTypes:[]
  let label='TOP52'
  if(tags.includes('TITLE_FINALIST')) label='CHUNG KẾT DANH HIỆU'
  else if(tags.includes('THEME_WINNER')) label='GIẢI CHỦ ĐỀ'
  else if(tags.includes('COLOR_WINNER')) label='GIẢI SẮC MÀU'
  else if(tags.includes('TOP3_THEME')) label='TOP 3 CHỦ ĐỀ'
  else if(item.status==='AWARDED') label='ĐẠT GIẢI'
  return label
}

function badgeForExplore(item){
  if(item.status==='AWARDED')return'ĐẠT GIẢI'
  if(item.status==='TOP52')return'TOP52'
  if(item.status==='SHORTLIST')return'SHORTLIST'
  return'GÓC NHÌN CỘNG ĐỒNG'
}

export default function Top52Page(){
  const [view,setView]=useState('EXPLORE')
  const [themes,setThemes]=useState([])
  const [colors,setColors]=useState([])
  const [items,setItems]=useState([])
  const [total,setTotal]=useState(0)
  const [meta,setMeta]=useState({})
  const [filters,setFilters]=useState({q:'',theme:'',type:'',color:'',location:'',sort:'latest',award:false})
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
      if(view==='TOP52'){
        const data=await getPublicTop52({
          q:filters.q||undefined,
          theme:filters.theme||undefined,
          type:filters.type||undefined,
          award:filters.award?'true':undefined,
          limit:PAGE_SIZE,
          offset
        })
        const next=(data?.items||[]).map(item=>({...item,badgeLabel:badgeForTop52(item)}))
        setItems(current=>append?[...current,...next]:next)
        setTotal(Number(data?.total||0))
        setMeta(data?.meta||{})
      }else{
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
        const next=(Array.isArray(rows)?rows:[]).map(item=>({...item,badgeLabel:badgeForExplore(item)}))
        setItems(current=>append?[...current,...next]:next)
        setTotal(Number(next[0]?.totalCount ?? (append?items.length+next.length:next.length)))
        setMeta({})
      }
    }catch(err){
      setError(err.message)
    }finally{
      append?setLoadingMore(false):setLoading(false)
    }
  }

  useEffect(()=>{
    setItems([]);setTotal(0);setMeta({})
    const timer=setTimeout(()=>load({append:false}),260)
    return()=>clearTimeout(timer)
  },[view,filters.q,filters.theme,filters.type,filters.color,filters.location,filters.sort,filters.award])

  const heroImage=items.find(x=>x.image)?.image||themes.find(x=>x.image)?.image||''
  const selectedCount=Number(meta?.selectedCount||0)
  const publishedCount=Number(meta?.publishedCount||0)
  const hasMore=items.length<total
  const isExplore=view==='EXPLORE'
  const statusText=isExplore
    ? `${total} góc nhìn đang được công khai`
    : selectedCount?`${publishedCount||total}/${selectedCount} tác phẩm trong bộ sưu tập`:`${total} tác phẩm trong bộ sưu tập`
  const statusDetail=isExplore
    ? 'Kho góc nhìn cộng đồng được BTC duyệt công khai'
    : meta?.round?.status==='LOCKED'?'Danh sách TOP52 đã được chốt':'52 góc nhìn · 1 Hòa Lạc'

  const themeTitle=useMemo(()=>themes.find(x=>x.title===filters.theme)?.title||'Tất cả chủ đề',[themes,filters.theme])
  const clearFilters=()=>setFilters({q:'',theme:'',type:'',color:'',location:'',sort:'latest',award:false})
  const hasFilters=filters.q||filters.theme||filters.type||filters.color||filters.location||filters.award||(isExplore&&filters.sort!=='latest')

  return <main className="top52-live-page explore-live-page">
    <section className={`top52-live-hero ${isExplore?'explore-mode':''}`}>
      <div className="container top52-live-hero-grid">
        <div className="top52-live-copy">
          <span className="top52-live-eyebrow">{isExplore?<><Compass/> HALO HOLA EXPLORE · KHO GÓC NHÌN CỘNG ĐỒNG</>:<><Trophy/> TRIỂN LÃM TUYỂN CHỌN · HALO HOLA 2026</>}</span>
          <h1>{isExplore?<>KHÁM <span>PHÁ</span></>:<>TOP<span>52</span></>}</h1>
          <h2>{isExplore?'Một Hòa Lạc qua nhiều góc nhìn':'52 góc nhìn · 1 Hòa Lạc'}</h2>
          <p>{isExplore?'Khám phá những tác phẩm, câu chuyện và địa điểm về Hòa Lạc được cộng đồng gửi về và Ban Tổ chức duyệt công khai.':'52 tác phẩm đại diện cho những góc nhìn đa dạng về thiên nhiên, con người, văn hóa, tri thức và một Hòa Lạc đang chuyển mình.'}</p>
          <div className="explore-mode-switch" aria-label="Chọn bộ sưu tập">
            <button className={isExplore?'active':''} onClick={()=>setView('EXPLORE')}><Compass/> Khám phá cộng đồng</button>
            <button className={!isExplore?'active':''} onClick={()=>setView('TOP52')}><Trophy/> TOP52 tuyển chọn</button>
          </div>
          <div className="top52-live-status">
            <span>{isExplore?<Sparkles/>:<CheckCircle2/>}</span>
            <div><b>{statusText}</b><small>{statusDetail}</small></div>
          </div>
          <div className="top52-live-actions">
            <a href="#gallery" className="btn btn-green"><Grid2X2/> Xem gallery</a>
            <Link className="btn btn-outline" to="/stories"><BookOpen/> Stories</Link>
            <Link className="btn btn-outline" to="/hola-map"><Map/> HOLA Map</Link>
          </div>
        </div>
        <div className="top52-live-visual">
          {heroImage?<img src={heroImage} alt={isExplore?'HALO HOLA Explore':'TOP52 HALO HOLA 2026'}/>:<div className="top52-live-placeholder"/>}
          <div className="top52-live-number"><b>{total||publishedCount||0}</b><span>{isExplore?'GÓC NHÌN':'TÁC PHẨM'}<br/>{isExplore?'CÔNG KHAI':'TOP52'}</span></div>
          <div className="top52-live-seal">{isExplore?<Users/>:<Award/>}<span>HALO HOLA<br/><b>2026</b></span></div>
        </div>
      </div>
    </section>

    <section className="container top52-live-gallery" id="gallery">
      <div className="top52-live-heading">
        <div><span className="eyebrow">{isExplore?'HALO HOLA EXPLORE':'TOP52 GALLERY'}</span><h2>{isExplore?'Khám phá những góc nhìn đang được kể':'Những góc nhìn được chọn'}</h2></div>
        <p>{total} kết quả phù hợp · {themeTitle}</p>
      </div>

      <div className="top52-live-filters explore-filters">
        <label className="top52-search"><Search/><input value={filters.q} onChange={e=>setFilters(v=>({...v,q:e.target.value}))} placeholder="Tìm mã dự thi, tác phẩm, tác giả, địa điểm..."/></label>
        <div className="top52-filter-row"><SlidersHorizontal/><b>Chủ đề</b><button className={!filters.theme?'active':''} onClick={()=>setFilters(v=>({...v,theme:''}))}>Tất cả</button>{themes.map(t=><button key={t.slug} className={filters.theme===t.title?'active':''} onClick={()=>setFilters(v=>({...v,theme:t.title}))}>{t.title}</button>)}</div>
        <div className="top52-filter-controls">
          <select value={filters.type} onChange={e=>setFilters(v=>({...v,type:e.target.value}))}><option value="">Tất cả loại hình</option>{types.map(type=><option key={type} value={type}>{type}</option>)}</select>
          {isExplore&&<><select value={filters.color} onChange={e=>setFilters(v=>({...v,color:e.target.value}))}><option value="">Mọi sắc màu</option>{colors.map(color=><option key={color.id||color.slug} value={color.name}>{color.name}</option>)}</select><label className="explore-location-filter"><MapPin/><input value={filters.location} onChange={e=>setFilters(v=>({...v,location:e.target.value}))} placeholder="Lọc theo địa điểm"/></label><select value={filters.sort} onChange={e=>setFilters(v=>({...v,sort:e.target.value}))}><option value="latest">Mới công khai</option><option value="score">Nổi bật / điểm cao</option><option value="oldest">Cũ nhất trước</option></select></>}
          {!isExplore&&<label><input type="checkbox" checked={filters.award} onChange={e=>setFilters(v=>({...v,award:e.target.checked}))}/> Chỉ tác phẩm đạt giải</label>}
          {hasFilters&&<button onClick={clearFilters}>Xóa bộ lọc</button>}
        </div>
      </div>

      {loading&&<div className="top52-live-state"><span className="top52-spinner"/>Đang tải {isExplore?'góc nhìn':'TOP52'}...</div>}
      {error&&<div className="form-error">{error}</div>}
      {!loading&&!error&&items.length===0&&<div className="top52-live-empty">{isExplore?<Compass/>:<Trophy/>}<h3>Chưa có tác phẩm phù hợp</h3><p>{isExplore?'Các góc nhìn sẽ xuất hiện khi được BTC duyệt công khai.':'Thử thay đổi bộ lọc để xem thêm các góc nhìn khác.'}</p></div>}

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
