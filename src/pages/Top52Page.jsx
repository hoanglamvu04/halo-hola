import { useState } from 'react'
import { Grid2X2, BookOpen, Map, SlidersHorizontal } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import ArtworkCard from '../components/ArtworkCard.jsx'
import { artworks, stories, img } from '../data/siteData.js'

export default function Top52Page(){
 const [filter,setFilter]=useState('Tất cả')
 const filters=['Tất cả','Nét Đoài','Sắc Mường','Kiến trúc','Hòa Lạc xanh','Nắng Hòa Lạc','Ước mơ']
 const shown=filter==='Tất cả'?artworks:artworks.filter(a=>a.theme.includes(filter))
 return <main><PageHero eyebrow="TRIỂN LÃM CỘNG ĐỒNG" title="TOP52" accent="52 góc nhìn · 1 Hòa Lạc" desc="Mỗi khung hình, mỗi câu chuyện là một lát cắt chân thật và đầy cảm xúc về Hòa Lạc hôm nay." image={img.student}><div className="actions"><button className="btn btn-green"><Grid2X2 size={17}/> Gallery</button><button className="btn btn-outline"><BookOpen size={17}/> Stories</button><button className="btn btn-outline"><Map size={17}/> Map</button></div></PageHero>
 <section className="container section"><div className="gallery-filters"><div><SlidersHorizontal size={18}/><b>Chủ đề</b>{filters.map(f=><button className={filter===f?'active':''} key={f} onClick={()=>setFilter(f)}>{f}</button>)}</div><div><b>Sắc màu</b>{['#9c643d','#efb54f','#405c36','#9cbd58','#dccdaf','#5d8aaa'].map(c=><i key={c} style={{background:c}}/>)}</div></div>
 <div className="art-grid top52-grid">{shown.map((a,i)=><ArtworkCard key={a.slug} item={a} featured={i===3}/>)}</div></section>
 <section className="section story-band"><div className="container"><div className="section-heading"><div><span className="eyebrow">CÂU CHUYỆN CỘNG ĐỒNG</span><h2>Câu chuyện phía sau</h2></div><p>Mỗi tác phẩm không chỉ là một khoảnh khắc đẹp, mà còn là một câu chuyện về Hòa Lạc.</p></div><div className="story-grid">{stories.map(s=><article className="story-card" key={s.title}><img src={s.image}/><div><span className="eyebrow">STORIES</span><h3>{s.title}</h3><small>{s.author}</small><p>{s.excerpt}</p><a href="#">Đọc thêm →</a></div></article>)}</div></div></section>
 </main>
}
