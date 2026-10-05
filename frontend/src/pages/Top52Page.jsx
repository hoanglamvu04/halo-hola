import { useEffect, useMemo, useState } from 'react'
import { Grid2X2, BookOpen, Map, SlidersHorizontal } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import ArtworkCard from '../components/ArtworkCard.jsx'
import { Link } from 'react-router-dom'
import { getPublicArtworks, getStories, getThemes } from '../services/api.js'
import { normalizeStory } from '../utils/contentAdapters.js'

export default function Top52Page(){
 const [filter,setFilter]=useState('Tất cả')
 const [artworks,setArtworks]=useState([])
 const [themes,setThemes]=useState([])
 const [stories,setStories]=useState([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 useEffect(()=>{
   setLoading(true);setError('')
   Promise.all([getPublicArtworks({limit:52}),getThemes(),getStories()])
     .then(([works,themeRows,storyRows])=>{setArtworks(Array.isArray(works)?works:[]);setThemes(Array.isArray(themeRows)?themeRows:[]);setStories((storyRows||[]).map(normalizeStory))})
     .catch(err=>setError(err.message)).finally(()=>setLoading(false))
 },[])
 const shown=useMemo(()=>filter==='Tất cả'?artworks:artworks.filter(a=>a.theme===filter),[artworks,filter])
 const heroImage=artworks.find(a=>a.image)?.image||themes.find(t=>t.image)?.image||''
 return <main><PageHero eyebrow="TRIỂN LÃM CỘNG ĐỒNG" title="TOP52" accent="52 góc nhìn · 1 Hòa Lạc" desc="Mỗi khung hình, mỗi câu chuyện là một lát cắt chân thật và đầy cảm xúc về Hòa Lạc hôm nay." image={heroImage}><div className="actions"><button className="btn btn-green"><Grid2X2 size={17}/> Gallery</button><button className="btn btn-outline"><BookOpen size={17}/> Stories</button><button className="btn btn-outline"><Map size={17}/> Map</button></div></PageHero>
 <section className="container section"><div className="gallery-filters"><div><SlidersHorizontal size={18}/><b>Chủ đề</b><button className={filter==='Tất cả'?'active':''} onClick={()=>setFilter('Tất cả')}>Tất cả</button>{themes.map(t=><button className={filter===t.title?'active':''} key={t.slug} onClick={()=>setFilter(t.title)}>{t.title}</button>)}</div></div>
 {loading&&<div className="jw-empty">Đang tải TOP52 từ hệ thống...</div>}
 {error&&<div className="form-error">{error}</div>}
 {!loading&&!error&&shown.length===0&&<div className="jw-empty">Chưa có tác phẩm TOP52 được công bố.</div>}
 <div className="art-grid top52-grid">{shown.map((a,i)=><ArtworkCard key={a.id||a.slug} item={a} featured={i===3}/>)}</div></section>
 {stories.length>0&&<section className="section story-band"><div className="container"><div className="section-heading"><div><span className="eyebrow">CÂU CHUYỆN CỘNG ĐỒNG</span><h2>Câu chuyện phía sau</h2></div><p>Mỗi tác phẩm không chỉ là một khoảnh khắc đẹp, mà còn là một câu chuyện về Hòa Lạc.</p></div><div className="story-grid">{stories.slice(0,4).map(s=><article className="story-card" key={s.slug}><img src={s.image} alt={s.title}/><div><span className="eyebrow">STORIES</span><h3>{s.title}</h3><small>{s.author}</small><p>{s.excerpt}</p><Link to={'/stories/'+s.slug}>Đọc thêm →</Link></div></article>)}</div></div></section>}
 </main>
}
