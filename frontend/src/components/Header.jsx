import { Menu, Search, X, ArrowRight, Leaf } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { getHomepageContent, getSiteSettings } from '../services/api.js'

const DEFAULT_NAV_LINKS = [
  {label:'Khám phá',href:'/'},
  {label:'Chủ đề',href:'/chu-de'},
  {label:'HOLA Tour',href:'/hola-tour'},
  {label:'HOLA Map',href:'/hola-map'},
  {label:'Stories',href:'/stories'},
  {label:'TOP52',href:'/top52'},
  {label:'WE HOLA',href:'/we-hola'}
]

const MOBILE_QUICK_LINKS = [
  {label:'Gửi góc nhìn',href:'/gui-goc-nhin'},
  {label:'Tra cứu tác phẩm',href:'/tra-cuu'},
  {label:'WE HOLA',href:'/we-hola'},
  {label:'Đồng hành',href:'/dong-hanh'},
  {label:'HOLA DAY',href:'/hola-day'}
]

const isInternalHref=(href='')=>href.startsWith('/')&&!href.startsWith('//')

function HeaderNavLink({item,onClick}){
  const href=item?.href||'#'
  const label=item?.label||href
  if(isInternalHref(href)){
    return <NavLink to={href} end={href==='/'} onClick={onClick}>{label}</NavLink>
  }
  return <a href={href} target={item?.newTab?'_blank':undefined} rel={item?.newTab?'noreferrer':undefined} onClick={onClick}>{label}</a>
}

function HeaderActionLink({href,className,onClick,children,ariaLabel,title,newTab=false}){
  if(isInternalHref(href)) return <Link className={className} to={href} onClick={onClick} aria-label={ariaLabel} title={title}>{children}</Link>
  return <a className={className} href={href||'#'} target={newTab?'_blank':undefined} rel={newTab?'noreferrer':undefined} onClick={onClick} aria-label={ariaLabel} title={title}>{children}</a>
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [config,setConfig]=useState({
    enabled:true,
    ctaText:'GỬI GÓC NHÌN',
    ctaUrl:'/gui-goc-nhin',
    showSearch:true,
    searchUrl:'/tra-cuu',
    searchLabel:'Tra cứu tác phẩm',
    navLinks:DEFAULT_NAV_LINKS,
    logoImage:'',
    favicon:'',
    footerEmail:'',
    footerPhone:''
  })
  const [mobileFloating,setMobileFloating]=useState(false)
  const [mobileHeaderVisible,setMobileHeaderVisible]=useState(true)
  const openRef=useRef(open)

  useEffect(()=>{ openRef.current=open },[open])

  useEffect(()=>{
    Promise.allSettled([getHomepageContent(),getSiteSettings()]).then(([homeResult,settingsResult])=>{
      const data=homeResult.status==='fulfilled'?homeResult.value:null
      const settings=settingsResult.status==='fulfilled'?settingsResult.value:{}
      const section=data?.header
      const legacy=section?.content||{}
      const header=settings?.header||{}
      const brand=settings?.brand||{}
      const footer=settings?.footer||{}
      setConfig(v=>({
        ...v,
        ...legacy,
        ...header,
        enabled:typeof header.enabled==='boolean'?header.enabled:section?.enabled!==false,
        navLinks:Array.isArray(header.navLinks)?header.navLinks:DEFAULT_NAV_LINKS,
        logoImage:legacy.logoImage||brand.logo||v.logoImage,
        siteName:brand.siteName||'HALO HOLA',
        favicon:brand.favicon||'',
        footerEmail:footer.email||'',
        footerPhone:footer.phone||''
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

  useEffect(()=>{
    let lastY=Math.max(0,window.scrollY||0)
    let accumulated=0
    let ticking=false

    const update=()=>{
      ticking=false
      const y=Math.max(0,window.scrollY||0)
      const mobile=window.matchMedia('(max-width: 760px)').matches

      if(!mobile){
        setMobileFloating(false)
        setMobileHeaderVisible(true)
        lastY=y
        accumulated=0
        return
      }

      const floating=y>110
      setMobileFloating(floating)

      if(!floating){
        setMobileHeaderVisible(true)
        accumulated=0
        lastY=y
        return
      }

      if(openRef.current){
        setMobileHeaderVisible(true)
        accumulated=0
        lastY=y
        return
      }

      const diff=y-lastY
      if((diff>0&&accumulated<0)||(diff<0&&accumulated>0)) accumulated=0
      accumulated+=diff

      if(accumulated>20){
        setMobileHeaderVisible(false)
        accumulated=0
      } else if(accumulated<-14){
        setMobileHeaderVisible(true)
        accumulated=0
      }

      lastY=y
    }

    const requestUpdate=()=>{
      if(ticking) return
      ticking=true
      window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll',requestUpdate,{passive:true})
    window.addEventListener('resize',requestUpdate)
    return ()=>{
      window.removeEventListener('scroll',requestUpdate)
      window.removeEventListener('resize',requestUpdate)
    }
  },[])

  if(!config.enabled) return null

  const headerClass=[
    'site-header',
    mobileFloating?'mobile-header-floating':'',
    mobileHeaderVisible||open?'mobile-header-visible':'mobile-header-hidden'
  ].filter(Boolean).join(' ')

  const navLinks=Array.isArray(config.navLinks)?config.navLinks:DEFAULT_NAV_LINKS
  const closeMenu=()=>setOpen(false)
  const searchUrl=config.searchUrl||'/tra-cuu'
  const searchLabel=config.searchLabel||'Tra cứu tác phẩm'
  const ctaUrl=config.ctaUrl||'/gui-goc-nhin'

  return <header className={headerClass}>
    <div className="container header-inner">
      <Link className={'brand '+(config.logoImage?'brand-image':'brand-lockup')} to="/">
        {config.logoImage?<img src={config.logoImage} alt={config.siteName||"HALO HOLA"}/>:<>
          <span className="brand-emblem"><Leaf/></span>
          <span className="brand-wordmark">HAL<span>O</span> HOLA</span>
        </>}
      </Link>
      <nav className={'main-nav '+(open ? 'open' : '')}>
        <div className="mobile-nav-head">
          <span>{config.menuTitle||'Khám phá HALO HOLA'}</span>
          <button onClick={closeMenu} aria-label="Đóng menu"><X/></button>
        </div>

        <div className="mobile-nav-primary-label">Khám phá</div>
        <div className="mobile-nav-primary-list">
          {navLinks.filter(item=>item?.label&&item?.href).map((item,index)=><HeaderNavLink key={(item.href||'link')+'-'+index} item={item} onClick={closeMenu}/>)}
        </div>

        <div className="mobile-nav-actions">
          {config.showSearch!==false&&<HeaderActionLink href={searchUrl} onClick={closeMenu}><Search/> {searchLabel}</HeaderActionLink>}
          <HeaderActionLink className="mobile-nav-cta" href={ctaUrl} newTab={Boolean(config.ctaNewTab)} onClick={closeMenu}>{config.ctaText||'GỬI GÓC NHÌN'} <ArrowRight/></HeaderActionLink>
        </div>

        <div className="mobile-nav-quick">
          <div className="mobile-nav-quick-head">
            <span>Tiện ích & cộng đồng</span>
            <small>Đi nhanh đến các nội dung quan trọng</small>
          </div>
          <div className="mobile-nav-quick-grid">
            {MOBILE_QUICK_LINKS.map(item=><HeaderActionLink key={item.href} href={item.href} onClick={closeMenu}>
              <span>{item.label}</span><b>→</b>
            </HeaderActionLink>)}
          </div>
          {(config.footerEmail||config.footerPhone)&&<div className="mobile-nav-contact">
            {config.footerEmail&&<a href={'mailto:'+config.footerEmail}>{config.footerEmail}</a>}
            {config.footerPhone&&<a href={'tel:'+config.footerPhone}>{config.footerPhone}</a>}
          </div>}
        </div>
      </nav>
      <div className="header-actions">
        {config.showSearch!==false&&<HeaderActionLink className="icon-btn search-btn" href={searchUrl} ariaLabel={searchLabel} title={searchLabel}><Search size={18}/></HeaderActionLink>}
        <HeaderActionLink className="btn btn-terra btn-sm" href={ctaUrl} newTab={Boolean(config.ctaNewTab)}>{config.ctaText||'GỬI GÓC NHÌN'} <ArrowRight size={16}/></HeaderActionLink>
        <button className="menu-btn" onClick={() => setOpen(v => !v)} aria-label="Menu">{open ? <X/> : <Menu/>}</button>
      </div>
    </div>
  </header>
}
