import { Leaf, Sparkles, Users, HeartHandshake, ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { img } from '../data/siteData.js'

export default function WeHolaPage(){
 const goals=[['Xanh hơn','Gìn giữ thiên nhiên, cảnh quan và môi trường',Leaf],['Đẹp hơn','Cùng chăm chút những không gian nhỏ của cộng đồng',Sparkles],['Kết nối hơn','Người cũ – người mới, cộng đồng – doanh nghiệp',Users],['Đáng sống hơn','Phát triển nhưng không đánh mất thiên nhiên, văn hóa và tình cảm vùng đất',HeartHandshake]]
 return <main><PageHero eyebrow="CỘNG ĐỒNG PHI LỢI NHUẬN" title="WE HOLA" accent="Chúng ta là Hòa Lạc" desc="Cùng nhau làm Hòa Lạc tốt đẹp hơn — bằng những việc nhỏ, cụ thể và có ích." image={img.people}><button className="btn btn-green">Tham gia WE HOLA <ArrowRight size={16}/></button></PageHero>
 <section className="container section"><div className="section-heading"><div><span className="eyebrow">WE HOLA HƯỚNG ĐẾN</span><h2>Một Hòa Lạc tốt đẹp hơn</h2></div><p>Không chỉ nói về một Hòa Lạc tốt đẹp — cùng nhau làm những việc thực tế.</p></div><div className="goal-grid">{goals.map(([t,d,I])=><div key={t}><I/><h3>{t}</h3><p>{d}</p></div>)}</div></section>
 <section className="paper-bg"><div className="container section action-story"><div><span className="eyebrow">WE HOLA ACTION</span><h2>100 người · 1 việc tốt cho Hòa Lạc</h2><p>Mỗi hoạt động chọn một vấn đề nhỏ nhưng thực tế và huy động cộng đồng cùng giải quyết.</p><div className="chip-wrap"><span>Trồng cây</span><span>Làm sạch không gian</span><span>Giữ một câu chuyện</span><span>Bản đồ cộng đồng</span><span>Hỗ trợ người yếu thế</span></div></div><img src={img.green}/></div></section>
 <section className="container section"><h2>Cùng địa phương · cùng làm</h2><div className="community-flow"><div><b>Địa phương</b><p>Đề xuất nhu cầu thực tế</p></div><span>→</span><div><b>WE HOLA</b><p>Kết nối ý tưởng, con người, nguồn lực</p></div><span>→</span><div><b>Cộng đồng</b><p>Cùng làm</p></div><span>→</span><div><b>Doanh nghiệp</b><p>Đồng hành nguồn lực</p></div></div></section></main>
}
