import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Brush, Camera, Check, Clock3, ExternalLink, FileText,
  MapPin, PenTool, ShieldCheck, Trophy, Users, Video
} from 'lucide-react'
import { getSiteSettings } from '../services/api.js'
import '../styles/rules-awards-document-v3.css'

export const DEFAULT_AWARDS = [
  {
    code:'SPECIAL',
    label:'Giải Nhất',
    name:'Giải Nhất HALO HOLA 2026',
    amount:'5.000.000đ + quà',
    quantity:'01 giải',
    description:'Giải cao nhất của HALO HOLA 2026. Giá trị tiền mặt 5.000.000đ kèm quà tặng; kết quả theo cơ chế Hội đồng và bình chọn cộng đồng của chương trình.',
    tone:'forest',
    featured:true,
    enabled:true
  },
  {
    code:'THEME_01_07',
    label:'Giải chủ đề',
    name:'07 giải chủ đề 01–07',
    amount:'2.000.000đ + quà / giải',
    quantity:'07 giải',
    description:'Mỗi chủ đề từ 01 đến 07 có 01 giải. Mỗi giải gồm 2.000.000đ tiền mặt và quà tặng.',
    tone:'terra',
    enabled:true
  },
  {
    code:'COLOR',
    label:'Giải màu',
    name:'05 giải màu Hòa Lạc',
    amount:'1.000.000đ / giải',
    quantity:'05 giải',
    description:'05 giải thuộc nhóm Sắc màu Hòa Lạc, mỗi giải trị giá 1.000.000đ tiền mặt.',
    tone:'sun',
    enabled:true
  },
  {
    code:'FAVORITE',
    label:'Giải online',
    name:'Góc nhìn được yêu thích',
    amount:'1.000.000đ + quà',
    quantity:'01 giải',
    description:'Giải online dành cho tác phẩm được cộng đồng yêu thích theo quy định bình chọn; gồm 1.000.000đ tiền mặt và quà tặng.',
    tone:'green',
    enabled:true
  },
  {
    code:'SPREAD',
    label:'Giải online',
    name:'Giải Lan tỏa',
    amount:'1.000.000đ + quà',
    quantity:'01 giải',
    description:'Giải online ghi nhận khả năng lan tỏa của tác phẩm; gồm 1.000.000đ tiền mặt và quà tặng.',
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
  ['16.11','Công bố TOP52 · mở bình chọn'],
  ['22.11 · 23:59','Khóa bình chọn'],
  ['24.11 · 15:00–19:00','HOLA DAY · trao giải · triển lãm']
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

const mergeAwards=(value)=>Array.isArray(value)&&value.length?value:DEFAULT_AWARDS

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
  const totalPrize=config.totalPrize||'26.000.000đ'
  const totalAwards=Number(config.totalAwards)||15
  const prizeSummary=config.prizeSummary||'7 giải chủ đề · 5 giải màu · 2 giải online · 1 giải Nhất'
  const pageTitle=config.title||'Thể lệ & Giải thưởng HALO HOLA 2026'
  const intro=config.intro||'Điều kiện tham gia, cách gửi tác phẩm, mốc thời gian và cơ cấu giải thưởng của HALO HOLA 2026.'
  const officialPdfUrl=(config.officialPdfUrl||'').trim()

  return <main className="rules-doc-page">
    <section className="rules-doc-hero">
      <div className="container rules-doc-hero-grid">
        <div className="rules-doc-hero-copy">
          <span className="rules-doc-kicker">THỂ LỆ CHÍNH THỨC · HALO HOLA 2026</span>
          <h1>{pageTitle}</h1>
          <p>{intro}</p>
          <div className="rules-doc-actions">
            <a className="btn btn-green" href="#tham-gia">Đọc thể lệ <ArrowRight/></a>
            <Link className="btn btn-outline" to="/gui-goc-nhin">Gửi góc nhìn</Link>
            {officialPdfUrl&&<a className="btn btn-outline" href={officialPdfUrl} target="_blank" rel="noreferrer"><FileText/> Bản PDF <ExternalLink/></a>}
          </div>
        </div>

        <aside className="rules-doc-summary" aria-label="Thông tin nhanh">
          <div className="rules-doc-summary-head">
            <span>Tổng tiền thưởng</span>
            <strong>{totalPrize}</strong>
          </div>
          <div className="rules-doc-summary-row">
            <Trophy/><b>{totalAwards} giải</b><small>{prizeSummary}</small>
          </div>
          <div className="rules-doc-summary-row">
            <Clock3/><b>10.11 · 23:59</b><small>Hạn nhận tác phẩm</small>
          </div>
        </aside>
      </div>
    </section>

    <div className="rules-doc-toc-wrap">
      <nav className="container rules-doc-toc" aria-label="Mục lục thể lệ">
        <span>Mục lục</span>
        <a href="#tham-gia">I. Đối tượng</a>
        <a href="#loai-hinh">II. Loại hình</a>
        <a href="#chu-de">III. Chủ đề</a>
        <a href="#giai-thuong">IV. Giải thưởng</a>
        <a href="#cach-tham-gia">V. Cách tham gia</a>
        <a href="#moc-thoi-gian">VI. Thời gian</a>
        <a href="#luu-y">VII. Quy định</a>
      </nav>
    </div>

    <div className="container rules-doc-shell">
      <article className="rules-doc-article">
        <section id="tham-gia" className="rules-doc-section">
          <div className="rules-doc-section-index">I.</div>
          <div>
            <header className="rules-doc-section-header">
              <span className="rules-doc-section-label">Đối tượng tham gia</span>
              <h2>Ai có thể tham gia</h2>
            </header>
            <p className="rules-doc-lead">Người dân, sinh viên, KTS, photographer, filmmaker, designer, creator — chuyên hay không chuyên; dùng máy ảnh hay điện thoại đều có thể gửi góc nhìn về Hòa Lạc.</p>

            <dl className="rules-doc-facts">
              <div className="rules-doc-fact"><Users/><dt>Đối tượng</dt><dd>Cá nhân hoặc nhóm; tham gia miễn phí.</dd></div>
              <div className="rules-doc-fact"><MapPin/><dt>Địa bàn</dt><dd>{COMMUNES.join(' · ')}</dd></div>
              <div className="rules-doc-fact"><ShieldCheck/><dt>Dưới 18 tuổi</dt><dd>Cần có sự đồng ý của phụ huynh hoặc người giám hộ.</dd></div>
            </dl>
          </div>
        </section>

        <section id="loai-hinh" className="rules-doc-section">
          <div className="rules-doc-section-index">II.</div>
          <div>
            <header className="rules-doc-section-header">
              <span className="rules-doc-section-label">Loại hình tác phẩm</span>
              <h2>Bốn cách để gửi một góc nhìn</h2>
            </header>
            <p className="rules-doc-lead">Tác phẩm có thể được thể hiện bằng hình ảnh, video, câu chuyện hoặc sáng tạo thị giác. Mỗi loại hình có yêu cầu kỹ thuật riêng.</p>

            <div className="rules-doc-table rules-doc-table-formats">
              <div className="rules-doc-table-head"><span>Loại hình</span><span>Nội dung</span><span>Thông số</span></div>
              {FORMATS.map(({icon:I,title,detail,spec})=><div className="rules-doc-table-row" key={title}>
                <div className="rules-doc-format-name"><span><I/></span><strong>{title}</strong></div>
                <p>{detail}</p>
                <small>{spec}</small>
              </div>)}
            </div>
          </div>
        </section>

        <section id="chu-de" className="rules-doc-section">
          <div className="rules-doc-section-index">III.</div>
          <div>
            <header className="rules-doc-section-header">
              <span className="rules-doc-section-label">Chủ đề</span>
              <h2>8 chủ đề về Hòa Lạc</h2>
            </header>
            <p className="rules-doc-lead">Người tham gia lựa chọn một trong tám chủ đề để kể câu chuyện của mình, từ văn hóa bản địa đến thiên nhiên, kiến trúc và con người Hòa Lạc.</p>

            <ol className="rules-doc-theme-list">
              {THEMES.map(([number,title,badge])=><li key={number}><span className="num">{number}</span><b>{title}</b>{badge&&<small>{badge}</small>}</li>)}
            </ol>
            <div className="rules-doc-note">Chủ đề 08 “Sắc màu Hòa Lạc” gồm 6 đặc trưng: Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc. Mọi tác phẩm hợp lệ ở cả 8 chủ đề đều được xét giải Sắc màu.</div>
          </div>
        </section>

        <section id="giai-thuong" className="rules-doc-section">
          <div className="rules-doc-section-index">IV.</div>
          <div>
            <header className="rules-doc-section-header">
              <span className="rules-doc-section-label">Cơ cấu giải thưởng</span>
              <h2>{totalAwards} giải thưởng HALO HOLA 2026</h2>
            </header>

            <div className="rules-doc-awards-summary">
              <strong>{totalPrize}</strong>
              <span>Tổng tiền mặt · {prizeSummary}</span>
            </div>

            <div className="rules-doc-table rules-doc-awards-table">
              <div className="rules-doc-table-head"><span>Nhóm giải</span><span>Số lượng</span><span>Giá trị</span><span>Mô tả</span></div>
              {awards.map((award,index)=><div key={award.code||award.name||index} className={'rules-doc-table-row '+(award.featured?'is-featured':'')}>
                <div className="rules-doc-award-name"><b>{award.name}</b><small>{award.label||'Giải thưởng'}</small></div>
                <div className="rules-doc-award-qty">{award.quantity||'—'}</div>
                <div className="rules-doc-award-money">{award.amount||'—'}</div>
                <div className="rules-doc-award-desc">{award.description}</div>
              </div>)}
            </div>

            <div className="rules-doc-award-policy">
              <div><b>Cách chọn Giải Nhất</b><span>{config.juryWeight||70}% Hội đồng + {config.communityWeight||30}% bình chọn cộng đồng.</span></div>
              <div><b>Giải được cộng dồn</b><span>Một tác phẩm có thể đồng thời nhận giải chủ đề, giải màu, giải online và Giải Nhất nếu đáp ứng điều kiện.</span></div>
              <div><b>Chứng nhận</b><span>TOP 3 từng chủ đề và TOP52 nhận chứng nhận của chương trình.</span></div>
            </div>
          </div>
        </section>

        <section id="cach-tham-gia" className="rules-doc-section">
          <div className="rules-doc-section-index">V.</div>
          <div>
            <header className="rules-doc-section-header">
              <span className="rules-doc-section-label">Cách tham gia</span>
              <h2>Tham gia trong 4 bước</h2>
            </header>
            <ol className="rules-doc-steps">
              <li><span className="num">01</span><b>Đến Hòa Lạc</b><p>Sáng tạo theo 1 trong 8 chủ đề của chương trình.</p></li>
              <li><span className="num">02</span><b>Nộp tác phẩm</b><p>Gửi qua form tại halohola.vn, kèm tên, chủ đề, địa điểm, thời gian và câu chuyện 50–150 chữ.</p></li>
              <li><span className="num">03</span><b>Tối đa 05 tác phẩm</b><p>Mỗi người được gửi tối đa 05 tác phẩm; có thể tham gia cá nhân hoặc theo nhóm.</p></li>
              <li><span className="num">04</span><b>Chia sẻ câu chuyện</b><p>Chia sẻ lên trang cá nhân hoặc Group CHECK IN HOALAC kèm hashtag #HaloHola.</p></li>
            </ol>
          </div>
        </section>

        <section id="moc-thoi-gian" className="rules-doc-section">
          <div className="rules-doc-section-index">VI.</div>
          <div>
            <header className="rules-doc-section-header">
              <span className="rules-doc-section-label">Mốc thời gian</span>
              <h2>Từ phát động đến HOLA DAY</h2>
            </header>
            <p className="rules-doc-lead">HOLA DAY diễn ra ngày 24.11, là điểm hẹn triển lãm TOP52, trao giải và công bố kết quả HALO HOLA 2026.</p>
            <div className="rules-doc-timeline">
              {TIMELINE.map(([date,title],index)=><div key={date} className={'rules-doc-timeline-row '+(index===TIMELINE.length-1?'is-final':'')}><time>{date}</time><b>{title}</b></div>)}
            </div>
          </div>
        </section>

        <section id="luu-y" className="rules-doc-section">
          <div className="rules-doc-section-index">VII.</div>
          <div>
            <header className="rules-doc-section-header">
              <span className="rules-doc-section-label">Quy định quan trọng</span>
              <h2>Bản quyền, tính trung thực và quyền hình ảnh</h2>
            </header>
            <ul className="rules-doc-checklist">
              {RULE_NOTES.map(note=><li key={note}><Check/><span>{note}</span></li>)}
            </ul>
          </div>
        </section>

        <div className="rules-doc-cta">
          <div><span>HALO HOLA 2026</span><h2>Mỗi góc nhìn là một phần câu chuyện Hòa Lạc.</h2></div>
          <Link className="btn btn-terra" to="/gui-goc-nhin">Gửi góc nhìn <ArrowRight/></Link>
        </div>
      </article>
    </div>
  </main>
}
