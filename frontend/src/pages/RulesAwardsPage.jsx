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
    label:'Giải đặc biệt',
    name:'Danh hiệu HALO HOLA 2026',
    amount:'10.000.000đ + cúp + chứng nhận',
    quantity:'01 giải',
    description:'Chọn từ 07 tác phẩm đoạt giải chủ đề 01–07; điểm Danh hiệu gồm 70% Hội đồng giám khảo và 30% bình chọn cộng đồng.',
    tone:'forest',
    featured:true,
    enabled:true
  },
  {
    code:'THEME_01_07',
    label:'Giải chủ đề',
    name:'07 giải chủ đề 01–07',
    amount:'5.000.000đ / giải + chứng nhận',
    quantity:'07 giải',
    description:'Mỗi chủ đề từ 01 đến 07 có 01 giải, trị giá 5.000.000 đồng và chứng nhận.',
    tone:'terra',
    enabled:true
  },
  {
    code:'COLOR',
    label:'Chủ đề 08',
    name:'Sắc màu Hòa Lạc · 06 chủ nhân',
    amount:'1.000.000đ / chủ nhân + chứng nhận',
    quantity:'06 chủ nhân',
    description:'06 chủ nhân đại diện 06 đặc trưng sắc màu; xét trên mọi tác phẩm hợp lệ ở cả 8 chủ đề.',
    tone:'sun',
    enabled:true
  },
  {
    code:'FAVORITE',
    label:'Giải phụ',
    name:'Góc nhìn được yêu thích',
    amount:'3.000.000đ + chứng nhận',
    quantity:'01 giải',
    description:'Dành cho tác phẩm có điểm bình chọn hợp lệ cao nhất theo thể lệ chương trình.',
    tone:'green',
    enabled:true
  },
  {
    code:'SPREAD',
    label:'Giải phụ',
    name:'Giải Lan tỏa',
    amount:'2.000.000đ + chứng nhận',
    quantity:'01 giải',
    description:'Ghi nhận khả năng lan tỏa tự nhiên của tác phẩm theo cách tính tương tác trong thể lệ.',
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
  ['01','Nét Đoài tại Hòa Lạc'],
  ['02','Sắc Mường Hòa Lạc'],
  ['03','Không gian Kiến trúc Hòa Lạc'],
  ['04','Hòa Lạc xanh'],
  ['05','Nắng Hòa Lạc'],
  ['06','Câu chuyện Hòa Lạc'],
  ['07','Ước mơ Hòa Lạc','HS–SV'],
  ['08','Sắc màu Hòa Lạc','6 đặc trưng']
]

const TIMELINE = [
  ['10.10','Phát động, mở nhận tác phẩm'],
  ['17.10 – 01.11','3 HOLA TOUR'],
  ['10.11 · 23:59','Hạn nộp tác phẩm'],
  ['18.11','Công bố TOP52 · mở bình chọn'],
  ['26.11 · 23:59','Khóa bình chọn'],
  ['28.11 · 15:00–19:00','HOLA DAY · triển lãm · trao giải']
]

const COMMUNES = ['Yên Xuân','Hòa Lạc','Yên Bài','Đoài Phương','Thạch Thất','Hạ Bằng','Tây Phương','Kiều Phú','Phú Cát']

const RULE_NOTES = [
  'Tác phẩm do chính người dự thi thực hiện; không nhận tác phẩm tạo bằng AI hoặc ghép sai lệch hiện thực.',
  'TOP52 cung cấp file gốc khi Ban Tổ chức yêu cầu.',
  'Người xuất hiện rõ mặt cần đồng ý; người dưới 18 tuổi cần sự đồng ý của phụ huynh hoặc người giám hộ.',
  'Không dùng nhạc, hình ảnh hoặc tư liệu vi phạm bản quyền; tuân thủ quy định khi sử dụng flycam.',
  'Tác giả giữ quyền tác giả. Ban Tổ chức được sử dụng tác phẩm cho truyền thông, triển lãm và lưu trữ phi thương mại trong 05 năm, luôn ghi tên tác giả.',
  'Đưa tác phẩm vào Calendar hoặc sản phẩm bán ra chỉ thực hiện khi tác giả có chấp thuận riêng.',
  'Thành viên Ban Tổ chức, Hội đồng giám khảo và người thân trực tiếp không tham gia dự thi.'
]

const NAV = [
  ['I.','Đối tượng','tham-gia'],['II.','Loại hình','loai-hinh'],['III.','Chủ đề','chu-de'],
  ['IV.','Giải thưởng','giai-thuong'],['V.','Cách tham gia','cach-tham-gia'],
  ['VI.','Mốc thời gian','moc-thoi-gian'],['VII.','Quy định','luu-y']
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
  const prizeSummary=config.prizeSummary||'8 giải chủ đề · 2 giải phụ · 1 giải đặc biệt'
  const pageTitle=config.title||'Thể lệ & Giải thưởng HALO HOLA 2026'
  const intro=config.intro||'Điều kiện tham gia, cách gửi tác phẩm, mốc thời gian và cơ cấu giải thưởng chính thức của HALO HOLA 2026.'
  const officialPdfUrl=(config.officialPdfUrl||'').trim()

  return <main className="rules4-page">
    <section className="rules4-hero">
      <div className="container rules4-hero-inner">
        <div>
          <span className="rules4-kicker">THỂ LỆ CHÍNH THỨC · HALO HOLA 2026</span>
          <h1>{pageTitle}</h1>
          <p>{intro}</p>
          <div className="rules4-hero-actions">
            <a className="btn btn-green" href="#tham-gia">Đọc thể lệ <ArrowRight/></a>
            <Link className="btn btn-outline" to="/gui-goc-nhin">Gửi góc nhìn</Link>
            {officialPdfUrl&&<a className="btn btn-outline" href={officialPdfUrl} target="_blank" rel="noreferrer"><FileText/> PDF chính thức <ExternalLink/></a>}
          </div>
        </div>
        <div className="rules4-hero-meta" aria-label="Thông tin nhanh">
          <div><span>Tổng số giải</span><b>{totalAwards} giải</b></div>
          <div><span>Tổng tiền mặt</span><b>{totalPrize}</b></div>
          <div><span>Hạn nhận bài</span><b>10.11 · 23:59</b></div>
        </div>
      </div>
    </section>

    <div className="rules4-wrap">
      <div className="container rules4-layout">
        <aside className="rules4-sidebar" aria-label="Mục lục thể lệ">
          <div className="rules4-sidebar-card">
            <div className="rules4-sidebar-head"><span>Mục lục</span><b>Thể lệ HALO HOLA 2026</b></div>
            <nav className="rules4-nav">
              {NAV.map(([roman,label,id])=><a key={id} href={'#'+id}><span>{roman}</span>{label}</a>)}
            </nav>
            <div className="rules4-sidebar-foot">
              {prizeSummary}
              {officialPdfUrl&&<a href={officialPdfUrl} target="_blank" rel="noreferrer"><FileText/> Xem bản PDF <ExternalLink/></a>}
            </div>
          </div>
        </aside>

        <article className="rules4-paper">
          <header className="rules4-paper-head">
            <div><span>HALO HOLA 2026</span><h2>Thể lệ chương trình sáng tạo cộng đồng</h2></div>
            <div className="rules4-paper-stamp"><strong>{totalAwards} giải</strong><small>Tổng {totalPrize}</small></div>
          </header>

          <section id="tham-gia" className="rules4-section">
            <div className="rules4-roman">I.</div>
            <div>
              <span className="rules4-section-kicker">Đối tượng tham gia</span>
              <h3>Ai có thể tham gia</h3>
              <p className="rules4-lead">Người dân, sinh viên, KTS, photographer, filmmaker, designer, creator — chuyên hay không chuyên; dùng máy ảnh hay điện thoại đều có thể gửi góc nhìn về Hòa Lạc.</p>
              <dl className="rules4-facts">
                <div className="rules4-fact"><Users/><dt>Đối tượng</dt><dd>Cá nhân hoặc nhóm; tham gia miễn phí.</dd></div>
                <div className="rules4-fact"><MapPin/><dt>Địa bàn</dt><dd>{COMMUNES.join(', ')}</dd></div>
                <div className="rules4-fact"><ShieldCheck/><dt>Dưới 18 tuổi</dt><dd>Cần có sự đồng ý của phụ huynh hoặc người giám hộ.</dd></div>
              </dl>
            </div>
          </section>

          <section id="loai-hinh" className="rules4-section">
            <div className="rules4-roman">II.</div>
            <div>
              <span className="rules4-section-kicker">Loại hình tác phẩm</span>
              <h3>Bốn cách để gửi một góc nhìn</h3>
              <p className="rules4-lead">Tác phẩm có thể được thể hiện bằng hình ảnh, video, câu chuyện hoặc sáng tạo thị giác. Mỗi loại hình có yêu cầu kỹ thuật riêng.</p>
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
              <span className="rules4-section-kicker">Chủ đề</span>
              <h3>8 chủ đề về Hòa Lạc</h3>
              <p className="rules4-lead">Người tham gia lựa chọn một trong tám chủ đề để kể câu chuyện của mình, từ văn hóa bản địa đến thiên nhiên, kiến trúc và con người Hòa Lạc.</p>
              <div className="rules4-theme-grid">
                {THEMES.map(([number,title,badge])=><div className="rules4-theme" key={number}><span className="num">{number}</span><b>{title}</b>{badge&&<small>{badge}</small>}</div>)}
              </div>
              <div className="rules4-note">Chủ đề 08 “Sắc màu Hòa Lạc” gồm 6 đặc trưng: Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc. Mọi tác phẩm hợp lệ ở cả 8 chủ đề đều có thể khai báo sắc màu để được xét giải.</div>
            </div>
          </section>

          <section id="giai-thuong" className="rules4-section">
            <div className="rules4-roman">IV.</div>
            <div>
              <span className="rules4-section-kicker">Cơ cấu giải thưởng</span>
              <h3>{totalAwards} giải thưởng HALO HOLA 2026</h3>
              <div className="rules4-award-total"><strong>{totalPrize}</strong><span>Tổng tiền mặt · {prizeSummary}</span></div>
              <table className="rules4-table rules4-awards-table">
                <thead><tr><th>Nhóm giải</th><th>Số lượng</th><th>Giá trị</th><th>Ghi chú</th></tr></thead>
                <tbody>{awards.map((award,index)=><tr key={award.code||award.name||index} className={award.featured?'is-featured':''}>
                  <td><div className="rules4-award-name"><b>{award.name}</b><small>{award.label||'Giải thưởng'}</small></div></td>
                  <td>{award.quantity||'—'}</td>
                  <td>{award.amount||'—'}</td>
                  <td className="rules4-award-desc">{award.description}</td>
                </tr>)}</tbody>
              </table>
              <div className="rules4-award-policy">
                <div><b>Cách chọn Danh hiệu</b><span>{config.juryWeight??70}% Hội đồng + {config.communityWeight??30}% bình chọn cộng đồng.</span></div>
                <div><b>Giải được cộng dồn</b><span>Một tác phẩm có thể đồng thời nhận giải chủ đề, giải Sắc màu, giải phụ và Danh hiệu nếu đáp ứng điều kiện.</span></div>
                <div><b>Chứng nhận</b><span>TOP 3 từng chủ đề và TOP52 nhận chứng nhận của chương trình.</span></div>
              </div>
            </div>
          </section>

          <section id="cach-tham-gia" className="rules4-section">
            <div className="rules4-roman">V.</div>
            <div>
              <span className="rules4-section-kicker">Cách tham gia</span>
              <h3>Tham gia trong 4 bước</h3>
              <ol className="rules4-steps">
                <li><span className="num">01</span><b>Đến Hòa Lạc</b><p>Sáng tạo theo 1 trong 8 chủ đề của chương trình.</p></li>
                <li><span className="num">02</span><b>Nộp tác phẩm</b><p>Gửi qua form tại halohola.vn, kèm tên, chủ đề, địa điểm, thời gian và câu chuyện 50–150 chữ.</p></li>
                <li><span className="num">03</span><b>Tối đa 05 tác phẩm</b><p>Mỗi tác giả được gửi tối đa 05 tác phẩm; có thể tham gia cá nhân hoặc theo nhóm.</p></li>
                <li><span className="num">04</span><b>Chia sẻ câu chuyện</b><p>Khuyến khích chia sẻ lên trang cá nhân hoặc Group CHECK IN HOALAC kèm hashtag #HaloHola.</p></li>
              </ol>
            </div>
          </section>

          <section id="moc-thoi-gian" className="rules4-section">
            <div className="rules4-roman">VI.</div>
            <div>
              <span className="rules4-section-kicker">Mốc thời gian</span>
              <h3>Từ phát động đến HOLA DAY</h3>
              <p className="rules4-lead">HOLA DAY diễn ra ngày 28.11, là điểm hẹn triển lãm TOP52, trao giải và công bố Danh hiệu HALO HOLA 2026.</p>
              <div className="rules4-timeline">
                {TIMELINE.map(([date,title],index)=><div key={date} className={'rules4-time-row '+(index===TIMELINE.length-1?'is-final':'')}><time>{date}</time><b>{title}</b></div>)}
              </div>
            </div>
          </section>

          <section id="luu-y" className="rules4-section">
            <div className="rules4-roman">VII.</div>
            <div>
              <span className="rules4-section-kicker">Quy định quan trọng</span>
              <h3>Bản quyền, tính trung thực và quyền hình ảnh</h3>
              <ul className="rules4-checks">
                {RULE_NOTES.map(note=><li key={note}><Check/><span>{note}</span></li>)}
              </ul>
            </div>
          </section>

          <footer className="rules4-footer-action">
            <div><span>HALO HOLA 2026</span><h3>Mỗi góc nhìn là một phần câu chuyện Hòa Lạc.</h3></div>
            <Link className="btn btn-terra" to="/gui-goc-nhin">Gửi góc nhìn <ArrowRight/></Link>
          </footer>
        </article>
      </div>
    </div>
  </main>
}
