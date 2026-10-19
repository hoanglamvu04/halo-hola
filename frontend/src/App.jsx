import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import BottomNav from './components/BottomNav.jsx'
import HomePage from './pages/HomePage.jsx'
import { getSiteSettings } from './services/api.js'
import { classifyClick, trackEvent } from './services/analytics.js'

const SubmitPage=lazy(()=>import('./pages/SubmitPage.jsx'))
const MapPage=lazy(()=>import('./pages/MapPage.jsx'))
const CommunityGalleryPage=lazy(()=>import('./pages/CommunityGalleryPage.jsx'))
const Top52Page=lazy(()=>import('./pages/Top52Page.jsx'))
const ArtworkPage=lazy(()=>import('./pages/ArtworkPage.jsx'))
const TourPage=lazy(()=>import('./pages/TourPage.jsx'))
const HolaDayPage=lazy(()=>import('./pages/HolaDayPage.jsx'))
const Calendar2027Page=lazy(()=>import('./pages/Calendar2027Page.jsx'))
const StoriesPage=lazy(()=>import('./pages/StoriesPage.jsx'))
const StoryDetailPage=lazy(()=>import('./pages/StoryDetailPage.jsx'))
const WeHolaPage=lazy(()=>import('./pages/WeHolaPage.jsx'))
const PartnersPage=lazy(()=>import('./pages/PartnersPage.jsx'))
const HelloPage=lazy(()=>import('./pages/HelloPage.jsx'))
const ThemesPage=lazy(()=>import('./pages/ThemesPage.jsx'))
const ThemePage=lazy(()=>import('./pages/ThemePage.jsx'))
const RulesAwardsPage=lazy(()=>import('./pages/RulesAwardsPage.jsx'))
const AdminPage=lazy(()=>import('./pages/AdminPage.jsx'))
const LookupPage=lazy(()=>import('./pages/LookupPage.jsx'))
const JurorWorkspacePage=lazy(()=>import('./pages/JurorWorkspacePage.jsx'))
const NotFoundPage=lazy(()=>import('./pages/NotFoundPage.jsx'))

const SITE_URL='https://halohola.vn'
const DEFAULT_DESCRIPTION='HALO HOLA 2026 là hành trình cộng đồng và dự án biên tập – khám phá – lưu giữ 52 câu chuyện về Hòa Lạc.'
const DEFAULT_OG_IMAGE='https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85'
const SEO_ROUTES={
  '/': ['HALO HOLA 2026 — 52 góc nhìn · 1 Hòa Lạc',DEFAULT_DESCRIPTION],
  '/chu-de':['7 chủ đề Hòa Lạc | HALO HOLA','Khám phá 7 chủ đề: Bản sắc, Thiên nhiên, Không gian, Con người, Tri thức & Công nghệ, Đời sống & Cảm xúc và Tương lai.'],
  '/hola-tour':['HOLA Tour | HALO HOLA','Ba hành trình săn câu chuyện: Đi tìm Bản sắc, Đi tìm Màu sắc và Đi tìm Cảm xúc tại Hòa Lạc.'],
  '/hola-map':['HOLA Map | HALO HOLA','Khám phá địa điểm, câu chuyện và những góc nhìn cộng đồng về Hòa Lạc trên bản đồ tương tác.'],
  '/stories':['Stories Hòa Lạc | HALO HOLA','Những câu chuyện về con người, nơi chốn, ký ức, tri thức, đời sống và tương lai Hòa Lạc.'],
  '/kham-pha':['Góc nhìn Hòa Lạc | HALO HOLA 2026','Kho những góc nhìn đã được tìm thấy, biên tập và công bố trong hành trình HALO HOLA 2026.'],
  '/top52':['52 góc nhìn 2026 | HALO HOLA','52 câu chuyện đại diện cho một Hòa Lạc năm 2026 — được Ban Biên tập chủ động tìm, xác minh, biên tập và giới thiệu tại HOLA DAY.'],
  '/we-hola':['WE HOLA — Chúng ta là Hòa Lạc','HALO HOLA kể. WE HOLA làm — cộng đồng cùng hành động để Hòa Lạc xanh hơn, đẹp hơn và giàu bản sắc hơn.'],
  '/gui-goc-nhin':['Gửi một góc nhìn về Hòa Lạc | HALO HOLA 2026','Gửi ảnh, video, câu chuyện hoặc giới thiệu một người, một nơi hay một điều đáng để Ban Biên tập HALO HOLA tìm hiểu.'],
  '/hola-day':['HOLA DAY 2026 | HALO HOLA','24.11.2026 — Triển lãm · Câu chuyện · Kết nối · công bố 52 góc nhìn và mở ra HALO HOLA 2027.'],
  '/calendar-2027':['HALO HOLA Calendar 2027','52 tuần · 52 câu chuyện Hòa Lạc — phiên bản vật lý nối mỗi tuần trên lịch với câu chuyện digital qua QR.'],
  '/dong-hanh':['Đồng hành cùng HALO HOLA','Thông tin dành cho chuyên gia, CLB, trường học, doanh nghiệp, địa phương và đối tác cùng đóng góp nguồn lực, câu chuyện và kết nối.'],
  '/the-le-giai-thuong':['Cách đóng góp | HALO HOLA 2026','Hướng dẫn gửi một góc nhìn, giới thiệu đầu mối câu chuyện, 7 chủ đề, nguyên tắc biên tập và quyền sử dụng nội dung.'],
  '/tra-cuu':['Theo dõi góc nhìn | HALO HOLA','Theo dõi hồ sơ góc nhìn từ lúc gửi, xác minh, biên tập đến công bố và HOLA Maps.'],
  '/hello':['Hello Hòa Lạc | HALO HOLA',DEFAULT_DESCRIPTION]
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
function isKnownPath(pathname){
  return Boolean(
    SEO_ROUTES[pathname] ||
    pathname.startsWith('/chu-de/') ||
    pathname.startsWith('/tac-pham/') ||
    pathname.startsWith('/stories/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/jury')
  )
}
function routeSeo(pathname){
  if(SEO_ROUTES[pathname])return SEO_ROUTES[pathname]
  if(pathname.startsWith('/chu-de/'))return ['Chủ đề Hòa Lạc | HALO HOLA','Khám phá những góc nhìn và câu chuyện thuộc một trong 7 chủ đề HALO HOLA 2026.']
  if(pathname.startsWith('/tac-pham/'))return ['Góc nhìn HALO HOLA 2026','Khám phá một câu chuyện, địa điểm và góc nhìn được ghi lại trong hành trình HALO HOLA 2026.']
  if(pathname.startsWith('/stories/'))return ['Câu chuyện Hòa Lạc | HALO HOLA','Đọc một câu chuyện do HALO HOLA và cộng đồng cùng tìm, ghi lại và kể tiếp.']
  if(pathname.startsWith('/admin'))return ['Admin | HALO HOLA','Khu vực quản trị HALO HOLA.']
  if(pathname.startsWith('/jury'))return ['Editorial Review | HALO HOLA','Khu vực đánh giá nội bộ HALO HOLA.']
  return ['404 — Không tìm thấy trang | HALO HOLA','Đường dẫn này không tồn tại hoặc nội dung chưa được công bố.']
}

function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return undefined
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => { window.history.scrollRestoration = previous }
  }, [])

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, search, hash])

  useEffect(() => {
    if (!hash) return undefined
    const targetId = decodeURIComponent(hash.slice(1))
    let attempts = 0
    let timer

    const scrollToHash = () => {
      const target = document.getElementById(targetId)
      if (target) {
        target.scrollIntoView({ block: 'start', behavior: 'auto' })
        return
      }
      attempts += 1
      if (attempts < 8) timer = window.setTimeout(scrollToHash, 60)
    }

    scrollToHash()
    return () => window.clearTimeout(timer)
  }, [pathname, search, hash])

  return null
}

function SiteRuntime(){
  const {pathname}=useLocation()
  const privatePage=pathname.startsWith('/admin')||pathname.startsWith('/jury')||pathname.startsWith('/tac-pham/xem-truoc/')
  const knownPage=isKnownPath(pathname)
  const noIndex=privatePage||!knownPage

  useEffect(()=>{
    const [title,description]=routeSeo(pathname)
    const canonical=SITE_URL+(pathname==='/'?'':pathname)
    document.title=title
    setMeta('description',description)
    setMeta('robots',noIndex?'noindex,nofollow':'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1')
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
    if(!privatePage) trackEvent('page_view',{path:pathname,metadata:{found:knownPage}})

    const frame=requestAnimationFrame(()=>{
      const images=[...document.querySelectorAll('main img')]
      images.forEach((image,index)=>{
        image.decoding='async'
        if(index<2){image.loading='eager';image.setAttribute('fetchpriority','high')}
        else{image.loading='lazy';image.setAttribute('fetchpriority','low')}
      })
    })
    return()=>cancelAnimationFrame(frame)
  },[pathname,privatePage,knownPage,noIndex])

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
          <Route path="/kham-pha" element={<CommunityGalleryPage />} />
          <Route path="/top52" element={<Top52Page />} />
          <Route path="/tac-pham/xem-truoc/:submissionId" element={<ArtworkPage preview />} />
          <Route path="/tac-pham/:slug" element={<ArtworkPage />} />
          <Route path="/hola-tour" element={<TourPage />} />
          <Route path="/hola-day" element={<HolaDayPage />} />
          <Route path="/calendar-2027" element={<Calendar2027Page />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/stories/:slug" element={<StoryDetailPage />} />
          <Route path="/we-hola" element={<WeHolaPage />} />
          <Route path="/dong-hanh" element={<PartnersPage />} />
          <Route path="/the-le-giai-thuong" element={<RulesAwardsPage />} />
          <Route path="/hello" element={<HelloPage />} />
          <Route path="/chu-de" element={<ThemesPage />} />
          <Route path="/chu-de/:slug" element={<ThemePage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/tra-cuu" element={<LookupPage />} />
          <Route path="/jury" element={<JurorWorkspacePage />} />
          <Route path="/jury/:submissionId" element={<JurorWorkspacePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      {!isAdmin && <Footer />}
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default function App() { return <SiteShell /> }