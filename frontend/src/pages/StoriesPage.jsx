import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Clock3, BookOpen, Heart, Users, Leaf } from 'lucide-react'
import { getStories } from '../services/api.js'
import { normalizeStory } from '../utils/contentAdapters.js'

export default function StoriesPage(){
  const [stories,setStories]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{
    setLoading(true);setError('')
    getStories().then(data=>setStories((data||[]).map(normalizeStory))).catch(err=>setError(err.message)).finally(()=>setLoading(false))
  },[])
  const featured=stories.find(s=>s.featured)||stories[0]
  const rest=featured?stories.filter(s=>s.slug!==featured.slug):[]

  return <main className="stories-page-ref">
    <section className="stories-intro-ref">
      <div className="stories-contours"/>
      <div className="stories-intro-inner">
        <div>
          <div className="stories-kicker"><span>CÂU CHUYỆN HÒA LẠC</span><i/></div>
          <h1>Stories</h1>
          <h2>Những điều đáng được kể</h2>
        </div>
        <div className="stories-intro-side">
          <p>Con người, nơi chốn, ký ức và những đổi thay đang diễn ra từng ngày ở Hòa Lạc.</p>
          <div className="stories-intro-stats">
            <span><BookOpen/> {stories.length} câu chuyện</span>
            <span><Users/> Góc nhìn cộng đồng</span>
            <span><Leaf/> Hòa Lạc 2026</span>
          </div>
        </div>
      </div>
    </section>

    {loading&&<div className="jw-empty">Đang tải Stories từ hệ thống...</div>}
    {error&&<div className="form-error">{error}</div>}
    {!loading&&!error&&!featured&&<div className="jw-empty">Chưa có câu chuyện nào được xuất bản.</div>}

    {featured&&<section className="stories-feature-ref">
      <div className="stories-feature-inner">
        <Link className="stories-feature-image" to={'/stories/'+featured.slug}>
          {featured.cover||featured.image?<img src={featured.cover||featured.image} alt={featured.title}/>:<div className="theme-card-placeholder"/>}
          <span className="stories-feature-badge">FEATURED STORY</span>
        </Link>

        <div className="stories-feature-copy">
          <span className="eyebrow">FEATURED STORY</span>
          <h2>{featured.title}</h2>
          <p className="stories-feature-lead">{featured.excerpt}</p>
          <div className="stories-feature-meta">
            <span><MapPin/> {featured.location}</span>
            <span><Clock3/> {featured.readTime}</span>
          </div>
          <p className="stories-feature-author">Bởi <b>{featured.author}</b> · {featured.date}</p>
          <Link className="stories-read-link" to={'/stories/'+featured.slug}>Đọc câu chuyện <ArrowRight/></Link>
        </div>
      </div>
    </section>}

    {rest.length>0&&<section className="stories-list-ref">
      <div className="stories-list-inner">
        <header className="stories-list-head">
          <div>
            <div className="stories-kicker"><span>NHỮNG CÂU CHUYỆN KHÁC</span><i/></div>
            <h2>Khám phá Hòa Lạc qua nhiều lớp góc nhìn</h2>
          </div>
          <p>Mỗi câu chuyện là một lát cắt: văn hóa, thiên nhiên, kiến trúc, con người, tuổi trẻ và những chuyển động mới.</p>
        </header>

        <div className="stories-grid-ref">
          {rest.map((s,index)=><Link className="story-card-ref" to={'/stories/'+s.slug} key={s.slug}>
            <div className="story-card-media">
              {s.image?<img src={s.image} alt={s.title}/>:<div className="theme-card-placeholder"/>}
              <span className="story-card-heart"><Heart/></span>
              <span className="story-card-index">{String(index+2).padStart(2,'0')}</span>
            </div>
            <div className="story-card-copy">
              <span className="story-card-category">{s.category}</span>
              <h3>{s.title}</h3>
              <p>{s.excerpt}</p>
              <div className="story-card-author">
                <span>{s.author?.charAt(0)}</span>
                <div><b>{s.author}</b><small>{s.role}</small></div>
              </div>
              <div className="story-card-bottom">
                <span><MapPin/> {s.location}</span>
                <span><Clock3/> {s.readTime}</span>
              </div>
            </div>
          </Link>)}
        </div>
      </div>
    </section>}
  </main>
}
