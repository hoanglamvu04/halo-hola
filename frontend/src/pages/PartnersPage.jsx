import { useEffect, useState } from 'react'
import { Diamond, Medal, Handshake, Sprout, ArrowRight, ExternalLink } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { img } from '../data/siteData.js'
import { getPartners } from '../services/api.js'

export default function PartnersPage(){
 const tiers=[['Kim cương','100.000.000đ',Diamond],['Vàng','50.000.000đ',Medal],['Bạc','30.000.000đ',Medal],['Đồng hành','10.000.000đ',Handshake],['Hỗ trợ','< 10 triệu',Sprout]]
 const [partners,setPartners]=useState([])
 useEffect(()=>{getPartners().then(setPartners).catch(()=>{})},[])

 return <main><PageHero eyebrow="HỒ SƠ MỜI HỢP TÁC" title="Cùng kể" accent="câu chuyện Hòa Lạc" desc="Đối tác được tôn vinh ở những điểm chạm phù hợp; tính độc lập của nội dung và tác giả được bảo vệ." image={img.event}><button className="btn btn-terra">Trở thành đối tác <ArrowRight size={16}/></button></PageHero>
 <section className="container section"><div className="section-heading"><div><span className="eyebrow">CÁC HẠNG ĐỒNG HÀNH</span><h2>Đồng hành theo cách phù hợp</h2></div><p>Đóng góp bằng tiền hoặc quy đổi tương đương bằng địa điểm, hậu cần, vật phẩm, dịch vụ.</p></div><div className="partner-tiers">{tiers.map(([n,p,I])=><div key={n}><I/><h3>{n}</h3><strong>{p}</strong><p>Hiện diện tại các điểm chạm phù hợp của HALO HOLA 2026.</p></div>)}</div></section>

 {partners.length>0&&<section className="paper-bg"><div className="container section"><div className="section-heading"><div><span className="eyebrow">ĐỐI TÁC ĐỒNG HÀNH</span><h2>Những đơn vị đang cùng HALO HOLA kể chuyện</h2></div><p>Dữ liệu được quản trị trực tiếp từ Admin CMS V2.</p></div><div className="partner-live-grid">{partners.map(p=><a key={p.id} href={p.website||'#'} target={p.website?'_blank':undefined} rel={p.website?'noreferrer':undefined}>
   <div className="partner-live-logo">{p.logo?<img src={p.logo} alt={p.name}/>:<Handshake/>}</div>
   <span>{p.tier}</span><h3>{p.name}</h3><p>{p.description}</p>{p.website&&<small>Xem website <ExternalLink/></small>}
 </a>)}</div></div></section>}

 <section className="paper-bg"><div className="container section"><h2>Nguyên tắc đồng hành</h2><div className="principle-grid"><div>Không can thiệp nội dung, kết quả và Hội đồng giám khảo.</div><div>Logo đối tác không lấn át HALO HOLA.</div><div>Không chia sẻ dữ liệu cá nhân người tham gia.</div><div>Không đánh đổi chất lượng tuyển chọn lấy quyền lợi thương mại.</div></div></div></section></main>
}
