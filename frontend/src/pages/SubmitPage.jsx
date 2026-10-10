import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Camera, Video, FileText, Palette, Upload,
  Check, Copy, Image as ImageIcon, Loader2, Save, ShieldCheck,
  ExternalLink, Share2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import HolaLocationPicker from '../components/HolaLocationPicker.jsx'
import { getColors, getSiteSettings, getThemes, submitArtwork } from '../services/api.js'
import {
  buildSubmissionFacebookCaption,
  CHECKIN_GROUP_SEARCH_URL,
  primeCaptionClipboard,
  resolveCheckinGroupUrl,
  shareSubmission
} from '../utils/facebookShare.js'
import '../styles/submit-success-receipt.css'

const steps = ['Thông tin tác giả','Tác phẩm','Tải tác phẩm','Chủ đề & sắc màu','Địa điểm & câu chuyện','Quyền sử dụng','Xác nhận']
const DRAFT_KEY = 'halo_hola_submission_draft_v2'

const initialForm = {
  name:'', display:'', email:'', phone:'', bio:'',
  title:'', capturedAt:'', externalLink:'', previousAward:false, previousAwardNote:'',
  type:'Photo', theme:'', color:'',
  location:'', locationPlaceId:'', locationPlaceSlug:'', locationLat:'', locationLng:'', locationAddress:'', locationSource:'TEXT', story:'',
  rightsConfirmed:false, imageConsentConfirmed:false,
  isMinor:false, guardianName:'', guardianConsent:false,
  allowMediaUse:true, allowNewsletter:false
}

const clean=value=>String(value??'').trim()
const isValidEmail=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value))
const isValidUrl=value=>{
  if(!clean(value)) return true
  try { new URL(clean(value)); return true } catch { return false }
}
const hasCoordinate=value=>value!==''&&value!==null&&value!==undefined&&Number.isFinite(Number(value))

export default function SubmitPage(){
  const [step,setStep]=useState(1)
  const [form,setForm]=useState(()=>{
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
      const merged=saved ? {...initialForm,...saved} : initialForm
      if(merged.type==='Ảnh') merged.type='Photo'
      return merged
    } catch { return initialForm }
  })
  const [themes,setThemes]=useState([])
  const [colors,setColors]=useState([])
  const [siteSettings,setSiteSettings]=useState({})
  const [files,setFiles]=useState([])
  const [previewUrl,setPreviewUrl]=useState('')
  const [submitting,setSubmitting]=useState(false)
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')
  const [savedAt,setSavedAt]=useState(null)
  const [copiedAction,setCopiedAction]=useState('')
  const [shareNotice,setShareNotice]=useState('')
  const inputRef=useRef(null)
  const saveTimer=useRef(null)
  const code=useMemo(()=>result?.code || 'HH26-XXXXX',[result])
  const types=[['Photo','Ảnh đơn, bộ ảnh, photo story',Camera],['Video','Reel, short video, phim ngắn, timelapse',Video],['Story & Creative','Câu chuyện, tản văn, ký ức, audio story',FileText],['Art & Design','Tranh, ký họa, illustration, digital art, poster',Palette]]
  const lookupPath=result?.code?`/tra-cuu?code=${encodeURIComponent(result.code)}`:'/tra-cuu'
  const lookupLink=result?.code&&typeof window!=='undefined'?`${window.location.origin}${lookupPath}`:''
  const checkinGroupUrl=useMemo(()=>resolveCheckinGroupUrl(siteSettings),[siteSettings])
  const facebookCaption=useMemo(()=>result?buildSubmissionFacebookCaption({form,code:result.code}):'',[form,result])

  useEffect(()=>{
    Promise.all([getThemes(),getColors()]).then(([themeRows,colorRows])=>{
      const nextThemes=Array.isArray(themeRows)?themeRows:[]
      const nextColors=Array.isArray(colorRows)?colorRows:[]
      setThemes(nextThemes);setColors(nextColors)
      setForm(current=>({
        ...current,
        theme:current.theme||nextThemes[0]?.title||'',
        color:current.color||nextColors[0]?.name||''
      }))
    }).catch(err=>setError(err.message))
  },[])

  useEffect(()=>{
    getSiteSettings().then(settings=>setSiteSettings(settings||{})).catch(()=>{})
  },[])

  useEffect(()=>{
    const imageFile=files.find(file=>file.type?.startsWith('image/'))
    if(!imageFile){setPreviewUrl('');return undefined}
    const url=URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return()=>URL.revokeObjectURL(url)
  },[files])

  useEffect(()=>{
    if(result) return undefined
    window.clearTimeout(saveTimer.current)
    saveTimer.current=window.setTimeout(()=>{
      localStorage.setItem(DRAFT_KEY,JSON.stringify(form))
      setSavedAt(new Date())
    },500)
    return ()=>window.clearTimeout(saveTimer.current)
  },[form,result])

  const upd=(k,v)=>{
    setError('')
    setForm(s=>({...s,[k]:v}))
  }

  const updateLocation=patch=>{
    setError('')
    setForm(s=>({...s,...patch}))
  }

  const copyValue=async(value,key)=>{
    if(!value) return
    try{
      await navigator.clipboard.writeText(value)
      setCopiedAction(key)
      window.setTimeout(()=>setCopiedAction(current=>current===key?'':current),1800)
    }catch{
      setCopiedAction('error')
      window.setTimeout(()=>setCopiedAction(''),1800)
    }
  }

  const showCopiedCaptionState=()=>{
    setCopiedAction('facebook-caption')
    window.setTimeout(()=>setCopiedAction(current=>current==='facebook-caption'?'':current),2200)
  }

  const openCheckinGroup=()=>{
    if(!facebookCaption) return
    primeCaptionClipboard(facebookCaption)
    showCopiedCaptionState()
    const target=checkinGroupUrl || CHECKIN_GROUP_SEARCH_URL
    window.open(target,'_blank','noopener,noreferrer')
    setShareNotice(checkinGroupUrl
      ? 'Đã sao chép sẵn nội dung và mở CHECK IN HOALAC. Nếu Facebook chưa giữ phần chữ, chỉ cần Dán rồi bấm Đăng.'
      : 'Đã sao chép sẵn nội dung. Chưa có link Group chính thức trong cấu hình nên Facebook đang mở trang tìm CHECK IN HOALAC.')
  }

  const shareOnFacebook=async()=>{
    if(!facebookCaption) return
    setShareNotice('')

    if(typeof navigator==='undefined'||typeof navigator.share!=='function'){
      openCheckinGroup()
      return
    }

    try{
      const status=await shareSubmission({caption:facebookCaption,url:lookupLink,files})
      showCopiedCaptionState()
      setShareNotice(status.filesIncluded
        ? 'Đã mở bảng chia sẻ với ảnh/video. Nội dung cũng đã được sao chép sẵn để bạn Dán nếu Facebook không giữ caption.'
        : 'Đã mở bảng chia sẻ và sao chép sẵn caption. Nếu Facebook không nhận file từ trình duyệt này, hãy dùng nút mở Group và chọn lại ảnh trên thiết bị.')
    }catch(err){
      if(err?.name==='AbortError'){
        setShareNotice('Bạn đã đóng bảng chia sẻ. Nội dung vẫn được giữ sẵn để chia sẻ lại khi cần.')
        return
      }
      primeCaptionClipboard(facebookCaption)
      showCopiedCaptionState()
      setShareNotice('Thiết bị chưa mở được bảng chia sẻ. Nội dung đã được sao chép; dùng nút “Mở CHECK IN HOALAC” để tiếp tục.')
    }
  }

  const getValidationIssues=()=>{
    const issues=[]
    if(clean(form.name).length<2) issues.push({step:1,key:'name',label:'Họ và tên'})
    if(!isValidEmail(form.email)) issues.push({step:1,key:'email',label:'Email hợp lệ'})
    if(clean(form.title).length<2) issues.push({step:2,key:'title',label:'Tên tác phẩm'})
    if(!isValidUrl(form.externalLink)) issues.push({step:2,key:'externalLink',label:'Link tác phẩm hợp lệ'})
    if(!files.length&&!clean(form.externalLink)) issues.push({step:3,key:'files',label:'File gốc hoặc link tác phẩm'})
    if(!clean(form.theme)) issues.push({step:4,key:'theme',label:'Chủ đề'})
    if(clean(form.location).length<2) issues.push({step:5,key:'location',label:'Địa điểm'})
    if(hasCoordinate(form.locationLat)!==hasCoordinate(form.locationLng)) issues.push({step:5,key:'coordinates',label:'Tọa độ địa điểm đầy đủ'})
    if(clean(form.story).length<20) issues.push({step:5,key:'story',label:'Câu chuyện (tối thiểu 20 ký tự)'})
    if(!form.rightsConfirmed) issues.push({step:6,key:'rightsConfirmed',label:'Xác nhận quyền tác giả'})
    if(form.isMinor&&clean(form.guardianName).length<2) issues.push({step:6,key:'guardianName',label:'Họ tên người giám hộ'})
    if(form.isMinor&&!form.guardianConsent) issues.push({step:6,key:'guardianConsent',label:'Xác nhận của người giám hộ'})
    return issues
  }

  const stepIssues=target=>getValidationIssues().filter(item=>item.step===target)
  const isStepComplete=target=>target===7?getValidationIssues().length===0:stepIssues(target).length===0
  const formatIssues=issues=>{
    const labels=[...new Set(issues.map(item=>item.label))]
    return labels.length?`Còn thiếu: ${labels.join(', ')}.`:''
  }

  const next=()=>{
    setError('')
    const issues=stepIssues(step)
    if(issues.length){
      setError(formatIssues(issues))
      return
    }
    setStep(v=>Math.min(7,v+1))
  }

  const prev=()=>{ setError(''); setStep(v=>Math.max(1,v-1)) }

  const goToStep=target=>{
    setError('')
    if(target<=step){setStep(target);return}
    const blocking=getValidationIssues().filter(item=>item.step<target)
    if(blocking.length){
      const firstStep=Math.min(...blocking.map(item=>item.step))
      const firstStepIssues=blocking.filter(item=>item.step===firstStep)
      setStep(firstStep)
      setError(`Hoàn thiện bước ${firstStep} trước khi tiếp tục. ${formatIssues(firstStepIssues)}`)
      return
    }
    setStep(target)
  }

  const resetDraft=()=>{
    localStorage.removeItem(DRAFT_KEY)
    setForm({...initialForm,theme:themes[0]?.title||'',color:colors[0]?.name||''})
    setFiles([])
    setStep(1)
    setResult(null)
    setError('')
    setCopiedAction('')
    setShareNotice('')
  }

  const submit = async () => {
    setError('')
    const issues=getValidationIssues()
    if(issues.length){
      const firstStep=Math.min(...issues.map(item=>item.step))
      setError(`${formatIssues(issues)} Vui lòng quay lại bước ${firstStep} để bổ sung.`)
      return
    }

    setSubmitting(true)
    try {
      const data = await submitArtwork({
        fields: {
          ...form,
          name:clean(form.name),
          display:clean(form.display),
          displayName: clean(form.display),
          email:clean(form.email),
          title:clean(form.title),
          externalLink:clean(form.externalLink),
          theme:clean(form.theme),
          location:clean(form.location),
          locationPlaceId:clean(form.locationPlaceId),
          locationPlaceSlug:clean(form.locationPlaceSlug),
          locationAddress:clean(form.locationAddress),
          locationSource:clean(form.locationSource)||'TEXT',
          story:clean(form.story),
          guardianName:clean(form.guardianName)
        },
        files
      })
      localStorage.removeItem(DRAFT_KEY)
      setResult(data)
    } catch (err) {
      const detail=Array.isArray(err.details)&&err.details.length
        ? ' ' + err.details.map(item=>item?.message).filter(Boolean).join(' · ')
        : ''
      setError((err.message || 'Có lỗi xảy ra khi gửi tác phẩm') + detail)
    } finally {
      setSubmitting(false)
    }
  }

  const heroImage=themes.find(t=>t.title===form.theme)?.image||themes[0]?.image||''
  const storyLength=clean(form.story).length
  const hasPinnedLocation=hasCoordinate(form.locationLat)&&hasCoordinate(form.locationLng)

  return <main>
    <PageHero eyebrow="GÓC NHÌN CỦA BẠN" title="Gửi góc nhìn" accent="của bạn" desc="Gửi tác phẩm gốc, câu chuyện và thông tin bản quyền trong một luồng an toàn. File original được giữ nguyên chất lượng." image={heroImage}>
      <div className="draft-status"><Save size={15}/>{savedAt ? 'Đã lưu nháp lúc ' + savedAt.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : 'Tự động lưu nháp'}</div>
    </PageHero>

    <section className="submit-page container section">
      <div className="stepper">{steps.map((s,i)=>{
        const target=i+1
        const done=target<7&&isStepComplete(target)
        return <button key={s} className={step===target?'active':done?'done':''} onClick={()=>goToStep(target)}><span>{done?<Check size={15}/>:target}</span><b>{s}</b></button>
      })}</div>

      <div className="submit-layout">
        <div className="wizard-card">
          <span className="eyebrow">Bước {step} / 7</span>

          {step===1&&<div>
            <h2>Thông tin tác giả</h2><p>Thông tin này dùng để BTC liên hệ và xác minh tác phẩm.</p>
            <div className="form-grid">
              <label>Họ và tên *<input value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="Nguyễn Minh An"/></label>
              <label>Tên hiển thị<input value={form.display} onChange={e=>upd('display',e.target.value)} placeholder="Minh An"/></label>
              <label>Email *<input type="email" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="an.nguyen@gmail.com"/></label>
              <label>Số điện thoại<input value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="0987 654 321"/></label>
              <label className="full">Giới thiệu ngắn<textarea value={form.bio} onChange={e=>upd('bio',e.target.value)} placeholder="Một vài dòng về bạn..."/></label>
            </div>
          </div>}

          {step===2&&<div>
            <h2>Thông tin tác phẩm</h2><p>Đặt tên và cho BTC biết tác phẩm được tạo khi nào.</p>
            <div className="form-grid">
              <label className="full">Tên tác phẩm *<input value={form.title} onChange={e=>upd('title',e.target.value)} placeholder="Bình minh trên hồ Đồng Mô"/></label>
              <label>Thời gian chụp / thực hiện<input type="date" value={form.capturedAt} onChange={e=>upd('capturedAt',e.target.value)}/></label>
              <label>Link tác phẩm (nếu có)<input value={form.externalLink} onChange={e=>upd('externalLink',e.target.value)} placeholder="https://..."/></label>
            </div>
            <h3 className="form-subtitle">Loại hình</h3>
            <div className="type-grid">{types.map(([value,desc,I])=><button key={value} onClick={()=>upd('type',value)} className={form.type===value?'selected':''}><I/><b>{value}</b><small>{desc}</small></button>)}</div>
          </div>}

          {step===3&&<div>
            <h2>Tải file gốc</h2><p>File original được lưu riêng, không resize và không nén lại.</p>
            <div className="vault-note"><ShieldCheck/><div><b>Original Vault</b><span>Giữ nguyên byte file gốc · checksum SHA-256 · tối đa 10 file</span></div></div>
            <div className="upload-box" onClick={()=>inputRef.current?.click()}>
              <Upload size={34}/><b>Kéo thả tệp vào đây hoặc</b>
              <button type="button" className="btn btn-terra">Chọn tệp từ thiết bị</button>
              <small>JPG, PNG, WEBP, MP4, MOV, PDF, DOC/DOCX, MP3 · tối đa theo cấu hình server.</small>
              <input ref={inputRef} hidden multiple type="file" accept="image/*,video/*,.pdf,.doc,.docx,.mp3" onChange={e=>{setError('');setFiles(Array.from(e.target.files || []).slice(0,10))}}/>
            </div>
            <div className="upload-thumbs">{files.length?files.map((file,i)=><div className="file-chip" key={file.name + '-' + i}><ImageIcon/><span title={file.name}>{file.name}<small>{(file.size/1024/1024).toFixed(2)} MB</small></span><button onClick={(e)=>{e.stopPropagation();setError('');setFiles(v=>v.filter((_,idx)=>idx!==i))}}>×</button></div>):<button onClick={()=>inputRef.current?.click()}><ImageIcon/> Chưa có tệp · Thêm tệp</button>}</div>
          </div>}

          {step===4&&<div>
            <h2>Chủ đề & sắc màu</h2><p>Chọn lớp câu chuyện phù hợp nhất với góc nhìn của bạn.</p>
            {themes.length?<div className="theme-select-grid">{themes.map(t=><button key={t.id} onClick={()=>upd('theme',t.title)} className={form.theme===t.title?'selected':''}>{t.image?<img src={t.image} alt={t.title}/>:<span className="theme-card-placeholder"/>}<span>{t.title}</span></button>)}</div>:<div className="jw-empty">Đang tải 8 chủ đề từ hệ thống...</div>}
            <h3 className="form-subtitle">Sắc màu Hòa Lạc</h3>
            {colors.length?<div className="color-select-grid">{colors.map(c=><button key={c.id||c.slug} onClick={()=>upd('color',c.name)} className={form.color===c.name?'selected':''}><span style={{background:c.color}}/>{form.color===c.name&&<i><Check size={14}/></i>}<b>{c.name}</b><small>{c.story}</small></button>)}</div>:<div className="jw-empty">Đang tải sắc màu từ hệ thống...</div>}
          </div>}

          {step===5&&<div>
            <h2>Địa điểm & câu chuyện</h2>
            <p>Chọn đúng nơi tác phẩm được thực hiện để BTC đối chiếu địa bàn và có thể gắn tác phẩm lên HOLA Map.</p>
            <HolaLocationPicker
              value={{
                location:form.location,
                locationPlaceId:form.locationPlaceId,
                locationPlaceSlug:form.locationPlaceSlug,
                locationLat:form.locationLat,
                locationLng:form.locationLng,
                locationAddress:form.locationAddress,
                locationSource:form.locationSource
              }}
              onChange={updateLocation}
            />
            <div className="form-grid location-story-grid">
              <label className="full">Câu chuyện 50–150 chữ *<textarea rows="7" value={form.story} onChange={e=>upd('story',e.target.value)} placeholder="Kể câu chuyện đằng sau tác phẩm..."/><small>{storyLength} ký tự · cần tối thiểu 20 ký tự để gửi</small></label>
              <label className="full check-row"><input type="checkbox" checked={form.previousAward} onChange={e=>upd('previousAward',e.target.checked)}/> Tác phẩm này từng tham gia/đạt giải ở chương trình khác</label>
              {form.previousAward&&<label className="full">Thông tin giải/chương trình<textarea value={form.previousAwardNote} onChange={e=>upd('previousAwardNote',e.target.value)} placeholder="Tên chương trình, năm, giải thưởng..."/></label>}
            </div>
          </div>}

          {step===6&&<div>
            <h2>Quyền tác giả & đồng thuận</h2><p>Những xác nhận này giúp bảo vệ tác giả, người xuất hiện trong tác phẩm và BTC.</p>
            <div className="confirm-list">
              <label><input type="checkbox" checked={form.rightsConfirmed} onChange={e=>upd('rightsConfirmed',e.target.checked)}/> <b>Tôi xác nhận mình có quyền gửi và sử dụng tác phẩm này.</b></label>
              <label><input type="checkbox" checked={form.imageConsentConfirmed} onChange={e=>upd('imageConsentConfirmed',e.target.checked)}/> Tôi đã có sự đồng ý phù hợp của người có thể nhận diện trong ảnh/video (nếu có).</label>
              <label><input type="checkbox" checked={form.allowMediaUse} onChange={e=>upd('allowMediaUse',e.target.checked)}/> Tôi đồng ý cho HALO HOLA sử dụng tác phẩm cho mục đích truyền thông theo thể lệ.</label>
              <label><input type="checkbox" checked={form.allowNewsletter} onChange={e=>upd('allowNewsletter',e.target.checked)}/> Tôi đồng ý nhận tin về HALO HOLA và các hoạt động cộng đồng.</label>
              <label><input type="checkbox" checked={form.isMinor} onChange={e=>upd('isMinor',e.target.checked)}/> Tôi chưa đủ 18 tuổi.</label>
            </div>
            {form.isMinor&&<div className="guardian-box">
              <label>Họ tên người giám hộ<input value={form.guardianName} onChange={e=>upd('guardianName',e.target.value)} placeholder="Họ và tên"/></label>
              <label className="check-row"><input type="checkbox" checked={form.guardianConsent} onChange={e=>upd('guardianConsent',e.target.checked)}/> Người giám hộ đồng ý cho tôi tham gia và gửi tác phẩm.</label>
            </div>}
          </div>}

          {step===7&&<div>
            <h2>{result?'Gửi tác phẩm thành công':'Kiểm tra lần cuối'}</h2>
            {result?<div className="success-stack">
              <div className="submit-success-receipt">
                <div className="submit-success-icon"><Check/></div>
                <span className="submit-success-kicker">GỬI TÁC PHẨM THÀNH CÔNG</span>
                <h3>Hãy lưu mã tác phẩm để tra cứu sau này</h3>
                <p>BTC đã nhận hồ sơ và file của bạn. Mã dưới đây là thông tin quan trọng để theo dõi trạng thái tác phẩm.</p>

                <div className="submit-success-code">
                  <small>Mã tác phẩm</small>
                  <strong>{result.code}</strong>
                  <button type="button" onClick={()=>copyValue(result.code,'code')}><Copy size={17}/>{copiedAction==='code'?'Đã sao chép':'Sao chép mã'}</button>
                </div>

                <div className="submit-success-link">
                  <div><small>Liên kết tra cứu</small><code>{lookupLink}</code></div>
                  <button type="button" onClick={()=>copyValue(lookupLink,'link')}><Copy size={17}/>{copiedAction==='link'?'Đã sao chép':'Sao chép liên kết'}</button>
                </div>

                <div className="submit-success-reminder">
                  <b>Khi tra cứu:</b> dùng mã <strong>{result.code}</strong> và email đã gửi là <strong>{clean(form.email)}</strong>.
                  {copiedAction==='error'&&<span> Trình duyệt không cho phép sao chép tự động, hãy giữ và sao chép thủ công.</span>}
                </div>
              </div>

              <div className="submit-facebook-share">
                <div className="submit-facebook-share-head">
                  <span>CHIA SẺ GÓC NHÌN</span>
                  <h3>Đăng tiếp lên CHECK IN HOALAC</h3>
                  <p>Ảnh/video và nội dung được chuẩn bị từ chính tác phẩm vừa gửi. Bạn vẫn là người kiểm tra và bấm Đăng trên Facebook.</p>
                </div>

                <div className="submit-facebook-caption">
                  <div className="submit-facebook-caption-head">
                    <div><small>Nội dung Facebook đã chuẩn bị</small><b>Có thể sao chép, chỉnh lại trước khi đăng</b></div>
                    <button type="button" onClick={()=>copyValue(facebookCaption,'facebook-caption')}><Copy size={17}/>{copiedAction==='facebook-caption'?'Đã sao chép':'Sao chép'}</button>
                  </div>
                  <pre>{facebookCaption}</pre>
                </div>

                <div className="submit-facebook-actions">
                  <button type="button" className="btn submit-facebook-primary" onClick={shareOnFacebook}><Share2 size={18}/> Đăng bài lên Facebook</button>
                  <button type="button" className="btn btn-outline" onClick={openCheckinGroup}><ExternalLink size={18}/> {checkinGroupUrl?'Mở CHECK IN HOALAC':'Tìm CHECK IN HOALAC'}</button>
                </div>

                <div className="submit-facebook-tip">
                  <b>Đã có phương án dự phòng:</b> trước khi mở Facebook, caption được sao chép sẵn. Nếu app Facebook không giữ phần chữ, chỉ cần nhấn Dán rồi Đăng.
                </div>
                {shareNotice&&<div className="submit-facebook-notice">{shareNotice}</div>}
              </div>

              <div className="success-actions">
                <Link to={lookupPath} className="btn btn-green">Tra cứu tác phẩm ngay</Link>
                <button className="btn btn-outline" onClick={resetDraft}>Gửi tác phẩm khác</button>
              </div>
              {result.media?.length>0&&<div className="vault-result"><b>Original Vault</b>{result.media.map(m=><div key={m.id}><span>{m.originalName}</span><small>{m.provider} · SHA256 {m.sha256?.slice(0,12)}…</small></div>)}</div>}
            </div>:<>
              <div className="review-grid">
                <div><small>Tác phẩm</small><b>{clean(form.title)||'Chưa nhập'}</b></div>
                <div><small>Họ tên tác giả</small><b>{clean(form.name)||'Chưa nhập'}</b></div>
                <div><small>Email</small><b>{clean(form.email)||'Chưa nhập'}</b></div>
                <div><small>Chủ đề</small><b>{clean(form.theme)||'Chưa chọn'}</b></div>
                <div><small>File / link</small><b>{files.length?`${files.length} file`:clean(form.externalLink)?'Đã có link':'Chưa có'}</b></div>
                <div><small>Địa điểm</small><b>{clean(form.location)||'Chưa nhập'}</b></div>
                <div><small>HOLA Map</small><b>{clean(form.locationPlaceId)?'Đã liên kết địa điểm':hasPinnedLocation?'Đã ghim tọa độ':'Nhập thủ công'}</b></div>
                <div><small>Tọa độ</small><b>{hasPinnedLocation?`${Number(form.locationLat).toFixed(6)}, ${Number(form.locationLng).toFixed(6)}`:'Chưa có'}</b></div>
                <div><small>Câu chuyện</small><b>{storyLength>=20?`Đã nhập · ${storyLength} ký tự`:'Chưa đủ nội dung'}</b></div>
                <div><small>Quyền tác giả</small><b>{form.rightsConfirmed?'Đã xác nhận':'Chưa xác nhận'}</b></div>
              </div>
              {error&&<div className="form-error">{error}</div>}
            </>}
          </div>}

          {error&&step<7&&<div className="form-error">{error}</div>}

          {!result&&<div className="wizard-actions">
            <button className="btn btn-outline" onClick={prev} disabled={step===1}><ArrowLeft size={16}/> Quay lại</button>
            {step<7?<button className="btn btn-terra" onClick={next}>Tiếp tục <ArrowRight size={16}/></button>:<button className="btn btn-terra" disabled={submitting} onClick={submit}>{submitting?<><Loader2 className="spin" size={16}/> Đang lưu original...</>:<>Gửi tác phẩm <ArrowRight size={16}/></>}</button>}
          </div>}
        </div>

        <aside className="submission-preview">
          <span className="eyebrow">XEM TRƯỚC TÁC PHẨM</span>
          <div className="preview-card">{previewUrl?<img src={previewUrl} alt="Xem trước tác phẩm"/>:<div className="theme-card-placeholder"/>}<div className="preview-body"><div className="preview-tags"><span>{form.type}</span><span>{form.theme||'Chưa chọn chủ đề'}</span></div><h3>{form.title||'Tên tác phẩm của bạn'}</h3><p>{form.display||form.name||'Tên tác giả'}</p><p>{form.story||'Câu chuyện phía sau tác phẩm sẽ xuất hiện tại đây...'}</p><div className="preview-tags"><span>{form.location||'Chưa nhập địa điểm'}</span>{form.color&&<span>{form.color}</span>}</div></div></div>
          <div className="submission-code"><small>{result?'Mã tác phẩm':'Mã sẽ tạo sau khi gửi'}</small><strong>{code}</strong>{result&&<button onClick={()=>copyValue(code,'sidebar-code')}><Copy size={16}/>{copiedAction==='sidebar-code'&&<span>Đã sao chép</span>}</button>}</div>
          <blockquote>“Mỗi góc nhìn của bạn đều góp phần tạo nên một bức tranh Hòa Lạc đa sắc màu.”</blockquote>
          <Link className="text-link" to={result?lookupPath:'/tra-cuu'}>{result?'Tra cứu tác phẩm này →':'Đã gửi trước đó? Tra cứu tác phẩm →'}</Link>
        </aside>
      </div>
    </section>
  </main>
}
