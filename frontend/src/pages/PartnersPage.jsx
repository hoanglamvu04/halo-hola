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
  ['01','Nội dung độc lập','Không can thiệp nội dung, kết quả và Hội đồng giám khảo.'],
  ['02','Nhận diện vừa đủ','Logo đối tác không lấn át HALO HOLA.'],
  ['03','Tôn trọng dữ liệu','Không chia sẻ dữ liệu cá nhân người tham gia.'],
  ['04','Giữ chuẩn tuyển chọn','Không đánh đổi chất lượng tuyển chọn lấy quyền lợi thương mại.']
]

export default function PartnersPage(){
  const [partners,setPartners]=useState([])
  useEffect(()=>{getPartners().then(setPartners).catch(()=>{})},[])

  return <main className="partners-page-modern">
    <section className="partners-hero-modern">
      <div className="container partners-hero-grid">
        <div className="partners-hero-copy">
          <span className="eyebrow">HỒ SƠ MỜI HỢP TÁC · HALO HOLA 2026</span>
          <h1>Cùng kể <em>câu chuyện Hòa Lạc</em></h1>
          <p>Đồng hành cùng HALO HOLA bằng nguồn lực phù hợp, hiện diện đúng điểm chạm và vẫn bảo vệ tính độc lập của nội dung, tác giả và quá trình tuyển chọn.</p>
          <div className="partners-hero-actions">
            <a href="#hang-dong-hanh" className="partner-btn partner-btn-primary">Xem các hạng đồng hành <ArrowRight/></a>
            {partners.length>0&&<a href="#doi-tac" className="partner-btn partner-btn-light">Đối tác hiện tại</a>}
          </div>
          <div className="partners-hero-facts">
            <div><b>05</b><span>Hạng đồng hành</span></div>
            <div><PackageOpen/><span>Tiền mặt · hiện vật · dịch vụ</span></div>
            <div><ShieldCheck/><span>Giữ độc lập nội dung</span></div>
          </div>
        </div>

        <div className="partners-hero-visual">
          <img src={img.event} alt="Cộng đồng HALO HOLA"/>
          <div className="partners-hero-shade"/>
          <div className="partners-hero-card">
            <span>HALO HOLA 2026</span>
            <b>Đồng hành đúng cách.<br/>Lan tỏa đúng giá trị.</b>
            <p>Tài trợ không chỉ là hiện diện thương hiệu, mà là cùng tạo điều kiện để những câu chuyện Hòa Lạc được kể tốt hơn.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="partners-intro-strip">
      <div className="container partners-intro-grid">
        <div><Building2/><b>Địa điểm</b><span>Không gian tổ chức, trải nghiệm và kết nối</span></div>
        <div><PackageOpen/><b>Hậu cần</b><span>Vật phẩm, thiết bị và dịch vụ quy đổi</span></div>
        <div><Handshake/><b>Nguồn lực</b><span>Đóng góp tài chính theo hạng đồng hành</span></div>
      </div>
    </section>

    <section id="hang-dong-hanh" className="partners-tier-section">
      <div className="container">
        <header className="partners-section-head">
          <div>
            <span className="eyebrow">CÁC HẠNG ĐỒNG HÀNH</span>
            <h2>Chọn mức đồng hành phù hợp</h2>
          </div>
          <p>Đóng góp bằng tiền hoặc quy đổi tương đương bằng địa điểm, hậu cần, vật phẩm và dịch vụ.</p>
        </header>

        <div className="partners-tier-grid">
          {tiers.map(({name,price,Icon,featured},index)=><article className={'partner-tier-card '+(featured?'is-featured':'')} key={name}>
            <div className="partner-tier-top">
              <span className="partner-tier-icon"><Icon/></span>
              <span className="partner-tier-index">0{index+1}</span>
            </div>
            <div className="partner-tier-body">
              <span className="partner-tier-label">HẠNG ĐỒNG HÀNH</span>
              <h3>{name}</h3>
              <strong>{price}</strong>
              <p>Hiện diện tại các điểm chạm phù hợp của HALO HOLA 2026.</p>
            </div>
            <div className="partner-tier-meta"><CheckCircle2/><span>Tiền mặt hoặc quy đổi tương đương</span></div>
          </article>)}
        </div>
      </div>
    </section>

    {partners.length>0&&<section id="doi-tac" className="partners-live-section">
      <div className="container">
        <header className="partners-section-head partners-section-head-light">
          <div><span className="eyebrow">ĐỐI TÁC ĐỒNG HÀNH</span><h2>Những đơn vị đang cùng HALO HOLA kể chuyện</h2></div>
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
          <h2>Thương hiệu hiện diện,<br/>giá trị vẫn nguyên vẹn.</h2>
          <p>HALO HOLA ưu tiên các mối quan hệ hợp tác minh bạch, tôn trọng người tham gia và giữ đúng tinh thần của chương trình.</p>
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
        <div><span className="eyebrow">HALO HOLA 2026</span><h2>Cùng góp một phần vào câu chuyện Hòa Lạc.</h2></div>
        <div className="partners-final-actions">
          <a href="#hang-dong-hanh" className="partner-btn partner-btn-primary">Xem hạng đồng hành <ArrowRight/></a>
          <Link to="/" className="partner-btn partner-btn-light">Khám phá chương trình</Link>
        </div>
      </div>
    </section>
  </main>
}
