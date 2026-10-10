import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { Check, CheckCircle2, Copy, ExternalLink, FileUp, Loader2, ShieldCheck, Smartphone, UploadCloud } from 'lucide-react'
import { client, getSiteSettings, getThemes } from '../services/api.js'
import { CHECKIN_GROUP_SEARCH_URL, primeCaptionClipboard, resolveCheckinGroupUrl } from '../utils/facebookShare.js'

const TYPES=['Photo','Video','Story & Creative','Art & Design']
const emptyForm={
  name:'',displayName:'',email:'',phone:'',title:'',type:'Photo',theme:'',color:'',location:'',story:'',
  rightsConfirmed:false,imageConsentConfirmed:false,isMinor:false,guardianName:'',guardianConsent:false,
  allowMediaUse:true,allowNewsletter:false
}

function clean(value){return String(value??'').trim()}
function isIOS(){
  if(typeof navigator==='undefined')return false
  return /iPad|iPhone|iPod/i.test(navigator.userAgent||'') || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)
}

export default function SubmissionQuickMode(){
  const {pathname}=useLocation()
  const [target,setTarget]=useState(null)
  const [mode,setMode]=useState('FULL')
  const [form,setForm]=useState(emptyForm)
  const [themes,setThemes]=useState([])
  const [settings,setSettings]=useState({})
  const [result,setResult]=useState(null)
  const [opened,setOpened]=useState(false)
  const [facebookPostUrl,setFacebookPostUrl]=useState('')
  const [busy,setBusy]=useState(false)
  const [done,setDone]=useState(false)
  const [error,setError]=useState('')
  const [copied,setCopied]=useState(false)

  useEffect(()=>{
    if(pathname!=='/gui-goc-nhin'){setTarget(null);return undefined}
    let mount=null
    let page=null
    const attach=()=>{
      page=document.querySelector('.submit-page')
      if(!page)return false
      mount=page.querySelector(':scope > .major-submission-mode-mount')
      if(!mount){
        mount=document.createElement('div')
        mount.className='major-submission-mode-mount'
        page.insertBefore(mount,page.firstChild)
      }
      setTarget(mount)
      return true
    }
    if(!attach()){
      const observer=new MutationObserver(()=>{if(attach())observer.disconnect()})
      observer.observe(document.body,{childList:true,subtree:true})
      return()=>observer.disconnect()
    }
    return()=>{}
  },[pathname])

  useEffect(()=>{
    const page=target?.closest('.submit-page')
    if(!page)return
    page.classList.toggle('major-quick-submission-mode',mode==='QUICK')
    return()=>page.classList.remove('major-quick-submission-mode')
  },[target,mode])

  useEffect(()=>{
    if(pathname!=='/gui-goc-nhin')return
    getThemes().then(rows=>{
      const list=Array.isArray(rows)?rows:[]
      setThemes(list)
      setForm(current=>({...current,theme:current.theme||list[0]?.title||''}))
    }).catch(()=>{})
    getSiteSettings().then(setSettings).catch(()=>{})
  },[pathname])

  const groupUrl=useMemo(()=>resolveCheckinGroupUrl(settings||{})||CHECKIN_GROUP_SEARCH_URL,[settings])
  const caption=useMemo(()=>{
    if(!result)return''
    return [
      'HALO HOLA 2026 — 52 GÓC NHÌN · 1 HÒA LẠC',
      '',
      `Tên tác phẩm: ${clean(form.title)}`,
      `Tác giả: ${clean(form.displayName)||clean(form.name)}`,
      `Chủ đề: ${clean(form.theme)}`,
      `Loại hình: ${clean(form.type)}`,
      `Địa điểm: ${clean(form.location)}`,
      clean(form.story)?`Câu chuyện: ${clean(form.story)}`:'',
      '',
      `Mã dự thi: ${result.code}`,
      '#HaloHola',
      `#${String(result.code).replace(/-/g,'')}`
    ].filter(Boolean).join('\n')
  },[result,form])

  const update=(key,value)=>{setError('');setForm(v=>({...v,[key]:value}))}

  const createQuick=async(event)=>{
    event.preventDefault()
    setError('')
    const missingCore=clean(form.name).length<2||!/^\S+@\S+\.\S+$/.test(clean(form.email))||clean(form.phone).length<7||clean(form.title).length<2||!clean(form.theme)||clean(form.location).length<2
    const missingConsent=!form.rightsConfirmed||!form.imageConsentConfirmed||(form.isMinor&&(clean(form.guardianName).length<2||!form.guardianConsent))
    if(missingCore||missingConsent){
      setError('Vui lòng điền đủ thông tin bắt buộc, xác nhận quyền tác giả/quyền hình ảnh và thông tin người giám hộ nếu bạn dưới 18 tuổi.')
      return
    }
    setBusy(true)
    try{
      const {data}=await client.post('/submission-operations/facebook-quick',form)
      setResult(data)
      try{localStorage.setItem('halo_hola_quick_last',JSON.stringify({code:data.code,email:form.email,title:form.title}))}catch{}
    }catch(err){setError(err.response?.data?.error||err.message||'Chưa thể tạo Mã dự thi.')}
    finally{setBusy(false)}
  }

  const copyCaption=async()=>{
    if(!caption)return
    try{await navigator.clipboard.writeText(caption);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{primeCaptionClipboard(caption)}
  }

  const openFacebook=()=>{
    if(!caption)return
    primeCaptionClipboard(caption)
    setOpened(true)
    if(isIOS()) window.location.assign(groupUrl)
    else window.open(groupUrl,'_blank','noopener,noreferrer')
  }

  const confirmFacebook=async()=>{
    if(!result||!opened||busy)return
    if(!clean(facebookPostUrl)) {setError('Hãy dán link bài Facebook vừa đăng để gắn đúng bài với Mã dự thi.');return}
    setBusy(true);setError('')
    try{
      await client.post('/submissions/facebook-complete',{code:result.code,email:form.email,facebookPostUrl:clean(facebookPostUrl)})
      setDone(true)
    }catch(err){setError(err.response?.data?.error||err.message||'Chưa thể xác nhận bài Facebook.')}
    finally{setBusy(false)}
  }

  const reset=()=>{
    setResult(null);setOpened(false);setFacebookPostUrl('');setDone(false);setError('');setForm(current=>({...emptyForm,theme:current.theme||themes[0]?.title||''}))
  }

  if(!target)return null

  return createPortal(<section className="submission-mode-shell">
    <div className="submission-mode-heading">
      <span>CHỌN CÁCH DỰ THI</span>
      <h2>Một cuộc thi · hai cách gửi bài</h2>
      <p>Dù gửi đầy đủ trên web hay bắt đầu từ Facebook, mỗi tác phẩm đều có một Mã dự thi để BTC quản lý thống nhất.</p>
    </div>
    <div className="submission-mode-tabs">
      <button type="button" className={mode==='FULL'?'active':''} onClick={()=>setMode('FULL')}>
        <UploadCloud/><span><b>Gửi đầy đủ trên web</b><small>Tải file gốc · lưu hồ sơ · đăng Facebook</small></span>{mode==='FULL'&&<Check/>}
      </button>
      <button type="button" className={mode==='QUICK'?'active':''} onClick={()=>setMode('QUICK')}>
        <Smartphone/><span><b>Dự thi nhanh qua Facebook</b><small>Không cần tải file ngay · tạo Mã dự thi trước</small></span>{mode==='QUICK'&&<Check/>}
      </button>
    </div>

    {mode==='QUICK'&&<div className="quick-submission-card">
      {!result?<form onSubmit={createQuick}>
        <div className="quick-submission-title"><div><span>BƯỚC 1 / 3</span><h3>Tạo Mã dự thi nhanh</h3></div><b>Không cần tải file ở bước này</b></div>
        <div className="quick-grid">
          <label>Họ và tên *<input value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Nguyễn Minh An"/></label>
          <label>Tên hiển thị<input value={form.displayName} onChange={e=>update('displayName',e.target.value)} placeholder="Minh An"/></label>
          <label>Email *<input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="email@example.com"/></label>
          <label>Số điện thoại *<input inputMode="tel" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="09xx xxx xxx"/></label>
          <label className="wide">Tên tác phẩm *<input value={form.title} onChange={e=>update('title',e.target.value)} placeholder="Tên góc nhìn của bạn"/></label>
          <label>Loại hình *<select value={form.type} onChange={e=>update('type',e.target.value)}>{TYPES.map(type=><option key={type}>{type}</option>)}</select></label>
          <label>Chủ đề *<select value={form.theme} onChange={e=>update('theme',e.target.value)}>{themes.map(theme=><option key={theme.id||theme.slug} value={theme.title}>{theme.title}</option>)}</select></label>
          <label className="wide">Địa điểm tại Hòa Lạc *<input value={form.location} onChange={e=>update('location',e.target.value)} placeholder="Xã / địa điểm thực hiện tác phẩm"/></label>
          <label className="wide">Câu chuyện ngắn <textarea rows="4" value={form.story} onChange={e=>update('story',e.target.value)} placeholder="Có thể bổ sung sau; nếu có hãy kể vài dòng về góc nhìn này..."/></label>
        </div>
        <label className="quick-check"><input type="checkbox" checked={form.rightsConfirmed} onChange={e=>update('rightsConfirmed',e.target.checked)}/><span><b>Tôi xác nhận mình có quyền dự thi với tác phẩm này.</b><small>BTC có thể yêu cầu file gốc nếu tác phẩm vào vòng tuyển chọn.</small></span></label>
        <label className="quick-check"><input type="checkbox" checked={form.imageConsentConfirmed} onChange={e=>update('imageConsentConfirmed',e.target.checked)}/><span><b>Tôi đã có sự đồng ý phù hợp về quyền hình ảnh (nếu tác phẩm có người có thể nhận diện).</b><small>Xác nhận này giúp bài đủ điều kiện để BTC xem xét công khai trên HALO HOLA Explore.</small></span></label>
        <label className="quick-check"><input type="checkbox" checked={form.isMinor} onChange={e=>update('isMinor',e.target.checked)}/><span><b>Tôi chưa đủ 18 tuổi.</b><small>Nếu chọn, cần thông tin và xác nhận của người giám hộ.</small></span></label>
        {form.isMinor&&<div className="quick-guardian"><label>Họ tên người giám hộ *<input value={form.guardianName} onChange={e=>update('guardianName',e.target.value)} placeholder="Họ và tên người giám hộ"/></label><label className="quick-check"><input type="checkbox" checked={form.guardianConsent} onChange={e=>update('guardianConsent',e.target.checked)}/><span><b>Người giám hộ đồng ý cho tôi tham gia HALO HOLA 2026.</b></span></label></div>}
        {error&&<div className="quick-error">{error}</div>}
        <button className="quick-primary" disabled={busy}>{busy?<><Loader2 className="spin"/>Đang tạo Mã dự thi...</>:<>Tạo Mã dự thi · Sang bước Facebook</>}</button>
      </form>:done?<div className="quick-complete">
        <CheckCircle2/>
        <span>HOÀN TẤT</span>
        <h3>Bài dự thi đã được gắn với Facebook</h3>
        <p>Mã dự thi <strong>{result.code}</strong> đã lưu cùng link bài Facebook. Bạn có thể bổ sung file gốc sau trong trang Tra cứu.</p>
        <div className="quick-complete-actions"><a className="btn btn-green" href={`/tra-cuu?code=${encodeURIComponent(result.code)}`}>Tra cứu & bổ sung hồ sơ</a><button className="btn btn-outline" onClick={reset}>Tạo bài khác</button></div>
      </div>:<div className="quick-facebook-stage">
        <div className="quick-progress"><span className="done"><Check/>Thông tin</span><i/><span className="active">2 · Facebook</span><i/><span>3 · Hoàn tất</span></div>
        <div className="quick-code"><small>MÃ DỰ THI</small><strong>{result.code}</strong><button onClick={()=>navigator.clipboard?.writeText(result.code)}><Copy/> Sao chép</button></div>
        <div className="quick-caption"><div><b>Nội dung đã chuẩn bị sẵn</b><button type="button" onClick={copyCaption}><Copy/>{copied?'Đã sao chép':'Sao chép'}</button></div><pre>{caption}</pre></div>
        <div className="quick-facebook-actions"><button className="quick-facebook-open" onClick={openFacebook}><ExternalLink/>Đăng lên CHECK IN HOALAC</button><span>Caption được sao chép trước khi mở Facebook.</span></div>
        {opened&&<div className="quick-facebook-link"><label>Link bài Facebook vừa đăng *<input value={facebookPostUrl} onChange={e=>setFacebookPostUrl(e.target.value)} placeholder="https://www.facebook.com/groups/.../posts/..."/></label><p>Link này giúp BTC xác minh bài dự thi và theo dõi Giải Lan tỏa.</p><button className="quick-primary" disabled={busy} onClick={confirmFacebook}>{busy?<><Loader2 className="spin"/>Đang xác nhận...</>:<><CheckCircle2/>Gắn link Facebook · Hoàn tất dự thi</>}</button></div>}
        {!opened&&<div className="quick-info"><ShieldCheck/><span><b>Bài đã có Mã dự thi nhưng chưa hoàn tất.</b> Hãy đăng lên Facebook và quay lại dán link bài viết.</span></div>}
        {error&&<div className="quick-error">{error}</div>}
        <div className="quick-later"><FileUp/><span><b>Chưa có file gốc?</b> Không sao. Sau khi hoàn tất Facebook, bạn có thể bổ sung ảnh/file trong trang Tra cứu bằng Mã dự thi + email.</span></div>
      </div>}
    </div>}
  </section>,target)
}
