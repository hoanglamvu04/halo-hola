import { ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { stories, img } from '../data/siteData.js'

export default function StoriesPage(){
 return <main><PageHero eyebrow="CÂU CHUYỆN HÒA LẠC" title="Stories" accent="Những điều đáng được kể" desc="Con người, nơi chốn, ký ức và những đổi thay đang diễn ra từng ngày ở Hòa Lạc." image={img.camera}/>
 <section className="container section story-feature"><img src={img.village}/><div><span className="eyebrow">FEATURED STORY</span><h2>Một Hòa Lạc đang lớn lên</h2><p>Những lớp ký ức Xứ Đoài, văn hóa Mường, cảnh quan tự nhiên đang đồng thời đón nhận tri thức, công nghệ, đô thị và những cộng đồng mới.</p><a className="text-link" href="#">Đọc câu chuyện <ArrowRight size={15}/></a></div></section>
 <section className="container section"><div className="story-grid large">{stories.concat(stories).map((s,i)=><article className="story-card" key={`${s.title}-${i}`}><img src={s.image}/><div><span className="eyebrow">STORIES</span><h3>{s.title}</h3><small>{s.author}</small><p>{s.excerpt}</p><a href="#">Đọc thêm →</a></div></article>)}</div></section></main>
}
