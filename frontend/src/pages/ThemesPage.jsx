import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Leaf,
  Mountain,
  Landmark,
  Trees,
  Sun,
  BookOpen,
  Send,
  Palette
} from 'lucide-react'
import { getThemes } from '../services/api.js'
import ThemeCard from '../components/ThemeCard.jsx'
import './ThemesPage.css'

const themeIcons=[Leaf,Mountain,Landmark,Trees,Sun,BookOpen,Send,Palette]

export default function ThemesPage(){
  const [themes,setThemes]=useState([])
  const [selected,setSelected]=useState('all')
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const searchRef=useRef(null)

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
          <div className="theme-index-search">
            <Search size={18}/>
            <input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm chủ đề..."/>
            <kbd><span>⌘</span>K</kbd>
          </div>
          <div className="theme-index-chips">
            <button className={selected==='all'?'active':''} onClick={()=>setSelected('all')}>
              <LayoutGrid className="theme-chip-icon" aria-hidden="true"/>
              <span>Tất cả</span>
            </button>
            {themes.map((t,index)=>{
              const Icon=themeIcons[index%themeIcons.length]
              return <button className={selected===t.slug?'active':''} onClick={()=>setSelected(t.slug)} key={t.slug}>
                <Icon className="theme-chip-icon" aria-hidden="true"/>
                <span>{String(t.id).padStart(2,'0')} · {t.title}</span>
              </button>
            })}
          </div>
        </div>

        {loading&&<div className="jw-empty">Đang tải chủ đề từ hệ thống...</div>}
        {error&&<div className="form-error">{error}</div>}
        {!loading&&!error&&visible.length===0&&<div className="jw-empty">Không có chủ đề phù hợp.</div>}

        <div className="themes-card-grid">
          {visible.map((t,index)=><ThemeCard theme={t} index={index} key={t.id||t.slug}/>)}
        </div>
      </div>
    </section>
  </main>
}
