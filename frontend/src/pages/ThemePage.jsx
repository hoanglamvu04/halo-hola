import { useParams, Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import ArtworkCard from '../components/ArtworkCard.jsx'
import { themes, artworks } from '../data/siteData.js'

export default function ThemePage(){
 const {slug}=useParams(); const theme=themes.find(t=>t.slug===slug)||themes[0]
 return <main><PageHero eyebrow={`CHỦ ĐỀ ${String(theme.id).padStart(2,'0')}`} title={theme.title} desc={theme.desc} image={theme.image}><Link className="btn btn-terra" to="/gui-goc-nhin">Gửi tác phẩm <ArrowRight size={16}/></Link></PageHero>
 <section className="container section theme-detail"><div><span className="eyebrow">GỢI Ý KHÁM PHÁ</span><h2>Nhìn Hòa Lạc qua một lớp câu chuyện riêng</h2><p>Chủ đề mở ra những góc nhìn từ con người, không gian, ký ức và sự chuyển mình của vùng đất. Người tham gia có thể tiếp cận bằng ảnh, video, story hoặc art & design theo thể lệ.</p></div><div className="theme-tip"><b>Gợi ý góc nhìn</b><p>Đi chậm, quan sát chi tiết, trò chuyện với người địa phương và ghi lại điều khiến bạn muốn Hòa Lạc giữ lại.</p></div></section>
 <section className="container section"><h2>Tác phẩm liên quan</h2><div className="art-grid compact">{artworks.slice(0,5).map(a=><ArtworkCard key={a.slug} item={a}/>)}</div></section></main>
}
