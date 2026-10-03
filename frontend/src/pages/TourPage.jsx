import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays, MapPin, Users, Bus, Utensils, Flag, ArrowRight, ArrowLeft,
  CheckCircle2, Compass, Leaf, Camera, Heart, FileText, Building2
} from 'lucide-react'
import { tours as fallbackTours, img } from '../data/siteData.js'
import { getTours, registerTour } from '../services/api.js'
import { normalizeTour } from '../utils/contentAdapters.js'

const itinerary=[
  ['07:30','Xuất phát từ Hà Nội',Bus,'Khám phá gặp gỡ và ghi lại những nét đặc trưng Hòa Lạc.'],
  ['09:00','Không gian tri thức Hòa Lạc',MapPin,'Khám phá, gặp gỡ và ghi lại những nét đặc trưng Hòa Lạc.'],
  ['11:30','Ẩm thực địa phương',Utensils,'Thưởng thức ẩm thực, trò chuyện cùng người bản địa.'],
  ['13:00','Làng nghề & câu chuyện bản địa',Users,'Gặp gỡ nghệ nhân, tìm hiểu văn hóa, câu chuyện làng nghề.'],
  ['15:30','Hồ Đồng Mô',Camera,'Trải nghiệm, chụp ảnh, lưu lại khoảnh khắc.'],
  ['17:00','Kết thúc hành trình',Flag,'Tổng kết, chia sẻ cảm nhận và câu chuyện.']
]

const stopCards=[
  ['Làng xóm Xứ Đoài',img.village,'Không gian văn hóa đặc sắc'],
  ['Hồ Đồng Mô',img.lake,'Thiên nhiên trong lành'],
  ['Không gian kiến trúc',img.architecture,'Câu chuyện đời sống hiện đại'],
  ['Điểm ngắm nắng',img.sunset,'Khoảnh khắc đáng nhớ']
]

export default function TourPage(){
  const [selected,setSelected]=useState(0)
  const [remoteTours,setRemoteTours]=useState([])
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({name:'',email:'',phone:'',roleLabel:'',equipment:'',note:''})
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  useEffect(()=>{
    getTours().then(data=>setRemoteTours((data||[]).map(normalizeTour))).catch(()=>{})
  },[])
  const tours=useMemo(()=>remoteTours.length?remoteTours:fallbackTours.map(normalizeTour),[remoteTours])
  const tour=tours[selected]||tours[0]
  const currentItinerary=Array.isArray(tour?.itinerary)&&tour.itinerary.length
    ? tour.itinerary.map((item,index)=>[
        item.time||item[0]||'',
        item.title||item[1]||'Điểm dừng',
        [Bus,MapPin,Utensils,Users,Camera,Flag][index%6],
        item.description||item.desc||item[3]||''
      ])
    : itinerary
  const currentStops=Array.isArray(tour?.stops)&&tour.stops.length
    ? tour.stops.map((item,index)=>[
        item.name||item.title||'Điểm dừng',
        item.image||[img.village,img.lake,img.architecture,img.sunset][index%4],
        item.description||item.desc||''
      ])
    : stopCards

  const submit=async(e)=>{
    e.preventDefault()
    setLoading(true);setError('')
    try{
      const data=await registerTour({...form,tourNumber:tour.no})
      setResult(data)
    }catch(err){setError(err.message)}
    finally{setLoading(false)}
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
            <button className="btn btn-green" onClick={()=>setShowForm(true)}><Compass size={17}/> Chọn hành trình cho bạn <ArrowRight size={16}/></button>
            <a href="#lich-trinh" className="btn btn-outline"><CalendarDays size={16}/> Xem lịch tour</a>
          </div>
        </div>

        <div className="tour-page-hero-visual">
          <div className="tour-page-hero-image"><img src={img.lake} alt="HOLA Tour"/></div>
          <div className="tour-page-handnote">Hòa Lạc<br/>hôm nay<br/>và mai sau...</div>
          <Leaf className="tour-page-leaf"/>
        </div>
      </div>
    </section>

    <section className="tour-switch-band">
      <div className="tour-page-inner tour-switch-row">
        <div className="tour-switch-list">
          {tours.map((t,i)=><button
            onClick={()=>{setSelected(i);setResult(null)}}
            className={selected===i?'active':''}
            key={t.no}
          >
            <img src={t.image} alt={t.title}/>
            <div>
              <span>Tour #{t.no} · {t.dates}</span>
              <h3>{t.title}</h3>
              <small>{t.desc.split('·').slice(0,3).join(' · ')}</small>
            </div>
            <b><ArrowRight/></b>
          </button>)}
        </div>
        <div className="tour-switch-nav">
          <button><ArrowLeft/></button>
          <button className="active"><ArrowRight/></button>
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
            <span><MapPin/> {tour.location||'Hòa Lạc, Hà Nội'}</span>
            <span><CalendarDays/> {tour.durationLabel||'2 ngày'}</span>
            <span><Users/> {tour.audienceLabel||'15–20 người'}</span>
          </div>
          <p>{tour.desc} Hành trình ưu tiên trải nghiệm thật, gặp người thật và tạo ra những câu chuyện có chiều sâu về vùng đất.</p>
          <div className="tour-selected-actions">
            <button className="btn btn-terra" onClick={()=>setShowForm(v=>!v)}>Xem chi tiết hành trình <ArrowRight size={16}/></button>
            <a href="#lich-trinh" className="btn btn-outline"><CalendarDays size={16}/> Xem lịch tour</a>
          </div>
        </div>

        <div className="tour-selected-visual">
          <img src={tour.image} alt={tour.title}/>
          <div className="tour-selected-note"><MapPin/><span>Khám phá<br/>văn hóa · kiến trúc<br/>xứ Đoài qua góc nhìn<br/>địa phương</span></div>
          <div className="tour-photo-count"><button><ArrowLeft/></button><span>01 / 05</span><button><ArrowRight/></button></div>
        </div>
      </div>
    </section>

    {showForm&&<section className="tour-register-band">
      <div className="container tour-register-grid">
        <div><span className="eyebrow">ĐĂNG KÝ HOLA TOUR #{tour.no}</span><h2>{tour.title}</h2><p>{tour.dates}.2026 · 15–20 người · đăng ký trước khi đủ chỗ.</p><div className="tour-register-note"><b>Tham gia tour không tạo ưu thế khi chấm giải.</b><span>Tour là hoạt động trải nghiệm và kết nối cộng đồng.</span></div></div>
        {result?<div className="tour-register-success"><CheckCircle2/><h3>Đăng ký thành công</h3><p>Mã đăng ký của bạn:</p><strong>{result.code}</strong><small>BTC sẽ liên hệ qua email/điện thoại để xác nhận.</small></div>:
        <form className="tour-register-form" onSubmit={submit}>
          <label>Họ và tên *<input value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label>
          <label>Email *<input type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/></label>
          <label>Số điện thoại *<input value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))}/></label>
          <label>Vai trò<select value={form.roleLabel} onChange={e=>setForm(v=>({...v,roleLabel:e.target.value}))}><option value="">Chọn vai trò</option><option>Creator / Nhiếp ảnh</option><option>Sinh viên</option><option>Kiến trúc / Thiết kế</option><option>Người địa phương</option><option>Khác</option></select></label>
          <label className="full">Thiết bị sử dụng<input value={form.equipment} onChange={e=>setForm(v=>({...v,equipment:e.target.value}))} placeholder="Điện thoại, máy ảnh..."/></label>
          <label className="full">Lưu ý sức khỏe / ăn uống<textarea value={form.note} onChange={e=>setForm(v=>({...v,note:e.target.value}))}/></label>
          {error&&<div className="form-error full">{error}</div>}
          <button className="btn btn-terra full" disabled={loading}>{loading?'Đang đăng ký...':'Xác nhận tham gia'}</button>
        </form>}
      </div>
    </section>}

    <section id="lich-trinh" className="tour-detail-ref">
      <div className="tour-page-inner tour-detail-grid">
        <div className="tour-itinerary">
          <h2>Lịch trình trải nghiệm</h2>
          <div className="tour-itinerary-list">
            {currentItinerary.map(([time,title,I,desc])=><div key={time}>
              <span className="tour-time">{time}</span>
              <span className="tour-itinerary-icon"><I/></span>
              <div><b>{title}</b><p>{desc}</p></div>
            </div>)}
          </div>
        </div>

        <div className="tour-highlights">
          <h2>Điểm nhấn của hành trình</h2>
          <div className="tour-highlight-grid">
            <div><span><Leaf/></span><b>Trải nghiệm đa sắc</b><p>Thiên nhiên – văn hóa – tri thức trong một hành trình</p></div>
            <div><span><Users/></span><b>Người thật, chuyện thật</b><p>Lắng nghe những câu chuyện sống động từ cộng đồng địa phương</p></div>
            <div><span><Camera/></span><b>Thực tế & tương tác</b><p>Không chỉ tham quan, mà còn quan sát, trải nghiệm, ghi lại</p></div>
            <div><span><Heart/></span><b>Phù hợp nhiều đối tượng</b><p>Sinh viên, creator, KTS, người yêu khám phá</p></div>
          </div>

          <div className="tour-info-ref">
            <div className="tour-info-title"><FileText/><b>Thông tin tour</b></div>
            <div>
              <p><b>Khởi hành:</b> {tour.dates}.2026</p>
              <p><b>Số lượng:</b> 15–20 người</p>
              <p><b>Phối hợp:</b> CLB / chuyên gia theo từng hành trình</p>
              <p><b>Nguyên tắc:</b> Tham gia tour không tạo ưu thế khi chấm giải.</p>
            </div>
          </div>
        </div>

        <div className="tour-stops">
          <div className="tour-stops-head"><h2>Các điểm dừng nổi bật</h2><LinkMore/></div>
          <div className="tour-stop-grid">
            {currentStops.map(([name,image,desc])=><div className="tour-stop-card" key={name}>
              <img src={image} alt={name}/>
              <div><h3>{name}</h3><p>{desc}</p><span><ArrowRight/></span></div>
            </div>)}
          </div>
        </div>
      </div>
    </section>
  </main>
}

function LinkMore(){
  return <a href="#lich-trinh" className="tour-stop-more">Xem tất cả <ArrowRight/></a>
}
