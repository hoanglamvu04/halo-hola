import { useEffect, useState } from 'react'
import {
  ArrowRight, BookOpen, Building2, CheckCircle2, ExternalLink, Handshake,
  MapPin, Megaphone, PackageOpen, ShieldCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { img } from '../data/siteData.js'
import { getPartners } from '../services/api.js'

const collaborationWays=[
  {
    name:'Không gian & địa điểm',
    label:'MỞ CỬA MỘT NƠI CHỐN',
    text:'Cùng mở những địa điểm có câu chuyện, không gian trải nghiệm, triển lãm, workshop hoặc điểm gặp cộng đồng.',
    examples:'Địa điểm · không gian sự kiện · điểm chụp · điểm trải nghiệm',
    Icon:MapPin
  },
  {
    name:'Chuyên môn & tư liệu',
    label:'GÓP THÊM CHIỀU SÂU',
    text:'Chia sẻ kiến thức, dữ liệu, ký ức, nhân vật, tài liệu và góc nhìn chuyên môn để những câu chuyện Hòa Lạc được kể chính xác hơn.',
    examples:'Chuyên gia · tư liệu · lịch sử · kiến trúc · giáo dục · công nghệ',
    Icon:BookOpen
  },
  {
    name:'Hậu cần & trải nghiệm',
    label:'GIÚP MỘT HOẠT ĐỘNG DIỄN RA',
    text:'Đồng hành bằng thiết bị, in ấn, di chuyển, vật phẩm, dịch vụ hoặc những nguồn lực cụ thể cho HOLA Tour, HOLA DAY và hoạt động cộng đồng.',
    examples:'Thiết bị · in ấn · vận chuyển · dịch vụ · vật phẩm',
    Icon:PackageOpen
  },
  {
    name:'Kết nối & lan tỏa',
    label:'ĐƯA CÂU CHUYỆN ĐẾN ĐÚNG NGƯỜI',
    text:'Kết nối trường học, doanh nghiệp, cộng đồng, người dân và các kênh truyền thông để nhiều góc nhìn Hòa Lạc được tìm thấy và đóng góp hơn.',
    examples:'Cộng đồng · trường học · doanh nghiệp · truyền thông · mạng lưới',
    Icon:Megaphone
  }
]

const principles=[
  ['01','Độc lập biên tập','Đối tác không can thiệp vào cách HALO HOLA biên tập, lựa chọn hay kể một câu chuyện.'],
  ['02','Hiện diện vừa đủ','Thương hiệu xuất hiện đúng điểm chạm, không lấn át người kể chuyện và nội dung cộng đồng.'],
  ['03','Tôn trọng dữ liệu','Thông tin cá nhân của người tham gia không được chia sẻ cho bên thứ ba nếu chưa có sự đồng ý.'],
  ['04','Đồng hành có ích','Mỗi nguồn lực cần gắn với một nhu cầu thực tế và tạo ra giá trị nhìn thấy được cho Hòa Lạc.']
]

export default function PartnersPage(){
  const [partners,setPartners]=useState([])
  useEffect(()=>{getPartners().then(setPartners).catch(()=>{})},[])

  return <main className="partners-page-modern">
    <section className="partners-hero-modern">
      <div className="container partners-hero-grid">
        <div className="partners-hero-copy">
          <span className="eyebrow">ĐỒNG HÀNH CÙNG HALO HOLA</span>
          <h1>Cùng làm <em>Hòa Lạc được kể tốt hơn</em></h1>
          <p>HALO HOLA tìm kiếm những đơn vị và cộng đồng muốn góp một phần thiết thực cho hành trình lưu giữ Hòa Lạc — bằng không gian, chuyên môn, hậu cần, kết nối hoặc nguồn lực phù hợp.</p>
          <div className="partners-hero-actions">
            <a href="#cach-dong-hanh" className="partner-btn partner-btn-primary">Xem cách đồng hành <ArrowRight/></a>
            <a href="mailto:admin@xspace.vn" className="partner-btn partner-btn-light">Trao đổi với HALO HOLA</a>
          </div>
          <div className="partners-hero-facts">
            <div><b>04</b><span>Cách đồng hành</span></div>
            <div><Handshake/><span>Cùng làm theo nhu cầu thực tế</span></div>
            <div><ShieldCheck/><span>Giữ độc lập biên tập</span></div>
          </div>
        </div>

        <div className="partners-hero-visual">
          <img src={img.event} alt="Cộng đồng HALO HOLA"/>
          <div className="partners-hero-shade"/>
          <div className="partners-hero-card">
            <span>HALO HOLA 2026</span>
            <b>Một nguồn lực đúng chỗ<br/>có thể mở ra một câu chuyện mới.</b>
            <p>Không cần bắt đầu bằng một gói tài trợ. Hãy bắt đầu từ điều bạn có thể đóng góp thật sự cho cộng đồng.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="partners-intro-strip">
      <div className="container partners-intro-grid">
        <div><MapPin/><b>Địa điểm</b><span>Mở một nơi chốn có câu chuyện</span></div>
        <div><BookOpen/><b>Chuyên môn</b><span>Góp dữ liệu, ký ức và tri thức</span></div>
        <div><Handshake/><b>Kết nối</b><span>Đưa người và nguồn lực đến đúng việc</span></div>
      </div>
    </section>

    <section id="cach-dong-hanh" className="partners-tier-section">
      <div className="container">
        <header className="partners-section-head">
          <div>
            <span className="eyebrow">CÁCH ĐỒNG HÀNH</span>
            <h2>Bạn có thể góp điều gì?</h2>
          </div>
          <p>Một đơn vị có thể tham gia theo một hoặc nhiều cách. HALO HOLA ưu tiên những đề xuất cụ thể, vừa sức và gắn với nhu cầu thật của hoạt động.</p>
        </header>

        <div className="partners-tier-grid">
          {collaborationWays.map(({name,label,text,examples,Icon},index)=><article className="partner-tier-card" key={name}>
            <div className="partner-tier-top">
              <span className="partner-tier-icon"><Icon/></span>
              <span className="partner-tier-index">0{index+1}</span>
            </div>
            <div className="partner-tier-body">
              <span className="partner-tier-label">{label}</span>
              <h3>{name}</h3>
              <p>{text}</p>
            </div>
            <div className="partner-tier-meta"><CheckCircle2/><span>{examples}</span></div>
          </article>)}
        </div>
      </div>
    </section>

    {partners.length>0&&<section id="doi-tac" className="partners-live-section">
      <div className="container">
        <header className="partners-section-head partners-section-head-light">
          <div><span className="eyebrow">ĐANG CÙNG ĐỒNG HÀNH</span><h2>Những đơn vị đang góp một phần cho hành trình</h2></div>
          <p>Mỗi đơn vị xuất hiện ở đây theo đúng vai trò và đóng góp thực tế của mình.</p>
        </header>
        <div className="partners-live-grid-modern">
          {partners.map(p=><a key={p.id} className="partner-live-card-modern" href={p.website||'#'} target={p.website?'_blank':undefined} rel={p.website?'noreferrer':undefined}>
            <div className="partner-live-logo-modern">{p.logo?<img src={p.logo} alt={p.name}/>:<Handshake/>}</div>
            <div className="partner-live-copy-modern"><span>{p.tier||'Đồng hành'}</span><h3>{p.name}</h3><p>{p.description}</p></div>
            {p.website&&<small>Xem website <ExternalLink/></small>}
          </a>)}
        </div>
      </div>
    </section>}

    <section className="partners-principles-section">
      <div className="container partners-principles-grid">
        <div className="partners-principles-copy">
          <span className="eyebrow">NGUYÊN TẮC ĐỒNG HÀNH</span>
          <h2>Cùng góp nguồn lực,<br/>không làm mất tiếng nói cộng đồng.</h2>
          <p>HALO HOLA giữ một ranh giới rõ ràng giữa việc đồng hành nguồn lực và quyết định biên tập để câu chuyện vẫn thuộc về người kể và vùng đất.</p>
        </div>
        <div className="partners-principles-list">
          {principles.map(([num,title,desc])=><div className="partner-principle-row" key={num}>
            <span>{num}</span><div><b>{title}</b><p>{desc}</p></div>
          </div>)}
        </div>
      </div>
    </section>

    <section className="partners-final-cta">
      <div className="container partners-final-card">
        <div><span className="eyebrow">CÓ MỘT Ý TƯỞNG PHÙ HỢP?</span><h2>Hãy bắt đầu bằng một cuộc trao đổi ngắn.</h2><p>Cho HALO HOLA biết bạn có thể góp gì, ở đâu và cho hoạt động nào. Chúng tôi sẽ cùng tìm cách phù hợp nhất.</p></div>
        <div className="partners-final-actions">
          <a href="mailto:admin@xspace.vn" className="partner-btn partner-btn-primary">Liên hệ đồng hành <ArrowRight/></a>
          <Link to="/chien-dich" className="partner-btn partner-btn-light">Xem chiến dịch cộng đồng</Link>
        </div>
      </div>
    </section>
  </main>
}
