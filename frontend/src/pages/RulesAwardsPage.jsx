import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Brush, Camera, Check, ExternalLink, FileText,
  MapPin, PenTool, ShieldCheck, Trophy, Users, Video
} from 'lucide-react'
import { getSiteSettings } from '../services/api.js'
import '../styles/rules-awards-document-v4.css'
import '../styles/rules-awards-document-v5.css'
import '../styles/rules-awards-desktop-reading.css'

export const DEFAULT_AWARDS = [
  {
    code:'SPECIAL',
    label:'Ghi nhận đặc biệt',
    name:'Danh hiệu HALO HOLA 2026',
    amount:'10.000.000đ + cúp + chứng nhận',
    quantity:'01 danh hiệu',
    description:'Chọn từ 07 góc nhìn được ghi nhận theo 7 mạch nội dung; điểm Danh hiệu gồm 70% Hội đồng giám khảo và 30% bình chọn cộng đồng.',
    tone:'forest',
    featured:true,
    enabled:true
  },
  {
    code:'THEME_01_07',
    label:'Ghi nhận theo mạch nội dung',
    name:'07 góc nhìn tiêu biểu theo 7 mạch nội dung',
    amount:'5.000.000đ / góc nhìn + chứng nhận',
    quantity:'07 góc nhìn',
    description:'Mỗi mạch nội dung từ 01 đến 07 ghi nhận 01 góc nhìn tiêu biểu, trị giá 5.000.000 đồng và chứng nhận.',
    tone:'terra',
    enabled:true
  },
  {
    code:'COLOR',
    label:'Ghi nhận Sắc màu',
    name:'Sắc màu Hòa Lạc · 06 chủ nhân',
    amount:'1.000.000đ / chủ nhân + chứng nhận',
    quantity:'06 chủ nhân',
    description:'06 chủ nhân đại diện 06 đặc trưng sắc màu; xét trên các góc nhìn phù hợp trong toàn chương trình.',
    tone:'sun',
    enabled:true
  },
  {
    code:'FAVORITE',
    label:'Ghi nhận cộng đồng',
    name:'Góc nhìn được yêu thích',
    amount:'3.000.000đ + chứng nhận',
    quantity:'01 góc nhìn',
    description:'Dành cho góc nhìn có điểm bình chọn hợp lệ cao nhất theo hướng dẫn chương trình.',
    tone:'green',
    enabled:true
  },
  {
    code:'SPREAD',
    label:'Ghi nhận cộng đồng',
    name:'Góc nhìn Lan tỏa',
    amount:'2.000.000đ + chứng nhận',
    quantity:'01 góc nhìn',
    description:'Ghi nhận khả năng lan tỏa tự nhiên của một đóng góp theo cách tính tương tác trong hướng dẫn chương trình.',
    tone:'beige',
    enabled:true
  }
]

const FORMATS = [
  {icon:Camera,title:'PHOTO',detail:'Ảnh đơn, bộ ảnh, photo story',spec:'JPG · cạnh dài ≥ 2.000 px · ≤ 20 MB/ảnh · bộ ảnh ≤ 10 ảnh'},
  {icon:Video,title:'VIDEO',detail:'Reel, phim ngắn, timelapse',spec:'MP4 ≥ 1080p · 15 giây – 5 phút · nộp link tải'},
  {icon:PenTool,title:'STORY & CREATIVE',detail:'Câu chuyện, tản văn, bài viết, thơ, audio',spec:'300 – 1.500 chữ (thơ tự do) · audio ≤ 10 phút'},
  {icon:Brush,title:'ART & DESIGN',detail:'Tranh, ký họa, illustration, digital art, poster, postcard',spec:'JPG/PDF · cạnh dài ≥ 3.000 px'}
]

const THEMES = [
  ['01','Bản sắc'],
  ['02','Thiên nhiên'],
  ['03','Không gian'],
  ['04','Con người'],
  ['05','Tri thức & Công nghệ'],
  ['06','Đời sống & Cảm xúc'],
  ['07','Tương lai']
]

const TIMELINE = [
  ['11.10','Mở nhận góc nhìn cộng đồng'],
  ['25.10','HOLA Tour #01 · #02 · #03'],
  ['10.11 · 10:11','Đóng đợt nhận góc nhìn 2026'],
  ['16.11','Công bố TOP52 · mở bình chọn cộng đồng'],
  ['24.11','HOLA DAY · triển lãm · vinh danh']
]

const COMMUNES = ['Yên Xuân','Hòa Lạc','Yên Bài','Đoài Phương','Thạch Thất','Hạ Bằng','Tây Phương','Kiều Phú','Phú Cát']

const RULE_NOTES = [
  'Nội dung do chính người tham gia thực hiện; không nhận nội dung tạo bằng AI hoặc ghép sai lệch hiện thực.',
  'Các góc nhìn được chọn vào TOP52 cung cấp file gốc khi Ban Tổ chức yêu cầu.',
  'Người xuất hiện rõ mặt cần đồng ý; người dưới 18 tuổi cần sự đồng ý của phụ huynh hoặc người giám hộ.',
  'Không dùng nhạc, hình ảnh hoặc tư liệu vi phạm bản quyền; tuân thủ quy định khi sử dụng flycam.',
  'Người đóng góp giữ quyền tác giả. Ban Tổ chức được sử dụng nội dung cho truyền thông, triển lãm và lưu trữ phi thương mại trong 05 năm, luôn ghi tên tác giả.',
  'Đưa nội dung vào Calendar hoặc sản phẩm bán ra chỉ thực hiện khi tác giả có chấp thuận riêng.',
  'Thành viên Ban Tổ chức, Hội đồng giám khảo và người thân trực tiếp không thuộc nhóm được xét các hạng mục vinh danh và giải thưởng.'
]

const NAV = [
  ['I.','Ai có thể đóng góp','tham-gia'],['II.','Loại hình','loai-hinh'],['III.','Chủ đề','chu-de'],
  ['IV.','Ghi nhận','giai-thuong'],['V.','Cách tham gia','cach-tham-gia'],
  ['VI.','Mốc thời gian','moc-thoi-gian'],['VII.','Nguyên tắc','luu-y']
]

const mergeAwards=value=>Array.isArray(value)&&value.length?value:DEFAULT_AWARDS

export default function RulesAwardsPage(){
  const [config,setConfig]=useState({})

  useEffect(()=>{
    let alive=true
    getSiteSettings().then(settings=>{
      if(alive) setConfig(settings?.rulesAwards||{})
    }).catch(()=>{})
    return()=>{alive=false}
  },[])

  const awards=useMemo(()=>mergeAwards(config.awards).filter(item=>item?.enabled!==false),[config.awards])
  const totalPrize=config.totalPrize||'56.000.000đ'
  const totalAwards=Number(config.totalAwards)||11
  const prizeSummary=config.prizeSummary||'7 mạch nội dung · Sắc màu · cộng đồng · danh hiệu đặc biệt'
  const pageTitle=config.title||'Cách tham gia & Ghi nhận HALO HOLA 2026'
  const intro=config.intro||'Hướng dẫn gửi góc nhìn, nguyên tắc đóng góp, mốc thời gian và các hạng mục ghi nhận của chương trình cộng đồng HALO HOLA 2026.'
  const officialPdfUrl=(config.officialPdfUrl||'').trim()

  return <main className="rules4-page">
    <section className="rules4-hero">
      <div className="container rules4-hero-inner">
        <div>
          <span className="rules4-kicker">CHƯƠNG TRÌNH CỘNG ĐỒNG · HALO HOLA 2026</span>
          <h1>{pageTitle}</h1>
          <p>{intro}</p>
          <div className="rules4-hero-actions">
            <a className="btn btn-green" href="#tham-gia">Xem cách tham gia <ArrowRight/></a>
            <Link className="btn btn-outline" to="/gui-goc-nhin">Đóng góp góc nhìn</Link>
            {officialPdfUrl&&<a className="btn btn-outline" href={officialPdfUrl} target="_blank" rel="noreferrer"><FileText/> Tài liệu chương trình <ExternalLink/></a>}
          </div>
        </div>
        <div className="rules4-hero-meta" aria-label="Thông tin nhanh">
          <div><span>Hạng mục ghi nhận</span><b>{totalAwards} hạng mục</b></div>
          <div><span>Tổng giá trị</span><b>{totalPrize}</b></div>
          <div><span>Nhận góc nhìn đến</span><b>10.11 · 10:11</b></div>
        </div>
      </div>
    </section>

    <div className="rules4-wrap">
      <div className="container rules4-layout">
        <aside className="rules4-sidebar" aria-label="Mục lục cách tham gia">
          <div className="rules4-sidebar-card">
            <div className="rules4-sidebar-head"><span>Mục lục</span><b>Tham gia HALO HOLA 2026</b></div>
            <nav className="rules4-nav">
              {NAV.map(([roman,label,id])=><a key={id} href={'#'+id}><span>{roman}</span>{label}</a>)}
            </nav>
            <div className="rules4-sidebar-foot">
              {prizeSummary}
              {officialPdfUrl&&<a href={officialPdfUrl} target="_blank" rel="noreferrer"><FileText/> Xem tài liệu <ExternalLink/></a>}
            </div>
          </div>
        </aside>

        <article className="rules4-paper">
          <header className="rules4-paper-head">
            <div><span>HALO HOLA 2026</span><h2>Hướng dẫn đóng góp cho chương trình cộng đồng</h2></div>
            <div className="rules4-paper-stamp"><strong>{totalAwards} ghi nhận</strong><small>Tổng {totalPrize}</small></div>
          </header>

          <section id="tham-gia" className="rules4-section">
            <div className="rules4-roman">I.</div>
            <div>
              <span className="rules4-section-kicker">Cộng đồng cùng tham gia</span>
              <h3>Ai cũng có thể góp một góc nhìn</h3>
              <p className="rules4-lead">Người dân, sinh viên, KTS, photographer, filmmaker, designer, creator — chuyên hay không chuyên; dùng máy ảnh hay điện thoại đều có thể đóng góp một góc nhìn về Hòa Lạc.</p>
              <dl className="rules4-facts">
                <div className="rules4-fact"><Users/><dt>Người tham gia</dt><dd>Cá nhân hoặc nhóm; đóng góp miễn phí.</dd></div>
                <div className="rules4-fact"><MapPin/><dt>Không gian</dt><dd>{COMMUNES.join(', ')}</dd></div>
                <div className="rules4-fact"><ShieldCheck/><dt>Dưới 18 tuổi</dt><dd>Cần có sự đồng ý của phụ huynh hoặc người giám hộ.</dd></div>
              </dl>
            </div>
          </section>

          <section id="loai-hinh" className="rules4-section">
            <div className="rules4-roman">II.</div>
            <div>
              <span className="rules4-section-kicker">Cách kể một góc nhìn</span>
              <h3>Bốn cách để đóng góp về Hòa Lạc</h3>
              <p className="rules4-lead">Một góc nhìn có thể được thể hiện bằng hình ảnh, video, câu chuyện hoặc sáng tạo thị giác. Mỗi loại hình có yêu cầu kỹ thuật riêng để chương trình có thể lưu giữ và công bố tốt nhất.</p>
              <table className="rules4-table">
                <thead><tr><th>Loại hình</th><th>Nội dung</th><th>Thông số</th></tr></thead>
                <tbody>{FORMATS.map(({icon:I,title,detail,spec})=><tr key={title}>
                  <td><div className="rules4-format-name"><span><I/></span><strong>{title}</strong></div></td>
                  <td>{detail}</td><td>{spec}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id="chu-de" className="rules4-section">
            <div className="rules4-roman">III.</div>
            <div>
              <span className="rules4-section-kicker">7 mạch nội dung Hòa Lạc</span>
              <h3>Chọn một hoặc nhiều chủ đề để cùng kể</h3>
              <p className="rules4-lead">Khung biên tập gồm Bản sắc, Thiên nhiên, Không gian, Con người, Tri thức & Công nghệ, Đời sống & Cảm xúc và Tương lai.</p>
              <div className="rules4-theme-grid">
                {THEMES.map(([number,title,badge])=><div className="rules4-theme" key={number}><span className="num">{number}</span><b>{title}</b>{badge&&<small>{badge}</small>}</div>)}
              </div>
              <div className="rules4-note">Ba trục xuyên suốt: Bản sắc · Sáng tạo · Tương lai.</div>
            </div>
          </section>

          <section id="giai-thuong" className="rules4-section">
            <div className="rules4-roman">IV.</div>
            <div>
              <span className="rules4-section-kicker">Ghi nhận những đóng góp tiêu biểu</span>
              <h3>{totalAwards} hạng mục ghi nhận HALO HOLA 2026</h3>
              <div className="rules4-award-total"><strong>{totalPrize}</strong><span>Tổng giá trị ghi nhận · {prizeSummary}</span></div>
              <table className="rules4-table rules4-awards-table">
                <thead><tr><th>Hạng mục</th><th>Số lượng</th><th>Giá trị</th><th>Ghi chú</th></tr></thead>
                <tbody>{awards.map((award,index)=><tr key={award.code||award.name||index} className={award.featured?'is-featured':''}>
                  <td><div className="rules4-award-name"><b>{award.name}</b><small>{award.label||'Ghi nhận'}</small></div></td>
                  <td>{award.quantity||'—'}</td>
                  <td>{award.amount||'—'}</td>
                  <td className="rules4-award-desc">{award.description}</td>
                </tr>)}</tbody>
              </table>
              <div className="rules4-award-policy">
                <div><b>Cách chọn Danh hiệu</b><span>{config.juryWeight??70}% Hội đồng + {config.communityWeight??30}% bình chọn cộng đồng.</span></div>
                <div><b>Có thể được ghi nhận ở nhiều hạng mục</b><span>Một góc nhìn có thể đồng thời được ghi nhận theo mạch nội dung, Sắc màu, cộng đồng và Danh hiệu nếu đáp ứng điều kiện.</span></div>
                <div><b>Chứng nhận</b><span>TOP 3 từng mạch nội dung và TOP52 nhận chứng nhận của chương trình.</span></div>
              </div>
            </div>
          </section>

          <section id="cach-tham-gia" className="rules4-section">
            <div className="rules4-roman">V.</div>
            <div>
              <span className="rules4-section-kicker">Cách đóng góp</span>
              <h3>Gửi một góc nhìn trong 4 bước</h3>
              <ol className="rules4-steps">
                <li><span className="num">01</span><b>Khám phá Hòa Lạc</b><p>Quan sát, trải nghiệm và ghi lại điều bạn thấy đáng kể về Hòa Lạc.</p></li>
                <li><span className="num">02</span><b>Gửi góc nhìn</b><p>Gửi qua form tại halohola.vn, kèm tên, chủ đề, địa điểm, thời gian và câu chuyện phía sau.</p></li>
                <li><span className="num">03</span><b>Cùng làm đầy kho tư liệu</b><p>Mỗi người có thể gửi tối đa 05 góc nhìn; có thể tham gia cá nhân hoặc theo nhóm.</p></li>
                <li><span className="num">04</span><b>Kể tiếp câu chuyện</b><p>Khuyến khích chia sẻ lên trang cá nhân hoặc Group CHECK IN HOALAC kèm hashtag #HaloHola để kết nối thêm cộng đồng.</p></li>
              </ol>
            </div>
          </section>

          <section id="moc-thoi-gian" className="rules4-section">
            <div className="rules4-roman">VI.</div>
            <div>
              <span className="rules4-section-kicker">Mốc hành trình</span>
              <h3>Từ những góc nhìn đầu tiên đến HOLA DAY</h3>
              <p className="rules4-lead">HOLA DAY diễn ra ngày 24.11, là điểm hẹn để cộng đồng gặp nhau, triển lãm TOP52 và vinh danh những đóng góp tiêu biểu của HALO HOLA 2026.</p>
              <div className="rules4-timeline">
                {TIMELINE.map(([date,title],index)=><div key={date} className={'rules4-time-row '+(index===TIMELINE.length-1?'is-final':'')}><time>{date}</time><b>{title}</b></div>)}
              </div>
            </div>
          </section>

          <section id="luu-y" className="rules4-section">
            <div className="rules4-roman">VII.</div>
            <div>
              <span className="rules4-section-kicker">Nguyên tắc đóng góp</span>
              <h3>Bản quyền, tính trung thực và quyền hình ảnh</h3>
              <ul className="rules4-checks">
                {RULE_NOTES.map(note=><li key={note}><Check/><span>{note}</span></li>)}
              </ul>
            </div>
          </section>

          <footer className="rules4-footer-action">
            <div><span>HALO HOLA 2026</span><h3>Mỗi góc nhìn là một đóng góp cho câu chuyện chung về Hòa Lạc.</h3></div>
            <Link className="btn btn-terra" to="/gui-goc-nhin">Đóng góp góc nhìn <ArrowRight/></Link>
          </footer>
        </article>
      </div>
    </div>
  </main>
}