import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, CheckCircle2, Clock3, FileCheck2, AlertCircle } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import { lookupSubmission } from '../services/api.js'
import { img } from '../data/siteData.js'

const flow=['PENDING','VALID','SHORTLIST','TOP52','AWARDED']
const labels={
  PENDING:'Đã nhận',
  VALID:'Hợp lệ',
  SHORTLIST:'Shortlist',
  TOP52:'TOP52',
  AWARDED:'Đạt giải',
  REJECTED:'Không hợp lệ'
}

export default function LookupPage(){
  const [searchParams]=useSearchParams()
  const [form,setForm]=useState({code:(searchParams.get('code')||'').trim().toUpperCase(),email:''})
  const [item,setItem]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  const submit=async(e)=>{
    e.preventDefault()
    setLoading(true);setError('');setItem(null)
    try{ setItem(await lookupSubmission(form)) }
    catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }

  const currentIndex=item ? flow.indexOf(item.status) : -1

  return <main>
    <PageHero eyebrow="TRA CỨU TÁC PHẨM" title="Theo dõi" accent="góc nhìn của bạn" desc="Nhập mã tác phẩm và email đã dùng khi gửi để kiểm tra trạng thái hồ sơ." image={img.camera}/>
    <section className="container section lookup-layout">
      <form className="lookup-card" onSubmit={submit}>
        <span className="eyebrow">MÃ TÁC PHẨM</span>
        <h2>Tra cứu trạng thái</h2>
        {form.code&&<p>Mã tác phẩm đã được điền sẵn từ liên kết bạn lưu. Chỉ cần nhập đúng email đã dùng khi gửi.</p>}
        <label>Mã tác phẩm<input value={form.code} onChange={e=>setForm(v=>({...v,code:e.target.value.toUpperCase()}))} placeholder="HH26-00428"/></label>
        <label>Email<input type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} placeholder="email@example.com"/></label>
        {error&&<div className="form-error">{error}</div>}
        <button className="btn btn-green" disabled={loading}><Search size={17}/>{loading?'Đang tra cứu...':'Tra cứu'}</button>
      </form>

      <div className="lookup-result">
        {!item?<div className="lookup-empty"><FileCheck2/><h3>Thông tin tác phẩm sẽ xuất hiện ở đây</h3><p>Mã tác phẩm được cấp ngay sau khi gửi thành công.</p></div>:
        <div className="status-card">
          <div className="status-head"><div><span>{item.code}</span><h2>{item.title}</h2><p>{item.location} · {item.theme}</p></div><b className={'status-pill '+item.status.toLowerCase()}>{labels[item.status]||item.status}</b></div>
          {item.status==='REJECTED'?<div className="status-warning"><AlertCircle/><div><b>Hồ sơ cần được kiểm tra lại</b><p>BTC sẽ liên hệ qua email nếu cần bổ sung thông tin.</p></div></div>:
          <div className="status-flow">{flow.map((s,i)=><div key={s} className={i<=currentIndex?'done':''}>{i<currentIndex?<CheckCircle2/>:i===currentIndex?<Clock3/>:<span>{i+1}</span>}<b>{labels[s]}</b></div>)}</div>}
          <div className="lookup-meta"><div><small>Ngày gửi</small><b>{new Date(item.created_at).toLocaleString('vi-VN')}</b></div><div><small>File đã nhận</small><b>{item.media_count} file</b></div><div><small>Dung lượng</small><b>{(Number(item.total_bytes||0)/1024/1024).toFixed(1)} MB</b></div><div><small>Loại hình</small><b>{item.type}</b></div></div>
        </div>}
      </div>
    </section>
  </main>
}
