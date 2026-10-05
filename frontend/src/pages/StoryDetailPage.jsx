import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, MapPin, Clock3, CalendarDays, Quote, Share2,
  Heart, BookOpen, UserRound, Image as ImageIcon
} from 'lucide-react'
import { getStoryBySlug, getStories } from '../services/api.js'
import { normalizeStory } from '../utils/contentAdapters.js'

export default function StoryDetailPage(){
  const {slug}=useParams()
  const [story,setStory]=useState(null)
  const [related,setRelated]=useState([])
  const [saved,setSaved]=useState(false)
  const [shareLabel,setShareLabel]=useState('Chia sẻ')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    let alive=true
    setLoading(true);setError('')
    Promise.all([getStoryBySlug(slug),getStories()]).then(([detail,rows])=>{
      if(!alive)return
      const normalized=normalizeStory(detail)
      setStory(normalized)
      setRelated((rows||[]).map(normalizeStory).filter(s=>s.slug!==slug).slice(0,3))
    }).catch(err=>{if(alive)setError(err.message)}).finally(()=>{if(alive)setLoading(false)})
    return()=>{alive=false}
  },[slug])

  useEffect(()=>{
    if(!story?.slug)return
    try{setSaved(localStorage.getItem('halo-story-'+story.slug)==='1')}catch{setSaved(false)}
  },[story?.slug])

  const toggleSaved=()=>{
    if(!story)return
    const next=!saved
    setSaved(next)
    try{localStorage.setItem('halo-story-'+story.slug,next?'1':'0')}catch{}
  }

  const shareStory=async()=>{
    if(!story)return
    const url=window.location.href
    try{
      if(navigator.share){
        await navigator.share({title:story.title,text:story.excerpt,url})
      }else{
        await navigator.clipboard.writeText(url)
        setShareLabel('Đã sao chép')
        setTimeout(()=>setShareLabel('Chia sẻ'),1800)
      }
    }catch{}
  }

  if(loading)return <main className="story-detail-page"><div className="jw-empty">Đang tải câu chuyện từ hệ thống...</div></main>
  if(error||!story)return <main className="story-detail-page"><div className="container section"><div className="form-error">{error||'Không tìm thấy câu chuyện.'}</div><Link className="btn btn-outline" to="/stories"><ArrowLeft/> Stories</Link></div></main>

  const body=Array.isArray(story.body)?story.body:[]
  const gallery=Array.isArray(story.gallery)?story.gallery:[]

  return <main className="story-detail-page">
    <section className="story-detail-hero">
      <div className="story-detail-contours"/>
      <div className="story-detail-hero-inner">
        <div className="story-detail-copy">
          <Link className="story-back-link" to="/stories"><ArrowLeft/> Stories</Link>
          <span className="story-detail-category">{story.category}</span>
          <h1>{story.title}</h1>
          <p className="story-detail-lead">{story.lead}</p>

          <div className="story-detail-meta">
            <span><UserRound/> {story.author}</span>
            <span><MapPin/> {story.location}</span>
            <span><CalendarDays/> {story.date}</span>
            <span><Clock3/> {story.readTime}</span>
          </div>
        </div>

        <div className="story-detail-cover">
          {story.cover||story.image?<img src={story.cover||story.image} alt={story.title}/>:<div className="theme-card-placeholder"/>}
          <div className="story-detail-cover-tag">HALO HOLA STORIES</div>
          <div className="story-detail-note">Một góc nhìn<br/>Một câu chuyện<br/>Một Hòa Lạc</div>
        </div>
      </div>
    </section>

    <section className="story-detail-content">
      <div className="story-detail-content-inner">
        <aside className="story-detail-side">
          <div className="story-author-card">
            <div className="story-author-avatar">{story.author?.charAt(0)}</div>
            <div>
              <small>NGƯỜI KỂ CHUYỆN</small>
              <b>{story.author}</b>
              <span>{story.role}</span>
            </div>
          </div>

          <div className="story-side-actions">
            <button className={saved?'active':''} onClick={toggleSaved}><Heart fill={saved?'currentColor':'none'}/> {saved?'Đã lưu':'Lưu câu chuyện'}</button>
            <button onClick={shareStory}><Share2/> {shareLabel}</button>
          </div>

          {body.length>0&&<div className="story-side-index">
            <small>TRONG BÀI VIẾT</small>
            {body.map((section,index)=><a href={'#story-section-'+index} key={section.heading||index}>
              {String(index+1).padStart(2,'0')} · {section.heading}
            </a>)}
          </div>}
        </aside>

        <article className="story-article">
          <div className="story-opening">
            <span className="story-dropcap">{story.lead?.charAt(0)}</span>
            <p>{story.lead?.slice(1)}</p>
          </div>

          {story.quote&&<blockquote className="story-quote"><Quote/><p>{story.quote}</p></blockquote>}

          {body.length>0?body.map((section,index)=><section id={'story-section-'+index} className="story-article-section" key={section.heading||index}>
            <span className="story-section-no">{String(index+1).padStart(2,'0')}</span>
            <h2>{section.heading}</h2>
            {(section.paragraphs||[]).map((p,i)=><p key={i}>{p}</p>)}
            {index===0 && gallery[0] && <figure className="story-inline-image"><img src={gallery[0]} alt={section.heading}/><figcaption>Hòa Lạc qua góc nhìn của người kể chuyện.</figcaption></figure>}
          </section>):<section className="story-article-section"><p>{story.content}</p></section>}

          {gallery.length>1 && <section className="story-gallery-section">
            <div className="story-gallery-title"><ImageIcon/><span>Góc nhìn trong câu chuyện</span></div>
            <div className="story-gallery-grid">{gallery.slice(1).map((image,index)=><img src={image} alt={story.title+' '+(index+2)} key={image+index}/>)}</div>
          </section>}

          <div className="story-article-end">
            <BookOpen/>
            <h3>Mỗi câu chuyện là một lát cắt của Hòa Lạc</h3>
            <p>HALO HOLA lưu lại những góc nhìn từ cộng đồng để cùng nhau nhìn thấy một vùng đất đang chuyển mình qua nhiều thế hệ, không gian và trải nghiệm.</p>
            <Link className="btn btn-terra" to="/gui-goc-nhin">Gửi góc nhìn của bạn <ArrowRight/></Link>
          </div>
        </article>
      </div>
    </section>

    {related.length>0&&<section className="story-related-ref">
      <div className="story-related-inner">
        <header><div><span className="eyebrow">ĐỌC TIẾP</span><h2>Những câu chuyện liên quan</h2></div><Link className="stories-read-link" to="/stories">Xem tất cả Stories <ArrowRight/></Link></header>
        <div className="story-related-grid">
          {related.map(s=><Link className="story-related-card" to={'/stories/'+s.slug} key={s.slug}>
            {s.image?<img src={s.image} alt={s.title}/>:<div className="theme-card-placeholder"/>}
            <div><span>{s.category}</span><h3>{s.title}</h3><p>{s.excerpt}</p><small>{s.author} · {s.readTime}</small></div>
          </Link>)}
        </div>
      </div>
    </section>}
  </main>
}
