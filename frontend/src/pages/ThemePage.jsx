import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, MapPin, Users, BookOpen, Eye, Play,
  Grid2X2, Building2, Image as ImageIcon, Heart
} from 'lucide-react'
import { getTheme, getPublicArtworks } from '../services/api.js'
import './ThemePagePreview.css'
import './ThemePageMobile.css'

const PAGE_SIZE=12

const artworkTypes=[
  {value:'',label:'Tất cả',Icon:Grid2X2},
  {value:'Photo',label:'Ảnh',Icon:ImageIcon},
  {value:'Video',label:'Video',Icon:Play},
  {value:'Story & Creative',label:'Story',Icon:BookOpen},
  {value:'Art & Design',label:'Art & Design',Icon:Building2}
]

function normalizePage(rows,offset=0){
  const source=Array.isArray(rows)?rows:[]
  const total=Number(source[0]?.totalCount)
  const items=source.slice(0,PAGE_SIZE)
  const resolvedTotal=Number.isFinite(total)?total:offset+items.length+(source.length>PAGE_SIZE?1:0)
  return {
    items,
    total:resolvedTotal,
    hasMore:offset+items.length<resolvedTotal || source.length>PAGE_SIZE
  }
}

const HERO_SLIDE_LIMIT=5

function buildThemeHeroSlides(theme,artworks){
  const slides=[]
  const seen=new Set()
  const source=Array.isArray(artworks)?artworks:[]

  const addSlide=(src,artwork,mediaIndex=0)=>{
    if(!src||seen.has(src)||slides.length>=HERO_SLIDE_LIMIT)return
    seen.add(src)
    slides.push({
      src,
      alt:artwork?.title||artwork?.code||theme?.title||'Hòa Lạc',
      artwork,
      mediaIndex
    })
  }

  // First pass: prefer one real image from each public submission so the
  // carousel represents as many community viewpoints as possible.
  source.forEach(artwork=>{
    const imageMedia=Array.isArray(artwork?.media)
      ? artwork.media.filter(media=>String(media?.mimeType||'').toLowerCase().startsWith('image/'))
      : []
    addSlide(imageMedia[0]?.url||(artwork?.type==='Photo'?artwork?.image:null),artwork,0)
  })

  // Second pass: if there are fewer than five submissions with images, fill the
  // remaining slots with additional photos from those same public submissions.
  if(slides.length<HERO_SLIDE_LIMIT){
    source.forEach(artwork=>{
      const imageMedia=Array.isArray(artwork?.media)
        ? artwork.media.filter(media=>String(media?.mimeType||'').toLowerCase().startsWith('image/'))
        : []
      imageMedia.slice(1).forEach((media,index)=>addSlide(media?.url,artwork,index+1))
    })
  }

  // No public submission image yet: fall back to the theme artwork that the old
  // hero already used instead of showing an empty carousel.
  if(slides.length===0&&theme?.image)addSlide(theme.image,null,0)

  return slides.slice(0,HERO_SLIDE_LIMIT)
}

export default function ThemePage(){
  const {slug}=useParams()
  const [theme,setTheme]=useState(null)
  const [related,setRelated]=useState([])
  const [heroArtworks,setHeroArtworks]=useState([])
  const [heroSlide,setHeroSlide]=useState(0)
  const heroTouchStartX=useRef(null)
  const [activeType,setActiveType]=useState('')
  const [totalCount,setTotalCount]=useState(0)
  const [hasMore,setHasMore]=useState(false)
  const [loading,setLoading]=useState(true)
  const [galleryLoading,setGalleryLoading]=useState(false)
  const [loadingMore,setLoadingMore]=useState(false)
  const [error,setError]=useState('')
  const [collectionError,setCollectionError]=useState('')

  useEffect(()=>{
    let alive=true
    setLoading(true)
    setError('')
    setCollectionError('')
    setActiveType('')
    setRelated([])
    setHeroArtworks([])
    setHeroSlide(0)

    getTheme(slug).then(async data=>{
      if(!alive)return
      setTheme(data)
      const rows=await getPublicArtworks({theme:data.title,limit:PAGE_SIZE+1,offset:0})
      if(!alive)return
      const page=normalizePage(rows,0)
      setRelated(page.items)
      setHeroArtworks(page.items)
      setHeroSlide(0)
      setTotalCount(page.total)
      setHasMore(page.hasMore)
    }).catch(err=>{if(alive)setError(err.message)}).finally(()=>{if(alive)setLoading(false)})

    return()=>{alive=false}
  },[slug])

  const loadCollection=async(type)=>{
    if(!theme)return
    setActiveType(type)
    setGalleryLoading(true)
    setCollectionError('')
    try{
      const params={theme:theme.title,limit:PAGE_SIZE+1,offset:0}
      if(type)params.type=type
      const rows=await getPublicArtworks(params)
      const page=normalizePage(rows,0)
      setRelated(page.items)
      setTotalCount(page.total)
      setHasMore(page.hasMore)
    }catch(err){
      setCollectionError(err.message)
    }finally{
      setGalleryLoading(false)
    }
  }

  const loadMore=async()=>{
    if(!theme||loadingMore||!hasMore)return
    setLoadingMore(true)
    setCollectionError('')
    try{
      const params={theme:theme.title,limit:PAGE_SIZE+1,offset:related.length}
      if(activeType)params.type=activeType
      const rows=await getPublicArtworks(params)
      const page=normalizePage(rows,related.length)
      setRelated(current=>[...current,...page.items])
      setTotalCount(page.total)
      setHasMore(page.hasMore)
    }catch(err){
      setCollectionError(err.message)
    }finally{
      setLoadingMore(false)
    }
  }

  if(loading)return <main className="theme-page-ref"><div className="jw-empty">Đang tải chủ đề từ hệ thống...</div></main>
  if(error||!theme)return <main className="theme-page-ref"><div className="form-error">{error||'Không tìm thấy chủ đề.'}</div><div className="container section"><Link className="btn btn-outline" to="/chu-de"><ArrowLeft/> Quay lại 8 chủ đề</Link></div></main>

  const heroSlides=buildThemeHeroSlides(theme,heroArtworks)
  const activeHeroIndex=heroSlides.length?Math.min(heroSlide,heroSlides.length-1):0
  const activeHero=heroSlides[activeHeroIndex]
  const showHeroSlide=(index)=>{
    if(heroSlides.length<2)return
    const next=(index+heroSlides.length)%heroSlides.length
    setHeroSlide(next)
  }
  const handleHeroTouchStart=(event)=>{
    heroTouchStartX.current=event.touches?.[0]?.clientX??null
  }
  const handleHeroTouchEnd=(event)=>{
    if(heroSlides.length<2||heroTouchStartX.current===null)return
    const endX=event.changedTouches?.[0]?.clientX
    const delta=typeof endX==='number'?endX-heroTouchStartX.current:0
    heroTouchStartX.current=null
    if(Math.abs(delta)<42)return
    showHeroSlide(activeHeroIndex+(delta<0?1:-1))
  }

  return <main className="theme-page-ref">
    <section className="theme-hero-ref">
      <div className="theme-hero-contours"/>
      <div className="theme-hero-leaf"/>
      <div className="theme-hero-inner">
        <div className="theme-hero-copy">
          <Link className="story-back-link" to="/chu-de"><ArrowLeft/> 8 chủ đề</Link>
          <div className="theme-kicker"><span>CHỦ ĐỀ {String(theme.id).padStart(2,'0')}</span><i/></div>
          <h1>{theme.title}</h1>
          <h3>{theme.description}</h3>
          <p>{theme.intro}</p>

          <div className="theme-hero-actions">
            <Link className="btn btn-terra" to="/gui-goc-nhin">Gửi tác phẩm <ArrowRight size={17}/></Link>
            <a className="theme-explore-link" href="#kham-pha"><span><Play/></span>Khám phá chủ đề</a>
          </div>

        </div>

        <div className="theme-hero-visual" onTouchStart={handleHeroTouchStart} onTouchEnd={handleHeroTouchEnd}>
          <div className="theme-hero-image-wrap">
            {activeHero?<img key={activeHero.src} src={activeHero.src} alt={activeHero.alt}/>:<div className="theme-card-placeholder"/>}
          </div>

          {activeHero?.artwork&&<Link className="theme-hero-artwork-credit" to={'/tac-pham/'+activeHero.artwork.slug}>
            <span>GÓC NHÌN CỘNG ĐỒNG</span>
            <b>{activeHero.artwork.title||activeHero.artwork.code}</b>
          </Link>}

          {heroSlides.length>1&&<>
            <div className="theme-hero-slider-dots" aria-label="Chọn ảnh chủ đề">
              {heroSlides.map((slide,index)=><button
                type="button"
                key={slide.src}
                className={index===activeHeroIndex?'active':''}
                onClick={()=>showHeroSlide(index)}
                aria-label={'Xem ảnh '+String(index+1).padStart(2,'0')}
              />)}
            </div>
            <div className="theme-hero-slider-controls" aria-label="Điều hướng ảnh chủ đề">
              <button type="button" onClick={()=>showHeroSlide(activeHeroIndex-1)} aria-label="Ảnh trước"><ArrowLeft/></button>
              <span>{String(activeHeroIndex+1).padStart(2,'0')} / {String(heroSlides.length).padStart(2,'0')}</span>
              <button type="button" onClick={()=>showHeroSlide(activeHeroIndex+1)} aria-label="Ảnh tiếp theo"><ArrowRight/></button>
            </div>
          </>}
        </div>
      </div>
    </section>

    <section id="kham-pha" className="theme-story-ref">
      <div className="theme-story-inner">
        <div className="theme-story-copy">
          <div className="theme-kicker"><span>GỢI Ý KHÁM PHÁ</span><i/></div>
          <h2>Nhìn Hòa Lạc qua một lớp câu chuyện riêng</h2>
          <p>Mỗi chủ đề mở ra những góc nhìn từ con người, không gian, ký ức và sự chuyển mình của vùng đất. Người tham gia có thể tiếp cận bằng ảnh, video, story hoặc art &amp; design theo thể lệ.</p>
        </div>

        <div className="theme-tip-panel">
          <div className="theme-tip-head"><i/><div><h3>Gợi ý góc nhìn</h3><p>Đi chậm, quan sát và cảm nhận. Hãy bắt đầu từ những điều gần gũi nhất quanh bạn.</p></div></div>
          <div className="theme-tip-list">
            <div><span><Eye/></span><div><b>Quan sát chi tiết</b><small>Những điều nhỏ bé tạo nên bản sắc Hòa Lạc.</small></div></div>
            <div><span><Users/></span><div><b>Trò chuyện với người địa phương</b><small>Lắng nghe câu chuyện từ những người gắn bó với vùng đất này.</small></div></div>
            <div><span><ImageIcon/></span><div><b>Ghi lại không khí</b><small>Nhịp sống, thiên nhiên, không gian và sự thay đổi qua thời gian.</small></div></div>
            <div><span><BookOpen/></span><div><b>Tìm dấu ấn ký ức</b><small>Những ký ức, câu chuyện xưa và nay của Hòa Lạc.</small></div></div>
          </div>
        </div>
      </div>
    </section>

    <section className="theme-related-ref">
      <div className="theme-related-inner">
        <header className="theme-related-head">
          <div>
            <div className="theme-kicker"><span>TÁC PHẨM CỘNG ĐỒNG</span><i/></div>
            <h2>Tác phẩm thuộc {theme.title}</h2>
            <p>Những góc nhìn, câu chuyện và khoảnh khắc được cộng đồng gửi về trong hành trình HALO HOLA 2026.</p>
          </div>
          <div className="theme-related-actions"><Link className="theme-view-all" to="/top52">Xem TOP52 <ArrowRight/></Link></div>
        </header>

        <div className="theme-gallery-toolbar">
          <div className="theme-filter-row">
            {artworkTypes.map(({value,label,Icon})=><button
              type="button"
              key={value||'all'}
              className={activeType===value?'active':''}
              onClick={()=>loadCollection(value)}
              disabled={galleryLoading}
            ><Icon/>{label}</button>)}
          </div>
          <div className="theme-gallery-count"><b>{totalCount}</b> tác phẩm <span>·</span> đang hiển thị <b>{related.length}</b></div>
        </div>

        {collectionError&&<div className="theme-gallery-error">{collectionError}</div>}
        {galleryLoading?<div className="theme-gallery-loading">Đang tải tác phẩm...</div>:
          related.length===0?<div className="theme-gallery-empty">
            <span className="theme-gallery-empty-icon"><ImageIcon/></span>
            <div>
              <h3>{activeType?'Chưa có tác phẩm ở loại hình này':'Chưa có tác phẩm công khai'}</h3>
              <p>{activeType?'Bạn có thể thử một loại hình khác hoặc xem lại tất cả tác phẩm.':'Hãy là người đầu tiên gửi một góc nhìn cho chủ đề này.'}</p>
            </div>
            {activeType?<button type="button" onClick={()=>loadCollection('')}>Xem tất cả</button>:<Link to="/gui-goc-nhin">Gửi tác phẩm đầu tiên <ArrowRight/></Link>}
          </div>:<>
            <div className="theme-related-grid theme-gallery-grid theme-gallery-visible">
              {related.map(a=><Link to={'/tac-pham/'+a.slug} className="theme-related-card" key={a.id||a.slug}>
                <div className="theme-related-media">
                  {a.image?<img loading="lazy" decoding="async" src={a.image} alt={a.title||a.code}/>:<div className="theme-card-placeholder"/>}
                  <span className="theme-top52-badge">{a.status==='AWARDED'?'ĐẠT GIẢI':'TOP52'}</span>
                  <span className="theme-related-heart"><Heart/></span>
                </div>
                <div className="theme-related-body">
                  <span className="theme-related-category">{a.theme} · {a.location}</span>
                  <h3>{a.title||a.code}</h3>
                  <div className="theme-related-author"><span className="theme-related-avatar">{a.author?.charAt(0)}</span><b>{a.author}</b></div>
                  <div className="theme-related-meta"><span><Eye/> {Number(a.juryScore||0).toFixed(1)} điểm BGK</span><i/><span><MapPin/> {a.location}</span></div>
                </div>
              </Link>)}
            </div>

            {hasMore&&<div className="theme-gallery-more">
              <button type="button" onClick={loadMore} disabled={loadingMore}>{loadingMore?'Đang tải...':`Xem thêm ${Math.min(PAGE_SIZE,Math.max(0,totalCount-related.length))} tác phẩm`} <ArrowRight/></button>
            </div>}
          </>}
      </div>
    </section>
  </main>
}
