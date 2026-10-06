import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import BottomNav from './components/BottomNav.jsx'
import HomePage from './pages/HomePage.jsx'
import { getSiteSettings } from './services/api.js'
import { classifyClick, trackEvent } from './services/analytics.js'

const SubmitPage=lazy(()=>import('./pages/SubmitPage.jsx'))
const MapPage=lazy(()=>import('./pages/MapPage.jsx'))
const Top52Page=lazy(()=>import('./pages/Top52Page.jsx'))
const ArtworkPage=lazy(()=>import('./pages/ArtworkPage.jsx'))
const TourPage=lazy(()=>import('./pages/TourPage.jsx'))
const HolaDayPage=lazy(()=>import('./pages/HolaDayPage.jsx'))
const StoriesPage=lazy(()=>import('./pages/StoriesPage.jsx'))
const StoryDetailPage=lazy(()=>import('./pages/StoryDetailPage.jsx'))
const WeHolaPage=lazy(()=>import('./pages/WeHolaPage.jsx'))
const PartnersPage=lazy(()=>import('./pages/PartnersPage.jsx'))
const HelloPage=lazy(()=>import('./pages/HelloPage.jsx'))
const ThemesPage=lazy(()=>import('./pages/ThemesPage.jsx'))
const ThemePage=lazy(()=>import('./pages/ThemePage.jsx'))
const AdminPage=lazy(()=>import('./pages/AdminPage.jsx'))
const LookupPage=lazy(()=>import('./pages/LookupPage.jsx'))
const JurorWorkspacePage=lazy(()=>import('./pages/JurorWorkspacePage.jsx'))

const SITE_URL='https://halohola.xspace.vn'
const DEFAULT_DESCRIPTION='HALO HOLA 2026 — 52 góc nhìn · 1 Hòa Lạc. Khám phá, kể lại và lưu giữ những câu chuyện về Hòa Lạc.'
const DEFAULT_OG_IMAGE='https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85'
const SEO_ROUTES={
  '/': ['HALO HOLA 2026 — Hello Hòa Lạc',DEFAULT_DESCRIPTION],
  '/chu-de':['8 chủ đề về Hòa Lạc | HALO HOLA','Khám phá 8 chủ đề sáng tạo và những lớp câu chuyện về Hòa Lạc trong HALO HOLA 2026.'],
  '/hola-tour':['HOLA Tour | HALO HOLA','Đi, gặp, trải nghiệm và kể lại Hòa Lạc qua những hành trình HOLA Tour 2026.'],
  '/hola-map':['HOLA Map | HALO HOLA','Khám phá địa điểm, câu chuyện và góc nhìn Hòa Lạc trên bản đồ tương tác.'],
  '/stories':['Stories Hòa Lạc | HALO HOLA','Những câu chuyện về con người, nơi chốn, ký ức và chuyển động của Hòa Lạc.'],
  '/top52':['TOP52 | HALO HOLA 2026','52 góc nhìn nổi bật được lựa chọn trong HALO HOLA 2026.'],
  '/we-hola':['WE HOLA — Chúng ta là Hòa Lạc','Cộng đồng cùng kết nối và làm những việc cụ thể để Hòa Lạc xanh hơn, đẹp hơn và đáng sống hơn.'],
  '/gui-goc-nhin':['Gửi góc nhìn | HALO HOLA 2026','Gửi tác phẩm, câu chuyện và góc nhìn của bạn về Hòa Lạc tới HALO HOLA 2026.'],
  '/hola-day':['HOLA DAY 2026 | HALO HOLA','Ngày hội cộng đồng và điểm hẹn công bố những dấu mốc của HALO HOLA 2026.'],
  '/dong-hanh':['Đồng hành cùng HALO HOLA','Thông tin dành cho các đơn vị, cộng đồng và đối tác đồng hành cùng HALO HOLA.'],
  '/tra-cuu':['Tra cứu tác phẩm | HALO HOLA','Tra cứu hồ sơ và trạng thái tác phẩm đã gửi tới HALO HOLA 2026.']
}

function setMeta(key,value,attribute='name'){
  if(!value)return
  let node=document.head.querySelector(`meta[${attribute}="${key}"]`)
  if(!node){node=document.createElement('meta');node.setAttribute(attribute,key);document.head.appendChild(node)}
  node.setAttribute('content',value)
}
function setCanonical(url){
  let node=document.head.querySelector('link[rel="canonical"]')
  if(!node){node=document.createElement('link');node.rel='canonical';document.head.appendChild(node)}
  node.href=url
}

function routeSeo(pathname){
  if(SEO_ROUTES[pathname])return SEO_ROUTES[pathname]
  if(pathname.startsWith('/chu-de/'))return ['Chủ đề Hòa Lạc | HALO HOLA','Khám phá tác phẩm và câu chuyện thuộc chủ đề HALO HOLA 2026.']
  if(pathname.startsWith('/tac-pham/'))return ['Tác phẩm HALO HOLA 2026','Khám phá câu chuyện và góc nhìn phía sau một tác phẩm HALO HOLA 2026.']
  if(pathname.startsWith('/stories/'))return ['Câu chuyện Hòa Lạc | HALO HOLA','Đọc một câu chuyện từ cộng đồng HALO HOLA về Hòa Lạc.']
  return ['HALO HOLA 2026 — Hello Hòa Lạc',DEFAULT_DESCRIPTION]
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function SiteRuntime(){
  const {pathname}=useLocation()
  const privatePage=pathname.startsWith('/admin')||pathname.startsWith('/jury')||pathname.startsWith('/tac-pham/xem-truoc/')

  useEffect(()=>{
    const [title,description]=routeSeo(pathname)
    const canonical=SITE_URL+(pathname==='/'?'':pathname)
    document.title=title
    setMeta('description',description)
    setMeta('robots',privatePage?'noindex,nofollow':'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1')
    setMeta('og:title',title,'property')
    setMeta('og:description',description,'property')
    setMeta('og:url',canonical,'property')
    setMeta('og:type','website','property')
    setMeta('og:site_name','HALO HOLA','property')
    setMeta('og:locale','vi_VN','property')
    setMeta('og:image',DEFAULT_OG_IMAGE,'property')
    setMeta('twitter:card','summary_large_image')
    setMeta('twitter:title',title)
    setMeta('twitter:description',description)
    setMeta('twitter:image',DEFAULT_OG_IMAGE)
    setCanonical(canonical)
    if(!privatePage) trackEvent('page_view',{path:pathname})

    const frame=requestAnimationFrame(()=>{
      const images=[...document.querySelectorAll('main img')]
      images.forEach((image,index)=>{
        image.decoding='async'
        if(index<2){image.loading='eager';image.setAttribute('fetchpriority','high')}
        else{image.loading='lazy';image.setAttribute('fetchpriority','low')}
      })
    })
    return()=>cancelAnimationFrame(frame)
  },[pathname,privatePage])

  useEffect(()=>{
    const onClick=(event)=>{
      if(privatePage)return
      const interactive=event.target?.closest?.('a,button')
      if(!interactive)return
      const [eventType,target]=classifyClick(interactive)
      if(!target)return
      trackEvent(eventType,{path:pathname,target,metadata:{label:(interactive.textContent||'').replace(/\s+/g,' ').trim().slice(0,120)}})
    }
    document.addEventListener('click',onClick,{passive:true})
    return()=>document.removeEventListener('click',onClick)
  },[pathname,privatePage])

  return null
}

function clampNumber(value,min,max,fallback){
  const number=Number(value)
  if(!Number.isFinite(number)) return fallback
  return Math.min(max,Math.max(min,number))
}

function BrandRuntime(){
  useEffect(()=>{
    let alive=true
    getSiteSettings().then(settings=>{
      if(!alive) return
      const brand=settings?.brand||{}
      const root=document.documentElement
      const background=brand.backgroundColor||'#fbf7ef'
      const primary=brand.primaryColor||'#173d2d'
      const accent=brand.accentColor||'#c45b32'
      const logoWidth=clampNumber(brand.logoWidth,80,320,190)
      const logoHeight=clampNumber(brand.logoHeight,24,96,52)
      const logoWidthMobile=clampNumber(brand.logoWidthMobile,70,240,145)
      const logoHeightMobile=clampNumber(brand.logoHeightMobile,22,72,42)

      root.style.setProperty('--site-background',background)
      root.style.setProperty('--cream',background)
      root.style.setProperty('--forest',primary)
      root.style.setProperty('--terra',accent)
      root.style.setProperty('--site-logo-width',`${logoWidth}px`)
      root.style.setProperty('--site-logo-height',`${logoHeight}px`)
      root.style.setProperty('--site-logo-width-mobile',`${logoWidthMobile}px`)
      root.style.setProperty('--site-logo-height-mobile',`${logoHeightMobile}px`)
      document.body.style.backgroundColor=background

      const themeMeta=document.querySelector('meta[name="theme-color"]')
      if(themeMeta) themeMeta.setAttribute('content',primary)
    }).catch(()=>{})
    return()=>{alive=false}
  },[])
  return null
}

function RouteFallback(){return <main><div className="jw-empty" role="status">Đang tải nội dung HALO HOLA…</div></main>}

function SiteShell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/jury')
  const showBottomNav = !isAdmin && pathname !== '/gui-goc-nhin'

  return (
    <div className={'site-shell '+(showBottomNav?'has-mobile-bottom-nav':'')}>
      <BrandRuntime />
      <SiteRuntime />
      <ScrollToTop />
      {!isAdmin && <Header />}
      <Suspense fallback={<RouteFallback/>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gui-goc-nhin" element={<SubmitPage />} />
          <Route path="/hola-map" element={<MapPage />} />
          <Route path="/top52" element={<Top52Page />} />
          <Route path="/tac-pham/xem-truoc/:submissionId" element={<ArtworkPage preview />} />
          <Route path="/tac-pham/:slug" element={<ArtworkPage />} />
          <Route path="/hola-tour" element={<TourPage />} />
          <Route path="/hola-day" element={<HolaDayPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/stories/:slug" element={<StoryDetailPage />} />
          <Route path="/we-hola" element={<WeHolaPage />} />
          <Route path="/dong-hanh" element={<PartnersPage />} />
          <Route path="/hello" element={<HelloPage />} />
          <Route path="/chu-de" element={<ThemesPage />} />
          <Route path="/chu-de/:slug" element={<ThemePage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/tra-cuu" element={<LookupPage />} />
          <Route path="/jury" element={<JurorWorkspacePage />} />
          <Route path="/jury/:submissionId" element={<JurorWorkspacePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
      {!isAdmin && <Footer />}
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default function App() { return <SiteShell /> }
