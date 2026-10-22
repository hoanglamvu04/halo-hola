import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
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
  {icon:ImageIcon,index:'01',title:'Một khung hình',text:'Một bức ảnh đủ chậm để giữ lại không khí của Hòa Lạc trong tuần.'},
  {icon:Quote,index:'02',title:'Một câu chuyện',text:'Vài dòng về con người, ký ức, kiến trúc, thiên nhiên hay một khoảnh khắc đời thường.'},
  {icon:CalendarDays,index:'03',title:'Một tuần để sống',text:'Lịch tuần hiện diện vừa đủ để cuốn lịch thật sự ở lại trên bàn mỗi ngày.'},
  {icon:QrCode,index:'04',title:'Một đường dẫn',text:'Quét QR khi bạn muốn xem thêm ảnh, video và câu chuyện đầy đủ trên HALO HOLA.'},
]

const rollout=[
  {date:'24.11.2026',title:'Gặp nhau lần đầu tại HOLA DAY',text:'Calendar 2027 xuất hiện như một lời mời mang những câu chuyện Hòa Lạc về gần hơn trong đời sống hằng ngày.'},
  {date:'12.2026',title:'Mang Hòa Lạc về bàn làm việc',text:'Những cuốn lịch đầu tiên bắt đầu đồng hành cùng người yêu Hòa Lạc, bạn bè, gia đình và những cộng đồng gắn bó với vùng đất này.'},
  {date:'01 → 12.2027',title:'Mỗi tuần mở thêm một câu chuyện',text:'52 tuần lần lượt đi qua thiên nhiên, con người, kiến trúc, tri thức, cộng đồng và những trải nghiệm đời thường.'},
]

const sampleWeeks=[
  {week:'W01',label:'BẢN SẮC',title:'Một lớp ký ức còn ở lại',image:img.village},
  {week:'W18',label:'TRI THỨC & CÔNG NGHỆ',title:'Những người đang tạo nên Hòa Lạc mới',image:img.student},
  {week:'W42',label:'ĐỜI SỐNG & CẢM XÚC',title:'Một buổi chiều rất Hòa Lạc',image:img.sunset},
]

function CalendarMockup(){
  return <div className="calendar2027-mockup" aria-label="Mô phỏng HALO HOLA Calendar 2027">
    <div className="calendar2027-rings" aria-hidden="true">{Array.from({length:9}).map((_,index)=><i key={index}/>)}</div>
    <div className="calendar2027-sheet calendar2027-sheet-back" aria-hidden="true"/>
    <div className="calendar2027-sheet calendar2027-cover-sheet">
      <img src={img.sunset} alt="Một buổi chiều Hòa Lạc trên bìa Calendar 2027"/>
      <div className="calendar2027-cover-overlay" aria-hidden="true"/>
      <div className="calendar2027-cover-brand">HALO HOLA</div>
      <div className="calendar2027-cover-copy">
        <strong>52 tuần</strong>
        <span>HÒA LẠC</span>
        <p>Một năm sống chậm · khám phá · kết nối</p>
      </div>
      <div className="calendar2027-cover-bottom">
        <span>THIÊN NHIÊN · CON NGƯỜI · KIẾN TRÚC · TRI THỨC · CỘNG ĐỒNG · TRẢI NGHIỆM</span>
        <b>2027</b>
      </div>
    </div>
    <div className="calendar2027-stamp"><Sparkles/><span>52 TUẦN</span><b>52 GÓC NHÌN</b></div>
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
          <p>Một cuốn lịch để Hòa Lạc ở lại trên bàn mỗi ngày — 52 tuần đi qua thiên nhiên, con người, kiến trúc, tri thức, cộng đồng và những trải nghiệm đáng nhớ.</p>
          <div className="calendar2027-hero-actions">
            <Link className="btn btn-terra" to="/dong-hanh">Quan tâm Calendar 2027 <ArrowRight size={17}/></Link>
            <Link className="calendar2027-text-link" to="/stories">Khám phá câu chuyện <BookOpen size={17}/></Link>
          </div>
          <div className="calendar2027-hero-meta">
            <span><b>52</b> tuần</span><i/><span><b>06</b> mạch câu chuyện</span><i/><span><b>01</b> Hòa Lạc</span>
          </div>
        </div>
        <CalendarMockup/>
      </div>
    </section>

    <section className="calendar2027-bridge-section">
      <div className="container calendar2027-bridge-grid">
        <div className="calendar2027-section-copy">
          <span className="eyebrow">TỪ TRANG LỊCH ĐẾN CÂU CHUYỆN</span>
          <h2>Mở lịch để xem. Quét để đọc tiếp.</h2>
          <p>Mỗi trang đứng độc lập như một lát cắt nhỏ. Khi muốn đi sâu hơn, QR đưa bạn trở lại câu chuyện đầy đủ trên HALO HOLA.</p>
        </div>
        <div className="calendar2027-media-bridge">
          <article><Package/><small>TRÊN BÀN MỖI NGÀY</small><h3>Một tuần để nhìn lại</h3><p>Ảnh, câu dẫn và lịch tuần được giữ gọn để sống cùng không gian làm việc mỗi ngày.</p></article>
          <div className="calendar2027-bridge-arrow"><ArrowRight/></div>
          <article className="digital"><QrCode/><small>KHI MUỐN ĐI SÂU HƠN</small><h3>Câu chuyện phía sau</h3><p>Ảnh bổ sung, video và những góc nhìn liên quan tiếp tục được kể trên HALO HOLA.</p></article>
        </div>
      </div>
    </section>

    <section className="container calendar2027-section calendar2027-format-section">
      <div className="calendar2027-section-head">
        <div><span className="eyebrow">MỖI TUẦN MỘT LÁT CẮT</span><h2>Một trang lịch, bốn điều để nhớ.</h2></div>
        <p>Mỗi tuần đủ gọn để xem nhanh, nhưng vẫn để lại một câu chuyện đáng giữ.</p>
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
          <div><span className="eyebrow">MỘT NĂM ĐỒNG HÀNH</span><h2>Một năm đi qua nhiều Hòa Lạc.</h2></div>
          <p>Thiên nhiên, con người, kiến trúc, tri thức, cộng đồng và trải nghiệm cùng xuất hiện trong nhịp 52 tuần.</p>
        </div>
        <div className="calendar2027-preview-grid">
          {sampleWeeks.map(item=><article key={item.week}>
            <img src={item.image} alt=""/>
            <div className="calendar2027-preview-overlay"/>
            <div className="calendar2027-preview-copy"><span>{item.week}</span><small>{item.label}</small><h3>{item.title}</h3><div><QrCode/> Câu chuyện đầy đủ trên HALO HOLA</div></div>
          </article>)}
        </div>
        <p className="calendar2027-preview-note">Những hình ảnh này minh họa tinh thần các mạch câu chuyện sẽ xuất hiện xuyên suốt Calendar 2027.</p>
      </div>
    </section>

    <section className="container calendar2027-section calendar2027-rollout-section">
      <div className="calendar2027-section-head">
        <div><span className="eyebrow">TỪ HOLA DAY ĐẾN 2027</span><h2>Một cuộc gặp mở ra 52 tuần đồng hành.</h2></div>
        <p>Cuốn lịch bắt đầu từ một cuộc gặp và tiếp tục sống trên bàn làm việc, trong lớp học, trong gia đình và những không gian gắn với Hòa Lạc.</p>
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
          <span className="eyebrow">MỘT MÓN QUÀ TỪ HÒA LẠC</span>
          <h2>Để một phần Hòa Lạc ở lại trên bàn mỗi ngày.</h2>
          <p>Calendar 2027 phù hợp để dành tặng người thân, đồng nghiệp, khách mời hoặc những người có một mối liên hệ với Hòa Lạc — như một món quà vừa hữu dụng, vừa có câu chuyện.</p>
          <Link className="btn btn-terra" to="/dong-hanh">Quan tâm Calendar 2027 <ArrowRight size={17}/></Link>
        </div>
        <aside>
          <Package/>
          <span>DÀNH TẶNG · LƯU GIỮ · SẺ CHIA</span>
          <h3>Một cuốn lịch, nhiều cách để ở gần Hòa Lạc.</h3>
          <p>Đặt trên bàn làm việc, mang về nhà hoặc dành tặng một người bạn — mỗi tuần lại mở ra một lát cắt khác của vùng đất này.</p>
        </aside>
      </div>
    </section>

    <section className="calendar2027-final-section">
      <div className="container calendar2027-final-card">
        <div><span>52 TUẦN HÒA LẠC</span><h2>Mỗi tuần một khung hình.<br/>Mỗi tuần một câu chuyện để nhớ.</h2></div>
        <div><p>Mở lịch để xem.<br/>Quét để đọc tiếp trên HALO HOLA.</p><Link to="/stories">Đi vào kho câu chuyện <ArrowRight/></Link></div>
      </div>
    </section>
  </main>
}
