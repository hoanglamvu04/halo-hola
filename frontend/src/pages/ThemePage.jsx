import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, MapPin, Users, BookOpen, Eye, Play,
  Grid2X2, Building2, Image as ImageIcon, Heart
} from 'lucide-react'
import {
  getTheme,
  getPublicArtworks,
  getAdminToken,
  getAdminPublicPreviewArtworks
} from '../services/api.js'
import './ThemePagePreview.css'
import './ThemePageMobile.css'

const PAGE_SIZE=12

const previewStatusLabel={
  PENDING:'CHỜ DUYỆT',
  VALID:'HỢP LỆ',
  SHORTLIST:'SHORTLIST',
  TOP52:'TOP52',
  AWARDED:'ĐẠT GIẢI'
}

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

export default function ThemePage(){
  const {slug}=useParams()
  const [theme,setTheme]=useState(null)
  const [related,setRelated]=useState([])
  const [isAdminPreview,setIsAdminPreview]=useState(false)
  const [activeType,setActiveType]=useState('')
  const [totalCount,setTotalCount]=useState(0)
  const [allCount,setAllCount]=useState(0)
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
    setIsAdminPreview(false)
    setActiveType('')
    setRelated([])

    getTheme(slug).then(async data=>{
      if(!alive)return
      setTheme(data)

      const params={theme:data.title,limit:PAGE_SIZE+1,offset:0}
      let rows=[]
      let previewMode=false

      if(getAdminToken()){
        try{
          rows=await getAdminPublicPreviewArtworks(params)
          previewMode=true
        }catch{
          rows=await getPublicArtworks(params)
        }
      }else{
        rows=await getPublicArtworks(params)
      }

      if(!alive)return
      const page=normalizePage(rows,0)
      setIsAdminPreview(previewMode)
      setRelated(page.items)
      setTotalCount(page.total)
      setAllCount(previewMode?page.total:Number(data.artworkCount||page.total))
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
      const rows=isAdminPreview
        ? await getAdminPublicPreviewArtworks(params)
        : await getPublicArtworks(params)
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
      const rows=isAdminPreview
        ? await getAdminPublicPreviewArtworks(params)
        : await getPublicArtworks(params)
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

  const visibleCount=isAdminPreview?allCount:Number(theme.artworkCount||0)

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

          <div className="theme-hero-stats">
            <div><span><Users/></span><b>{visibleCount}</b><small>{isAdminPreview?'Tác phẩm trong hệ thống':'Tác phẩm đã công bố'}</small></div>
            <div><span><BookOpen/></span><b>Câu chuyện</b><small>Góc nhìn cộng đồng</small></div>
            <div><span><ImageIcon/></span><b>4 loại hình</b><small>Ảnh · Video · Story · Art</small></div>
          </div>
        </div>

        <div className="theme-hero-visual">
          <div className="theme-hero-image-wrap">{theme.image?<img src={theme.image} alt={theme.title}/>:<div className="theme-card-placeholder"/>}</div>
          <div className="theme-location-card"><MapPin/><div><b>{theme.locationLabel||'Hòa Lạc'}</b><small>HÒA LẠC, HÀ NỘI</small></div></div>
          <div className="theme-hero-note">Hòa Lạc<br/>hôm nay<br/>và mai sau...<i/></div>
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
            <div className="theme-kicker"><span>{isAdminPreview?'BẢN XEM TRƯỚC QUẢN TRỊ':'TÁC PHẨM ĐÃ CÔNG BỐ'}</span><i/></div>
            <h2>Tác phẩm thuộc {theme.title}</h2>
            <p>{isAdminPreview
              ? 'Bạn đang đăng nhập quản trị nên có thể xem cả tác phẩm đang chờ duyệt, shortlist và dữ liệu mẫu. Khách truy cập bình thường vẫn chỉ thấy tác phẩm thực đã được công bố.'
              : 'Dữ liệu lấy trực tiếp từ các tác phẩm TOP52/đạt giải đã được công bố trong hệ thống.'}</p>
          </div>
          <div className="theme-related-actions"><Link className="theme-view-all" to="/top52">Xem TOP52 <ArrowRight/></Link></div>
        </header>

        {isAdminPreview&&<div className="theme-admin-preview"><Eye/><div><b>Chế độ xem trước Admin đang bật.</b><br/>Các thẻ có thể gồm dữ liệu DEMO hoặc tác phẩm chưa công bố. Nhấp thẻ để mở trang chi tiết tác phẩm ở chế độ xem trước quản trị.</div></div>}

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
          related.length===0?<div className="jw-empty">{isAdminPreview?'Chưa có tác phẩm nào phù hợp bộ lọc.':'Chưa có tác phẩm công khai phù hợp bộ lọc.'}</div>:<>
            <div className="theme-related-grid theme-gallery-grid theme-gallery-visible">
              {related.map(a=><Link to={a.preview?('/tac-pham/xem-truoc/'+a.id):('/tac-pham/'+a.slug)} className={'theme-related-card'+(a.preview?' preview-card':'')} key={a.id||a.slug}>
                <div className="theme-related-media">
                  {a.image?<img loading="lazy" decoding="async" src={a.image} alt={a.title||a.code}/>:<div className="theme-card-placeholder"/>}
                  {a.preview&&<span className={'theme-preview-status'+(a.isDemo?' demo':'')}>{a.isDemo?'MẪU · ':''}{previewStatusLabel[a.status]||a.status}</span>}
                  <span className="theme-top52-badge">{a.preview?(previewStatusLabel[a.status]||a.status):(a.status==='AWARDED'?'ĐẠT GIẢI':'TOP52')}</span>
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
