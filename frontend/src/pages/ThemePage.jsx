import { useEffect, useState } from 'react'
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

function publicBadge(item){
  if(item?.status==='AWARDED') return 'ĐƯỢC GHI NHẬN'
  if(item?.status==='TOP52') return '52 GÓC NHÌN'
  if(item?.status==='SHORTLIST') return 'GÓC NHÌN NỔI BẬT'
  return 'ĐÃ CÔNG BỐ'
}

export default function ThemePage(){
  const {slug}=useParams()
  const [theme,setTheme]=useState(null)
  const [related,setRelated]=useState([])
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

    getTheme(slug).then(async data=>{
      if(!alive)return
      setTheme(data)
      const rows=await getPublicArtworks({theme:data.title,limit:PAGE_SIZE+1,offset:0})
      if(!alive)return
      const page=normalizePage(rows,0)
      setRelated(page.items)
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
  if(error||!theme)return <main className="theme-page-ref"><div className="form-error">{error||'Không tìm thấy chủ đề.'}</div><div className="container section"><Link className="btn btn-outline" to="/chu-de"><ArrowLeft/> Quay lại 7 chủ đề</Link></div></main>

  const visibleCount=Number(theme.artworkCount ?? totalCount ?? 0)

  return <main className="theme-page-ref">
    <section className="theme-hero-ref">
      <div className="theme-hero-contours"/>
      <div className="theme-hero-leaf"/>
      <div className="theme-hero-inner">
        <div className="theme-hero-copy">
          <Link className="story-back-link" to="/chu-de"><ArrowLeft/> 7 chủ đề</Link>
          <div className="theme-kicker"><span>CHỦ ĐỀ {String(theme.id).padStart(2,'0')}</span><i/></div>
          <h1>{theme.title}</h1>
          <h3>{theme.description}</h3>
          <p>{theme.intro}</p>

          <div className="theme-hero-actions">
            <Link className="btn btn-terra" to="/gui-goc-nhin">Gửi một góc nhìn <ArrowRight size={17}/></Link>
            <a className="theme-explore-link" href="#kham-pha"><span><Play/></span>Khám phá chủ đề này</a>
          </div>

          <div className="theme-hero-stats">
            <div><span><Users/></span><b>{visibleCount}</b><small>Góc nhìn đã công bố</small></div>
            <div><span><BookOpen/></span><b>Câu chuyện</b><small>Người · nơi · ký ức · ý tưởng</small></div>
            <div><span><ImageIcon/></span><b>Đa định dạng</b><small>Ảnh · Video · Story · Art</small></div>
          </div>
        </div>

        <div className="theme-hero-visual">
          <div className="theme-hero-image-wrap">{theme.image?<img src={theme.image} alt={theme.title}/>:<div className="theme-card-placeholder"/>}</div>
          <div className="theme-location-card"><MapPin/><div><b>{theme.locationLabel||'Hòa Lạc'}</b><small>HÒA LẠC, HÀ NỘI</small></div></div>
          <div className="theme-hero-note">Đi<br/>Gặp<br/>Nghe<br/>Kể<i/></div>
        </div>
      </div>
    </section>

    <section id="kham-pha" className="theme-story-ref">
      <div className="theme-story-inner">
        <div className="theme-story-copy">
          <div className="theme-kicker"><span>GỢI Ý KHÁM PHÁ</span><i/></div>
          <h2>Đi tìm một câu chuyện, không chỉ một khung hình</h2>
          <p>Mỗi chủ đề là một khung biên tập để team và cộng đồng tìm người, nơi chốn, ký ức, khoảnh khắc và ý tưởng đáng được giữ lại. Một góc nhìn có thể giao thoa nhiều chủ đề.</p>
        </div>

        <div className="theme-tip-panel">
          <div className="theme-tip-head"><i/><div><h3>Gợi ý cách tìm</h3><p>Đi chậm, quan sát, gặp người thật và nghe câu chuyện phía sau điều mình nhìn thấy.</p></div></div>
          <div className="theme-tip-list">
            <div><span><Eye/></span><div><b>Nhìn kỹ</b><small>Tìm chi tiết nhỏ cho thấy bản sắc hoặc sự thay đổi.</small></div></div>
            <div><span><Users/></span><div><b>Gặp người</b><small>Nhân vật giúp một nơi chốn trở thành câu chuyện.</small></div></div>
            <div><span><ImageIcon/></span><div><b>Ghi lại</b><small>Ảnh, video, audio, tư liệu và thông tin nguồn đều có giá trị.</small></div></div>
            <div><span><BookOpen/></span><div><b>Kể vừa đủ</b><small>Tên câu chuyện, hero image, short story và một quote là cấu trúc cốt lõi.</small></div></div>
          </div>
        </div>
      </div>
    </section>

    <section className="theme-related-ref">
      <div className="theme-related-inner">
        <header className="theme-related-head">
          <div>
            <div className="theme-kicker"><span>GÓC NHÌN ĐÃ CÔNG BỐ</span><i/></div>
            <h2>Những câu chuyện thuộc {theme.title}</h2>
            <p>Các góc nhìn đã được công bố trong hành trình HALO HOLA 2026 — từ cộng đồng, đối tác và quá trình Ban Biên tập chủ động đi tìm Hòa Lạc.</p>
          </div>
          <div className="theme-related-actions"><Link className="theme-view-all" to="/top52">Xem 52 góc nhìn <ArrowRight/></Link></div>
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
          <div className="theme-gallery-count"><b>{totalCount}</b> góc nhìn <span>·</span> đang hiển thị <b>{related.length}</b></div>
        </div>

        {collectionError&&<div className="theme-gallery-error">{collectionError}</div>}
        {galleryLoading?<div className="theme-gallery-loading">Đang tải góc nhìn...</div>:
          related.length===0?<div className="theme-gallery-empty">
            <span className="theme-gallery-empty-icon"><ImageIcon/></span>
            <div>
              <h3>{activeType?'Chưa có góc nhìn ở loại hình này':'Chưa có góc nhìn công khai'}</h3>
              <p>{activeType?'Bạn có thể thử một loại hình khác hoặc xem lại tất cả.':'Bạn có thể gửi một góc nhìn hoặc giới thiệu câu chuyện để Ban Biên tập tìm hiểu.'}</p>
            </div>
            {activeType?<button type="button" onClick={()=>loadCollection('')}>Xem tất cả</button>:<Link to="/gui-goc-nhin">Gửi một góc nhìn <ArrowRight/></Link>}
          </div>:<>
            <div className="theme-related-grid theme-gallery-grid theme-gallery-visible">
              {related.map(a=><Link to={'/tac-pham/'+a.slug} className="theme-related-card" key={a.id||a.slug}>
                <div className="theme-related-media">
                  {a.image?<img loading="lazy" decoding="async" src={a.image} alt={a.title||a.code}/>:<div className="theme-card-placeholder"/>}
                  <span className="theme-top52-badge">{publicBadge(a)}</span>
                  <span className="theme-related-heart"><Heart/></span>
                </div>
                <div className="theme-related-body">
                  <span className="theme-related-category">{a.theme} · {a.location}</span>
                  <h3>{a.title||a.code}</h3>
                  <div className="theme-related-author"><span className="theme-related-avatar">{a.author?.charAt(0)}</span><b>{a.author||'HALO HOLA Editorial'}</b></div>
                  <div className="theme-related-meta"><span><Eye/> {a.type||'Góc nhìn'}</span><i/><span><MapPin/> {a.location}</span></div>
                </div>
              </Link>)}
            </div>

            {hasMore&&<div className="theme-gallery-more">
              <button type="button" onClick={loadMore} disabled={loadingMore}>{loadingMore?'Đang tải...':`Xem thêm ${Math.min(PAGE_SIZE,Math.max(0,totalCount-related.length))} góc nhìn`} <ArrowRight/></button>
            </div>}
          </>}
      </div>
    </section>
  </main>
}
