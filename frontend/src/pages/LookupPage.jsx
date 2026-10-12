import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, CheckCircle2, Clock3, FileCheck2, AlertCircle, Mail, TicketCheck, ShieldCheck, Copy, Route, ExternalLink, Link2, Phone, Image } from 'lucide-react'
import { lookupSubmission } from '../services/api.js'
import '../styles/lookup-page-modern.css'
import '../styles/lookup-status-v2.css'

const flow=['PENDING','VALID','SHORTLIST','TOP52','AWARDED']
const labels={
  PENDING:'Đã nhận',
  VALID:'Hợp lệ',
  SHORTLIST:'Shortlist',
  TOP52:'TOP52',
  AWARDED:'Đạt giải',
  REJECTED:'Không hợp lệ'
}
const missingLabels={
  PHONE:'Số điện thoại',
  MEDIA:'File tác phẩm',
  FACEBOOK_URL:'Link bài Facebook',
  FACEBOOK_CONFIRMATION:'Xác nhận bài Facebook'
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
    if(!code||!email){setError('Vui lòng nhập đầy đủ Mã dự thi và email đã dùng khi gửi.');return}
    setLoading(true);setError('');setItem(null);setCopied(false)
    try{ setItem(await lookupSubmission({code,email})) }
    catch(err){ setError(err.message||'Không tìm thấy bài dự thi. Vui lòng kiểm tra lại Mã dự thi và email.') }
    finally{ setLoading(false) }
  }

  const copyCode=async()=>{
    if(!item?.code)return
    try{await navigator.clipboard.writeText(item.code);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch{}
  }

  const currentIndex=item ? flow.indexOf(item.status) : -1
  const missing=Array.isArray(item?.missing)?item.missing:[]
  const completionPercent=Number.isFinite(Number(item?.completionPercent))?Number(item.completionPercent):100
  const facebookDone=item?.facebook_completion_status==='CONFIRMED'||item?.facebook_completion_status==='LEGACY'
  const checks=item?[
    {key:'PHONE',label:'Số điện thoại',ok:Boolean(item.phone),icon:Phone},
    {key:'MEDIA',label:'File tác phẩm',ok:Number(item.media_count)>0,icon:Image},
    {key:'FACEBOOK_URL',label:'Link bài Facebook',ok:Boolean(item.facebook_post_url),icon:Link2},
    {key:'FACEBOOK_CONFIRMATION',label:'Đã hoàn tất Facebook',ok:facebookDone,icon:CheckCircle2}
  ]:[]

  return <main className="lookup-modern-page">
    <section className="lookup-modern-hero">
      <div className="container lookup-modern-hero-inner">
        <div className="lookup-modern-copy">
          <div className="lookup-modern-eyebrow">TRA CỨU BÀI DỰ THI · HALO HOLA 2026</div>
          <h1>Theo dõi <em>góc nhìn của bạn</em></h1>
          <p>Nhập Mã dự thi và email đã dùng khi gửi. Bạn sẽ xem được trạng thái hồ sơ, mức hoàn thiện và các cập nhật mới nhất từ Ban Tổ chức.</p>
          <div className="lookup-modern-quick">
            <div><span>01</span><b>Nhập Mã dự thi</b></div>
            <div><span>02</span><b>Xác nhận email</b></div>
            <div><span>03</span><b>Xem tiến trình</b></div>
          </div>
        </div>
        <aside className="lookup-modern-ticket" aria-hidden="true">
          <div className="lookup-ticket-top">
            <TicketCheck/>
            <div><span>PHIẾU DỰ THI</span><b>HALO HOLA 2026</b></div>
          </div>
          <div className="lookup-ticket-sample">
            <small>Mã dự thi mẫu</small>
            <strong>HH26-00428</strong>
            <p>Mỗi bài dự thi có một mã riêng được cấp sau khi hoàn tất quy trình gửi bài.</p>
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
            <div><span>TRA CỨU NHANH</span><h2>Tìm bài dự thi của bạn</h2></div>
          </div>

          {form.code&&<p className="lookup-modern-prefill">Mã dự thi đã được điền sẵn từ liên kết bạn lưu. Chỉ cần nhập đúng email đã dùng khi gửi.</p>}

          <label className="lookup-modern-field">
            <span>Mã dự thi <small>Ví dụ: HH26-00428</small></span>
            <div className="lookup-modern-input-wrap"><TicketCheck/><input value={form.code} onChange={e=>setForm(v=>({...v,code:e.target.value.toUpperCase()}))} placeholder="HH26-00428" autoCapitalize="characters"/></div>
          </label>

          <label className="lookup-modern-field">
            <span>Email đã dùng khi gửi</span>
            <div className="lookup-modern-input-wrap"><Mail/><input type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} placeholder="email@example.com"/></div>
          </label>

          {error&&<div className="lookup-modern-error"><AlertCircle/>{error}</div>}

          <button className="lookup-modern-submit" disabled={loading}><Search size={18}/>{loading?'Đang tra cứu...':'Tra cứu bài dự thi'}</button>
          <div className="lookup-modern-security"><ShieldCheck/>Thông tin tra cứu chỉ hiển thị khi Mã dự thi và email khớp với hồ sơ đã gửi.</div>
        </form>

        <div className="lookup-modern-result">
          {!item?
            <div className="lookup-modern-empty">
              <div>
                <div className="lookup-modern-empty-icon"><FileCheck2/></div>
                <h2>Thông tin bài dự thi sẽ xuất hiện ở đây</h2>
                <p>Mã dự thi được cấp sau khi bạn gửi bài. Hãy lưu mã này cùng email đã dùng để kiểm tra hồ sơ bất cứ lúc nào.</p>
                <div className="lookup-modern-help">
                  <div><span>1</span> Hoàn tất thông tin và tác phẩm dự thi</div>
                  <div><span>2</span> Hoàn thành bước đăng Facebook bắt buộc</div>
                  <div><span>3</span> Dùng Mã dự thi và email để theo dõi tiến trình</div>
                </div>
              </div>
              <div className="lookup-modern-empty-preview">
                <small>MINH HỌA TIẾN TRÌNH</small>
                <strong>HH26-XXXXX</strong>
                <div></div>
                <p>Tiến trình sẽ cập nhật theo trạng thái xử lý của Ban Tổ chức.</p>
              </div>
            </div>
          :
            <article className="lookup-modern-result-card">
              <header className="lookup-modern-result-head">
                <div>
                  <div className="lookup-modern-result-code"><span>{item.code}</span><button type="button" className="lookup-modern-copy-btn" onClick={copyCode} aria-label="Sao chép Mã dự thi"><Copy/>{copied&&<span className="sr-only">Đã sao chép</span>}</button></div>
                  <h2>{item.title}</h2>
                  <p>{item.location} · {item.theme}</p>
                </div>
                <b className={'lookup-modern-pill '+String(item.status||'').toLowerCase()}>{labels[item.status]||item.status}</b>
              </header>

              <section className={'lookup-modern-readiness '+(completionPercent===100?'complete':'needs-action')}>
                <div className="lookup-modern-readiness-head">
                  <div>
                    <span>ĐỘ HOÀN THIỆN HỒ SƠ</span>
                    <b>{completionPercent===100?'Hồ sơ đã hoàn tất':'Còn bước cần hoàn thiện'}</b>
                  </div>
                  <strong>{completionPercent}%</strong>
                </div>
                <div className="lookup-modern-readiness-bar"><i style={{width:`${Math.max(0,Math.min(100,completionPercent))}%`}}/></div>
                {missing.length>0&&<p>Đang thiếu: {missing.map(key=>missingLabels[key]||key).join(' · ')}</p>}
                <div className="lookup-modern-checklist">{checks.map(({key,label,ok,icon:I})=><div key={key} className={ok?'is-ok':'is-missing'}>
                  <I/>
                  <span>{label}</span>
                  <b>{ok?'Đã có':'Còn thiếu'}</b>
                </div>)}</div>
              </section>

              {item.status==='REJECTED'?
                <div className="lookup-modern-warning"><AlertCircle/><div><b>Hồ sơ cần được kiểm tra lại</b><p>Ban Tổ chức sẽ liên hệ qua email nếu cần bổ sung hoặc làm rõ thông tin.</p></div></div>
              :
                <div className="lookup-modern-progress">
                  <div className="lookup-modern-progress-title"><b><Route size={16}/> Tiến trình bài dự thi</b><span>Cập nhật theo trạng thái tuyển chọn</span></div>
                  <div className="lookup-modern-flow">{flow.map((s,i)=><div key={s} className={'lookup-modern-step '+(i<=currentIndex?'done':'')}>
                    <div className="lookup-modern-step-icon">{i<currentIndex?<CheckCircle2/>:i===currentIndex?<Clock3/>:<span>{i+1}</span>}</div>
                    <b>{labels[s]}</b>
                  </div>)}</div>
                </div>}

              <section className={'lookup-modern-facebook '+(facebookDone?'is-complete':'is-pending')}>
                <div className="lookup-modern-facebook-icon"><Link2/></div>
                <div>
                  <span>FACEBOOK DỰ THI</span>
                  <b>{facebookDone?'Đã hoàn tất bước Facebook':'Chưa hoàn tất bước Facebook'}</b>
                  <p>{facebookDone?'Link bài đăng đã được hệ thống ghi nhận.':'Bài dự thi chỉ hoàn tất khi bạn đã gắn link bài Facebook theo hướng dẫn.'}</p>
                </div>
                {item.facebook_post_url&&<a href={item.facebook_post_url} target="_blank" rel="noreferrer">Xem bài Facebook <ExternalLink/></a>}
              </section>

              <div className="lookup-modern-meta">
                <div><small>Ngày gửi</small><b>{new Date(item.created_at).toLocaleString('vi-VN')}</b></div>
                <div><small>Cập nhật gần nhất</small><b>{new Date(item.updated_at||item.created_at).toLocaleString('vi-VN')}</b></div>
                <div><small>File đã nhận</small><b>{item.media_count} file</b></div>
                <div><small>Dung lượng</small><b>{(Number(item.total_bytes||0)/1024/1024).toFixed(1)} MB</b></div>
                <div><small>Loại hình</small><b>{item.type}</b></div>
                <div><small>Nguồn gửi</small><b>{item.submission_source==='FACEBOOK'?'Facebook':'Website'}</b></div>
              </div>
            </article>}
        </div>
      </div>
    </section>
  </main>
}
