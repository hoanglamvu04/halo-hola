import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Brush, CalendarDays, Camera, Check, Clock3, Heart, MapPin,
  Megaphone, Medal, Palette, PenTool, ShieldCheck, Trophy, Users, Video
} from 'lucide-react'
import { getSiteSettings } from '../services/api.js'
import '../styles/rules-awards-page.css'

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
  const intro=config.intro||'Một trang để bạn xem nhanh điều kiện tham gia, cách gửi tác phẩm, các mốc quan trọng và toàn bộ cơ cấu 15 giải của HALO HOLA 2026.'

  return <main className="rules-awards-page">
    <section className="rules-awards-hero">
      <div className="container rules-awards-hero-inner">
        <div className="rules-awards-hero-copy">
          <span className="eyebrow">52 GÓC NHÌN · 1 HÒA LẠC</span>
          <h1>{pageTitle}</h1>
          <p>{intro}</p>
          <div className="rules-awards-hero-actions">
            <a className="btn btn-green" href="#giai-thuong">Xem giải thưởng <ArrowRight/></a>
            <Link className="btn btn-outline" to="/gui-goc-nhin">Gửi góc nhìn</Link>
          </div>
        </div>
        <div className="rules-awards-hero-card">
          <span>Tổng giải thưởng tiền mặt</span>
          <strong>{totalPrize}</strong>
          <div><Trophy/><b>{totalAwards} giải</b><small>{prizeSummary}</small></div>
          <div><Clock3/><b>10.11 · 23:59</b><small>Hạn nhận tác phẩm</small></div>
        </div>
      </div>
    </section>

    <nav className="rules-awards-jump container" aria-label="Đi nhanh">
      <a href="#tham-gia">Ai tham gia</a>
      <a href="#loai-hinh">Loại hình</a>
      <a href="#chu-de">8 chủ đề</a>
      <a href="#giai-thuong">Giải thưởng</a>
      <a href="#cach-tham-gia">Cách tham gia</a>
      <a href="#moc-thoi-gian">Mốc thời gian</a>
      <a href="#luu-y">Lưu ý</a>
    </nav>

    <section id="tham-gia" className="rules-section container rules-intro-grid">
      <div className="rules-section-heading">
        <span className="eyebrow">MỞ CHO MỌI NGƯỜI</span>
        <h2>Ai cũng có thể kể một góc nhìn về Hòa Lạc</h2>
        <p>Người dân, sinh viên, KTS, photographer, filmmaker, designer, creator — chuyên hay không chuyên; dùng máy ảnh hay điện thoại đều được.</p>
      </div>
      <div className="rules-fact-panel">
        <div><Users/><b>Mọi người</b><span>Cá nhân hoặc nhóm · tham gia miễn phí</span></div>
        <div><MapPin/><b>9 xã</b><span>{COMMUNES.join(' · ')}</span></div>
        <div><ShieldCheck/><b>Dưới 18 tuổi</b><span>Cần phụ huynh hoặc người giám hộ đồng ý</span></div>
      </div>
    </section>

    <section id="loai-hinh" className="rules-section rules-section-soft">
      <div className="container">
        <div className="rules-section-heading compact">
          <span className="eyebrow">01 · LOẠI HÌNH</span>
          <h2>Bốn cách để gửi một góc nhìn</h2>
        </div>
        <div className="rules-format-grid">
          {FORMATS.map(({icon:I,title,detail,spec})=><article key={title}>
            <span className="rules-format-icon"><I/></span>
            <h3>{title}</h3>
            <p>{detail}</p>
            <small>{spec}</small>
          </article>)}
        </div>
      </div>
    </section>

    <section id="chu-de" className="rules-section container">
      <div className="rules-section-heading split">
        <div><span className="eyebrow">02 · CHỦ ĐỀ</span><h2>8 chủ đề về Hòa Lạc</h2></div>
        <p>Chủ đề 08 “Sắc màu Hòa Lạc” gồm 6 đặc trưng: Đá ong · Nắng · Xanh rêu · Xanh non · Be · Sắc Hòa Lạc. Mọi tác phẩm hợp lệ ở cả 8 chủ đề đều được xét giải Sắc màu.</p>
      </div>
      <div className="rules-theme-grid">
        {THEMES.map(([number,title,badge])=><div key={number}><span>{number}</span><b>{title}</b>{badge&&<small>{badge}</small>}</div>)}
      </div>
    </section>

    <section id="giai-thuong" className="rules-section rules-awards-block">
      <div className="container">
        <div className="rules-section-heading awards-heading">
          <div><span className="eyebrow">03 · GIẢI THƯỞNG</span><h2>{totalAwards} giải · tổng {totalPrize}</h2></div>
          <div className="rules-awards-total"><Trophy/><span>Tổng tiền mặt</span><strong>{totalPrize}</strong></div>
        </div>

        <div className="rules-award-grid">
          {awards.map((award,index)=><article key={award.code||award.name||index} className={'rules-award-card '+(award.featured?'featured':'')} data-tone={award.tone||'forest'}>
            <div className="rules-award-card-top">
              <span>{award.label||'Giải thưởng'}</span>
              {award.featured?<Trophy/>:index===2?<Palette/>:index===3?<Heart/>:index===4?<Megaphone/>:<Medal/>}
            </div>
            <h3>{award.name}</h3>
            <div className="rules-award-money">{award.amount}</div>
            {award.quantity&&<b className="rules-award-qty">{award.quantity}</b>}
            <p>{award.description}</p>
          </article>)}
        </div>

        <div className="rules-award-notes">
          <div><b>Cách chọn Giải Nhất</b><span>{config.juryWeight||70}% Hội đồng + {config.communityWeight||30}% bình chọn cộng đồng.</span></div>
          <div><b>Giải được cộng dồn</b><span>Một tác phẩm có thể đồng thời nhận giải chủ đề, giải màu, giải online và Giải Nhất nếu đáp ứng điều kiện.</span></div>
          <div><b>Chứng nhận</b><span>TOP 3 từng chủ đề và TOP52 nhận chứng nhận của chương trình.</span></div>
        </div>
      </div>
    </section>

    <section id="cach-tham-gia" className="rules-section container">
      <div className="rules-section-heading compact">
        <span className="eyebrow">04 · CÁCH THAM GIA</span>
        <h2>Tham gia trong 4 bước</h2>
      </div>
      <div className="rules-step-grid">
        <article><span>01</span><h3>Đến Hòa Lạc</h3><p>Sáng tạo theo 1 trong 8 chủ đề của chương trình.</p></article>
        <article><span>02</span><h3>Nộp tác phẩm</h3><p>Gửi qua form tại halohola.vn, kèm tên, chủ đề, địa điểm, thời gian và câu chuyện 50–150 chữ.</p></article>
        <article><span>03</span><h3>Tối đa 05 tác phẩm</h3><p>Mỗi người được gửi tối đa 05 tác phẩm; có thể tham gia cá nhân hoặc theo nhóm.</p></article>
        <article><span>04</span><h3>Chia sẻ câu chuyện</h3><p>Chia sẻ lên trang cá nhân hoặc Group CHECK IN HOALAC kèm hashtag #HaloHola.</p></article>
      </div>
    </section>

    <section id="moc-thoi-gian" className="rules-section rules-section-soft">
      <div className="container rules-timeline-layout">
        <div className="rules-section-heading compact">
          <span className="eyebrow">05 · MỐC THỜI GIAN</span>
          <h2>Từ phát động đến HOLA DAY</h2>
          <p>HOLA DAY diễn ra ngày 24.11, là điểm hẹn triển lãm TOP52, trao giải và công bố kết quả HALO HOLA 2026.</p>
        </div>
        <div className="rules-timeline">
          {TIMELINE.map(([date,title],index)=><div key={date}><span>{String(index+1).padStart(2,'0')}</span><b>{date}</b><p>{title}</p></div>)}
        </div>
      </div>
    </section>

    <section id="luu-y" className="rules-section container">
      <div className="rules-section-heading compact">
        <span className="eyebrow">06 · LƯU Ý QUAN TRỌNG</span>
        <h2>Bản quyền, tính trung thực và quyền hình ảnh</h2>
      </div>
      <div className="rules-note-list">
        {RULE_NOTES.map(note=><div key={note}><Check/><span>{note}</span></div>)}
      </div>
    </section>

    <section className="rules-final-cta">
      <div className="container">
        <div><span className="eyebrow">HALO HOLA 2026</span><h2>Mỗi góc nhìn là một phần câu chuyện Hòa Lạc.</h2></div>
        <Link className="btn btn-terra" to="/gui-goc-nhin">Gửi góc nhìn <ArrowRight/></Link>
      </div>
    </section>
  </main>
}
