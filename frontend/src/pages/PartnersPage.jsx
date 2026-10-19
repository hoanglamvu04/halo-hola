import { useEffect, useState } from 'react'
import { Diamond, Medal, Handshake, Sprout, ArrowRight, ExternalLink, ShieldCheck, PackageOpen, Building2, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { img } from '../data/siteData.js'
import { getPartners } from '../services/api.js'

const tiers=[
  {name:'Kim cương',price:'100.000.000đ',Icon:Diamond,featured:true},
  {name:'Vàng',price:'50.000.000đ',Icon:Medal},
  {name:'Bạc',price:'30.000.000đ',Icon:Medal},
  {name:'Đồng hành',price:'10.000.000đ',Icon:Handshake},
  {name:'Hỗ trợ',price:'< 10 triệu',Icon:Sprout}
]

const principles=[
  ['01','Editorial độc lập','Đối tác đồng hành bằng nguồn lực; Ban Biên tập quyết định câu chuyện, hình ảnh, câu chữ và cách trình bày.'],
  ['02','Nhận diện vừa đủ','Logo đối tác không lấn át HALO HOLA và trải nghiệm câu chuyện.'],
  ['03','Tôn trọng dữ liệu','Không chia sẻ dữ liệu cá nhân của người đóng góp, nhân vật và người tham dự trái phạm vi cho phép.'],
  ['04','Chất lượng trước số lượng','Không đánh đổi chất lượng câu chuyện để lấy quyền lợi thương mại hay lấp đủ con số 52.']
]

export default function PartnersPage(){
  const [partners,setPartners]=useState([])
  useEffect(()=>{getPartners().then(setPartners).catch(()=>{})},[])

  return <main className="partners-page-modern">
    <section className="partners-hero-modern">
      <div className="container partners-hero-grid">
        <div className="partners-hero-copy">
          <span className="eyebrow">HỆ ĐỐI TÁC · HALO HOLA 2026</span>
          <h1>Cùng tìm và kể <em>câu chuyện Hòa Lạc</em></h1>
          <p>Chuyên gia, CLB, trường học, địa phương và doanh nghiệp có thể đồng hành bằng câu chuyện, nhân vật, địa điểm, tư liệu, chuyên môn, không gian hoặc nguồn lực — trong khi quyền quyết định editorial vẫn thuộc Ban Biên tập HALO HOLA.</p>
          <div className="partners-hero-actions">
            <a href="#hang-dong-hanh" className="partner-btn partner-btn-primary">Xem các hạng đồng hành <ArrowRight/></a>
            {partners.length>0&&<a href="#doi-tac" className="partner-btn partner-btn-light">Đối tác hiện tại</a>}
          </div>
          <div className="partners-hero-facts">
            <div><b>05</b><span>Hạng đồng hành</span></div>
            <div><PackageOpen/><span>Câu chuyện · chuyên môn · nguồn lực</span></div>
            <div><ShieldCheck/><span>Giữ độc lập editorial</span></div>
          </div>
        </div>

        <div className="partners-hero-visual">
          <img src={img.event} alt="Cộng đồng HALO HOLA"/>
          <div className="partners-hero-shade"/>
          <div className="partners-hero-card">
            <span>HALO HOLA 2026</span>
            <b>Đồng hành đúng cách.<br/>Giúp câu chuyện được kể tốt hơn.</b>
            <p>Đối tác không mua quyền can thiệp nội dung; đối tác tạo điều kiện để team đi xa hơn, gặp đúng người hơn và lưu giữ tư liệu tốt hơn.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="partners-intro-strip">
      <div className="container partners-intro-grid">
        <div><Building2/><b>Địa điểm & câu chuyện</b><span>Giới thiệu nhân vật, công trình, nơi chốn và không gian đáng khám phá</span></div>
        <div><PackageOpen/><b>Hậu cần & sản xuất</b><span>Thiết bị, di chuyển, in ấn, Calendar, triển lãm và HOLA DAY</span></div>
        <div><Handshake/><b>Nguồn lực</b><span>Tài chính, chuyên môn, kết nối và truyền thông phù hợp</span></div>
      </div>
    </section>

    <section id="hang-dong-hanh" className="partners-tier-section">
      <div className="container">
        <header className="partners-section-head">
          <div><span className="eyebrow">CÁC HẠNG ĐỒNG HÀNH</span><h2>Chọn mức đồng hành phù hợp</h2></div>
          <p>Đóng góp có thể bằng tài chính hoặc quy đổi tương đương bằng địa điểm, hậu cần, vật phẩm, dịch vụ và nguồn lực sản xuất.</p>
        </header>

        <div className="partners-tier-grid">
          {tiers.map(({name,price,Icon,featured},index)=><article className={'partner-tier-card '+(featured?'is-featured':'')} key={name}>
            <div className="partner-tier-top"><span className="partner-tier-icon"><Icon/></span><span className="partner-tier-index">0{index+1}</span></div>
            <div className="partner-tier-body">
              <span className="partner-tier-label">HẠNG ĐỒNG HÀNH</span><h3>{name}</h3><strong>{price}</strong>
              <p>Hiện diện tại các điểm chạm phù hợp của HALO HOLA, Calendar và HOLA DAY 2026.</p>
            </div>
            <div className="partner-tier-meta"><CheckCircle2/><span>Tài chính hoặc nguồn lực quy đổi tương đương</span></div>
          </article>)}
        </div>
      </div>
    </section>

    {partners.length>0&&<section id="doi-tac" className="partners-live-section">
      <div className="container">
        <header className="partners-section-head partners-section-head-light">
          <div><span className="eyebrow">ĐỐI TÁC ĐỒNG HÀNH</span><h2>Những đơn vị đang cùng HALO HOLA tìm và kể Hòa Lạc</h2></div>
          <p>Danh sách được cập nhật trực tiếp từ hệ thống quản trị.</p>
        </header>
        <div className="partners-live-grid-modern">
          {partners.map(p=><a key={p.id} className="partner-live-card-modern" href={p.website||'#'} target={p.website?'_blank':undefined} rel={p.website?'noreferrer':undefined}>
            <div className="partner-live-logo-modern">{p.logo?<img src={p.logo} alt={p.name}/>:<Handshake/>}</div>
            <div className="partner-live-copy-modern"><span>{p.tier}</span><h3>{p.name}</h3><p>{p.description}</p></div>
            {p.website&&<small>Xem website <ExternalLink/></small>}
          </a>)}
        </div>
      </div>
    </section>}

    <section className="partners-principles-section">
      <div className="container partners-principles-grid">
        <div className="partners-principles-copy">
          <span className="eyebrow">NGUYÊN TẮC ĐỒNG HÀNH</span>
          <h2>Thương hiệu hiện diện,<br/>editorial vẫn độc lập.</h2>
          <p>HALO HOLA ưu tiên quan hệ hợp tác minh bạch và không để sponsor can thiệp vào việc lựa chọn, biên tập hay cách kể câu chuyện.</p>
        </div>
        <div className="partners-principles-list">
          {principles.map(([num,title,desc])=><div className="partner-principle-row" key={num}><span>{num}</span><div><b>{title}</b><p>{desc}</p></div></div>)}
        </div>
      </div>
    </section>

    <section className="partners-final-cta">
      <div className="container partners-final-card">
        <div><span className="eyebrow">HALO HOLA 2026</span><h2>Cùng góp nguồn lực để những câu chuyện Hòa Lạc được tìm thấy.</h2></div>
        <div className="partners-final-actions">
          <a href="#hang-dong-hanh" className="partner-btn partner-btn-primary">Xem hạng đồng hành <ArrowRight/></a>
          <Link to="/calendar-2027" className="partner-btn partner-btn-light">Calendar 2027</Link>
        </div>
      </div>
    </section>
  </main>
}
