import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, CheckCircle2, Clock3, FileCheck2, AlertCircle, Mail, TicketCheck, ShieldCheck,
  Copy, Route, ExternalLink, Link2, Phone, Image, Globe2, MapPinned, Send, CircleDashed
} from 'lucide-react'
import { lookupSubmission } from '../services/api.js'
import '../styles/lookup-page-modern.css'
import '../styles/lookup-status-v2.css'
import '../styles/lookup-profile-v3.css'

const flow=['PENDING','VALID','SHORTLIST','TOP52','AWARDED']
const labels={
  PENDING:'Đã nhận',
  VALID:'Hợp lệ',
  SHORTLIST:'Được chọn biên tập',
  TOP52:'TOP52',
  AWARDED:'Góc nhìn tiêu biểu',
  REJECTED:'Cần bổ sung'
}
const missingLabels={
  PHONE:'Số điện thoại',
  MEDIA:'File hoặc link góc nhìn',
  FACEBOOK_URL:'Link bài Facebook',
  FACEBOOK_CONFIRMATION:'Xác nhận bài Facebook'
}
const notificationStatusLabels={
  PENDING:'Đã nhận',VALID:'Hợp lệ',SHORTLIST:'Được chọn biên tập',TOP52:'TOP52',AWARDED:'Góc nhìn tiêu biểu',REJECTED:'Cần bổ sung'
}

function publicationCopy(item){
  if(item?.publicNow) return ['Đã công bố','Góc nhìn đang hiển thị công khai trên HALO HOLA.','good']
  if(item?.publication_state==='SCHEDULED') return ['Đã hẹn giờ',item.publish_scheduled_at?`Dự kiến công bố ${new Date(item.publish_scheduled_at).toLocaleString('vi-VN')}.`:'Đang chờ lịch công bố.','pending']
  return ['Chưa công bố','Góc nhìn chưa được mở hiển thị công khai.','pending']
}
function mapsCopy(item){
  const state=String(item?.hola_maps_sync_status||'').toUpperCase()
  if(item?.hola_maps_published&&state==='SYNCED') return ['Đã lên HOLA Maps','Địa điểm và góc nhìn đã được đồng bộ sang bản đồ.','good']
  if(state==='FAILED') return ['Đồng bộ Maps lỗi','Hệ thống sẽ cần đồng bộ lại góc nhìn này.','danger']
  if(state==='PENDING') return ['Đang chờ HOLA Maps',item?.publicNow?'Đồng bộ đang được xử lý.':'Sẽ đồng bộ sau khi góc nhìn đủ điều kiện và được công bố.','pending']
  return ['Chưa lên HOLA Maps','Góc nhìn có ảnh và vị trí phù hợp sẽ được gửi sang bản đồ sau khi công bố.','pending']
}
function deliveryText(entry){
  if(entry.deliveryStatus==='SENT')return'Đã gửi email'
  if(entry.deliveryStatus==='SKIPPED')return'Email chưa gửi'
  return'Gửi email thất bại'
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
    if(!code||!email){setError('Vui lòng nhập đầy đủ Mã góc nhìn và email đã dùng khi gửi.');return}
    setLoading(true);setError('');setItem(null);setCopied(false)
    try{ setItem(await lookupSubmission({code,email})) }
    catch(err){ setError(err.message||'Không tìm thấy góc nhìn. Vui lòng kiểm tra lại Mã góc nhìn và email.') }
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
  const facebookRequired=Boolean(item?.facebookRequired)
  const checks=item?[
    {key:'PHONE',label:'Số điện thoại',ok:Boolean(item.phone),icon:Phone},
    {key:'MEDIA',label:'File hoặc link góc nhìn',ok:Number(item.media_count)>0||Boolean(item.external_link),icon:Image},
    ...(facebookRequired?[
      {key:'FACEBOOK_URL',label:'Link bài Facebook',ok:Boolean(item.facebook_post_url),icon:Link2},
      {key:'FACEBOOK_CONFIRMATION',label:'Đã xác nhận Facebook',ok:facebookDone,icon:CheckCircle2}
    ]:[])
  ]:[]
  const [publicationTitle,publicationDetail,publicationTone]=publicationCopy(item)
  const [mapsTitle,mapsDetail,mapsTone]=mapsCopy(item)
  const notifications=Array.isArray(item?.notification_history)?item.notification_history:[]

  return <main className="lookup-modern-page">
    <section className="lookup-modern-hero">
      <div className="container lookup-modern-hero-inner">
        <div className="lookup-modern-copy">
          <div className="lookup-modern-eyebrow">HỒ SƠ GÓC NHÌN · HALO HOLA 2026</div>
          <h1>Theo dõi <em>góc nhìn của bạn</em></h1>
          <p>Nhập Mã góc nhìn và email đã dùng khi gửi. Bạn sẽ xem được mức hoàn thiện, trạng thái kiểm tra, biên tập, công bố và tình trạng đồng bộ lên HOLA Maps.</p>
          <div className="lookup-modern-quick">
            <div><span>01</span><b>Nhập Mã góc nhìn</b></div>
            <div><span>02</span><b>Xác nhận email</b></div>
            <div><span>03</span><b>Theo dõi hành trình</b></div>
          </div>
        </div>
        <aside className="lookup-modern-ticket" aria-hidden="true">
          <div className="lookup-ticket-top">
            <TicketCheck/>
            <div><span>GÓC NHÌN CỘNG ĐỒNG</span><b>HALO HOLA 2026</b></div>
          </div>
          <div className="lookup-ticket-sample">
            <small>Mã góc nhìn mẫu</small>
            <strong>HH26-00428</strong>
            <p>Mỗi góc nhìn có một mã riêng để theo dõi hành trình từ lúc đóng góp, kiểm tra, biên tập đến khi được công bố.</p>
          </div>
          <div className="lookup-ticket-status"><i/> Hệ thống theo dõi đang hoạt động</div>
        </aside>
      </div>
    </section>

    <section className="container lookup-modern-shell">
      <div className="lookup-modern-layout">
        <form className="lookup-modern-form-card" onSubmit={submit}>
          <div className="lookup-modern-form-head">
            <div className="lookup-modern-form-icon"><Search/></div>
            <div><span>THEO DÕI NHANH</span><h2>Tìm góc nhìn của bạn</h2></div>
          </div>

          {form.code&&<p className="lookup-modern-prefill">Mã góc nhìn đã được điền sẵn từ liên kết bạn lưu. Chỉ cần nhập đúng email đã dùng khi gửi.</p>}

          <label className="lookup-modern-field">
            <span>Mã góc nhìn <small>Ví dụ: HH26-00428</small></span>
            <div className="lookup-modern-input-wrap"><TicketCheck/><input value={form.code} onChange={e=>setForm(v=>({...v,code:e.target.value.toUpperCase()}))} placeholder="HH26-00428" autoCapitalize="characters"/></div>
          </label>

          <label className="lookup-modern-field">
            <span>Email đã dùng khi gửi</span>
            <div className="lookup-modern-input-wrap"><Mail/><input type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} placeholder="email@example.com"/></div>
          </label>

          {error&&<div className="lookup-modern-error"><AlertCircle/>{error}</div>}

          <button className="lookup-modern-submit" disabled={loading}><Search size={18}/>{loading?'Đang tìm...':'Theo dõi góc nhìn'}</button>
          <div className="lookup-modern-security"><ShieldCheck/>Thông tin chỉ hiển thị khi Mã góc nhìn và email khớp với hồ sơ đã gửi.</div>
        </form>

        <div className="lookup-modern-result">
          {!item?
            <div className="lookup-modern-empty">
              <div>
                <div className="lookup-modern-empty-icon"><FileCheck2/></div>
                <h2>Hồ sơ góc nhìn sẽ xuất hiện ở đây</h2>
                <p>Sau khi tìm, bạn có thể xem góc nhìn đã được kiểm tra chưa, đã công bố chưa, có lên HOLA Maps chưa và các thông báo từ chương trình.</p>
                <div className="lookup-modern-help">
                  <div><span>1</span> Hoàn tất thông tin và nội dung đóng góp</div>
                  <div><span>2</span> BTC kiểm tra và cập nhật trạng thái</div>
                  <div><span>3</span> Theo dõi công bố, HOLA Maps và ghi nhận</div>
                </div>
              </div>
              <div className="lookup-modern-empty-preview">
                <small>MINH HỌA GÓC NHÌN</small>
                <strong>HH26-XXXXX</strong>
                <div></div>
                <p>Hồ sơ được cập nhật theo hành trình tiếp nhận và công bố của chương trình.</p>
              </div>
            </div>
          :
            <article className="lookup-modern-result-card">
              <header className="lookup-modern-result-head">
                <div>
                  <div className="lookup-modern-result-code"><span>{item.code}</span><button type="button" className="lookup-modern-copy-btn" onClick={copyCode} aria-label="Sao chép Mã góc nhìn"><Copy/>{copied&&<span className="sr-only">Đã sao chép</span>}</button></div>
                  <h2>{item.title}</h2>
                  <p>{item.location} · {item.theme}</p>
                </div>
                <b className={'lookup-modern-pill '+String(item.status||'').toLowerCase()}>{labels[item.status]||item.status}</b>
              </header>

              <div className="lookup-profile-grid">
                <div className={'lookup-profile-status '+(item.status==='REJECTED'?'danger':currentIndex>=1?'good':'pending')}>
                  {item.status==='REJECTED'?<AlertCircle/>:currentIndex>=1?<CheckCircle2/>:<Clock3/>}
                  <div><span>KIỂM TRA GÓC NHÌN</span><b>{labels[item.status]||item.status}</b><small>{item.status==='PENDING'?'BTC đang kiểm tra nội dung đóng góp.':item.status==='REJECTED'?'Hồ sơ cần kiểm tra hoặc bổ sung theo hướng dẫn của BTC.':'Góc nhìn đã đi qua bước kiểm tra hợp lệ.'}</small></div>
                </div>
                <div className={'lookup-profile-status '+publicationTone}>
                  <Globe2/><div><span>CÔNG BỐ</span><b>{publicationTitle}</b><small>{publicationDetail}</small></div>
                </div>
                <div className={'lookup-profile-status '+mapsTone}>
                  <MapPinned/><div><span>HOLA MAPS</span><b>{mapsTitle}</b><small>{mapsDetail}</small>{item.hola_maps_last_sync_error&&<div className="lookup-maps-error">{item.hola_maps_last_sync_error}</div>}</div>
                </div>
              </div>

              <div className="lookup-profile-actions">
                {item.publicArtworkUrl&&<a className="primary" href={item.publicArtworkUrl}>Xem góc nhìn công khai <ExternalLink/></a>}
                {item.hola_maps_public_url&&<a href={item.hola_maps_public_url} target="_blank" rel="noreferrer">Mở trên HOLA Maps <MapPinned/></a>}
                {item.facebook_post_url&&<a href={item.facebook_post_url} target="_blank" rel="noreferrer">Xem bài Facebook <ExternalLink/></a>}
              </div>

              <section className={'lookup-modern-readiness '+(completionPercent===100?'complete':'needs-action')}>
                <div className="lookup-modern-readiness-head">
                  <div>
                    <span>ĐỘ HOÀN THIỆN GÓC NHÌN</span>
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
                <div className="lookup-modern-warning"><AlertCircle/><div><b>Góc nhìn cần được bổ sung</b><p>Ban Tổ chức sẽ liên hệ qua email nếu cần bổ sung hoặc làm rõ thông tin.</p></div></div>
              :
                <div className="lookup-modern-progress">
                  <div className="lookup-modern-progress-title"><b><Route size={16}/> Hành trình ghi nhận</b><span>Cập nhật theo trạng thái chương trình</span></div>
                  <div className="lookup-modern-flow">{flow.map((s,i)=><div key={s} className={'lookup-modern-step '+(i<=currentIndex?'done':'')}>
                    <div className="lookup-modern-step-icon">{i<currentIndex?<CheckCircle2/>:i===currentIndex?<Clock3/>:<span>{i+1}</span>}</div>
                    <b>{labels[s]}</b>
                  </div>)}</div>
                </div>}

              {(facebookRequired||item.facebook_post_url)&&<section className={'lookup-modern-facebook '+(facebookDone?'is-complete':'is-pending')}>
                <div className="lookup-modern-facebook-icon"><Link2/></div>
                <div>
                  <span>FACEBOOK {item.submission_source!=='FACEBOOK'&&<em className="lookup-facebook-optional">TÙY CHỌN</em>}</span>
                  <b>{facebookDone?'Đã ghi nhận Facebook':facebookRequired?'Cần hoàn tất bước Facebook':'Chưa liên kết Facebook'}</b>
                  <p>{facebookDone?'Link bài đăng đã được hệ thống ghi nhận.':facebookRequired?'Góc nhìn gửi từ Facebook cần có link bài đăng và xác nhận.':'Góc nhìn gửi từ website không bắt buộc phải đăng Facebook.'}</p>
                </div>
                {item.facebook_post_url&&<a href={item.facebook_post_url} target="_blank" rel="noreferrer">Xem bài Facebook <ExternalLink/></a>}
              </section>}

              <div className="lookup-modern-meta">
                <div><small>Ngày gửi</small><b>{new Date(item.created_at).toLocaleString('vi-VN')}</b></div>
                <div><small>Cập nhật gần nhất</small><b>{new Date(item.updated_at||item.created_at).toLocaleString('vi-VN')}</b></div>
                <div><small>File đã nhận</small><b>{item.media_count} file</b></div>
                <div><small>Dung lượng</small><b>{(Number(item.total_bytes||0)/1024/1024).toFixed(1)} MB</b></div>
                <div><small>Loại hình</small><b>{item.type}</b></div>
                <div><small>Nguồn gửi</small><b>{item.submission_source==='FACEBOOK'?'Facebook':'Website'}</b></div>
              </div>

              <section className="lookup-notification-history">
                <div className="lookup-notification-history-head"><div><span>THÔNG BÁO</span><h3>Lịch sử email từ BTC</h3></div><small>{notifications.length} bản ghi gần nhất</small></div>
                {notifications.length?<div className="lookup-notification-list">{notifications.map(entry=>{
                  const tone=String(entry.deliveryStatus||'').toLowerCase()
                  return <div className={'lookup-notification-item '+tone} key={entry.id}>
                    <span>{entry.deliveryStatus==='SENT'?<Mail/>:entry.deliveryStatus==='FAILED'?<AlertCircle/>:<CircleDashed/>}</span>
                    <div><b>{entry.kind==='RECEIVED'?'Email xác nhận đã nhận góc nhìn':`Cập nhật trạng thái: ${notificationStatusLabels[entry.status]||entry.status||'Góc nhìn'}`}</b><p>{deliveryText(entry)}{entry.detail?` · ${entry.detail}`:''}</p></div>
                    <time>{entry.createdAt?new Date(entry.createdAt).toLocaleString('vi-VN'):''}</time>
                  </div>
                })}</div>:<div className="lookup-modern-security"><Send/>Chưa có lịch sử email được ghi nhận cho góc nhìn này.</div>}
              </section>
            </article>}
        </div>
      </div>
    </section>
  </main>
}