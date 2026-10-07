import { useEffect, useState } from 'react'
import {
  CalendarDays, MapPin, Users, Bus, Utensils, Flag, ArrowRight, ArrowLeft,
  CheckCircle2, Compass, Leaf, Camera, Heart, FileText, X
} from 'lucide-react'
import { getTours, registerTour } from '../services/api.js'
import { normalizeTour } from '../utils/contentAdapters.js'

const itineraryIcons=[Bus,MapPin,Utensils,Users,Camera,Flag]

export default function TourPage(){
  const [selected,setSelected]=useState(0)
  const [tours,setTours]=useState([])
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({name:'',email:'',phone:'',roleLabel:'',equipment:'',note:''})
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(true)
  const [submitting,setSubmitting]=useState(false)

  useEffect(()=>{
    setLoading(true);setError('')
    getTours().then(data=>setTours((data||[]).map(normalizeTour))).catch(err=>setError(err.message)).finally(()=>setLoading(false))
  },[])

  useEffect(()=>{
    if(!showForm)return undefined
    const previousOverflow=document.body.style.overflow
    const closeOnEscape=(event)=>{
      if(event.key==='Escape')setShowForm(false)
    }
    document.body.style.overflow='hidden'
    window.addEventListener('keydown',closeOnEscape)
    return ()=>{
      document.body.style.overflow=previousOverflow
      window.removeEventListener('keydown',closeOnEscape)
    }
  },[showForm])

  const tour=tours[selected]||tours[0]||null
  const currentItinerary=(tour?.itinerary||[]).map((item,index)=>[
    item.time||item[0]||'',
    item.title||item[1]||'Điểm dừng',
    itineraryIcons[index%itineraryIcons.length],
    item.description||item.desc||item[3]||''
  ])
  const currentStops=(tour?.stops||[]).map(item=>[
    item.name||item.title||'Điểm dừng',
    item.image||'',
    item.description||item.desc||''
  ])
  const highlights=Array.isArray(tour?.highlights)?tour.highlights:[]

  const openRegistration=()=>{
    setError('')
    setShowForm(true)
  }

  const submit=async(e)=>{
    e.preventDefault()
    if(!tour)return
    setSubmitting(true);setError('')
    try{
      const data=await registerTour({...form,tourNumber:tour.no})
      setResult(data)
    }catch(err){setError(err.message)}
    finally{setSubmitting(false)}
  }

  return <main className="tour-page-ref">
    <section className="tour-page-hero">
      <div className="tour-page-contours"/>
      <div className="tour-page-inner tour-page-hero-grid">
        <div className="tour-page-copy">
          <div className="tour-page-kicker">NHỮNG HÀNH TRÌNH CHẠM VÀO HÒA LẠC THẬT</div>
          <h1><span>HOLA</span><em>Tour</em></h1>
          <p>Khám phá Hòa Lạc qua trải nghiệm thực tế – đi, gặp, trải nghiệm và kể lại bằng góc nhìn của bạn.</p>
          <div className="tour-page-actions">
            <button className="btn btn-green" disabled={!tour} onClick={openRegistration}><Compass size={17}/> Chọn hành trình cho bạn <ArrowRight size={16}/></button>
            <a href="#lich-trinh" className="btn btn-outline"><CalendarDays size={16}/> Xem lịch tour</a>
          </div>
        </div>

        <div className="tour-page-hero-visual">
          <div className="tour-page-hero-image">{tour?.image?<img src={tour.image} alt="HOLA Tour"/>:<div className="theme-card-placeholder"/>}</div>
          <div className="tour-page-handnote">Hòa Lạc<br/>hôm nay<br/>và mai sau...</div>
          <Leaf className="tour-page-leaf"/>
        </div>
      </div>
    </section>

    {loading&&<div className="jw-empty">Đang tải HOLA Tour từ hệ thống...</div>}
    {error&&!showForm&&<div className="form-error">{error}</div>}
    {!loading&&!error&&!tour&&<div className="jw-empty">Chưa có HOLA Tour được công bố.</div>}

    {tour&&<>
    <section className="tour-switch-band">
      <div className="tour-page-inner tour-switch-row">
        <div className="tour-switch-list">
          {tours.map((t,i)=><button
            onClick={()=>{setSelected(i);setResult(null);setShowForm(false)}}
            className={selected===i?'active':''}
            key={t.id||t.no}
          >
            {t.image?<img src={t.image} alt={t.title}/>:<div className="theme-card-placeholder"/>}
            <div>
              <span>Tour #{t.no} · {t.dates}</span>
              <h3>{t.title}</h3>
              <small>{t.kicker}</small>
            </div>
            <b><ArrowRight/></b>
          </button>)}
        </div>
        <div className="tour-switch-nav">
          <button disabled={selected<=0} onClick={()=>setSelected(v=>Math.max(0,v-1))}><ArrowLeft/></button>
          <button className="active" disabled={selected>=tours.length-1} onClick={()=>setSelected(v=>Math.min(tours.length-1,v+1))}><ArrowRight/></button>
        </div>
      </div>
    </section>

    <section className="tour-selected-ref">
      <div className="tour-page-inner tour-selected-grid">
        <div className="tour-selected-copy">
          <span className="eyebrow">TOUR #{tour.no}</span>
          <h2>{tour.title}</h2>
          <h3>{tour.kicker}</h3>
          <div className="tour-selected-facts">
            <span><MapPin/> {tour.location}</span>
            <span><CalendarDays/> {tour.durationLabel}</span>
            <span><Users/> {tour.audienceLabel}</span>
          </div>
          <p>{tour.desc}</p>
          <div className="tour-selected-actions">
            <button className="btn btn-terra" onClick={openRegistration}>Đăng ký hành trình <ArrowRight size={16}/></button>
            <a href="#lich-trinh" className="btn btn-outline"><CalendarDays size={16}/> Xem lịch tour</a>
          </div>
        </div>

        <div className="tour-selected-visual">
          {tour.image?<img src={tour.image} alt={tour.title}/>:<div className="theme-card-placeholder"/>}
          <div className="tour-selected-note"><MapPin/><span>{tour.location}</span></div>
        </div>
      </div>
    </section>

    {showForm&&<div
      className="tour-register-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Đăng ký HOLA Tour ${tour.no}`}
      onMouseDown={event=>{if(event.target===event.currentTarget)setShowForm(false)}}
    >
      <section className="tour-register-panel" onMouseDown={event=>event.stopPropagation()}>
        <button className="tour-register-close" type="button" aria-label="Đóng form đăng ký" onClick={()=>setShowForm(false)}><X/></button>
        <div className="tour-register-modal-grid">
          <div>
            <span className="eyebrow">ĐĂNG KÝ HOLA TOUR #{tour.no}</span>
            <h2>{tour.title}</h2>
            <p>{tour.dates} · {tour.audienceLabel}.</p>
            <div className="tour-register-note"><b>Tham gia tour không tạo ưu thế khi chấm giải.</b><span>Tour là hoạt động trải nghiệm và kết nối cộng đồng.</span></div>
          </div>
          {result?<div className="tour-register-success"><CheckCircle2/><h3>Đăng ký thành công</h3><p>Mã đăng ký của bạn:</p><strong>{result.code}</strong><small>BTC sẽ liên hệ qua email/điện thoại để xác nhận.</small></div>:
          <form className="tour-register-form" onSubmit={submit}>
            <label>Họ và tên *<input required value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label>
            <label>Email *<input required type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/></label>
            <label>Số điện thoại *<input required value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))}/></label>
            <label>Vai trò<select value={form.roleLabel} onChange={e=>setForm(v=>({...v,roleLabel:e.target.value}))}><option value="">Chọn vai trò</option><option>Creator / Nhiếp ảnh</option><option>Sinh viên</option><option>Kiến trúc / Thiết kế</option><option>Người địa phương</option><option>Khác</option></select></label>
            <label className="full">Thiết bị sử dụng<input value={form.equipment} onChange={e=>setForm(v=>({...v,equipment:e.target.value}))} placeholder="Điện thoại, máy ảnh..."/></label>
            <label className="full">Lưu ý sức khỏe / ăn uống<textarea value={form.note} onChange={e=>setForm(v=>({...v,note:e.target.value}))}/></label>
            {error&&<div className="form-error full">{error}</div>}
            <button className="btn btn-terra full" disabled={submitting}>{submitting?'Đang đăng ký...':'Xác nhận tham gia'}</button>
          </form>}
        </div>
      </section>
    </div>}

    <section id="lich-trinh" className="tour-detail-ref">
      <div className="tour-page-inner tour-detail-grid">
        <div className="tour-itinerary">
          <h2>Lịch trình trải nghiệm</h2>
          {currentItinerary.length===0?<p>BTC đang cập nhật lịch trình chi tiết.</p>:<div className="tour-itinerary-list">
            {currentItinerary.map(([time,title,I,desc],index)=><div key={time+title+index}>
              <span className="tour-time">{time}</span>
              <span className="tour-itinerary-icon"><I/></span>
              <div><b>{title}</b><p>{desc}</p></div>
            </div>)}
          </div>}
        </div>

        <div className="tour-highlights">
          <h2>Điểm nhấn của hành trình</h2>
          <div className="tour-highlight-grid">
            {highlights.map((h,index)=><div key={h.title||index}><span>{index%2===0?<Leaf/>:<Heart/>}</span><b>{h.title}</b><p>{h.description}</p></div>)}
          </div>

          <div className="tour-info-ref">
            <div className="tour-info-title"><FileText/><b>Thông tin tour</b></div>
            <div>
              <p><b>Thời gian:</b> {tour.dates}</p>
              <p><b>Số lượng:</b> {tour.audienceLabel}</p>
              <p><b>Địa điểm:</b> {tour.location}</p>
              <p><b>Nguyên tắc:</b> Tham gia tour không tạo ưu thế khi chấm giải.</p>
            </div>
          </div>
        </div>

        {currentStops.length>0&&<div className="tour-stops">
          <div className="tour-stops-head"><h2>Các điểm dừng nổi bật</h2></div>
          <div className="tour-stop-grid">
            {currentStops.map(([name,image,desc],index)=><div className="tour-stop-card" key={name+index}>
              {image?<img src={image} alt={name}/>:<div className="theme-card-placeholder"/>}
              <div><h3>{name}</h3><p>{desc}</p><span><ArrowRight/></span></div>
            </div>)}
          </div>
        </div>}
      </div>
    </section>
    </>}
  </main>
}
