import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock3,
  ArrowRight,
  QrCode,
  MessageCircleQuestion,
  Shirt,
  Users,
  MapPin,
  Sparkles,
  Trophy,
  Mic2,
  Camera,
  ChevronRight,
  CheckCircle2,
  X,
} from 'lucide-react'
import { agenda, img } from '../data/siteData.js'
import { registerHolaDay } from '../services/communityApi.js'

const TARGET_DATE = new Date('2026-11-28T15:00:00+07:00').getTime()
const initialForm={name:'',email:'',phone:'',roleLabel:'',interest:'',note:'',allowUpdates:false}

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

  const experiences=useMemo(()=>[
    ['Triển lãm TOP52','52 góc nhìn nổi bật cùng xuất hiện trong một không gian kể chuyện.',img.event,Trophy],
    ['HOLA TALK','Những cuộc trò chuyện về một Hòa Lạc đang chuyển mình.',img.talk,Mic2],
    ['Trao giải','Khoảnh khắc tôn vinh các góc nhìn nổi bật của HALO HOLA 2026.',img.award,Sparkles],
    ['WE HOLA','Kết nối những người cùng yêu, sống và làm việc tại Hòa Lạc.',img.people,Users],
    ['Photobooth & Calendar','Mang về một dấu nhớ của HOLA DAY và hành trình 2026.',img.crafts,Camera],
  ],[])

  return <main className="hola-day-page">
    <section className="hola-day-hero">
      <div className="hola-day-hero-bg" style={{backgroundImage:`linear-gradient(90deg,rgba(12,52,38,.96) 0%,rgba(12,52,38,.86) 42%,rgba(12,52,38,.26) 72%,rgba(12,52,38,.06) 100%),url(${img.event})`}} />
      <div className="container hola-day-hero-inner">
        <div className="hola-day-hero-copy">
          <span className="hola-day-kicker">SỰ KIỆN THƯỜNG NIÊN · HALO HOLA 2026</span>
          <h1>HOLA DAY <em>2026</em></h1>
          <p>Ngày hội sáng tạo & khám phá Hòa Lạc — nơi 52 góc nhìn cùng hội tụ, gặp gỡ và kể tiếp câu chuyện về vùng đất đang chuyển mình.</p>
          <div className="hola-day-facts">
            <span><CalendarDays/>28.11.2026</span>
            <span><Clock3/>15:00–19:00</span>
            <span><MapPin/>Hòa Lạc</span>
          </div>
          <div className="hola-day-actions">
            <button type="button" className="btn btn-terra" onClick={openRegistration}>Đăng ký tham dự <ArrowRight size={17}/></button>
            <a className="hola-day-text-link" href="#lich-trinh">Xem lịch trình <ChevronRight size={17}/></a>
          </div>
        </div>

        <aside className="hola-day-hero-card">
          <div className="hola-day-hero-card-top">
            <span>HOLA DAY</span><b>28.11</b>
          </div>
          <div className="hola-day-hero-card-copy">
            <small>ĐIỂM HẸN CỦA 52 GÓC NHÌN</small>
            <h2>Một ngày để gặp nhau ngoài những khung hình.</h2>
            <p>TOP52 · HOLA TALK · Trao giải · WE HOLA · Kết nối cộng đồng</p>
          </div>
          <div className="hola-day-card-stamp"><Sparkles/>HELLO HÒA LẠC</div>
        </aside>
      </div>
    </section>

    <section className="hola-day-countdown" aria-label="Đếm ngược đến HOLA DAY 2026">
      <div className="container hola-day-countdown-inner">
        <div className="hola-day-countdown-label"><span>ĐẾM NGƯỢC</span><b>HOLA DAY 2026</b></div>
        <div className="hola-day-countdown-grid">
          <div><b>{two(countdown.days)}</b><small>Ngày</small></div>
          <i>:</i>
          <div><b>{two(countdown.hours)}</b><small>Giờ</small></div>
          <i>:</i>
          <div><b>{two(countdown.minutes)}</b><small>Phút</small></div>
          <i>:</i>
          <div><b>{two(countdown.seconds)}</b><small>Giây</small></div>
        </div>
      </div>
    </section>

    <section id="lich-trinh" className="container hola-day-section hola-day-agenda-section">
      <div className="hola-day-section-head">
        <div><span className="eyebrow">LỊCH TRÌNH SỰ KIỆN</span><h2>Một buổi chiều, nhiều điểm chạm.</h2></div>
        <p>Từ triển lãm, trò chuyện, hoàng hôn đến lễ trao giải — mỗi mốc là một lớp trải nghiệm khác nhau của HOLA DAY.</p>
      </div>
      <div className="hola-day-agenda">
        {agenda.map((item,index)=><article className="hola-day-agenda-item" key={`${item.time}-${item.title}`}>
          <div className="hola-day-agenda-time"><span>{String(index+1).padStart(2,'0')}</span><b>{item.time}</b></div>
          <div className="hola-day-agenda-image"><img src={item.image} alt=""/></div>
          <div className="hola-day-agenda-copy"><h3>{item.title}</h3><p>{item.desc}</p></div>
          <ChevronRight className="hola-day-agenda-arrow"/>
        </article>)}
      </div>
    </section>

    <section className="hola-day-venue-section">
      <div className="container hola-day-venue-grid">
        <div className="hola-day-venue-copy">
          <span className="eyebrow">KHÔNG GIAN HOLA DAY</span>
          <h2>Đi một vòng, chạm đủ câu chuyện.</h2>
          <p>Không gian được chia thành những điểm trải nghiệm rõ ràng để bạn có thể xem, nghe, gặp gỡ và tham gia theo nhịp riêng.</p>
          <div className="hola-day-venue-list">
            <span><b>01</b>Triển lãm TOP52</span>
            <span><b>02</b>HOLA TALK</span>
            <span><b>03</b>Main Event</span>
            <span><b>04</b>Photobooth</span>
            <span><b>05</b>WE HOLA</span>
            <span><b>06</b>Check-in</span>
          </div>
        </div>
        <div className="hola-day-venue-map" aria-label="Sơ đồ không gian HOLA DAY">
          <div className="hola-day-map-orbit orbit-a"/>
          <div className="hola-day-map-orbit orbit-b"/>
          <span className="hola-day-zone z1"><b>01</b>TOP52</span>
          <span className="hola-day-zone z2"><b>02</b>HOLA TALK</span>
          <span className="hola-day-zone z3"><b>03</b>MAIN EVENT</span>
          <span className="hola-day-zone z4"><b>04</b>PHOTOBOOTH</span>
          <span className="hola-day-zone z5"><b>05</b>WE HOLA</span>
          <span className="hola-day-zone z6"><b>06</b>CHECK-IN</span>
          <div className="hola-day-map-center"><MapPin/><span>HOLA DAY</span><b>2026</b></div>
        </div>
      </div>
    </section>

    <section className="container hola-day-section hola-day-experience-section">
      <div className="hola-day-section-head">
        <div><span className="eyebrow">TRẢI NGHIỆM NỔI BẬT</span><h2>Đừng chỉ đến để xem.</h2></div>
        <p>HOLA DAY được thiết kế để bạn thực sự tham gia vào câu chuyện — bằng ánh nhìn, cuộc trò chuyện và những kết nối mới.</p>
      </div>
      <div className="hola-day-experience-grid">
        {experiences.map(([name,desc,image,Icon],index)=><article key={name} className={index<2?'featured':''}>
          <img src={image} alt=""/>
          <div className="hola-day-experience-overlay"/>
          <div className="hola-day-experience-copy"><Icon/><span>HOLA DAY 2026</span><h3>{name}</h3><p>{desc}</p></div>
        </article>)}
      </div>
    </section>

    <section id="hola-day-info" className="hola-day-info-section">
      <div className="container hola-day-info-grid">
        <div className="hola-day-join-card">
          <div className="hola-day-qr"><QrCode/></div>
          <div>
            <span className="eyebrow">THAM GIA HOLA DAY 2026</span>
            <h2>Hẹn gặp bạn ở Hòa Lạc.</h2>
            <p>Đăng ký trước để BTC có thông tin phục vụ check-in, cập nhật địa điểm và các thông báo cần thiết của HOLA DAY.</p>
            <div className="hola-day-mini-checks"><span><CheckCircle2/>15:00–19:00</span><span><CheckCircle2/>Tham dự cộng đồng</span><span><CheckCircle2/>Nhiều hoạt động trong một điểm hẹn</span></div>
            <button type="button" className="btn btn-terra" onClick={openRegistration}>Đăng ký tham dự <ArrowRight size={17}/></button>
          </div>
        </div>
        <div className="hola-day-info-stack">
          <article><MessageCircleQuestion/><div><span>FAQ</span><h3>Thông tin tham dự</h3><p>Thông tin chính thức về địa điểm và check-in sẽ được gửi tới người đã đăng ký khi BTC chốt.</p></div></article>
          <article><Shirt/><div><span>DRESS CODE</span><h3>Xanh lá · Be · Nâu · Trắng</h3><p>Một bảng màu gần với tinh thần Hòa Lạc và không gian sự kiện.</p></div></article>
          <article><Users/><div><span>CÁCH THAM GIA</span><h3>Đến · Gặp · Trải nghiệm · Kết nối</h3><p>Mang theo sự tò mò và một góc nhìn của riêng bạn.</p></div></article>
        </div>
      </div>
    </section>

    {showRegistration&&<div className="tour-register-modal" role="dialog" aria-modal="true" aria-label="Đăng ký HOLA DAY 2026" onMouseDown={event=>{if(event.target===event.currentTarget)setShowRegistration(false)}}>
      <section className="tour-register-panel" onMouseDown={event=>event.stopPropagation()}>
        <button className="tour-register-close" type="button" aria-label="Đóng form đăng ký" onClick={()=>setShowRegistration(false)}><X/></button>
        <div className="tour-register-modal-grid">
          <div>
            <span className="eyebrow">ĐĂNG KÝ HOLA DAY 2026</span>
            <h2>28.11 · 15:00–19:00</h2>
            <p>Đăng ký trước để quá trình check-in tại sự kiện nhanh hơn và BTC có thể gửi cập nhật cần thiết.</p>
            <div className="tour-register-note"><b>HOLA DAY là ngày hội sáng tạo & khám phá Hòa Lạc.</b><span>Thông tin đăng ký được lưu trên hệ thống HALO HOLA và không chia sẻ cho đối tác.</span></div>
          </div>
          {result?<div className="tour-register-success"><CheckCircle2/><h3>Đăng ký thành công</h3><p>Mã check-in của bạn:</p><strong>{result.code}</strong><small>Hãy lưu mã này để tra nhanh khi BTC cần xác nhận.</small></div>:
          <form className="tour-register-form" onSubmit={submitRegistration}>
            <label>Họ và tên *<input required minLength="2" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label>
            <label>Email *<input required type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/></label>
            <label>Số điện thoại *<input required minLength="8" value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))}/></label>
            <label>Đối tượng<select value={form.roleLabel} onChange={e=>setForm(v=>({...v,roleLabel:e.target.value}))}><option value="">Chọn đối tượng</option><option>Tác giả / Creator</option><option>Học sinh – Sinh viên</option><option>Người dân Hòa Lạc</option><option>Đối tác / Doanh nghiệp</option><option>Khách mời</option><option>Công chúng</option><option>Khác</option></select></label>
            <label className="full">Bạn quan tâm hoạt động nào?<textarea rows="2" maxLength="1500" value={form.interest} onChange={e=>setForm(v=>({...v,interest:e.target.value}))} placeholder="TOP52, HOLA TALK, trao giải, WE HOLA, networking..."/></label>
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
