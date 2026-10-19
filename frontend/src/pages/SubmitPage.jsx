import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Camera, Video, FileText, Palette, Upload,
  Check, Copy, Image as ImageIcon, Loader2, Save, ShieldCheck,
  ExternalLink, Share2, MapPin
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

const steps = ['Cách đóng góp','Góc nhìn','Tư liệu','7 chủ đề & sắc màu','Địa điểm & câu chuyện','Quyền sử dụng','Xác nhận']
const DRAFT_KEY = 'halo_hola_submission_draft_v3'
const RECEIPT_PREFIX = 'halo_hola_submission_receipt_v1_'
const TAXONOMY_SEPARATOR = ' • '

const initialForm = {
  contributionMode:'CONTENT',
  name:'', display:'', email:'', phone:'', bio:'',
  title:'', capturedAt:'', externalLink:'', previousAward:false, previousAwardNote:'',
  type:'Photo', theme:'', color:'', themes:[], colors:[],
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
const normalizeCode=value=>clean(value).toUpperCase()
const receiptKey=code=>`${RECEIPT_PREFIX}${normalizeCode(code)}`
const selectionArray=(value,fallback='')=>{
  const source=Array.isArray(value)?value:(clean(fallback)?clean(fallback).split(TAXONOMY_SEPARATOR):[])
  return [...new Set(source.map(clean).filter(Boolean))]
}
const hydrateTaxonomies=form=>{
  const themes=selectionArray(form?.themes,form?.theme)
  const colors=selectionArray(form?.colors,form?.color)
  return {...form,themes,colors,theme:themes.join(TAXONOMY_SEPARATOR),color:colors.join(TAXONOMY_SEPARATOR)}
}

function getReceiptCodeFromUrl(){
  if(typeof window==='undefined') return ''
  return normalizeCode(new URLSearchParams(window.location.search).get('code'))
}

function readReceipt(code){
  const normalized=normalizeCode(code)
  if(!normalized) return null
  try{
    const receipt=JSON.parse(localStorage.getItem(receiptKey(normalized))||'null')
    return normalizeCode(receipt?.result?.code)===normalized ? receipt : null
  }catch{return null}
}

function saveReceipt(result,form){
  const code=normalizeCode(result?.code)
  if(!code) return
  try{localStorage.setItem(receiptKey(code),JSON.stringify({result,form,savedAt:Date.now()}))}catch{}
}

function replaceSubmissionUrl(code){
  if(typeof window==='undefined') return
  const normalized=normalizeCode(code)
  const url=new URL(window.location.href)
  if(normalized) url.searchParams.set('code',normalized)
  else url.searchParams.delete('code')
  url.searchParams.set('buoc',normalized?'xac-nhan':'thong-tin')
  url.searchParams.delete('step')
  window.history.replaceState(window.history.state,'',`${url.pathname}${url.search}${url.hash}`)
}

export default function SubmitPage(){
  const [restoredReceipt]=useState(()=>readReceipt(getReceiptCodeFromUrl()))
  const [step,setStep]=useState(()=>restoredReceipt?7:1)
  const [form,setForm]=useState(()=>{
    try {
      if(restoredReceipt?.form){
        const merged=hydrateTaxonomies({...initialForm,...restoredReceipt.form})
        if(merged.type==='Ảnh') merged.type='Photo'
        return merged
      }
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
      const merged=hydrateTaxonomies(saved ? {...initialForm,...saved} : {...initialForm})
      if(merged.type==='Ảnh') merged.type='Photo'
      return merged
    } catch { return {...initialForm} }
  })
  const [themes,setThemes]=useState([])
  const [colors,setColors]=useState([])
  const [siteSettings,setSiteSettings]=useState({})
  const [files,setFiles]=useState([])
  const [previewUrl,setPreviewUrl]=useState('')
  const [submitting,setSubmitting]=useState(false)
  const [result,setResult]=useState(()=>restoredReceipt?.result||null)
  const [error,setError]=useState('')
  const [savedAt,setSavedAt]=useState(()=>restoredReceipt?.savedAt?new Date(restoredReceipt.savedAt):null)
  const [copiedAction,setCopiedAction]=useState('')
  const [shareNotice,setShareNotice]=useState(()=>restoredReceipt?'Đã khôi phục trạng thái theo Mã góc nhìn. Bạn có thể tiếp tục bước chia sẻ mà không cần nhập lại từ đầu.':'')
  const inputRef=useRef(null)
  const saveTimer=useRef(null)
  const code=useMemo(()=>result?.code || 'HH26-XXXXX',[result])
  const isTip=form.contributionMode==='TIP'
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
      setForm(current=>{
        const currentThemes=selectionArray(current.themes,current.theme)
        const currentColors=selectionArray(current.colors,current.color)
        const nextThemeValues=currentThemes.length?currentThemes:(nextThemes[0]?.title?[nextThemes[0].title]:[])
        const nextColorValues=currentColors.length?currentColors:(nextColors[0]?.name?[nextColors[0].name]:[])
        return {...current,themes:nextThemeValues,colors:nextColorValues,theme:nextThemeValues.join(TAXONOMY_SEPARATOR),color:nextColorValues.join(TAXONOMY_SEPARATOR)}
      })
    }).catch(err=>setError(err.message))
  },[])

  useEffect(()=>{getSiteSettings().then(settings=>setSiteSettings(settings||{})).catch(()=>{})},[])

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

  const upd=(k,v)=>{setError('');setForm(s=>({...s,[k]:v}))}
  const setContributionMode=mode=>{
    setError('')
    setForm(current=>({...current,contributionMode:mode,type:mode==='TIP'?'Story & Creative':current.type==='Story & Creative'?'Photo':current.type}))
  }
  const toggleTaxonomy=(arrayKey,legacyKey,value)=>{
    setError('')
    setForm(current=>{
      const selected=selectionArray(current[arrayKey],current[legacyKey])
      const next=selected.includes(value)?selected.filter(item=>item!==value):[...selected,value]
      return {...current,[arrayKey]:next,[legacyKey]:next.join(TAXONOMY_SEPARATOR)}
    })
  }
  const updateLocation=patch=>{setError('');setForm(s=>({...s,...patch}))}

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
    if(typeof navigator==='undefined'||typeof navigator.share!=='function'){openCheckinGroup();return}
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
    if(!clean(form.phone)) issues.push({step:1,key:'phone',label:'Số điện thoại'})
    if(clean(form.title).length<2) issues.push({step:2,key:'title',label:isTip?'Tên câu chuyện / đầu mối':'Tên góc nhìn'})
    if(!isValidUrl(form.externalLink)) issues.push({step:2,key:'externalLink',label:'Link nội dung hợp lệ'})
    if(!isTip&&!files.length&&!clean(form.externalLink)&&!result) issues.push({step:3,key:'files',label:'Tư liệu gốc hoặc link nội dung'})
    if(!selectionArray(form.themes,form.theme).length) issues.push({step:4,key:'theme',label:'Ít nhất một chủ đề'})
    if(clean(form.location).length<2) issues.push({step:5,key:'location',label:'Địa điểm'})
    if(hasCoordinate(form.locationLat)!==hasCoordinate(form.locationLng)) issues.push({step:5,key:'coordinates',label:'Tọa độ địa điểm đầy đủ'})
    if(clean(form.story).length<20) issues.push({step:5,key:'story',label:isTip?'Mô tả đầu mối (tối thiểu 20 ký tự)':'Câu chuyện (tối thiểu 20 ký tự)'})
    if(!form.rightsConfirmed) issues.push({step:6,key:'rightsConfirmed',label:'Xác nhận quyền cung cấp thông tin'})
    if(!form.imageConsentConfirmed) issues.push({step:6,key:'imageConsentConfirmed',label:'Xác nhận đồng thuận hình ảnh / thông tin nhân vật'})
    if(!form.allowMediaUse) issues.push({step:6,key:'allowMediaUse',label:'Quyền sử dụng nội dung theo hướng dẫn chương trình'})
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
    if(issues.length){setError(formatIssues(issues));return}
    setStep(v=>Math.min(7,v+1))
  }
  const prev=()=>{setError('');setStep(v=>Math.max(1,v-1))}
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
    replaceSubmissionUrl('')
    const defaultThemes=themes[0]?.title?[themes[0].title]:[]
    const defaultColors=colors[0]?.name?[colors[0].name]:[]
    setForm({...initialForm,themes:defaultThemes,colors:defaultColors,theme:defaultThemes.join(TAXONOMY_SEPARATOR),color:defaultColors.join(TAXONOMY_SEPARATOR)})
    setFiles([]);setStep(1);setResult(null);setError('');setCopiedAction('');setShareNotice('')
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
      const selectedThemes=selectionArray(form.themes,form.theme)
      const selectedColors=selectionArray(form.colors,form.color)
      const data = await submitArtwork({
        fields: {
          ...form,
          type:isTip?'Story & Creative':form.type,
          name:clean(form.name),
          display:clean(form.display),
          displayName:clean(form.display),
          email:clean(form.email),
          phone:clean(form.phone),
          title:clean(form.title),
          externalLink:clean(form.externalLink),
          theme:selectedThemes.join(TAXONOMY_SEPARATOR),
          color:selectedColors.join(TAXONOMY_SEPARATOR),
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
      saveReceipt(data,{...form,themes:selectedThemes,colors:selectedColors,theme:selectedThemes.join(TAXONOMY_SEPARATOR),color:selectedColors.join(TAXONOMY_SEPARATOR)})
      replaceSubmissionUrl(data?.code)
      localStorage.removeItem(DRAFT_KEY)
      setStep(7)
      setResult(data)
    } catch (err) {
      const detail=Array.isArray(err.details)&&err.details.length?' ' + err.details.map(item=>item?.message).filter(Boolean).join(' · '):''
      setError((err.message || 'Có lỗi xảy ra khi gửi góc nhìn') + detail)
    } finally {setSubmitting(false)}
  }

  const selectedThemes=selectionArray(form.themes,form.theme)
  const selectedColors=selectionArray(form.colors,form.color)
  const heroImage=themes.find(t=>selectedThemes.includes(t.title))?.image||themes[0]?.image||''
  const storyLength=clean(form.story).length
  const hasPinnedLocation=hasCoordinate(form.locationLat)&&hasCoordinate(form.locationLng)

  return <main>
    <PageHero eyebrow="GỬI MỘT GÓC NHÌN VỀ HÒA LẠC" title="Bạn biết điều gì" accent="đáng được kể?" desc="Bạn có thể gửi nội dung đã có hoặc chỉ giới thiệu một người, một nơi, một ký ức hay một câu chuyện để Ban Biên tập HALO HOLA tiếp tục tìm hiểu." image={heroImage}>
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
            <h2>Bạn muốn đóng góp theo cách nào?</h2>
            <p>Không cần biến câu chuyện thành một “bài thi”. Hãy chọn cách phù hợp với những gì bạn đang có.</p>
            <div className="type-grid">
              <button type="button" onClick={()=>setContributionMode('CONTENT')} className={!isTip?'selected':''}><Camera/><b>Tôi có nội dung muốn gửi</b><small>Ảnh, video, bài viết, tranh, audio hoặc link nội dung đã có.</small></button>
              <button type="button" onClick={()=>setContributionMode('TIP')} className={isTip?'selected':''}><MapPin/><b>Tôi muốn giới thiệu một câu chuyện</b><small>Một người, một nơi, một nghề, một ký ức hoặc điều đáng để HALO HOLA tìm hiểu.</small></button>
            </div>
            <h3 className="form-subtitle">Thông tin người đóng góp</h3>
            <div className="form-grid">
              <label>Họ và tên *<input value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="Nguyễn Minh An"/></label>
              <label>Tên hiển thị<input value={form.display} onChange={e=>upd('display',e.target.value)} placeholder="Minh An"/></label>
              <label>Email *<input type="email" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="an.nguyen@gmail.com"/></label>
              <label>Số điện thoại *<input type="tel" inputMode="tel" autoComplete="tel" required value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="0987 654 321"/></label>
              <label className="full">Giới thiệu ngắn<textarea value={form.bio} onChange={e=>upd('bio',e.target.value)} placeholder="Bạn là ai và có mối liên hệ gì với câu chuyện này?"/></label>
            </div>
          </div>}

          {step===2&&<div>
            <h2>{isTip?'Đặt tên cho đầu mối câu chuyện':'Thông tin góc nhìn'}</h2>
            <p>{isTip?'Chỉ cần một tên ngắn giúp Ban Biên tập hiểu điều bạn muốn giới thiệu.':'Đặt tên cho góc nhìn và cho biết nội dung được ghi lại hoặc thực hiện khi nào.'}</p>
            <div className="form-grid">
              <label className="full">{isTip?'Tên câu chuyện / đầu mối *':'Tên góc nhìn *'}<input value={form.title} onChange={e=>upd('title',e.target.value)} placeholder={isTip?'Người thợ đá ong cuối làng':'Bình minh trên hồ Đồng Mô'}/></label>
              <label>Thời gian ghi lại / biết tới<input type="date" value={form.capturedAt} onChange={e=>upd('capturedAt',e.target.value)}/></label>
              <label>Link tham khảo (nếu có)<input value={form.externalLink} onChange={e=>upd('externalLink',e.target.value)} placeholder="https://..."/></label>
            </div>
            {!isTip&&<><h3 className="form-subtitle">Loại hình</h3><div className="type-grid">{types.map(([value,desc,I])=><button type="button" key={value} onClick={()=>upd('type',value)} className={form.type===value?'selected':''}><I/><b>{value}</b><small>{desc}</small></button>)}</div></>}
            {isTip&&<div className="vault-note"><FileText/><div><b>Đầu mối câu chuyện</b><span>Không bắt buộc phải có tác phẩm hoàn chỉnh. Ban Biên tập có thể liên hệ để tìm hiểu sâu hơn.</span></div></div>}
          </div>}

          {step===3&&<div>
            <h2>{isTip?'Tư liệu tham khảo (nếu có)':'Tải tư liệu gốc'}</h2>
            <p>{isTip?'Bạn có thể bỏ qua bước này nếu hiện chỉ có thông tin đầu mối. Ảnh, video, audio, tài liệu hoặc link tham khảo đều hữu ích.':'File original được lưu riêng, không resize và không nén lại để bảo toàn đóng góp ban đầu.'}</p>
            <div className="vault-note"><ShieldCheck/><div><b>Original Vault</b><span>{isTip?'Tư liệu là tùy chọn · nếu gửi file, hệ thống vẫn giữ nguyên byte và checksum SHA-256':'Giữ nguyên byte file gốc · checksum SHA-256 · tối đa 10 file'}</span></div></div>
            <div className="upload-box" onClick={()=>inputRef.current?.click()}>
              <Upload size={34}/><b>Kéo thả tệp vào đây hoặc</b>
              <button type="button" className="btn btn-terra">Chọn tệp từ thiết bị</button>
              <small>JPG, PNG, WEBP, MP4, MOV, PDF, DOC/DOCX, MP3 · tối đa theo cấu hình server.</small>
              <input ref={inputRef} hidden multiple type="file" accept="image/*,video/*,.pdf,.doc,.docx,.mp3" onChange={e=>{setError('');setFiles(Array.from(e.target.files || []).slice(0,10))}}/>
            </div>
            <div className="upload-thumbs">{files.length?files.map((file,i)=><div className="file-chip" key={file.name + '-' + i}><ImageIcon/><span title={file.name}>{file.name}<small>{(file.size/1024/1024).toFixed(2)} MB</small></span><button type="button" onClick={(e)=>{e.stopPropagation();setError('');setFiles(v=>v.filter((_,idx)=>idx!==i))}}>×</button></div>):<button type="button" onClick={()=>inputRef.current?.click()}><ImageIcon/> {isTip?'Chưa có tư liệu · có thể bỏ qua':'Chưa có tệp · Thêm tệp'}</button>}</div>
          </div>}

          {step===4&&<div>
            <h2>7 chủ đề & sắc màu</h2>
            <p>Chọn một hoặc nhiều <b>chủ đề</b> mà câu chuyện có thể thuộc về. Sắc màu là lớp nhận diện bổ sung, không phải chủ đề số 8.</p>
            <h3 className="form-subtitle">7 chủ đề · đã chọn {selectedThemes.length}</h3>
            {themes.length?<div className="theme-select-grid">{themes.map(t=>{
              const selected=selectedThemes.includes(t.title)
              return <button type="button" key={t.id} onClick={()=>toggleTaxonomy('themes','theme',t.title)} className={selected?'selected':''}>{t.image?<img src={t.image} alt={t.title}/>:<span className="theme-card-placeholder"/>}<span>{t.title}</span>{selected&&<i><Check size={14}/></i>}</button>
            })}</div>:<div className="jw-empty">Đang tải 7 chủ đề từ hệ thống...</div>}
            <h3 className="form-subtitle">Sắc màu Hòa Lạc · đã chọn {selectedColors.length}</h3>
            {colors.length?<div className="color-select-grid">{colors.map(c=>{
              const selected=selectedColors.includes(c.name)
              return <button type="button" key={c.id||c.slug} onClick={()=>toggleTaxonomy('colors','color',c.name)} className={selected?'selected':''}><span style={{background:c.color}}/>{selected&&<i><Check size={14}/></i>}<b>{c.name}</b><small>{c.story}</small></button>
            })}</div>:<div className="jw-empty">Đang tải sắc màu từ hệ thống...</div>}
          </div>}

          {step===5&&<div>
            <h2>Địa điểm & câu chuyện</h2>
            <p>{isTip?'Cho biết câu chuyện nằm ở đâu và vì sao bạn nghĩ HALO HOLA nên tìm hiểu. Không cần viết hoàn chỉnh — hãy cung cấp đầu mối rõ nhất bạn có.':'Chọn đúng nơi góc nhìn được ghi lại và kể điều khiến nó đáng được lưu giữ.'}</p>
            <HolaLocationPicker
              value={{location:form.location,locationPlaceId:form.locationPlaceId,locationPlaceSlug:form.locationPlaceSlug,locationLat:form.locationLat,locationLng:form.locationLng,locationAddress:form.locationAddress,locationSource:form.locationSource}}
              onChange={updateLocation}
            />
            <div className="form-grid location-story-grid">
              <label className="full">{isTip?'Bạn biết gì về câu chuyện này? *':'Câu chuyện phía sau góc nhìn *'}<textarea rows="7" value={form.story} onChange={e=>upd('story',e.target.value)} placeholder={isTip?'Ai là nhân vật? Câu chuyện nằm ở đâu? Điều gì đang biến mất, đang hình thành hoặc đáng được giữ lại?':'Điều gì khiến khoảnh khắc, nơi chốn hoặc câu chuyện này đáng được lưu lại?'}/><small>{storyLength} ký tự · cần tối thiểu 20 ký tự để gửi</small></label>
            </div>
          </div>}

          {step===6&&<div>
            <h2>Nguồn, quyền sử dụng & đồng thuận</h2><p>HALO HOLA ưu tiên minh bạch nguồn, nhân vật và quyền nội dung. Ban Biên tập có thể liên hệ lại để xác minh hoặc xin thêm phạm vi sử dụng khi cần.</p>
            <div className="confirm-list">
              <label><input type="checkbox" checked={form.rightsConfirmed} onChange={e=>upd('rightsConfirmed',e.target.checked)}/> <b>Tôi xác nhận mình có quyền cung cấp nội dung/thông tin này cho HALO HOLA. *</b></label>
              <label><input type="checkbox" checked={form.imageConsentConfirmed} onChange={e=>upd('imageConsentConfirmed',e.target.checked)}/> Tôi xác nhận thông tin về người xuất hiện hoặc nhân vật được cung cấp phù hợp; nếu có ảnh/video nhận diện được người, tôi đã có sự đồng ý cần thiết. *</label>
              <label><input type="checkbox" checked={form.allowMediaUse} onChange={e=>upd('allowMediaUse',e.target.checked)}/> Tôi đồng ý để HALO HOLA sử dụng nội dung đã gửi cho mục đích biên tập, truyền thông, triển lãm và lưu trữ theo chương trình. *</label>
              <label><input type="checkbox" checked={form.allowNewsletter} onChange={e=>upd('allowNewsletter',e.target.checked)}/> Tôi đồng ý nhận tin về HALO HOLA và các hoạt động cộng đồng. <small>(không bắt buộc)</small></label>
              <label><input type="checkbox" checked={form.isMinor} onChange={e=>upd('isMinor',e.target.checked)}/> Tôi chưa đủ 18 tuổi.</label>
            </div>
            {form.isMinor&&<div className="guardian-box">
              <label>Họ tên người giám hộ<input value={form.guardianName} onChange={e=>upd('guardianName',e.target.value)} placeholder="Họ và tên"/></label>
              <label className="check-row"><input type="checkbox" checked={form.guardianConsent} onChange={e=>upd('guardianConsent',e.target.checked)}/> Người giám hộ đồng ý cho tôi gửi góc nhìn và tham gia chương trình.</label>
            </div>}
          </div>}

          {step===7&&<div>
            <h2>{result?'HALO HOLA đã nhận góc nhìn':'Kiểm tra lần cuối'}</h2>
            {result?<div className="success-stack">
              <div className="submit-success-receipt">
                <div className="submit-success-icon"><Check/></div>
                <span className="submit-success-kicker">ĐÃ NHẬN GÓC NHÌN</span>
                <h3>Hãy lưu mã để theo dõi hành trình biên tập</h3>
                <p>{isTip?'Ban Biên tập đã nhận đầu mối của bạn và có thể liên hệ để tìm hiểu sâu hơn.':'HALO HOLA đã nhận nội dung và tư liệu của bạn.'} Mã dưới đây giúp theo dõi quá trình xác minh, biên tập, công bố và HOLA Maps.</p>

                <div className="submit-success-code">
                  <small>Mã góc nhìn</small><strong>{result.code}</strong>
                  <button type="button" onClick={()=>copyValue(result.code,'code')}><Copy size={17}/>{copiedAction==='code'?'Đã sao chép':'Sao chép mã'}</button>
                </div>

                <div className="submit-success-link">
                  <div><small>Liên kết theo dõi</small><code>{lookupLink}</code></div>
                  <button type="button" onClick={()=>copyValue(lookupLink,'link')}><Copy size={17}/>{copiedAction==='link'?'Đã sao chép':'Sao chép liên kết'}</button>
                </div>

                <div className="submit-success-reminder"><b>Khi theo dõi:</b> dùng mã <strong>{result.code}</strong> và email <strong>{clean(form.email)}</strong>.</div>
              </div>

              <div className="submit-facebook-share">
                <div className="submit-facebook-share-head"><span>KỂ TIẾP GÓC NHÌN</span><h3>Chia sẻ cùng cộng đồng CHECK IN HOALAC</h3><p>Đây là bước tùy chọn. Bạn vẫn là người kiểm tra và bấm Đăng trên Facebook.</p></div>
                <div className="submit-facebook-caption">
                  <div className="submit-facebook-caption-head"><div><small>Nội dung Facebook đã chuẩn bị</small><b>Có thể sao chép, chỉnh lại trước khi đăng</b></div><button type="button" onClick={()=>copyValue(facebookCaption,'facebook-caption')}><Copy size={17}/>{copiedAction==='facebook-caption'?'Đã sao chép':'Sao chép'}</button></div>
                  <pre>{facebookCaption}</pre>
                </div>
                <div className="submit-facebook-actions">
                  <button type="button" className="btn submit-facebook-primary" onClick={shareOnFacebook}><Share2 size={18}/> Chia sẻ lên Facebook</button>
                  <button type="button" className="btn btn-outline" onClick={openCheckinGroup}><ExternalLink size={18}/> {checkinGroupUrl?'Mở CHECK IN HOALAC':'Tìm CHECK IN HOALAC'}</button>
                </div>
                {shareNotice&&<div className="submit-facebook-notice">{shareNotice}</div>}
              </div>

              <div className="success-actions">
                <Link to={lookupPath} className="btn btn-green">Theo dõi góc nhìn</Link>
                <button className="btn btn-outline" onClick={resetDraft}>Gửi góc nhìn khác</button>
              </div>
              {result.media?.length>0&&<div className="vault-result"><b>Original Vault</b>{result.media.map(m=><div key={m.id}><span>{m.originalName}</span><small>{m.provider} · SHA256 {m.sha256?.slice(0,12)}…</small></div>)}</div>}
            </div>:<>
              <div className="review-grid">
                <div><small>Cách đóng góp</small><b>{isTip?'Giới thiệu đầu mối câu chuyện':'Gửi nội dung đã có'}</b></div>
                <div><small>Góc nhìn</small><b>{clean(form.title)||'Chưa nhập'}</b></div>
                <div><small>Người đóng góp</small><b>{clean(form.name)||'Chưa nhập'}</b></div>
                <div><small>Email</small><b>{clean(form.email)||'Chưa nhập'}</b></div>
                <div><small>Chủ đề</small><b>{selectedThemes.length?selectedThemes.join(' · '):'Chưa chọn'}</b></div>
                <div><small>Sắc màu</small><b>{selectedColors.length?selectedColors.join(' · '):'Chưa chọn'}</b></div>
                <div><small>Tư liệu / link</small><b>{files.length?`${files.length} file`:clean(form.externalLink)?'Đã có link':isTip?'Không bắt buộc':'Chưa có'}</b></div>
                <div><small>Địa điểm</small><b>{clean(form.location)||'Chưa nhập'}</b></div>
                <div><small>HOLA Map</small><b>{clean(form.locationPlaceId)?'Đã liên kết địa điểm':hasPinnedLocation?'Đã ghim tọa độ':'Nhập thủ công'}</b></div>
                <div><small>Câu chuyện / đầu mối</small><b>{storyLength>=20?`Đã nhập · ${storyLength} ký tự`:'Chưa đủ nội dung'}</b></div>
                <div><small>Nguồn & quyền</small><b>{form.rightsConfirmed&&form.imageConsentConfirmed&&form.allowMediaUse?'Đã xác nhận':'Chưa đủ xác nhận'}</b></div>
              </div>
              {error&&<div className="form-error">{error}</div>}
            </>}
          </div>}

          {error&&step<7&&<div className="form-error">{error}</div>}

          {!result&&<div className="wizard-actions">
            <button className="btn btn-outline" onClick={prev} disabled={step===1}><ArrowLeft size={16}/> Quay lại</button>
            {step<7?<button className="btn btn-terra" onClick={next}>Tiếp tục <ArrowRight size={16}/></button>:<button className="btn btn-terra" disabled={submitting} onClick={submit}>{submitting?<><Loader2 className="spin" size={16}/> Đang gửi...</>:<>Gửi góc nhìn <ArrowRight size={16}/></>}</button>}
          </div>}
        </div>

        <aside className="submission-preview">
          <span className="eyebrow">{isTip?'ĐẦU MỐI CÂU CHUYỆN':'XEM TRƯỚC GÓC NHÌN'}</span>
          <div className="preview-card">{previewUrl?<img src={previewUrl} alt="Xem trước góc nhìn"/>:<div className="theme-card-placeholder"/>}<div className="preview-body"><div className="preview-tags"><span>{isTip?'Story Lead':form.type}</span>{selectedThemes.map(theme=><span key={theme}>{theme}</span>)}</div><h3>{form.title||'Tên góc nhìn của bạn'}</h3><p>{form.display||form.name||'Người kể'}</p><p>{form.story||'Câu chuyện hoặc đầu mối sẽ xuất hiện tại đây...'}</p><div className="preview-tags"><span>{form.location||'Chưa nhập địa điểm'}</span>{selectedColors.map(color=><span key={color}>{color}</span>)}</div></div></div>
          <div className="submission-code"><small>{result?'Mã góc nhìn':'Mã sẽ tạo sau khi gửi'}</small><strong>{code}</strong>{result&&<button onClick={()=>copyValue(code,'sidebar-code')}><Copy size={16}/>{copiedAction==='sidebar-code'&&<span>Đã sao chép</span>}</button>}</div>
          <blockquote>“Bạn biết một người, một nơi hay một câu chuyện về Hòa Lạc đáng được kể? Hãy kể cho HALO HOLA.”</blockquote>
          <Link className="text-link" to={result?lookupPath:'/tra-cuu'}>{result?'Theo dõi góc nhìn này →':'Đã gửi trước đó? Theo dõi góc nhìn →'}</Link>
        </aside>
      </div>
    </section>
  </main>
}
