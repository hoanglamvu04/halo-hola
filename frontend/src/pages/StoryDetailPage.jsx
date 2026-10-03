import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, MapPin, Clock3, CalendarDays, Quote, Share2,
  Heart, BookOpen, UserRound, Image as ImageIcon
} from 'lucide-react'
import { stories } from '../data/siteData.js'

export default function StoryDetailPage(){
  const {slug}=useParams()
  const story=stories.find(s=>s.slug===slug) || stories[0]
  const related=stories.filter(s=>s.slug!==story.slug).slice(0,3)

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
          <img src={story.cover||story.image} alt={story.title}/>
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
            <button><Heart/> Lưu câu chuyện</button>
            <button><Share2/> Chia sẻ</button>
          </div>

          <div className="story-side-index">
            <small>TRONG BÀI VIẾT</small>
            {story.body.map((section,index)=><a href={'#story-section-'+index} key={section.heading}>
              {String(index+1).padStart(2,'0')} · {section.heading}
            </a>)}
          </div>
        </aside>

        <article className="story-article">
          <div className="story-opening">
            <span className="story-dropcap">{story.lead?.charAt(0)}</span>
            <p>{story.lead?.slice(1)}</p>
          </div>

          <blockquote className="story-quote">
            <Quote/>
            <p>{story.quote}</p>
          </blockquote>

          {story.body.map((section,index)=><section id={'story-section-'+index} className="story-article-section" key={section.heading}>
            <span className="story-section-no">{String(index+1).padStart(2,'0')}</span>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
            {index===0 && story.gallery?.[0] && <figure className="story-inline-image">
              <img src={story.gallery[0]} alt={section.heading}/>
              <figcaption>Hòa Lạc qua góc nhìn của người kể chuyện.</figcaption>
            </figure>}
          </section>)}

          {story.gallery?.length>1 && <section className="story-gallery-section">
            <div className="story-gallery-title"><ImageIcon/><span>Góc nhìn trong câu chuyện</span></div>
            <div className="story-gallery-grid">
              {story.gallery.slice(1).map((image,index)=><img src={image} alt={story.title+' '+(index+2)} key={image}/>)}
            </div>
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

    <section className="story-related-ref">
      <div className="story-related-inner">
        <header>
          <div>
            <span className="eyebrow">ĐỌC TIẾP</span>
            <h2>Những câu chuyện liên quan</h2>
          </div>
          <Link className="stories-read-link" to="/stories">Xem tất cả Stories <ArrowRight/></Link>
        </header>

        <div className="story-related-grid">
          {related.map(s=><Link className="story-related-card" to={'/stories/'+s.slug} key={s.slug}>
            <img src={s.image} alt={s.title}/>
            <div>
              <span>{s.category}</span>
              <h3>{s.title}</h3>
              <p>{s.excerpt}</p>
              <small>{s.author} · {s.readTime}</small>
            </div>
          </Link>)}
        </div>
      </div>
    </section>
  </main>
}