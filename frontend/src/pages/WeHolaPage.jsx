import { useEffect, useState } from 'react'
import { Leaf, Sparkles, Users, HeartHandshake, ArrowRight, X, CheckCircle2 } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { img } from '../data/siteData.js'
import { registerWeHola } from '../services/communityApi.js'

const initialForm={name:'',email:'',phone:'',roleLabel:'',interest:'',note:'',allowUpdates:false}

export default function WeHolaPage(){
 const goals=[['Xanh hơn','Gìn giữ thiên nhiên, cảnh quan và môi trường',Leaf],['Đẹp hơn','Cùng chăm chút những không gian nhỏ của cộng đồng',Sparkles],['Kết nối hơn','Người cũ – người mới, cộng đồng – doanh nghiệp',Users],['Đáng sống hơn','Phát triển nhưng không đánh mất thiên nhiên, văn hóa và tình cảm vùng đất',HeartHandshake]]
 const [showForm,setShowForm]=useState(false)
 const [form,setForm]=useState(initialForm)
 const [result,setResult]=useState(null)
 const [error,setError]=useState('')
 const [submitting,setSubmitting]=useState(false)

 useEffect(()=>{
  if(!showForm)return undefined
  const previousOverflow=document.body.style.overflow
  const closeOnEscape=event=>{if(event.key==='Escape')setShowForm(false)}
  document.body.style.overflow='hidden'
  window.addEventListener('keydown',closeOnEscape)
  return()=>{
   document.body.style.overflow=previousOverflow
   window.removeEventListener('keydown',closeOnEscape)
  }
 },[showForm])

 const openRegistration=()=>{
  setError('')
  setResult(null)
  setShowForm(true)
 }

 const submit=async event=>{
  event.preventDefault()
  setSubmitting(true);setError('')
  try{
   const data=await registerWeHola(form)
   setResult(data)
  }catch(err){setError(err.message)}
  finally{setSubmitting(false)}
 }

 return <main><PageHero eyebrow="CỘNG ĐỒNG PHI LỢI NHUẬN" title="WE HOLA" accent="Chúng ta là Hòa Lạc" desc="Cùng nhau làm Hòa Lạc tốt đẹp hơn — bằng những việc nhỏ, cụ thể và có ích." image={img.people}><button type="button" className="btn btn-green" onClick={openRegistration}>Tham gia WE HOLA <ArrowRight size={16}/></button></PageHero>
 <section className="container section"><div className="section-heading"><div><span className="eyebrow">WE HOLA HƯỚNG ĐẾN</span><h2>Một Hòa Lạc tốt đẹp hơn</h2></div><p>Không chỉ nói về một Hòa Lạc tốt đẹp — cùng nhau làm những việc thực tế.</p></div><div className="goal-grid">{goals.map(([t,d,I])=><div key={t}><I/><h3>{t}</h3><p>{d}</p></div>)}</div></section>
 <section className="paper-bg"><div className="container section action-story"><div><span className="eyebrow">WE HOLA ACTION</span><h2>100 người · 1 việc tốt cho Hòa Lạc</h2><p>Mỗi hoạt động chọn một vấn đề nhỏ nhưng thực tế và huy động cộng đồng cùng giải quyết.</p><div className="chip-wrap"><span>Trồng cây</span><span>Làm sạch không gian</span><span>Giữ một câu chuyện</span><span>Bản đồ cộng đồng</span><span>Hỗ trợ người yếu thế</span></div><button type="button" className="btn btn-green" onClick={openRegistration}>Đăng ký tham gia <ArrowRight size={16}/></button></div><img src={img.green} alt="Hòa Lạc xanh"/></div></section>
 <section className="container section"><h2>Cùng địa phương · cùng làm</h2><div className="community-flow"><div><b>Địa phương</b><p>Đề xuất nhu cầu thực tế</p></div><span>→</span><div><b>WE HOLA</b><p>Kết nối ý tưởng, con người, nguồn lực</p></div><span>→</span><div><b>Cộng đồng</b><p>Cùng làm</p></div><span>→</span><div><b>Doanh nghiệp</b><p>Đồng hành nguồn lực</p></div></div></section>

 {showForm&&<div className="tour-register-modal" role="dialog" aria-modal="true" aria-label="Đăng ký tham gia WE HOLA" onMouseDown={event=>{if(event.target===event.currentTarget)setShowForm(false)}}>
  <section className="tour-register-panel" onMouseDown={event=>event.stopPropagation()}>
   <button className="tour-register-close" type="button" aria-label="Đóng form đăng ký" onClick={()=>setShowForm(false)}><X/></button>
   <div className="tour-register-modal-grid">
    <div>
     <span className="eyebrow">THAM GIA WE HOLA</span>
     <h2>Chúng ta là Hòa Lạc</h2>
     <p>Để lại thông tin để WE HOLA có thể kết nối bạn với những hoạt động cộng đồng phù hợp.</p>
     <div className="tour-register-note"><b>Mỗi người đóng góp theo cách mình có thể.</b><span>Thông tin chỉ phục vụ kết nối hoạt động WE HOLA và cập nhật chương trình khi bạn đồng ý.</span></div>
    </div>
    {result?<div className="tour-register-success"><CheckCircle2/><h3>Đăng ký thành công</h3><p>Mã đăng ký của bạn:</p><strong>{result.code}</strong><small>WE HOLA sẽ liên hệ khi có hoạt động phù hợp.</small></div>:
    <form className="tour-register-form" onSubmit={submit}>
     <label>Họ và tên *<input required minLength="2" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></label>
     <label>Email *<input required type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/></label>
     <label>Số điện thoại *<input required minLength="8" value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))}/></label>
     <label>Vai trò<select value={form.roleLabel} onChange={e=>setForm(v=>({...v,roleLabel:e.target.value}))}><option value="">Chọn vai trò</option><option>Người dân Hòa Lạc</option><option>Sinh viên / Người trẻ</option><option>Chuyên gia / KTS / Nghệ sĩ</option><option>Doanh nghiệp / Tổ chức</option><option>Người yêu Hòa Lạc</option><option>Khác</option></select></label>
     <label className="full">Bạn muốn đóng góp điều gì?<textarea rows="3" maxLength="1500" value={form.interest} onChange={e=>setForm(v=>({...v,interest:e.target.value}))} placeholder="Ví dụ: trồng cây, hoạt động cộng đồng, chuyên môn, địa điểm, truyền thông..."/></label>
     <label className="full">Ghi chú<textarea rows="2" maxLength="1500" value={form.note} onChange={e=>setForm(v=>({...v,note:e.target.value}))}/></label>
     <label className="full"><input type="checkbox" checked={form.allowUpdates} onChange={e=>setForm(v=>({...v,allowUpdates:e.target.checked}))}/> Tôi đồng ý nhận cập nhật về hoạt động WE HOLA.</label>
     {error&&<div className="form-error full">{error}</div>}
     <button className="btn btn-green full" disabled={submitting}>{submitting?'Đang gửi...':'Xác nhận tham gia'}</button>
    </form>}
   </div>
  </section>
 </div>}
 </main>
}
