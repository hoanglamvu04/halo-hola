import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, SlidersHorizontal, LayoutGrid, Leaf, Mountain, Landmark, Trees, Sun, BookOpen, Send, ChevronRight } from 'lucide-react'
import { getThemes } from '../services/api.js'
import ThemeCard from '../components/ThemeCard.jsx'
import './ThemesPage.css'

const themeIcons=[Landmark,Mountain,Trees,Leaf,BookOpen,Sun,Send]
const compactThemeLabels=['Bản sắc','Thiên nhiên','Không gian','Con người','Tri thức & Công nghệ','Đời sống & Cảm xúc','Tương lai']

export default function ThemesPage(){
  const [themes,setThemes]=useState([])
  const [selected,setSelected]=useState('all')
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const searchRef=useRef(null)
  const chipsRef=useRef(null)

  useEffect(()=>{
    setLoading(true);setError('')
    getThemes().then(data=>setThemes(Array.isArray(data)?data:[])).catch(err=>setError(err.message)).finally(()=>setLoading(false))
  },[])

  useEffect(()=>{
    const onKeyDown=(event)=>{
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown',onKeyDown)
    return()=>window.removeEventListener('keydown',onKeyDown)
  },[])

  const visible=useMemo(()=>{
    const q=query.trim().toLowerCase()
    return themes.filter(t=>{
      if(selected!=='all'&&t.slug!==selected) return false
      if(!q) return true
      return [t.title,t.description,t.intro,t.locationLabel].some(v=>String(v||'').toLowerCase().includes(q))
    })
  },[themes,selected,query])

  const scrollThemes=()=>{
    chipsRef.current?.scrollBy({left:Math.max(360,(chipsRef.current?.clientWidth||520)*.72),behavior:'smooth'})
  }

  return <main className="theme-index-page">
    <section className="stories-intro-ref">
      <div className="stories-contours"/>
      <div className="stories-intro-inner">
        <div>
          <div className="stories-kicker"><span>7 CHỦ ĐỀ · 1 HÒA LẠC</span><i/></div>
          <h1>7 chủ đề Hòa Lạc</h1>
          <h2>Nhìn Hòa Lạc qua nhiều lớp câu chuyện</h2>
        </div>
        <div className="stories-intro-side">
          <p>Bảy chủ đề giúp 52 góc nhìn không trở thành một bộ ảnh phong cảnh: Bản sắc, Thiên nhiên, Không gian, Con người, Tri thức &amp; Công nghệ, Đời sống &amp; Cảm xúc và Tương lai.</p>
          <div className="stories-intro-stats"><span><SlidersHorizontal/> {themes.length} chủ đề đang mở</span></div>
        </div>
      </div>
    </section>

    <section className="themes-showcase">
      <div className="themes-showcase-inner">
        <div className="theme-index-filters">
          <div className="theme-index-search">
            <Search size={18}/>
            <input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm chủ đề, địa điểm, con người, trải nghiệm..."/>
            <kbd><span>⌘</span>K</kbd>
          </div>

          <div className="theme-index-strip">
            <div className="theme-index-chips" ref={chipsRef}>
              <button className={selected==='all'?'active':''} onClick={()=>setSelected('all')}>
                <span className="theme-chip-thumb theme-chip-thumb-all"><LayoutGrid aria-hidden="true"/></span>
                <span>Tất cả</span>
              </button>
              {themes.map((t,index)=>{
                const Icon=themeIcons[index%themeIcons.length]
                return <button className={selected===t.slug?'active':''} onClick={()=>setSelected(t.slug)} key={t.slug}>
                  <span className="theme-chip-thumb">
                    {t.image?<img src={t.image} alt="" loading="lazy" decoding="async"/>:<Icon aria-hidden="true"/>}
                  </span>
                  <span className="theme-chip-label-short">{String(index+1).padStart(2,'0')} · {compactThemeLabels[index]||t.title}</span>
                  <span className="theme-chip-label-full">{String(index+1).padStart(2,'0')} · {t.title}</span>
                </button>
              })}
            </div>
            <button type="button" className="theme-index-next" aria-label="Xem thêm chủ đề" onClick={scrollThemes}>
              <ChevronRight/>
            </button>
          </div>
        </div>

        {loading&&<div className="jw-empty">Đang tải 7 chủ đề từ hệ thống...</div>}
        {error&&<div className="form-error">{error}</div>}
        {!loading&&!error&&visible.length===0&&<div className="jw-empty">Không có chủ đề phù hợp.</div>}

        <div className="themes-card-grid">
          {visible.map((t,index)=><ThemeCard theme={t} index={index} key={t.id||t.slug}/>)}
        </div>
      </div>
    </section>
  </main>
}
