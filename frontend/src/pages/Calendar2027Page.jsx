import { ArrowRight, BookOpen, CalendarDays, QrCode, Building2, Gift, HeartHandshake } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { img } from '../data/siteData.js'

const weeks=[
  ['01','Một góc nhìn','Một người, nơi chốn, ký ức hoặc ý tưởng về Hòa Lạc.'],
  ['02','Một hình ảnh','Hero image đủ chất lượng để sống cả trên bản in và digital.'],
  ['03','Một câu dẫn','Một dòng ngắn để mở cánh cửa vào câu chuyện.'],
  ['04','Một QR','Dẫn tới câu chuyện đầy đủ trên HALO HOLA.']
]

export default function Calendar2027Page(){
  return <main className="calendar-2027-page">
    <PageHero
      eyebrow="HALO HOLA CALENDAR 2027"
      title="52 tuần · 52 câu chuyện"
      accent="Hòa Lạc"
      desc="Calendar là phiên bản vật lý của hành trình kể chuyện 2027 — mỗi tuần một góc nhìn, một hình ảnh, một câu dẫn và một QR đưa người xem trở lại kho câu chuyện HALO HOLA."
      image={img.crafts}
    >
      <Link className="btn btn-green" to="/hola-day">Xem ngày công bố 24.11 <ArrowRight size={16}/></Link>
    </PageHero>

    <section className="container section">
      <div className="section-heading"><div><span className="eyebrow">PHYSICAL MEDIA × DIGITAL MEDIA</span><h2>Một cuốn lịch, 52 cánh cửa vào Hòa Lạc</h2></div><p>Calendar không chỉ là merchandise. Mỗi tuần trên lịch là một điểm chạm vật lý; QR mở câu chuyện đầy đủ trên HALO HOLA.</p></div>
      <div className="goal-grid">{weeks.map(([no,title,desc])=><article key={no}><span className="eyebrow">{no}</span><h3>{title}</h3><p>{desc}</p></article>)}</div>
    </section>

    <section className="paper-bg">
      <div className="container section action-story">
        <div>
          <span className="eyebrow">TRƯỚC 24.11</span>
          <h2>Prototype 8–12 tuần mẫu · mở pre-order B2B</h2>
          <p>Giai đoạn đầu ưu tiên doanh nghiệp, tổ chức, trường học, ngân hàng, khu công nghệ, kiến trúc, xây dựng, bất động sản và các đối tác Hòa Lạc. Có thể cá nhân hóa hợp lý bằng logo, thiệp chúc và bao bì.</p>
          <div className="chip-wrap"><span>50 cuốn</span><span>100 cuốn</span><span>300 cuốn</span><span>500+ cuốn</span></div>
          <Link className="btn btn-green" to="/dong-hanh">Trao đổi gói đồng hành <ArrowRight size={16}/></Link>
        </div>
        <img src={img.crafts} alt="HALO HOLA Calendar 2027"/>
      </div>
    </section>

    <section className="container section">
      <div className="section-heading"><div><span className="eyebrow">24.11 · HOLA DAY</span><h2>Official Reveal</h2></div><p>HOLA DAY là điểm chuyển từ hành trình đi tìm Hòa Lạc năm 2026 sang nhịp kể chuyện đều đặn của năm 2027.</p></div>
      <div className="goal-grid">
        <article><CalendarDays/><h3>52 tuần</h3><p>Mỗi tuần một câu chuyện mới về Hòa Lạc.</p></article>
        <article><BookOpen/><h3>52 câu chuyện</h3><p>Mở rộng từ 52 góc nhìn được tìm và biên tập trong năm 2026.</p></article>
        <article><QrCode/><h3>QR Story</h3><p>Mỗi trang lịch nối thẳng tới nội dung digital đầy đủ.</p></article>
        <article><HeartHandshake/><h3>WE HOLA</h3><p>Một phần giá trị có thể quay trở lại các hoạt động cộng đồng minh bạch.</p></article>
      </div>
    </section>

    <section className="we-banner"><img src={img.night} alt="Hòa Lạc 2027"/><div className="container we-overlay"><div><span className="eyebrow">HALO HOLA 2027</span><h2>52 tuần · 52 câu chuyện Hòa Lạc</h2><p>Mỗi tuần một câu chuyện. Mỗi năm một lát cắt mới về Hòa Lạc.</p><Link className="btn btn-green" to="/stories"><Building2 size={17}/> Khám phá Stories</Link></div><span className="hand-note">Calendar = Physical Media<br/>HALO HOLA = Digital Media</span></div></section>
  </main>
}
