import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getThemes } from '../services/api.js'

export default function ThemesPage(){
  const [themes,setThemes]=useState([])
  const [selected,setSelected]=useState('all')
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    setLoading(true);setError('')
    getThemes().then(data=>setThemes(Array.isArray(data)?data:[])).catch(err=>setError(err.message)).finally(()=>setLoading(false))
  },[])

  const visible=useMemo(()=>{
    const q=query.trim().toLowerCase()
    return themes.filter(t=>{
      if(selected!=='all'&&t.slug!==selected) return false
      if(!q) return true
      return [t.title,t.description,t.intro,t.locationLabel].some(v=>String(v||'').toLowerCase().includes(q))
    })
  },[themes,selected,query])

  return <main className="theme-index-page">
    <section className="stories-intro-ref">
      <div className="stories-contours"/>
      <div className="stories-intro-inner">
        <div>
          <div className="stories-kicker"><span>8 CHỦ ĐỀ · 1 HÒA LẠC</span><i/></div>
          <h1>Chủ đề</h1>
          <h2>Chọn góc nhìn bạn muốn khám phá</h2>
        </div>
        <div className="stories-intro-side">
          <p>Tất cả 8 chủ đề được lấy trực tiếp từ hệ thống HALO HOLA. Chọn một chủ đề để xem nội dung và các tác phẩm đã được công bố.</p>
          <div className="stories-intro-stats"><span><SlidersHorizontal/> {themes.length} chủ đề</span></div>
        </div>
      </div>
    </section>

    <section className="themes-showcase">
      <div className="themes-showcase-inner">
        <div className="gallery-filters theme-index-filters">
          <div className="theme-index-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm chủ đề..."/></div>
          <div className="theme-index-chips">
            <button className={selected==='all'?'active':''} onClick={()=>setSelected('all')}>Tất cả</button>
            {themes.map(t=><button className={selected===t.slug?'active':''} onClick={()=>setSelected(t.slug)} key={t.slug}>{String(t.id).padStart(2,'0')} · {t.title}</button>)}
          </div>
        </div>

        {loading&&<div className="jw-empty">Đang tải chủ đề từ hệ thống...</div>}
        {error&&<div className="form-error">{error}</div>}
        {!loading&&!error&&visible.length===0&&<div className="jw-empty">Không có chủ đề phù hợp.</div>}

        <div className="themes-card-grid">
          {visible.map((t,index)=><Link to={'/chu-de/'+t.slug} className="theme-card theme-card-reference" key={t.id||t.slug}>
            <div className="theme-card-media">
              {t.image?<img src={t.image} alt={t.title}/>:<div className="theme-card-placeholder"/>}
              <span className="theme-card-glow"/>
            </div>
            <div className="theme-card-body">
              <div className="theme-card-number"><b>{String(t.id||index+1).padStart(2,'0')}</b><i/></div>
              <h3>{t.title}</h3>
              <p>{t.description}</p>
              <small>{Number(t.artworkCount||0)} tác phẩm đã công bố</small>
              <span className="theme-card-arrow"><ArrowRight/></span>
            </div>
          </Link>)}
        </div>
      </div>
    </section>
  </main>
}
