import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Mic2,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { agenda, img } from '../data/siteData.js'
import { registerHolaDay } from '../services/communityApi.js'

const TARGET_DATE = new Date('2026-11-24T15:00:00+07:00').getTime()
const initialForm={name:'',email:'',phone:'',roleLabel:'',interest:'',note:'',allowUpdates:false}

const touchpoints=[
  ['01','Triển lãm TOP52','52 góc nhìn nổi bật của Hòa Lạc'],
  ['02','HOLA TALK','Những cuộc trò chuyện mở'],
  ['03','Nắng Hòa Lạc','Khoảng dừng của ánh sáng và cảm xúc'],
  ['04','Main Event','Opening, ghi nhận, tuyên dương'],
  ['05','WE HOLA','Gặp gỡ những người cùng yêu Hòa Lạc'],
  ['06','Check-in','Điểm bắt đầu cho một buổi chiều chung'],
]

const holaDayHeroSlides=[
  {image:img.event,label:'TOP52',caption:'52 góc nhìn trong cùng một không gian.'},
  {image:img.talk,label:'HOLA TALK',caption:'Những câu chuyện phía sau mỗi góc nhìn.'},
  {image:img.sunset,label:'NẮNG HÒA LẠC',caption:'Một khoảng dừng cho ánh sáng và cảm xúc.'},
  {image:img.award,label:'MAIN EVENT',caption:'Opening, ghi nhận, tuyên dương.'},
  {image:img.people,label:'WE HOLA',caption:'Một Hòa Lạc, nhiều câu chuyện.'},
]

const experiences=[
  {
    label:'XEM',
    title:'52 góc nhìn trong một không gian.',
    desc:'TOP52 được đặt cạnh nhau như một lát cắt chung về Hòa Lạc — đủ gần để xem kỹ, đủ mở để bắt đầu câu chuyện.',
    image:img.event,
    Icon:Trophy,
  },
  {
    label:'GẶP',
    title:'Nghe những câu chuyện phía sau khung hình.',
    desc:'HOLA TALK và những cuộc gặp trực tiếp đưa tác giả, người địa phương và cộng đồng về cùng một bàn trò chuyện.',
    image:img.talk,
    Icon:Mic2,
  },
  {
    label:'CÙNG THAM GIA',
    title:'Mang một kết nối mới về cùng bạn.',
    desc:'WE HOLA, photobooth, calendar và những khoảng giao lưu biến HOLA DAY thành một điểm hẹn chứ không chỉ là nơi để xem.',
    image:img.people,
    Icon:Users,
  },
]

function getCountdown(){
  const distance=Math.max(0,TARGET_DATE-Date.now())
  return {
    days:Math.floor(distance/86400000),
    hours:Math.floor((distance%86400000)/3600000),
    minutes:Math.floor((distance%3600000)/60000),
    seconds:Math.floor((distance%60000)/1000),
  }
}

const two=value=>String(value).padStart(2,'0')

export default function HolaDayPage(){
  const [countdown,setCountdown]=useState(getCountdown)
  const [heroSlide,setHeroSlide]=useState(0)
  const heroTouchStartX=useRef(null)
  const [showRegistration,setShowRegistration]=useState(false)
  const [form,setForm]=useState(initialForm)
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')
  const [submitting,setSubmitting]=useState(false)

  useEffect(()=>{
    const timer=setInterval(()=>setCountdown(getCountdown()),1000)
    return()=>clearInterval(timer)
  },[])

  useEffect(()=>{
    if(!showRegistration)return undefined
    const previousOverflow=document.body.style.overflow
    const closeOnEscape=event=>{if(event.key==='Escape')setShowRegistration(false)}
    document.body.style.overflow='hidden'
    window.addEventListener('keydown',closeOnEscape)
    return()=>{
      document.body.style.overflow=previousOverflow
      window.removeEventListener('keydown',closeOnEscape)
    }
  },[showRegistration])

  const showHeroSlide=index=>{
    const total=holaDayHeroSlides.length
    setHeroSlide((index+total)%total)
  }

  const handleHeroTouchStart=event=>{
    heroTouchStartX.current=event.touches?.[0]?.clientX??null
  }

  const handleHeroTouchEnd=event=>{
    if(heroTouchStartX.current===null)return
    const endX=event.changedTouches?.[0]?.clientX
    const delta=typeof endX==='number'?endX-heroTouchStartX.current:0
    heroTouchStartX.current=null
    if(Math.abs(delta)<42)return
    showHeroSlide(heroSlide+(delta<0?1:-1))
  }

  const openRegistration=()=>{
    setError('')
    setResult(null)
    setShowRegistration(true)
  }

  const submitRegistration=async event=>{
    event.preventDefault()
    setSubmitting(true);setError('')
    try{
      const data=await registerHolaDay(form)
      setResult(data)
    }catch(err){setError(err.message)}
    finally{setSubmitting(false)}
  }

  return <main className="hola-day-page">
    <section className="hola-day-hero hola-day-hero--editorial" aria-labelledby="hola-day-title">
      <div className="container hola-day-editorial-shell">
        <div className="hola-day-editorial-layout">
          <div className="hola-day-editorial-copy">
            <div className="hola-day-editorial-kicker"><span>HALO HOLA 2026</span><i aria-hidden="true"/><span>NGÀY HỘI CỘNG ĐỒNG</span></div>
            <h1 id="hola-day-title">HOLA DAY</h1>
            <p className="hola-day-editorial-deck">Một buổi chiều.<br/>Gặp nhau ở Hòa Lạc.</p>
            <p className="hola-day-editorial-description">Cùng xem TOP52, nghe những câu chuyện phía sau mỗi góc nhìn và gặp những người cùng yêu Hòa Lạc.</p>
            <div className="hola-day-editorial-facts" aria-label="Thời gian và địa điểm">
              <span><CalendarDays aria-hidden="true"/><time dateTime="2026-11-24">24.11.2026</time></span>
              <span><Clock3 aria-hidden="true"/>15:00 – 19:00</span>
              <span><MapPin aria-hidden="true"/>Hòa Lạc</span>
            </div>
            <div className="hola-day-editorial-actions">
              <button type="button" className="hola-day-editorial-register" onClick={openRegistration}>Đăng ký tham dự <ArrowRight aria-hidden="true"/></button>
              <a href="#lich-trinh" className="hola-day-editorial-schedule">Xem lịch trình <ArrowRight aria-hidden="true"/></a>
            </div>
          </div>

          <figure className="hola-day-editorial-visual" onTouchStart={handleHeroTouchStart} onTouchEnd={handleHeroTouchEnd}>
            <div className="hola-day-editorial-photo">
              <img
                key={holaDayHeroSlides[heroSlide].image}
                src={holaDayHeroSlides[heroSlide].image}
                alt={holaDayHeroSlides[heroSlide].caption}
                width="1400"
                height="875"
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="hola-day-hero-slide-label">
              <span>{holaDayHeroSlides[heroSlide].label}</span>
              <b>{holaDayHeroSlides[heroSlide].caption}</b>
            </div>
            <div className="hola-day-hero-slide-dots" aria-label="Chọn ảnh HOLA DAY">
              {holaDayHeroSlides.map((slide,index)=><button
                type="button"
                key={slide.label}
                className={index===heroSlide?'active':''}
                onClick={()=>showHeroSlide(index)}
                aria-label={'Xem ảnh '+String(index+1).padStart(2,'0')}
              />)}
            </div>
            <div className="hola-day-hero-slide-controls" aria-label="Điều hướng ảnh HOLA DAY">
              <button type="button" onClick={()=>showHeroSlide(heroSlide-1)} aria-label="Ảnh trước"><ArrowLeft/></button>
              <span>{String(heroSlide+1).padStart(2,'0')} / {String(holaDayHeroSlides.length).padStart(2,'0')}</span>
              <button type="button" onClick={()=>showHeroSlide(heroSlide+1)} aria-label="Ảnh tiếp theo"><ArrowRight/></button>
            </div>
          </figure>
        </div>

        <div className="hola-day-editorial-foot">
          <p className="hola-day-editorial-program"><span>TOP52</span><i aria-hidden="true"/><span>HOLA TALK</span><i aria-hidden="true"/><span>WE HOLA</span></p>
          <div className="hola-day-editorial-countdown" role="timer" aria-live="off" aria-label="Đếm ngược đến HOLA DAY">
            <span>Đếm ngược</span>
            <strong>{two(countdown.days)} <small>ngày</small></strong>
            <span className="hola-day-editorial-countdown-clock">{two(countdown.hours)}:{two(countdown.minutes)}:{two(countdown.seconds)}</span>
          </div>
        </div>
      </div>
    </section>

    <section id="lich-trinh" className="hola-day-agenda-section">
      <div className="container hola-day-agenda-layout">
        <header className="hola-day-agenda-intro">
          <span className="hola-day-section-label">01 · LỊCH TRÌNH</span>
          <h2>Một buổi chiều.<br/>Năm nhịp trải nghiệm.</h2>
          <p>Từ check-in, triển lãm, trò chuyện đến khoảnh khắc hoàng hôn và phần gặp gỡ cuối ngày — lịch trình được giữ đủ gọn để bạn có thời gian thực sự ở trong từng trải nghiệm.</p>
          <div className="hola-day-agenda-note"><CalendarDays/><span><b>Thứ Ba · 24.11.2026</b><small>15:00 bắt đầu · 19:00 khép lại</small></span></div>
        </header>

        <div className="hola-day-agenda-list">
          {agenda.map((item,index)=>{
            const displayImage=item.title==='Hello Hòa Lạc'?img.people:item.image
            return <article className="hola-day-agenda-row" key={`${item.time}-${item.title}`}>
              <div className="hola-day-agenda-index">{String(index+1).padStart(2,'0')}</div>
              <time>{item.time}</time>
              <div className="hola-day-agenda-copy"><h3>{item.title}</h3><p>{item.desc}</p></div>
              <div className="hola-day-agenda-thumb"><img src={displayImage} alt=""/></div>
            </article>
          })}
        </div>
      </div>
    </section>

    <section className="hola-day-touch-section">
      <div className="container">
        <div className="hola-day-touch-head">
          <div><span className="hola-day-section-label light">02 · KHÔNG GIAN & TRẢI NGHIỆM</span><h2>Một buổi chiều.<br/>Sáu điểm để chạm.</h2></div>
          <p>Không cần chạy thật nhiều nơi. HOLA DAY gom các lớp trải nghiệm về một điểm hẹn để bạn có thể xem, nghe, gặp và tham gia theo nhịp riêng.</p>
        </div>
        <div className="hola-day-touch-grid">
          <div className="hola-day-touch-image">
            <img src={img.event} alt="Không khí sự kiện HOLA DAY"/>
            <div className="hola-day-touch-image-note"><Sparkles/><span>HELLO<br/>HÒA LẠC</span></div>
          </div>
          <div className="hola-day-touch-list">
            {touchpoints.map(([no,title,note])=><article key={no}>
              <span>{no}</span><div><h3>{title}</h3><p>{note}</p></div><b>↗</b>
            </article>)}
          </div>
        </div>
      </div>
    </section>

    <section className="hola-day-experience-section">
      <div className="container">
        <div className="hola-day-experience-head">
          <span className="hola-day-section-label">03 · ĐỪNG CHỈ ĐẾN ĐỂ XEM</span>
          <h2>HOLA DAY là một ngày để thực sự tham gia.</h2>
        </div>
        <div className="hola-day-experience-grid">
          {experiences.map(({label,title,desc,image,Icon},index)=><article key={label} className={`hola-day-experience-card e${index+1}`}>
            <div className="hola-day-experience-media"><img src={image} alt=""/></div>
            <div className="hola-day-experience-body">
              <div className="hola-day-experience-label"><Icon/><span>{label}</span></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section id="hola-day-info" className="hola-day-final-section">
      <div className="container hola-day-final-grid">
        <div className="hola-day-final-copy">
          <span className="hola-day-section-label light">04 · HẸN GẶP Ở HÒA LẠC</span>
          <h2>Đến với một góc nhìn.<br/>Rời đi với một kết nối mới.</h2>
          <p>Đăng ký trước để BTC có thông tin phục vụ check-in và gửi cập nhật chính thức về địa điểm, chương trình và những lưu ý cần thiết.</p>
          <div className="hola-day-final-facts">
            <span><CalendarDays/>24.11.2026</span>
            <span><Clock3/>15:00—19:00</span>
            <span><MapPin/>Hòa Lạc</span>
          </div>
          <button type="button" className="hola-day-primary light-button" onClick={openRegistration}>Đăng ký tham dự <ArrowRight/></button>
        </div>

        <div className="hola-day-info-lines">
          <article><span>01</span><div><small>THÔNG TIN THAM DỰ</small><h3>Địa điểm & check-in</h3><p>Thông tin chính thức sẽ được gửi tới người đã đăng ký sau khi BTC chốt.</p></div></article>
          <article><span>02</span><div><small>DRESS CODE</small><h3>Xanh lá · Be · Nâu · Trắng</h3><p>Một bảng màu gần với tinh thần Hòa Lạc và không gian sự kiện.</p></div></article>
          <article><span>03</span><div><small>CÁCH THAM GIA</small><h3>Đến · Gặp · Trải nghiệm · Kết nối</h3><p>Mang theo sự tò mò và một góc nhìn của riêng bạn.</p></div></article>
        </div>
      </div>
    </section>

    {showRegistration&&<div className="tour-register-modal" role="dialog" aria-modal="true" aria-label="Đăng ký HOLA DAY 2026" onMouseDown={event=>{if(event.target===event.currentTarget)setShowRegistration(false)}}>
      <section className="tour-register-panel" onMouseDown={event=>event.stopPropagation()}>
        <button className="tour-register-close" type="button" aria-label="Đóng form đăng ký" onClick={()=>setShowRegistration(false)}><X/></button>
        <div className="tour-register-modal-grid">
          <div>
            <span className="eyebrow">ĐĂNG KÝ HOLA DAY 2026</span>
            <h2>24.11 · 15:00–19:00</h2>
            <p>Đăng ký trước để quá trình check-in tại sự kiện nhanh hơn và BTC có thể gửi cập nhật cần thiết.</p>
            <div className="tour-register-note"><b>HOLA DAY là ngày hội sáng tạo & khám phá Hòa Lạc.</b><span>Thông tin đăng ký được lưu trên hệ thống HALO HOLA và không chia sẻ cho đối tác.</span></div>
          </div>
          {result?<div className="tour-register-success"><CheckCircle2/><h3>Đăng ký thành công</h3><p>Mã check-in của bạn:</p><strong>{result.code}</strong><small>Hãy lưu mã này để tra nhanh khi BTC cần xác nhận.</small></div>:
          <form className="tour-register-form" onSubmit={submitRegistration}>
            <label>Họ và tên *<input required minLength="2" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label>
            <label>Email *<input required type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/></label>
            <label>Số điện thoại *<input required minLength="8" value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))}/></label>
            <label>Đối tượng<select value={form.roleLabel} onChange={e=>setForm(v=>({...v,roleLabel:e.target.value}))}><option value="">Chọn đối tượng</option><option>Tác giả / Creator</option><option>Học sinh – Sinh viên</option><option>Người dân Hòa Lạc</option><option>Đối tác / Doanh nghiệp</option><option>Khách mời</option><option>Công chúng</option><option>Khác</option></select></label>
            <label className="full">Bạn quan tâm hoạt động nào?<textarea rows="2" maxLength="1500" value={form.interest} onChange={e=>setForm(v=>({...v,interest:e.target.value}))} placeholder="TOP52, HOLA TALK, tuyên dương, WE HOLA, networking..."/></label>
            <label className="full">Ghi chú<textarea rows="2" maxLength="1500" value={form.note} onChange={e=>setForm(v=>({...v,note:e.target.value}))}/></label>
            <label className="full"><input type="checkbox" checked={form.allowUpdates} onChange={e=>setForm(v=>({...v,allowUpdates:e.target.checked}))}/> Tôi đồng ý nhận thông tin cập nhật về HOLA DAY và HALO HOLA.</label>
            {error&&<div className="form-error full">{error}</div>}
            <button className="btn btn-terra full" disabled={submitting}>{submitting?'Đang đăng ký...':'Xác nhận đăng ký'}</button>
          </form>}
        </div>
      </section>
    </div>}
  </main>
}