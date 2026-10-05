import { Menu, Search, X, ArrowRight, Leaf } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getHomepageContent, getSiteSettings } from '../services/api.js'

const items = [
  ['Khám phá', '/'], ['Chủ đề', '/chu-de'], ['HOLA Tour', '/hola-tour'],
  ['HOLA Map', '/hola-map'], ['Stories', '/stories'], ['TOP52', '/top52'], ['WE HOLA', '/we-hola']
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [config,setConfig]=useState({enabled:true,ctaText:'GỬI GÓC NHÌN',logoImage:'',favicon:''})

  useEffect(()=>{
    Promise.allSettled([getHomepageContent(),getSiteSettings()]).then(([homeResult,settingsResult])=>{
      const data=homeResult.status==='fulfilled'?homeResult.value:null
      const settings=settingsResult.status==='fulfilled'?settingsResult.value:{}
      const section=data?.header
      const brand=settings?.brand||{}
      setConfig(v=>({
        ...v,
        ...(section?.content||{}),
        enabled:section?.enabled!==false,
        logoImage:section?.content?.logoImage||brand.logo||v.logoImage,
        siteName:brand.siteName||'HALO HOLA',
        favicon:brand.favicon||''
      }))
    })
  },[])

  useEffect(()=>{
    if(!config.favicon) return
    let link=document.querySelector("link[rel~='icon']")
    if(!link){
      link=document.createElement('link')
      link.rel='icon'
      document.head.appendChild(link)
    }
    link.href=config.favicon
  },[config.favicon])

  useEffect(()=>{
    if(!open) return undefined
    const previous=document.body.style.overflow
    document.body.style.overflow='hidden'
    const onKey=(e)=>{ if(e.key==='Escape') setOpen(false) }
    window.addEventListener('keydown',onKey)
    return ()=>{
      document.body.style.overflow=previous
      window.removeEventListener('keydown',onKey)
    }
  },[open])

  if(!config.enabled) return null

  return <header className="site-header">
    <div className="container header-inner">
      <Link className={'brand '+(config.logoImage?'brand-image':'brand-lockup')} to="/">
        {config.logoImage?<img src={config.logoImage} alt={config.siteName||"HALO HOLA"}/>:<>
          <span className="brand-emblem"><Leaf/></span>
          <span className="brand-wordmark">HAL<span>O</span> HOLA</span>
        </>}
      </Link>
      <nav className={'main-nav '+(open ? 'open' : '')}>
        <div className="mobile-nav-head">
          <span>Khám phá HALO HOLA</span>
          <button onClick={()=>setOpen(false)} aria-label="Đóng menu"><X/></button>
        </div>
        {items.map(([label, href]) => <NavLink key={href} to={href} end={href==='/'} onClick={() => setOpen(false)}>{label}</NavLink>)}
        <div className="mobile-nav-actions">
          <Link to="/tra-cuu" onClick={()=>setOpen(false)}><Search/> Tra cứu tác phẩm</Link>
          <Link className="mobile-nav-cta" to="/gui-goc-nhin" onClick={()=>setOpen(false)}>{config.ctaText||'GỬI GÓC NHÌN'} <ArrowRight/></Link>
        </div>
      </nav>
      <div className="header-actions">
        <Link className="icon-btn search-btn" to="/tra-cuu" aria-label="Tra cứu tác phẩm" title="Tra cứu tác phẩm"><Search size={18}/></Link>
        <Link className="btn btn-terra btn-sm" to="/gui-goc-nhin">{config.ctaText||'GỬI GÓC NHÌN'} <ArrowRight size={16}/></Link>
        <button className="menu-btn" onClick={() => setOpen(v => !v)} aria-label="Menu">{open ? <X/> : <Menu/>}</button>
      </div>
    </div>
  </header>
}
