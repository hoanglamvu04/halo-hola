import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, CheckCircle2, Clock3, FileCheck2, AlertCircle, Mail, TicketCheck, ShieldCheck, Copy, Route, Sparkles } from 'lucide-react'
import { lookupSubmission } from '../services/api.js'
import '../styles/lookup-page-modern.css'

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
  const [copied,setCopied]=useState(false)

  const submit=async(e)=>{
    e.preventDefault()
    const code=form.code.trim().toUpperCase()
    const email=form.email.trim()
    if(!code||!email){setError('Vui lòng nhập đầy đủ mã tác phẩm và email đã dùng khi gửi.');return}
    setLoading(true);setError('');setItem(null);setCopied(false)
    try{ setItem(await lookupSubmission({code,email})) }
    catch(err){ setError(err.message||'Không tìm thấy tác phẩm. Vui lòng kiểm tra lại mã và email.') }
    finally{ setLoading(false) }
  }

  const copyCode=async()=>{
    if(!item?.code)return
    try{await navigator.clipboard.writeText(item.code);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch{}
  }

  const currentIndex=item ? flow.indexOf(item.status) : -1

  return <main className="lookup-modern-page">
    <section className="lookup-modern-hero">
      <div className="container lookup-modern-hero-inner">
        <div className="lookup-modern-copy">
          <div className="lookup-modern-eyebrow">TRA CỨU TÁC PHẨM · HALO HOLA 2026</div>
          <h1>Theo dõi <em>góc nhìn của bạn</em></h1>
          <p>Nhập mã tác phẩm và email đã dùng khi gửi. Bạn sẽ xem được trạng thái hồ sơ, tiến trình tuyển chọn và các thông tin đã được hệ thống ghi nhận.</p>
          <div className="lookup-modern-quick">
            <div><span>01</span><b>Nhập mã tác phẩm</b></div>
            <div><span>02</span><b>Xác nhận email</b></div>
            <div><span>03</span><b>Xem tiến trình</b></div>
          </div>
        </div>
        <aside className="lookup-modern-ticket" aria-hidden="true">
          <div className="lookup-ticket-top">
            <TicketCheck/>
            <div><span>PHIẾU TÁC PHẨM</span><b>HALO HOLA 2026</b></div>
          </div>
          <div className="lookup-ticket-sample">
            <small>Mã tra cứu mẫu</small>
            <strong>HH26-00428</strong>
            <p>Mỗi tác phẩm có một mã riêng được cấp ngay sau khi gửi thành công.</p>
          </div>
          <div className="lookup-ticket-status"><i/> Hệ thống tra cứu đang hoạt động</div>
        </aside>
      </div>
    </section>

    <section className="container lookup-modern-shell">
      <div className="lookup-modern-layout">
        <form className="lookup-modern-form-card" onSubmit={submit}>
          <div className="lookup-modern-form-head">
            <div className="lookup-modern-form-icon"><Search/></div>
            <div><span>TRA CỨU NHANH</span><h2>Tìm tác phẩm của bạn</h2></div>
          </div>

          {form.code&&<p className="lookup-modern-prefill">Mã tác phẩm đã được điền sẵn từ liên kết bạn lưu. Chỉ cần nhập đúng email đã dùng khi gửi.</p>}

          <label className="lookup-modern-field">
            <span>Mã tác phẩm <small>Ví dụ: HH26-00428</small></span>
            <div className="lookup-modern-input-wrap"><TicketCheck/><input value={form.code} onChange={e=>setForm(v=>({...v,code:e.target.value.toUpperCase()}))} placeholder="HH26-00428" autoCapitalize="characters"/></div>
          </label>

          <label className="lookup-modern-field">
            <span>Email đã dùng khi gửi</span>
            <div className="lookup-modern-input-wrap"><Mail/><input type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} placeholder="email@example.com"/></div>
          </label>

          {error&&<div className="lookup-modern-error"><AlertCircle/>{error}</div>}

          <button className="lookup-modern-submit" disabled={loading}><Search size={18}/>{loading?'Đang tra cứu...':'Tra cứu tác phẩm'}</button>
          <div className="lookup-modern-security"><ShieldCheck/>Thông tin tra cứu chỉ hiển thị khi mã tác phẩm và email khớp với hồ sơ đã gửi.</div>
        </form>

        <div className="lookup-modern-result">
          {!item?
            <div className="lookup-modern-empty">
              <div>
                <div className="lookup-modern-empty-icon"><FileCheck2/></div>
                <h2>Thông tin tác phẩm sẽ xuất hiện ở đây</h2>
                <p>Mã tác phẩm được cấp ngay sau khi gửi thành công. Hãy lưu lại mã này cùng email đã dùng để có thể kiểm tra hồ sơ bất cứ lúc nào.</p>
                <div className="lookup-modern-help">
                  <div><span>1</span> Tìm mã trong màn hình xác nhận sau khi gửi</div>
                  <div><span>2</span> Nhập đúng email đã khai trong hồ sơ</div>
                  <div><span>3</span> Theo dõi các mốc từ Đã nhận đến TOP52 / Đạt giải</div>
                </div>
              </div>
              <div className="lookup-modern-empty-preview">
                <small>MINH HỌA TIẾN TRÌNH</small>
                <strong>HH26-XXXXX</strong>
                <div></div>
                <p>Tiến trình sẽ cập nhật theo trạng thái xử lý của Ban tổ chức.</p>
              </div>
            </div>
          :
            <article className="lookup-modern-result-card">
              <header className="lookup-modern-result-head">
                <div>
                  <div className="lookup-modern-result-code"><span>{item.code}</span><button type="button" className="lookup-modern-copy-btn" onClick={copyCode} aria-label="Sao chép mã"><Copy/>{copied&&<span className="sr-only">Đã sao chép</span>}</button></div>
                  <h2>{item.title}</h2>
                  <p>{item.location} · {item.theme}</p>
                </div>
                <b className={'lookup-modern-pill '+String(item.status||'').toLowerCase()}>{labels[item.status]||item.status}</b>
              </header>

              {item.status==='REJECTED'?
                <div className="lookup-modern-warning"><AlertCircle/><div><b>Hồ sơ cần được kiểm tra lại</b><p>Ban tổ chức sẽ liên hệ qua email nếu cần bổ sung hoặc làm rõ thông tin.</p></div></div>
              :
                <div className="lookup-modern-progress">
                  <div className="lookup-modern-progress-title"><b><Route size={16}/> Tiến trình tác phẩm</b><span>Cập nhật theo trạng thái tuyển chọn</span></div>
                  <div className="lookup-modern-flow">{flow.map((s,i)=><div key={s} className={'lookup-modern-step '+(i<=currentIndex?'done':'')}>
                    <div className="lookup-modern-step-icon">{i<currentIndex?<CheckCircle2/>:i===currentIndex?<Clock3/>:<span>{i+1}</span>}</div>
                    <b>{labels[s]}</b>
                  </div>)}</div>
                </div>}

              <div className="lookup-modern-meta">
                <div><small>Ngày gửi</small><b>{new Date(item.created_at).toLocaleString('vi-VN')}</b></div>
                <div><small>File đã nhận</small><b>{item.media_count} file</b></div>
                <div><small>Dung lượng</small><b>{(Number(item.total_bytes||0)/1024/1024).toFixed(1)} MB</b></div>
                <div><small>Loại hình</small><b>{item.type}</b></div>
              </div>
            </article>}
        </div>
      </div>
    </section>
  </main>
}
