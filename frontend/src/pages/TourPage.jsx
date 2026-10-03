import { useState } from 'react'
import { CalendarDays, MapPin, Users, PlayCircle, Bus, Utensils, Flag, ArrowRight, CheckCircle2 } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { tours, img } from '../data/siteData.js'
import { registerTour } from '../services/api.js'

const itinerary=[['07:30','Xuất phát từ Hà Nội',Bus],['09:00','Không gian tri thức Hòa Lạc',MapPin],['11:30','Ẩm thực địa phương',Utensils],['13:00','Làng nghề & câu chuyện bản địa',Users],['15:30','Hồ Đồng Mô',MapPin],['17:00','Kết thúc hành trình',Flag]]

export default function TourPage(){
 const [selected,setSelected]=useState(0)
 const [showForm,setShowForm]=useState(false)
 const [form,setForm]=useState({name:'',email:'',phone:'',roleLabel:'',equipment:'',note:''})
 const [result,setResult]=useState(null)
 const [error,setError]=useState('')
 const [loading,setLoading]=useState(false)
 const tour=tours[selected]

 const submit=async(e)=>{
   e.preventDefault()
   setLoading(true);setError('')
   try{
     const data=await registerTour({...form,tourNumber:tour.no})
     setResult(data)
   }catch(err){setError(err.message)}
   finally{setLoading(false)}
 }

 return <main>
 <PageHero eyebrow="NHỮNG HÀNH TRÌNH CHẠM VÀO HÒA LẠC THẬT" title="HOLA" accent="Tour" desc="Khám phá Hòa Lạc qua trải nghiệm thực tế — đi, gặp, trải nghiệm và kể lại bằng góc nhìn của bạn." image={img.lake}>
   <div className="actions"><button className="btn btn-green" onClick={()=>setShowForm(true)}>Chọn hành trình cho bạn <ArrowRight size={16}/></button><a href="#lich-trinh" className="btn btn-outline"><CalendarDays size={16}/> Xem lịch tour</a></div>
 </PageHero>

 <section className="container tour-switcher">{tours.map((t,i)=><button onClick={()=>{setSelected(i);setResult(null)}} className={selected===i?'active':''} key={t.no}><img src={t.image}/><span>Tour #{t.no} · {t.dates}</span><h3>{t.title}</h3><p>{t.kicker}</p></button>)}</section>

 <section className="container section selected-tour"><div className="tour-copy"><span className="eyebrow">TOUR #{tour.no}</span><h2>{tour.title}</h2><h3>{tour.kicker}</h3><div className="tour-facts"><span><MapPin/> Hòa Lạc, Hà Nội</span><span><CalendarDays/> 1 ngày</span><span><Users/> 15–20 người</span></div><p>{tour.desc} Hành trình ưu tiên trải nghiệm thật, gặp người thật và tạo ra những câu chuyện có chiều sâu về vùng đất.</p><div className="actions"><button className="btn btn-terra" onClick={()=>setShowForm(v=>!v)}>Tham gia hành trình <ArrowRight size={16}/></button><button className="btn btn-outline"><PlayCircle size={17}/> Xem recap</button></div></div><img className="tour-feature-img" src={tour.image}/></section>

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

 <section id="lich-trinh" className="tour-content paper-bg"><div className="container section two-col"><div><h2>Lịch trình trải nghiệm</h2><div className="timeline-list">{itinerary.map(([time,title,I])=><div key={time}><span>{time}</span><I/><div><b>{title}</b><p>Khám phá, gặp gỡ và ghi lại một lát cắt của Hòa Lạc.</p></div></div>)}</div></div><div><h2>Điểm nhấn của hành trình</h2><div className="highlight-grid"><div><b>Trải nghiệm đa sắc</b><p>Thiên nhiên – văn hóa – tri thức trong một hành trình.</p></div><div><b>Người thật, chuyện thật</b><p>Lắng nghe những câu chuyện sống động từ cộng đồng.</p></div><div><b>Thực tế & tương tác</b><p>Không chỉ tham quan, mà còn quan sát và sáng tạo.</p></div><div><b>Phù hợp nhiều đối tượng</b><p>Sinh viên, creator, KTS, người yêu khám phá.</p></div></div><div className="tour-info-card"><h3>Thông tin tour</h3><p><b>Khởi hành:</b> {tour.dates}.2026</p><p><b>Số lượng:</b> 15–20 người</p><p><b>Phối hợp:</b> CLB / chuyên gia theo từng hành trình</p><p><b>Nguyên tắc:</b> Tham gia tour không tạo ưu thế khi chấm giải.</p></div></div></div></section>

 <section className="container section"><h2>Các điểm dừng nổi bật</h2><div className="place-grid">{[['ĐHQG Hà Nội',img.student],['Làng xóm Xứ Đoài',img.village],['Hồ Đồng Mô',img.lake],['Không gian kiến trúc',img.architecture],['Điểm ngắm nắng',img.sunset]].map(([n,i])=><div className="place-card" key={n}><img src={i}/><div><h3>{n}</h3><p>Một mảnh ghép trong hành trình khám phá Hòa Lạc.</p></div></div>)}</div></section>
 </main>
}
