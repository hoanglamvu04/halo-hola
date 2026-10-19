import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Image as ImageIcon,
  Package,
  QrCode,
  Quote,
  Sparkles,
} from 'lucide-react'
import { img } from '../data/siteData.js'
import './Calendar2027Page.css'

const weeklyFormat=[
  {icon:CalendarDays,index:'01',title:'Một góc nhìn',text:'Một lát cắt đủ rõ để mở ra câu chuyện Hòa Lạc trong tuần.'},
  {icon:ImageIcon,index:'02',title:'Một hình ảnh',text:'Hero Image là điểm chạm thị giác chính của mỗi tuần.'},
  {icon:Quote,index:'03',title:'Một câu dẫn ngắn',text:'Một câu đủ gợi mở để người xem muốn bước sâu hơn vào câu chuyện.'},
  {icon:QrCode,index:'04',title:'Một QR',text:'Quét để đọc câu chuyện đầy đủ trên HALO HOLA — nơi nội dung tiếp tục sống.'},
]

const rollout=[
  {date:'Trước 24.11',title:'Prototype & pre-order B2B',text:'Hoàn thiện 8–12 tuần mẫu, packaging và mở đăng ký quan tâm cho doanh nghiệp, tổ chức, trường học và đối tác Hòa Lạc.'},
  {date:'24.11',title:'Official Reveal tại HOLA DAY',text:'Calendar 2027 được giới thiệu như cánh cửa vật lý dẫn vào hành trình kể chuyện HALO HOLA 2027.'},
  {date:'25.11 → Tết',title:'Mở rộng B2B + B2C',text:'Tiếp tục giới thiệu rộng hơn sau HOLA DAY, phục vụ nhu cầu quà tặng cuối năm và cộng đồng quan tâm tới Hòa Lạc.'},
]

const sampleWeeks=[
  {week:'W01',label:'BẢN SẮC',title:'Một lớp ký ức còn ở lại',image:img.village},
  {week:'W18',label:'TRI THỨC & CÔNG NGHỆ',title:'Những người đang tạo nên Hòa Lạc mới',image:img.student},
  {week:'W42',label:'ĐỜI SỐNG & CẢM XÚC',title:'Một buổi chiều rất Hòa Lạc',image:img.sunset},
]

function CalendarMockup(){
  return <div className="calendar2027-mockup" aria-label="Mô phỏng HALO HOLA Calendar 2027">
    <div className="calendar2027-rings" aria-hidden="true">{Array.from({length:7}).map((_,index)=><i key={index}/>)}</div>
    <div className="calendar2027-sheet calendar2027-sheet-back" aria-hidden="true"/>
    <div className="calendar2027-sheet">
      <div className="calendar2027-sheet-head"><span>HALO HOLA</span><b>2027</b></div>
      <img src={img.village} alt="Không gian Hòa Lạc minh họa cho Calendar 2027"/>
      <div className="calendar2027-week-row"><b>WEEK 01</b><span>04 — 10 JAN</span></div>
      <h3>Mỗi tuần một câu chuyện.</h3>
      <p>Một góc nhìn · một hình ảnh · một câu dẫn</p>
      <div className="calendar2027-qr-row"><div><QrCode/></div><span>Quét để đọc câu chuyện đầy đủ<br/><b>halohola.vn</b></span></div>
    </div>
    <div className="calendar2027-stamp"><Sparkles/><span>52 TUẦN</span><b>52 CÂU CHUYỆN</b></div>
  </div>
}

export default function Calendar2027Page(){
  return <main className="calendar2027-page">
    <section className="calendar2027-hero">
      <div className="calendar2027-hero-orbit orbit-one" aria-hidden="true"/>
      <div className="calendar2027-hero-orbit orbit-two" aria-hidden="true"/>
      <div className="container calendar2027-hero-grid">
        <div className="calendar2027-hero-copy">
          <span className="calendar2027-kicker">HALO HOLA CALENDAR 2027</span>
          <h1><em>52 tuần.</em><br/>52 câu chuyện Hòa Lạc.</h1>
          <p>Phiên bản vật lý của hành trình kể chuyện HALO HOLA 2027 — để mỗi tuần, một góc nhìn về Hòa Lạc lại được mở ra và dẫn tiếp tới kho câu chuyện số.</p>
          <div className="calendar2027-hero-actions">
            <Link className="btn btn-terra" to="/dong-hanh">Quan tâm Calendar 2027 <ArrowRight size={17}/></Link>
            <Link className="calendar2027-text-link" to="/stories">Khám phá câu chuyện <BookOpen size={17}/></Link>
          </div>
          <div className="calendar2027-hero-meta">
            <span><b>52</b> tuần</span><i/><span><b>52</b> câu chuyện</span><i/><span><b>01</b> Hòa Lạc</span>
          </div>
        </div>
        <CalendarMockup/>
      </div>
    </section>

    <section className="calendar2027-bridge-section">
      <div className="container calendar2027-bridge-grid">
        <div className="calendar2027-section-copy">
          <span className="eyebrow">PHYSICAL × DIGITAL</span>
          <h2>Không chỉ là một cuốn lịch.</h2>
          <p>Calendar là phiên bản vật lý của hành trình kể chuyện 2027. HALO HOLA là lớp nội dung số đi cùng nó suốt 52 tuần.</p>
        </div>
        <div className="calendar2027-media-bridge">
          <article><Package/><small>PHYSICAL MEDIA</small><h3>Calendar 2027</h3><p>Chạm vào hình ảnh, câu dẫn và nhịp tuần của từng câu chuyện.</p></article>
          <div className="calendar2027-bridge-arrow"><ArrowRight/></div>
          <article className="digital"><QrCode/><small>DIGITAL MEDIA</small><h3>HALO HOLA</h3><p>Quét QR để mở câu chuyện đầy đủ, hình ảnh, video và tư liệu liên quan.</p></article>
        </div>
      </div>
    </section>

    <section className="container calendar2027-section calendar2027-format-section">
      <div className="calendar2027-section-head">
        <div><span className="eyebrow">CẤU TRÚC MỖI TUẦN</span><h2>Một trang lịch, bốn điểm chạm.</h2></div>
        <p>Mỗi tuần kể vừa đủ trên bản in và để QR mở phần còn lại trên HALO HOLA.</p>
      </div>
      <div className="calendar2027-format-grid">
        {weeklyFormat.map(({icon:Icon,index,title,text})=><article key={index}>
          <div className="calendar2027-format-top"><span>{index}</span><Icon/></div>
          <h3>{title}</h3><p>{text}</p>
        </article>)}
      </div>
    </section>

    <section className="calendar2027-preview-section">
      <div className="container">
        <div className="calendar2027-section-head">
          <div><span className="eyebrow">MẪU CẤU TRÚC NỘI DUNG</span><h2>52 tuần không chỉ có phong cảnh.</h2></div>
          <p>Calendar đi qua bản sắc, con người, tri thức, kiến trúc, đời sống, thiên nhiên và tương lai của Hòa Lạc.</p>
        </div>
        <div className="calendar2027-preview-grid">
          {sampleWeeks.map(item=><article key={item.week}>
            <img src={item.image} alt=""/>
            <div className="calendar2027-preview-overlay"/>
            <div className="calendar2027-preview-copy"><span>{item.week}</span><small>{item.label}</small><h3>{item.title}</h3><div><QrCode/> Câu chuyện đầy đủ trên HALO HOLA</div></div>
          </article>)}
        </div>
        <p className="calendar2027-preview-note">Các tuần trên là mô phỏng cấu trúc trình bày, không phải danh sách nội dung Calendar đã chốt.</p>
      </div>
    </section>

    <section className="container calendar2027-section calendar2027-rollout-section">
      <div className="calendar2027-section-head">
        <div><span className="eyebrow">LỘ TRÌNH CALENDAR</span><h2>Từ prototype đến hành trình 2027.</h2></div>
        <p>Calendar được chuẩn bị trước HOLA DAY thay vì chờ đến ngày reveal mới bắt đầu.</p>
      </div>
      <div className="calendar2027-rollout">
        {rollout.map((item,index)=><article key={item.date}>
          <div className="calendar2027-rollout-index">{String(index+1).padStart(2,'0')}</div>
          <div><span>{item.date}</span><h3>{item.title}</h3><p>{item.text}</p></div>
        </article>)}
      </div>
    </section>

    <section className="calendar2027-b2b-section">
      <div className="container calendar2027-b2b-grid">
        <div>
          <span className="eyebrow">DÀNH CHO TỔ CHỨC & DOANH NGHIỆP</span>
          <h2>Một món quà mang câu chuyện Hòa Lạc.</h2>
          <p>Định hướng B2B có thể triển khai theo các mốc số lượng 50 · 100 · 300 · 500+ cuốn, với mức cá nhân hóa hợp lý như logo, thiệp chúc và bao bì.</p>
          <div className="calendar2027-quantity-row">{['50','100','300','500+'].map(value=><span key={value}><b>{value}</b><small>cuốn</small></span>)}</div>
          <Link className="btn btn-terra" to="/dong-hanh">Trao đổi nhu cầu đồng hành <ArrowRight size={17}/></Link>
        </div>
        <aside>
          <Building2/>
          <span>PRE-ORDER B2B</span>
          <h3>Prototype 8–12 tuần mẫu trước 24.11</h3>
          <p>Phù hợp cho doanh nghiệp, tổ chức, trường học, ngân hàng, khu công nghiệp/công nghệ cao và các đối tác tại Hòa Lạc.</p>
        </aside>
      </div>
    </section>

    <section className="calendar2027-final-section">
      <div className="container calendar2027-final-card">
        <div><span>HALO HOLA 2027</span><h2>Mỗi tuần một câu chuyện.<br/>Mỗi câu chuyện mở thêm một Hòa Lạc.</h2></div>
        <div><p>Calendar = Physical Media<br/>HALO HOLA = Digital Media</p><Link to="/stories">Đi vào kho câu chuyện <ArrowRight/></Link></div>
      </div>
    </section>
  </main>
}
